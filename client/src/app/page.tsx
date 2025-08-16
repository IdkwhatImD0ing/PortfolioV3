"use client";

import EducationPage from "@/components/education";
import PersonalPage from "@/components/personal";
import ProjectPage from "@/components/project";
import LandingPage from "@/components/LandingPage";
import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { VoiceChatSidebar } from "@/components/app-sidebar";

interface RegisterCallResponse {
  access_token: string;
  call_id: string;
}

const retellWebClient = new RetellWebClient();

interface NavigationMeta {
  type: string;
  page?: "landing" | "education" | "project" | "personal";
  project_id?: string;
}

interface TranscriptEntry {
  role: "agent" | "user";
  content: string;
}

export default function Home() {
  const [isCalling, setIsCalling] = useState(false);
  const [activePage, setActivePage] = useState<"landing" | "education" | "project" | "personal">("project");
  const [fullTranscript, setFullTranscript] = useState<TranscriptEntry[]>([]);
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);

  // Initialize the SDK, set up event listeners, and start the call
  useEffect(() => {
    retellWebClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    retellWebClient.on("agent_start_talking", () => {
      console.log("Agent started talking");
      setIsAgentTalking(true);
    });

    retellWebClient.on("agent_stop_talking", () => {
      console.log("Agent stopped talking");
      setIsAgentTalking(false);
    });

    // Update message such as transcript
    // You can get transcript with update.transcript
    // Please note that transcript only contains last 5 sentences to avoid the payload being too large
    retellWebClient.on("update", (update: { transcript?: TranscriptEntry[] }) => {
      console.log(update);

      if (update.transcript && update.transcript.length > 0) {
        setFullTranscript(prevTranscript => {
          const newTranscript = update.transcript || [];

          // If we have no previous transcript, just use the new entries
          if (prevTranscript.length === 0) {
            return newTranscript;
          }

          // The update contains the most recent messages (up to 5)
          // We need to merge this with our existing transcript

          // Strategy: 
          // 1. Keep all old messages that are not in the new update
          // 2. Replace/update any messages that are in both
          // 3. Add any completely new messages

          // Calculate how many old messages to keep (those not covered by the update)
          const numOldToKeep = Math.max(0, prevTranscript.length - newTranscript.length);
          const keptOldMessages = prevTranscript.slice(0, numOldToKeep);

          // Now merge the new transcript
          // The new transcript might have updated versions of the last few messages
          const mergedTranscript = [...keptOldMessages];

          // Add all messages from the new transcript
          // These represent the most recent state of the last N messages
          newTranscript.forEach((newEntry, index) => {
            const correspondingOldIndex = numOldToKeep + index;

            if (correspondingOldIndex < prevTranscript.length) {
              // This position had an old message - use the new one as it might be more complete
              mergedTranscript.push(newEntry);
            } else {
              // This is a completely new message
              mergedTranscript.push(newEntry);
            }
          });

          return mergedTranscript;
        });
      }
    });


    retellWebClient.on("metadata", (metadata: { metadata?: NavigationMeta }) => {
      console.log("Metadata event received:", metadata);

      // The actual metadata content is in metadata.metadata
      const meta = metadata?.metadata;

      // Handle navigation events from backend
      if (meta?.type === "navigation") {
        const page = meta.page;

        console.log(`Navigating to page: ${page}`);

        // Update the UI based on the page
        switch (page) {
          case "landing":
            setActivePage("landing");
            break;
          case "personal":
            setActivePage("personal");
            break;
          case "education":
            setActivePage("education");
            break;
          case "project":
            setActivePage("project");
            // Handle specific project ID if provided
            if (meta.project_id) {
              console.log(`Project ID: ${meta.project_id}`);
              setCurrentProjectId(meta.project_id);
            }
            break;
          default:
            console.log(`Unknown page: ${page}`);
        }
      }
    });

    retellWebClient.on("call_ended", async () => {
      console.log("Call has ended. Logging call id: ");
      setIsCalling(false);
      setIsAgentTalking(false);
      // Clear transcript when call ends
      setFullTranscript([]);
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
      const response = await fetch("/api/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_c5ae64152c9091e17243c9bdfc", // Default test agent
          metadata: {
            session_started: new Date().toISOString(),
            platform: "web",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const registerCallResponse: RegisterCallResponse = await response.json();

      if (registerCallResponse.access_token) {
        await retellWebClient.startCall({
          accessToken: registerCallResponse.access_token,
        });
      }


    } catch (err) {
      console.error("Error starting call:", err);
    }
  }

  function endCall() {
    retellWebClient.stopCall();
  }

  return (
    <div className="flex h-screen">
      <VoiceChatSidebar
        isCalling={isCalling}
        startCall={startCall}
        endCall={endCall}
        transcript={fullTranscript}
        isAgentTalking={isAgentTalking}
      />
      <div className="flex flex-1 min-h-screen items-center justify-center">
        {activePage === "landing" && <LandingPage />}
        {activePage === "personal" && <PersonalPage />}
        {activePage === "education" && <EducationPage />}
        {activePage === "project" && <ProjectPage projectId={currentProjectId} />}
      </div>
    </div>
  );
}