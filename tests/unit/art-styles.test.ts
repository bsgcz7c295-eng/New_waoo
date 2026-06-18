import { describe, expect, it } from 'vitest'
import {
  ART_STYLES,
  getArtStylePrompt,
  isArtStyleValue,
  type ArtStyleValue,
} from '@/lib/constants'
import { STYLE_PRESETS, getStylePresetOption } from '@/lib/style-presets'

describe('ART_STYLES', () => {
  it('has no duplicate values', () => {
    const values = ART_STYLES.map(s => s.value)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  it('every style has required fields', () => {
    for (const style of ART_STYLES) {
      expect(style.value).toBeTruthy()
      expect(style.label).toBeTruthy()
      expect(style.promptZh).toBeTruthy()
      expect(style.promptEn).toBeTruthy()
      expect(typeof style.value).toBe('string')
      expect(typeof style.label).toBe('string')
      expect(typeof style.promptZh).toBe('string')
      expect(typeof style.promptEn).toBe('string')
    }
  })

  it('getArtStylePrompt returns Chinese prompt for zh locale', () => {
    for (const style of ART_STYLES) {
      const prompt = getArtStylePrompt(style.value, 'zh')
      expect(prompt).toBe(style.promptZh)
    }
  })

  it('getArtStylePrompt returns English prompt for en locale', () => {
    for (const style of ART_STYLES) {
      const prompt = getArtStylePrompt(style.value, 'en')
      expect(prompt).toBe(style.promptEn)
    }
  })

  it('getArtStylePrompt returns empty for unknown style', () => {
    expect(getArtStylePrompt('nonexistent', 'zh')).toBe('')
    expect(getArtStylePrompt(null, 'zh')).toBe('')
    expect(getArtStylePrompt(undefined, 'zh')).toBe('')
  })

  it('isArtStyleValue correctly identifies valid styles', () => {
    for (const style of ART_STYLES) {
      expect(isArtStyleValue(style.value)).toBe(true)
    }
    expect(isArtStyleValue('nonexistent')).toBe(false)
    expect(isArtStyleValue(null)).toBe(false)
    expect(isArtStyleValue(123)).toBe(false)
  })

  it('ArtStyleValue type matches all style values', () => {
    const validValues: ArtStyleValue[] = ART_STYLES.map(s => s.value)
    expect(validValues.length).toBe(ART_STYLES.length)
  })
})

describe('STYLE_PRESETS sync with ART_STYLES', () => {
  it('every ART_STYLES value has a matching STYLE_PRESETS entry', () => {
    for (const style of ART_STYLES) {
      const preset = STYLE_PRESETS.find(p => p.value === style.value)
      expect(preset).toBeDefined()
      expect(preset!.label).toBe(style.label)
    }
  })

  it('every STYLE_PRESETS entry has a matching ART_STYLES entry', () => {
    for (const preset of STYLE_PRESETS) {
      const style = ART_STYLES.find(s => s.value === preset.value)
      expect(style).toBeDefined()
    }
  })

  it('getStylePresetOption returns correct preset', () => {
    for (const preset of STYLE_PRESETS) {
      const found = getStylePresetOption(preset.value)
      expect(found).toBeDefined()
      expect(found!.value).toBe(preset.value)
    }
  })

  it('getStylePresetOption returns first preset for unknown value', () => {
    const fallback = getStylePresetOption('nonexistent')
    expect(fallback).toBeDefined()
    expect(fallback!.value).toBe(STYLE_PRESETS[0].value)
  })
})

describe('ART_STYLES count', () => {
  it('has at least 28 styles', () => {
    expect(ART_STYLES.length).toBeGreaterThanOrEqual(28)
  })

  it('STYLE_PRESETS has at least 28 entries', () => {
    expect(STYLE_PRESETS.length).toBeGreaterThanOrEqual(28)
  })
})
