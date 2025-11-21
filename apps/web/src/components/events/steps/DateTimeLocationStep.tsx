'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DateTimeLocationStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function DateTimeLocationStep({ formData, onChange, onNext, onPrevious }: DateTimeLocationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    onChange(updated)
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.startDateTime) {
      newErrors.startDateTime = 'Start date/time is required'
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = 'End date/time is required'
    }

    if (formData.startDateTime && formData.endDateTime) {
      const startTime = new Date(formData.startDateTime).getTime()
      const endTime = new Date(formData.endDateTime).getTime()
      const now = Date.now()

      if (startTime <= now) {
        newErrors.startDateTime = 'Start time must be in the future'
      }
      if (endTime <= startTime) {
        newErrors.endDateTime = 'End time must be after start time'
      }
    }

    if (!formData.locationType) {
      newErrors.locationType = 'Location type is required'
    } else {
      if (formData.locationType === 'physical' || formData.locationType === 'hybrid') {
        if (!formData.address) newErrors.address = 'Address is required for physical locations'
        if (!formData.city) newErrors.city = 'City is required for physical locations'
        if (!formData.country) newErrors.country = 'Country is required for physical locations'
      }
      if (formData.locationType === 'virtual' || formData.locationType === 'hybrid') {
        if (!formData.meetingLink) newErrors.meetingLink = 'Meeting link is required for virtual events'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date, Time & Location</CardTitle>
          <CardDescription>
            When and where will your event take place?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startDateTime || ''}
                onChange={(e) => handleInputChange('startDateTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDateTime && <p className="text-sm text-red-600">{errors.startDateTime}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endDateTime || ''}
                onChange={(e) => handleInputChange('endDateTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDateTime && <p className="text-sm text-red-600">{errors.endDateTime}</p>}
            </div>
          </div>

          {/* Location Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Location Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['physical', 'virtual', 'hybrid'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('locationType', type)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    formData.locationType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-sm text-gray-500">
                    {type === 'physical' && 'In-person event at a physical location'}
                    {type === 'virtual' && 'Online event via video call'}
                    {type === 'hybrid' && 'Both in-person and online options'}
                  </div>
                </button>
              ))}
            </div>
            {errors.locationType && <p className="text-sm text-red-600">{errors.locationType}</p>}
          </div>

          {/* Physical Location Fields */}
          {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900">Physical Location Details</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address *</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                  {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Country *</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                  />
                  {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Virtual Location Fields */}
          {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900">Virtual Meeting Details</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Meeting Link (Zoom/Teams/Meet) *
                </label>
                <input
                  type="url"
                  value={formData.meetingLink || ''}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://zoom.us/j/..."
                />
                {errors.meetingLink && <p className="text-sm text-red-600">{errors.meetingLink}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}