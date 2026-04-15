export interface User {
  id: string
  name: string
  phone: string
  status: string
}

export interface Location {
  lat: number
  lng: number
  address: string
  quarter: string
  landmark?: string
}

export interface StatusHistoryEntry {
  id: string
  status: string
  createdAt: string
}

export type ServiceType = 'ERRAND' | 'PICKUP' | 'DELIVERY'
export type PaymentMethod = 'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'

export type JobStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'IN_PROGRESS'
  | 'ARRIVED_AT_DESTINATION'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_AGENT'
  | 'CANCELLED_BY_ADMIN'

export interface Job {
  id: string
  serviceType: ServiceType
  status: JobStatus
  description: string
  estimatedPrice: number
  finalPrice: number | null
  paymentMethod: PaymentMethod
  commissionRate: number
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; phone: string }
  agent: { id: string; name: string; phone: string } | null
  pickupLocation: Location
  destinationLocation: Location | null
  statusHistory: StatusHistoryEntry[]
}

export interface ApiError {
  error: string
}
