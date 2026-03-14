import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateTaskSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-response'

async function getTaskForUser(id: string, userId: string) {
  return prisma.task.findFirst({
    where: { id, project: { userId } },
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const existing = await getTaskForUser(params.id, session.user.id)
  if (!existing) return errorResponse('Task not found', 404)

  const body = await req.json()
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.dueDate !== undefined && {
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      }),
    },
    include: { project: { select: { id: true, name: true } } },
  })

  return successResponse(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const existing = await getTaskForUser(params.id, session.user.id)
  if (!existing) return errorResponse('Task not found', 404)

  await prisma.task.delete({ where: { id: params.id } })
  return successResponse({ deleted: true })
}
