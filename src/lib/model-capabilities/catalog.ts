import { readdirSync, readFileSync } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import {
  composeModelKey,
  validateModelCapabilities,
  type ModelCapabilities,
  type UnifiedModelType,
} from '@/lib/model-config-contract'

export interface BuiltinCapabilityCatalogEntry {
  modelType: UnifiedModelType
  provider: string
  modelId: string
  capabilities?: ModelCapabilities
}

interface CatalogCache {
  signature: string
  entries: BuiltinCapabilityCatalogEntry[]
  exact: Map<string, BuiltinCapabilityCatalogEntry>
  byProviderKey: Map<string, BuiltinCapabilityCatalogEntry>
}

const CATALOG_DIR = path.resolve(process.cwd(), 'standards/capabilities')
let cache: CatalogCache | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isUnifiedModelType(value: unknown): value is UnifiedModelType {
  return value === 'llm'
    || value === 'image'
    || value === 'video'
    || value === 'audio'
    || value === 'lipsync'
}

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function getProviderKey(providerId: string): string {
  const marker = providerId.indexOf(':')
  return marker === -1 ? providerId : providerId.slice(0, marker)
}

function cloneCapabilities(capabilities: ModelCapabilities | undefined): ModelCapabilities | undefined {
  if (!capabilities) return undefined
  return structuredClone(capabilities)
}

function normalizeEntry(raw: unknown, filePath: string, index: number): BuiltinCapabilityCatalogEntry {
  if (!isRecord(raw)) {
    throw new Error(`CAPABILITY_CATALOG_INVALID: ${filePath}#${index} must be object`)
  }

  const modelTypeRaw = raw.modelType
  if (!isUnifiedModelType(modelTypeRaw)) {
    throw new Error(`CAPABILITY_CATALOG_INVALID: ${filePath}#${index} modelType invalid`)
  }

  const provider = readTrimmedString(raw.provider)
  const modelId = readTrimmedString(raw.modelId)
  if (!provider || !modelId) {
    throw new Error(`CAPABILITY_CATALOG_INVALID: ${filePath}#${index} provider/modelId required`)
  }

  const capabilitiesRaw = raw.capabilities
  const capabilityIssues = validateModelCapabilities(modelTypeRaw, capabilitiesRaw)
  if (capabilityIssues.length > 0) {
    const firstIssue = capabilityIssues[0]
    throw new Error(
      `CAPABILITY_CATALOG_INVALID: ${filePath}#${index} ${firstIssue.code} ${firstIssue.field} ${firstIssue.message}`,
    )
  }

  return {
    modelType: modelTypeRaw,
    provider,
    modelId,
    ...(capabilitiesRaw && isRecord(capabilitiesRaw)
      ? { capabilities: capabilitiesRaw as ModelCapabilities }
      : {}),
  }
}

function buildCache(entries: BuiltinCapabilityCatalogEntry[], signature: string): CatalogCache {
  const exact = new Map<string, BuiltinCapabilityCatalogEntry>()
  const byProviderKey = new Map<string, BuiltinCapabilityCatalogEntry>()

  for (const entry of entries) {
    const modelKey = composeModelKey(entry.provider, entry.modelId)
    if (!modelKey) continue

    const exactKey = `${entry.modelType}::${modelKey}`
    if (exact.has(exactKey)) {
      throw new Error(`CAPABILITY_CATALOG_DUPLICATE: ${exactKey}`)
    }
    exact.set(exactKey, entry)

    const providerKey = getProviderKey(entry.provider)
    const fallbackKey = `${entry.modelType}::${providerKey}::${entry.modelId}`
    if (!byProviderKey.has(fallbackKey)) {
      byProviderKey.set(fallbackKey, entry)
    }
  }

  return { signature, entries, exact, byProviderKey }
}

async function resolveCatalogFiles(): Promise<string[]> {
  const dirents = await readdir(CATALOG_DIR, { withFileTypes: true })
  return dirents
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(CATALOG_DIR, entry.name))
    .sort((left, right) => left.localeCompare(right))
}

async function buildCatalogSignature(files: string[]): Promise<string> {
  const stats = await Promise.all(files.map((f) => stat(f)))
  return files
    .map((filePath, i) => `${filePath}:${stats[i].mtimeMs}:${stats[i].size}`)
    .join('|')
}

async function loadCatalog(): Promise<CatalogCache> {
  const entries: BuiltinCapabilityCatalogEntry[] = []
  const files = await resolveCatalogFiles()

  if (files.length === 0) {
    throw new Error(`CAPABILITY_CATALOG_MISSING: no json file in ${CATALOG_DIR}`)
  }
  const signature = await buildCatalogSignature(files)
  if (cache && cache.signature === signature) return cache

  const fileContents = await Promise.all(
    files.map((filePath) => readFile(filePath, 'utf8').then((raw) => ({ filePath, raw })))
  )

  for (const { filePath, raw } of fileContents) {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error(`CAPABILITY_CATALOG_INVALID: ${filePath} must be array`)
    }
    for (let index = 0; index < parsed.length; index += 1) {
      entries.push(normalizeEntry(parsed[index], filePath, index))
    }
  }

  cache = buildCache(entries, signature)
  return cache
}

export async function listBuiltinCapabilityCatalog(): Promise<BuiltinCapabilityCatalogEntry[]> {
  const loaded = await loadCatalog()
  return loaded.entries.map((entry) => ({
    ...entry,
    capabilities: cloneCapabilities(entry.capabilities),
  }))
}

