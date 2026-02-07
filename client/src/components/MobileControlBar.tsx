"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Pause, Play, Square, MessageSquare, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "motion/react"

interface MobileControlBarProps {
  isCalling: boolean
  startCall: () => void
  endCall: () => void
  isAgentTalking: boolean
  chatMode: "voice" | "text"
  setChatMode: (mode: "voice" | "text") => void
  sendTextMessage: (content: string) => void
  isTextLoading: boolean
}

export default function MobileControlBar({
  isCalling,
  startCall,
  endCall,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAgentTalking,
  chatMode,
  setChatMode,
  sendTextMessage,
  isTextLoading,
}: MobileControlBarProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [waveformValues, setWaveformValues] = useState<number[]>(() => Array(8).fill(2))
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when switching to text mode
  useEffect(() => {
    if (chatMode === "text" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatMode])

  // Animate waveform when call is active
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCalling && !isPaused) {
      interval = setInterval(() => {
        setWaveformValues(prev => prev.map(() => Math.floor(Math.random() * 12) + 2))
      }, 150)
    }
    return () => clearInterval(interval)
  }, [isCalling, isPaused])

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
    if (isTextMode && isCalling) {
      endCall()
    }
    setChatMode(isTextMode ? "text" : "voice")
  }

  return (
    <div
      className="p-4 border-t border-border bg-background space-y-3 shrink-0"
      style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom, 0px))` }}
    >
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-3">
        <Mic
          size={16}
          className={`transition-colors ${chatMode === "voice" ? "text-primary" : "text-muted-foreground"}`}
          aria-hidden="true"
        />
        <Switch
          checked={chatMode === "text"}
          onCheckedChange={handleModeChange}
          aria-label={`Switch to ${chatMode === "voice" ? "text" : "voice"} chat`}
        />
        <MessageSquare
          size={16}
          className={`transition-colors ${chatMode === "text" ? "text-primary" : "text-muted-foreground"}`}
          aria-hidden="true"
        />
      </div>

      {/* Voice waveform visualization */}
      {chatMode === "voice" && isCalling && !isPaused && (
        <div className="flex items-center justify-center h-6 gap-[2px]" role="status" aria-label="Voice call active">
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
      )}

      {/* Controls */}
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl cursor-pointer"
              >
                <Mic className="mr-2 h-5 w-5" /> Start Voice Chat
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={toggleCall}
                  variant="outline"
                  className={`w-full border-border hover:border-primary hover:bg-card ${isPaused ? "bg-card" : "bg-card/50"}`}
                >
                  {isPaused ? (
                    <><Play className="mr-2 h-4 w-4 text-accent" /> Resume</>
                  ) : (
                    <><Pause className="mr-2 h-4 w-4 text-accent" /> Pause</>
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
  )
}
