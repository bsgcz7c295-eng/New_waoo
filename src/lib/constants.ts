/**
 * 主形象的 appearanceIndex 值。
 * 所有判断主/子形象的逻辑必须引用此常量，禁止硬编码数字。
 * 子形象的 appearanceIndex 从 PRIMARY_APPEARANCE_INDEX + 1 开始递增。
 */
export const PRIMARY_APPEARANCE_INDEX = 0

// 比例配置（nanobanana 支持的所有比例，按常用程度排序）
export const ASPECT_RATIO_CONFIGS: Record<string, { label: string; isVertical: boolean }> = {
  '16:9': { label: '16:9', isVertical: false },
  '9:16': { label: '9:16', isVertical: true },
  '1:1': { label: '1:1', isVertical: false },
  '3:2': { label: '3:2', isVertical: false },
  '2:3': { label: '2:3', isVertical: true },
  '4:3': { label: '4:3', isVertical: false },
  '3:4': { label: '3:4', isVertical: true },
  '5:4': { label: '5:4', isVertical: false },
  '4:5': { label: '4:5', isVertical: true },
  '21:9': { label: '21:9', isVertical: false },
}

// 配置页面使用的选项列表（从 ASPECT_RATIO_CONFIGS 派生）
export const VIDEO_RATIOS = Object.entries(ASPECT_RATIO_CONFIGS).map(([value, config]) => ({
  value,
  label: config.label
}))

// 获取比例配置
export function getAspectRatioConfig(ratio: string) {
  return ASPECT_RATIO_CONFIGS[ratio] || ASPECT_RATIO_CONFIGS['16:9']
}

export const ANALYSIS_MODELS = [
  { value: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'google/gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' }
]

