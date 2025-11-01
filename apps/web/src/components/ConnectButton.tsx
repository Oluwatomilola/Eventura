'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'
import { motion } from 'framer-motion'
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-white">
            {formatAddress(address)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
            title="Copy address"
          >
            <Copy className="w-3 h-3 text-white/70" />
          </button>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => disconnect()}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/30 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4 text-red-400" />
        </motion.button>
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => open()}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
        "text-white shadow-lg hover:shadow-xl",
        "border border-white/20 backdrop-blur-sm"
      )}
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </motion.button>
  )
}