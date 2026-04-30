"use client"

import { memo, useRef, forwardRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { BorderBeam } from "@/components/ui/border-beam"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"
import {
  Globe,
  Server,
  Brain,
  Database,
  Mic,
  Monitor,
  Code2,
  Cpu,
  Layers,
  Workflow,
  Search,
  MessageSquare,
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
}

const glowVariants = {
  idle: {
    boxShadow: "0 0 10px rgba(162, 89, 255, 0.2)",
  },
  hover: {
    boxShadow: "0 0 25px rgba(162, 89, 255, 0.5)",
  },
}

interface DiagramNodeProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  className?: string
  highlight?: boolean
}

const DiagramNode = forwardRef<HTMLDivElement, DiagramNodeProps>(
  ({ icon, label, sublabel, className, highlight }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 md:p-4",
        highlight ? "border-primary/50" : "border-border/50",
        className
      )}
    >
      <div className={cn(
        "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg",
        highlight ? "bg-primary/20" : "bg-muted"
      )}>
        {icon}
      </div>
      <span className="text-xs md:text-sm font-medium text-foreground whitespace-nowrap">{label}</span>
      {sublabel && (
        <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">{sublabel}</span>
      )}
      {highlight && <BorderBeam size={60} duration={4} colorFrom="#a259ff" colorTo="#7f5af0" borderWidth={1.5} />}
    </div>
  )
)
DiagramNode.displayName = "DiagramNode"

const LAYERS = [
  {
    title: "Frontend",
    icon: <Monitor className="w-6 h-6 text-primary" />,
    description:
      "Next.js 15 with React 19 and the App Router powers a single-page experience. shadcn/ui provides the component system, and Framer Motion handles all the animations you see on screen.",
    tech: ["Next.js 15", "React 19", "shadcn/ui", "Tailwind CSS", "Motion"],
  },
  {
    title: "Voice Engine",
    icon: <Mic className="w-6 h-6 text-primary" />,
    description:
      "Retell AI manages the full voice pipeline: speech-to-text transcription, text-to-speech synthesis, and real-time WebSocket streaming. Your voice becomes text, and text becomes spoken responses.",
    tech: ["Retell AI", "WebSocket", "WebRTC", "Streaming SSE"],
  },
  {
    title: "AI Backend",
    icon: <Brain className="w-6 h-6 text-primary" />,
    description:
      "A Python FastAPI server runs an OpenAI Agent with tool-calling capabilities. It decides when to search projects, navigate pages, or just respond conversationally. An input guardrail filters jailbreak attempts.",
    tech: ["FastAPI", "Python", "OpenAI Agents", "GPT-5.4-mini", "Guardrails"],
  },
  {
    title: "Vector Search",
    icon: <Database className="w-6 h-6 text-primary" />,
    description:
      "52+ projects are embedded with text-embedding-3-large (3072 dims) and stored in Pinecone. When you ask about projects, the agent performs semantic search to find the most relevant matches.",
    tech: ["Pinecone", "text-embedding-3-large", "Cosine Similarity", "RAG"],
  },
]

const TECH_ITEMS = [
  { name: "Next.js", icon: <Globe className="w-4 h-4" /> },
  { name: "React", icon: <Code2 className="w-4 h-4" /> },
  { name: "TypeScript", icon: <Code2 className="w-4 h-4" /> },
  { name: "Tailwind", icon: <Layers className="w-4 h-4" /> },
  { name: "Python", icon: <Code2 className="w-4 h-4" /> },
  { name: "FastAPI", icon: <Server className="w-4 h-4" /> },
  { name: "OpenAI", icon: <Brain className="w-4 h-4" /> },
  { name: "Pinecone", icon: <Database className="w-4 h-4" /> },
  { name: "Retell AI", icon: <Mic className="w-4 h-4" /> },
  { name: "Vercel", icon: <Globe className="w-4 h-4" /> },
  { name: "shadcn/ui", icon: <Layers className="w-4 h-4" /> },
  { name: "Motion", icon: <Workflow className="w-4 h-4" /> },
]

function ArchitectureDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const retellRef = useRef<HTMLDivElement>(null)
  const browserRef = useRef<HTMLDivElement>(null)
  const fastApiRef = useRef<HTMLDivElement>(null)
  const openaiRef = useRef<HTMLDivElement>(null)
  const pineconeRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-between gap-6 py-8 md:py-12 px-2"
    >
      {/* Left column: inputs */}
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <DiagramNode
          ref={userRef}
          icon={<MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-foreground/70" />}
          label="You"
          sublabel="Voice or Text"
        />
        <DiagramNode
          ref={retellRef}
          icon={<Mic className="w-5 h-5 md:w-6 md:h-6 text-accent" />}
          label="Retell AI"
          sublabel="Voice Engine"
        />
        <DiagramNode
          ref={browserRef}
          icon={<Monitor className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          label="Next.js"
          sublabel="Browser & UI"
        />
      </div>

      {/* Center: Agent */}
      <DiagramNode
        ref={agentRef}
        icon={<Brain className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
        label="AI Agent"
        sublabel="Orchestrator"
        highlight
      />

      {/* Right column: services */}
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <DiagramNode
          ref={fastApiRef}
          icon={<Server className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          label="FastAPI"
          sublabel="Backend"
        />
        <DiagramNode
          ref={openaiRef}
          icon={<Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          label="OpenAI"
          sublabel="GPT-4.1-mini"
        />
        <DiagramNode
          ref={pineconeRef}
          icon={<Search className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          label="Pinecone"
          sublabel="Vector DB"
        />
      </div>

      {/* Beams: left inputs → Agent */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={agentRef}
        pathColor="#2a2a3b"
        gradientStartColor="#a259ff"
        gradientStopColor="#7f5af0"
        duration={3}
        pathWidth={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={retellRef}
        toRef={agentRef}
        pathColor="#2a2a3b"
        gradientStartColor="#a259ff"
        gradientStopColor="#7f5af0"
        duration={3}
        delay={0.4}
        pathWidth={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={browserRef}
        toRef={agentRef}
        pathColor="#2a2a3b"
        gradientStartColor="#a259ff"
        gradientStopColor="#b18aff"
        duration={3}
        delay={0.8}
        pathWidth={2}
      />

      {/* Beams: Agent → right services */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agentRef}
        toRef={fastApiRef}
        pathColor="#2a2a3b"
        gradientStartColor="#7f5af0"
        gradientStopColor="#b18aff"
        duration={3}
        delay={0.2}
        pathWidth={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agentRef}
        toRef={openaiRef}
        pathColor="#2a2a3b"
        gradientStartColor="#7f5af0"
        gradientStopColor="#b18aff"
        duration={3}
        delay={0.6}
        pathWidth={2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agentRef}
        toRef={pineconeRef}
        pathColor="#2a2a3b"
        gradientStartColor="#7f5af0"
        gradientStopColor="#a259ff"
        duration={3}
        delay={1}
        pathWidth={2}
      />
    </div>
  )
}

function ArchitecturePage() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="w-full bg-background text-foreground p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="w-full max-w-5xl mx-auto space-y-10 py-8"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wider uppercase">
              Easter Egg
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-balance">
            Under the Hood
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How this voice-driven portfolio actually works — from your microphone to the AI and back
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          variants={itemVariants}
          className="bg-card/30 border border-border rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Request Flow
            </h2>
          </div>
          <ArchitectureDiagram />
        </motion.div>

        {/* Layer Detail Cards */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              System Layers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAYERS.map((layer) => (
              <motion.div
                key={layer.title}
                variants={glowVariants}
                initial="idle"
                whileHover={prefersReducedMotion ? undefined : "hover"}
                className="relative rounded-2xl overflow-hidden bg-card border border-border/50"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                      {layer.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {layer.title}
                    </h3>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                    {layer.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.tech.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="bg-card/50 border-primary/30 text-foreground/80 text-xs px-2 py-0.5"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack Marquee */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Tech Stack
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/20">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
            <Marquee pauseOnHover className="py-4 [--duration:30s]">
              {TECH_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2 mx-1"
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </Marquee>
          </div>
        </motion.div>

        {/* Fun fact footer */}
        <motion.div variants={itemVariants} className="text-center pb-4">
          <p className="text-sm text-muted-foreground">
            You found the Easter egg! This page is itself rendered by the same stack it describes.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default memo(ArchitecturePage)
