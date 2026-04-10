# Admin Flow — Drive Me

## Overview
Admin panel for operations, agent management, and monitoring.

---

## 1. Authentication
- [ ] Email + password login
- [ ] Role-based access (super admin / ops)

## 2. Dashboard
- [ ] Active jobs (live count)
- [ ] Online agents (live count)
- [ ] Revenue today / this week / this month
- [ ] Recent jobs list

## 3. Agent Management
- [ ] List all agents (pending / active / suspended)
- [ ] Review agent registration (approve / reject)
- [ ] View agent details + documents
- [ ] Suspend / reactivate agent

## 4. User Management
- [ ] List all users
- [ ] View user profile + ride history
- [ ] Block / unblock user

## 5. Jobs
- [ ] Live jobs map view
- [ ] Job detail (timeline, user, agent, payment)
- [ ] Force cancel a job

## 6. Payments
- [ ] Transaction list with filters
- [ ] Payment detail
- [ ] Manual refund trigger (via API)

## 7. Settings
- [ ] Pricing config (base fare, per km rate)
- [ ] Service area (geofence config)
- [ ] OTP / SMS provider settings

---

## Pages List
- `/dashboard`
- `/agents` + `/agents/[id]`
- `/users` + `/users/[id]`
- `/jobs` + `/jobs/[id]`
- `/payments` + `/payments/[id]`
- `/settings`
