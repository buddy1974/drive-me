// ================================
// Enums
// ================================

export enum JobStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AgentStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  MTN = 'MTN',
  ORANGE = 'ORANGE',
}

// ================================
// Interfaces
// ================================

export interface IUser {
  id: string
  createdAt: Date
  updatedAt: Date
  phone: string
  name?: string
  email?: string
  isVerified: boolean
  isActive: boolean
}

export interface IAgent {
  id: string
  createdAt: Date
  updatedAt: Date
  phone: string
  name: string
  email?: string
  isVerified: boolean
  isActive: boolean
  isOnline: boolean
  status: AgentStatus
}

export interface ICoordinate {
  lat: number
  lng: number
}

export interface ILocation extends ICoordinate {
  address: string
}

export interface IJob {
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
  agentId?: string
  status: JobStatus
  pickup: ILocation
  drop: ILocation
  price?: number
  user?: IUser
  agent?: IAgent
  payment?: IPayment
}

export interface IPayment {
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
  jobId: string
  amount: number
  currency: string
  provider: PaymentProvider
  status: PaymentStatus
  reference?: string
}

// ================================
// API Response types
// ================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

// ================================
// Auth types
// ================================

export interface AuthPayload {
  userId: string
  phone: string
  role: 'user' | 'agent' | 'admin'
}

export interface OtpRequest {
  phone: string
}

export interface OtpVerify {
  phone: string
  otp: string
}
