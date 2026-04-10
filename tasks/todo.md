# Drive Me — Task Board

## Status Legend
- [ ] TODO
- [x] DONE
- [~] IN PROGRESS

---

## Stage 1 — Monorepo Setup
- [x] Root package.json + turbo.json
- [x] apps/api structure + package.json + Prisma schema
- [~] apps/admin (Next.js) — installing
- [~] apps/mobile (Expo) — installing
- [x] packages/types — IUser, IAgent, IJob, IPayment, enums
- [x] packages/utils — formatCurrency, formatPhone, validateCMRPhone
- [x] packages/ui — empty shell
- [x] packages/config — empty shell
- [x] infrastructure/ — docker-compose, nginx, setup.sh
- [x] docs/flows/ — user, agent, admin flows
- [x] docs/api/openapi.yaml
- [ ] yarn install from root
- [ ] turbo dry-run verification

## Stage 2 — Flow Documentation
- [ ] Finalize user-flow.md
- [ ] Finalize agent-flow.md
- [ ] Finalize admin-flow.md

## Stage 3 — API Core
- [ ] Auth routes (OTP request + verify)
- [ ] JWT middleware
- [ ] User routes (CRUD)
- [ ] Agent routes (CRUD + status)
- [ ] Job routes (create, accept, update status)
- [ ] Payment routes (initiate, webhook)
- [ ] Socket.io real-time events

## Stage 4 — Admin Panel
- [ ] Dashboard page
- [ ] Agent management pages
- [ ] User management pages
- [ ] Jobs list + detail
- [ ] Payments list + detail

## Stage 5 — Mobile App
- [ ] Navigation setup (user stack + agent stack)
- [ ] Auth screens (phone + OTP)
- [ ] User home + booking flow
- [ ] Agent home + job acceptance flow
- [ ] Real-time tracking screen
- [ ] Payment screen (MTN/Orange)

## Stage 6 — Production
- [ ] Security checklist
- [ ] Vercel deploy (admin)
- [ ] API deploy (VPS / Render)
- [ ] Cloudflare DNS setup
- [ ] Expo build (EAS)
