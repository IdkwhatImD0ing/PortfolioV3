# VoiceChatSidebar Component

Documentation for the chat sidebar component with voice and text modes.

## File Location

`src/components/app-sidebar.tsx`

## Purpose

The chat interface displayed on the left side of the screen. Supports two modes:

**Voice Mode:**
- Profile picture with talking indicator
- Real-time transcript
- Voice waveform visualization
- Call control buttons (Start, Pause, End)

**Text Mode:**
- Profile picture
- Real-time transcript
- Text input with send button
- Typing indicator when AI is responding

## Props

```typescript
interface VoiceChatSidebarProps {
  // Voice chat props
  isCalling: boolean;           // Whether voice call is active
  startCall: () => void;        // Function to start voice call
  endCall: () => void;          // Function to end voice call
  isAgentTalking: boolean;      // Whether agent is speaking (voice mode)
  
  // Shared state
  transcript: TranscriptEntry[]; // Conversation transcript
  
  // Mode switching props
  chatMode: "voice" | "text";   // Current interaction mode
  setChatMode: (mode: "voice" | "text") => void; // Switch modes
  
  // Text chat props
  sendTextMessage: (content: string) => void; // Send text message
  isTextLoading: boolean;       // Whether waiting for AI response
}

interface TranscriptEntry {
  role: "agent" | "user";
  content: string;
}
```

## Usage

```tsx
import { VoiceChatSidebar } from "@/components/app-sidebar";

<VoiceChatSidebar
  isCalling={isCalling}
  startCall={startCall}
  endCall={endCall}
  transcript={fullTranscript}
  isAgentTalking={isAgentTalking}
  chatMode={chatMode}
  setChatMode={setChatMode}
  sendTextMessage={sendTextMessage}
  isTextLoading={isTextLoading}
/>
```

## Mode Toggle

A toggle switch allows users to switch between voice and text modes:

```tsx
<div className="flex items-center justify-center gap-3 mt-4">
  <Mic className={chatMode === "voice" ? "text-primary" : "text-muted"} />
  <Switch
    checked={chatMode === "text"}
    onCheckedChange={handleModeChange}
  />
  <MessageSquare className={chatMode === "text" ? "text-primary" : "text-muted"} />
</div>
```

When switching from voice to text mode during an active call, the voice call is automatically ended.

## Component Sections

### Profile Section (Lines 75-133)

- Profile image with glow effect when agent talks
- Pulsing animation during speech
- Voice activity indicator badge

```tsx
<motion.div 
  animate={isAgentTalking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
  transition={{ duration: 1.5, repeat: Infinity }}
>
  <Image src="/profile.webp" alt="Bill Zhang" />
</motion.div>
```

### Waveform Visualization (Lines 136-150)

Animated bars showing voice activity:

```tsx
{isCalling && !isPaused && (
  <div className="flex items-center justify-center h-8 gap-[2px]">
    {waveformValues.map((value, index) => (
      <motion.div
        className="w-1 bg-primary rounded-full"
        animate={{ height: value }}
      />
    ))}
  </div>
)}
```

### Transcript Display (Lines 152-198)

Auto-scrolling conversation history:

```tsx
<ScrollArea ref={scrollAreaRef}>
  <AnimatePresence>
    {transcript.map((entry, index) => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={entry.role === "agent" ? "justify-start" : "justify-end"}
      >
        {entry.content}
      </motion.div>
    ))}
  </AnimatePresence>
</ScrollArea>
```

### Control Section

The control section renders different controls based on the current mode:

**Voice Mode:**

```tsx
// Not calling
<Button onClick={toggleCall}>
  <Mic /> Start Voice Interaction
</Button>

// Calling
<Button onClick={toggleCall}>
  {isPaused ? <Play /> Resume : <Pause /> Pause}
</Button>
<Button onClick={handleEndCall} variant="destructive">
  <Square /> End
</Button>
```

**Text Mode:**

```tsx
<Input
  placeholder="Type a message..."
  value={textInput}
  onChange={(e) => setTextInput(e.target.value)}
  onKeyDown={handleKeyDown}
  disabled={isTextLoading}
/>
<Button onClick={handleSendMessage} disabled={!textInput.trim() || isTextLoading}>
  {isTextLoading ? <Loader2 className="animate-spin" /> : <Send />}
</Button>
```

## Internal State

```typescript
const [isPaused, setIsPaused] = useState(false);
const [waveformValues, setWaveformValues] = useState<number[]>(Array(10).fill(2));
const [textInput, setTextInput] = useState("");  // Text mode input value
```

## Animations

### Waveform Animation

```typescript
useEffect(() => {
  if (isCalling && !isPaused) {
    interval = setInterval(() => {
      setWaveformValues(prev => prev.map(() => Math.random() * 15 + 2));
    }, 150);
  }
}, [isCalling, isPaused]);
```

### Reduced Motion Support

```typescript
const prefersReducedMotion = useReducedMotion();

animate={isAgentTalking && !prefersReducedMotion ? {...} : {...}}
```

## Auto-Scroll

Scrolls to bottom when transcript updates:

```typescript
useEffect(() => {
  const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
  if (scrollElement) {
    scrollElement.scrollTop = scrollElement.scrollHeight;
  }
}, [transcript]);
```

## Performance

Component is wrapped with `React.memo()`:

```typescript
export const VoiceChatSidebar = memo(VoiceChatSidebarComponent);
```

## Accessibility

- `aria-live="polite"` for transcript updates
- `aria-label` for status indicators
- `role="status"` for voice activity
- Reduced motion support

## Modifications

### Change Profile Image

Update the `src` in the Image component:

```tsx
<Image src="/new-profile.webp" alt="Name" width={120} height={120} />
```

### Customize Waveform

Adjust bar count and animation:

```typescript
const [waveformValues, setWaveformValues] = useState<number[]>(Array(15).fill(2)); // More bars
setWaveformValues(prev => prev.map(() => Math.random() * 20 + 5)); // Taller
```

### Add Transcript Actions

```tsx
{transcript.map((entry, index) => (
  <motion.div>
    {entry.content}
    <Button size="sm" onClick={() => copyToClipboard(entry.content)}>
      Copy
    </Button>
  </motion.div>
))}
```

## Related Files

- [page.md](page.md) - Parent component providing props
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/scroll-area.tsx` - ScrollArea component
