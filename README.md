# Feature Flag Manager: Agentic Engineering Exercise

A small feature flag dashboard with a React frontend and an Express backend. You can create, edit, toggle and
delete flags across environments, with flag types, owners, tags and rollout percentages. It is the hands-on
project for the Agentic Engineering masterclass: small enough to understand in minutes, real enough that an
agent can get it wrong.

The ticket is in [TASK.md](./TASK.md).

## The branches

| Branch | What it is | Used for |
|---|---|---|
| `main` | The app **with the full AI Layer** in `.claude/` (the same as `exercise-2`) | Start here to explore the AI Layer, or to run the loop on a ticket of your own |
| `exercise-1` | The app with project docs only. **No AI Layer.** | Exercise 1, the baseline: build the ticket with your current process |
| `exercise-2` | The same app **with the AI Layer installed** in `.claude/` (skills, subagents, references, hook templates) | Exercise 2: the *same* ticket, run through the R-PIV loop |
| `exercise-3` | The same as `exercise-2`, with a different `TASK.md` | Exercise 3: build a skill, then a hook |

The application code is identical on every branch. The only differences are the AI Layer (absent on
`exercise-1`) and the task (`exercise-3` has its own). The AI Layer is the same one published in
[dynamous-business/goto-copenhagen-masterclass-resources](https://github.com/dynamous-business/goto-copenhagen-masterclass-resources).

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- Git, and a GitHub account
- [Claude Code](https://code.claude.com), logged in on a paid plan (Max is ideal for a full day; Pro may hit its
  usage limit in the afternoon; an Anthropic API key also works)
- Optional: [uv](https://docs.astral.sh/uv/) (the shipped hook templates run with it) and
  [agent-browser](https://github.com/vercel-labs/agent-browser) (`npm install -g agent-browser && agent-browser install`)
  so the agent can test the UI like a user

## Quick start

```bash
git clone https://github.com/dynamous-business/nextjs-feature-flag-exercise
cd nextjs-feature-flag-exercise
git switch exercise-1                  # the masterclass starts here

cd server && pnpm install && cd ../client && pnpm install && cd ..
```

Then in two terminals:

```bash
cd server && pnpm dev    # API on http://localhost:3001
```

```bash
cd client && pnpm dev    # app on http://localhost:3000
```

The server seeds sample flags into `server/flags.db` on first run. Delete that file to reset the data.

## Moving between exercises

Commit before every switch, so nothing carries from one exercise into the next:

```bash
git switch exercise-1                                                  # Exercise 1 (baseline)
git add -A && git commit -m "baseline" && git switch exercise-2        # the AI Layer appears in .claude/
git switch -c my-rpiv                                                  # Exercise 2 happens here
git add -A && git commit -m "r-piv" && git switch exercise-3           # Exercise 3
git add -A && git commit -m "skill + hook" && git switch my-rpiv       # Exercise 4
```

Dependencies are identical on every branch, so there's no need to reinstall after switching.

## Validation

```bash
cd server && pnpm run build && pnpm run lint && pnpm test
cd ../client && pnpm run build && pnpm run lint
```

All of these pass on a fresh clone of every branch.
