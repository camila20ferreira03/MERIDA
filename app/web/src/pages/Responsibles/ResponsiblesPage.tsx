import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Building2, Plus, Trash2, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { useFacilities, useFacilityResponsibles, useUpdateFacilityResponsibles } from '@/hooks/useQueries'
import type { Facility } from '@/types'

export function ResponsiblesPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities()

  return (
    <div className="space-y-6">
      {/* Facility Selector */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 rounded-lg p-2">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facility</h3>
            <p className="text-sm text-gray-600">Choose which facility to manage</p>
          </div>
        </div>

        {facilitiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20"></div>
            ))}
          </div>
        ) : facilities && facilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((facility) => (
              <button
                key={facility.facility_id}
                onClick={() => setSelectedFacility(facility)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedFacility?.facility_id === facility.facility_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                {facility.location && (
                  <p className="text-sm text-gray-600 mt-1">📍 {facility.location}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
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
            <ResponsiblesManager facilityId={selectedFacility.facility_id} facilityName={selectedFacility.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResponsiblesManager({ facilityId, facilityName }: { facilityId: string; facilityName: string }) {
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
    } catch (error: any) {
      console.error('Error updating responsibles:', error)
      setValidationError(error.response?.data?.detail || 'Failed to save email')
      // Revertir si falla
      setEmails(emails)
    }
  }

  const handleRemoveEmail = async (emailToRemove: string) => {
    const newEmails = emails.filter(e => e !== emailToRemove)
    setEmails(newEmails)
    
    // Guardar automáticamente
    try {
      await updateMutation.mutateAsync({ facilityId, responsibles: newEmails })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error updating responsibles:', error)
      setValidationError(error.response?.data?.detail || 'Failed to remove email')
      // Revertir si falla
      setEmails([...emails])
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-white border border-gray-200">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center border border-red-200">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error loading responsibles</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Failed to fetch responsibles'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center gap-3"
        >
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="text-green-800 font-medium">Responsibles updated successfully!</p>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 rounded-lg p-3">
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
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateMutation.isPending}
            />
          </div>
          <button
            onClick={handleAddEmail}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>

      {/* Current Emails List */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Current Recipients ({emails.length})
        </label>
        
        {emails.length === 0 ? (
          <div className="rounded-lg bg-yellow-50 p-6 text-center border border-yellow-200">
            <Mail className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
            <p className="text-yellow-800 font-medium">No recipients configured</p>
            <p className="text-sm text-yellow-700 mt-1">
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
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{email}</span>
                </div>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  disabled={updateMutation.isPending}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          These emails will receive alerts when any plot in this facility has sensor values outside configured thresholds.
        </p>
      </div>
    </div>
  )
}

