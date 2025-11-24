'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, Download, Share2, ExternalLink, QrCode, RefreshCw, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'
import { formatEventDate } from '@/utils/multilang'
import { useOnboardingStore } from '@/store/useOnboardingStore'

// TODO: Update with actual deployed contract address on Base L2
const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

export interface TicketData {
  ticketId: bigint
  eventId: bigint
  owner: string
  used: boolean
  purchaseTime: bigint
  event: EventWithMetadata
}

interface TicketCardProps {
  ticket: TicketData
  language?: LanguageCode
  onTransferSuccess?: () => void
  onRefundSuccess?: () => void
  compact?: boolean
}

export function TicketCard({
  ticket,
  language = detectUserLanguage(),
  onTransferSuccess,
  onRefundSuccess,
  compact = false
}: TicketCardProps) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { markMilestone } = useOnboardingStore()

  const [showQR, setShowQR] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translation = getTranslation(ticket.event.metadata, language)

  // Check if event has started or ended
  const now = Date.now() / 1000
  const hasStarted = now >= Number(ticket.event.startTime)
  const hasEnded = now >= Number(ticket.event.endTime)
  const canRefund = !hasStarted && !ticket.used

  // Generate QR code data
  const qrData = JSON.stringify({
    ticketId: ticket.ticketId.toString(),
    eventId: ticket.eventId.toString(),
    owner: ticket.owner,
    contract: EVENT_TICKETING_ADDRESS,
    network: 'base',
  })

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-${ticket.ticketId}`) as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `ticket-${ticket.ticketId}.png`
    link.href = url
    link.click()
  }

  const handleTransfer = async () => {
    if (!walletClient || !address || !publicClient) {
      setError('Wallet not connected')
      return
    }

    if (!transferAddress || transferAddress.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // TODO: Replace with actual contract call
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'safeTransferFrom',
      //   args: [address, transferAddress, ticket.ticketId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowTransferModal(false)
      onTransferSuccess?.()
      alert('Ticket transferred successfully!')

    } catch (err: any) {
      console.error('Transfer error:', err)
      setError(err.message || 'Failed to transfer ticket')
    } finally {
      setProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (!walletClient || !address || !publicClient) {
      alert('Wallet not connected')
      return
    }

    if (!confirm('Are you sure you want to refund this ticket? This action cannot be undone.')) {
      return
    }

    setProcessing(true)

    try {
      // TODO: Replace with actual contract call
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'refundTicket',
      //   args: [ticket.ticketId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))

      onRefundSuccess?.()
      alert('Ticket refunded successfully!')

    } catch (err: any) {
      console.error('Refund error:', err)
      alert(err.message || 'Failed to refund ticket')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-zinc-950 border border-zinc-800 hover:border-cyan-500/30 overflow-hidden transition-colors group"
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {ticket.used ? (
            <span className="px-3 py-1 bg-zinc-800 border border-zinc-600 text-zinc-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              CONSUMED
            </span>
          ) : hasEnded ? (
            <span className="px-3 py-1 bg-red-900/30 border border-red-500/30 text-red-500 text-xs font-mono uppercase tracking-wider">
              EXPIRED
            </span>
          ) : hasStarted ? (
            <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-500 text-xs font-mono uppercase tracking-wider animate-pulse">
              ACTIVE_EVENT
            </span>
          ) : (
            <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
              VALID_ASSET
            </span>
          )}
        </div>

        {/* Event Image Header */}
        {ticket.event.metadata.media?.coverImage && (
          <div className="relative h-32 overflow-hidden border-b border-zinc-800">
            <img
              src={ticket.event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={translation.name}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          </div>
        )}

        {/* Ticket Content */}
        <div className="p-6">
          {/* Ticket ID */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Asset_ID</span>
            </div>
            <span className="text-sm font-mono font-bold text-white">#{ticket.ticketId.toString()}</span>
          </div>

          {/* Event Details */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{translation.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <Calendar className="w-3 h-3 text-cyan-600" />
                <span>{formatEventDate(ticket.event.startTime, language)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <MapPin className="w-3 h-3 text-cyan-600" />
                <span>{translation.location}</span>
              </div>
            </div>
          </div>

          {/* NFT Info */}
          <div className="mb-6 p-3 bg-zinc-900/50 border border-zinc-800 font-mono text-[10px]">
            <div className="flex justify-between mb-1">
              <span className="text-zinc-600 uppercase">Contract</span>
              <span className="text-zinc-400">{EVENT_TICKETING_ADDRESS.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-zinc-600 uppercase">Owner</span>
              <span className="text-zinc-400">{ticket.owner.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 uppercase">Network</span>
              <span className="text-cyan-500">BASE L2</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div role="region" aria-live="polite" aria-atomic="true">
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 p-4 bg-white rounded-none border-2 border-white flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                tabIndex={-1}
                aria-labelledby={`qr-title-${ticket.ticketId}`}
              >
                <QRCodeSVG
                  id={`qr-${ticket.ticketId}`}
                  value={qrData}
                  size={200}
                  level="H"
                  includeMargin={false}
                  aria-label={`QR Code for ticket #${ticket.ticketId}`}
                  role="img"
                />
                <p 
                  id={`qr-title-${ticket.ticketId}`}
                  className="text-[10px] font-mono text-black mt-2 text-center uppercase tracking-widest"
                >
                  Scan for Entry Verification
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-mono uppercase hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors w-full justify-center"
                  aria-label={`Download QR code for ticket #${ticket.ticketId}`}
                >
                  <Download className="w-3 h-3" aria-hidden="true" />
                  <span>Save_IMG</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowQR(!showQR);
                // Focus on the QR code when shown for better keyboard navigation
                if (!showQR) {
                  setTimeout(() => {
                    const qrElement = document.getElementById(`qr-${ticket.ticketId}`)?.parentElement;
                    if (qrElement) {
                      qrElement.setAttribute('tabindex', '-1');
                      qrElement.focus();
                    }
                  }, 100);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold font-mono uppercase tracking-wider border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-all"
              aria-expanded={showQR}
              aria-controls={`qr-${ticket.ticketId}`}
              aria-label={`${showQR ? 'Hide' : 'Show'} QR code for ticket #${ticket.ticketId}`}
            >
              <QrCode className="w-3 h-3" aria-hidden="true" />
              <span>{showQR ? 'Hide' : 'Show'}_QR</span>
            </button>

            <Link
              href={`/events/${ticket.eventId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold font-mono uppercase tracking-wider border border-zinc-700 hover:border-zinc-500 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Event_Data
            </Link>

            <button
              onClick={() => setShowTransferModal(true)}
              disabled={ticket.used || hasStarted || processing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider border border-cyan-900 hover:border-cyan-500 transition-all"
            >
              <Share2 className="w-3 h-3" />
              Transfer
            </button>

            <button
              onClick={handleRefund}
              disabled={!canRefund || processing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 text-xs font-bold font-mono uppercase tracking-wider border border-red-900 hover:border-red-500 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Refund
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 rounded-none max-w-md w-full p-6 border border-cyan-500/30 shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)]"
          >
            <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wide">Transfer Asset</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-6 font-mono leading-relaxed">
              WARNING: Transferring this NFT is irreversible. Ensure the recipient address supports Base L2 assets.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-widest">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-mono">
                ERROR: {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferAddress('')
                  setError(null)
                }}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Abort
              </button>
              <button
                onClick={handleTransfer}
                disabled={processing || !transferAddress}
                className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900/50 text-zinc-950 font-bold font-mono uppercase tracking-wider transition-all disabled:cursor-not-allowed"
              >
                {processing ? 'EXECUTING...' : 'CONFIRM_TRANSFER'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
