"use client";

import EducationPage from "@/components/education";
import PersonalPage from "@/components/personal";
import ProjectPage from "@/components/project";
import { useEffect, useState, useRef } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { VoiceChatSidebar } from "@/components/app-sidebar";
import Pusher from "pusher-js";

interface RegisterCallResponse {
  access_token: string;
  call_id: string;
}


interface UserEventData {
  page: "education" | "project" | "personal";
  project_id?: string;
}

const retellWebClient = new RetellWebClient();

export default function Home() {
  const [isCalling, setIsCalling] = useState(false);
  const [fullTranscript, setFullTranscript] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const callId = useRef("");
  const [uuid, setUuid] = useState<string>("");
  const pusherRef = useRef<Pusher | null>(null);

  // Generate and persist UUID on component mount
  useEffect(() => {
    // Check if UUID exists in localStorage
    const storedUuid = localStorage.getItem("visitorUuid");
    const currentUuid = storedUuid || crypto.randomUUID();

    if (!storedUuid) {
      // Generate a new UUID if none exists
      localStorage.setItem("visitorUuid", currentUuid);
    }

    setUuid(currentUuid);

    // Initialize Pusher
    Pusher.logToConsole = process.env.NODE_ENV === "development";

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
      cluster: "us3"
    });

    // Subscribe to channel with UUID
    const channel = pusher.subscribe(`user-channel-${currentUuid}`);
    channel.bind("user-event", (data: UserEventData) => {
      console.log("Received pusher event:", data);
      // Handle the event data here
    });

    pusherRef.current = pusher;

    // Cleanup function
    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(`user-channel-${currentUuid}`);
      }
    };
  }, []);

  // Initialize the SDK, set up event listeners, and start the call
  useEffect(() => {
    retellWebClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    retellWebClient.on("agent_start_talking", () => {
      console.log("Agent started talking");
    });

    retellWebClient.on("agent_stop_talking", () => {
      console.log("Agent stopped talking");
    });

    retellWebClient.on("update", (update) => {
      setFullTranscript((prevTranscript: any) => {
        if (update.transcript.length === 0) {
          return prevTranscript;
        }

        const newMessage = update.transcript[update.transcript.length - 1];
        const updatedTranscript = [...prevTranscript];

        if (updatedTranscript.length > 0) {
          const lastMessage = updatedTranscript[updatedTranscript.length - 1];

          if (lastMessage.role === newMessage.role) {
            updatedTranscript[updatedTranscript.length - 1] = newMessage;
          } else {
            updatedTranscript.push(newMessage);
          }
        } else {
          updatedTranscript.push(newMessage);
        }

        return updatedTranscript;
      });
    });

    retellWebClient.on("metadata", (metadata) => {
      // Handle metadata if needed
    });

    retellWebClient.on("call_ended", async (e) => {
      console.log("Call has ended. Logging call id: ");
      setIsCalling(false);
    });

    retellWebClient.on("error", (error) => {
      console.error("An error occurred:", error);
      retellWebClient.stopCall();
      setIsLoading(false);
    });



    // Cleanup on unmount
    return () => {
      retellWebClient.off("call_started");
      retellWebClient.off("call_ended");
      retellWebClient.off("agent_start_talking");
      retellWebClient.off("agent_stop_talking");
      retellWebClient.off("audio");
      retellWebClient.off("update");
      retellWebClient.off("metadata");
      retellWebClient.off("error");
    };
  }, []);



  async function startCall() {
    try {
      const response = await fetch("/api/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_c5ae64152c9091e17243c9bdfc", // Default test agent
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const registerCallResponse: RegisterCallResponse = await response.json();

      callId.current = registerCallResponse.call_id;
      console.log("---- FOUND CALL ID ------");

      if (registerCallResponse.access_token) {
        await retellWebClient.startCall({
          accessToken: registerCallResponse.access_token,
        });
        setIsLoading(false); // Call has started, loading is done
      }


    } catch (err) {
      console.error("Error starting call:", err);
    }
  }

  return (
    <div className="flex h-screen">
      <VoiceChatSidebar />
      <div className="flex flex-1 min-h-screen items-center justify-center">

        {/* <button
        onClick={startCall}
        disabled={isCalling}
        className="rounded-full bg-blue-500 px-8 py-4 text-white hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isCalling ? "Call in Progress..." : "Start Call"}
      </button> */}
        <PersonalPage />
      </div>
    </div>
  );
}

