// User types
export interface User {
  user_id: string
  email?: string
  name?: string
  created_at?: string
}

// Plot types
export interface PlotMetadata {
  plot_id: string
  facility_id: string
  name?: string
  location?: string
  species?: string
  area?: number
  mac_address?: string
  created_at?: string
  updated_at?: string
}

export interface PlotState {
  plot_id: string
  timestamp: string
  temperature?: number
  humidity?: number
  soil_moisture?: number
  light?: number
}

export interface CreatePlotRequest {
  facility_id: string
  name: string
  location: string
  mac_address: string
  species?: string
  area?: number
}

export interface UpdatePlotRequest {
  species?: string
  area?: number
}

// Sensor data types
export interface SensorData {
  sensor_id: string
  plot_id: string
  timestamp: string
  temperature?: number
  humidity?: number
  soil_moisture?: number
  light?: number
}

// Event types
export interface Event {
  event_type: string
  timestamp: string
  plot_id?: string
  data?: Record<string, unknown>
}

// Irrigation types
export interface IrrigationEvent {
  plot_id: string
  timestamp: string
  duration?: number // minutes
  water_amount?: number // liters
  type?: 'manual' | 'automatic'
  [key: string]: string | number | boolean | undefined
}

export interface LastIrrigationResponse {
  plot_id: string
  last_irrigation: string
  details: IrrigationEvent
}

export interface IrrigationsResponse {
  count: number
  irrigations: IrrigationEvent[]
}

// Species thresholds types
export interface SpeciesThresholds {
  species_id: string
  MinTemperature?: number
  MaxTemperature?: number
  MinHumidity?: number
  MaxHumidity?: number
  MinLight?: number
  MaxLight?: number
  MinIrrigation?: number
  MaxIrrigation?: number
  umbral_enabled?: boolean
}

export interface PlotThresholds {
  plot_id: string
  species_id: string
  scope: 'facility' | 'global'
  thresholds: SpeciesThresholds
}

// Facility types
export interface Facility {
  facility_id: string
  name: string
  location?: string
  created_at: string
}

export interface CreateFacilityRequest {
  name: string
  location: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}
