import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, MapPin, Sprout, CheckCircle, AlertCircle } from 'lucide-react'
import {
  useFacilities,
  useCreateFacility,
  useFacilityPlots,
  useCreatePlot,
  useSpecies,
  useCreateSpecies,
} from '@/hooks/useQueries'
import type { Facility, CreateFacilityRequest, CreatePlotRequest } from '@/types'
import type { AxiosError } from 'axios'

export function ManagementPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [showFacilityForm, setShowFacilityForm] = useState(false)
  const [showPlotForm, setShowPlotForm] = useState(false)

  const { data: facilities, isLoading: facilitiesLoading } = useFacilities()
  const { data: plots, isLoading: plotsLoading } = useFacilityPlots(
    selectedFacility?.facility_id || ''
  )

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility)
    setShowFacilityForm(false)
  }

  const handleCreateNewFacility = () => {
    setSelectedFacility(null)
    setShowFacilityForm(true)
    setShowPlotForm(false)
  }

  const handleCreatePlotInFacility = () => {
    setShowPlotForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Select or Create Facility */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Facility</h3>
              <p className="text-sm text-gray-600">
                Choose an existing facility or create a new one
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedFacility && !showFacilityForm && (
              <button
                onClick={() => {
                  setSelectedFacility(null)
                  setShowPlotForm(false)
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change Facility
              </button>
            )}
            <button
              onClick={handleCreateNewFacility}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              <Plus className="h-4 w-4" /> New Facility
            </button>
          </div>
        </div>

        {/* Create Facility Form */}
        {showFacilityForm && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CreateFacilityForm
              onSuccess={(facility) => {
                setSelectedFacility(facility)
                setShowFacilityForm(false)
              }}
              onCancel={() => setShowFacilityForm(false)}
            />
          </motion.div>
        )}

        {/* Selected Facility */}
        {selectedFacility && !showFacilityForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedFacility.name}</h4>
                {selectedFacility.location && (
                  <p className="mt-1 text-sm text-gray-600">📍 {selectedFacility.location}</p>
                )}
              </div>
              <div className="rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
                Selected
              </div>
            </div>
          </motion.div>
        )}

        {/* Existing Facilities List */}
        {!selectedFacility && !showFacilityForm && (
          <>
            {facilitiesLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100"></div>
                ))}
              </div>
            ) : facilities && facilities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility, index) => (
                  <motion.button
                    key={facility.facility_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFacilitySelect(facility)}
                    className="group rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                          {facility.name}
                        </h4>
                        {facility.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" /> {facility.location}
                          </p>
                        )}
                      </div>
                      <Building2 className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Building2 className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>No facilities found. Create one to get started!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Plot */}
      {selectedFacility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plots</h3>
                <p className="text-sm text-gray-600">Manage plots in {selectedFacility.name}</p>
              </div>
            </div>
            {!showPlotForm && (
              <button
                onClick={handleCreatePlotInFacility}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <Plus className="h-4 w-4" /> New Plot
              </button>
            )}
          </div>

          {/* Create Plot Form */}
          {showPlotForm && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <CreatePlotForm
                facilityId={selectedFacility.facility_id}
                onSuccess={() => {
                  setShowPlotForm(false)
                }}
                onCancel={() => setShowPlotForm(false)}
              />
            </motion.div>
          )}

          {/* Existing Plots */}
          {!showPlotForm && (
            <>
              <h4 className="text-md mt-6 mb-3 font-semibold text-gray-900">Existing Plots</h4>
              {plotsLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100"></div>
                  ))}
                </div>
              ) : plots && plots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {plots.map((plot) => (
                    <div
                      key={plot.plot_id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <h5 className="text-sm font-semibold text-gray-900">
                        {plot.name || `Plot ${plot.plot_id.slice(-8)}`}
                      </h5>
                      {plot.species && (
                        <p className="mt-1 text-xs text-gray-600">🌱 {plot.species}</p>
                      )}
                      {plot.location && (
                        <p className="mt-1 text-xs text-gray-600">📍 {plot.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 py-6 text-center text-gray-500">
                  <Sprout className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <p className="text-sm">No plots in this facility yet. Create one above!</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}

// Create Facility Form Component
function CreateFacilityForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (facility: Facility) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateFacilityRequest>({
    name: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const createMutation = useCreateFacility()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Facility name is required')
      return
    }

    if (!formData.location.trim()) {
      setError('Location is required')
      return
    }

    try {
      const result = await createMutation.mutateAsync(formData)
      setSuccess(true)
      setTimeout(() => {
        onSuccess(result.facility)
      }, 1000)
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>
      setError(error.response?.data?.detail || 'Failed to create facility')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-4 font-semibold text-blue-900">Create New Facility</h4>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">Facility created successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Facility Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Greenhouse A"
              disabled={createMutation.isPending || success}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Building 1, Floor 2"
              disabled={createMutation.isPending || success}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-400"
            disabled={createMutation.isPending || success}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
            disabled={createMutation.isPending || success}
          >
            {createMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" /> Create Facility
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

// Create Plot Form Component
function CreatePlotForm({
  facilityId,
  onSuccess,
  onCancel,
}: {
  facilityId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreatePlotRequest>({
    facility_id: facilityId,
    name: '',
    location: '',
    mac_address: '',
    species: '',
    area: undefined,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [customSpeciesMode, setCustomSpeciesMode] = useState(false)
  const [customSpeciesName, setCustomSpeciesName] = useState('')

  const createMutation = useCreatePlot()
  const createSpeciesMutation = useCreateSpecies()
  const { data: speciesList, isLoading: speciesLoading } = useSpecies()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Plot name is required')
      return
    }

    if (!formData.location.trim()) {
      setError('Location is required')
      return
    }

    if (!formData.mac_address.trim()) {
      setError('MAC address is required')
      return
    }

    if (customSpeciesMode && !customSpeciesName.trim()) {
      setError('Please enter a species name')
      return
    }

    try {
      // Si está en modo custom, crear la especie primero
      if (customSpeciesMode && customSpeciesName.trim()) {
        console.log('🌱 Creating new species:', customSpeciesName)
        await createSpeciesMutation.mutateAsync({ name: customSpeciesName.trim() })
        // Actualizar formData con el nombre de la nueva especie
        formData.species = customSpeciesName.trim()
      }

      console.log('🔍 Creating plot with data:', formData)
      await createMutation.mutateAsync(formData)
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>
      console.error('❌ Error creating plot:', err)
      console.error('📦 Error response:', error.response?.data)
      setError(error.response?.data?.detail || 'Failed to create plot or species')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="mb-4 font-semibold text-green-900">Create New Plot</h4>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">Plot created successfully!</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Plot Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="e.g., Plot A1"
              disabled={createMutation.isPending || success}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="e.g., Row 1, Section A"
              disabled={createMutation.isPending || success}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">MAC Address *</label>
            <input
              type="text"
              value={formData.mac_address}
              onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="e.g., AA:BB:CC:DD:EE:FF"
              disabled={createMutation.isPending || success}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Species (optional)
            </label>
            <select
              value={customSpeciesMode ? '__custom__' : formData.species}
              onChange={(e) => {
                const value = e.target.value
                if (value === '__custom__') {
                  setCustomSpeciesMode(true)
                  setFormData({ ...formData, species: '' })
                } else {
                  setCustomSpeciesMode(false)
                  setCustomSpeciesName('')
                  setFormData({ ...formData, species: value })
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              disabled={createMutation.isPending || success || speciesLoading}
            >
              <option value="">No species (generic thresholds)</option>
              {speciesLoading ? (
                <option disabled>Loading species...</option>
              ) : (
                <>
                  {speciesList?.map((species) => (
                    <option key={species.pk} value={species.name}>
                      {species.name}
                    </option>
                  ))}
                  <option value="__custom__">✨ Create new species...</option>
                </>
              )}
            </select>

            {/* Input de texto para especie personalizada */}
            {customSpeciesMode && (
              <input
                type="text"
                value={customSpeciesName}
                onChange={(e) => setCustomSpeciesName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-green-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Enter new species name (e.g., Tomato)"
                disabled={createMutation.isPending || success}
              />
            )}

            <p className="mt-1 text-xs text-gray-500">
              {customSpeciesMode
                ? 'Enter a name for the new species. It will be created automatically.'
                : 'If no species is selected, generic default thresholds will be created'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Area (m²)</label>
            <input
              type="number"
              step="0.01"
              value={formData.area || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  area: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="e.g., 10.5"
              disabled={createMutation.isPending || success}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-400"
            disabled={createMutation.isPending || success}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
            disabled={createMutation.isPending || success}
          >
            {createMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Sprout className="h-4 w-4" /> Create Plot
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
