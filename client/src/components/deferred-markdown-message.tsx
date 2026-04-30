"use client"

import { lazy, memo, Suspense } from "react"

const MarkdownMessage = lazy(() => import("@/components/markdown-message"))

interface DeferredMarkdownMessageProps {
  content: string
}

function DeferredMarkdownMessage({ content }: DeferredMarkdownMessageProps) {
  return (
    <Suspense fallback={content}>
      <MarkdownMessage content={content} />
    </Suspense>
  )
}

export default memo(DeferredMarkdownMessage)
