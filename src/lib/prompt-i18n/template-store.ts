import fs from 'fs'
import path from 'path'
import { PROMPT_CATALOG } from './catalog'
import type { PromptId } from './prompt-ids'
import type { PromptLocale } from './types'
import { PromptI18nError } from './errors'

interface CacheEntry {
  content: string
  mtimeMs: number
}

const templateCache = new Map<string, CacheEntry>()

function buildCacheKey(promptId: PromptId, locale: PromptLocale) {
  return `${promptId}:${locale}`
}

export function getPromptTemplate(promptId: PromptId, locale: PromptLocale): string {
  const entry = PROMPT_CATALOG[promptId]
  if (!entry) {
    throw new PromptI18nError(
      'PROMPT_ID_UNREGISTERED',
      promptId,
      `Prompt is not registered: ${promptId}`,
    )
  }

  const filePath = path.join(process.cwd(), 'lib', 'prompts', `${entry.pathStem}.${locale}.txt`)
  const cacheKey = buildCacheKey(promptId, locale)

  try {
    const stat = fs.statSync(filePath)
    const cached = templateCache.get(cacheKey)

    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.content
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    templateCache.set(cacheKey, { content, mtimeMs: stat.mtimeMs })
    return content
  } catch {
    throw new PromptI18nError(
      'PROMPT_TEMPLATE_NOT_FOUND',
      promptId,
      `Prompt template not found: ${filePath}`,
      { filePath, locale },
    )
  }
}
