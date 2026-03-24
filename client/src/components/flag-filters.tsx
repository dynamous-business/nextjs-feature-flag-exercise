import { useState, useEffect } from 'react'
import type { FlagFilters, Environment, FlagType } from '@shared/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FlagFiltersBarProps {
  filters: FlagFilters
  onChange: (filters: FlagFilters) => void
}

const environments: Environment[] = ['development', 'staging', 'production']
const flagTypes: FlagType[] = ['release', 'experiment', 'operational', 'permission']

export function FlagFiltersBar({ filters, onChange }: FlagFiltersBarProps) {
  const [nameInput, setNameInput] = useState(filters.name ?? '')
  const [ownerInput, setOwnerInput] = useState(filters.owner ?? '')

  // Debounce name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = nameInput.trim() || undefined
      onChange({ ...filters, name: value })
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameInput])

  // Debounce owner filter
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = ownerInput.trim() || undefined
      onChange({ ...filters, owner: value })
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerInput])

  const activeCount = Object.values(filters).filter(v => v !== undefined).length

  const handleClear = () => {
    setNameInput('')
    setOwnerInput('')
    onChange({})
  }

  const handleEnvironmentChange = (value: string) => {
    onChange({
      ...filters,
      environment: value === 'all' ? undefined : (value as Environment),
    })
  }

  const handleEnabledChange = (value: string) => {
    onChange({
      ...filters,
      enabled: value === 'all' ? undefined : value === 'true',
    })
  }

  const handleTypeChange = (value: string) => {
    onChange({
      ...filters,
      type: value === 'all' ? undefined : (value as FlagType),
    })
  }

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/30">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Name search */}
        <Input
          placeholder="Search by name..."
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          className="w-44"
        />

        {/* Environment filter */}
        <Select
          value={filters.environment ?? 'all'}
          onValueChange={handleEnvironmentChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            {environments.map(env => (
              <SelectItem key={env} value={env}>
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={filters.enabled === undefined ? 'all' : String(filters.enabled)}
          onValueChange={handleEnabledChange}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value={filters.type ?? 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {flagTypes.map(t => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Owner search */}
        <Input
          placeholder="Filter by owner..."
          value={ownerInput}
          onChange={e => setOwnerInput(e.target.value)}
          className="w-44"
        />

        {/* Active filter count + clear button */}
        {activeCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
