"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, LinkIcon } from "lucide-react"
import Image from "next/image"

interface Project {
  id: string
  name: string
  summary: string
  details: string
  github: string | null
  demo: string | null  // Can be either a YouTube URL or an image path
}

interface ProjectPageProps {
  projectId?: string
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch projects data from public directory
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
        // If projectId is provided, find and set the index
        if (projectId) {
          const index = data.findIndex((p: Project) => p.id === projectId)
          if (index !== -1) {
            setCurrentProjectIndex(index)
          }
        }
      })
      .catch(err => {
        console.error('Failed to load projects:', err)
        setLoading(false)
      })
  }, [])

  // Update project when projectId changes
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const index = projects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        setCurrentProjectIndex(index)
      }
    }
  }, [projectId, projects])

  const currentProject = projects[currentProjectIndex]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  // Check if demo is a video URL or image
  const isVideo = currentProject?.demo && (currentProject.demo.includes('youtube.com') || currentProject.demo.includes('youtu.be'))
  const videoId = isVideo && currentProject?.demo ? getYouTubeVideoId(currentProject.demo) : null
  
  // Debug logging
  useEffect(() => {
    if (currentProject) {
      console.log('Current project:', currentProject.name)
      console.log('Demo URL:', currentProject.demo)
      console.log('Is Video:', isVideo)
      console.log('Video ID:', videoId)
    }
  }, [currentProject, isVideo, videoId])

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

  if (loading || projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p style={{ color: "#E6E6F1" }}>Loading projects...</p>
      </div>
    )
  }

  return (
    <motion.div
      className="h-screen flex flex-col p-4 md:p-8 overflow-hidden"
      style={{ background: "#0A0A0A" }} // --background
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <motion.div className="mb-8 flex-shrink-0" variants={itemVariants}>
        <h1 className="text-4xl font-bold" style={{ color: "#A259FF" }}>
          {currentProject?.name}
        </h1>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <motion.div className="w-full lg:w-1/2 flex items-start justify-center" variants={itemVariants}>
          <div className="relative w-full">
            {/* Demo content - either video or image */}
            {isVideo && videoId ? (
              <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{
                  paddingBottom: "56.25%",
                  boxShadow: "0 0 20px rgba(162, 89, 255, 0.3)",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  title={`${currentProject.name} Demo Video`}
                ></iframe>
              </div>
            ) : currentProject?.demo ? (
              <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", boxShadow: "0 0 20px rgba(162, 89, 255, 0.3)" }}>
                <Image
                  src={currentProject.demo}
                  alt={currentProject.name}
                  fill
                  className="object-cover"
                  unoptimized={currentProject.demo.includes('cloudfront.net')}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-[#1A1A2E] rounded-xl">
                <p style={{ color: "#E6E6F1" }}>No demo available</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="w-full lg:w-1/2 min-h-0" variants={itemVariants}>
          <Card
            className="h-full flex flex-col overflow-hidden"
            style={{
              background: "#161622", // --card
              borderColor: "#2A2A3B", // --border
              borderRadius: "0.75rem", // --radius
            }}
          >
            <CardContent className="p-6 flex flex-col flex-1 min-h-0">
              <div
                className="flex-1 overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#A259FF #1A1A2E'
                }}
              >
                <motion.h2
                  className="text-3xl font-semibold mb-4"
                  style={{ color: "#A259FF" }}
                  variants={itemVariants}
                >
                  {currentProject?.name}
                </motion.h2>

                <motion.div className="space-y-6" variants={itemVariants}>
                  {/* Details Section */}
                  <div className="space-y-4">
                    {currentProject?.details.split('\n\n').map((section, index) => {
                      const lines = section.split('\n')
                      const title = lines[0]
                      const content = lines.slice(1).join('\n')
                      
                      // Skip empty sections
                      if (!title && !content) return null
                      
                      return (
                        <div key={index}>
                          {title && (
                            <h4 className="font-medium mb-2" style={{ color: "#A259FF" }}>
                              {title.replace(/:/g, '')}
                            </h4>
                          )}
                          {content && (
                            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#B8B8C4" }}>
                              {content.split('\n').map((line, lineIndex) => {
                                // Replace markdown bold with HTML
                                const processedLine = line
                                  .replace(/^- /, '• ')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #E6E6F1">$1</strong>')
                                
                                return (
                                  <div 
                                    key={lineIndex} 
                                    dangerouslySetInnerHTML={{ __html: processedLine }}
                                    className="mb-1"
                                  />
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>

              <motion.div className="flex gap-4 mt-6 pt-6 border-t border-[#2A2A3B] flex-shrink-0" variants={itemVariants}>
                {currentProject?.github && (
                  <a href={currentProject.github} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="flex items-center gap-2 transition-all duration-300"
                      style={{
                        background: "transparent",
                        border: "1px solid #A259FF",
                        color: "#E6E6F1",
                      }}
                    >
                      <Github size={18} />
                      GitHub
                    </Button>
                  </a>
                )}
                {isVideo && currentProject?.demo && (
                  <a href={currentProject.demo} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="flex items-center gap-2 transition-all duration-300"
                      style={{
                        background: "transparent",
                        border: "1px solid #A259FF",
                        color: "#E6E6F1",
                      }}
                    >
                      <LinkIcon size={18} />
                      Watch Full Demo
                    </Button>
                  </a>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}