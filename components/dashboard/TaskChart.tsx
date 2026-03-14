'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TaskStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

interface TaskChartProps {
  tasksByStatus: Record<TaskStatus, number>
}

const COLORS: Record<TaskStatus, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#22c55e',
}

export function TaskChart({ tasksByStatus }: TaskChartProps) {
  const data = (Object.entries(tasksByStatus) as [TaskStatus, number][])
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status],
      value: count,
      status,
    }))

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Task Distribution</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          No tasks yet
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-base font-semibold text-slate-900 mb-6">Task Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status as TaskStatus]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, 'Tasks']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
