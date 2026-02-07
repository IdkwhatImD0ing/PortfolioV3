"use client"

import { memo } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

function ResumePage() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground py-8 px-6 lg:px-12">
            <motion.div
                className="w-full h-[90vh] flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <motion.h1
                        className="text-4xl font-bold text-primary relative"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="relative z-10">Resume</span>
                        <motion.span
                            className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100px" }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Button asChild variant="outline" className="gap-2">
                            <a href="/resume.pdf" download="Bill_Zhang_Resume.pdf">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    </motion.div>
                </div>

                {/* PDF Viewer */}
                <motion.div
                    className="flex-1 rounded-lg border border-border overflow-hidden bg-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <iframe
                        src="/resume.pdf#navpanes=0&view=FitH"
                        title="Bill Zhang Resume"
                        className="w-full h-full"
                        style={{ minHeight: "100%" }}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}

export default memo(ResumePage)
