import { useState } from 'react'
import {
  useFacilities,
  useFacilityPlots,
  usePlotHistory,
  usePlotState,
  useLastIrrigation,
  useIrrigations,
} from '@/hooks/useQueries'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Thermometer,
  Droplet,
  Sun,
  Leaf,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import type {
  PlotMetadata,
  Facility,
  LastIrrigationResponse,
  IrrigationsResponse,
  IrrigationEvent,
} from '@/types'
import type { AxiosError } from 'axios'

// Variable configuration with icons and colors
const VARIABLE_CONFIG = {
  temperature: {
    icon: Thermometer,
    color: '#ef4444',
    bgColor: 'bg-red-500',
    name: 'Temperature',
    unit: '°C',
    idealValue: 25,
  },
  humidity: {
    icon: Droplet,
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    name: 'Humidity',
    unit: '%',
    idealValue: 60,
  },
  soil_moisture: {
    icon: Leaf,
    color: '#22c55e',
    bgColor: 'bg-green-500',
    name: 'Soil Moisture',
    unit: '%',
    idealValue: 70,
  },
  light: {
    icon: Sun,
    color: '#eab308',
    bgColor: 'bg-yellow-500',
    name: 'Light',
    unit: 'lux',
    idealValue: 8000,
  },
}

type VariableKey = keyof typeof VARIABLE_CONFIG

