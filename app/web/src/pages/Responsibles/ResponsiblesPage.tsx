import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Building2, Plus, Trash2, AlertCircle, CheckCircle, Users } from 'lucide-react'
import {
  useFacilities,
  useFacilityResponsibles,
  useUpdateFacilityResponsibles,
} from '@/hooks/useQueries'
import type { Facility } from '@/types'
import type { AxiosError } from 'axios'

export function ResponsiblesPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities()

  return (
    <div className="space-y-6">
      {/* Facility Selector */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facility</h3>
            <p className="text-sm text-gray-600">Choose which facility to manage</p>
          </div>
        </div>

        {facilitiesLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100"></div>
            ))}
          </div>
        ) : facilities && facilities.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {facilities.map((facility) => (
              <button
                key={facility.facility_id}
                onClick={() => setSelectedFacility(facility)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedFacility?.facility_id === facility.facility_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                {facility.location && (
                  <p className="mt-1 text-sm text-gray-600">📍 {facility.location}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Building2 className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p>No facilities found</p>
          </div>
        )}
      </div>

      {/* Responsibles Manager */}
      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResponsiblesManager
              facilityId={selectedFacility.facility_id}
              facilityName={selectedFacility.name}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResponsiblesManager({
  facilityId,
  facilityName,
}: {
  facilityId: string
  facilityName: string
}) {
  const { data, isLoading, error } = useFacilityResponsibles(facilityId)
  const updateMutation = useUpdateFacilityResponsibles()

  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Initialize emails when data loads
  useEffect(() => {
    if (data?.responsibles) {
      setEmails(data.responsibles)
    }
  }, [data])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleAddEmail = async () => {
    const trimmed = newEmail.trim()

    if (!trimmed) {
      setValidationError('Email cannot be empty')
      return
    }

    if (!validateEmail(trimmed)) {
      setValidationError('Invalid email format')
      return
    }

    if (emails.includes(trimmed)) {
      setValidationError('Email already added')
      return
    }

    const newEmails = [...emails, trimmed]
    setEmails(newEmails)
    setNewEmail('')
    setValidationError('')

    // Guardar automáticamente
    try {
      await updateMutation.mutateAsync({ facilityId, responsibles: newEmails })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>
      console.error('Error updating responsibles:', err)
      setValidationError(error.response?.data?.detail || 'Failed to save email')
      // Revertir si falla
      setEmails(emails)
    }
  }

  const handleRemoveEmail = async (emailToRemove: string) => {
    const newEmails = emails.filter((e) => e !== emailToRemove)
    setEmails(newEmails)

    // Guardar automáticamente
    try {
      await updateMutation.mutateAsync({ facilityId, responsibles: newEmails })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>
      console.error('Error updating responsibles:', err)
      setValidationError(error.response?.data?.detail || 'Failed to remove email')
      // Revertir si falla
      setEmails([...emails])
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-900">Error loading responsibles</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Failed to fetch responsibles'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="font-medium text-green-800">Responsibles updated successfully!</p>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-100 p-3">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{facilityName}</h2>
          <p className="text-sm text-gray-600">Manage alert recipients</p>
        </div>
      </div>

      {/* Add Email Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Add Email Address</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value)
                setValidationError('')
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddEmail()
                }
              }}
              placeholder="responsible@example.com"
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={updateMutation.isPending}
            />
          </div>
          <button
            onClick={handleAddEmail}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </button>
        </div>
        {validationError && <p className="text-sm text-red-600">{validationError}</p>}
      </div>

      {/* Current Emails List */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Current Recipients ({emails.length})
        </label>

        {emails.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <Mail className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
            <p className="font-medium text-yellow-800">No recipients configured</p>
            <p className="mt-1 text-sm text-yellow-700">
              Add email addresses to receive alerts when sensor values go out of range
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map((email, index) => (
              <motion.div
                key={email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{email}</span>
                </div>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  disabled={updateMutation.isPending}
                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Remove email"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          These emails will receive alerts when any plot in this facility has sensor values outside
          configured thresholds.
        </p>
      </div>
    </div>
  )
}
