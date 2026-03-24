import { useState, useEffect } from 'react'
import type { FlagFilters, Environment, FlagType } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface FlagFiltersBarProps {
  filters: FlagFilters
  onFiltersChange: (filters: FlagFilters) => void
}

const ENVIRONMENTS: Environment[] = ['development', 'staging', 'production']
const FLAG_TYPES: FlagType[] = ['release', 'experiment', 'operational', 'permission']

export function FlagFiltersBar({ filters, onFiltersChange }: FlagFiltersBarProps) {
  const [nameSearch, setNameSearch] = useState(filters.name ?? '')

  // Debounce name search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, name: nameSearch || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [nameSearch])

  const activeCount = Object.values(filters).filter(v => v !== undefined).length

  const clearAll = () => {
    setNameSearch('')
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Input
        placeholder="Search by name..."
        value={nameSearch}
        onChange={e => setNameSearch(e.target.value)}
        className="w-48"
      />

      <Select
        value={filters.environment ?? 'all'}
        onValueChange={v => onFiltersChange({ ...filters, environment: v === 'all' ? undefined : v as Environment })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Environments</SelectItem>
          {ENVIRONMENTS.map(env => (
            <SelectItem key={env} value={env}>{env}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.enabled === undefined ? 'all' : String(filters.enabled)}
        onValueChange={v => onFiltersChange({ ...filters, enabled: v === 'all' ? undefined : v === 'true' })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Enabled</SelectItem>
          <SelectItem value="false">Disabled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type ?? 'all'}
        onValueChange={v => onFiltersChange({ ...filters, type: v === 'all' ? undefined : v as FlagType })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {FLAG_TYPES.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="mr-1 h-3 w-3" />
          Clear ({activeCount})
        </Button>
      )}
    </div>
  )
}
