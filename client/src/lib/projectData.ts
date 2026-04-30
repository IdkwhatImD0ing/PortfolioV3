import { readFile } from 'fs/promises'
import { join } from 'path'

export interface ProjectData {
  id: string
  name: string
  summary: string
  details: string
  github: string | null
  demo: string | null
}

let cachedProjects: ProjectData[] | null = null

async function loadProjects(): Promise<ProjectData[]> {
  if (cachedProjects) return cachedProjects
  const raw = await readFile(join(process.cwd(), 'public', 'data.json'), 'utf-8')
  cachedProjects = JSON.parse(raw)
  return cachedProjects!
}

export async function getProjectById(id: string): Promise<ProjectData | null> {
  const projects = await loadProjects()
  return projects.find(p => p.id === id) ?? null
}

export async function getAllProjects(): Promise<ProjectData[]> {
  return loadProjects()
}
