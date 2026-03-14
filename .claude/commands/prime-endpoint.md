---
description: Learn how to build new API endpoints end-to-end
argument-hint: [jira-issues] [confluence-pages]
---

# Prime Endpoint: How to Build New Endpoints

**Input**: $ARGUMENTS

## Objective

Understand the full endpoint pattern from database to UI so you can build new endpoints correctly.

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

Study these files in order (this is the data flow):

1. **Types**: `shared/types.ts` - define your data contracts here first
2. **Validation**: `server/src/middleware/validation.ts` - Zod schemas for request validation
3. **Service**: `server/src/services/flags.ts` - business logic and database operations
4. **Routes**: `server/src/routes/flags.ts` - Express route handlers
5. **Error handling**: `server/src/middleware/error.ts` - custom error classes
6. **Client API**: `client/src/api/flags.ts` - fetch wrappers with types
7. **Usage**: `client/src/App.tsx` - React Query hooks for data fetching

## Output

Produce a scannable summary of what you learned:

- **Type Flow**: How types are shared between server and client
- **Validation**: How request data is validated
- **Service Pattern**: How business logic is structured
- **Route Pattern**: How routes call services and handle errors
- **Client Pattern**: How the frontend fetches and mutates data
- **React Query**: How queries and mutations are used

Use bullet points. Keep it concise.
