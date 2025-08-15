"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Mic, Pause, Play, Square, User, AudioWaveformIcon as Waveform } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "motion/react"

interface TranscriptEntry {
  role: "agent" | "user"
  content: string
}

interface VoiceChatSidebarProps {
  isCalling: boolean
  startCall: () => void
  endCall: () => void
  transcript: TranscriptEntry[]
  isAgentTalking: boolean
}

export function VoiceChatSidebar({
  isCalling,
  startCall,
  endCall,
  transcript,
  isAgentTalking,
}: VoiceChatSidebarProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(10).fill(2))
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="flex flex-col h-screen w-72 bg-sidebar border-r border-border">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <motion.div 
          className="relative"
          animate={isAgentTalking ? {
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
            animate={isAgentTalking ? {
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
            alt="Portfolio Owner"
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
            >
              <Waveform size={20} className="text-background" />
            </motion.div>
          )}
        </motion.div>

        <h2 className="text-foreground font-medium mt-4 text-lg">AI Voice Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask about my projects & experience</p>
      </div>

      {/* Voice Activity Visualization */}
      {isCalling && !isPaused && (
        <div className="px-6 py-2">
          <div className="flex items-center justify-center h-8 gap-[2px]">
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

      {/* Transcript */}
      <ScrollArea ref={scrollAreaRef} className="flex-grow px-4 py-2 transcript-container">
        <div className="space-y-4">
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-primary/20">
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
                    ? "bg-card text-card-foreground border border-border"
                    : "bg-primary text-primary-foreground"
                    }`}
                >
                  {entry.content}
                </div>
                {entry.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={16} className="text-secondary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Microphone Controls */}
      <div className="p-4 border-t border-border">
        {!isCalling ? (
          <Button
            onClick={toggleCall}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl transition-all duration-300 hover:shadow-glow"
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
      </div>
    </div>
  )
}

