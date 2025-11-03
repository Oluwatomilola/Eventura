'use client'

import { ConnectButton } from '@/components/ConnectButton'
import { motion } from 'framer-motion'
import { Calendar, Shield, Zap, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAccount } from 'wagmi'

const features = [
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Blockchain-powered ticketing ensures authenticity and prevents fraud'
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Buy, sell, and transfer tickets instantly on the Base network'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with event communities and discover new experiences'
  },
  {
    icon: Calendar,
    title: 'Easy Management',
    description: 'Manage all your event tickets in one secure digital wallet'
  }
]

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Eventura</span>
            </a>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-white hover:text-blue-400 transition-colors">
              Home
            </a>
            <a href="/calendar" className="text-white hover:text-blue-400 transition-colors">
              Calendar
            </a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors">
              Browse Events
            </a>
            <a href="#" className="text-white hover:text-blue-400 transition-colors">
              Create Event
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
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
          >
            The Future of
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {' '}Event Ticketing
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience seamless, secure, and transparent event ticketing powered by Base blockchain.
            No more fraud, no more fake tickets, just pure event magic.
          </motion.p>

          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <ConnectButton />
              <button className="flex items-center gap-2 px-6 py-3 text-white border border-white/30 rounded-xl hover:bg-white/10 transition-colors">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Grid - Animated */}
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

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Connect Wallet</h3>
              <p className="text-gray-300">Connect your Web3 wallet to get started</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Browse Events</h3>
              <p className="text-gray-300">Discover amazing events in your area</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Purchase Tickets</h3>
              <p className="text-gray-300">Buy tickets as NFTs on Base blockchain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Attend Event</h3>
              <p className="text-gray-300">Present your NFT ticket at the venue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Merged */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 px-6 py-20"
      >
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

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-300">Join thousands of users experiencing the future of event ticketing.</p>
          <ConnectButton />
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="/calendar" className="hover:text-white transition-colors">Calendar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Event</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Eventura. Built on Base with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
