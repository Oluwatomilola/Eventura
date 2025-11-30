'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  id: string
  otherUser: {
    wallet_address: string
    display_name?: string
    avatar_ipfs_hash?: string
  }
  lastMessage: {
    content: string
    created_at: string
    from_wallet: string
  }
  unreadCount: number
  event?: {
    id: number
    name: string
  }
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/')
      ? `${gateway}${ipfsHash}`
      : `${gateway}/${ipfsHash}`
  }

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <div className="h-full flex flex-col bg-white/5 border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onClick={() => onSelect(conversation)}
              className={`w-full p-4 flex items-start gap-3 border-b border-white/10 transition-colors text-left ${
                selectedId === conversation.id ? 'bg-white/10' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center">
                  {conversation.otherUser.avatar_ipfs_hash ? (
                    <img
                      src={getAvatarUrl(conversation.otherUser.avatar_ipfs_hash)}
                      alt={conversation.otherUser.display_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white/40" />
                  )}
                </div>

                {/* Unread badge */}
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate">
                    {conversation.otherUser.display_name || 'Anonymous User'}
                  </h3>
                  <span className="text-xs text-white/50 flex-shrink-0 ml-2">
                    {formatTimestamp(conversation.lastMessage.created_at)}
                  </span>
                </div>

                {/* Last message preview */}
                <p className="text-sm text-white/70 truncate mb-1">
                  {conversation.lastMessage.content.substring(0, 50)}
                  {conversation.lastMessage.content.length > 50 && '...'}
                </p>

                {/* Event context */}
                {conversation.event && (
                  <span className="inline-block px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    {conversation.event.name}
                  </span>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}
