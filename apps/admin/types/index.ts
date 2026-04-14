export interface AdminData {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'OPS'
  status: 'ACTIVE' | 'INACTIVE'
}

export interface Agent {
  id: string
  phone: string
  name: string
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'ONLINE' | 'OFFLINE' | 'SUSPENDED' | 'BANNED'
  agentLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'
  vehicleType: 'MOTORBIKE' | 'CAR' | 'ON_FOOT'
  vehiclePlate: string
  vehicleMake: string
  vehicleModel: string
  avgRating: number
  totalRatings: number
  createdAt: string
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
  user: { id: string; name: string; phone: string }
  agent: { id: string; name: string; phone: string } | null
}

export interface ApiError {
  error: string
}
