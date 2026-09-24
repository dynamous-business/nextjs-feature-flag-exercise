import type { FeatureFlag, Environment, FlagType } from '@shared/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface FlagsTableProps {
  flags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flag: FeatureFlag) => void
}

const environmentColors: Record<Environment, string> = {
  development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  staging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  production: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}

const typeColors: Record<FlagType, string> = {
  release: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  experiment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  operational: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  permission: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
}

export function FlagsTable({ flags, onEdit, onDelete }: FlagsTableProps) {
  if (flags.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No feature flags found. Create your first flag to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rollout</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags.map((flag) => (
            <TableRow key={flag.id}>
              <TableCell className="font-medium">{flag.name}</TableCell>
              <TableCell>
                <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                  {flag.enabled ? 'ON' : 'OFF'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={environmentColors[flag.environment]} variant="outline">
                  {flag.environment}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={typeColors[flag.type]} variant="outline">
                  {flag.type}
                </Badge>
              </TableCell>
              <TableCell>{flag.rolloutPercentage}%</TableCell>
              <TableCell>{flag.owner}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {flag.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {flag.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{flag.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(flag)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(flag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
