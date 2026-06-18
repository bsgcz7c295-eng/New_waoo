import fs from 'fs'
import path from 'path'

export type AssistantPromptId = 'api-config-template' | 'tutorial'

const PROMPT_FILE_BY_ID: Record<AssistantPromptId, string> = {
  'api-config-template': 'api-config-template.system.txt',
  tutorial: 'tutorial.system.txt',
}

interface CacheEntry {
  content: string
  mtimeMs: number
}

const promptCache = new Map<AssistantPromptId, CacheEntry>()

function loadPromptTemplate(promptId: AssistantPromptId): string {
  const fileName = PROMPT_FILE_BY_ID[promptId]
  const filePath = path.resolve(process.cwd(), 'lib', 'prompts', 'skills', fileName)

  try {
    const stat = fs.statSync(filePath)
    const cached = promptCache.get(promptId)

    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.content
    }

    const content = fs.readFileSync(filePath, 'utf8').trim()
    if (!content) {
      throw new Error(`ASSISTANT_SYSTEM_PROMPT_EMPTY: ${filePath}`)
    }

    promptCache.set(promptId, { content, mtimeMs: stat.mtimeMs })
    return content
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('ASSISTANT_SYSTEM_PROMPT_EMPTY')) {
      throw err
    }
    throw new Error(`ASSISTANT_SYSTEM_PROMPT_FILE_MISSING: ${filePath}`)
  }
}

function replacePromptVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, keyRaw: string) => {
    const key = keyRaw.trim()
    return vars[key] || ''
  })
}

export function renderAssistantSystemPrompt(
  promptId: AssistantPromptId,
  vars?: Record<string, string>,
): string {
  const template = loadPromptTemplate(promptId)
  if (!vars || Object.keys(vars).length === 0) return template
  return replacePromptVariables(template, vars)
}
