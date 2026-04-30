"use client"

import Image from "next/image"
import { Loader2, Check } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export interface StatusStep {
  text: string
  completed: boolean
}

interface ChatStatusIndicatorProps {
  steps: StatusStep[]
  showAvatar?: boolean
}

export function ChatStatusIndicator({ steps, showAvatar = true }: ChatStatusIndicatorProps) {
  if (steps.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start justify-start ${showAvatar ? "space-x-2" : ""}`}
    >
      {showAvatar && (
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
      <div className="flex flex-col gap-1.5 py-1" role="status" aria-live="polite">
        <AnimatePresence>
          {steps.map((step, i) => (
            <motion.div
              key={`${step.text}-${i}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50"
            >
              {step.completed ? (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              )}
              <span className={`text-xs ${step.completed ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                {step.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
