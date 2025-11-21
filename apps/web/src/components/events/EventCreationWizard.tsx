'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { DateTimeLocationStep } from './steps/DateTimeLocationStep'
import { TicketingStep } from './steps/TicketingStep'
import { MediaStep } from './steps/MediaStep'
import { MultiLanguageStep } from './steps/MultiLanguageStep'
import { ReviewDeployStep } from './steps/ReviewDeployStep'
import { useEventCreation } from '@/hooks/useEventCreation'
import { useDraftSaving } from '@/hooks/useDraftSaving'
import { eventFormSchema } from '@/lib/validation/event'

const STEPS = [
  { id: 1, title: 'Basic Information', description: 'Event title, category, and description' },
  { id: 2, title: 'Date & Location', description: 'When and where your event takes place' },
  { id: 3, title: 'Ticketing', description: 'Price, capacity, and ticket settings' },
  { id: 4, title: 'Media', description: 'Cover image and additional media' },
  { id: 5, title: 'Multi-Language', description: 'Add translations (optional)' },
  { id: 6, title: 'Review & Deploy', description: 'Final review and blockchain deployment' },
]

export interface EventFormData {
  // Basic Info
  title: string
  category: string
  shortDescription: string
  fullDescription: string
  
  // Date & Location
  startDateTime: string
  endDateTime: string
  locationType: 'physical' | 'virtual' | 'hybrid'
  address?: string
  city?: string
  country?: string
  meetingLink?: string
  
  // Ticketing
  ticketPrice: number
  capacity: number
  maxTicketsPerWallet?: number
  enableWaitlist: boolean
  refundPolicy: string
  
  // Media
  coverImageUrl: string
  additionalImages: string[]
  videoUrl?: string
  
  // Multi-Language
  translations: Record<string, {
    title: string
    shortDescription: string
    fullDescription: string
  }>
}

interface EventCreationWizardProps {
  onComplete: (eventId: string, txHash: string) => void
}

export function EventCreationWizard({ onComplete }: EventCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<EventFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { createEvent } = useEventCreation()
  const { saveDraft, isDraftSaving } = useDraftSaving()

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormDataChange = (stepData: Partial<EventFormData>) => {
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
  }

  const handleSaveDraft = async () => {
    await saveDraft(formData as EventFormData)
  }

  const handleDeploy = async () => {
    if (!formData || !validateCurrentStep()) return
    
    try {
      setIsSubmitting(true)
      
      // Validate form data
      const validatedData = eventFormSchema.parse(formData)
      
      // Create event via API
      const result = await createEvent(validatedData)
      
      if (result.success && result.eventId) {
        onComplete(result.eventId, result.txHash || '')
      }
    } catch (error) {
      console.error('Failed to deploy event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateCurrentStep = (): boolean => {
    // Implement step-specific validation
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.category && formData.shortDescription && formData.fullDescription)
      case 2:
        return !!(formData.startDateTime && formData.endDateTime && formData.locationType)
      case 3:
        return !!(formData.ticketPrice && formData.capacity)
      case 4:
        return !!formData.coverImageUrl
      default:
        return true
    }
  }

  const renderStep = () => {
    const commonProps = {
      formData: formData as EventFormData,
      onChange: handleFormDataChange,
      onNext: handleNext,
      onPrevious: handlePrevious,
    }

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...commonProps} />
      case 2:
        return <DateTimeLocationStep {...commonProps} />
      case 3:
        return <TicketingStep {...commonProps} />
      case 4:
        return <MediaStep {...commonProps} />
      case 5:
        return <MultiLanguageStep {...commonProps} />
      case 6:
        return <ReviewDeployStep 
          {...commonProps}
          onDeploy={handleDeploy}
          isDeploying={isSubmitting}
        />
      default:
        return null
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{STEPS[currentStep - 1].title}</span>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}
            </span>
          </CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                <span className="mt-1 hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isDraftSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isDraftSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!validateCurrentStep()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleDeploy}
              disabled={isSubmitting || !validateCurrentStep()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Deploying...' : 'Deploy Event'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}