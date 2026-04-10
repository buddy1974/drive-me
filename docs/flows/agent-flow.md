# Agent Flow — Drive Me

## Overview
The agent (driver) journey from registration to payment receipt.

---

## 1. Onboarding
- [ ] Phone number input + OTP
- [ ] Full name
- [ ] Upload license / ID photo
- [ ] Vehicle details (plate, make, model)
- [ ] Admin approval (async)
- [ ] Approved notification → go online

## 2. Going Online
- [ ] Toggle online/offline
- [ ] Location sharing starts
- [ ] Visible to users in area

## 3. Receiving a Job
- [ ] Job request notification (sound + vibration)
- [ ] See pickup location on map
- [ ] Accept or decline (30s timeout)
- [ ] If accepted: navigate to pickup

## 4. Executing the Ride
- [ ] Mark "Arrived at pickup"
- [ ] Mark "Started ride"
- [ ] Navigate to drop location
- [ ] Mark "Ride completed"

## 5. Payment
- [ ] Payment processed by user
- [ ] Agent notified of payment confirmation
- [ ] Earnings credited to wallet

## 6. Post-Ride
- [ ] See user rating
- [ ] Available for next job

---

## Screens List
- `AgentSplashScreen`
- `AgentPhoneInputScreen`
- `AgentOtpVerifyScreen`
- `AgentRegistrationScreen`
- `AgentPendingApprovalScreen`
- `AgentHomeScreen` (online toggle + earnings)
- `AgentJobRequestScreen`
- `AgentNavigationScreen`
- `AgentRideProgressScreen`
- `AgentEarningsScreen`
- `AgentProfileScreen`
