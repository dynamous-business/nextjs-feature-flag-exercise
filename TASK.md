# Exercise 3: Build a Skill

**As a developer**, I want the process I keep repeating encoded in my AI Layer, so the agent runs it my way
every time instead of me re-typing it.

About 25 minutes. Pairs welcome.

---

## Build a skill

A skill is a folder with a `SKILL.md` in it: a name, a description of **when** to use it, and the procedure the
agent follows. The description is always loaded; the body loads only when the work matches. That's progressive
disclosure, and it's why skills scale where a giant `CLAUDE.md` doesn't.

**Pick one:**

- **A. Build a new skill** for something you repeated today, or repeat every week. Rule of three: if you've
  prompted it three times, bank it. Ideas: a changelog from recent commits, your team's PR description, a
  "prep this ticket" checklist, a seed-data generator for this app, an API-docs update for a changed endpoint,
  the way you debug.
- **B. Adapt a shipped one.** Make `piv-plan-implementation` *yours* by encoding what a good plan looks like on
  your team (a "Planning conventions (always)" block), or have it fan out the `codebase-analyst` and
  `research-agent` subagents **in parallel, in a single message** before it plans. Ask your agent to commit a
  baseline first, so you can compare.

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

## Notes

- The best skill is one you'll use tomorrow. Pick something real.
- Skills are just files in `.claude/`. Commit them and your whole team inherits them.
- The shipped skills in `.claude/skills/` are the house style to copy from. `skills-create` is itself a skill.
