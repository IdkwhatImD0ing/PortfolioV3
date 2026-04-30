import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import { getProjectById } from "@/lib/projectData";

const BASE_URL = "https://art3m1s.me";

const PAGE_META: Record<string, { title: string; description: string }> = {
  landing: {
    title: "Bill Zhang | AI Engineer Portfolio",
    description: "Interactive voice-driven portfolio of Bill Zhang, AI Engineer at Scale AI. Explore projects, experience, and education through conversation.",
  },
  education: {
    title: "Education | Bill Zhang",
    description: "Bill Zhang's academic background at USC and UC Santa Cruz — coursework, research, and achievements.",
  },
  personal: {
    title: "About Me | Bill Zhang",
    description: "Learn about Bill Zhang — AI Engineer at Scale AI, hackathon winner, and builder of conversational AI systems.",
  },
  resume: {
    title: "Resume | Bill Zhang",
    description: "Bill Zhang's professional resume — AI Engineer at Scale AI with experience in ML, NLP, and full-stack development.",
  },
  project: {
    title: "Projects | Bill Zhang",
    description: "Explore Bill Zhang's portfolio of AI, ML, and full-stack projects — hackathon winners and innovative prototypes.",
  },
  hackathon: {
    title: "Hackathons | Bill Zhang",
    description: "Bill Zhang's hackathon journey — 35+ wins across the US, from UC Santa Cruz to Yale, Berkeley, and beyond.",
  },
  architecture: {
    title: "How It Works | Bill Zhang",
    description: "Under the hood of Bill Zhang's voice-driven portfolio — Next.js, FastAPI, OpenAI Agents, Pinecone RAG, and Retell voice.",
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = (typeof params.page === "string" ? params.page : "landing") as string;
  const projectId = typeof params.projectId === "string" ? params.projectId : undefined;

  let title: string;
  let description: string;

  if (page === "project" && projectId) {
    const project = await getProjectById(projectId);
    if (project) {
      title = `${project.name} | Bill Zhang`;
      description = project.summary.length > 200
        ? project.summary.slice(0, 197) + "..."
        : project.summary;
    } else {
      title = PAGE_META.project.title;
      description = PAGE_META.project.description;
    }
  } else {
    const meta = PAGE_META[page] ?? PAGE_META.landing;
    title = meta.title;
    description = meta.description;
  }

  const ogParams = new URLSearchParams();
  if (page !== "landing") ogParams.set("page", page);
  if (projectId) ogParams.set("projectId", projectId);
  const ogUrl = `${BASE_URL}/api/og${ogParams.toString() ? `?${ogParams}` : ""}`;

  const canonicalParams = new URLSearchParams();
  if (page !== "landing") canonicalParams.set("page", page);
  if (projectId) canonicalParams.set("projectId", projectId);
  const canonicalUrl = `${BASE_URL}${canonicalParams.toString() ? `?${canonicalParams}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: "Bill Zhang Portfolio",
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function Home() {
  return <HomeContent />;
}
