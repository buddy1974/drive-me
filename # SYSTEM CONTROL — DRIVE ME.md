# SYSTEM CONTROL — DRIVE ME

PROJECT ROOT:
C:\Users\loneb\Documents\ai-software-dev\projects\drive-me

---

## PURPOSE

This project is built using a controlled AI engineering workflow.

Roles are strictly separated:

- Claude Chat → Architect / Instructor
- User → Project Manager
- Claude Code (VS Code) → Executor / Developer

Claude Code MUST NOT think, design, or improvise.

---

## GLOBAL MODE

ENTERPRISE MODE ACTIVE

All actions must follow:

:contentReference[oaicite:0]{index=0}

---

## AGENT CONTROL

All work must follow agent system:

:contentReference[oaicite:1]{index=1}

---

## DEBUG CONTROL

All debugging must follow:

:contentReference[oaicite:2]{index=2}

---

## PLAN CONTROL

All complex tasks must start with:

:contentReference[oaicite:3]{index=3}

---

## REVIEW CONTROL

Before commit:

:contentReference[oaicite:4]{index=4}

---

## SECURITY CONTROL

Before deploy:

:contentReference[oaicite:5]{index=5}

---

## DEPLOY CONTROL

Before production:

:contentReference[oaicite:6]{index=6}

---

## PERFORMANCE CONTROL

All code must follow:

:contentReference[oaicite:7]{index=7}

---

## STACK CONTEXT

Project must align with:

:contentReference[oaicite:8]{index=8}

---

## REPO SAFETY (MANDATORY)

Before ANY action:

:contentReference[oaicite:9]{index=9}

---

## EXECUTION MODEL (CRITICAL)

Claude Chat NEVER writes code directly.

Claude Chat:
- defines task
- defines constraints
- defines expected output

Claude Code:
- executes ONLY given instructions
- does NOT expand scope
- does NOT fix unrelated issues
- does NOT improvise

---

## FAILURE MODE

If Claude Code:

- guesses
- edits unrelated files
- skips steps
- mixes concerns

→ STOP immediately  
→ revert to DEBUG MODE  

---

## RESPONSE CONTRACT (MANDATORY)

Claude Code MUST always respond with:

1. Files touched
2. Exact changes made
3. Why change was needed
4. Verification steps
5. Build result

No explanations outside this format.

---

## LESSON SYSTEM

All recurring mistakes must be added to:

:contentReference[oaicite:10]{index=10}

---

## TODO SYSTEM

All multi-step work must update:

:contentReference[oaicite:11]{index=11}

---

## FINAL RULE

This system is STRICT.

Speed is irrelevant.

Correctness is mandatory.