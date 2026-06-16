import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import type { ComfyUIWorkflow, WorkflowType } from './types'
import { analyzeWorkflow, getWorkflowTypeLabel } from './workflow-engine'

const WORKFLOWS_DIR = join(process.cwd(), 'data', 'comfyui-workflows')

function ensureDir(): void {
  if (!existsSync(WORKFLOWS_DIR)) {
    mkdirSync(WORKFLOWS_DIR, { recursive: true })
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

export function saveWorkflow(id: string, name: string, workflow: ComfyUIWorkflow): SavedWorkflow {
  ensureDir()
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
  writeFileSync(filePath, JSON.stringify(saved, null, 2), 'utf-8')
  return saved
}

export function loadWorkflow(id: string): SavedWorkflow | null {
  const filePath = join(WORKFLOWS_DIR, `${id}.json`)
  if (!existsSync(filePath)) return null
  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as SavedWorkflow
  } catch {
    return null
  }
}

export function listWorkflows(): SavedWorkflow[] {
  ensureDir()
  const files = readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'))
  const workflows: SavedWorkflow[] = []

  for (const file of files) {
    try {
      const content = readFileSync(join(WORKFLOWS_DIR, file), 'utf-8')
      workflows.push(JSON.parse(content) as SavedWorkflow)
    } catch {
      continue
    }
  }

  return workflows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function deleteWorkflow(id: string): boolean {
  const filePath = join(WORKFLOWS_DIR, `${id}.json`)
  if (!existsSync(filePath)) return false
  try {
    unlinkSync(filePath)
    return true
  } catch {
    return false
  }
}

export function importWorkflowFromJson(name: string, jsonContent: string): SavedWorkflow {
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
  const hasNodes = Object.values(workflow).some(
    (node) => node && typeof node === 'object' && 'class_type' in node
  )
  if (!hasNodes) {
    throw new Error('Invalid ComfyUI workflow: no nodes with class_type found')
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
  while (existsSync(join(WORKFLOWS_DIR, `${id}.json`))) {
    id = `${sanitizedId}-${counter}`
    counter++
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
