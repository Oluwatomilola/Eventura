'use client'

import { useState } from 'react'
import { useSignMessage } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  X,
  Plus,
  Info,
  Sparkles
} from 'lucide-react'

interface PersonaCreationFormProps {
  walletAddress: string
  eventId: number | string
  onSuccess?: (persona: any) => void
  onSkip?: () => void
  initialData?: PersonaFormData
  isEdit?: boolean
}

interface PersonaFormData {
  display_name: string
  bio: string
  interests: string[]
  looking_for: string[]
  visibility: 'public' | 'attendees' | 'connections' | 'private'
}

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can see your persona (even non-attendees)',
    icon: '🌍'
  },
  {
    value: 'attendees',
    label: 'Attendees Only',
    description: 'Only people attending this event',
    icon: '🎫'
  },
  {
    value: 'connections',
    label: 'Connections Only',
    description: 'Only people you\'ve connected with',
    icon: '🤝'
  },
  {
    value: 'private',
    label: 'Private',
    description: 'You remain invisible (can still attend)',
    icon: '🔒'
  }
]

const LOOKING_FOR_OPTIONS = [
  'Co-founder',
  'Mentorship',
  'Networking',
  'Friends',
  'Job Opportunities',
  'Business Partners',
  'Investors',
  'Collaboration',
  'Learning',
  'Fun'
]

export function PersonaCreationForm({
  walletAddress,
  eventId,
  onSuccess,
  onSkip,
  initialData,
  isEdit = false
}: PersonaCreationFormProps) {
  const { signMessageAsync } = useSignMessage()

  const [formData, setFormData] = useState<PersonaFormData>(
    initialData || {
      display_name: '',
      bio: '',
      interests: [],
      looking_for: [],
      visibility: 'attendees'
    }
  )

  const [newInterest, setNewInterest] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const bioLength = formData.bio.length
  const bioMin = 50
  const bioMax = 300

  const getBioColor = () => {
    if (bioLength === 0) return 'text-white/40'
    if (bioLength < bioMin) return 'text-yellow-400'
    if (bioLength >= bioMin && bioLength <= bioMax - 50) return 'text-green-400'
    if (bioLength > bioMax - 50 && bioLength <= bioMax) return 'text-yellow-400'
    return 'text-red-400'
  }

  const handleAddInterest = () => {
    const trimmedInterest = newInterest.trim()
    if (trimmedInterest && !formData.interests.includes(trimmedInterest)) {
      if (formData.interests.length >= 10) {
        setError('Maximum 10 interests allowed')
        return
      }
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmedInterest]
      }))
      setNewInterest('')
      setError(null)
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const toggleLookingFor = (option: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(option)
        ? prev.looking_for.filter(o => o !== option)
        : prev.looking_for.length < 10
        ? [...prev.looking_for, option]
        : prev.looking_for
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Validate required fields
      if (!formData.display_name.trim()) {
        throw new Error('Display name is required')
      }

      if (formData.bio.length > 0 && formData.bio.length < bioMin) {
        throw new Error(`Bio must be at least ${bioMin} characters`)
      }

      if (formData.bio.length > bioMax) {
        throw new Error(`Bio must be ${bioMax} characters or less`)
      }

      // Generate message for signing
      const timestamp = Date.now()
      const message = `Sign this message to authenticate with Eventura\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      // Submit persona
      const response = await fetch('/api/personas', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          event_id: eventId,
          display_name: formData.display_name.trim(),
          bio: formData.bio.trim() || undefined,
          interests: formData.interests,
          looking_for: formData.looking_for,
          visibility: formData.visibility,
          message,
          signature,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save persona')
      }

      setSuccessMessage(`Persona ${isEdit ? 'updated' : 'created'} successfully!`)
      setTimeout(() => {
        onSuccess?.(data.data)
      }, 1000)
    } catch (err: any) {
      console.error('Persona save error:', err)
      setError(err.message || 'Failed to save persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Create Your Event Persona
            </h3>
            <p className="text-xs text-white/70">
              Present yourself authentically for this event. Be genuine and have fun - this isn't a job application!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6"
      >
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Display Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
            maxLength={50}
            placeholder="How should people know you at this event?"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
          />
          <p className="text-xs text-white/40 mt-1">
            {formData.display_name.length}/50 characters
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Bio <span className="text-white/40">(Optional, but recommended)</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            maxLength={bioMax}
            rows={4}
            placeholder="What brings you to this event? What are you looking to achieve or experience?"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs ${getBioColor()} transition-colors`}>
              {bioLength}/{bioMax} characters
              {bioLength > 0 && bioLength < bioMin && ` (minimum ${bioMin})`}
            </p>
            {bioLength >= bioMin && bioLength <= bioMax && (
              <span className="text-xs text-green-400">✓ Perfect length</span>
            )}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Interests <span className="text-white/40">(Max 10)</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              maxLength={50}
              placeholder="Add an interest (press Enter)"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              disabled={!newInterest.trim() || formData.interests.length >= 10}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <motion.span
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-purple-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </div>

        {/* Looking For */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Looking For <span className="text-white/40">(Select up to 10)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {LOOKING_FOR_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleLookingFor(option)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.looking_for.includes(option)
                    ? 'bg-blue-500/30 border-2 border-blue-500 text-blue-300'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">
            Visibility Settings
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: option.value as any }))}
                className={`p-4 rounded-lg text-left transition-all ${
                  formData.visibility === option.value
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-semibold text-white text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-white/60">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all"
          >
            <Eye className="w-5 h-5" />
            {showPreview ? 'Hide' : 'Preview'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Update' : 'Create'} Persona
              </>
            )}
          </button>

          {onSkip && !isEdit && (
            <button
              type="button"
              onClick={onSkip}
              className="md:w-auto px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </motion.form>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Preview - How Others See You</h3>
            </div>

            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-white">
                  {formData.display_name || 'Your Name'}
                </h4>
                {formData.visibility && (
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    {VISIBILITY_OPTIONS.find(o => o.value === formData.visibility)?.icon}{' '}
                    {VISIBILITY_OPTIONS.find(o => o.value === formData.visibility)?.label}
                  </span>
                )}
              </div>

              {formData.bio && (
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-1">About</p>
                  <p className="text-white/80 whitespace-pre-wrap">{formData.bio}</p>
                </div>
              )}

              {formData.interests.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.looking_for.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Looking For</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.looking_for.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
