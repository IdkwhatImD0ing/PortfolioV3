"use client"
import { motion } from "motion/react"

export function VoiceIndicator() {
    return (
        <div className="flex items-center gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1 h-3 bg-primary rounded-full"
                    initial={{ height: 3 }}
                    animate={{
                        height: [3, 12, 5, 9, 3],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        ease: "easeInOut",
                        delay: i * 0.2,
                    }}
                />
            ))}
        </div>
    )
}

