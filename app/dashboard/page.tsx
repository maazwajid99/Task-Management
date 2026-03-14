'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { TaskChart } from '@/components/dashboard/TaskChart'
import { DashboardStats, TaskStatus } from '@/types'
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" description="Overview of your projects and tasks" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" description="Overview of your projects and tasks" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Projects"
          value={stats?.totalProjects ?? 0}
          icon={<FolderKanban className="w-5 h-5" />}
          accent="blue"
        />
        <StatsCard
          title="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={<CheckSquare className="w-5 h-5" />}
          accent="green"
        />
        <StatsCard
          title="In Progress"
          value={stats?.tasksByStatus.IN_PROGRESS ?? 0}
          icon={<Clock className="w-5 h-5" />}
          accent="yellow"
        />
        <StatsCard
          title="Overdue"
          value={stats?.overdueTasks ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          accent="red"
          description="Tasks past due date"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats && <TaskChart tasksByStatus={stats.tasksByStatus} />}

        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {stats && (Object.entries(stats.tasksByStatus) as [TaskStatus, number][]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: stats.totalTasks > 0 ? `${(count / stats.totalTasks) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
