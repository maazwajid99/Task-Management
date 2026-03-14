import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return successResponse(projects)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return errorResponse('Unauthorized', 401)

  const body = await req.json()
  const parsed = projectSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

  const project = await prisma.project.create({
    data: { ...parsed.data, userId: session.user.id },
    include: { _count: { select: { tasks: true } } },
  })

  return successResponse(project, 201)
}
