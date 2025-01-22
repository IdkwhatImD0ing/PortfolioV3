import { VoiceChatSidebar } from '@/components/VoiceChatSidebar'

export default function VoiceChatPage() {
  return (
    <div className="flex h-screen">
      <VoiceChatSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-4">Voice Chat with NBExt</h1>
        <p className="text-lg">
          Welcome to the voice chat feature. Use the sidebar to interact with your AI voice assistant.
        </p>
        {/* Add more content or components for the main area as needed */}
      </main>
    </div>
  )
}

