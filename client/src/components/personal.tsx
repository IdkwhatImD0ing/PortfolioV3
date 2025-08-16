"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { motion } from "motion/react"

export default function PersonalPage() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const glowVariants = {
    idle: {
      boxShadow: "0 0 10px rgba(162, 89, 255, 0.3)",
    },
    hover: {
      boxShadow: "0 0 20px rgba(162, 89, 255, 0.6)",
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex items-center justify-center overflow-hidden">
      <motion.div
        initial="hidden"
        animate={loaded ? "visible" : "hidden"}
        variants={containerVariants}
        className="w-full max-w-5xl"
      >
        <motion.div className="relative mb-12 text-center" variants={itemVariants}>
          <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            <span className="tracking-wider">BILL ZHANG</span>
          </h1>
          <div className="h-0.5 w-32 bg-linear-to-r from-primary to-accent mx-auto mt-2 mb-4"></div>
          <p className="text-xl text-foreground/80">
            <span className="font-light tracking-wide">AI ENGINEER & CS STUDENT</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div
              variants={glowVariants}
              initial="idle"
              whileHover="hover"
              className="relative rounded-2xl overflow-hidden bg-card border border-border/50"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-30"></div>
              <div className="p-6 flex flex-col items-center">
                <motion.div
                  className="relative mb-6 rounded-full overflow-hidden border-2 border-primary/30"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent rounded-full"></div>
                  <Image
                    src="/profile.webp?height=250&width=250"
                    alt="Bill Zhang"
                    width={220}
                    height={220}
                    className="rounded-full"
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent rounded-full"></div>
                </motion.div>

                <motion.div className="flex flex-wrap justify-center gap-2 mb-6" variants={itemVariants}>
                  <Badge variant="outline" className="bg-card/50 border-primary/30 text-foreground/90 px-3 py-1">
                    AI
                  </Badge>
                  <Badge variant="outline" className="bg-card/50 border-primary/30 text-foreground/90 px-3 py-1">
                    Machine Learning
                  </Badge>
                  <Badge variant="outline" className="bg-card/50 border-primary/30 text-foreground/90 px-3 py-1">
                    NLP
                  </Badge>
                  <Badge variant="outline" className="bg-card/50 border-primary/30 text-foreground/90 px-3 py-1">
                    Conversational AI
                  </Badge>
                </motion.div>

                <motion.div className="w-full space-y-3 text-foreground/80" variants={itemVariants}>
                  <div className="flex justify-between items-center border-b border-border/30 pb-2">
                    <span className="text-sm font-light">AGE</span>
                    <span className="font-medium">22</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-2">
                    <span className="text-sm font-light">MAJOR</span>
                    <span className="font-medium">CS-AI</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/30 pb-2">
                    <span className="text-sm font-light">LOCATION</span>
                    <span className="font-medium">San Francisco, CA</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm font-light">UNIVERSITY</span>
                    <span className="font-medium">USC</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <motion.div
              variants={glowVariants}
              initial="idle"
              whileHover="hover"
              className="h-full relative rounded-2xl overflow-hidden bg-card border border-border/50"
            >
              <div className="absolute inset-0 bg-linear-to-br from-secondary/10 to-transparent opacity-30"></div>
              <div className="p-8">
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                    <h2 className="text-2xl font-semibold tracking-wide">PROFESSIONAL</h2>
                  </div>
                  <div className="pl-4 border-l border-primary/30">
                    <p className="text-foreground/90 leading-relaxed">
                      Currently working as an <span className="text-primary font-medium">AI Engineer</span> at
                      <span className="text-primary font-medium">Scale AI</span>, focused on applied AI in enterprise. Previously at RingCentral, focused on building conversational AI.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="flex items-center mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                    <h2 className="text-2xl font-semibold tracking-wide">ABOUT ME</h2>
                  </div>
                  <div className="pl-4 border-l border-primary/30">
                    <p className="text-foreground/80 leading-relaxed">
                      I&apos;m a passionate AI engineer and computer science student specializing in
                      <span className="text-primary font-medium"> Artificial Intelligence</span>. Currently pursuing my
                      degree at USC, I&apos;m deeply interested in the field of
                      <span className="text-primary font-medium"> conversational AI</span> and its potential to
                      revolutionize human-computer interaction. My work at Scale AI allows me to apply my knowledge
                      and skills to real-world problems, creating innovative solutions in the AI space. Previously, I worked at RingCentral on conversational AI.
                      <br /><br />
                      Outside of work, I love cooking—especially trying out new kinds of foods. I also enjoy playing instruments, particularly piano and drumset, and I produce and mix my own music that I release online.
                    </p>
                  </div>
                </motion.div>

                <motion.div className="mt-8 flex justify-end" variants={itemVariants} whileHover={{ scale: 1.03 }}>
                  <div className="flex items-center text-sm text-foreground/60">
                    <div className="w-2 h-2 rounded-full bg-primary/70 mr-2 animate-pulse"></div>
                    <span>Ask me about my work in AI</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-6 text-center text-foreground/50 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-1 h-1 rounded-full bg-primary/50"></div>
            <span>Voice-activated portfolio experience</span>
            <div className="w-1 h-1 rounded-full bg-primary/50"></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
