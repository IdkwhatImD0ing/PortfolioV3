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

interface NavigationMeta {
  type: string;
  page?: "education" | "project" | "personal";
  project_id?: string;
}

export default function Home() {
  const [isCalling, setIsCalling] = useState(false);
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
              // TODO: Navigate to specific project
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
      />
      <div className="flex flex-1 min-h-screen items-center justify-center">
        {activePage === "personal" && <PersonalPage />}
        {activePage === "education" && <EducationPage />}
        {activePage === "project" && <ProjectPage />}
      </div>
    </div>
  );
}