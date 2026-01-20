---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of this codebase by analyzing structure and key files.

## Process

### 1. Analyze Project Structure

Show directory structure:
!`find . -type f -name "*.ts" -o -name "*.tsx" | grep -v node_modules | head -50`

### 2. Read Core Documentation

- Read README.md
- Read CLAUDE.md
- Read task.md

### 3. Study Key Files

**Client:**
- Read `client/src/main.tsx` and `client/src/App.tsx`
- Scan components in `client/src/components/`
- Check `client/package.json` for dependencies

**Server:**
- Read `server/src/index.ts`
- Read services in `server/src/services/`
- Read middleware in `server/src/middleware/`
- Check `server/package.json` for dependencies

**Shared:**
- Read `shared/types.ts`

### 4. Understand Current State

!`git log -5 --oneline`
!`git status`

## Output Report

Provide a concise summary covering:

### Project Overview
- Purpose of the application
- Current state (what's implemented, what's the exercise)

### Tech Stack
- Frontend: framework, UI library, state management
- Backend: framework, database, validation

### Key Patterns
- Database patterns
- API patterns
- Component patterns

### Current State
- Active branch
- Recent commits

**Keep it scannable - use bullet points.**
