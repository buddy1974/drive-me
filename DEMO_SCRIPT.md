# Drive Me — Investor Demo Script
### 5-Minute Live Product Demo

---

## SETUP CHECKLIST
*(Complete this 15 minutes before investors enter the room)*

- [ ] Laptop open to admin panel — logged in, dashboard visible, **not the login screen**
- [ ] iPhone 11 (user phone) — Drive Me app open on RoleScreen, screen brightness 100%
- [ ] iPhone 15 (agent phone) — Drive Me app open on AgentHomeScreen, online toggle ON
- [ ] Both phones on airplane mode OFF, connected to same WiFi as API server
- [ ] API server running and healthy — check `https://api.driveme.cm/health` returns 200
- [ ] At least 1 verified agent seeded in the database (status: APPROVED)
- [ ] Admin panel showing at least 3–5 historical jobs for credibility
- [ ] Screen mirroring ready if projecting — test before the room fills
- [ ] Phone stand or second person to hold agent phone during Act 3
- [ ] Silence both phones (vibrate only) — no notification sounds except the app's own

---

## OPENING
### 30 seconds

[ACTION] Stand. No slides. Laptop closed. Hold nothing.

---

"Every day in Cameroon, someone needs to pay a bill at a CNPS office.
They queue for two hours. Maybe three.
Their employer loses a half-day of work.
The economy loses that time — permanently.

We built Drive Me to give that time back."

[PAUSE — 2 seconds]

"This is a live demo. Real app. Real server. Real money moving."

[ACTION] Open laptop. Admin panel fills the screen.

---

## ACT 1 — THE PLATFORM
### 1 minute

[ACTION] Gesture toward the dashboard — don't click yet, let them take it in.

---

"What you're looking at is the Drive Me operations dashboard.
This is what our team sees in real time.

Top line — active jobs right now, agents online, revenue today.
Everything live. No refresh needed."

[ACTION] Click to the Agents page.

"Before any agent touches our platform, they go through here.
ID verification. Vehicle check. Background screening.
We approve or reject — manually, for now — before they can accept a single job.

That's how we keep quality high from day one.
*C'est notre filtre de confiance* — our trust filter."

[ACTION] Click to the Jobs monitoring page.

"Every job that flows through Drive Me is tracked at the status level.
Pending, accepted, en route, completed, cancelled — we see it all.
If something goes wrong, we know before the customer calls us."

[PAUSE — 1 second]

"Now let me show you how a job actually starts."

[ACTION] Pick up iPhone 11 (user phone).

---

## ACT 2 — USER PLACES ORDER
### 1.5 minutes

[ACTION] Hold phone so investors can see the screen. Show the RoleScreen.

---

"This is the customer app.
First screen — two choices. Are you a customer, or are you an agent?
No account needed to start. Just your phone number."

[ACTION] Tap "I need a task done."

"They enter their Cameroonian number.
We send an OTP via Africa's Talking — works on every network, MTN and Orange."

[ACTION] Enter phone number, show OTP screen.

"In the field, this takes about four seconds.
The SMS lands before you've finished looking at your phone."

[ACTION] Enter OTP code, proceed to HomeScreen.

"They're in.
Three service types — Errand, Pickup, Delivery.
Today I'm placing a delivery order."

[ACTION] Tap "Delivery" service card, navigate to PlaceOrderScreen.

"Say I need urgent documents delivered across town.
I describe the job —"

[ACTION] Type in description field: "Deliver signed contract to notary office in Bastos. Handle with care."

"Where it's coming from — my quarter, my street."

[ACTION] Fill in pickup address: "Rue Nachtigal", quarter: "Centre-ville"

"Where it needs to go."

[ACTION] Fill in destination address: "Rue des Ministères", quarter: "Bastos"

"Payment method.
MTN MoMo, Orange Money, or cash.
No card. No bank account required.
This is Cameroon — mobile money *is* the bank."

[ACTION] Select MTN MoMo. Tap "Request Agent."

[PAUSE — 1.5 seconds while the request submits]

"Job is live. The system just broadcast this request to every online agent
within our coverage area."

[ACTION] Show the JobTrackingScreen — status: PENDING, "Finding agent…"

"The customer sees this. They wait. On average — under 3 minutes."

---

## ACT 3 — AGENT ACCEPTS
### 1.5 minutes

[ACTION] Set down iPhone 11. Pick up iPhone 15 (agent phone).

---

"Over here — this is the agent's world."

[ACTION] Show AgentHomeScreen. The new job should be visible in the list.

"This agent is online. The toggle is green.
Every 10 seconds, the app polls for available jobs.
They just saw this request appear."

[ACTION] Tap on the job card to open JobDetailScreen.

"Before they commit, they see everything.
The task. The pickup quarter. The payment method.
And — critically — their earnings.

We take 15% commission. The agent sees their net before they accept.
No surprises. *Pas de mauvaises surprises.*"

[ACTION] Point to the earnings card — highlight the XAF amount.

"This agent is going to earn—"

[ACTION] Read the XAF amount shown on screen.

"—for one errand. In Yaoundé, that's meaningful money."

