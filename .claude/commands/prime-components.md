---
description: Learn how to build components in this codebase
argument-hint: [jira-issues] [confluence-pages]
---

# Prime Components: How to Build Components

**Input**: $ARGUMENTS

## Objective

Understand the component patterns used in this codebase so you can build new components correctly.

## Process

### Step 0: Load External Context (if provided)

The first argument is an optional Jira issue key or comma-separated list of keys (e.g., `RH-5` or `RH-5,RH-6,RH-7`). The second argument is an optional Confluence page ID or comma-separated list of IDs (e.g., `123456` or `123456,789012`).

If Jira issues are provided:
1. Call `mcp__atlassian__getAccessibleAtlassianResources` to get the `cloudId`
2. For each issue key, call `mcp__atlassian__getJiraIssue` with `responseContentFormat: "markdown"` to fetch the issue summary, description, acceptance criteria, and any other relevant context
3. Use this context to inform your understanding of what work is expected

If Confluence page IDs are provided:
1. Call `mcp__atlassian__getAccessibleAtlassianResources` to get the `cloudId` (skip if already retrieved above)
2. For each page ID, call `mcp__atlassian__getConfluencePage` with `contentFormat: "markdown"` to fetch the page content
3. Use this context as additional background for understanding the project

### Step 1: Analyze the Codebase

1. Study the UI primitives in `client/src/components/ui/` (shadcn components)
2. Study `client/src/lib/utils.ts` for the `cn()` utility
3. Study feature components as examples:
   - `client/src/components/flags-table.tsx` - data display pattern
   - `client/src/components/flag-form-modal.tsx` - form with dialog pattern
   - `client/src/components/delete-confirm-dialog.tsx` - confirmation dialog pattern

## Output

Produce a scannable summary of what you learned:

- **UI Library**: Available shadcn components
- **Styling**: How Tailwind and cn() are used
- **Props Pattern**: How props interfaces are defined
- **Composition**: How feature components compose UI primitives
- **State**: How local state is managed in components

Use bullet points. Keep it concise.
