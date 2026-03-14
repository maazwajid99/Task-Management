'use client'

import { useState, useRef, useEffect } from 'react'
import { ProjectWithTasks } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { FolderKanban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface ProjectCardProps {
  project: ProjectWithTasks
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <Card hoverable className="relative group">
      <div onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-brand-600" />
          </div>
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[140px] py-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <Badge className="bg-slate-100 text-slate-700">
            {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
          </Badge>
          <span className="text-xs text-slate-400">{formatDate(project.createdAt)}</span>
        </div>
      </div>
    </Card>
  )
}
