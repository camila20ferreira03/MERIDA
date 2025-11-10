import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Thermometer,
  Droplet,
  Sun,
  AlertCircle,
  Building2,
  Sprout,
  ChevronRight,
  Search,
  Save,
  CheckCircle,
} from 'lucide-react'
import {
  usePlotThresholds,
  useFacilities,
  useFacilityPlots,
  useUpdatePlotThresholds,
} from '@/hooks/useQueries'
import type { Facility, PlotMetadata, SpeciesThresholds } from '@/types'

// Variable configuration with icons and colors
const VARIABLE_CONFIG = {
  temperature: {
    icon: Thermometer,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    name: 'Temperature',
    unit: '°C',
    minField: 'MinTemperature',
    maxField: 'MaxTemperature',
  },
  humidity: {
    icon: Droplet,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    name: 'Humidity',
    unit: '%',
    minField: 'MinHumidity',
    maxField: 'MaxHumidity',
  },
  light: {
    icon: Sun,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    name: 'Light',
    unit: 'lux',
    minField: 'MinLight',
    maxField: 'MaxLight',
  },
  irrigation: {
    icon: Droplet,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    name: 'Irrigation',
    unit: 'mm/day',
    minField: 'MinIrrigation',
    maxField: 'MaxIrrigation',
  },
}

