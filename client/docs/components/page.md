# Main Page Component (page.tsx)

Documentation for the main page component that manages voice chat state.

## File Location

`src/app/page.tsx`

## Purpose

The central state manager for the voice portfolio. Handles:
- Voice call lifecycle (start, end, pause)
- Page navigation via metadata events
- Transcript accumulation and display
- URL state synchronization
- Retell SDK integration

## Exports

```tsx
export default function Home()  // Main component with Suspense wrapper
function HomeContent()          // Inner component with all logic
function LoadingSkeleton()      // Loading state UI
```

## State Management

### Call State

```typescript
const [isCalling, setIsCalling] = useState(false);
const [isAgentTalking, setIsAgentTalking] = useState(false);
```

### Navigation State

```typescript
const [activePage, setActivePage] = useState<
  "landing" | "education" | "project" | "personal"
>("landing");
const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
```

### Transcript State

```typescript
const [fullTranscript, setFullTranscript] = useState<TranscriptEntry[]>([]);

interface TranscriptEntry {
  role: "agent" | "user";
  content: string;
}
```

## URL Synchronization

State syncs bidirectionally with URL query params:

```typescript
// State → URL
useEffect(() => {
  const params = new URLSearchParams();
  if (activePage !== 'landing') params.set('page', activePage);
  if (currentProjectId) params.set('projectId', currentProjectId);
  router.replace(newUrl, { scroll: false });
}, [activePage, currentProjectId]);

// URL → State (initial)
const initialPage = searchParams.get('page') || "landing";
const initialProjectId = searchParams.get('projectId');
```

## Retell SDK Integration

### Lazy Loading

```typescript
if (!retellClientRef.current) {
  const { RetellWebClient } = await import("retell-client-js-sdk");
  retellClientRef.current = new RetellWebClient();
  setupRetellListeners(retellClientRef.current);
}
```

### Event Handlers

| Event | Handler |
|-------|---------|
| `call_started` | `setIsCalling(true)` |
| `call_ended` | Reset call state |
| `agent_start_talking` | `setIsAgentTalking(true)` |
| `agent_stop_talking` | `setIsAgentTalking(false)` |
| `update` | `processTranscriptUpdate()` |
| `metadata` | Handle navigation |
| `error` | Show toast, stop call |

### Metadata Navigation

```typescript
client.on("metadata", (metadata) => {
  const meta = metadata?.metadata;
  if (meta?.type === "navigation") {
    switch (meta.page) {
      case "landing": setActivePage("landing"); break;
      case "personal": setActivePage("personal"); break;
      case "education": setActivePage("education"); break;
      case "project":
        setActivePage("project");
        if (meta.project_id) setCurrentProjectId(meta.project_id);
        break;
    }
  }
});
```

## Key Functions

### startCall()

1. Clears transcript
2. Gets agent ID from env
3. Lazy loads Retell SDK
4. Calls `/api/create-web-call`
5. Starts call with access token

### endCall()

```typescript
const endCall = useCallback(() => {
  retellClientRef.current?.stopCall();
}, []);
```

### processTranscriptUpdate()

Merges new transcript entries with existing, preventing duplicates:
- Uses locking mechanism (`transcriptLock`)
- Queues updates (`transcriptQueue`)
- Deduplicates by role + content

## Mobile Redirect

```typescript
useEffect(() => {
  const isMobile = /Android|webOS|iPhone|iPad|.../i.test(navigator.userAgent);
  if (isMobile) window.location.href = 'https://v2.art3m1s.me';
}, []);
```

## Server Ping

Pings backend on load to wake up Cloud Run:

```typescript
useEffect(() => {
  fetch('https://fastapi-ws-815644024160.us-west1.run.app/ping');
}, []);
```

## Modifications

### Add New Page Type

1. Update the type:
```typescript
const [activePage, setActivePage] = useState<
  "landing" | "education" | "project" | "personal" | "new-page"
>("landing");
```

2. Add case in metadata handler:
```typescript
case "new-page":
  setActivePage("new-page");
  break;
```

3. Add render condition:
```typescript
{activePage === "new-page" && <NewPage />}
```

### Customize Error Handling

Modify the `error` event handler:

```typescript
client.on("error", (error) => {
  console.error("Call error:", error);
  // Custom error handling
  toast({ title: "Error", description: "...", variant: "destructive" });
});
```

## Related Files

- [app-sidebar.md](app-sidebar.md) - Voice chat UI child component
- [../api/create-web-call.md](../api/create-web-call.md) - API endpoint called
- [../pages/](../pages/) - Page components rendered
