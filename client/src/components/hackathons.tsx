"use client"

import { memo, useMemo, useState, type ElementType } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ExternalLink,
  MapPin,
  Route,
  School,
  Sparkles,
  Trophy,
} from "lucide-react"
import dynamic from "next/dynamic"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  hackathonEvents,
  getMapDots,
  stats,
  type HackathonEvent,
} from "@/data/hackathon-locations"

const DEVPOST_URL = "https://devpost.com/IdkwhatImD0ing"

const USRouteMap = dynamic(() => import("@/components/ui/us-route-map"), {
  ssr: false,
  loading: () => (
    <div className="aspect-[2/1] w-full animate-pulse rounded-2xl bg-muted/30" />
  ),
})

interface HackathonsPageProps {
  onNavigateToProject?: (projectId: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 110, damping: 18 },
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string
  value: number
  icon: ElementType
  description: string
}) {
  return (
    <Card className="border-primary/15 bg-background/45 backdrop-blur-sm">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-primary/20 bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-3xl font-bold tabular-nums text-foreground">
            <NumberTicker value={value} delay={0.25} />
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
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
  const projectPanelId = `hackathon-${event.id}-projects`
  const hasAwards = event.awards.length > 0
  const hasProjects = event.projects.length > 0

  return (
    <motion.article
      layout={!prefersReducedMotion}
      className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card/75 p-5 backdrop-blur-sm [contain-intrinsic-size:320px] [content-visibility:auto] transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/45 hover:bg-card hover:shadow-[0_0_28px_rgba(162,89,255,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight text-foreground text-pretty">
            {event.hackathon}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <School className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
            <span className="min-w-0 truncate">{event.school}</span>
          </p>
        </div>
        <Badge className="shrink-0 border-primary/20 bg-primary/10 text-primary hover:bg-primary/15">
          <Calendar className="mr-1 h-3 w-3" aria-hidden="true" />
          <span className="tabular-nums">{event.year}</span>
        </Badge>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{event.city}</span>
      </p>

      <div className="mt-4 flex min-h-[34px] flex-wrap gap-1.5">
        {hasAwards ? (
          event.awards.map((award) => (
            <Badge
              key={award}
              variant="outline"
              className="border-primary/25 bg-primary/10 text-[11px] font-medium text-primary"
            >
              <Trophy className="mr-1 h-3 w-3" aria-hidden="true" />
              {award}
            </Badge>
          ))
        ) : (
          <span className="rounded-full border border-border/60 bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground">
            Built & shipped prototype
          </span>
        )}
      </div>

      {hasProjects && (
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={projectPanelId}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-left text-sm text-muted-foreground transition-[background-color,border-color,color] duration-200 hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
          >
            <span>
              {event.projects.length} project{event.projects.length > 1 ? "s" : ""} from this event
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={projectPanelId}
                initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {event.projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => onProjectClick?.(project.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-[background-color,border-color,color] duration-200 hover:border-primary/45 hover:bg-primary/15 hover:text-accent"
                    >
                      {project.name}
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.article>
  )
}

type SortMode = "recent" | "awards"

function HackathonsPage({ onNavigateToProject }: HackathonsPageProps) {
  const [sortMode, setSortMode] = useState<SortMode>("recent")
  const mapDots = useMemo(() => getMapDots(), [])

  const featuredEvents = useMemo(
    () =>
      [...hackathonEvents]
        .filter((event) => event.awards.length > 0)
        .sort((a, b) => b.awards.length - a.awards.length || b.year - a.year)
        .slice(0, 3),
    []
  )

  const sortedEvents = useMemo(() => {
    const events = [...hackathonEvents]
    if (sortMode === "recent") {
      return events.sort((a, b) => b.year - a.year || a.hackathon.localeCompare(b.hackathon))
    }
    return events.sort((a, b) => b.awards.length - a.awards.length || b.year - a.year)
  }, [sortMode])

  return (
    <div className="min-h-full w-full bg-background text-foreground">
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 pb-24 sm:px-6 md:py-10 lg:px-8"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-56 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/55 p-6 shadow-[0_0_45px_rgba(162,89,255,0.10)] backdrop-blur-sm md:p-8"
          aria-labelledby="hackathon-title"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="max-w-3xl">
              <Badge className="mb-4 border-primary/25 bg-primary/10 text-primary hover:bg-primary/15">
                <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Builder Log
              </Badge>
              <h1 id="hackathon-title" className="sr-only">
                Hackathon Journey
              </h1>
              <div aria-hidden="true">
                <TextGenerateEffect
                  words="Hackathon Journey"
                  className="text-4xl [&_.text-2xl]:text-4xl md:text-6xl md:[&_.text-2xl]:text-6xl"
                  duration={0.35}
                />
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                A map of prototypes, wins, late nights, and teams across the country, from UC
                Santa Cruz to national AI and product competitions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a href={DEVPOST_URL} target="_blank" rel="noopener noreferrer">
                    View Devpost
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-primary/30 bg-background/40 text-foreground hover:bg-primary/10 hover:text-foreground"
                >
                  <a href="#hackathon-events">
                    Browse Events
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Hackathons"
                value={stats.totalHackathons}
                icon={Calendar}
                description="events attended"
              />
              <StatCard
                label="Awards"
                value={stats.totalAwards}
                icon={Trophy}
                description="judged wins"
              />
              <StatCard
                label="Schools"
                value={stats.uniqueSchools}
                icon={School}
                description="host campuses"
              />
              <StatCard
                label="States"
                value={stats.uniqueStates}
                icon={MapPin}
                description="competition stops"
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]"
          aria-label="Hackathon map and highlights"
        >
          <Card className="overflow-hidden border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">United States Route Map</h2>
                    <p className="text-sm text-muted-foreground">
                      Animated connections from UC Santa Cruz to each US host location.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
                    <Route className="mr-1 h-3 w-3" aria-hidden="true" />
                    {mapDots.length} stops
                  </Badge>
                </div>
              </div>
              <div className="relative px-3 py-4 sm:px-5">
                <USRouteMap
                  dots={mapDots}
                  lineColor="#a259ff"
                  ariaLabel="United States hackathon route map"
                />
                <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  Connections from UC Santa Cruz
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground">Highest-Signal Wins</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A few award-heavy stops from the broader journey.
                </p>
              </div>
              <div className="space-y-3">
                {featuredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {event.hackathon}
                      </h3>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {event.year}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{event.school}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.awards.slice(0, 2).map((award) => (
                        <Badge
                          key={award}
                          variant="outline"
                          className="border-primary/25 bg-primary/10 text-[10px] text-primary"
                        >
                          {award}
                        </Badge>
                      ))}
                      {event.awards.length > 2 && (
                        <Badge variant="outline" className="border-border/70 text-[10px]">
                          +{event.awards.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          id="hackathon-events"
          variants={itemVariants}
          className="mt-10 scroll-mt-8"
          aria-labelledby="hackathon-events-title"
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="hackathon-events-title" className="text-2xl font-semibold text-foreground">
                Event Archive
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sort the full journey by recency or award density, then jump into related projects.
              </p>
            </div>
            <div className="inline-flex w-fit rounded-full border border-border/70 bg-muted/30 p-1">
              {(["recent", "awards"] as SortMode[]).map((mode) => {
                const isActive = sortMode === mode
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSortMode(mode)}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "recent" ? "Most Recent" : "Most Awards"}
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            role="list"
          >
            {sortedEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants} role="listitem">
                <HackathonCard event={event} onProjectClick={onNavigateToProject} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.main>
    </div>
  )
}

export default memo(HackathonsPage)
