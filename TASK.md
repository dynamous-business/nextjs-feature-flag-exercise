# Exercise 3: Build Your Debugging Skill

**As a developer**, I want the way I debug encoded in my AI Layer, so that when I hand the agent a bug it
diagnoses before it fixes, every time, instead of guessing at a patch.

About 25 minutes. Work in pairs if you like.

---

## Why a debugging skill

The most expensive agent habit is **fixing before understanding**: it sees a symptom, edits the nearest
plausible line, and the tests go green for the wrong reason. The workflow on the slides is the cure:

1. **Reproduce.** A failing test or a reliable repro *before* anything changes.
2. **Locate.** A named root cause with evidence (the file, the line, why), not a guess.
3. **Fix.** One cause, one change, with the failing test as the acceptance check.
4. **Prevent.** Encode the lesson (a rule, a skill step, a test) so this class of bug can't come back.

You'll turn that into a skill, so it runs the same way whether you remember to ask for it or not.

A skill is a folder with a `SKILL.md`: a name, a description of **when** to use it, and the procedure the
agent follows. The description is always loaded; the body loads only when the work matches (progressive
disclosure).

---

## Build it

**Don't write it by hand.** The meta-skill interviews you and builds it to the standard:

```
/skills-create A debugging skill: given a bug report in plain words, reproduce it first (a failing test or a
repro), find the root cause with evidence before changing any code, make one fix that turns the failing test
green, then say what rule, skill step or test would stop this class of bug coming back.
```

Make it **yours**: what counts as a repro on your team, how deep the root-cause digging goes, what it hands
back. Keep it **local**: it works from the bug you describe, and it doesn't post to GitHub.

## Prove it on a real bug

Start a **fresh session** and describe the bug in plain words, **without naming the skill**:

> The app lets me create a flag with an expiry date that has already passed. Figure out why.

(It's a real bug in this app.) Did the skill fire? Did it reproduce and name the root cause **before** it
touched any code? If it didn't fire, the `description` is the problem: say *when* to use it, with the phrases
you'd actually type ("bug", "broken", "figure out why", "not working").

---

## Acceptance criteria

- [ ] `.claude/skills/<name>/SKILL.md` exists, with `name` and a `description` that says what it does **and
      when to use it**
- [ ] The body is a procedure (reproduce → locate → fix → prevent), not an essay
- [ ] In a fresh session it triggers from a plain-language bug report
- [ ] It names the root cause, with evidence, **before** editing code
- [ ] The fix comes with a test that failed before and passes after

## Stretch (fast finishers)

- Compare yours with the shipped one: `.claude/skills/piv-investigate-issue/SKILL.md` (you'll see it demoed next).
- Add a guarantee with `/hooks-create`, e.g. *"don't let the agent finish while the checks are red"*. Hooks ship
  switched off; `.claude/hooks/README.md` has worked examples.

## Notes

- Skills are just files in `.claude/`. Commit yours and your whole team inherits the way you debug.
- The shipped skills in `.claude/skills/` are the house style to copy from. `skills-create` is itself a skill.
