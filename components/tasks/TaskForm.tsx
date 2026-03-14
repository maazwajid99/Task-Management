'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Task, TaskStatus, Priority } from '@/types'

interface TaskFormProps {
  projectId: string
  initialData?: Partial<Task>
  onSubmit: (data: Partial<Task>) => Promise<void>
  onCancel: () => void
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export function TaskForm({ projectId, initialData, onSubmit, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    status: initialData?.status ?? 'TODO',
    priority: initialData?.priority ?? 'MEDIUM',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      title: form.title,
      description: form.description || undefined,
      status: form.status as Task['status'],
      priority: form.priority as Task['priority'],
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      projectId,
    })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        placeholder="Task title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <Textarea
        label="Description (optional)"
        placeholder="Describe the task..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
          options={PRIORITY_OPTIONS}
        />
      </div>
      <Input
        label="Due date (optional)"
        type="date"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.id ? 'Save changes' : 'Create task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
