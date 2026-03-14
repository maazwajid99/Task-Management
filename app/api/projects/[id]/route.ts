import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-response'

async function getProjectForUser(id: string, userId: string) {
  return prisma.project.findFirst({ where: { id, userId } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { tasks: true } },
    },
  })

  if (!project) return errorResponse('Project not found', 404)
  return successResponse(project)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const existing = await getProjectForUser(params.id, session.user.id)
  if (!existing) return errorResponse('Project not found', 404)

  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

  const project = await prisma.project.update({
    where: { id: params.id },
    data: parsed.data,
    include: { _count: { select: { tasks: true } } },
  })

  return successResponse(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const existing = await getProjectForUser(params.id, session.user.id)
  if (!existing) return errorResponse('Project not found', 404)

  await prisma.project.delete({ where: { id: params.id } })
  return successResponse({ deleted: true })
}
