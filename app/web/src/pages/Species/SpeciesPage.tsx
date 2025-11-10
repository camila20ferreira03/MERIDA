import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Thermometer, Droplet, Sun, AlertCircle, Building2, Sprout, ChevronRight, Search, Save, CheckCircle } from 'lucide-react'
import { usePlotThresholds, useFacilities, useFacilityPlots, useUpdatePlotThresholds } from '@/hooks/useQueries'
import type { Facility, PlotMetadata } from '@/types'

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
  const { data: plots, isLoading: plotsLoading } = useFacilityPlots(selectedFacility?.facility_id || '')

  // Reset plot selection when facility changes
  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility)
    setSelectedPlot(null) // Clear plot selection
    setSearchPlot('') // Clear plot search
  }

  // Filter facilities by search
  const filteredFacilities = facilities?.filter((f) =>
    f.name.toLowerCase().includes(searchFacility.toLowerCase()) ||
    f.location?.toLowerCase().includes(searchFacility.toLowerCase())
  )

  // Filter plots by search
  const filteredPlots = plots?.filter((p) =>
    (p.name?.toLowerCase().includes(searchPlot.toLowerCase()) || false) ||
    p.species?.toLowerCase().includes(searchPlot.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Select Facility */}
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
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
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Facility
            </button>
          )}
        </div>

        {selectedFacility ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedFacility.name}</h4>
                {selectedFacility.location && (
                  <p className="text-sm text-gray-600 mt-1">📍 {selectedFacility.location}</p>
                )}
              </div>
              <div className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-medium">
                Selected
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Search bar */}
            {facilities && facilities.length > 3 && (
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchFacility}
                  onChange={(e) => setSearchFacility(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {facilitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-24"></div>
                ))}
              </div>
            ) : filteredFacilities && filteredFacilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities.map((facility, index) => (
                  <motion.button
                    key={facility.facility_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFacilitySelect(facility)}
                    className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg rounded-lg p-4 text-left transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {facility.name}
                        </h4>
                        {facility.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {facility.location}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
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
          className="rounded-lg bg-white p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
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
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Change Plot
              </button>
            )}
          </div>

          {selectedPlot ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedPlot.name || `Plot ${selectedPlot.plot_id.slice(-8)}`}
                  </h4>
                  <div className="flex gap-3 mt-2 text-sm">
                    {selectedPlot.species && (
                      <span className="text-gray-600">🌱 {selectedPlot.species}</span>
                    )}
                    {selectedPlot.area && (
                      <span className="text-gray-600">📏 {selectedPlot.area}m²</span>
                    )}
                  </div>
                </div>
                <div className="bg-green-500 text-white rounded-full px-3 py-1 text-sm font-medium">
                  Selected
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Search bar */}
              {plots && plots.length > 3 && (
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search plots..."
                    value={searchPlot}
                    onChange={(e) => setSearchPlot(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {plotsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-20"></div>
                  ))}
                </div>
              ) : filteredPlots && filteredPlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredPlots.map((plot, index) => (
                    <motion.button
                      key={plot.plot_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPlot(plot)}
                      className="bg-white border-2 border-gray-200 hover:border-green-500 hover:shadow-lg rounded-lg p-3 text-left transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-green-600 transition-colors">
                          {plot.name || `Plot ${plot.plot_id.slice(-8)}`}
                        </h4>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
                      </div>
                      {plot.species && (
                        <p className="text-xs text-gray-600">🌱 {plot.species}</p>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sprout className="mx-auto h-12 w-12 text-gray-300 mb-2" />
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
  const [editedThresholds, setEditedThresholds] = useState<any>({})
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
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error loading thresholds</h3>
        <p className="text-red-700">
          {error instanceof Error ? error.message : 'Failed to fetch thresholds'}
        </p>
        <p className="text-sm text-red-600 mt-2">
          This plot may not have thresholds configured yet
        </p>
      </div>
    )
  }

  if (!thresholdsData) {
    return (
      <div className="rounded-lg bg-yellow-50 p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">No thresholds found</h3>
        <p className="text-yellow-700">
          This plot doesn't have thresholds configured yet
        </p>
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
      await updateMutation.mutateAsync({ plotId, thresholds: editedThresholds })
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
        thresholds: { umbral_enabled: !umbral_enabled }
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
          className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center gap-3"
        >
          <CheckCircle className="h-6 w-6 text-green-600" />
          <p className="text-green-800 font-medium">Thresholds updated successfully!</p>
        </motion.div>
      )}
      
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-sm border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plot Thresholds</h2>
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
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
              >
                Edit Thresholds
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Alert Status Message */}
        {!umbral_enabled && (
          <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Alerts are disabled</strong> - The system will not send alerts for this plot. 
              Click "Alerts OFF" to enable.
            </p>
          </div>
        )}
      </div>

      {/* Thresholds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(VARIABLE_CONFIG) as Array<keyof typeof VARIABLE_CONFIG>).map((key) => {
          const config = VARIABLE_CONFIG[key]
          const minValue = currentThresholds[config.minField as keyof typeof currentThresholds]
          const maxValue = currentThresholds[config.maxField as keyof typeof currentThresholds]

          // Skip if no values
          if (minValue === undefined && maxValue === undefined) return null

          const Icon = config.icon

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`${config.bgColor} rounded-lg p-6 border-2 ${config.borderColor} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{config.name}</h3>
              </div>

              <div className="space-y-3">
                {/* Minimum */}
                {minValue !== undefined && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Minimum:</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={minValue}
                          onChange={(e) => setEditedThresholds({
                            ...editedThresholds,
                            [config.minField]: parseFloat(e.target.value)
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className="text-sm text-gray-600 whitespace-nowrap">{config.unit}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {minValue} <span className="text-sm font-normal text-gray-600">{config.unit}</span>
                      </span>
                    )}
                  </div>
                )}
                
                {/* Maximum */}
                {maxValue !== undefined && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Maximum:</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={maxValue}
                          onChange={(e) => setEditedThresholds({
                            ...editedThresholds,
                            [config.maxField]: parseFloat(e.target.value)
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className="text-sm text-gray-600 whitespace-nowrap">{config.unit}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {maxValue} <span className="text-sm font-normal text-gray-600">{config.unit}</span>
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

