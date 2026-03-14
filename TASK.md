# Exercise 3: Build a Skill

**As a developer**, I want to create a reusable Claude skill that automates part of my daily or weekly workflow, so I can trigger it by name and have Claude follow consistent, repeatable steps every time.

## The Goal

Create a reusable skill using the **3-tier progressive disclosure pattern** that automates something you actually do in your development workflow.

---

## Your Task

1. **Pick a workflow** you do regularly — something repetitive enough that a consistent process would save you time or reduce errors.

2. **Create a skill file** at:
   ```
   .claude/skills/<your-skill-name>/SKILL.md
   ```

3. **Test it** — invoke your skill in Claude Code and verify it follows the steps you defined.

---

## The 3-Tier Progressive Disclosure Pattern

Structure your skill so Claude loads only what it needs:

**Tier 1 — YAML Frontmatter** (always loaded, keep it short)
```yaml
---
name: your-skill-name
description: One sentence describing what this skill does
triggers:
  - "keyword or phrase that activates this skill"
  - "/slash-command-style-trigger"
---
```

**Tier 2 — SKILL.md Body** (the main instructions)
- Step-by-step process Claude should follow
- What inputs to expect, what outputs to produce
- Validation steps and error handling
- Examples of invocation

**Tier 3 — Reference Subdirectory** (optional, for deeper context)
```
.claude/skills/<skill-name>/
  SKILL.md          ← Tiers 1 & 2
  reference/
    checklist.md    ← Detailed checklists, templates, etc.
    examples.md     ← Extended examples
```
Claude only loads reference files when they're explicitly needed, keeping context lean.

---

## Skill Ideas

Pick one that fits your workflow, or invent your own:

- **Validation skill** — runs your project's specific test/lint/build pipeline and summarizes failures
- **Code review skill** — applies your team's review checklist to a diff or PR
- **Deployment skill** — walks through your CI/CD steps, checks environment variables, confirms readiness
- **Jira/Linear skill** — queries open tickets, creates tasks, or updates ticket status from the terminal
- **Changelog skill** — generates a formatted changelog from recent commits or merged PRs
- **API docs skill** — scaffolds or updates documentation for a new endpoint based on code changes

You can take inspiration from the skills in `.claude/skills/` (e.g., `agent-browser`, `pptx-generator`).

---

## Acceptance Criteria

- [ ] A `SKILL.md` file exists at `.claude/skills/<skill-name>/SKILL.md`
- [ ] The frontmatter includes `name`, `description`, and at least one `trigger`
- [ ] The skill body clearly defines the process Claude should follow (steps, inputs, outputs)
- [ ] You can invoke the skill in Claude Code and it performs the intended workflow
- [ ] (Bonus) A `reference/` subdirectory with supporting context (checklist, template, or examples)

---

## Notes

- The best skills are ones you'll actually use after today — pick something real.
- Skills are just Markdown files. The "magic" is in writing clear instructions Claude can follow consistently.
- Triggers act like slash commands — they tell Claude when to load and run the skill.
- Keep Tier 1 (frontmatter) short. Put the detail in Tier 2 (body) or push it to Tier 3 (reference files).
