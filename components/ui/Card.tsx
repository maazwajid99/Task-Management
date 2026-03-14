import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ className, children, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-6',
        hoverable && 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
