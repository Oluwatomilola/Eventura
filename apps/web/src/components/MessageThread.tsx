'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCheck, User } from 'lucide-react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

interface Message {
  id: string
  from_wallet: string
  to_wallet: string
  content: string
  read_at?: string | null
  created_at: string
}

interface MessageThreadProps {
  messages: Message[]
  currentUserWallet: string
  otherUser: {
    display_name?: string
    avatar_ipfs_hash?: string
  }
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export function MessageThread({
  messages,
  currentUserWallet,
  otherUser,
  onLoadMore,
  hasMore = false,
  loading = false
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/')
      ? `${gateway}${ipfsHash}`
      : `${gateway}/${ipfsHash}`
  }

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  const formatDateDivider = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  const shouldShowDateDivider = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true
    return !isSameDay(new Date(currentMsg.created_at), new Date(prevMsg.created_at))
  }

  const isOwnMessage = (message: Message) => {
    return message.from_wallet.toLowerCase() === currentUserWallet.toLowerCase()
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-900/50 to-purple-900/20"
    >
      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const showDateDivider = shouldShowDateDivider(message, messages[index - 1])
        const own = isOwnMessage(message)

        return (
          <div key={message.id}>
            {/* Date divider */}
            {showDateDivider && (
              <div className="flex items-center justify-center my-6">
                <div className="px-4 py-1 bg-white/10 rounded-full">
                  <span className="text-xs text-white/60">
                    {formatDateDivider(message.created_at)}
                  </span>
                </div>
              </div>
            )}

            {/* Message bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${own ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar (only for other user) */}
              {!own && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                  {otherUser.avatar_ipfs_hash ? (
                    <img
                      src={getAvatarUrl(otherUser.avatar_ipfs_hash)}
                      alt={otherUser.display_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white/40" />
                  )}
                </div>
              )}

              {/* Message content */}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  own
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {/* Timestamp and read status */}
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    own ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span className={`text-xs ${own ? 'text-white/70' : 'text-white/50'}`}>
                    {formatMessageTime(message.created_at)}
                  </span>

                  {/* Read receipts (only for own messages) */}
                  {own && (
                    <span>
                      {message.read_at ? (
                        <CheckCheck className="w-3 h-3 text-white/70" />
                      ) : (
                        <Check className="w-3 h-3 text-white/50" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Spacer for own messages */}
              {own && <div className="w-8" />}
            </motion.div>
          </div>
        )
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
