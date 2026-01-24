"use client"

import { memo } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Mic, MousePointer, Keyboard, ArrowLeft } from "lucide-react"

function LandingPage() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-2xl text-center space-y-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Voice-Driven Portfolio
            </h1>
            <p className="text-lg text-muted-foreground">Experience my work through conversation, not clicks</p>
          </motion.div>

          {/* Explanation Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-3 md:grid-cols-2"
          >
            {/* Traditional Navigation - Disabled */}
            <div className="bg-card/50 border border-border rounded-xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-destructive/5"></div>
              <div className="relative z-10 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <MousePointer className="w-5 h-5 text-muted-foreground" />
                  <Keyboard className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground/50 mb-1">Traditional Navigation</h3>
                <p className="text-xs text-muted-foreground">Mouse clicks and keyboard shortcuts are disabled</p>
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Voice Navigation - Active */}
            <div className="bg-card border border-primary/30 rounded-xl p-4 relative overflow-hidden glow-accent">
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Mic className="w-5 h-5 text-primary" />
                  <motion.div
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-2 h-2 bg-primary rounded-full"
                  ></motion.div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Voice Navigation</h3>
                <p className="text-xs text-muted-foreground">Speak naturally to explore projects and insights</p>
              </div>
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-card/30 border border-border rounded-xl p-4 space-y-3"
          >
            <h2 className="text-lg font-semibold text-foreground">How It Works</h2>

            <div className="space-y-2 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-0.5">Start the Conversation</h3>
                  <p className="text-xs text-muted-foreground">Click &quot;Start Conversation&quot; to begin</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-0.5">Speak Naturally</h3>
                  <p className="text-xs text-muted-foreground">
                    Ask about projects, experience, or anything you&apos;re curious about
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-0.5">Explore Through Dialogue</h3>
                  <p className="text-xs text-muted-foreground">
                    The AI reveals projects and insights based on your interests
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Example Questions Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-card/20 border border-primary/20 rounded-xl p-4 space-y-3"
          >
            <h2 className="text-lg font-semibold text-foreground text-center">Try Asking...</h2>

            <div className="grid gap-2 md:grid-cols-2" role="list" aria-label="Example questions you can ask">
              <div className="space-y-2">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;Who is Bill?&quot;</p>
                </div>

                <div className="bg-accent/10 border border-accent/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;Tell me about Bill&apos;s education&quot;</p>
                </div>

                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;What AI projects has Bill built?&quot;</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;Show me your latest projects&quot;</p>
                </div>

                <div className="bg-accent/10 border border-accent/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;What technologies do you use?&quot;</p>
                </div>

                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-2" role="listitem">
                  <p className="text-xs text-foreground font-medium">&quot;Tell me about your experience&quot;</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-base font-medium">Begin your voice journey</span>
            <motion.div
              animate={prefersReducedMotion ? {} : { x: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-2 h-2 bg-primary rounded-full"
            ></motion.div>
          </motion.div>

          {/* Ambient Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={prefersReducedMotion ? {} : {
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 4, repeat: Number.POSITIVE_INFINITY },
              }}
              className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl"
            ></motion.div>
            <motion.div
              animate={prefersReducedMotion ? {} : {
                rotate: -360,
                scale: [1.1, 1, 1.1],
              }}
              transition={{
                rotate: { duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 6, repeat: Number.POSITIVE_INFINITY },
              }}
              className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-accent/5 rounded-full blur-xl"
            ></motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(LandingPage)