export type AuthStackParamList = {
  Phone:    undefined
  Otp:      { phone: string }
  Name:     { phone: string; otp: string }
}

export type HomeStackParamList = {
  Home:         undefined
  PlaceOrder:   undefined
  JobTracking:  { jobId: string }
}

export type UserTabParamList = {
  HomeTab:    { screen?: keyof HomeStackParamList }
  HistoryTab: undefined
}
