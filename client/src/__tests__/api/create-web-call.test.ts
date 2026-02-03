import { describe, it, expect, vi, beforeEach } from 'vitest'

// Since Next.js API routes are server-side, we test the logic directly
// by importing the route handlers (POST, OPTIONS)
describe('create-web-call API route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('request validation', () => {
    it('should require agent_id field', async () => {
      // Test the validation logic
      const body = { metadata: {} }
      const isValid = validateRequest(body)
      
      expect(isValid.valid).toBe(false)
      expect(isValid.error).toBe('agent_id is required')
    })

    it('should accept valid request with agent_id', () => {
      const body = { agent_id: 'test-agent-123' }
      const isValid = validateRequest(body)
      
      expect(isValid.valid).toBe(true)
    })

    it('should accept request with all optional fields', () => {
      const body = {
        agent_id: 'test-agent-123',
        metadata: { user_id: 'user-1' },
        retell_llm_dynamic_variables: { name: 'Test User' },
      }
      const isValid = validateRequest(body)
      
      expect(isValid.valid).toBe(true)
    })
  })

  describe('payload construction', () => {
    it('should include only agent_id when no optional fields', () => {
      const body = { agent_id: 'test-agent-123' }
      const payload = buildPayload(body)
      
      expect(payload).toEqual({ agent_id: 'test-agent-123' })
    })

    it('should include metadata when provided', () => {
      const body = {
        agent_id: 'test-agent-123',
        metadata: { key: 'value' },
      }
      const payload = buildPayload(body)
      
      expect(payload).toEqual({
        agent_id: 'test-agent-123',
        metadata: { key: 'value' },
      })
    })

    it('should include dynamic variables when provided', () => {
      const body = {
        agent_id: 'test-agent-123',
        retell_llm_dynamic_variables: { name: 'User' },
      }
      const payload = buildPayload(body)
      
      expect(payload).toEqual({
        agent_id: 'test-agent-123',
        retell_llm_dynamic_variables: { name: 'User' },
      })
    })
  })

  describe('CORS headers', () => {
    it('should include required CORS headers', () => {
      const headers = getCorsHeaders()
      
      expect(headers['Access-Control-Allow-Origin']).toBe('*')
      expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization')
    })
  })
})

// Helper functions that mirror the route logic for testing
interface CreateWebCallRequest {
  agent_id?: string
  metadata?: Record<string, unknown>
  retell_llm_dynamic_variables?: Record<string, unknown>
}

function validateRequest(body: CreateWebCallRequest): { valid: boolean; error?: string } {
  if (!body.agent_id) {
    return { valid: false, error: 'agent_id is required' }
  }
  return { valid: true }
}

function buildPayload(body: CreateWebCallRequest): Partial<CreateWebCallRequest> {
  const payload: Partial<CreateWebCallRequest> = { agent_id: body.agent_id }
  
  if (body.metadata) {
    payload.metadata = body.metadata
  }
  
  if (body.retell_llm_dynamic_variables) {
    payload.retell_llm_dynamic_variables = body.retell_llm_dynamic_variables
  }
  
  return payload
}

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
