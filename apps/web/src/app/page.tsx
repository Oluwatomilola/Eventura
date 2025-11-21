'use client'

import { ConnectButton } from '@/components/ConnectButton'
import { RecommendedEvents } from '@/components/RecommendedEvents'
import { motion } from 'framer-motion'
import { Calendar, Shield, Zap, Users, ArrowRight, Sparkles, Settings } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useOnchainEvents } from '@/hooks/useOnchainEvents'

const features = [
  {
    icon: Shield,
    title: 'SECURE & TRANSPARENT',
    description: 'Blockchain-powered ticketing ensures authenticity and prevents fraud'
  },
  {
    icon: Zap,
    title: 'INSTANT TRANSFERS',
    description: 'Buy, sell, and transfer tickets instantly on the Base network'
  },
  {
    icon: Users,
    title: 'COMMUNITY DRIVEN',
    description: 'Connect with event communities and discover new experiences'
  },
  {
    icon: Calendar,
    title: 'EASY MANAGEMENT',
    description: 'Manage all your event tickets in one secure digital wallet'
  }
]

export default function Home() {
  const { isConnected } = useAccount()
  const { events, loading } = useOnchainEvents()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      {/* Grid Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">EVENTURA</span>
            </a>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              HOME
            </a>
            <a href="/calendar" className="text-zinc-400 hover:text-white transition-colors">
              CALENDAR
            </a>
            <a href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              DASHBOARD
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">
              BROWSE
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">
              CREATE
            </a>
            <a href="/settings" className="text-zinc-400 hover:text-white transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ConnectButton />
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-32 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-wider"
            >
              SYSTEM: ONLINE // BASE NETWORK
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold text-white mb-8 leading-none tracking-tight"
            >
              THE FUTURE OF
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                EVENT TICKETING
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed border-l-2 border-zinc-800 pl-6"
            >
              Seamless, secure, and transparent event ticketing on the blockchain.
              Fraud eliminated. Authenticity guaranteed.
            </motion.p>

            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <ConnectButton />
                <button className="h-[50px] flex items-center gap-2 px-8 bg-transparent border border-zinc-700 text-white hover:bg-zinc-900 hover:border-white transition-all font-medium">
                  LEARN MORE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-32 border-b border-zinc-800/50 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">SYSTEM FEATURES</h2>
            <div className="h-px flex-1 bg-zinc-800 ml-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-cyan-500/50 transition-colors">
                  <feature.icon className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Events Section (on-chain) */}
      <RecommendedEvents
        allEvents={events}
        className="relative z-10 py-32 border-b border-zinc-800/50"
        limit={6}
      />

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-32 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">PROTOCOL</h2>
            <div className="h-px flex-1 bg-zinc-800 ml-8"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'CONNECT', desc: 'Link your Web3 wallet' },
              { step: '02', title: 'BROWSE', desc: 'Find local events' },
              { step: '03', title: 'ACQUIRE', desc: 'Purchase NFT tickets' },
              { step: '04', title: 'ATTEND', desc: 'Verify and enter' }
            ].map((item) => (
              <div key={item.step} className="relative p-6 border-l border-zinc-800 hover:border-cyan-500 transition-colors duration-300">
                <span className="text-4xl font-bold text-zinc-800 mb-4 block font-mono">{item.step}</span>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wider">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-32 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
            {[
              { label: 'EVENTS CREATED', value: '10K+' },
              { label: 'TICKETS SOLD', value: '50K+' },
              { label: 'FRAUD PREVENTION', value: '99.9%' }
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-950 p-12 text-center hover:bg-zinc-900/80 transition-colors">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-sm text-cyan-500 font-mono tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">INITIATE CONNECTION</h2>
          <p className="text-xl mb-12 text-zinc-400">Join the network. Experience the future of ticketing.</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">EVENTURA</h3>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Decentralized ticketing protocol on Base.
                <br />Secure. Transparent. Verified.
              </p>
            </div>
            
            {[
              { title: 'PLATFORM', links: ['Calendar', 'Browse Events', 'Create Event'] },
              { title: 'RESOURCES', links: ['Documentation', 'Support', 'FAQ'] },
              { title: 'COMMUNITY', links: ['Twitter', 'Discord', 'GitHub'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-mono text-sm text-zinc-500 mb-6 tracking-wider">{col.title}</h4>
                <ul className="space-y-3 text-sm font-medium text-zinc-300">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-cyan-400 transition-colors uppercase tracking-wide">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 font-mono">
            <p>&copy; 2025 EVENTURA PROTOCOL. BASE NETWORK.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-400">PRIVACY</a>
              <a href="#" className="hover:text-zinc-400">TERMS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
