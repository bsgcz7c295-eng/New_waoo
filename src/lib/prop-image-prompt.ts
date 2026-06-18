type Locale = 'zh' | 'en'

export function buildPropImagePromptCore(params: {
  description: string
  locale?: Locale
}): string {
  const promptBody = params.description.trim()
  const locale = params.locale ?? 'en'

  const constraints = locale === 'en'
    ? 'Isolated prop on a clean white or neutral background. Center the prop in frame with even studio lighting. Show full structure, material texture, surface finish, and decorative details clearly. No characters, no hands, no environment, no scene context.'
    : '道具独立展示，干净白色或中性背景。道具居中构图，均匀 studio 灯光。清晰展示完整结构、材质纹理、表面工艺和装饰细节。禁止出现人物、手部、环境、场景上下文。'

  return `${promptBody}\n\n${constraints}`.trim()
}