[ACTION] Tap "Accept Job."

[PAUSE — 1 second]

"Job accepted."

[ACTION] Show ActiveJobScreen — status: ACCEPTED.

"The agent now has a step-by-step workflow.
Start en route. Arrive at pickup. Start job. Mark complete.
Each tap updates the customer's tracking screen in real time."

[ACTION] Tap "Start — En Route." Show status update.

[ACTION] Quickly pick up iPhone 11 — show JobTrackingScreen, status now: EN_ROUTE_TO_PICKUP.

"Customer sees this. Instantly.
No phone call. No WhatsApp message. No guessing."

[ACTION] Set iPhone 11 down. Return to laptop.

"And back in the admin panel —"

[ACTION] Refresh the Jobs page on laptop.

"— the job has moved. The platform caught it.
Every status change is logged with a timestamp.
If there's ever a dispute, we have the audit trail."

---

## ACT 4 — THE CLOSE
### 30 seconds

[ACTION] Step back slightly. Laptop stays visible. Both phones down.

---

"In the last four minutes, you watched a customer in Yaoundé
request a service, get matched with a vetted agent,
and start tracking them in real time —
all without a bank account, all on a phone they already own,
paying with mobile money they already use.

[PAUSE — 2 seconds]

We're not building for a market that needs to change its habits.
We're building for a market that already has the habits —
it just never had the infrastructure."

[PAUSE — 1.5 seconds]

"That's Drive Me."

---

## INVESTOR QUESTIONS
*Tight answers. Speak slowly. Don't fill the silence.*

---

### Q1: "Why hasn't this been done in Cameroon before?"

"It has been attempted. Informally — WhatsApp groups, individual freelancers charging per errand.
What hasn't existed is the infrastructure underneath it:
verified agents, real-time tracking, mobile money integration, dispute resolution.
The pieces were all there. The platform connecting them wasn't.

We're not inventing a new behaviour. People in Yaoundé have always paid someone to queue for them.
We're formalising it. Pricing it. Making it safe.
*C'est ça la différence* — that's the difference."

---

### Q2: "How do you verify agents?"

"Three-step process before a single job is accepted.

First — phone confirmation. The number must be real and active on the Cameroonian network.
Second — ID document upload. National ID or passport. We verify it manually against their face.
Third — physical vehicle check for motorbike and car agents. Plate, condition, insurance.

Every verification is logged in the admin panel you just saw.
Approved agents are marked VERIFIED. They can go online. No one else can.

The two agents in the pending queue right now will be reviewed before end of day.
That's our standard — same-day turnaround on verifications."

---

### Q3: "What stops a big player like Glovo from entering?"

"Glovo is a restaurant delivery company. Their model needs dense restaurant supply,
credit card penetration, and smartphone users with data plans.
Yaoundé has maybe 12% credit card penetration.
Glovo would need to rebuild their entire payment and supply layer from scratch.

Our model is different by design. Mobile money native. Agents on foot, motorbike, or car.
Any task — not just food. Any quarter, not just the city centre.

And by the time a well-funded competitor arrives,
we will have 18 months of operational data, agent relationships, and customer habit.
*Le marché sera déjà le nôtre.* The market will already be ours."

---

### Q4: "How do you handle the unaddressed streets problem?"

"This is the most important infrastructure question in African logistics, and most platforms ignore it.

In Yaoundé, maybe 30% of streets have signage. The rest are described by landmarks —
'après le grand manguier,' after the big mango tree.
That breaks GPS. It breaks address forms. It breaks ETA calculations.

Our Phase 2 roadmap integrates What3Words — a system that divides the entire world
into 3-metre squares, each with a unique three-word address.
Every compound in Cameroon, whether or not it has a street sign,
gets a precise, shareable location that fits in an SMS.

An agent receiving a job sees the What3Words address, opens it in the app, and navigates there exactly.
No more 'appelle-moi quand tu arrives' — no more 'call me when you get close.'
Three words. Three metres. Anywhere in the country."

---

### Q5: "What is the revenue model and when do you break even?"

"We take 15% commission on every completed job. That's the only revenue line right now — clean, simple, aligned.
The agent earns more by completing jobs. We earn more when they do. One interest.

Average job value is 2,500 XAF. Our take is 375 XAF.
Direct cost per job: roughly 10 XAF in SMS costs, negligible server cost at this scale.
Contribution margin is above 95%.

Fixed costs today — two operators, servers, one vehicle for agent verification visits —
run about 850,000 XAF per month.

Break-even: 2,270 completed jobs per month. That's 76 jobs per day.
With 14 active agents averaging 3 jobs each — we're at 42 per day in beta.
We need to double the agent pool and we break even.
That's a hiring problem, not a demand problem.
The demand is already there."

---

*End of script.*

---

> **Internal note:** If the live API is unavailable on demo day, have a screen recording of
> the full flow as fallback. Never demo with a prototype or mock data —
> if you must use the recording, say so upfront: *"We'll use a recording from yesterday's
> session — the live version is deployed, I just don't want a WiFi hiccup to steal the moment."*
> Investors respect honesty more than a frozen spinner.
