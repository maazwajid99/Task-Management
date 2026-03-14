import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'slate'
}

const ACCENTS = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
}

export function StatsCard({ title, value, icon, description, accent = 'blue' }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', ACCENTS[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
