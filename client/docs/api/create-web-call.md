# POST /api/create-web-call

Documentation for the Retell web call creation API route.

## File Location

`src/app/api/create-web-call/route.ts`

## Purpose

Server-side API route that proxies requests to Retell AI to create a new web call session. Returns an access token for the client to establish a WebRTC connection.

## Endpoint

```
POST /api/create-web-call
```

## Request

### Headers

```
Content-Type: application/json
```

### Body

```typescript
interface CreateWebCallRequest {
  agent_id: string;                              // Required: Retell agent ID
  metadata?: Record<string, string>;             // Optional: Call metadata
  retell_llm_dynamic_variables?: Record<string, string>;  // Optional: Dynamic vars
}
```

### Example

```json
{
  "agent_id": "agent_xxx",
  "metadata": {
    "session_started": "2024-01-15T10:30:00Z",
    "platform": "web"
  }
}
```

## Response

### Success (201 Created)

```typescript
interface RetellAIResponse {
  access_token: string;  // Token for WebRTC connection
  call_id: string;       // Unique call identifier
}
```

### Error (4xx/5xx)

```json
{
  "error": "Error message description"
}
```

### Error Codes

| Status | Cause |
|--------|-------|
| 400 | Missing `agent_id` |
| 401 | Invalid Retell API key |
| 500 | Retell API error or server error |

## Implementation Details

### CORS Headers

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### Retell API Call

```typescript
const response = await axios.post(
  'https://api.retellai.com/v2/create-web-call',
  payload,
  {
    headers: {
      Authorization: `Bearer ${process.env.RETELLAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
);
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `RETELLAI_API_KEY` | Yes | Retell API authentication (server-side only) |

## Client Usage

```typescript
// In page.tsx startCall()
const response = await fetch("/api/create-web-call", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent_id: process.env.NEXT_PUBLIC_RETELL_AGENT_ID,
    metadata: {
      session_started: new Date().toISOString(),
      platform: "web",
    },
  }),
});

const { access_token, call_id } = await response.json();

// Use access_token to start Retell call
await retellClient.startCall({ accessToken: access_token });
```

## Modifications

### Add Custom Metadata

Pass additional metadata in the request body:

```typescript
body: JSON.stringify({
  agent_id: agentId,
  metadata: {
    user_id: "user123",
    custom_field: "value",
  },
})
```

### Add Dynamic Variables

For Retell LLM dynamic variables:

```typescript
body: JSON.stringify({
  agent_id: agentId,
  retell_llm_dynamic_variables: {
    user_name: "John",
    context: "portfolio",
  },
})
```

### Restrict CORS

For production, update CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  // ...
};
```

## Related Files

- [../components/page.md](../components/page.md) - Calls this endpoint in `startCall()`
- `src/types/api.ts` - Type definitions
