'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Mic, Pause, Play, Square, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  type: 'ai' | 'user'
  content: string
}

export function VoiceChatSidebar() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const toggleCall = () => {
    if (!isCallActive) {
      setIsCallActive(true)
      setIsPaused(false)
      setMessages([{ type: 'ai', content: "Hello! I'm your AI voice assistant. How can I help you today?" }])
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
    <div className="flex flex-col h-screen w-64 bg-background border-r border-border">
      {/* Logo and Text */}
      <div className="p-4 flex items-center space-x-2">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
        <div className="text-sm font-semibold">NBExt Voice Assistant</div>
      </div>

      {/* Headshot */}
      <div className="p-4">
        <Image src="/headshot.png" alt="NBExt Headshot" width={200} height={200} className="rounded-full mx-auto" />
      </div>

      {/* Transcript */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start space-x-2 ${message.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
              {message.type === 'ai' && (
                <Image src="/headshot.png" alt="AI" width={24} height={24} className="rounded-full" />
              )}
              <div className={`p-2 rounded-lg ${message.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                {message.content}
              </div>
              {message.type === 'user' && (
                <User size={24} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Microphone Controls */}
      <div className="p-4">
        {!isCallActive ? (
          <Button onClick={toggleCall} className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Start Call
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={toggleCall} variant="outline" className="w-full">
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              )}
            </Button>
            <Button onClick={endCall} variant="destructive" className="w-full">
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

