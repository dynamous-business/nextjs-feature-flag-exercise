# Exercise 3: Build a Skill, Then a Guarantee

**As a developer**, I want the process I keep repeating encoded in my AI Layer, so the agent runs it my way
every time, and I want the one thing that must never slip enforced by a hook rather than asked for in a rule.

Two parts, about 15-20 minutes each. Work in pairs for Part 1.

---

## Part 1: Build a skill

A skill is a folder with a `SKILL.md` in it: a name, a description of **when** to use it, and the procedure the
agent follows. The description is always loaded; the body loads only when the work matches. That's progressive
disclosure, and it's why skills scale where a giant `CLAUDE.md` doesn't.

**Pick one** (pair up and pick together):

- **A. Build a new skill** for something you repeated today, or repeat every week. Rule of three: if you've
  prompted it three times, bank it. Ideas: a changelog from recent commits, your team's PR description, a
  "prep this ticket" checklist, a seed-data generator for this app, an API-docs update for a changed endpoint.
- **B. Adapt a shipped one.** Make `piv-plan-implementation` *yours* by encoding what a good plan looks like on
  your team (a "Planning conventions (always)" block), or have it fan out the `codebase-analyst` and
  `research-agent` subagents **in parallel, in a single message** before it plans. Keep a baseline first:
  `git add -A && git commit -m "before adapting the planner"`.

**Don't write it by hand.** The meta-skill interviews you and builds it to the standard:

```
/skills-create <what you want the skill to do, or which shipped skill to adapt and why>
```

It asks for input, process and output, writes `.claude/skills/<name>/SKILL.md` (plus `references/` when the
body would get long), and validates it.

**Then prove it:** start a fresh session and ask for the task in plain words, without naming the skill. Did it
fire? Did it follow your process? If it didn't fire, the `description` is the problem: say *when* to use it,
with the phrases you'd actually type.

### Acceptance criteria

- [ ] `.claude/skills/<name>/SKILL.md` exists, with `name` and a `description` that says what it does **and
      when to use it**
- [ ] The body is a procedure (inputs → steps → output), not an essay
- [ ] Anything long or rarely needed lives in `references/`, with a one-line pointer from the body
- [ ] In a fresh session it triggers from a plain-language request and produces the output you expected

---

## Part 2: Build a guarantee (a hook)

A rule **asks** the agent to behave. A hook **guarantees** it: deterministic code that fires on a lifecycle
event whether the model remembers or not. Pick one thing that must *always* hold, and describe it in plain
English. Don't name an event or a file; choosing those is the skill's job.

```
/hooks-create Don't let the agent finish while the checks are red. When it tries to stop, run
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
and if anything fails, block the stop and tell it to fix the failures.
```

Or a protected path:

```
/hooks-create Never let the agent edit shared/types.ts without me. Block the edit and tell it to propose the
type change to me first.
```

Expect permission prompts on `.claude/hooks/` and `.claude/settings.json`. Approve them: you're installing code
that runs automatically. `.claude/hooks/README.md` has worked examples of all three shapes (react, gate, hand
the baton), switched off.

**Then prove it fires, both ways:** break the thing it guards (flip one assertion in
`server/src/__tests__/flags.test.ts`, or ask the agent to edit the protected file) and watch it get blocked.
Restore it and watch it pass.

### Acceptance criteria

- [ ] The hook is wired into `.claude/settings.json`, **merged** alongside anything already there
- [ ] You saw it block when it should, and allow when it should
- [ ] A Stop hook bounds its own retries, so it can't trap the agent forever

---

## Notes

- The best skill is one you'll use tomorrow. Pick something real.
- Skills and hooks are just files in `.claude/`. Commit them and your whole team inherits them.
- The shipped skills in `.claude/skills/` are the house style to copy from. `skills-create` and `hooks-create`
  are themselves skills.
