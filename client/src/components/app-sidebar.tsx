"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Mic, Pause, Play, Square, User, AudioWaveformIcon as Waveform } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "motion/react"

interface Message {
  type: "ai" | "user"
  content: string
}

export function VoiceChatSidebar() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(10).fill(2))

  // Simulate waveform animation when call is active and not paused
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCallActive && !isPaused) {
      interval = setInterval(() => {
        setWaveformValues((prev) => prev.map(() => Math.floor(Math.random() * 15) + 2))
      }, 150)
    }

    return () => clearInterval(interval)
  }, [isCallActive, isPaused])

  const toggleCall = () => {
    if (!isCallActive) {
      setIsCallActive(true)
      setIsPaused(false)
      setMessages([
        { type: "ai", content: "Hello! I'm your AI voice assistant. How can I help you explore my portfolio today?" },
      ])
    } else {
      setIsPaused(!isPaused)
    }
  }

  const endCall = () => {
    setIsCallActive(false)
    setIsPaused(false)
    // Optionally, you can clear the messages here if you want to reset the transcript
    // setMessages([])
  }

  return (
    <div className="flex flex-col h-screen w-72 bg-sidebar border-r border-border">
      {/* Profile Section */}
      <div className="p-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full glow-effect"></div>
          <Image
            src="/profile.webp"
            alt="Portfolio Owner"
            width={120}
            height={120}
            className="rounded-full border-2 border-primary z-10 relative"
          />

          {/* Voice Activity Indicator */}
          {isCallActive && !isPaused && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary rounded-full p-1 z-20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <Waveform size={20} className="text-background" />
            </motion.div>
          )}
        </div>

        <h2 className="text-foreground font-medium mt-4 text-lg">AI Voice Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask about my projects & experience</p>
      </div>

      {/* Voice Activity Visualization */}
      {isCallActive && !isPaused && (
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
      <ScrollArea className="flex-grow px-4 py-2 transcript-container">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-2 ${message.type === "ai" ? "justify-start" : "justify-end"}`}
              >
                {message.type === "ai" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card flex items-center justify-center">
                    <Waveform size={16} className="text-primary" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${message.type === "ai"
                    ? "bg-card text-card-foreground border border-border"
                    : "bg-primary text-primary-foreground"
                    }`}
                >
                  {message.content}
                </div>
                {message.type === "user" && (
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
        {!isCallActive ? (
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
              onClick={endCall}
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

