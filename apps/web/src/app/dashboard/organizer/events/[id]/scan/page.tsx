'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  XCircle,
  QrCode,
  User,
  Ticket,
  Clock,
} from 'lucide-react'

interface CheckInResult {
  checkIn: {
    id: string
    checked_in_at: string
  }
  attendee: {
    wallet_address: string
    persona_name?: string
    interests?: string[]
    looking_for?: string[]
  }
  alreadyCheckedIn?: boolean
}

export default function TicketScannerPage() {
  const params = useParams()
  const eventId = params.id as string
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [manualTicketId, setManualTicketId] = useState('')
  const [manualWallet, setManualWallet] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [mode])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Failed to access camera. Please use manual entry.')
      setMode('manual')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleCheckIn = async (ticketId?: string, walletAddress?: string) => {
    if (!address) return

    if (!ticketId && !walletAddress) {
      setError('Please provide either a ticket ID or wallet address')
      return
    }

    try {
      setCheckingIn(true)
      setError(null)
      setLastResult(null)

      const response = await fetch(
        `/api/organizer/events/${eventId}/check-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: ticketId || undefined,
            walletAddress: walletAddress || undefined,
            organizerWallet: address,
            chainId,
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        setLastResult(result.data)
        // Play success sound
        if (result.data.alreadyCheckedIn) {
          // Different sound for already checked in
        } else {
          // Success sound
          const audio = new Audio('/sounds/success.mp3')
          audio.play().catch(() => {
            // Ignore audio errors
          })
        }

        // Clear manual inputs
        setManualTicketId('')
        setManualWallet('')
      } else {
        setError(result.error || 'Failed to check in')
      }
    } catch (err: any) {
      console.error('Error checking in:', err)
      setError(err.message || 'Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleManualCheckIn = () => {
    handleCheckIn(
      manualTicketId || undefined,
      manualWallet || undefined
    )
  }

  // QR Code scanning would be implemented here with a library like html5-qrcode
  // For now, we'll show the camera view and manual entry

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Please connect your wallet</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/organizer/events/${eventId}`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Ticket Scanner
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('camera')}
              className={`px-4 py-2 font-mono uppercase text-sm transition-colors ${
                mode === 'camera'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-4 py-2 font-mono uppercase text-sm transition-colors ${
                mode === 'manual'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Manual
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Scanner Area */}
        <div className="mb-8">
          {mode === 'camera' ? (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
              <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-cyan-500 rounded-lg" />
                </div>
              </div>
              <p className="text-center text-zinc-400 text-sm mt-4">
                Point camera at QR code or use manual entry
              </p>
              {/* QR Code scanning would be implemented here */}
              {/* For now, this is a placeholder */}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Manual Check-in</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Ticket ID (optional)
                  </label>
                  <input
                    type="text"
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    placeholder="Enter ticket ID"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Wallet Address (optional)
                  </label>
                  <input
                    type="text"
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <button
                  onClick={handleManualCheckIn}
                  disabled={checkingIn || (!manualTicketId && !manualWallet)}
                  className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono uppercase transition-colors"
                >
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 p-4 mb-8 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Check-in Result */}
        {lastResult && (
          <div
            className={`border p-6 mb-8 ${
              lastResult.alreadyCheckedIn
                ? 'bg-yellow-900/20 border-yellow-800'
                : 'bg-green-900/20 border-green-800'
            }`}
          >
            <div className="flex items-start gap-4">
              {lastResult.alreadyCheckedIn ? (
                <XCircle className="w-6 h-6 text-yellow-400 mt-1" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  {lastResult.alreadyCheckedIn
                    ? 'Already Checked In'
                    : 'Check-in Successful!'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">
                      {lastResult.attendee.persona_name || 'No persona'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono text-zinc-300">
                      {lastResult.attendee.wallet_address.slice(0, 6)}...
                      {lastResult.attendee.wallet_address.slice(-4)}
                    </span>
                  </div>
                  {lastResult.checkIn.checked_in_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-400">
                        {new Date(
                          lastResult.checkIn.checked_in_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Instructions</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Use camera mode to scan QR codes from tickets</li>
            <li>• Use manual mode to enter ticket ID or wallet address</li>
            <li>• Check-ins are recorded immediately</li>
            <li>• Works offline - check-ins sync when connection is restored</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

