import { NextRequest, NextResponse } from 'next/server'
import { requireUserAuth, isErrorResponse } from '@/lib/api-auth'
import { apiHandler } from '@/lib/api-errors'
import { listWorkflows, importWorkflowFromJson, deleteWorkflow } from '@/lib/comfyui/workflow-storage'

export const GET = apiHandler(async () => {
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult

  const workflows = await listWorkflows()
  return NextResponse.json({ workflows })
})

export const POST = apiHandler(async (request: NextRequest) => {
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult

  const body = await request.json()
  const { name, json } = body

  if (!name || !json) {
    return NextResponse.json({ error: 'name and json are required' }, { status: 400 })
  }

  try {
    const workflow = await importWorkflowFromJson(name, json)
    return NextResponse.json({ workflow })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
})

export const DELETE = apiHandler(async (request: NextRequest) => {
  const authResult = await requireUserAuth()
  if (isErrorResponse(authResult)) return authResult

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const deleted = await deleteWorkflow(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
})
