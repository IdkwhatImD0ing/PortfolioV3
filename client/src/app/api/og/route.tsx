import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getProjectById } from "@/lib/projectData";

export const runtime = "nodejs";

const ACCENT = "#6366f1";

async function loadGeistFont(): Promise<ArrayBuffer> {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-600-normal.woff"
  );
  return res.arrayBuffer();
}

async function loadGeistFontRegular(): Promise<ArrayBuffer> {
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-400-normal.woff"
  );
  return res.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = searchParams.get("page") ?? "landing";
  const projectId = searchParams.get("projectId");

  const [fontSemibold, fontRegular] = await Promise.all([
    loadGeistFont(),
    loadGeistFontRegular(),
  ]);

  let content: ReactElement;

  if (page === "project" && projectId) {
    const project = await getProjectById(projectId);
    if (project) {
      const summary =
        project.summary.length > 160
          ? project.summary.slice(0, 157) + "..."
          : project.summary;

      content = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px 80px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "20px",
                color: "#a1a1aa",
                fontFamily: "Geist Regular",
              }}
            >
              <span>Bill Zhang Portfolio</span>
              <span style={{ color: "#3f3f46" }}>|</span>
              <span style={{ color: ACCENT }}>Project</span>
            </div>
            <div
              style={{
                fontSize: "56px",
                fontFamily: "Geist",
                color: "#fafafa",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {project.name}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontFamily: "Geist Regular",
                color: "#a1a1aa",
                lineHeight: 1.5,
                maxWidth: "900px",
              }}
            >
              {summary}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontFamily: "Geist Regular",
                color: "#52525b",
              }}
            >
              art3m1s.me
            </div>
          </div>
        </div>
      );
    } else {
      content = buildSectionCard("Projects", "Explore innovative AI & ML projects");
    }
  } else if (page === "education") {
    content = buildSectionCard("Education", "USC & UC Santa Cruz — Computer Science");
  } else if (page === "personal") {
    content = buildSectionCard("About Me", "AI Engineer at Scale AI — Builder, Hacker, Creator");
  } else if (page === "resume") {
    content = buildSectionCard("Resume", "AI Engineer — ML, NLP & Full-Stack Development");
  } else {
    content = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontFamily: "Geist",
            color: "#fafafa",
            letterSpacing: "-0.03em",
          }}
        >
          Bill Zhang
        </div>
        <div
          style={{
            fontSize: "28px",
            fontFamily: "Geist Regular",
            color: "#a1a1aa",
          }}
        >
          AI Engineer
        </div>
        <div
          style={{
            fontSize: "20px",
            fontFamily: "Geist Regular",
            color: "#52525b",
            marginTop: "8px",
          }}
        >
          Interactive Voice-Driven Portfolio
        </div>
        <div
          style={{
            fontSize: "18px",
            fontFamily: "Geist Regular",
            color: "#3f3f46",
            marginTop: "20px",
          }}
        >
          art3m1s.me
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          position: "relative",
        }}
      >
        {content}
        {/* Accent gradient strip at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${ACCENT}, #a855f7, #ec4899)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: fontSemibold, style: "normal", weight: 600 },
        { name: "Geist Regular", data: fontRegular, style: "normal", weight: 400 },
      ],
    }
  );
}

function buildSectionCard(title: string, subtitle: string): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "60px 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: "20px",
            fontFamily: "Geist Regular",
            color: "#a1a1aa",
          }}
        >
          Bill Zhang Portfolio
        </div>
        <div
          style={{
            fontSize: "64px",
            fontFamily: "Geist",
            color: "#fafafa",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "26px",
            fontFamily: "Geist Regular",
            color: "#a1a1aa",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          fontSize: "18px",
          fontFamily: "Geist Regular",
          color: "#52525b",
        }}
      >
        art3m1s.me
      </div>
    </div>
  );
}
