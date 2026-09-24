import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { FeatureFlag, CreateFlagInput, UpdateFlagInput } from '@shared/types'
import { getFlags, createFlag, updateFlag, deleteFlag } from '@/api/flags'
import { FlagsTable } from '@/components/flags-table'
import { FlagFormModal } from '@/components/flag-form-modal'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const queryClient = new QueryClient()

function FlagsApp() {
  const qc = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)

  const { data: flags = [], isLoading, error } = useQuery({
    queryKey: ['flags'],
    queryFn: getFlags,
  })

  const createMutation = useMutation({
    mutationFn: createFlag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flags'] })
      setIsFormOpen(false)
      setSelectedFlag(null)
    },
    onError: (error: Error) => {
      console.error('Failed to create flag:', error.message)
      // Modal stays open so user can retry
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFlagInput }) => updateFlag(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flags'] })
      setIsFormOpen(false)
      setSelectedFlag(null)
    },
    onError: (error: Error) => {
      console.error('Failed to update flag:', error.message)
      // Modal stays open so user can retry
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFlag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flags'] })
      setIsDeleteOpen(false)
      setSelectedFlag(null)
    },
    onError: (error: Error) => {
      console.error('Failed to delete flag:', error.message)
      // Dialog stays open so user can retry
    },
  })

  const handleCreate = () => {
    setSelectedFlag(null)
    setIsFormOpen(true)
  }

  const handleEdit = (flag: FeatureFlag) => {
    setSelectedFlag(flag)
    setIsFormOpen(true)
  }

  const handleDelete = (flag: FeatureFlag) => {
    setSelectedFlag(flag)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = (data: CreateFlagInput) => {
    if (selectedFlag) {
      updateMutation.mutate({ id: selectedFlag.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedFlag) {
      deleteMutation.mutate(selectedFlag.id)
    }
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load flags'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Flag
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading flags...</div>
        ) : (
          <FlagsTable flags={flags} onEdit={handleEdit} onDelete={handleDelete} />
        )}

        <FlagFormModal
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          flag={selectedFlag}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          flag={selectedFlag}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlagsApp />
    </QueryClientProvider>
  )
}

export default App
