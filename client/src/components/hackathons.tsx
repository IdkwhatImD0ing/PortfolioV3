"use client"

import { memo, useState, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { MapPin, Trophy, School, Calendar, ChevronDown, ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { NumberTicker } from "@/components/ui/number-ticker"
import {
  hackathonEvents,
  getMapDots,
  stats,
  type HackathonEvent,
} from "@/data/hackathon-locations"

const WorldMap = dynamic(() => import("@/components/ui/world-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[2/1] rounded-lg bg-muted/30 animate-pulse" />
  ),
})

interface HackathonsPageProps {
  onNavigateToProject?: (projectId: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card/60 border border-border/50">
      <Icon className="w-4 h-4 text-primary mb-1" />
      <span className="text-2xl font-bold text-foreground tabular-nums">
        <NumberTicker value={value} delay={0.3} />
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function HackathonCard({
  event,
  onProjectClick,
}: {
  event: HackathonEvent
  onProjectClick?: (projectId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      layout={!prefersReducedMotion}
      className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {event.hackathon}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <School className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.school}</span>
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{event.year}</span>
      </div>

      {event.awards.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {event.awards.map((award) => (
            <span
              key={award}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              <Trophy className="w-2.5 h-2.5" />
              {award}
            </span>
          ))}
        </div>
      )}

      {event.projects.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {event.projects.length} project{event.projects.length > 1 ? "s" : ""}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {event.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => onProjectClick?.(project.id)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary border border-border/50 transition-colors cursor-pointer"
                    >
                      {project.name}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

type SortMode = "recent" | "awards"

function HackathonsPage({ onNavigateToProject }: HackathonsPageProps) {
  const [sortMode, setSortMode] = useState<SortMode>("recent")
  const mapDots = useMemo(() => getMapDots(), [])

  const sortedEvents = useMemo(() => {
    const events = [...hackathonEvents]
    if (sortMode === "recent") {
      return events.sort((a, b) => b.year - a.year || a.hackathon.localeCompare(b.hackathon))
    }
    return events.sort((a, b) => b.awards.length - a.awards.length || b.year - a.year)
  }, [sortMode])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <TextGenerateEffect
            words="Hackathon Journey"
            className="text-3xl md:text-4xl"
            duration={0.4}
          />
          <p className="text-muted-foreground text-sm md:text-base">
            From UC Santa Cruz to hackathons across the country
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          <StatCard label="Hackathons" value={stats.totalHackathons} icon={Calendar} />
          <StatCard label="Awards" value={stats.totalAwards} icon={Trophy} />
          <StatCard label="Schools" value={stats.uniqueSchools} icon={School} />
          <StatCard label="States" value={stats.uniqueStates} icon={MapPin} />
        </motion.div>

        {/* Map */}
        <motion.div variants={itemVariants} className="relative">
          <WorldMap dots={mapDots} lineColor="#a259ff" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-[#a259ff] animate-pulse" />
            Connections from UC Santa Cruz
          </div>
        </motion.div>

        {/* Sort controls */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">All Hackathons</h2>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
            {(["recent", "awards"] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${
                  sortMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "recent" ? "Most Recent" : "Most Awards"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {sortedEvents.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <HackathonCard event={event} onProjectClick={onNavigateToProject} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default memo(HackathonsPage)
