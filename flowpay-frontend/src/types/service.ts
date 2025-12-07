export type ServiceStatus = 'PEDING' | 'IN_PROGRESS' | 'RESOLVED'
export type ServiceType = 'CARD' | 'LOAN' | 'OTHER'

export interface Service {
  id: number
  type: ServiceType
  description: string
  customerId: string
  status: ServiceStatus
  startDate?: Date
  endDate?: Date
  attendantId?: number
}

export interface CreateServiceDto {
  type: ServiceType
  description: string
  customerId: string
}

export interface UpdateServiceDto {
  status?: ServiceStatus
  description?: string
}

