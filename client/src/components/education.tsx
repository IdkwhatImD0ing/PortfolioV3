"use client"

import { useState, memo } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

const educationData = [
    {
        school: "University of Southern California (USC)",
        degree: "Master's in Computer Science + AI",
        duration: "August 2023 - May 2025",
        details: "Graduated with a specialization in Artificial Intelligence, focusing on advanced machine learning and AI applications.",
        logo: "/usc.png?height=64&width=64",
        color: "var(--primary)", // Primary color
    },
    {
        school: "University of California, Santa Cruz (UCSC)",
        degree: "Bachelor's in Computer Science",
        duration: "September 2020 - March 2023",
        details: "Completed undergraduate studies in Computer Science.",
        logo: "/ucsc.png?height=64&width=64",
        color: "var(--secondary)", // Secondary color
    },
    {
        school: "Lynbrook High School",
        degree: "High School Diploma",
        duration: "2016 - 2020",
        details: "Completed secondary education with focus on college preparatory courses.",
        logo: "/lynbrook.png?height=64&width=64",
        color: "var(--accent)", // Accent color
    },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
}

const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
}

function EducationPage() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div
                className="max-w-3xl w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <motion.h1
                    className="text-4xl font-bold text-primary mb-12 relative"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="relative z-10">Education</span>
                    <motion.span
                        className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    />
                </motion.h1>

                <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
                    {educationData.map((edu, index) => (
                        <motion.div key={index} variants={item}>
                            <Card
                                className="w-full bg-card hover:bg-card/90 transition-all duration-300 overflow-hidden border border-border/50"
                                style={{
                                    borderRadius: "var(--radius)",
                                    boxShadow: expandedIndex === index ? `0 0 20px 1px ${edu.color}30` : "none",
                                }}
                            >
                                <CardContent className="p-0">
                                    <motion.div
                                        className="flex items-center p-6 cursor-pointer"
                                        onClick={() => toggleExpand(index)}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                                    >
                                        <div className="relative mr-6 shrink-0">
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden"
                                                style={{
                                                    background: `linear-gradient(135deg, ${edu.color}20, ${edu.color}05)`,
                                                    border: `1px solid ${edu.color}40`,
                                                }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 opacity-20"
                                                    animate={{
                                                        background: [
                                                            `radial-gradient(circle at 50% 50%, ${edu.color}00, ${edu.color}50)`,
                                                            `radial-gradient(circle at 50% 50%, ${edu.color}50, ${edu.color}00)`,
                                                        ],
                                                        scale: [1, 1.2, 1],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        repeatType: "reverse",
                                                    }}
                                                />
                                                <div className="relative w-12 h-12">
                                                    <Image
                                                        src={edu.logo || "/placeholder.svg"}
                                                        alt={`${edu.school} logo`}
                                                        fill
                                                        style={{ objectFit: "contain" }}
                                                        sizes="48px"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grow">
                                            <h2 className="text-xl font-semibold text-foreground mb-1">{edu.school}</h2>
                                            <p className="text-primary font-medium mb-1">{edu.degree}</p>
                                            <p className="text-sm text-muted-foreground">{edu.duration}</p>
                                        </div>

                                        <motion.div animate={{ rotate: expandedIndex === index ? 90 : 0 }} transition={{ duration: 0.3 }}>
                                            <ChevronRight className="w-5 h-5 text-primary" />
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        className="px-6 pb-6 pt-0 overflow-hidden"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{
                                            height: expandedIndex === index ? "auto" : 0,
                                            opacity: expandedIndex === index ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="pt-2 border-t border-border/30 mt-2">
                                            <p className="text-muted-foreground mt-4">{edu.details}</p>

                                            <motion.div
                                                className="mt-4 h-1 rounded-full"
                                                style={{ background: `linear-gradient(90deg, ${edu.color}, ${edu.color}00)` }}
                                                initial={{ width: 0 }}
                                                animate={{ width: expandedIndex === index ? "100%" : 0 }}
                                                transition={{ delay: 0.2, duration: 0.8 }}
                                            />
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default memo(EducationPage)
