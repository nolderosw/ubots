import type { CreateServiceDto, Service, ServiceStatus, ServiceType, UpdateServiceDto } from '@/types/service'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const servicesApi = {
  async getAllServices (): Promise<Service[]> {
    const response = await api.get<Service[]>('/services')
    return response.data
  },

  async getServicesByStatus (status: ServiceStatus): Promise<Service[]> {
    const response = await api.get<Service[]>(`/services/${status}`)
    return response.data
  },

  async getServicesByStatusAndType (
    status: ServiceStatus,
    type: ServiceType,
  ): Promise<Service[]> {
    const response = await api.get<Service[]>(`/services/${status}/${type}`)
    return response.data
  },

  async createService (data: CreateServiceDto): Promise<Service> {
    const response = await api.post<Service>('/services', data)
    return response.data
  },

  async getNextServiceByType (
    type: ServiceType,
  ): Promise<Service | { message: string }> {
    const response = await api.patch<Service | { message: string }>(
      `/services/next/${type}`,
    )
    return response.data
  },

  async updateService (
    id: number,
    data: UpdateServiceDto,
  ): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}`, data)
    return response.data
  },
}
