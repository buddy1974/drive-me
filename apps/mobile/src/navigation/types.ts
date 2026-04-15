// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Role:      undefined
  Phone:     { actor: 'user' | 'agent' }
  Otp:       { phone: string; actor: 'user' | 'agent' }
  Name:      { phone: string; otp: string }
}

// ─── User navigation ──────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home:        undefined
  PlaceOrder:  undefined
  JobTracking: { jobId: string }
}

export type UserTabParamList = {
  HomeTab:    { screen?: keyof HomeStackParamList }
  HistoryTab: undefined
}

// ─── Agent navigation ─────────────────────────────────────────────────────────

export type AgentJobsStackParamList = {
  AgentHome:   undefined
  JobDetail:   { jobId: string }
  ActiveJob:   { jobId: string }
}

export type AgentTabParamList = {
  JobsTab:     { screen?: keyof AgentJobsStackParamList }
  EarningsTab: undefined
}
