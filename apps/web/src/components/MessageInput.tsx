'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const maxLength = 2000
  const charsRemaining = maxLength - content.length

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return

    try {
      setSending(true)
      await onSend(content.trim())
      setContent('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setContent(value)

      // Auto-resize textarea
      e.target.style.height = 'auto'
      const maxHeight = 120 // ~5 lines
      const newHeight = Math.min(e.target.scrollHeight, maxHeight)
      e.target.style.height = `${newHeight}px`
    }
  }

  const getCharCountColor = () => {
    if (charsRemaining < 100) return 'text-red-400'
    if (charsRemaining < 500) return 'text-yellow-400'
    return 'text-white/40'
  }

  return (
    <div className="p-4 border-t border-white/10 bg-white/5">
      <div className="flex items-end gap-3">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || sending}
            rows={1}
            className="w-full px-4 py-3 pr-16 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          {/* Character count */}
          {content.length > 0 && (
            <div className={`absolute right-3 bottom-3 text-xs ${getCharCountColor()}`}>
              {charsRemaining}
            </div>
          )}
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled || charsRemaining < 0}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Sending
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send
            </>
          )}
        </motion.button>
      </div>

      {/* Helper text */}
      <div className="mt-2 text-xs text-white/40">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}
