'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Shield, Zap, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { RecommendedEvents } from '@/components/RecommendedEvents'
import { sampleEvents } from '@/data/sampleEvents'

const features = [
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Blockchain-powered ticketing ensures authenticity and prevents fraud',
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Buy, sell, and transfer tickets instantly on the Base network',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with event communities and discover new experiences',
  },
  {
    icon: Calendar,
    title: 'Easy Management',
    description: 'Manage all your event tickets in one secure digital wallet',
  },
]

export function HomePageContent() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between" aria-label="Primary">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Eventura home">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Eventura</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/calendar" className="text-white hover:text-blue-400 transition-colors">
              Calendar
            </Link>
            <Link href="/events" className="text-white hover:text-blue-400 transition-colors">
              Browse Events
            </Link>
            <Link href="/recommendations-demo" className="text-white hover:text-blue-400 transition-colors">
              Recommendations
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <ConnectButton />
          </motion.div>
        </nav>
      </header>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
          >
            Connect with attendees before you arrive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience seamless, secure, and transparent event ticketing powered by Base blockchain. Buy NFT tickets, create personas, and start networking ahead of the gate.
          </motion.p>

          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <ConnectButton />
              <Link
                href="/events"
                className="flex items-center gap-2 px-6 py-3 text-white border border-white/30 rounded-xl hover:bg-white/10 transition-colors"
              >
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-6 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">Why Choose Eventura?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <RecommendedEvents allEvents={sampleEvents} className="relative z-10" limit={6} />

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {['Connect Wallet', 'Browse Events', 'Purchase Tickets', 'Attend Event'].map((step, index) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{step}</h3>
                <p className="text-gray-300">
                  {index === 0 && 'Connect your Web3 wallet to get started'}
                  {index === 1 && 'Discover amazing events in your area'}
                  {index === 2 && 'Buy verified NFT tickets on Base'}
                  {index === 3 && 'Skip the line with on-chain credentials'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">10K+</div>
                <div className="text-xl text-gray-300">Events Created</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">50K+</div>
                <div className="text-xl text-gray-300">Tickets Sold</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">99.9%</div>
                <div className="text-xl text-gray-300">Fraud Prevention</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-300">Join thousands of users experiencing the future of event ticketing.</p>
          <ConnectButton />
        </div>
      </section>

      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Eventura</h3>
              </div>
              <p className="text-gray-400">Decentralized ticketing on Base blockchain</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/calendar" className="hover:text-white transition-colors">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-white transition-colors">
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link href="/recommendations-demo" className="hover:text-white transition-colors">
                    Recommendation Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/performance" className="hover:text-white transition-colors">
                    Performance Dashboard
                  </Link>
                </li>
                <li>
                  <a href="https://github.com/EventuraHQ" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/eventura" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://twitter.com/eventura_app" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/eventura" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/eventura" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Eventura. Built on Base with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

