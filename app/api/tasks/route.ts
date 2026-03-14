import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-response'
import { TaskStatus, Priority } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status') as TaskStatus | null
  const priority = searchParams.get('priority') as Priority | null

  const tasks = await prisma.task.findMany({
    where: {
      project: { userId: session.user.id },
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return successResponse(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const body = await req.json()
  const parsed = taskSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

  // Verify the project belongs to the user
  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, userId: session.user.id },
  })
  if (!project) return errorResponse('Project not found', 404)

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
    include: { project: { select: { id: true, name: true } } },
  })

  return successResponse(task, 201)
}
