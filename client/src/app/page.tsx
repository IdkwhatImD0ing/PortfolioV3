"use client";

import EducationPage from "@/components/education";
import PersonalPage from "@/components/personal";
import ProjectPage from "@/components/project";
import LandingPage from "@/components/LandingPage";
import { useEffect, useState, useCallback, useRef } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { VoiceChatSidebar } from "@/components/app-sidebar";
import { toast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const [activePage, setActivePage] = useState<"landing" | "education" | "project" | "personal">("landing");
  const [fullTranscript, setFullTranscript] = useState<TranscriptEntry[]>([]);
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const transcriptLock = useRef(false);
  const transcriptQueue = useRef<TranscriptEntry[][]>([]);

  // Mobile detection and redirect
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                      (window.innerWidth <= 768);
      
      if (isMobile) {
        window.location.href = 'https://v2.art3m1s.me';
      }
    };

    checkMobile();
  }, []);

  // Improved transcript merging with race condition prevention
  const processTranscriptUpdate = useCallback((newTranscript: TranscriptEntry[]) => {
    if (transcriptLock.current) {
      // Queue the update if we're already processing
      transcriptQueue.current.push(newTranscript);
      return;
    }

    transcriptLock.current = true;

    setFullTranscript((prevTranscript) => {
      try {
        // If we have no previous transcript, just use the new entries
        if (prevTranscript.length === 0) {
          return newTranscript;
        }

        // Use a more robust merging strategy
        const numOldToKeep = Math.max(0, prevTranscript.length - newTranscript.length);
        const keptOldMessages = prevTranscript.slice(0, numOldToKeep);
        
        // Create merged transcript with new messages
        const mergedTranscript = [...keptOldMessages, ...newTranscript];
        
        // Deduplicate based on content to prevent duplicates from race conditions
        const seen = new Set<string>();
        const deduped = mergedTranscript.filter(entry => {
          const key = `${entry.role}-${entry.content}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        
        return deduped;
      } finally {
        transcriptLock.current = false;
        
        // Process any queued updates
        if (transcriptQueue.current.length > 0) {
          const nextUpdate = transcriptQueue.current.shift();
          if (nextUpdate) {
            setTimeout(() => processTranscriptUpdate(nextUpdate), 0);
          }
        }
      }
    });
  }, []);

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
      if (update.transcript && update.transcript.length > 0) {
        processTranscriptUpdate(update.transcript);
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
      // Don't clear transcript here - only clear when starting a new conversation
    });

    retellWebClient.on("error", (error) => {
      console.error("An error occurred:", error);
      toast({
        title: "Call Error",
        description: "An error occurred during the call. Please try again.",
        variant: "destructive",
      });
      retellWebClient.stopCall();
      setIsCalling(false);
      setIsAgentTalking(false);
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
  }, [processTranscriptUpdate]);



  const startCall = useCallback(async () => {
    try {
      // Clear transcript and reset queue when starting new conversation
      setFullTranscript([]);
      transcriptQueue.current = [];
      transcriptLock.current = false;

      // Get agent ID with proper fallback
      const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID;
      if (!agentId) {
        throw new Error("Retell Agent ID is not configured. Please check your environment variables.");
      }

      const response = await fetch("/api/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          metadata: {
            session_started: new Date().toISOString(),
            platform: "web",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText || 'Failed to create call'}`);
      }

      const registerCallResponse: RegisterCallResponse = await response.json();

      if (registerCallResponse.access_token) {
        await retellWebClient.startCall({
          accessToken: registerCallResponse.access_token,
        });
        
        toast({
          title: "Call Started",
          description: "Connected successfully. You can start speaking now.",
        });
      } else {
        throw new Error("No access token received from server");
      }

    } catch (err) {
      console.error("Error starting call:", err);
      
      // Provide user-friendly error messages
      let errorMessage = "Failed to start the call. Please try again.";
      
      if (err instanceof Error) {
        if (err.message.includes("Agent ID")) {
          errorMessage = "Configuration error. Please contact support.";
        } else if (err.message.includes("Server error")) {
          errorMessage = "Server is temporarily unavailable. Please try again later.";
        } else if (err.message.includes("access token")) {
          errorMessage = "Authentication failed. Please refresh the page and try again.";
        }
      }
      
      toast({
        title: "Failed to Start Call",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset state on error
      setIsCalling(false);
      setIsAgentTalking(false);
    }
  }, [])

  const endCall = useCallback(() => {
    retellWebClient.stopCall();
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        <ErrorBoundary fallback={
          <div className="w-80 p-4 bg-gray-100 text-center">
            <p className="text-red-600">Sidebar error. Please refresh.</p>
          </div>
        }>
          <VoiceChatSidebar
            isCalling={isCalling}
            startCall={startCall}
            endCall={endCall}
            transcript={fullTranscript}
            isAgentTalking={isAgentTalking}
          />
        </ErrorBoundary>
        <div className="flex flex-1 min-h-screen items-center justify-center">
          <ErrorBoundary fallback={
            <div className="text-center p-8">
              <h2 className="text-xl font-bold text-red-600 mb-2">Page Error</h2>
              <p className="text-gray-600">This section failed to load.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          }>
            {activePage === "landing" && <LandingPage />}
            {activePage === "personal" && <PersonalPage />}
            {activePage === "education" && <EducationPage />}
            {activePage === "project" && <ProjectPage projectId={currentProjectId} />}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}