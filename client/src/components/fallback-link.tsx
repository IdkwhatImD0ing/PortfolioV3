"use client"

import { motion, useReducedMotion } from "motion/react"
import { ExternalLink, MousePointer2 } from "lucide-react"

interface FallbackLinkProps {
    href: string
    className?: string
}

export function FallbackLink({ href, className = "" }: FallbackLinkProps) {
    const prefersReducedMotion = useReducedMotion()
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className={`fixed bottom-6 right-6 z-50 ${className}`}
        >
            <motion.a
                href={href}
                rel="noopener noreferrer"
                aria-label="Classic Portfolio - visit traditional version of this site"
                className="group relative flex items-center gap-3 px-4 py-3 bg-card/80 backdrop-blur-md border border-border/50 rounded-full text-sm text-foreground/70 hover:text-foreground transition-all duration-300 overflow-hidden"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
                {/* Animated background gradient */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    aria-hidden="true"
                />

                {/* Glow effect - only animate if user doesn't prefer reduced motion */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={prefersReducedMotion ? {} : {
                        boxShadow: [
                            "0 0 0px rgba(162, 89, 255, 0)",
                            "0 0 10px rgba(162, 89, 255, 0.3)",
                            "0 0 0px rgba(162, 89, 255, 0)",
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                    aria-hidden="true"
                />

                <div className="relative flex items-center gap-3">
                    <MousePointer2 className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" aria-hidden="true" />

                    <span className="font-light tracking-wide">Prefer traditional browsing?</span>

                    <motion.div
                        className="flex items-center gap-1 text-primary/70 group-hover:text-primary transition-colors"
                        whileHover={prefersReducedMotion ? {} : { x: 2 }}
                    >
                        <span className="text-xs font-medium">Classic Portfolio</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </motion.div>
                </div>

                {/* Subtle animated border - only animate if user doesn't prefer reduced motion */}
                <motion.div
                    className="absolute inset-0 rounded-full border border-primary/20 opacity-0 group-hover:opacity-100"
                    animate={prefersReducedMotion ? {} : {
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    aria-hidden="true"
                />
            </motion.a>
        </motion.div>
    )
}

export default FallbackLink
