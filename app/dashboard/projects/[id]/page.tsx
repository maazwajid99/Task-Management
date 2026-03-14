'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Task, TaskStatus, ProjectWithTasks } from '@/types'
import { Plus, ArrowLeft, CheckSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithTasks | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`)
    const data = await res.json()
    if (data.success) {
      setProject(data.data)
      setTasks(data.data.tasks)
    } else {
      router.push('/dashboard/projects')
    }
    setLoading(false)
  }, [id, router])

  useEffect(() => { fetchProject() }, [fetchProject])

  const filteredTasks = tasks.filter(task => {
    if (statusFilter && task.status !== statusFilter) return false
    if (priorityFilter && task.priority !== priorityFilter) return false
    return true
  })

  async function handleCreate(formData: Partial<Task>) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, projectId: id }),
    })
    const data = await res.json()
    if (data.success) {
      setTasks(prev => [data.data, ...prev])
      setCreateOpen(false)
      toast.success('Task created')
    } else {
      toast.error(data.error ?? 'Failed to create task')
    }
  }

  async function handleEdit(formData: Partial<Task>) {
    if (!editingTask) return
    const res = await fetch(`/api/tasks/${editingTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (data.success) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? data.data : t))
      setEditingTask(null)
      toast.success('Task updated')
    } else {
      toast.error(data.error ?? 'Failed to update task')
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) {
      setTasks(prev => prev.map(t => t.id === taskId ? data.data : t))
    } else {
      toast.error('Failed to update task status')
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('Delete this task?')) return
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      toast.success('Task deleted')
    } else {
      toast.error(data.error ?? 'Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </Link>
        <Header
          title={project?.name ?? ''}
          description={project?.description ?? undefined}
          action={
            <div className="flex items-center gap-3">
              <TaskFilters
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
              />
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" /> Add task
              </Button>
            </div>
          }
        />
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No tasks yet</h3>
          <p className="text-slate-500 text-sm mb-6">Add your first task to this project.</p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Add task
          </Button>
        </div>
      ) : (
        <TaskBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={handleDelete}
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New task">
        <TaskForm projectId={id} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editingTask} onClose={() => setEditingTask(null)} title="Edit task">
        {editingTask && (
          <TaskForm
            projectId={id}
            initialData={editingTask}
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Modal>
    </div>
  )
}
