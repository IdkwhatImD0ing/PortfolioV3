"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { User, MessageCircle, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import MobileControlBar from "@/components/MobileControlBar"
import EducationPage from "@/components/education"
import PersonalPage from "@/components/personal"
import ProjectPage from "@/components/project"
import ResumePage from "@/components/resume"
import LandingPage from "@/components/LandingPage"
import FallbackLink from "@/components/fallback-link"
import ErrorBoundary from "@/components/ErrorBoundary"
import { toast } from "@/hooks/use-toast"

interface TranscriptEntry {
  role: "agent" | "user"
  content: string
}

interface MobileLayoutProps {
  activePage: "landing" | "education" | "project" | "personal" | "resume"
  setActivePage: (page: "landing" | "education" | "project" | "personal" | "resume") => void
  currentProjectId?: string
  isCalling: boolean
  startCall: () => void
  endCall: () => void
  isAgentTalking: boolean
  transcript: TranscriptEntry[]
  chatMode: "voice" | "text"
  setChatMode: (mode: "voice" | "text") => void
  sendTextMessage: (content: string) => void
  isTextLoading: boolean
}

const PAGE_LABELS: Record<string, string> = {
  landing: "Home",
  personal: "About",
  education: "Education",
  project: "Projects",
  resume: "Resume",
}

function MobileLayoutComponent({
  activePage,
  setActivePage,
  currentProjectId,
  isCalling,
  startCall,
  endCall,
  isAgentTalking,
  transcript,
  chatMode,
  setChatMode,
  sendTextMessage,
  isTextLoading,
}: MobileLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const prevPageRef = useRef(activePage)

  // Auto-expand drawer for text mode, collapse for voice mode
  useEffect(() => {
    setIsExpanded(chatMode === "text")
  }, [chatMode])

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  // Collapse drawer and show toast on page navigation
  useEffect(() => {
    if (prevPageRef.current !== activePage) {
      setIsExpanded(false)
      toast({
        title: `Navigated to ${PAGE_LABELS[activePage]}`,
        duration: 2000,
      })
      prevPageRef.current = activePage
    }
  }, [activePage])

  const toggleDrawer = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background relative">
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage("landing")}
            className="relative"
            aria-label="Go to home page"
          >
            <Image
              src="/profile.webp"
              alt="Bill Zhang"
              width={32}
              height={32}
              className="rounded-full border border-primary/30"
            />
            {isAgentTalking && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Bill Zhang</h1>
            <p className="text-xs text-muted-foreground">{PAGE_LABELS[activePage]}</p>
          </div>
        </div>
        <button
          onClick={toggleDrawer}
          className="relative p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Toggle chat"
        >
          <MessageCircle size={20} className="text-primary" />
          {transcript.length > 0 && (
            <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary rounded-full flex items-center justify-center px-1">
              <span className="text-[10px] text-primary-foreground font-bold">
                {transcript.length > 99 ? "99+" : transcript.length}
              </span>
            </div>
          )}
        </button>
      </header>

      {/* Page Content with Transitions */}
      <main className="flex-1 overflow-y-auto pb-[160px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
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
              {activePage === "landing" && (
                <div className="relative">
                  <LandingPage onNavigate={(page) => setActivePage(page as typeof activePage)} isMobile />
                  <FallbackLink href="https://v2.art3m1s.me" />
                </div>
              )}
              {activePage === "personal" && <PersonalPage />}
              {activePage === "education" && <EducationPage />}
              {activePage === "project" && <ProjectPage projectId={currentProjectId} />}
              {activePage === "resume" && <ResumePage />}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden bg-background border-t border-border rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-[height] duration-300 ease-in-out"
        style={{ height: isExpanded ? '55dvh' : '160px' }}
      >
        {/* Handle + Toggle */}
        <button
          onClick={toggleDrawer}
          className="flex flex-col items-center pt-3 pb-1 shrink-0 h-[40px]"
          aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
        >
          <div className="w-12 h-1.5 rounded-full bg-muted mb-1" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {isExpanded ? 'Tap to close' : 'Tap to open chat'}
          </span>
        </button>

        {/* Transcript - always in DOM, visibility toggled via CSS */}
        <div
          ref={scrollRef}
          className={`overflow-y-auto px-4 py-2 min-h-0 flex-1 transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
            <div className="space-y-3" aria-live="polite" aria-atomic="false">
              <AnimatePresence>
                {transcript.map((entry, index) => (
                  <motion.div
                    key={`${entry.role}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start space-x-2 ${entry.role === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    {entry.role === "agent" && (
                      <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden border border-primary/20">
                        <Image src="/profile.webp" alt="Bill" width={28} height={28} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`p-2.5 rounded-lg max-w-[80%] text-sm ${
                        entry.role === "agent"
                          ? "bg-card text-card-foreground border border-border prose-chat"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {entry.role === "agent" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>
                      ) : (
                        entry.content
                      )}
                    </div>
                    {entry.role === "user" && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center" aria-label="You" role="img">
                        <User size={14} className="text-secondary-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {chatMode === "text" && isTextLoading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-2 justify-start">
                  <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden border border-primary/20">
                    <Image src="/profile.webp" alt="Bill" width={28} height={28} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <div className="flex gap-1" role="status" aria-label="AI is typing">
                      <motion.span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {transcript.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No messages yet.</p>
                  <p className="text-xs mt-1">Start a conversation to see the transcript here.</p>
                </div>
              )}
            </div>
          </div>

        {/* Controls */}
        <MobileControlBar
          isCalling={isCalling}
          startCall={startCall}
          endCall={endCall}
          isAgentTalking={isAgentTalking}
          chatMode={chatMode}
          setChatMode={setChatMode}
          sendTextMessage={sendTextMessage}
          isTextLoading={isTextLoading}
        />
      </div>
    </div>
  )
}

export default memo(MobileLayoutComponent)