export function SpeciesPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<PlotMetadata | null>(null)
  const [searchFacility, setSearchFacility] = useState('')
  const [searchPlot, setSearchPlot] = useState('')

  const { data: facilities, isLoading: facilitiesLoading } = useFacilities()
  const { data: plots, isLoading: plotsLoading } = useFacilityPlots(
    selectedFacility?.facility_id || ''
  )

  // Reset plot selection when facility changes
  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility)
    setSelectedPlot(null) // Clear plot selection
    setSearchPlot('') // Clear plot search
  }

  // Filter facilities by search
  const filteredFacilities = facilities?.filter(
    (f) =>
      f.name.toLowerCase().includes(searchFacility.toLowerCase()) ||
      f.location?.toLowerCase().includes(searchFacility.toLowerCase())
  )

  // Filter plots by search
  const filteredPlots = plots?.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchPlot.toLowerCase()) ||
      false ||
      p.species?.toLowerCase().includes(searchPlot.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Select Facility */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Facility</h3>
              <p className="text-sm text-gray-600">Choose which facility to view</p>
            </div>
          </div>
          {selectedFacility && (
            <button
              onClick={() => {
                setSelectedFacility(null)
                setSelectedPlot(null)
                setSearchFacility('')
                setSearchPlot('')
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change Facility
            </button>
          )}
        </div>

        {selectedFacility ? (
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
        ) : (
          <>
            {/* Search bar */}
            {facilities && facilities.length > 3 && (
              <div className="relative mb-4">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchFacility}
                  onChange={(e) => setSearchFacility(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {facilitiesLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100"></div>
                ))}
              </div>
            ) : filteredFacilities && filteredFacilities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFacilities.map((facility, index) => (
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
                          <p className="mt-1 text-sm text-gray-600">📍 {facility.location}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Building2 className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                <p>No facilities found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Select Plot */}
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
                <h3 className="text-lg font-semibold text-gray-900">Plot</h3>
                <p className="text-sm text-gray-600">Choose which plot to view thresholds for</p>
              </div>
            </div>
            {selectedPlot && (
              <button
                onClick={() => {
                  setSelectedPlot(null)
                  setSearchPlot('')
                }}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Change Plot
              </button>
            )}
          </div>

          {selectedPlot ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedPlot.name || `Plot ${selectedPlot.plot_id.slice(-8)}`}
                  </h4>
                  <div className="mt-2 flex gap-3 text-sm">
                    {selectedPlot.species && (
                      <span className="text-gray-600">🌱 {selectedPlot.species}</span>
                    )}
                    {selectedPlot.area && (
                      <span className="text-gray-600">📏 {selectedPlot.area}m²</span>
                    )}
                  </div>
                </div>
                <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                  Selected
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Search bar */}
              {plots && plots.length > 3 && (
                <div className="relative mb-4">
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search plots..."
                    value={searchPlot}
                    onChange={(e) => setSearchPlot(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              )}

              {plotsLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100"></div>
                  ))}
                </div>
              ) : filteredPlots && filteredPlots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {filteredPlots.map((plot, index) => (
                    <motion.button
                      key={plot.plot_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPlot(plot)}
                      className="group rounded-lg border-2 border-gray-200 bg-white p-3 text-left transition-all hover:border-green-500 hover:shadow-lg"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-green-600">
                          {plot.name || `Plot ${plot.plot_id.slice(-8)}`}
                        </h4>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-green-600" />
                      </div>
                      {plot.species && <p className="text-xs text-gray-600">🌱 {plot.species}</p>}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Sprout className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p>No plots found in this facility</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Show thresholds */}
      <AnimatePresence>
        {selectedPlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ThresholdsView plotId={selectedPlot.plot_id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThresholdsView({ plotId }: { plotId: string }) {
  const { data: thresholdsData, isLoading, error } = usePlotThresholds(plotId)
  const updateMutation = useUpdatePlotThresholds()

  const [isEditing, setIsEditing] = useState(false)
  const [editedThresholds, setEditedThresholds] = useState<Partial<SpeciesThresholds>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-900">Error loading thresholds</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Failed to fetch thresholds'}
        </p>
        <p className="mt-2 text-sm text-red-600">
          This plot may not have thresholds configured yet
        </p>
      </div>
    )
  }

  if (!thresholdsData) {
    return (
      <div className="rounded-lg bg-yellow-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
        <h3 className="mb-2 text-lg font-semibold text-yellow-900">No thresholds found</h3>
        <p className="text-yellow-700">This plot doesn't have thresholds configured yet</p>
      </div>
    )
  }

  const umbral_enabled = thresholdsData.umbral_enabled || false
  const species_id = thresholdsData.species_id

  const handleEdit = () => {
    setEditedThresholds(thresholdsData)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      if (!editedThresholds.species_id) return
      await updateMutation.mutateAsync({
        plotId,
        thresholds: editedThresholds as SpeciesThresholds,
      })
      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating thresholds:', error)
    }
  }

  const handleToggleEnabled = async () => {
    try {
      await updateMutation.mutateAsync({
        plotId,
        thresholds: {
          ...thresholdsData,
          umbral_enabled: !umbral_enabled,
        },
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error toggling umbral:', error)
    }
  }

  const currentThresholds = isEditing ? editedThresholds : thresholdsData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="font-medium text-green-800">Thresholds updated successfully!</p>
        </motion.div>
      )}

      {/* Header */}
      <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Plot Thresholds</h2>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Species:</span> {species_id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Plot ID:</span> {plotId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Enable/Disable Toggle */}
            <button
              onClick={handleToggleEnabled}
              disabled={updateMutation.isPending}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                umbral_enabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {umbral_enabled ? '✓ Alerts ON' : '✗ Alerts OFF'}
            </button>

            {/* Edit/Save Buttons */}
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Edit Thresholds
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alert Status Message */}
        {!umbral_enabled && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Alerts are disabled</strong> - The system will not send alerts for this
              plot. Click "Alerts OFF" to enable.
            </p>
          </div>
        )}
      </div>

      {/* Thresholds Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(Object.keys(VARIABLE_CONFIG) as Array<keyof typeof VARIABLE_CONFIG>).map((key) => {
          const config = VARIABLE_CONFIG[key]
          const minValue = currentThresholds[config.minField as keyof typeof currentThresholds] as
            | number
            | undefined
          const maxValue = currentThresholds[config.maxField as keyof typeof currentThresholds] as
            | number
            | undefined

          // Skip if no values
          if (minValue === undefined && maxValue === undefined) return null

          const Icon = config.icon

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`${config.bgColor} rounded-lg border-2 p-6 ${config.borderColor} shadow-sm transition-shadow hover:shadow-md`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg bg-white p-3 shadow-sm`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{config.name}</h3>
              </div>

              <div className="space-y-3">
                {/* Minimum */}
                {minValue !== undefined && (
                  <div className="rounded-lg bg-white/70 p-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Minimum:</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={minValue}
                          onChange={(e) =>
                            setEditedThresholds({
                              ...editedThresholds,
                              [config.minField]: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className="text-sm whitespace-nowrap text-gray-600">
                          {config.unit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {minValue}{' '}
                        <span className="text-sm font-normal text-gray-600">{config.unit}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Maximum */}
                {maxValue !== undefined && (
                  <div className="rounded-lg bg-white/70 p-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Maximum:</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={maxValue}
                          onChange={(e) =>
                            setEditedThresholds({
                              ...editedThresholds,
                              [config.maxField]: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className="text-sm whitespace-nowrap text-gray-600">
                          {config.unit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {maxValue}{' '}
                        <span className="text-sm font-normal text-gray-600">{config.unit}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
