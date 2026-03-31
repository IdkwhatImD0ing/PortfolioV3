"use client";

import EducationPage from "@/components/education";
import PersonalPage from "@/components/personal";
import ProjectPage from "@/components/project";
import ResumePage from "@/components/resume";
import HackathonsPage from "@/components/hackathons";
import ArchitecturePage from "@/components/architecture";
import LandingPage from "@/components/LandingPage";
import FallbackLink from "@/components/fallback-link";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { RetellWebClient as RetellWebClientType } from "retell-client-js-sdk";
import { VoiceChatSidebar } from "@/components/app-sidebar";
import MobileLayout from "@/components/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { StatusStep } from "@/components/chat-status-indicator";

interface RegisterCallResponse {
  access_token: string;
  call_id: string;
}

interface NavigationMeta {
  type: string;
  page?: "landing" | "education" | "project" | "personal" | "resume" | "hackathon" | "architecture";
  project_id?: string;
}

interface TranscriptEntry {
  role: "agent" | "user";
  content: string;
}

function HomeContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read initial state from URL
  const initialPage = (searchParams.get('page') as "landing" | "education" | "project" | "personal" | "resume" | "hackathon" | "architecture") || "landing";
  const initialProjectId = searchParams.get('projectId') || undefined;

  const [isCalling, setIsCalling] = useState(false);
  const [activePage, setActivePage] = useState<"landing" | "education" | "project" | "personal" | "resume" | "hackathon" | "architecture">(initialPage);
  const [fullTranscript, setFullTranscript] = useState<TranscriptEntry[]>([]);
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(initialProjectId);
  const [chatMode, setChatMode] = useState<"voice" | "text">("voice");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([]);
  const transcriptLock = useRef(false);
  const transcriptQueue = useRef<TranscriptEntry[][]>([]);
  
  // Lazy-loaded Retell client (Rule 2.4: Dynamic Imports for Heavy Components)
  const retellClientRef = useRef<RetellWebClientType | null>(null);
  const listenersSetupRef = useRef(false);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (activePage !== 'landing') params.set('page', activePage);
    if (currentProjectId) params.set('projectId', currentProjectId);
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [activePage, currentProjectId, router]);

  // Update page title based on current page (Web Interface Guideline: Accurate page titles)
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      landing: "Bill Zhang | AI Engineer Portfolio",
      personal: "About Me | Bill Zhang",
      education: "Education | Bill Zhang",
      project: "Projects | Bill Zhang",
      resume: "Resume | Bill Zhang",
      hackathon: "Hackathons | Bill Zhang",
      architecture: "How It Works | Bill Zhang",
    };
    document.title = pageTitles[activePage] || "Bill Zhang | AI Engineer Portfolio";
  }, [activePage]);

  const isMobile = useIsMobile();

  // Ping FastAPI server on page load
  useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ping`, {
          method: 'GET',
          mode: 'cors',
        });
      } catch (error) {
        console.log('Server ping failed:', error);
      }
    };

    pingServer();
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

  // Set up event listeners on the Retell client
  const setupRetellListeners = useCallback((client: RetellWebClientType) => {
    if (listenersSetupRef.current) return;
    
    client.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    client.on("agent_start_talking", () => {
      console.log("Agent started talking");
      setIsAgentTalking(true);
    });

    client.on("agent_stop_talking", () => {
      console.log("Agent stopped talking");
      setIsAgentTalking(false);
    });

    // Update message such as transcript
    // You can get transcript with update.transcript
    // Please note that transcript only contains last 5 sentences to avoid the payload being too large
    client.on("update", (update: { transcript?: TranscriptEntry[] }) => {
      if (update.transcript && update.transcript.length > 0) {
        processTranscriptUpdate(update.transcript);
      }
    });

    client.on("metadata", (metadata: { metadata?: NavigationMeta }) => {
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
          case "resume":
            setActivePage("resume");
            break;
          case "hackathon":
            setActivePage("hackathon");
            break;
          case "architecture":
            setActivePage("architecture");
            break;
          default:
            console.log(`Unknown page: ${page}`);
        }
      }
    });

    client.on("call_ended", async () => {
      console.log("Call has ended. Logging call id: ");
      setIsCalling(false);
      setIsAgentTalking(false);
      // Don't clear transcript here - only clear when starting a new conversation
    });

    client.on("error", (error) => {
      console.error("An error occurred:", error);
      toast({
        title: "Call Error",
        description: "An error occurred during the call. Please try again.",
        variant: "destructive",
      });
      client.stopCall();
      setIsCalling(false);
      setIsAgentTalking(false);
    });

    listenersSetupRef.current = true;
  }, [processTranscriptUpdate]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.off("call_started");
        retellClientRef.current.off("call_ended");
        retellClientRef.current.off("agent_start_talking");
        retellClientRef.current.off("agent_stop_talking");
        retellClientRef.current.off("audio");
        retellClientRef.current.off("update");
        retellClientRef.current.off("metadata");
        retellClientRef.current.off("error");
      }
    };
  }, []);



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

      // Dynamically import and instantiate the SDK only when needed (Rule 2.4)
      if (!retellClientRef.current) {
        const { RetellWebClient } = await import("retell-client-js-sdk");
        retellClientRef.current = new RetellWebClient();
        setupRetellListeners(retellClientRef.current);
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
        await retellClientRef.current.startCall({
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
  }, [setupRetellListeners])

  const endCall = useCallback(() => {
    retellClientRef.current?.stopCall();
  }, []);

  // Handle navigation metadata from text chat responses
  const handleNavigationMetadata = useCallback((metadata: NavigationMeta) => {
    if (metadata.type === "navigation" && metadata.page) {
      console.log(`Text chat navigation to: ${metadata.page}`);
      setActivePage(metadata.page as typeof activePage);
      if (metadata.project_id) {
        setCurrentProjectId(metadata.project_id);
      }
    }
  }, []);

  // Send a text message and handle streaming response
  const sendTextMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTextLoading) return;

    setIsTextLoading(true);
    setStatusSteps([]);

    const userMessage: TranscriptEntry = { role: "user", content };
    const transcriptWithUser = [...fullTranscript, userMessage];
    setFullTranscript(transcriptWithUser);

    const messages = transcriptWithUser.map(entry => ({
      role: entry.role === "agent" ? "assistant" : entry.role,
      content: entry.content,
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let agentContent = "";
      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split("\n\n");
        sseBuffer = events.pop() || "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "status" && data.content) {
              setStatusSteps(prev => [
                ...prev.map(s => ({ ...s, completed: true })),
                { text: data.content, completed: false },
              ]);
            } else if (data.type === "content" && data.content) {
              setStatusSteps(prev =>
                prev.length > 0 && prev.some(s => !s.completed)
                  ? prev.map(s => ({ ...s, completed: true }))
                  : prev
              );
              agentContent += data.content;
              const agentMessage: TranscriptEntry = { role: "agent", content: agentContent };
              setFullTranscript([...transcriptWithUser, agentMessage]);
            } else if (data.type === "metadata" && data.metadata) {
              handleNavigationMetadata(data.metadata as NavigationMeta);
            } else if (data.type === "done") {
              setStatusSteps(prev =>
                prev.some(s => !s.completed)
                  ? prev.map(s => ({ ...s, completed: true }))
                  : prev
              );
            } else if (data.type === "error") {
              setStatusSteps([]);
              toast({
                title: "Error",
                description: data.content || "An error occurred",
                variant: "destructive",
              });
            }
          } catch {
            // Malformed JSON
          }
        }
      }
    } catch (error) {
      console.error("Error sending text message:", error);
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTextLoading(false);
    }
  }, [fullTranscript, isTextLoading, handleNavigationMetadata]);

  if (isMobile === undefined) {
    return <LoadingSkeleton />;
  }

  if (isMobile) {
    return (
      <ErrorBoundary>
        <MobileLayout
          activePage={activePage}
          setActivePage={setActivePage}
          currentProjectId={currentProjectId}
          isCalling={isCalling}
          startCall={startCall}
          endCall={endCall}
          isAgentTalking={isAgentTalking}
          transcript={fullTranscript}
          chatMode={chatMode}
          setChatMode={setChatMode}
          sendTextMessage={sendTextMessage}
          isTextLoading={isTextLoading}
          statusSteps={statusSteps}
          onNavigateToProject={(projectId) => {
            setCurrentProjectId(projectId);
            setActivePage("project");
          }}
        />
      </ErrorBoundary>
    );
  }

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
            chatMode={chatMode}
            setChatMode={setChatMode}
            sendTextMessage={sendTextMessage}
            isTextLoading={isTextLoading}
            statusSteps={statusSteps}
            activePage={activePage}
            onNavigateHome={() => setActivePage("landing")}
          />
        </ErrorBoundary>
        <main id="main-content" className={`flex flex-1 min-h-screen ${activePage === "resume" ? "items-stretch" : activePage === "architecture" ? "overflow-y-auto items-start justify-center" : "items-center justify-center"}`}>
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
            {activePage === "landing" && <div className="relative">
              <LandingPage onNavigate={(page) => setActivePage(page as typeof activePage)} />
              <FallbackLink href="https://v2.art3m1s.me" />
            </div>}
            {activePage === "personal" && <PersonalPage />}
            {activePage === "education" && <EducationPage />}
            {activePage === "project" && <ProjectPage projectId={currentProjectId} />}
            {activePage === "resume" && <ResumePage />}
            {activePage === "hackathon" && (
              <HackathonsPage
                onNavigateToProject={(projectId) => {
                  setCurrentProjectId(projectId);
                  setActivePage("project");
                }}
              />
            )}
            {activePage === "architecture" && <ArchitecturePage />}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col md:flex-row h-screen" role="status" aria-label="Loading page">
      <span className="sr-only">Loading…</span>
      {/* Mobile header skeleton */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border" aria-hidden="true">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
      {/* Sidebar skeleton - desktop only */}
      <div className="hidden md:flex w-72 bg-sidebar border-r border-border p-6 flex-col items-center" aria-hidden="true">
        <div className="w-[120px] h-[120px] rounded-full bg-muted animate-pulse" />
        <div className="mt-4 h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="mt-2 h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      {/* Main content skeleton */}
      <main className="flex flex-1 min-h-0 items-center justify-center" aria-hidden="true">
        <div className="max-w-2xl w-full p-4 space-y-4">
          <div className="h-10 w-64 mx-auto bg-muted rounded animate-pulse" />
          <div className="h-6 w-80 mx-auto bg-muted rounded animate-pulse" />
          <div className="grid gap-3 md:grid-cols-2 mt-8">
            <div className="h-32 bg-card rounded-xl animate-pulse" />
            <div className="h-32 bg-card rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomeContent() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContentInner />
    </Suspense>
  );
}