/**
 * Provider keys that share capability catalogs with a canonical provider.
 * gemini-compatible uses the same models as google.
 */
const CAPABILITY_PROVIDER_ALIASES: Readonly<Record<string, string>> = {
  'gemini-compatible': 'google',
}

export async function findBuiltinCapabilityCatalogEntry(
  modelType: UnifiedModelType,
  provider: string,
  modelId: string,
): Promise<BuiltinCapabilityCatalogEntry | null> {
  const loaded = await loadCatalog()
  const modelKey = composeModelKey(provider, modelId)
  if (!modelKey) return null

  const exactKey = `${modelType}::${modelKey}`
  const exactMatch = loaded.exact.get(exactKey)
  if (exactMatch) {
    return {
      ...exactMatch,
      capabilities: cloneCapabilities(exactMatch.capabilities),
    }
  }

  const providerKey = getProviderKey(provider)
  const fallbackKey = `${modelType}::${providerKey}::${modelId}`
  const fallback = loaded.byProviderKey.get(fallbackKey)
  if (fallback) {
    return {
      ...fallback,
      capabilities: cloneCapabilities(fallback.capabilities),
    }
  }

  // Fallback: check canonical provider alias (e.g. gemini-compatible → google)
  const aliasTarget = CAPABILITY_PROVIDER_ALIASES[providerKey]
  if (aliasTarget) {
    const aliasKey = `${modelType}::${aliasTarget}::${modelId}`
    const aliasMatch = loaded.byProviderKey.get(aliasKey)
    if (aliasMatch) {
      return {
        ...aliasMatch,
        capabilities: cloneCapabilities(aliasMatch.capabilities),
      }
    }
  }

  return null
}

export async function findBuiltinCapabilities(
  modelType: UnifiedModelType,
  provider: string,
  modelId: string,
): Promise<ModelCapabilities | undefined> {
  const entry = await findBuiltinCapabilityCatalogEntry(modelType, provider, modelId)
  return entry?.capabilities
}

export function resetBuiltinCapabilityCatalogCacheForTest() {
  cache = null
}

// ─── Sync wrappers (backward compatibility) ──────────────────────

function ensureSyncCache(): CatalogCache {
  if (cache) return cache
  // Synchronously load on first call (small directory, cached after)
  const entries: BuiltinCapabilityCatalogEntry[] = []
  let files: string[] = []
  try {
    // Use sync fs for the sync wrapper path
    const catDir = path.resolve(process.cwd(), 'standards/capabilities')
    const dirents = readdirSync(catDir, { withFileTypes: true })
    files = dirents
      .filter((e: { isFile: () => boolean; name: string }) => e.isFile() && e.name.endsWith('.json'))
      .map((e: { name: string }) => path.join(catDir, e.name))
      .sort((a: string, b: string) => a.localeCompare(b))
  } catch {
    throw new Error('CATALOG_DIR_MISSING: standards/capabilities directory not found')
  }
  if (files.length === 0) {
    throw new Error('CATALOG_MISSING: no json files in standards/capabilities')
  }
  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) continue
    for (let i = 0; i < parsed.length; i++) {
      try {
        entries.push(normalizeEntry(parsed[i], filePath, i))
      } catch {
        // Skip invalid entries in sync path
      }
    }
  }
  cache = buildCache(entries, files.map((f: string) => f).join('|'))
  return cache
}

export function listBuiltinCapabilityCatalogSync(): BuiltinCapabilityCatalogEntry[] {
  const loaded = ensureSyncCache()
  return loaded.entries.map((entry) => ({
    ...entry,
    capabilities: cloneCapabilities(entry.capabilities),
  }))
}

export function findBuiltinCapabilitiesSync(
  modelType: UnifiedModelType,
  provider: string,
  modelId: string,
): ModelCapabilities | undefined {
  const entry = findBuiltinCapabilityCatalogEntrySync(modelType, provider, modelId)
  return entry?.capabilities
}

export function findBuiltinCapabilityCatalogEntrySync(
  modelType: UnifiedModelType,
  provider: string,
  modelId: string,
): BuiltinCapabilityCatalogEntry | null {
  const loaded = ensureSyncCache()
  const modelKey = composeModelKey(provider, modelId)
  if (!modelKey) return null

  const exactKey = `${modelType}::${modelKey}`
  const exactMatch = loaded.exact.get(exactKey)
  if (exactMatch) {
    return {
      ...exactMatch,
      capabilities: cloneCapabilities(exactMatch.capabilities),
    }
  }

  const providerKey = getProviderKey(provider)
  const fallbackKey = `${modelType}::${providerKey}::${modelId}`
  const fallback = loaded.byProviderKey.get(fallbackKey)
  if (fallback) {
    return {
      ...fallback,
      capabilities: cloneCapabilities(fallback.capabilities),
    }
  }

  const aliasTarget = CAPABILITY_PROVIDER_ALIASES[providerKey]
  if (aliasTarget) {
    const aliasKey = `${modelType}::${aliasTarget}::${modelId}`
    const aliasMatch = loaded.byProviderKey.get(aliasKey)
    if (aliasMatch) {
      return {
        ...aliasMatch,
        capabilities: cloneCapabilities(aliasMatch.capabilities),
      }
    }
  }

  return null
}
