import { apiClient } from './api'
import type { LastIrrigationResponse, IrrigationsResponse } from '@/types'

export const irrigationService = {
  // Get last irrigation for a plot
  getLastIrrigation: async (plotId: string): Promise<LastIrrigationResponse> => {
    const response = await apiClient.get(`/irrigations/plot/${plotId}/last-irrigation`)
    return response.data
  },

  // Get all irrigations for a plot
  getIrrigations: async (plotId: string): Promise<IrrigationsResponse> => {
    const response = await apiClient.get(`/irrigations/plot/${plotId}/irrigations`)
    return response.data
  },

  // Get facility irrigations for a specific date
  getFacilityIrrigations: async (facilityId: string, date?: string) => {
    const params = date ? `?date=${date}` : ''
    const response = await apiClient.get(`/irrigations/facility/${facilityId}/irrigations${params}`)
    return response.data
  },
}

