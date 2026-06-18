import { buildCharactersLibInfo, type CharacterBrief } from './analyze-global-parse'
import type { Locale } from '@/i18n/routing'
import { fillTemplate, getPromptTemplate, PROMPT_IDS } from '@/lib/prompt-i18n'

export type AnalyzeGlobalPromptTemplates = {
  characterPromptTemplate: string
  locationPromptTemplate: string
  propPromptTemplate: string
}

export function loadAnalyzeGlobalPromptTemplates(locale: Locale): AnalyzeGlobalPromptTemplates {
  return {
    characterPromptTemplate: getPromptTemplate(PROMPT_IDS.NP_AGENT_CHARACTER_PROFILE, locale),
    locationPromptTemplate: getPromptTemplate(PROMPT_IDS.NP_SELECT_LOCATION, locale),
    propPromptTemplate: getPromptTemplate(PROMPT_IDS.NP_SELECT_PROP, locale),
  }
}

export function buildAnalyzeGlobalPrompts(params: {
  chunk: string
  templates: AnalyzeGlobalPromptTemplates
  existingCharacters: CharacterBrief[]
  existingLocationInfo: string[]
  existingPropNames: string[]
}) {
  const characterPrompt = fillTemplate(params.templates.characterPromptTemplate, {
    input: params.chunk,
    characters_lib_info: buildCharactersLibInfo(params.existingCharacters),
  })
  const locationPrompt = fillTemplate(params.templates.locationPromptTemplate, {
    input: params.chunk,
    locations_lib_name: params.existingLocationInfo.join(', ') || '无',
  })
  const propPrompt = fillTemplate(params.templates.propPromptTemplate, {
    input: params.chunk,
    props_lib_name: params.existingPropNames.join(', ') || '无',
  })
  return {
    characterPrompt,
    locationPrompt,
    propPrompt,
  }
}