export const IMAGE_MODELS = [
  { value: 'doubao-seedream-4-5-251128', label: 'Seedream 4.5' },
  { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0' }
]

// 图像模型选项（ 生成完整图片）
export const IMAGE_MODEL_OPTIONS = [
  { value: 'banana', label: 'Banana Pro (FAL)' },
  { value: 'banana-2', label: 'Banana 2 (FAL)' },
  { value: 'gemini-3-pro-image-preview', label: 'Banana (Google)' },
  { value: 'gemini-3-pro-image-preview-batch', label: 'Banana (Google Batch) 省50%' },
  { value: 'doubao-seedream-4-0-250828', label: 'Seedream 4.0' },
  { value: 'doubao-seedream-4-5-251128', label: 'Seedream 4.5' },
  { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0 (Google)' },
  { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4.0 Ultra' },
  { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast' }
]

// Banana 模型分辨率选项（仅用于九宫格分镜图，单张生成固定2K）
export const BANANA_RESOLUTION_OPTIONS = [
  { value: '2K', label: '2K (推荐，快速)' },
  { value: '4K', label: '4K (高清，较慢)' }
]

// 支持分辨率选择的 Banana 模型
export const BANANA_MODELS = ['banana', 'banana-2', 'gemini-3-pro-image-preview', 'gemini-3-pro-image-preview-batch']

export const VIDEO_MODELS = [
  { value: 'doubao-seedance-2-0-260128', label: 'Seedance 2.0' },
  { value: 'doubao-seedance-2-0-fast-260128', label: 'Seedance 2.0 Fast' },
  { value: 'doubao-seedance-1-0-pro-fast-251015', label: 'Seedance 1.0 Pro Fast' },
  { value: 'doubao-seedance-1-0-pro-fast-251015-batch', label: 'Seedance 1.0 Pro Fast (批量) 省50%' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428', label: 'Seedance 1.0 Lite' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428-batch', label: 'Seedance 1.0 Lite (批量) 省50%' },
  { value: 'doubao-seedance-1-5-pro-251215', label: 'Seedance 1.5 Pro' },
  { value: 'doubao-seedance-1-5-pro-251215-batch', label: 'Seedance 1.5 Pro (批量) 省50%' },
  { value: 'doubao-seedance-1-0-pro-250528', label: 'Seedance 1.0 Pro' },
  { value: 'doubao-seedance-1-0-pro-250528-batch', label: 'Seedance 1.0 Pro (批量) 省50%' },
  { value: 'fal-wan25', label: 'Wan 2.6' },
  { value: 'fal-veo31', label: 'Veo 3.1 Fast' },
  { value: 'fal-sora2', label: 'Sora 2' },
  { value: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video', label: 'Kling 2.5 Turbo Pro' },
  { value: 'fal-ai/kling-video/v3/standard/image-to-video', label: 'Kling 3 Standard' },
  { value: 'fal-ai/kling-video/v3/pro/image-to-video', label: 'Kling 3 Pro' }
]

// SeeDream 批量模型列表（使用 GPU 空闲时间，成本降低50%）
export const SEEDANCE_BATCH_MODELS = [
  'doubao-seedance-1-5-pro-251215-batch',
  'doubao-seedance-1-0-pro-250528-batch',
  'doubao-seedance-1-0-pro-fast-251015-batch',
  'doubao-seedance-1-0-lite-i2v-250428-batch',
]

// 支持生成音频的模型
export const AUDIO_SUPPORTED_MODELS = [
  'doubao-seedance-2-0-260128',
  'doubao-seedance-2-0-fast-260128',
  'doubao-seedance-1-5-pro-251215',
  'doubao-seedance-1-5-pro-251215-batch',
]

// 首尾帧视频模型（能力权威来源是 standards/capabilities；此常量仅作静态兜底展示）
export const FIRST_LAST_FRAME_MODELS = [
  { value: 'doubao-seedance-2-0-260128', label: 'Seedance 2.0 (首尾帧)' },
  { value: 'doubao-seedance-2-0-fast-260128', label: 'Seedance 2.0 Fast (首尾帧)' },
  { value: 'doubao-seedance-1-5-pro-251215', label: 'Seedance 1.5 Pro (首尾帧)' },
  { value: 'doubao-seedance-1-5-pro-251215-batch', label: 'Seedance 1.5 Pro (首尾帧/批量) 省50%' },
  { value: 'doubao-seedance-1-0-pro-250528', label: 'Seedance 1.0 Pro (首尾帧)' },
  { value: 'doubao-seedance-1-0-pro-250528-batch', label: 'Seedance 1.0 Pro (首尾帧/批量) 省50%' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428', label: 'Seedance 1.0 Lite (首尾帧)' },
  { value: 'doubao-seedance-1-0-lite-i2v-250428-batch', label: 'Seedance 1.0 Lite (首尾帧/批量) 省50%' },
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1 (首尾帧)' },
  { value: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast (首尾帧)' }
]

export const VIDEO_RESOLUTIONS = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' }
]

export const TTS_RATES = [
  { value: '+0%', label: '正常速度 (1.0x)' },
  { value: '+20%', label: '轻微加速 (1.2x)' },
  { value: '+50%', label: '加速 (1.5x)' },
  { value: '+100%', label: '快速 (2.0x)' }
]

export const TTS_VOICES = [
  { value: 'zh-CN-YunxiNeural', label: '云希 (男声)', preview: '男' },
  { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (女声)', preview: '女' },
  { value: 'zh-CN-YunyangNeural', label: '云扬 (男声)', preview: '男' },
  { value: 'zh-CN-XiaoyiNeural', label: '晓伊 (女声)', preview: '女' }
]

export const ART_STYLES = [
  // ── 经典漫画面风 ──
  {
    value: 'manga-clean',
    label: '日漫清爽',
    preview: '漫',
    promptZh: '干净赛璐璐动漫风格，清晰描边，鲜明平涂色彩，漫画网点阴影，日式漫画美术风格。',
    promptEn: 'Clean cel-shaded anime style, bold outlines, vibrant flat colors, manga screentone shading, Japanese comic art.'
  },
  {
    value: 'manga-dark',
    label: '日漫暗黑',
    preview: '墨',
    promptZh: '黑暗漫画风格，沉重墨线，戏剧性阴影，黑色电影氛围，青年漫画美学，高对比黑白加选择性色彩。',
    promptEn: 'Dark manga style, heavy ink lines, dramatic shadows, noir atmosphere, seinen manga aesthetic, high contrast black and white with selective color.'
  },
  {
    value: 'chinese-comic',
    label: '精致国漫',
    preview: '国',
    promptZh: '现代高质量漫画风格，动漫风格，细节丰富精致，线条锐利干净，质感饱满，超清，干净的画面风格，2D风格，动漫风格。',
    promptEn: 'Modern premium Chinese comic style, rich details, clean sharp line art, full texture, ultra-clear 2D anime aesthetics.'
  },
  {
    value: 'manhua-xianxia',
    label: '国漫仙侠',
    preview: '仙',
    promptZh: '中国漫画风格，飘逸衣袂，水墨渲染效果，空灵氛围，中国传统绘画影响，仙侠美学。',
    promptEn: 'Chinese manhua style, flowing robes, ink wash rendering, ethereal atmosphere, traditional Chinese painting influence, xianxia aesthetic.'
  },
  {
    value: 'japanese-anime',
    label: '日系动漫风',
    preview: '日',
    promptZh: '现代日系动漫风格，赛璐璐上色，清晰干净的线条，视觉小说CG感。高质量2D风格',
    promptEn: 'Modern Japanese anime style, cel shading, clean line art, visual-novel CG look, high-quality 2D style.'
  },
  {
    value: 'webtoon',
    label: '韩漫条漫',
    preview: '韩',
    promptZh: '韩国条漫风格，柔和渐变，精致角色设计，干净数字绘画，竖屏条漫构图，Naver条漫美学。',
    promptEn: 'Korean webtoon style, soft gradients, detailed character design, clean digital painting, vertical panel composition, Naver webtoon aesthetic.'
  },
  // ── 写实 / 电影 ──
  {
    value: 'cinematic',
    label: '电影质感',
    preview: '影',
    promptZh: '电影静帧质感，变形宽银幕光晕，浅景深，胶片颗粒，色彩分级，戏剧性灯光，35mm胶片感。',
    promptEn: 'Cinematic still frame, anamorphic lens flare, shallow depth of field, film grain, color grading, dramatic lighting, 35mm film look.'
  },
  {
    value: 'photorealistic',
    label: '超写实',
    preview: '实',
    promptZh: '真实电影级画面质感，真实现实场景，色彩饱满通透，画面干净精致，真实感，超高清细节。',
    promptEn: 'Photorealistic, hyperdetailed skin texture, subsurface scattering, natural lighting, 8K resolution, DSLR quality.'
  },
  {
    value: 'noir',
    label: '黑色电影',
    preview: ' noir',
    promptZh: '黑色电影风格，高对比黑白，百叶窗阴影，硬方向光，侦探氛围，1940年代美学。',
    promptEn: 'Film noir style, high contrast black and white, venetian blind shadows, hard directional lighting, detective atmosphere, 1940s aesthetic.'
  },
  {
    value: 'realistic',
    label: '真人写实',
    preview: '真',
    promptZh: '真实电影级画面质感，真实现实场景，色彩饱满通透，画面干净精致，真实感',
    promptEn: 'Realistic cinematic look, real-world scene fidelity, rich transparent colors, clean and refined image quality.'
  },
  // ── 奇幻 / 朋克 ──
  {
    value: 'fantasy',
    label: '西方奇幻',
    preview: '奇',
    promptZh: '高魔奇幻插画，史诗魔法氛围，华丽中世纪盔甲，发光奥术效果，戏剧性神圣光芒，概念艺术品质。',
    promptEn: 'High fantasy illustration, epic magical atmosphere, ornate medieval armor, glowing arcane effects, dramatic god rays, concept art quality.'
  },
  {
    value: 'cyberpunk',
    label: '赛博朋克',
    preview: '赛',
    promptZh: '赛博朋克都市，霓虹灯光，全息投影，雨湿街道，高科技低生活，银翼杀手氛围。',
    promptEn: 'Cyberpunk cityscape, neon lights, holographic displays, rain-soaked streets, high-tech low-life, Blade Runner atmosphere.'
  },
  {
    value: 'steampunk',
    label: '蒸汽朋克',
    preview: '蒸',
    promptZh: '蒸汽朋克美学，黄铜齿轮，维多利亚时代时装，蒸汽动力机械，温暖铜色调，精密机械细节。',
    promptEn: 'Steampunk aesthetic, brass gears and cogs, Victorian era fashion, steam-powered machinery, warm copper tones, intricate mechanical details.'
  },
  {
    value: 'solarpunk',
    label: '太阳朋克',
    preview: '阳',
    promptZh: '太阳朋克乌托邦，葱郁绿色建筑，太阳能板，明亮自然光照，生态和谐，乐观未来主义设计。',
    promptEn: 'Solarpunk utopia, lush green architecture, solar panels, bright natural lighting, ecological harmony, optimistic futuristic design.'
  },
  // ── 艺术画风 ──
  {
    value: 'watercolor',
    label: '水彩画风',
    preview: '彩',
    promptZh: '水彩画风格，柔和湿画法融合，半透明色彩层，可见纸张纹理，细腻笔触。',
    promptEn: 'Watercolor painting style, soft wet-on-wet blending, translucent color layers, paper texture visible, delicate brush strokes.'
  },
  {
    value: 'oil-painting',
    label: '油画风格',
    preview: '油',
    promptZh: '油画风格，可见厚涂笔触，丰富调色板，古典明暗对比灯光，画布纹理，伦勃朗光。',
    promptEn: 'Oil painting style, visible impasto brush strokes, rich color palette, classical chiaroscuro lighting, canvas texture, Rembrandt lighting.'
  },
  {
    value: 'pixel-art',
    label: '像素复古',
    preview: '像',
    promptZh: '像素艺术风格，16位复古游戏美学，有限调色板，清晰像素边缘，SNES时代画面。',
    promptEn: 'Pixel art style, 16-bit retro game aesthetic, limited color palette, crisp pixel edges, SNES era graphics.'
  },
  {
    value: 'flat-design',
    label: '扁平插画',
    preview: '扁',
    promptZh: '扁平设计插画，几何形状，大胆纯色，极简细节，现代矢量艺术风格，干净构图。',
    promptEn: 'Flat design illustration, geometric shapes, bold solid colors, minimal details, modern vector art style, clean composition.'
  },
  // ── 情绪 / 氛围 ──
  {
    value: 'horror-suspense',
    label: '恐怖悬疑',
    preview: '怖',
    promptZh: '恐怖氛围，压迫性黑暗，浓重阴影，诡异绿蓝色调，不安构图，扭曲视角，令人恐惧。',
    promptEn: 'Horror atmosphere, oppressive darkness, heavy shadows, eerie green/blue tint, unsettling composition, twisted perspectives, dread-inducing.'
  },
  {
    value: 'romance',
    label: '浪漫唯美',
    preview: '恋',
    promptZh: '浪漫氛围，柔和黄金时刻灯光，温暖粉色调，飘落樱花，梦幻散景背景，柔和镜头光晕。',
    promptEn: 'Romantic atmosphere, soft golden hour lighting, warm pink tones, floating cherry blossoms, dreamy bokeh background, gentle lens flare.'
  },
  {
    value: 'melancholy',
    label: '忧郁文艺',
    preview: '忧',
    promptZh: '忧郁情绪，去饱和冷色调，雨天氛围，孤独构图，柔和色彩，阴天天空，沉思的静谧。',
    promptEn: 'Melancholic mood, desaturated cool tones, rain atmosphere, lonely composition, muted colors, overcast sky, contemplative stillness.'
  },
  {
    value: 'epic-battle',
    label: '热血战斗',
    preview: '燃',
    promptZh: '动态动作场景，速度线，冲击帧，能量爆发，戏剧性透视，运动模糊，少年漫画战斗强度。',
    promptEn: 'Dynamic action scene, speed lines, impact frames, energy explosion, dramatic perspective, motion blur, shonen battle manga intensity.'
  },
  // ── 特定题材 ──
  {
    value: 'historical',
    label: '古风历史',
    preview: '古',
    promptZh: '古代历史场景，传统建筑，古代服饰，水墨氛围，中国古典/日本传统美学，博物馆级细节。',
    promptEn: 'Historical period setting, traditional architecture, ancient costumes, ink wash atmosphere, classical Chinese/Japanese aesthetic, museum-quality detail.'
  },
  {
    value: 'modern-urban',
    label: '现代都市',
    preview: '都',
    promptZh: '现代都市环境，城市夜景，霓虹招牌，当代建筑，日常生活氛围，写实城市细节。',
    promptEn: 'Modern urban setting, city nightscape, neon signage, contemporary architecture, everyday life atmosphere, realistic city details.'
  },
  {
    value: 'chibi-cute',
    label: 'Q版可爱',
    preview: 'Q',
    promptZh: 'Q版风格，大头小身，圆润柔软特征，可爱萌系美学，柔和色彩点缀，大而有表现力的眼睛。',
    promptEn: 'Chibi style, oversized head, small body, round soft features, cute kawaii aesthetic, pastel color accents, big expressive eyes.'
  },
  {
    value: 'gothic',
    label: '哥特暗黑',
    preview: '哥',
    promptZh: '哥特美学，暗黑华丽建筑，深红与黑色调，颓废氛围，精致蕾丝与铁艺细节，维多利亚哥特。',
    promptEn: 'Gothic aesthetic, dark ornate architecture, deep crimson and black palette, decadent atmosphere, intricate lace and iron details, Victorian gothic.'
  },
  {
    value: 'scifi-mecha',
    label: '科幻机甲',
    preview: '机',
    promptZh: '机甲科幻，巨型机器人设计，金属表面细节，太空战斗氛围，全息HUD显示，EVA/高达美学。',
    promptEn: 'Mecha sci-fi, giant robot design, metallic surface detail, space battle atmosphere, holographic HUD displays, Evangelion/Gundam aesthetic.'
  },
  {
    value: 'american-comic',
    label: '美漫风格',
    preview: '美',
    promptZh: '日式动漫风格',
    promptEn: 'Japanese anime style'
  },
]

export type ArtStyleValue = (typeof ART_STYLES)[number]['value']

export function isArtStyleValue(value: unknown): value is ArtStyleValue {
  return typeof value === 'string' && ART_STYLES.some((style) => style.value === value)
}

/**
 * 🔥 实时从 ART_STYLES 常量获取风格 prompt
 * 这是获取风格 prompt 的唯一正确方式，确保始终使用最新的常量定义
 * 
 * @param artStyle - 风格标识符，如 'realistic', 'american-comic' 等
 * @returns 对应的风格 prompt，如果找不到则返回空字符串
 */
export function getArtStylePrompt(
  artStyle: string | null | undefined,
  locale: 'zh' | 'en',
): string {
  if (!artStyle) return ''
  const style = ART_STYLES.find(s => s.value === artStyle)
  if (!style) return ''
  return locale === 'en' ? style.promptEn : style.promptZh
}

// 角色形象生成的系统后缀（始终添加到提示词末尾，不显示给用户）- 左侧面部特写+右侧三视图
export const CHARACTER_PROMPT_SUFFIX = '角色设定图，画面分为左右两个区域：【左侧区域】占约1/3宽度，是角色的正面特写（如果是人类则展示完整正脸，如果是动物/生物则展示最具辨识度的正面形态）；【右侧区域】占约2/3宽度，是角色三视图横向排列（从左到右依次为：正面全身、侧面全身、背面全身），三视图高度一致。纯白色背景，无其他元素。'

// 道具图片生成的系统后缀（固定白底三视图资产图）
export const PROP_PROMPT_SUFFIX = '道具设定图，画面分为左右两个区域：【左侧区域】占约1/3宽度，是道具主体的主视图特写；【右侧区域】占约2/3宽度，是同一道具的三视图横向排列（从左到右依次为：正面、侧面、背面），三视图高度一致。纯白色背景，主体居中完整展示，无人物、无手部、无桌面陈设、无环境背景、无其他元素。'

// 场景图片生成的系统后缀（已禁用四视图，直接生成单张场景图）
export const LOCATION_PROMPT_SUFFIX = ''

// 角色资产图生成比例（当前角色设定图实际使用 3:2）
export const CHARACTER_ASSET_IMAGE_RATIO = '3:2'
// 历史保留：旧注释中曾写 16:9，但当前资产图生成统一以 CHARACTER_ASSET_IMAGE_RATIO 为准
export const CHARACTER_IMAGE_RATIO = CHARACTER_ASSET_IMAGE_RATIO
// 角色图片尺寸（用于Seedream API）
export const CHARACTER_IMAGE_SIZE = '3840x2160'  // 16:9 横版
// 角色图片尺寸（用于Banana API）
export const CHARACTER_IMAGE_BANANA_RATIO = CHARACTER_ASSET_IMAGE_RATIO

// 道具图片生成比例（与角色资产图保持一致）
export const PROP_IMAGE_RATIO = CHARACTER_ASSET_IMAGE_RATIO

// 场景图片生成比例（1:1 正方形单张场景）
export const LOCATION_IMAGE_RATIO = '1:1'
// 场景图片尺寸（用于Seedream API）- 4K
export const LOCATION_IMAGE_SIZE = '4096x4096'  // 1:1 正方形 4K
// 场景图片尺寸（用于Banana API）
export const LOCATION_IMAGE_BANANA_RATIO = '1:1'

// 从提示词中移除角色系统后缀（用于显示给用户）
export function removeCharacterPromptSuffix(prompt: string): string {
  if (!prompt) return ''
  return prompt.replace(CHARACTER_PROMPT_SUFFIX, '').trim()
}

// 添加角色系统后缀到提示词（用于生成图片）
export function addCharacterPromptSuffix(prompt: string): string {
  if (!prompt) return CHARACTER_PROMPT_SUFFIX
  const cleanPrompt = removeCharacterPromptSuffix(prompt)
  return `${cleanPrompt}${cleanPrompt ? '，' : ''}${CHARACTER_PROMPT_SUFFIX}`
}

export function removePropPromptSuffix(prompt: string): string {
  if (!prompt) return ''
  return prompt.replace(PROP_PROMPT_SUFFIX, '').replace(/，$/, '').trim()
}

export function addPropPromptSuffix(prompt: string): string {
  if (!prompt) return PROP_PROMPT_SUFFIX
  const cleanPrompt = removePropPromptSuffix(prompt)
  return `${cleanPrompt}${cleanPrompt ? '，' : ''}${PROP_PROMPT_SUFFIX}`
}

// 从提示词中移除场景系统后缀（用于显示给用户）
export function removeLocationPromptSuffix(prompt: string): string {
  if (!prompt) return ''
  return prompt.replace(LOCATION_PROMPT_SUFFIX, '').replace(/，$/, '').trim()
}

// 添加场景系统后缀到提示词（用于生成图片）
export function addLocationPromptSuffix(prompt: string): string {
  // 后缀为空时直接返回原提示词
  if (!LOCATION_PROMPT_SUFFIX) return prompt || ''
  if (!prompt) return LOCATION_PROMPT_SUFFIX
  const cleanPrompt = removeLocationPromptSuffix(prompt)
  return `${cleanPrompt}${cleanPrompt ? '，' : ''}${LOCATION_PROMPT_SUFFIX}`
}

/**
 * 构建角色介绍字符串（用于发送给 AI，帮助理解"我"和称呼对应的角色）
 * @param characters - 角色列表，需要包含 name 和 introduction 字段
 * @returns 格式化的角色介绍字符串
 */
export function buildCharactersIntroduction(characters: Array<{ name: string; introduction?: string | null }>): string {
  if (!characters || characters.length === 0) return '暂无角色介绍'

  const introductions = characters
    .filter(c => c.introduction && c.introduction.trim())
    .map(c => `- ${c.name}：${c.introduction}`)

  if (introductions.length === 0) return '暂无角色介绍'

  return introductions.join('\n')
}
