'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, LinkIcon } from 'lucide-react'

const project = {
  "name": "Counsely",
  "description": "Counsely is a novel assistant tool offering real-time AI-driven insights and post-session performance evaluations for therapists. It enhances therapeutic sessions with on-the-spot conclusions and suggestions, while its post-session dashboard provides therapists with a deeper understanding of client concerns, facilitating a more effective therapy process.",
  "code": "Q56mbQdtSnk",
  "techStack": [
    "NextJS",
    "Material UI",
    "Socket.io",
    "Firebase",
    "FastAPI",
    "OpenAI",
    "Whisper"
  ],
  "link": "https://counsely.art3m1s.me/dashboard",
  "github": "https://github.com/kaeladair/sbhacks24"
}

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Project: {project.name}</h1>
      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
        <div className="w-full lg:w-1/2">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${project.code}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            ></iframe>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <Card className="h-full bg-card text-card-foreground">
            <CardContent className="p-6 flex flex-col h-full">
              <h2 className="text-3xl font-semibold mb-4">About the Project</h2>
              <p className="text-muted-foreground mb-6">{project.description}</p>
              <h3 className="text-xl font-semibold mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech) => (
                  <span key={tech} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 mt-auto">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <LinkIcon size={20} />
                      Live Demo
                    </Button>
                  </a>
                )}
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Github size={20} />
                    GitHub
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

