import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"

const educationData = [
    {
        school: "University of Southern California (USC)",
        degree: "Master's in Computer Science + AI",
        duration: "August 2023 - May 2025",
        details: "Focusing on advanced topics in Computer Science and Artificial Intelligence.",
        logo: "/placeholder.svg?height=64&width=64"
    },
    {
        school: "University of California, Santa Cruz (UCSC)",
        degree: "Bachelor's in Computer Science",
        duration: "September 2020 - March 2023",
        details: "Completed undergraduate studies in Computer Science.",
        logo: "/placeholder.svg?height=64&width=64"
    },
    {
        school: "Lynbrook High School",
        degree: "High School Diploma",
        duration: "2016 - 2020",
        details: "Completed secondary education with focus on college preparatory courses.",
        logo: "/placeholder.svg?height=64&width=64"
    }
]

export default function EducationPage() {

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-primary mb-8">Education</h1>
                <div className="space-y-6">
                    {educationData.map((edu, index) => (
                        <Card key={index} className="w-full bg-card hover:bg-card/80 transition-colors">
                            <CardContent className="flex items-center p-6">
                                <div className="w-16 h-16 relative mr-6 flex-shrink-0">
                                    <Image
                                        src={edu.logo}
                                        alt={`${edu.school} logo`}
                                        fill
                                        style={{ objectFit: "contain" }}
                                        sizes="(max-width: 64px) 100vw, 64px"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-primary mb-1">{edu.school}</h2>
                                    <p className="text-muted-foreground mb-1">{edu.degree}</p>
                                    <p className="text-sm text-muted-foreground mb-2">{edu.duration}</p>
                                    <p className="text-sm">{edu.details}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

