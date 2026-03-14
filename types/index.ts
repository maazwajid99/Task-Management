import { Task, Project, User, TaskStatus, Priority } from '@prisma/client'

export type { Task, Project, User, TaskStatus, Priority }

export type ProjectWithTasks = Project & {
  tasks: Task[]
  _count: { tasks: number }
}

export type TaskWithProject = Task & {
  project: Pick<Project, 'id' | 'name'>
}

export type DashboardStats = {
  totalProjects: number
  totalTasks: number
  tasksByStatus: Record<TaskStatus, number>
  overdueTasks: number
}

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}
