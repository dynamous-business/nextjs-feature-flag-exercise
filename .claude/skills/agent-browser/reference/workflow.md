# Core Workflow: End-to-End Validation

Reference guide for full application validation using agent-browser.

---

## Application URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://localhost:3000` | React dashboard |
| Backend | `http://localhost:3001` | Express API |
| Health Check | `http://localhost:3001/health` | Server status |

---

## Pre-Flight Checks

Before testing, ensure both servers are running:

```bash
# Check backend health
agent-browser open http://localhost:3001/health
agent-browser get text body
# Expected: {"status":"ok"}

# Open frontend
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
```

---

## Core Feature Validation

### 1. View Flags Table

```bash
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser snapshot -i
```

**Verify:**
- Table is visible with flag data
- Columns: Name, Environment, Type, Status (toggle), Rollout %, Owner, Actions
- Each row has Edit and Delete buttons

### 2. Create New Flag

```bash
# Click Create button
agent-browser snapshot -i
agent-browser click @{create-button-ref}

# Wait for modal
agent-browser wait --text "Create Flag"
agent-browser snapshot -i

# Fill form
agent-browser fill @{name-input} "test-flag-e2e"
agent-browser fill @{description-input} "E2E test flag"
agent-browser select @{environment-select} "development"
agent-browser select @{type-select} "release"
agent-browser fill @{rollout-input} "50"
agent-browser fill @{owner-input} "test-team"

# Submit
agent-browser click @{submit-button}
agent-browser wait --load networkidle
```

**Verify:**
- Modal closes after submission
- New flag appears in table
- Flag has correct values

### 3. Edit Existing Flag

```bash
# Click Edit on a flag row
agent-browser snapshot -i
agent-browser click @{edit-button-ref}

# Wait for modal with existing data
agent-browser wait --text "Edit Flag"
agent-browser snapshot -i

# Modify a field
agent-browser fill @{description-input} "Updated description"

# Save
agent-browser click @{submit-button}
agent-browser wait --load networkidle
```

**Verify:**
- Modal pre-fills with existing flag data
- Changes persist after save
- Table reflects updated values

### 4. Toggle Flag Status

```bash
# Find toggle switch in row
agent-browser snapshot -i
agent-browser click @{toggle-switch-ref}
agent-browser wait --load networkidle
```

**Verify:**
- Toggle switches state (enabled ↔ disabled)
- Change persists (refresh page to confirm)

### 5. Delete Flag

```bash
# Click Delete button
agent-browser snapshot -i
agent-browser click @{delete-button-ref}

# Wait for confirmation dialog
agent-browser wait --text "Are you sure"
agent-browser snapshot -i

# Confirm deletion
agent-browser click @{confirm-button-ref}
agent-browser wait --load networkidle
```

**Verify:**
- Confirmation dialog appears
- Flag is removed from table after confirmation
- Canceling keeps the flag

---

## Filter Validation (Phase 5 Feature)

Once filtering is implemented:

### Filter by Environment

```bash
agent-browser snapshot -i
agent-browser select @{environment-filter} "production"
agent-browser wait --load networkidle
agent-browser snapshot -i
```

**Verify:**
- Only production flags shown
- Filter indicator visible

### Filter by Status

```bash
agent-browser click @{enabled-filter}
agent-browser wait --load networkidle
```

**Verify:**
- Only enabled flags shown

### Search by Name

```bash
agent-browser fill @{search-input} "auth"
agent-browser wait --load networkidle
```

**Verify:**
- Only flags with "auth" in name shown
- Partial match works

### Combined Filters

```bash
agent-browser select @{environment-filter} "production"
agent-browser click @{enabled-filter}
agent-browser fill @{search-input} "feature"
agent-browser wait --load networkidle
```

**Verify:**
- Filters combine with AND logic
- Only flags matching ALL criteria shown

### Clear Filters

```bash
agent-browser click @{clear-filters-button}
agent-browser wait --load networkidle
```

**Verify:**
- All flags visible again
- Filter controls reset

---

## Error State Validation

### Server Down

```bash
# Stop server, then:
agent-browser reload
agent-browser wait 2000
agent-browser snapshot -i
```

**Verify:**
- Error message displayed
- UI doesn't crash

### Invalid Form Submission

```bash
# Open create modal
agent-browser click @{create-button}
agent-browser wait --text "Create Flag"

# Try to submit empty form
agent-browser click @{submit-button}
```

**Verify:**
- Validation errors shown
- Form doesn't submit

### Duplicate Flag Name

```bash
# Try to create flag with existing name
agent-browser fill @{name-input} "existing-flag-name"
# ... fill other fields
agent-browser click @{submit-button}
agent-browser wait 1000
```

**Verify:**
- Error message about duplicate name
- Modal stays open for correction

---

## Full Validation Checklist

Run through this checklist for complete validation:

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Flags table displays correctly
- [ ] Create flag works
- [ ] Edit flag works
- [ ] Toggle flag works
- [ ] Delete flag (with confirmation) works
- [ ] Filter by environment works
- [ ] Filter by status works
- [ ] Filter by type works
- [ ] Search by name works
- [ ] Combined filters work
- [ ] Clear filters works
- [ ] Error states handled gracefully

---

## Tips

1. **Always re-snapshot** after page changes - element refs change after DOM updates
2. **Use `wait --load networkidle`** after actions that trigger API calls
3. **Check console errors** with `agent-browser errors` if something seems wrong
4. **Use `--headed` mode** for debugging: `agent-browser open http://localhost:3000 --headed`
