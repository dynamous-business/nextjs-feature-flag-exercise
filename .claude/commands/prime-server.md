---
description: Prime agent with server/backend codebase understanding
argument-hint: [jira-issues] [confluence-pages]
---

# Prime Server: Load Backend Context

**Input**: $ARGUMENTS

## Objective

Build comprehensive understanding of the server codebase by analyzing structure and key files.

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

1. Study the entry point (`server/src/index.ts`)
2. Study the services (`server/src/services/`)
3. Study the middleware (`server/src/middleware/`)
4. Study the database layer (`server/src/db/`)
5. Check `server/package.json` for dependencies

## Output

Produce a scannable summary of what you learned:

- **Purpose**: What the backend does
- **Tech Stack**: Framework, database, validation
- **API Routes**: Available endpoints
- **Data Model**: Core entities from `shared/types.ts`
- **Patterns**: Database patterns, error handling, validation approach

Use bullet points. Keep it concise.
