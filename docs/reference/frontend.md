# Frontend Best Practices

On-demand context for building frontend features in this codebase.

---

## Component Architecture

### Component Hierarchy

```
App
└── QueryClientProvider
    └── FlagsApp (Main Container)
        ├── FlagsTable (Display)
        ├── FlagFormModal (Create/Edit)
        └── DeleteConfirmDialog (Confirmation)
```

### Component Types

| Type | Responsibility | Example |
|------|----------------|---------|
| Container | State + mutations + orchestration | `FlagsApp` in `App.tsx` |
| Presentational | Receives props, renders UI | `FlagsTable`, `FlagFormModal` |
| UI Primitive | Reusable, styled atoms | `Button`, `Dialog`, `Badge` |

### File Structure

```
src/
├── api/flags.ts              # API client functions
├── components/
│   ├── ui/                   # Radix UI primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── flags-table.tsx       # Feature component
│   ├── flag-form-modal.tsx   # Feature component
│   └── delete-confirm-dialog.tsx
├── lib/utils.ts              # Utilities (cn function)
├── App.tsx                   # Root + container
└── main.tsx                  # Entry point
```

---

## Creating Components

### Props Interface Pattern

```typescript
// Always define Props interface
interface FlagsTableProps {
  flags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flag: FeatureFlag) => void
}

// Destructure in function signature
export function FlagsTable({ flags, onEdit, onDelete }: FlagsTableProps) {
  // ...
}
```

### Controlled Component Pattern

```typescript
// State in parent
const [formData, setFormData] = useState({
  name: '',
  description: '',
  enabled: false,
})

// Update via onChange
<Input
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

### Form with Dialog Pattern

```typescript
// See: client/src/components/flag-form-modal.tsx

<Dialog open={open} onOpenChange={handleOpenChange}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>{isEditing ? 'Edit Flag' : 'Create Flag'}</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

---

## State Management (TanStack Query)

### Query Setup

```typescript
// In App.tsx
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlagsApp />
    </QueryClientProvider>
  )
}
```

### Fetching Data

```typescript
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags'],
  queryFn: getFlags,
})

// Always provide default for arrays
// queryKey is used for caching and invalidation
```

### Mutations

```typescript
const qc = useQueryClient()

const createMutation = useMutation({
  mutationFn: createFlag,
  onSuccess: () => {
    // Invalidate cache to refetch
    qc.invalidateQueries({ queryKey: ['flags'] })
    // Close modal
    setIsFormOpen(false)
  },
  onError: (error: Error) => {
    // Keep modal open for retry
    console.error('Failed:', error.message)
  },
})

// Usage
createMutation.mutate(formData)

// Check state
createMutation.isPending  // true while request in flight
```

### Query Key Convention

```typescript
// Collection
queryKey: ['flags']

// Single item (if needed)
queryKey: ['flags', id]

// With filters (if needed)
queryKey: ['flags', { environment: 'production' }]
```

---

## Styling (Tailwind CSS)

### Class Composition with cn()

```typescript
import { cn } from '@/lib/utils'

// Always use cn() for conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'large' && "large-classes"
)} />
```

### Color Mapping Pattern

```typescript
// Define color map with Record type
const environmentColors: Record<Environment, string> = {
  development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  staging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  production: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}

// Use in component
<Badge className={environmentColors[flag.environment]}>
  {flag.environment}
</Badge>
```

### Button Variants (CVA)

```typescript
// See: client/src/components/ui/button.tsx

<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Danger</Button>
<Button variant="ghost">Subtle</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

### Responsive Patterns

```typescript
// Mobile-first
className="flex flex-col sm:flex-row"

// Conditional visibility
className="hidden sm:block"

// Responsive widths
className="w-full sm:w-auto"
```

---

## API Client

### Location

`client/src/api/flags.ts`

### Pattern

```typescript
const API_BASE = 'http://localhost:3001/api'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function getFlags(): Promise<FeatureFlag[]> {
  const response = await fetch(`${API_BASE}/flags`)
  return handleResponse<FeatureFlag[]>(response)
}

export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  const response = await fetch(`${API_BASE}/flags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<FeatureFlag>(response)
}
```

### Error Handling

```typescript
try {
  const response = await fetch(url)
  // ...
} catch (error) {
  if (error instanceof TypeError) {
    throw new Error('Unable to connect to server. Please check your connection.')
  }
  throw error
}
```

---

## UI Components (Radix UI)

### Available Primitives

| Component | Import | Usage |
|-----------|--------|-------|
| Button | `@/components/ui/button` | Actions, submit |
| Dialog | `@/components/ui/dialog` | Modals |
| AlertDialog | `@/components/ui/alert-dialog` | Confirmations |
| Select | `@/components/ui/select` | Dropdowns |
| Input | `@/components/ui/input` | Text fields |
| Label | `@/components/ui/label` | Form labels |
| Switch | `@/components/ui/switch` | Toggles |
| Badge | `@/components/ui/badge` | Status indicators |
| Table | `@/components/ui/table` | Data tables |

### Dialog Pattern

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      {/* Actions */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select Pattern

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## TypeScript Patterns

### Type Imports

```typescript
// Use 'type' keyword for type-only imports
import type { FeatureFlag, Environment } from '@shared/types'
```

### Generic Event Handlers

```typescript
// Form submit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // ...
}

// Input change (inferred)
onChange={(e) => setValue(e.target.value)}
```

### State with Union Types

```typescript
const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)

// Check before use
if (selectedFlag) {
  // TypeScript knows selectedFlag is FeatureFlag here
}
```

---

## Accessibility

### Labels

```typescript
<Label htmlFor="name">Name</Label>
<Input id="name" />
```

### ARIA (via Radix)

Radix components handle ARIA automatically:
- Dialog has `role="dialog"` and focus management
- AlertDialog has proper alert semantics
- Select has combobox semantics

### Loading States

```typescript
<Button disabled={isPending}>
  {isPending ? 'Saving...' : 'Save'}
</Button>
```

---

## Common Patterns

### Form Reset on Close

```typescript
const handleOpenChange = (newOpen: boolean) => {
  if (!newOpen) {
    // Reset form state when closing
    setFormData(emptyFormData)
  }
  onOpenChange(newOpen)
}
```

### Tags as Comma-Separated Input

```typescript
const [tagsInput, setTagsInput] = useState('')

// On submit, convert to array
const tags = tagsInput
  .split(',')
  .map(t => t.trim())
  .filter(t => t.length > 0)
```

### Conditional Rendering

```typescript
// Short-circuit
{isLoading && <Spinner />}

// Ternary
{error ? <Error /> : <Content />}

// Early return
if (isLoading) return <Spinner />
```