export function DashboardPage() {
  const [expandedFacility, setExpandedFacility] = useState<string | null>(null)
  const [selectedPlot, setSelectedPlot] = useState<PlotMetadata | null>(null)

  const { data: facilities, isLoading: facilitiesLoading, error: facilitiesError } = useFacilities()

  if (facilitiesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (facilitiesError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">Error loading facilities</h3>
          <p className="text-red-700">
            {facilitiesError instanceof Error
              ? facilitiesError.message
              : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left sidebar: Facilities and Plots */}
        <div className="space-y-4 xl:col-span-1">
          {facilities && facilities.length > 0 ? (
            facilities.map((facility) => (
              <FacilityCard
                key={facility.facility_id}
                facility={facility}
                isExpanded={expandedFacility === facility.facility_id}
                onToggle={() =>
                  setExpandedFacility(
                    expandedFacility === facility.facility_id ? null : facility.facility_id
                  )
                }
                selectedPlot={selectedPlot}
                onSelectPlot={setSelectedPlot}
              />
            ))
          ) : (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-500">No facilities available</p>
            </div>
          )}
        </div>

        {/* Right content: Plot details and charts */}
        <div className="xl:col-span-3">
          {selectedPlot ? (
            <PlotDetails plot={selectedPlot} />
          ) : (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <Leaf className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-700">Select a Plot</h3>
              <p className="text-gray-500">
                Choose a plot from the facilities to view sensor data and charts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FacilityCard({
  facility,
  isExpanded,
  onToggle,
  selectedPlot,
  onSelectPlot,
}: {
  facility: Facility
  isExpanded: boolean
  onToggle: () => void
  selectedPlot: PlotMetadata | null
  onSelectPlot: (plot: PlotMetadata) => void
}) {
  const { data: plots, isLoading } = useFacilityPlots(facility.facility_id)

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
          {facility.location && <p className="mt-1 text-sm text-gray-500">{facility.location}</p>}
        </div>
        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-gray-100 px-4 pb-4">
              {isLoading ? (
                <div className="py-4 text-center text-sm text-gray-500">Loading plots...</div>
              ) : plots && plots.length > 0 ? (
                plots.map((plot) => (
                  <button
                    key={plot.plot_id}
                    onClick={() => onSelectPlot(plot)}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-left transition-colors ${
                      selectedPlot?.plot_id === plot.plot_id
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {plot.name || `Plot ${plot.plot_id.slice(-8)}`}
                      </div>
                      {plot.species && (
                        <div className="truncate text-xs text-gray-500">{plot.species}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-gray-500">No plots available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PlotDetails({ plot }: { plot: PlotMetadata }) {
  const {
    data: currentState,
    isLoading: stateLoading,
    error: stateError,
  } = usePlotState(plot.plot_id)
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = usePlotHistory(plot.plot_id)
  const {
    data: lastIrrigation,
    isLoading: irrigationLoading,
    error: irrigationError,
  } = useLastIrrigation(plot.plot_id)
  const { data: allIrrigations } = useIrrigations(plot.plot_id)

  // Debug logs
  console.log('=== PLOT DETAILS DEBUG ===')
  console.log('Plot ID:', plot.plot_id)
  console.log('Current State:', currentState)
  console.log('State Loading:', stateLoading)
  console.log('State Error:', stateError)
  console.log('History:', history)
  console.log('History Loading:', historyLoading)
  console.log('History Error:', historyError)
  console.log('========================')

  // Check if it's a 404 error (no data yet)
  const is404 = stateError && (stateError as AxiosError).response?.status === 404

  // Only show error if it's not a 404 (404 means no data yet, which is normal)
  if (stateError && !is404) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-red-900">Error loading plot data</h3>
        <p className="text-red-700">
          {stateError instanceof Error ? stateError.message : 'Failed to fetch plot data'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plot header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          {plot.name || `Plot ${plot.plot_id.slice(-8)}`}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">ID:</span> {plot.plot_id.slice(-8)}
          </div>
          {plot.species && (
            <div>
              <span className="font-medium">Species:</span> {plot.species}
            </div>
          )}
          {plot.area && (
            <div>
              <span className="font-medium">Area:</span> {plot.area} m²
            </div>
          )}
          {plot.location && (
            <div>
              <span className="font-medium">Location:</span> {plot.location}
            </div>
          )}
        </div>
      </div>

      {/* Current readings */}
      {stateLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : currentState ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(Object.keys(VARIABLE_CONFIG) as VariableKey[]).map((key) => {
            const value = currentState[key]
            const config = VARIABLE_CONFIG[key]
            return (
              <StatCard
                key={key}
                title={config.name}
                value={
                  value !== undefined && value !== null
                    ? value.toFixed(key === 'light' ? 0 : 1)
                    : '--'
                }
                unit={config.unit}
                color={config.bgColor}
                icon={config.icon}
              />
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Leaf className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-blue-900">No sensor data yet</h3>
          <p className="text-blue-700">
            This plot hasn't received any sensor readings yet. Data will appear here once the IoT
            device starts sending information.
          </p>
        </div>
      )}

      {/* Irrigation Status */}
      {currentState && !irrigationLoading && (
        <IrrigationStatus
          lastIrrigation={lastIrrigation}
          allIrrigations={allIrrigations}
          hasError={!!irrigationError}
        />
      )}

      {/* Historical data charts */}
      {historyLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Loading historical data...</p>
          </div>
        </div>
      ) : historyError && (historyError as AxiosError).response?.status !== 404 ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
          <p className="text-yellow-700">Failed to load historical data</p>
        </div>
      ) : history && history.length > 0 ? (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Historical Data</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(Object.keys(VARIABLE_CONFIG) as VariableKey[]).map((key) => {
              const config = VARIABLE_CONFIG[key]
              // Check if this variable has data
              const hasData = history.some((item) => item[key] !== undefined && item[key] !== null)

              if (!hasData) return null

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ChartCard title={config.name}>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          }}
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                          label={{
                            value: config.unit,
                            angle: -90,
                            position: 'insideLeft',
                            style: { fontSize: 12, fill: '#6b7280' },
                          }}
                        />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 14 }} iconType="line" />
                        {config.idealValue && (
                          <ReferenceLine
                            y={config.idealValue}
                            stroke={config.color}
                            strokeDasharray="5 5"
                            strokeOpacity={0.5}
                            label={{
                              value: `Ideal: ${config.idealValue}${config.unit}`,
                              position: 'right',
                              fill: config.color,
                              fontSize: 12,
                            }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey={key}
                          stroke={config.color}
                          strokeWidth={2}
                          name={`${config.name} (${config.unit})`}
                          dot={{ fill: config.color, r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg text-gray-600">No historical data available for this plot.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  unit,
  color,
  icon: Icon,
}: {
  title: string
  value: string
  unit: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-md ${color} p-3 shadow-sm`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {value} <span className="text-base font-normal text-gray-500">{unit}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

function IrrigationStatus({
  lastIrrigation,
  allIrrigations,
  hasError,
}: {
  lastIrrigation?: LastIrrigationResponse
  allIrrigations?: IrrigationsResponse
  hasError: boolean
}) {
  // If no irrigation data, show "No data" state
  if (hasError || !lastIrrigation) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Droplet className="h-6 w-6 text-blue-500" />
            Irrigation Control
          </h3>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            No data
          </span>
        </div>
        <div className="py-8 text-center">
          <Droplet className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No irrigation events recorded for this plot yet.</p>
        </div>
      </div>
    )
  }

  // Calculate time since last irrigation
  const getTimeSince = (timestamp: string | number) => {
    if (!timestamp) return 'N/A'

    try {
      // Clean and normalize timestamp
      let cleanTimestamp = timestamp

      // If it's a number (Unix timestamp), convert to string
      if (typeof timestamp === 'number') {
        cleanTimestamp = new Date(timestamp).toISOString()
      } else {
        // Remove any extra whitespace
        cleanTimestamp = timestamp.trim()

        // Remove EVENT# or STATE# prefix if present
        if (cleanTimestamp.includes('#')) {
          const parts = cleanTimestamp.split('#')
          if (parts.length > 1) {
            cleanTimestamp = parts[1]
          }
        }

        // If timestamp doesn't have Z or timezone, add Z
        if (
          !cleanTimestamp.endsWith('Z') &&
          !cleanTimestamp.includes('+') &&
          !cleanTimestamp.includes('-', 10)
        ) {
          cleanTimestamp = cleanTimestamp + 'Z'
        }
      }

      console.log('Processing timestamp:', { original: timestamp, cleaned: cleanTimestamp })

      const now = new Date()
      const then = new Date(cleanTimestamp)

      // Validate the date
      if (isNaN(then.getTime())) {
        console.error('Invalid timestamp after parsing:', {
          original: timestamp,
          cleaned: cleanTimestamp,
        })
        return 'Invalid date'
      }

      console.log('Parsed dates:', { now: now.toISOString(), then: then.toISOString() })

      const diffMs = now.getTime() - then.getTime()

      // If negative (future date), return 'just now'
      if (diffMs < 0) {
        console.warn('Timestamp is in the future:', { now, then })
        return 'just now'
      }

      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      console.log('Time difference:', { diffMs, diffMins, diffHours, diffDays })

      if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ago`
      if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`
      if (diffMins > 0) return `${diffMins}m ago`
      return 'just now'
    } catch (error) {
      console.error('Error calculating time since:', error, 'timestamp:', timestamp)
      return 'N/A'
    }
  }

  // Calculate total water usage today
  const getTodayWaterUsage = () => {
    if (!allIrrigations?.irrigations) return 0

    const today = new Date().toISOString().split('T')[0]
    const todayIrrigations = allIrrigations.irrigations.filter((irr: IrrigationEvent) =>
      irr.timestamp?.startsWith(today)
    )

    return todayIrrigations.reduce((sum: number, irr: IrrigationEvent) => {
      const amount = irr.water_amount || 0
      return sum + (typeof amount === 'number' ? amount : 0)
    }, 0)
  }

  const lastTimestamp = (lastIrrigation.last_irrigation || lastIrrigation.details?.timestamp) as
    | string
    | undefined
  const duration = lastIrrigation.details?.duration as number | undefined
  const waterAmount = lastIrrigation.details?.water_amount as number | undefined
  const irrigationType = lastIrrigation.details?.type as 'manual' | 'automatic' | undefined
  const todayTotal = getTodayWaterUsage()

  // Debug: Log the irrigation data
  console.log('Last Irrigation Data:', {
    lastTimestamp,
    duration,
    waterAmount,
    irrigationType,
    fullData: lastIrrigation,
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Droplet className="h-6 w-6 text-blue-500" />
          Irrigation Control
        </h3>
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          Active
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-1 text-sm font-medium text-blue-700">Last Irrigation</div>
          <div className="text-2xl font-bold text-blue-900">
            {lastTimestamp ? getTimeSince(lastTimestamp) : 'N/A'}
          </div>
          <div className="mt-1 flex items-center justify-between">
            {duration && <div className="text-xs text-blue-600">Duration: {duration} min</div>}
            {irrigationType && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  irrigationType === 'automatic'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {irrigationType}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <div className="mb-1 text-sm font-medium text-green-700">Last Water Usage</div>
          <div className="text-2xl font-bold text-green-900">
            {waterAmount ? `${waterAmount.toFixed(1)} L` : 'N/A'}
          </div>
          {todayTotal > 0 && (
            <div className="mt-1 text-xs text-green-600">Today: {todayTotal.toFixed(1)} L</div>
          )}
        </div>
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
          <div className="mb-1 text-sm font-medium text-purple-700">Total Events</div>
          <div className="text-2xl font-bold text-purple-900">{allIrrigations?.count || 0}</div>
          <div className="mt-1 text-xs text-purple-600">
            {allIrrigations?.count ? 'Recorded irrigations' : 'No events'}
          </div>
        </div>
      </div>
    </div>
  )
}
