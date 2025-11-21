'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { Wallet, Ticket, List, AlertCircle, Sparkles } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'
import { TicketCard, type TicketData } from '@/components/TicketCard'
import { WaitlistManagement } from '@/components/WaitlistManagement'
import type { EventWithMetadata } from '@/types/multilang-event'
import { fetchEventMetadata } from '@/utils/multilang'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tickets' | 'waitlists'>('tickets')

  // Fetch user tickets
  useEffect(() => {
    async function fetchUserAssets() {
      if (!isConnected || !publicClient || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Mock data for development until contract integration is complete
        // In production, we would fetch from the contract using:
        // contract.read.getTicketsOfOwner([address])
        
        // Mock fetch delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockTickets: TicketData[] = []
        // Simulate empty state for now unless we want to mock data
        // mockTickets.push({ ... }) 

        setTickets(mockTickets)
      } catch (err) {
        console.error('Error fetching assets:', err)
        setError('Failed to load asset data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAssets()
  }, [isConnected, publicClient, address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Grid Background */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }} 
        />
        
        <div className="relative z-10 bg-zinc-900/50 border border-zinc-800 p-12 rounded-lg text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Access Denied</h1>
          <p className="text-zinc-400 mb-8 font-mono text-sm">
            Connect your wallet to view your digital assets and event status.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30 pb-20">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-mono uppercase">Dashboard</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm font-mono text-zinc-400 hover:text-white transition-colors uppercase">Home</a>
            <ConnectButton />
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Assets</p>
            <p className="text-3xl font-bold text-white">{tickets.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Waitlists</p>
            <p className="text-3xl font-bold text-white">0</p> {/* Dynamic later */}
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Network Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-lg font-bold text-cyan-500">ONLINE</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'tickets'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('waitlists')}
            className={`px-6 py-3 text-sm font-mono uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'waitlists'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Waitlist Status
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'tickets' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-cyan-500 font-mono text-sm animate-pulse">RETRIEVING_ASSETS...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.ticketId.toString()} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-12 text-center rounded-lg">
                <Ticket className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">No Tickets Found</h3>
                <p className="text-zinc-500 mb-8 font-mono text-sm max-w-md mx-auto">
                  Your digital wallet does not contain any event credentials. Browse the network to acquire access tokens.
                </p>
                <a
                  href="/calendar"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold font-mono uppercase tracking-wider transition-all"
                >
                  Browse_Events
                </a>
              </div>
            )
          ) : (
            <WaitlistManagement />
          )}
        </div>
      </main>
    </div>
  )
}

