'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ConversationList } from '@/components/ConversationList'
import { MessageThread } from '@/components/MessageThread'
import { MessageInput } from '@/components/MessageInput'
import { createServerClient } from '@/lib/supabase'

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

interface Message {
  id: string
  from_wallet: string
  to_wallet: string
  content: string
  read_at?: string | null
  created_at: string
}

export default function MessagesPage() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // Fetch conversations
  useEffect(() => {
    if (address) {
      fetchConversations()
    }
  }, [address])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!address || !selectedConversation) return

    const supabase = createServerClient()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(from_wallet=eq.${address.toLowerCase()},to_wallet=eq.${selectedConversation.otherUser.wallet_address}),and(from_wallet=eq.${selectedConversation.otherUser.wallet_address},to_wallet=eq.${address.toLowerCase()}))`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [address, selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data for now - in production, this would fetch from API
      // const response = await fetch(`/api/conversations?wallet=${address}`)
      // const data = await response.json()

      // Temporary mock data
      setConversations([])
    } catch (err: any) {
      console.error('Fetch conversations error:', err)
      setError(err.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (connectionId: string) => {
    try {
      setMessagesLoading(true)

      const response = await fetch(
        `/api/messages?connectionId=${connectionId}&wallet=${address}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch messages')
      }

      setMessages(data.data.reverse()) // Reverse to show oldest first
    } catch (err: any) {
      console.error('Fetch messages error:', err)
      setError(err.message || 'Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !address) return

    try {
      // Generate message for signing
      const timestamp = Date.now()
      const signMessage = `Sign this message to authenticate with Eventura\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

      // Sign the message
      const signature = await signMessageAsync({ message: signMessage })

      // Send message
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_wallet: address,
          to_wallet: selectedConversation.otherUser.wallet_address,
          event_id: selectedConversation.event?.id,
          content,
          message: signMessage,
          signature
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Message will be added via realtime subscription
    } catch (err: any) {
      console.error('Send message error:', err)
      throw err
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Please connect your wallet to access messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations sidebar - Desktop */}
          <div className="hidden md:block w-80 flex-shrink-0">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={setSelectedConversation}
              />
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {selectedConversation.otherUser.display_name || 'Anonymous User'}
                      </h2>
                      {selectedConversation.event && (
                        <p className="text-sm text-white/60">
                          {selectedConversation.event.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages thread */}
                {messagesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <MessageThread
                    messages={messages}
                    currentUserWallet={address!}
                    otherUser={selectedConversation.otherUser}
                  />
                )}

                {/* Message input */}
                <MessageInput
                  onSend={handleSendMessage}
                  disabled={messagesLoading}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    No conversation selected
                  </h2>
                  <p className="text-white/70">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
