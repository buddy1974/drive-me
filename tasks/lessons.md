# Drive Me — Lessons Learned

_Updated as issues are found and fixed._

---

## Setup
- yarn was not pre-installed globally; installed via `npm install -g yarn` before monorepo init
- Next.js create-app uses `--no-src-dir` flag (not `--no-src`) to place pages at root level of app dir
- Expo blank-typescript template requires `--template blank-typescript` not `--template typescript`
