# Exercise 3: Workflow Automation (Group Exercise)

Identify repetitive workflows in your team that could become reusable AI commands.

## The Exercise

In your group, discuss and document:

1. **Identify** - What tasks do you do repeatedly?
   - Code review patterns
   - PR/commit workflows
   - Testing routines
   - Documentation updates
   - Debugging steps
   - Deployment checks

2. **Analyze** - For each workflow:
   - What are the steps?
   - What input does it need?
   - What output should it produce?
   - What validations should it run?

3. **Design** - Pick one workflow and sketch a command:
   - Command name and description
   - Input format (arguments or questions)
   - Process phases
   - Output format

## Command Template

Use the commands from Exercise 2 as reference:

```
.claude/commands/
```

## Example Workflows to Consider

- Pre-PR checklist (lint, test, changelog)
- Bug investigation process
- Feature flag rollout
- Database migration review
- API endpoint creation
- Component scaffolding
- Release notes generation
- Incident response steps

## Deliverable

A draft command file (`.md`) describing your automated workflow.
