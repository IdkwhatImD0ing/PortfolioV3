"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, LinkIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"

const project = {
  name: "Counsely",
  description:
    "Counsely is a novel assistant tool offering real-time AI-driven insights and post-session performance evaluations for therapists. It enhances therapeutic sessions with on-the-spot conclusions and suggestions, while its post-session dashboard provides therapists with a deeper understanding of client concerns, facilitating a more effective therapy process.",
  code: "Q56mbQdtSnk",
  techStack: ["NextJS", "Material UI", "Socket.io", "Firebase", "FastAPI", "OpenAI", "Whisper"],
  link: "https://counsely.art3m1s.me/dashboard",
  github: "https://github.com/kaeladair/sbhacks24",
}

export default function ProjectPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
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

  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 md:p-8"
      style={{ background: "#0A0A0A" }} // --background
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <motion.div className="flex items-center mb-8 gap-4" variants={itemVariants}>
        <Link href="/projects">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-[#1A1A2E] hover:text-[#A259FF] transition-all duration-300"
            style={{ color: "#E6E6F1" }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to projects</span>
          </Button>
        </Link>
        <h1 className="text-4xl font-bold" style={{ color: "#A259FF" }}>
          {project.name}
        </h1>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
        <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
              paddingBottom: "56.25%",
              boxShadow: "0 0 20px rgba(162, 89, 255, 0.3)", // Glow using --primary
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${project.code}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </motion.div>

        <motion.div className="w-full lg:w-1/2" variants={itemVariants}>
          <Card
            className="h-full overflow-hidden"
            style={{
              background: "#161622", // --card
              borderColor: "#2A2A3B", // --border
              borderRadius: "0.75rem", // --radius
            }}
          >
            <CardContent className="p-6 flex flex-col h-full">
              <motion.h2
                className="text-3xl font-semibold mb-4"
                style={{ color: "#A259FF" }} // --primary
                variants={itemVariants}
              >
                About the Project
              </motion.h2>

              <motion.p
                className="mb-6 leading-relaxed"
                style={{ color: "#E6E6F1" }} // --foreground
                variants={itemVariants}
              >
                {project.description}
              </motion.p>

              <motion.h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#E6E6F1" }} // --foreground
                variants={itemVariants}
              >
                Tech Stack
              </motion.h3>

              <motion.div className="flex flex-wrap gap-2 mb-6" variants={itemVariants}>
                {project.techStack.map((tech, index) => (
                  <motion.span
                    key={tech}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: "#1A1A2E", // --popover
                      color: "#E6E6F1", // --foreground
                      border: "1px solid #2A2A3B", // --border
                      boxShadow: "0 0 10px rgba(162, 89, 255, 0.15)", // Subtle glow
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#A259FF", // --primary
                      color: "#FFFFFF", // --primary-foreground
                      transition: { duration: 0.2 },
                    }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div className="flex gap-4 mt-auto" variants={itemVariants}>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="flex items-center gap-2 transition-all duration-300"
                      style={{
                        background: "transparent",
                        border: "1px solid #A259FF", // --primary
                        color: "#E6E6F1", // --foreground
                      }}
                      whileHover={{
                        boxShadow: "0 0 10px rgba(162, 89, 255, 0.5)",
                        backgroundColor: "rgba(162, 89, 255, 0.1)",
                      }}
                    >
                      <LinkIcon size={18} />
                      Live Demo
                    </Button>
                  </a>
                )}
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="flex items-center gap-2 transition-all duration-300"
                    style={{
                      background: "transparent",
                      border: "1px solid #A259FF", // --primary
                      color: "#E6E6F1", // --foreground
                    }}
                    whileHover={{
                      boxShadow: "0 0 10px rgba(162, 89, 255, 0.5)",
                      backgroundColor: "rgba(162, 89, 255, 0.1)",
                    }}
                  >
                    <Github size={18} />
                    GitHub
                  </Button>
                </a>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

