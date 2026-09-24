import { useState, useMemo } from 'react'
import type { FeatureFlag, CreateFlagInput, Environment, FlagType } from '@shared/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FlagFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flag?: FeatureFlag | null
  onSubmit: (data: CreateFlagInput) => void
  isLoading?: boolean
}

const environments: Environment[] = ['development', 'staging', 'production']
const flagTypes: FlagType[] = ['release', 'experiment', 'operational', 'permission']

const emptyFormData: CreateFlagInput = {
  name: '',
  description: '',
  enabled: false,
  environment: 'development',
  type: 'release',
  rolloutPercentage: 100,
  owner: '',
  tags: [],
  expiresAt: null,
}

export function FlagFormModal({
  open,
  onOpenChange,
  flag,
  onSubmit,
  isLoading,
}: FlagFormModalProps) {
  const initialData = useMemo(() => {
    if (flag) {
      return {
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        environment: flag.environment,
        type: flag.type,
        rolloutPercentage: flag.rolloutPercentage,
        owner: flag.owner,
        tags: flag.tags,
        expiresAt: flag.expiresAt,
      }
    }
    return emptyFormData
  }, [flag])

  const initialTags = useMemo(() => (flag ? flag.tags.join(', ') : ''), [flag])

  const [formData, setFormData] = useState<CreateFlagInput>(initialData)
  const [tagsInput, setTagsInput] = useState(initialTags)

  // Re-sync the form whenever the modal opens or the flag being edited changes.
  // Adjusting state during render (not in an effect) avoids a cascading re-render:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [syncedWith, setSyncedWith] = useState({ open, initialData, initialTags })
  if (
    syncedWith.open !== open ||
    syncedWith.initialData !== initialData ||
    syncedWith.initialTags !== initialTags
  ) {
    setSyncedWith({ open, initialData, initialTags })
    if (open) {
      setFormData(initialData)
      setTagsInput(initialTags)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData(emptyFormData)
      setTagsInput('')
    } else if (flag) {
      // Set form data when opening with a flag
      setFormData({
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        environment: flag.environment,
        type: flag.type,
        rolloutPercentage: flag.rolloutPercentage,
        owner: flag.owner,
        tags: flag.tags,
        expiresAt: flag.expiresAt,
      })
      setTagsInput(flag.tags.join(', '))
    } else {
      setFormData(emptyFormData)
      setTagsInput('')
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    onSubmit({ ...formData, tags })
  }

  const isEditing = !!flag

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Flag' : 'Create Flag'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="my-feature-flag"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                pattern="^[a-z0-9-]+$"
                required
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What this flag controls"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enabled</Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: Environment) =>
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem key={env} value={env}>
                        {env}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: FlagType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flagTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rollout">Rollout Percentage: {formData.rolloutPercentage}%</Label>
              <Input
                id="rollout"
                type="range"
                min="0"
                max="100"
                value={formData.rolloutPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                placeholder="team-name"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="frontend, ux, payments"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of tags</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt?.slice(0, 16) ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Flag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
