'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ProjectWithTasks } from '@/types'
import { Plus, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithTasks | null>(null)

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects')
    const data = await res.json()
    if (data.success) setProjects(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  async function handleCreate(formData: { name: string; description?: string }) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (data.success) {
      setProjects(prev => [data.data, ...prev])
      setCreateOpen(false)
      toast.success('Project created')
    } else {
      toast.error(data.error ?? 'Failed to create project')
    }
  }

  async function handleEdit(formData: { name: string; description?: string }) {
    if (!editingProject) return
    const res = await fetch(`/api/projects/${editingProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (data.success) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? data.data : p))
      setEditingProject(null)
      toast.success('Project updated')
    } else {
      toast.error(data.error ?? 'Failed to update project')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project and all its tasks?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Project deleted')
    } else {
      toast.error(data.error ?? 'Failed to delete project')
    }
  }

  return (
    <div>
      <Header
        title="Projects"
        description="Manage your projects and track progress"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            New project
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-44 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first project to get started.</p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Create project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              onEdit={() => setEditingProject(project)}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New project">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editingProject} onClose={() => setEditingProject(null)} title="Edit project">
        {editingProject && (
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleEdit}
            onCancel={() => setEditingProject(null)}
          />
        )}
      </Modal>
    </div>
  )
}
