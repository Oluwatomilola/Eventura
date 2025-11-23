'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useWallet } from '@/hooks/useWallet'
import { ConnectButton } from '@/components/ConnectButton'
import { EventCreationWizard } from '@/components/events/EventCreationWizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Zap } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isOnBase } = useWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [isOrganizer, setIsOrganizer] = useState(false)

  // Check if user has organizer role (placeholder - implement real check)
  useEffect(() => {
    const checkOrganizerRole = async () => {
      if (!address) return
      
      // TODO: Implement real organizer role check
      // For now, assume any connected wallet can be an organizer
      setIsOrganizer(true)
    }
    
    checkOrganizerRole()
  }, [address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Connect Wallet Required
            </CardTitle>
            <CardDescription>
              Please connect your wallet to create an event
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOnBase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Switch to Base Network
            </CardTitle>
            <CardDescription>
              Event creation is only available on Base network
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {/* TODO: Add network switch button */}
            <p className="text-sm text-gray-600">
              Please switch your wallet to Base network to continue
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Organizer Access Required
            </CardTitle>
            <CardDescription>
              You need organizer permissions to create events
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Contact an administrator to get organizer access
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Event
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deploy your event to the blockchain with our simple 6-step wizard. 
              No blockchain knowledge required!
            </p>
          </div>

          <EventCreationWizard 
            onComplete={(eventId, txHash) => {
              console.log('Event created:', eventId, txHash)
              router.push(`/events/${eventId}`)
            }}
          />
        </div>
      </div>
    </div>
  )
}