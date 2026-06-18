const SINGLE_PLACEHOLDER = /\{([A-Za-z0-9_]+)\}/g
const DOUBLE_PLACEHOLDER = /\{\{([A-Za-z0-9_]+)\}\}/g

export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`\\{\\{${escaped}\\}\\}|\\{${escaped}\\}`, 'g'),
      value,
    )
  }
  return result
}

export function extractTemplateKeys(template: string): string[] {
  const keys = new Set<string>()
  for (const match of template.matchAll(SINGLE_PLACEHOLDER)) {
    keys.add(match[1])
  }
  for (const match of template.matchAll(DOUBLE_PLACEHOLDER)) {
    keys.add(match[1])
  }
  return Array.from(keys)
}
