'use client'

import { Select } from '@/components/ui/Select'

interface TaskFiltersProps {
  statusFilter: string
  priorityFilter: string
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export function TaskFilters({ statusFilter, priorityFilter, onStatusChange, onPriorityChange }: TaskFiltersProps) {
  return (
    <div className="flex gap-3">
      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        options={STATUS_OPTIONS}
        className="w-40"
      />
      <Select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        options={PRIORITY_OPTIONS}
        className="w-40"
      />
    </div>
  )
}
