'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ProjectWithTasks } from '@/types'

interface ProjectFormProps {
  initialData?: Partial<ProjectWithTasks>
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ name: form.name, description: form.description || undefined })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project name"
        placeholder="e.g. Website Redesign"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Textarea
        label="Description (optional)"
        placeholder="Briefly describe this project..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.id ? 'Save changes' : 'Create project'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
