export interface AdminData {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'OPS'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AdminStats {
  totalAgents: number
  activeJobs: number
  totalUsers: number
  revenue: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AgentListItem {
  id: string
  name: string
  phone: string
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'ONLINE' | 'OFFLINE' | 'SUSPENDED' | 'BANNED'
  agentLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  vehicleType: 'MOTORBIKE' | 'CAR' | 'ON_FOOT'
  avgRating: number
  totalRatings: number
  createdAt: string
  verification: {
    status: string
    method: string | null
    createdAt: string
  } | null
}

export interface Agent extends AgentListItem {
  vehiclePlate: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  momoPhone: string | null
  orangePhone: string | null
  verificationDocs: {
    id: string
    type: string
    fileUrl: string
    fileName: string
    uploadedAt: string
  }[]
}

export interface Job {
  id: string
  serviceType: 'ERRAND' | 'PICKUP' | 'DELIVERY'
  status:
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
  estimatedPrice: number
  finalPrice: number | null
  paymentMethod: 'MTN_MOMO' | 'ORANGE_MONEY' | 'CASH'
  createdAt: string
  user: { name: string; phone: string }
  agent: { name: string; phone: string } | null
  pickupLocation: { quarter: string; address: string }
}

export interface ApiError {
  error: string
}
