export interface User {
  id:     string
  name:   string
  phone:  string
  status: string
}

export interface Agent {
  id:           string
  name:         string
  phone:        string
  status:       string
  vehicleType?: string
  momoPhone?:   string | null
  orangePhone?: string | null
}

export interface Location {
  lat:       number
  lng:       number
  address:   string
  quarter:   string
  landmark?: string
}

export interface StatusHistoryEntry {
  id:        string
  status:    string
  createdAt: string
}

export type ServiceType   = 'ERRAND' | 'PICKUP' | 'DELIVERY'
export type PaymentMethod = 'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'
export type ActorType     = 'user' | 'agent'

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
  id:               string
  serviceType:      ServiceType
  status:           JobStatus
  description:      string
  estimatedPrice:   number
  finalPrice:       number | null
  paymentMethod:    PaymentMethod
  commissionRate:   number
  createdAt:        string
  updatedAt:        string
  user:             { id: string; name: string; phone: string }
  agent:            { id: string; name: string; phone: string } | null
  pickupLocation:   Location
  destinationLocation: Location | null
  statusHistory:    StatusHistoryEntry[]
}

export interface AgentEarnings {
  totalEarned:   number
  completedJobs: number
  pendingPayout: number
  updatedAt:     string | null
}

export interface LocationUpdate {
  id:        string
  jobId:     string
  agentId:   string
  lat:       number
  lng:       number
  w3w:       string | null
  createdAt: string
}

export interface AgentProfile {
  id:           string
  name:         string
  phone:        string
  status:       string
  vehicleType:  string
  vehiclePlate: string
  vehicleMake:  string
  vehicleModel: string
  vehicleYear:  number
  momoPhone:    string | null
  orangePhone:  string | null
}

export interface ApiError {
  error: string
}
