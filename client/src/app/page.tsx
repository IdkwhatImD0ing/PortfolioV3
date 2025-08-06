"use client";

import EducationPage from "@/components/education";
import PersonalPage from "@/components/personal";
import ProjectPage from "@/components/project";
import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { VoiceChatSidebar } from "@/components/app-sidebar";

interface RegisterCallResponse {
  access_token: string;
  call_id: string;
}

const retellWebClient = new RetellWebClient();

export default function Home() {
  const [isCalling, setIsCalling] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<"education" | "project" | "personal">("personal");

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


    retellWebClient.on("metadata", () => {
      // Handle metadata if needed
    });

    retellWebClient.on("call_ended", async () => {
      console.log("Call has ended. Logging call id: ");
      setIsCalling(false);
      setCurrentCallId(null);
    });

    retellWebClient.on("error", (error) => {
      console.error("An error occurred:", error);
      retellWebClient.stopCall();
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
      // Generate a unique user ID for this session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch("/api/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_c5ae64152c9091e17243c9bdfc", // Default test agent
          metadata: {
            user_id: userId,
            session_started: new Date().toISOString(),
            platform: "web",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const registerCallResponse: RegisterCallResponse = await response.json();

      console.log("---- FOUND CALL ID ------");
      setCurrentCallId(registerCallResponse.call_id);

      if (registerCallResponse.access_token) {
        await retellWebClient.startCall({
          accessToken: registerCallResponse.access_token,
        });
      }


    } catch (err) {
      console.error("Error starting call:", err);
    }
  }

  return (
    <div className="flex h-screen">
      <VoiceChatSidebar />
      <div className="flex flex-1 min-h-screen items-center justify-center">

        <button
          onClick={startCall}
          disabled={isCalling}
          className="rounded-full bg-blue-500 px-8 py-4 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isCalling ? "Call in Progress..." : "Start Call"}
        </button>
        {activePage === "personal" && <PersonalPage />}
        {activePage === "education" && <EducationPage />}
        {activePage === "project" && <ProjectPage />}
      </div>
    </div>
  );
}