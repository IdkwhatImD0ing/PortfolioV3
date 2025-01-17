import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PersonalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl bg-card">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <Image
              src="/placeholder.svg?height=250&width=250"
              alt="Bill Zhang"
              width={250}
              height={250}
              className="rounded-full"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">Bill Zhang</h1>
              <p className="text-xl text-muted-foreground mb-4">AI Engineer & CS Student</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary">AI</Badge>
                <Badge variant="secondary">Machine Learning</Badge>
                <Badge variant="secondary">NLP</Badge>
                <Badge variant="secondary">Conversational AI</Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Personal Info</h2>
              <ul className="space-y-2">
                <li><strong>Age:</strong> 22</li>
                <li><strong>Major:</strong> CS-AI</li>
                <li><strong>Location:</strong> Los Angeles, CA</li>
                <li><strong>University:</strong> USC</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Professional</h2>
              <p>Currently working as an AI Engineer at RingCentral, focused on building conversational AI.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <p className="text-muted-foreground">
              I'm a passionate AI engineer and computer science student specializing in Artificial Intelligence. 
              Currently pursuing my degree at USC, I'm deeply interested in the field of conversational AI and its 
              potential to revolutionize human-computer interaction. My work at RingCentral allows me to apply my 
              knowledge and skills to real-world problems, creating innovative solutions in the AI space.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

