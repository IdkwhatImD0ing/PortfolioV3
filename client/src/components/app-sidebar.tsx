"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Mic, Pause, Play, Square, User, AudioWaveformIcon as Waveform, MessageSquare, Send, Loader2, FileText, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"

interface TranscriptEntry {
  role: "agent" | "user"
  content: string
}

interface VoiceChatSidebarProps {
  // Voice chat props
  isCalling: boolean
  startCall: () => void
  endCall: () => void
  isAgentTalking: boolean
  
  // Shared state
  transcript: TranscriptEntry[]
  
  // Mode switching props
  chatMode: "voice" | "text"
  setChatMode: (mode: "voice" | "text") => void
  
  // Text chat props
  sendTextMessage: (content: string) => void
  isTextLoading: boolean
}

const VoiceChatSidebarComponent = ({
  isCalling,
  startCall,
  endCall,
  transcript,
  isAgentTalking,
  chatMode,
  setChatMode,
  sendTextMessage,
  isTextLoading,
}: VoiceChatSidebarProps) => {
  const [isPaused, setIsPaused] = useState(false)
  const [waveformValues, setWaveformValues] = useState<number[]>(() => Array(10).fill(2))
  const [textInput, setTextInput] = useState("")
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryContent, setSummaryContent] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Focus input when switching to text mode
  useEffect(() => {
    if (chatMode === "text" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatMode])

  // Simulate waveform animation when call is active and not paused
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCalling && !isPaused) {
      interval = setInterval(() => {
        setWaveformValues((prev) => prev.map(() => Math.floor(Math.random() * 15) + 2))
      }, 150)
    }

    return () => clearInterval(interval)
  }, [isCalling, isPaused])

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [transcript])

  const toggleCall = () => {
    if (!isCalling) {
      startCall()
      setIsPaused(false)
    } else {
      setIsPaused(!isPaused)
    }
  }

  const handleEndCall = () => {
    endCall()
    setIsPaused(false)
  }

  const handleSendMessage = () => {
    if (textInput.trim() && !isTextLoading) {
      sendTextMessage(textInput.trim())
      setTextInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleModeChange = (isTextMode: boolean) => {
    // End voice call if switching to text mode while calling
    if (isTextMode && isCalling) {
      endCall()
    }
    setChatMode(isTextMode ? "text" : "voice")
  }

  const handleGenerateSummary = async () => {
    if (transcript.length === 0) {
      setSummaryContent("Start a conversation to generate a summary.")
      return
    }

    setSummaryLoading(true)
    try {
      // Use the API URL from environment or default to relative path for proxy
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${apiUrl}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) throw new Error('Failed to generate summary')

      const data = await response.json()
      setSummaryContent(data.summary)
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummaryContent("Failed to generate summary. Please try again.")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryContent)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Generate summary when dialog opens if content is empty
  useEffect(() => {
    if (isSummaryOpen && !summaryContent && transcript.length > 0) {
      handleGenerateSummary()
    }
  }, [isSummaryOpen])

  return (
    <div className={`flex flex-col h-screen bg-sidebar border-r border-border transition-all duration-300 ${
      chatMode === "text" ? "w-96" : "w-72"
    }`}>
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <motion.div 
          className="relative"
          animate={isAgentTalking && !prefersReducedMotion ? {
            scale: [1, 1.05, 1],
          } : {
            scale: 1
          }}
          transition={{
            duration: 1.5,
            repeat: isAgentTalking ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {/* Glow effect when agent is talking */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={isAgentTalking && !prefersReducedMotion ? {
              boxShadow: [
                "0 0 20px rgba(var(--primary-rgb), 0.3)",
                "0 0 40px rgba(var(--primary-rgb), 0.6)",
                "0 0 20px rgba(var(--primary-rgb), 0.3)",
              ]
            } : {
              boxShadow: "0 0 0px rgba(var(--primary-rgb), 0)"
            }}
            transition={{
              duration: 1.5,
              repeat: isAgentTalking ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          <Image
            src="/profile.webp"
            alt="Bill Zhang"
            width={120}
            height={120}
            className="rounded-full border-2 border-primary z-10 relative"
          />

          {/* Voice Activity Indicator */}
          {isAgentTalking && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary rounded-full p-1 z-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Bill is speaking"
              role="status"
            >
              <Waveform size={20} className="text-background" aria-hidden="true" />
            </motion.div>
          )}
        </motion.div>

        <h2 className="text-foreground font-medium mt-4 text-lg">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask about my projects & experience</p>
        
        {/* Mode Toggle */}
        <div className="flex items-center justify-center gap-3 mt-4 p-2 bg-sidebar-accent/50 rounded-lg">
          <Mic 
            size={18} 
            className={`transition-colors ${chatMode === "voice" ? "text-primary" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
          <Switch
            checked={chatMode === "text"}
            onCheckedChange={handleModeChange}
            aria-label={`Switch to ${chatMode === "voice" ? "text" : "voice"} chat`}
          />
          <MessageSquare 
            size={18} 
            className={`transition-colors ${chatMode === "text" ? "text-primary" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
        </div>

        {/* Recruiter Cheat Sheet Button */}
        <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full gap-2 text-xs border-primary/20 hover:border-primary/50"
            >
              <FileText className="h-3 w-3" />
              Recruiter Cheat Sheet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-card border-border">
            <DialogHeader>
              <DialogTitle>Recruiter Cheat Sheet</DialogTitle>
              <DialogDescription>
                AI-generated summary of our conversation for your notes.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 bg-muted/30 rounded-md border border-border mt-2">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating summary...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-a:text-blue-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summaryContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 gap-2">
               <Button
                variant="outline"
                onClick={() => handleGenerateSummary()}
                disabled={summaryLoading}
                className="gap-2"
              >
                Regenerate
              </Button>
              <Button
                onClick={handleCopySummary}
                disabled={summaryLoading || !summaryContent}
                className="gap-2"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {isCopied ? "Copied" : "Copy to Clipboard"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Voice Activity Visualization - only show in voice mode */}
      {chatMode === "voice" && isCalling && !isPaused && (
        <div className="px-6 py-2" role="status" aria-label="Voice call active">
          <div className="flex items-center justify-center h-8 gap-[2px]" aria-hidden="true">
            {waveformValues.map((value, index) => (
              <motion.div
                key={index}
                className="w-1 bg-primary rounded-full"
                initial={{ height: 2 }}
                animate={{ height: value }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Transcript 
          Note: For very long conversations, consider virtualizing this list with 'virtua' 
          or similar library to maintain performance (Web Interface Guideline: Large lists) */}
      <ScrollArea ref={scrollAreaRef} className="grow px-4 py-2 transcript-container">
        <div className="space-y-4" aria-live="polite" aria-atomic="false">
          <AnimatePresence>
            {transcript.map((entry, index) => (
              <motion.div
                key={`${entry.role}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-2 ${entry.role === "agent" ? "justify-start" : "justify-end"}`}
              >
                {entry.role === "agent" && (
                  <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                    <Image
                      src="/profile.webp"
                      alt="Bill"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${entry.role === "agent"
                    ? "bg-card text-card-foreground border border-border prose-chat"
                    : "bg-primary text-primary-foreground"
                    }`}
                >
                  {entry.role === "agent" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {entry.content}
                    </ReactMarkdown>
                  ) : (
                    entry.content
                  )}
                </div>
                {entry.role === "user" && (
                  <div 
                    className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                    aria-label="You"
                    role="img"
                  >
                    <User size={16} className="text-secondary-foreground" aria-hidden="true" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator - appears as agent message with animated dots */}
          {chatMode === "text" && isTextLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-2 justify-start"
            >
              <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                <Image
                  src="/profile.webp"
                  alt="Bill"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="flex gap-1" role="status" aria-label="AI is typing">
                  <motion.span
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Controls Section */}
      <div className="p-4 border-t border-border">
        <AnimatePresence mode="wait">
          {chatMode === "voice" ? (
            <motion.div
              key="voice-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!isCalling ? (
                <Button
                  onClick={toggleCall}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl transition-all duration-300 hover:shadow-glow cursor-pointer"
                >
                  <Mic className="mr-2 h-5 w-5" /> Start Voice Interaction
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={toggleCall}
                    variant="outline"
                    className={`w-full border-border hover:border-primary hover:bg-card ${isPaused ? "bg-card" : "bg-card/50"}`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="mr-2 h-4 w-4 text-accent" /> Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4 text-accent" /> Pause
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    className="w-full bg-destructive/20 hover:bg-destructive/30 text-destructive hover:text-destructive-foreground border border-destructive/50"
                  >
                    <Square className="mr-2 h-4 w-4" /> End
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="text-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTextLoading}
                className="flex-1 bg-sidebar-accent border-border focus:border-primary"
                aria-label="Message input"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!textInput.trim() || isTextLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                aria-label="Send message"
              >
                {isTextLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const VoiceChatSidebar = memo(VoiceChatSidebarComponent)

