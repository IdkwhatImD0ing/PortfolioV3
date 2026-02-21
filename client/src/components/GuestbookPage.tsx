"use client"

import { useState, useEffect, memo } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"

interface GuestbookEntry {
  name: string
  message: string
  timestamp: number
}

// Animation variants
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
    transition: { type: "spring" as const, stiffness: 100 },
  },
}

function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const fetchEntries = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/guestbook`)
      if (response.ok) {
        const data = await response.json()
        // Sort by timestamp descending
        setEntries(data.sort((a: GuestbookEntry, b: GuestbookEntry) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Failed to fetch guestbook entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, message }),
      })

      if (response.ok) {
        toast({
          title: "Message signed!",
          description: "Thanks for signing the guestbook.",
        })
        setName("")
        setMessage("")
        fetchEntries()
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to sign guestbook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 overflow-hidden bg-background">
      <motion.div
        className="flex flex-col h-full max-w-5xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="mb-6 flex-shrink-0" variants={itemVariants}>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Guestbook
          </h1>
          <p className="text-muted-foreground mt-2">
            Leave a message for me and other visitors!
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          {/* Sign Form */}
          <motion.div className="w-full lg:w-1/3" variants={itemVariants}>
            <Card className="bg-card border-border h-fit">
              <CardHeader>
                <CardTitle>Sign the Guestbook</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Your Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSubmitting}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !name.trim() || !message.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Sign Guestbook
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Entries List */}
          <motion.div className="w-full lg:w-2/3 min-h-0" variants={itemVariants}>
            <Card className="h-full flex flex-col bg-card/50 border-border">
              <CardContent className="p-0 flex-1 min-h-0">
                <ScrollArea className="h-full p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                      No messages yet. Be the first to sign!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {entries.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card border border-border p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-primary">{entry.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground/90 text-sm whitespace-pre-wrap">
                            {entry.message}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default memo(GuestbookPage)
