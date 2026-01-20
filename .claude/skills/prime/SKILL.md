---
name: prime
description: Prime yourself on the codebase before starting work
allowed-tools: Read, Glob, Grep, Bash
---

# Prime Command

## Input

None.

## Why

Before working on any task, the agent needs to understand the codebase structure, tech stack, patterns, and current state. This command ensures the agent has full context before making changes.

## Procedure

1. **Study the client source**
   - Read the main entry points (`client/src/main.tsx`, `client/src/App.tsx`)
   - Scan the components directory structure
   - Check the `client/package.json` for dependencies

2. **Study the server source**
   - Read the main entry point (`server/src/index.ts`)
   - Review the services, middleware, and database layers
   - Check the `server/package.json` for dependencies

3. **Study the shared types**
   - Read `shared/types.ts` to understand the data model

4. **Check current state**
   - Run `git log --oneline -10` for recent commits
   - Run `git status` to see any uncommitted changes

## Output

Produce a scannable summary with the following sections:

- **Project Purpose**: One sentence describing what this application does
- **Tech Stack**
  - Frontend: List key technologies (framework, UI library, state management)
  - Backend: List key technologies (framework, database, validation)
- **Data Model**: Brief description of the core entities
- **Key Patterns**
  - Database patterns being followed
  - API patterns
  - State management patterns
- **Current State**
  - Recent commits (last 3-5)
  - Any uncommitted changes
  - Current branch

Use bullet points. Keep it concise.
