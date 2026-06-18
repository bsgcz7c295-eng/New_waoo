/**
 * 风格预设 — 补充 negativeExtras 和 promptSuffix
 * 主风格系统在 constants.ts 的 ART_STYLES 中，此处仅提供额外的负向提示词和后缀。
 */
export interface StylePresetOption {
  value: string
  label: string
  description: string
  enabled: boolean
  /** Extra negative prompt keywords appended when this preset is active */
  negativeExtras?: string
  /** Style prompt suffix appended to the {style} variable for image generation */
  promptSuffix?: string
}

const ALL_STYLE_PRESETS: readonly StylePresetOption[] = [
  // ── 日漫 / 东亚漫画 ──
  {
    value: 'manga-clean',
    label: '日漫清爽',
    description: '干净线条，鲜明色彩，经典日本漫画风格',
    enabled: true,
    negativeExtras: 'photorealistic, blurry, noise, watermark, text',
  },
  {
    value: 'manga-dark',
    label: '日漫暗黑',
    description: '沉重线条，阴暗色调，青年漫画风格',
    enabled: true,
    negativeExtras: 'bright, cheerful, pastel, cute, chibi',
  },
  {
    value: 'chinese-comic',
    label: '精致国漫',
    description: '现代高质量漫画，细节丰富',
    enabled: true,
    negativeExtras: 'western comic, cartoon, photorealistic, blurry',
  },
  {
    value: 'manhua-xianxia',
    label: '国漫仙侠',
    description: '飘逸衣袂，水墨渲染',
    enabled: true,
    negativeExtras: 'western comic, cartoon, chibi, photorealistic',
  },
  {
    value: 'japanese-anime',
    label: '日系动漫风',
    description: '赛璐璐上色，视觉小说CG感',
    enabled: true,
    negativeExtras: 'photorealistic, 3d render, western comic, blurry',
  },
  {
    value: 'webtoon',
    label: '韩漫条漫',
    description: '柔和渐变，精致人设',
    enabled: true,
    negativeExtras: '粗线条, pixelated, low quality, western comic',
  },
  // ── 写实 / 电影 ──
  {
    value: 'cinematic',
    label: '电影质感',
    description: '宽银幕构图，景深，胶片感',
    enabled: true,
    negativeExtras: 'flat lighting, overexposed, cartoon, anime, drawing',
  },
  {
    value: 'photorealistic',
    label: '超写实',
    description: '照片级真实感',
    enabled: true,
    negativeExtras: 'cartoon, anime, drawing, painting, illustration, sketch',
  },
  {
    value: 'noir',
    label: '黑色电影',
    description: '高对比黑白，侦探氛围',
    enabled: true,
    negativeExtras: 'color, bright, cheerful, pastel, anime',
  },
  {
    value: 'realistic',
    label: '真人写实',
    description: '真实电影级画面质感',
    enabled: true,
    negativeExtras: 'cartoon, anime, drawing, painting, illustration',
  },
  // ── 奇幻 / 朋克 ──
  {
    value: 'fantasy',
    label: '西方奇幻',
    description: '史诗感，魔法光效',
    enabled: true,
    negativeExtras: 'modern, sci-fi, urban, chibi, cartoon',
  },
  {
    value: 'cyberpunk',
    label: '赛博朋克',
    description: '霓虹灯，科技感',
    enabled: true,
    negativeExtras: 'natural, pastoral, vintage, sepia, medieval',
  },
  {
    value: 'steampunk',
    label: '蒸汽朋克',
    description: '黄铜齿轮，维多利亚时代',
    enabled: true,
    negativeExtras: 'modern, digital, minimalist, clean, futuristic',
  },
  {
    value: 'solarpunk',
    label: '太阳朋克',
    description: '绿色科技，生态未来',
    enabled: true,
    negativeExtras: 'dark, dystopian, noir, industrial, grim',
  },
  // ── 艺术画风 ──
  {
    value: 'watercolor',
    label: '水彩画风',
    description: '柔和笔触，透明感',
    enabled: true,
    negativeExtras: 'photorealistic, sharp edges, digital art, 3d render, anime',
  },
  {
    value: 'oil-painting',
    label: '油画风格',
    description: '厚涂笔触，古典质感',
    enabled: true,
    negativeExtras: 'flat, cel-shaded, digital, clean lines, anime',
  },
  {
    value: 'pixel-art',
    label: '像素复古',
    description: '16-bit 像素风格',
    enabled: true,
    negativeExtras: 'smooth, realistic, high resolution, photograph, 3d render',
  },
  {
    value: 'flat-design',
    label: '扁平插画',
    description: '简洁几何，明快色块',
    enabled: true,
    negativeExtras: 'photorealistic, detailed texture, gradients, 3d render, anime',
  },
  // ── 情绪 / 氛围 ──
  {
    value: 'horror-suspense',
    label: '恐怖悬疑',
    description: '压迫氛围，暗色调',
    enabled: true,
    negativeExtras: 'bright, cheerful, warm lighting, pastel colors, cute',
  },
  {
    value: 'romance',
    label: '浪漫唯美',
    description: '柔光粉调，温暖氛围',
    enabled: true,
    negativeExtras: 'dark, horror, gritty, violent, cold',
  },
  {
    value: 'melancholy',
    label: '忧郁文艺',
    description: '冷色调，雨天，孤独感',
    enabled: true,
    negativeExtras: 'bright, cheerful, warm, saturated, cartoon',
  },
  {
    value: 'epic-battle',
    label: '热血战斗',
    description: '动态构图，速度线',
    enabled: true,
    negativeExtras: 'calm, peaceful, still, quiet, gentle',
  },
  // ── 特定题材 ──
  {
    value: 'historical',
    label: '古风历史',
    description: '古代建筑，传统服饰',
    enabled: true,
    negativeExtras: 'modern, futuristic, sci-fi, western, cartoon',
  },
  {
    value: 'modern-urban',
    label: '现代都市',
    description: '城市夜景，日常感',
    enabled: true,
    negativeExtras: 'fantasy, medieval, rural, futuristic, anime',
  },
  {
    value: 'chibi-cute',
    label: 'Q版可爱',
    description: '大头小身，萌系风格',
    enabled: true,
    negativeExtras: 'realistic, dark, horror, serious, detailed anatomy',
  },
  {
    value: 'gothic',
    label: '哥特暗黑',
    description: '哥特建筑，华丽颓废',
    enabled: true,
    negativeExtras: 'bright, cheerful, modern, minimal, clean',
  },
  {
    value: 'scifi-mecha',
    label: '科幻机甲',
    description: '巨型机甲，金属质感',
    enabled: true,
    negativeExtras: 'organic, natural, medieval, rustic, hand-drawn',
  },
  {
    value: 'american-comic',
    label: '美漫风格',
    description: '传统美式漫画',
    enabled: true,
    negativeExtras: 'anime, manga, photorealistic, blurry',
  },
]

export const STYLE_PRESETS: readonly StylePresetOption[] = ALL_STYLE_PRESETS.filter(
  (preset) => preset.enabled,
)

export const DEFAULT_STYLE_PRESET_VALUE = STYLE_PRESETS[0]?.value ?? ''

export function getStylePresetOption(value: string): StylePresetOption | null {
  return STYLE_PRESETS.find((preset) => preset.value === value) ?? STYLE_PRESETS[0] ?? null
}
