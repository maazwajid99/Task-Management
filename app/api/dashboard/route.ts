import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const userId = session.user.id

  const [totalProjects, tasks] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.task.findMany({
      where: { project: { userId } },
      select: { status: true, dueDate: true },
    }),
  ])

  const now = new Date()
  const tasksByStatus = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  }

  let overdueTasks = 0
  for (const task of tasks) {
    tasksByStatus[task.status]++
    if (task.dueDate && task.dueDate < now && task.status !== 'DONE') {
      overdueTasks++
    }
  }

  return successResponse({
    totalProjects,
    totalTasks: tasks.length,
    tasksByStatus,
    overdueTasks,
  })
}
