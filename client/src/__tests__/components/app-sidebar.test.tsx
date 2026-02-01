import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceChatSidebar } from '@/components/app-sidebar'

// Mock framer-motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useReducedMotion: () => false,
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('VoiceChatSidebar', () => {
  const defaultProps = {
    isCalling: false,
    startCall: vi.fn(),
    endCall: vi.fn(),
    isAgentTalking: false,
    transcript: [],
    chatMode: 'voice' as const,
    setChatMode: vi.fn(),
    sendTextMessage: vi.fn(),
    isTextLoading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the sidebar', () => {
      render(<VoiceChatSidebar {...defaultProps} />)
      
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Ask about my projects & experience')).toBeInTheDocument()
    })

    it('should show profile image', () => {
      render(<VoiceChatSidebar {...defaultProps} />)
      
      expect(screen.getByAltText('Bill Zhang')).toBeInTheDocument()
    })

    it('should show mode toggle switch', () => {
      render(<VoiceChatSidebar {...defaultProps} />)
      
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })
  })

  describe('voice mode', () => {
    it('should show start voice interaction button when not calling', () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" />)
      
      expect(screen.getByText('Start Voice Interaction')).toBeInTheDocument()
    })

    it('should call startCall when start button is clicked', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" />)
      
      const startButton = screen.getByText('Start Voice Interaction')
      await userEvent.click(startButton)
      
      expect(defaultProps.startCall).toHaveBeenCalledTimes(1)
    })

    it('should show pause/resume and end buttons when calling', () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" isCalling={true} />)
      
      expect(screen.getByText('Pause')).toBeInTheDocument()
      expect(screen.getByText('End')).toBeInTheDocument()
    })

    it('should call endCall when end button is clicked', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" isCalling={true} />)
      
      const endButton = screen.getByText('End')
      await userEvent.click(endButton)
      
      expect(defaultProps.endCall).toHaveBeenCalledTimes(1)
    })

    it('should show voice activity indicator when agent is talking', () => {
      render(
        <VoiceChatSidebar 
          {...defaultProps} 
          chatMode="voice" 
          isCalling={true}
          isAgentTalking={true} 
        />
      )
      
      expect(screen.getByLabelText('Bill is speaking')).toBeInTheDocument()
    })
  })

  describe('text mode', () => {
    it('should show text input when in text mode', () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" />)
      
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
      expect(screen.getByLabelText('Send message')).toBeInTheDocument()
    })

    it('should call sendTextMessage when send button is clicked', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" />)
      
      const input = screen.getByPlaceholderText('Type a message...')
      await userEvent.type(input, 'Hello')
      
      const sendButton = screen.getByLabelText('Send message')
      await userEvent.click(sendButton)
      
      expect(defaultProps.sendTextMessage).toHaveBeenCalledWith('Hello')
    })

    it('should call sendTextMessage when Enter is pressed', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" />)
      
      const input = screen.getByPlaceholderText('Type a message...')
      await userEvent.type(input, 'Hello{enter}')
      
      expect(defaultProps.sendTextMessage).toHaveBeenCalledWith('Hello')
    })

    it('should not send empty messages', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" />)
      
      const sendButton = screen.getByLabelText('Send message')
      await userEvent.click(sendButton)
      
      expect(defaultProps.sendTextMessage).not.toHaveBeenCalled()
    })

    it('should disable input and button when loading', () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" isTextLoading={true} />)
      
      expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled()
      expect(screen.getByLabelText('Send message')).toBeDisabled()
    })

    it('should show typing indicator when loading', () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" isTextLoading={true} />)
      
      expect(screen.getByText('AI is typing...')).toBeInTheDocument()
    })

    it('should clear input after sending', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="text" />)
      
      const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement
      await userEvent.type(input, 'Hello')
      expect(input.value).toBe('Hello')
      
      await userEvent.click(screen.getByLabelText('Send message'))
      
      expect(input.value).toBe('')
    })
  })

  describe('mode switching', () => {
    it('should call setChatMode when switch is toggled', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" />)
      
      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)
      
      expect(defaultProps.setChatMode).toHaveBeenCalledWith('text')
    })

    it('should end call when switching to text mode while calling', async () => {
      render(<VoiceChatSidebar {...defaultProps} chatMode="voice" isCalling={true} />)
      
      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)
      
      expect(defaultProps.endCall).toHaveBeenCalledTimes(1)
      expect(defaultProps.setChatMode).toHaveBeenCalledWith('text')
    })
  })

  describe('transcript display', () => {
    it('should display transcript entries', () => {
      const transcript = [
        { role: 'agent' as const, content: 'Hello! How can I help?' },
        { role: 'user' as const, content: 'Tell me about your projects' },
      ]
      
      render(<VoiceChatSidebar {...defaultProps} transcript={transcript} />)
      
      expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
      expect(screen.getByText('Tell me about your projects')).toBeInTheDocument()
    })

    it('should show agent avatar for agent messages', () => {
      const transcript = [
        { role: 'agent' as const, content: 'Hello!' },
      ]
      
      render(<VoiceChatSidebar {...defaultProps} transcript={transcript} />)
      
      const images = screen.getAllByAltText('Bill')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should show user icon for user messages', () => {
      const transcript = [
        { role: 'user' as const, content: 'Hello!' },
      ]
      
      render(<VoiceChatSidebar {...defaultProps} transcript={transcript} />)
      
      expect(screen.getByLabelText('You')).toBeInTheDocument()
    })
  })
})
