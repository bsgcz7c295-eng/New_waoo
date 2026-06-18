import { readFile, writeFile, access, mkdir, readdir, unlink } from 'fs/promises'
import { join } from 'path'
import type { ComfyUIWorkflow, WorkflowType } from './types'
import { analyzeWorkflow, getWorkflowTypeLabel } from './workflow-engine'

const WORKFLOWS_DIR = join(process.cwd(), 'data', 'comfyui-workflows')

async function ensureDir(): Promise<void> {
  try {
    await access(WORKFLOWS_DIR)
  } catch {
    await mkdir(WORKFLOWS_DIR, { recursive: true })
  }
}

export interface SavedWorkflow {
  id: string
  name: string
  type: WorkflowType
  typeLabel: string
  workflow: ComfyUIWorkflow
  createdAt: string
  updatedAt: string
}

export async function saveWorkflow(id: string, name: string, workflow: ComfyUIWorkflow): Promise<SavedWorkflow> {
  await ensureDir()
  const analysis = analyzeWorkflow(workflow)
  const now = new Date().toISOString()

  const saved: SavedWorkflow = {
    id,
    name,
    type: analysis.type,
    typeLabel: getWorkflowTypeLabel(analysis.type),
    workflow,
    createdAt: now,
    updatedAt: now,
  }

  const filePath = join(WORKFLOWS_DIR, `${id}.json`)
  await writeFile(filePath, JSON.stringify(saved, null, 2), 'utf-8')
  return saved
}

export async function loadWorkflow(id: string): Promise<SavedWorkflow | null> {
  const filePath = join(WORKFLOWS_DIR, `${id}.json`)
  try {
    await access(filePath)
  } catch {
    return null
  }
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content) as SavedWorkflow
  } catch {
    return null
  }
}

export async function listWorkflows(): Promise<SavedWorkflow[]> {
  await ensureDir()
  const files = (await readdir(WORKFLOWS_DIR)).filter(f => f.endsWith('.json'))
  const workflows: SavedWorkflow[] = []

  for (const file of files) {
    try {
      const content = await readFile(join(WORKFLOWS_DIR, file), 'utf-8')
      workflows.push(JSON.parse(content) as SavedWorkflow)
    } catch {
      continue
    }
  }

  return workflows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const filePath = join(WORKFLOWS_DIR, `${id}.json`)
  try {
    await access(filePath)
  } catch {
    return false
  }
  try {
    await unlink(filePath)
    return true
  } catch {
    return false
  }
}

export async function importWorkflowFromJson(name: string, jsonContent: string): Promise<SavedWorkflow> {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonContent)
  } catch {
    throw new Error('Invalid JSON format')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid workflow: must be a JSON object')
  }

  const workflow = parsed as ComfyUIWorkflow
  const nodeEntries = Object.entries(workflow)
  const hasNodes = nodeEntries.some(
    ([, node]) => node && typeof node === 'object' && 'class_type' in node
  )
  if (!hasNodes) {
    throw new Error('Invalid ComfyUI workflow: no nodes with class_type found')
  }

  // Validate each node has required structure
  for (const [nodeId, node] of nodeEntries) {
    if (!node || typeof node !== 'object') continue
    if (!('class_type' in node)) continue
    if (typeof node.class_type !== 'string' || !node.class_type) {
      throw new Error(`Invalid node "${nodeId}": class_type must be a non-empty string`)
    }
    if (!node.inputs || typeof node.inputs !== 'object') {
      throw new Error(`Invalid node "${nodeId}": inputs must be an object`)
    }
  }

  // Check for essential node types
  const classTypes = new Set(nodeEntries.map(([, n]) => n?.class_type).filter(Boolean))
  if (!classTypes.has('SaveImage') && !classTypes.has('SaveAnimatedWEBP') && !classTypes.has('VHS_VideoCombine')) {
    throw new Error('Workflow must contain a SaveImage, SaveAnimatedWEBP, or VHS_VideoCombine output node')
  }

  // Try to extract name from workflow JSON, fallback to provided name
  const workflowName = (workflow as Record<string, unknown>).name
  const displayName = typeof workflowName === 'string' && workflowName.trim()
    ? workflowName.trim()
    : name

  // Generate sanitized ID from the display name
  const sanitizedId = sanitizeWorkflowId(displayName)

  // Check for duplicate IDs and append number if needed
  let id = sanitizedId
  let counter = 1
  const existing = await loadWorkflow(id)
  if (existing) {
    do {
      id = `${sanitizedId}-${counter}`
      counter++
    } while (await loadWorkflow(id))
  }

  return saveWorkflow(id, displayName, workflow)
}

function sanitizeWorkflowId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '-')  // Keep Chinese characters, letters, numbers, hyphens
    .replace(/-+/g, '-')  // Collapse multiple hyphens
    .replace(/^-|-$/g, '')  // Remove leading/trailing hyphens
    || `wf-${Date.now()}`  // Fallback if name is empty after sanitization
}
