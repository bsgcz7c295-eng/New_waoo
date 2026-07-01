import type { GenerateResult } from '@/lib/generators/base'
import type { OpenAICompatImageRequest } from '../types'
import {
  createOpenAICompatClient,
  readStringOption,
  resolveOpenAICompatClientConfig,
  toUploadFile,
} from './common'

type OpenAIImageResponseFormat = 'url' | 'b64_json'
type OpenAIImageOutputFormat = 'png' | 'jpeg' | 'webp'
type OpenAIImageGenerateQuality = 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'auto'
type OpenAIImageGenerateSize =
  | 'auto'
  | '1024x1024'
  | '1536x1024'
  | '1024x1536'
  | '256x256'
  | '512x512'
  | '1792x1024'
  | '1024x1792'

const OPENAI_IMAGE_OPTION_KEYS = new Set([
  'provider',
  'modelId',
  'modelKey',
  'size',
  'resolution',
  'quality',
  'responseFormat',
  'outputFormat',
  'aspectRatio',
  'keepOriginalAspectRatio',
])

function assertAllowedOptions(options: Record<string, unknown>) {
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) continue
    if (!OPENAI_IMAGE_OPTION_KEYS.has(key)) {
      throw new Error(`OPENAI_COMPAT_IMAGE_OPTION_UNSUPPORTED: ${key}`)
    }
  }
}

function normalizeResponseFormat(value: unknown): OpenAIImageResponseFormat {
  const normalized = readStringOption(value, 'responseFormat')
  if (!normalized) return 'b64_json'
  if (normalized === 'url' || normalized === 'b64_json') return normalized
  throw new Error(`OPENAI_COMPAT_IMAGE_OPTION_UNSUPPORTED: responseFormat=${normalized}`)
}

function normalizeOutputFormat(value: unknown): OpenAIImageOutputFormat | undefined {
  const normalized = readStringOption(value, 'outputFormat')
  if (!normalized) return undefined
  if (normalized === 'png' || normalized === 'jpeg' || normalized === 'webp') return normalized
  throw new Error(`OPENAI_COMPAT_IMAGE_OPTION_UNSUPPORTED: outputFormat=${normalized}`)
}

function normalizeGenerateQuality(value: unknown): OpenAIImageGenerateQuality | undefined {
  const normalized = readStringOption(value, 'quality')
  if (!normalized) return undefined
  if (
    normalized === 'standard'
    || normalized === 'hd'
    || normalized === 'low'
    || normalized === 'medium'
    || normalized === 'high'
    || normalized === 'auto'
  ) {
    return normalized
  }
  throw new Error(`OPENAI_COMPAT_IMAGE_OPTION_UNSUPPORTED: quality=${normalized}`)
}

function normalizeOpenAIImageSize(value: string | undefined): OpenAIImageGenerateSize | undefined {
  if (!value) return undefined
  if (
    value === 'auto'
    || value === '1024x1024'
    || value === '1536x1024'
    || value === '1024x1536'
    || value === '256x256'
    || value === '512x512'
    || value === '1792x1024'
    || value === '1024x1792'
  ) {
    return value
  }
  throw new Error(`OPENAI_COMPAT_IMAGE_OPTION_UNSUPPORTED: size=${value}`)
}

function resolveRawSize(options: Record<string, unknown>): string | undefined {
  const size = readStringOption(options.size, 'size')
  const resolution = readStringOption(options.resolution, 'resolution')
  const aspectRatio = readStringOption(options.aspectRatio, 'aspectRatio')

  if (size && resolution && size !== resolution) {
    throw new Error('OPENAI_COMPAT_IMAGE_OPTION_CONFLICT: size and resolution must match')
  }

  // 优先使用 size，其次 resolution，最后从 aspectRatio 转换
  if (size) return size
  if (resolution) return resolution

  // 将 aspectRatio 转换为 OpenAI 支持的 size
  if (aspectRatio) {
    const ratioMap: Record<string, string> = {
      '1:1': '1024x1024',
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '3:2': '1536x1024',
      '2:3': '1024x1536',
    }
    const mapped = ratioMap[aspectRatio]
    if (mapped) return mapped
  }

  return undefined
}

function resolveModelId(modelId: string | undefined, options: Record<string, unknown>): string {
  const optionModelId = readStringOption(options.modelId, 'modelId')
  const selected = (modelId || optionModelId || '').trim()
  if (selected) return selected
  return 'gpt-image-1'
}

function toMimeFromOutputFormat(outputFormat: string | undefined): string {
  if (outputFormat === 'jpeg' || outputFormat === 'jpg') return 'image/jpeg'
  if (outputFormat === 'webp') return 'image/webp'
  return 'image/png'
}

interface ImagePayloads {
  /** 第一张图的 base64（向后兼容） */
  b64Json: string | null
  /** 第一张图的 URL（向后兼容） */
  url: string | null
  /** 所有图的 URL 列表（接口返回多张时有值） */
  urls: string[]
}

function readAllImagePayloads(response: unknown): ImagePayloads {
  if (typeof response !== 'object' || response === null) {
    return { b64Json: null, url: null, urls: [] }
  }
  const data = (response as { data?: unknown }).data
  if (!Array.isArray(data) || data.length === 0) {
    return { b64Json: null, url: null, urls: [] }
  }

  const urls: string[] = []
  let firstB64: string | null = null

  for (const item of data) {
    if (typeof item !== 'object' || item === null) continue
    const rawUrl = (item as { url?: unknown }).url
    const rawB64 = (item as { b64_json?: unknown }).b64_json
    if (typeof rawUrl === 'string' && rawUrl.trim()) {
      urls.push(rawUrl.trim())
    }
    if (firstB64 === null && typeof rawB64 === 'string' && rawB64.trim()) {
      firstB64 = rawB64.trim()
    }
  }

  return {
    b64Json: firstB64,
    url: urls[0] ?? null,
    urls,
  }
}

export async function generateImageViaOpenAICompat(request: OpenAICompatImageRequest): Promise<GenerateResult> {
  const {
    userId,
    providerId,
    modelId,
    prompt,
    referenceImages = [],
    options = {},
  } = request

  assertAllowedOptions(options)
  const config = await resolveOpenAICompatClientConfig(userId, providerId)
  const client = createOpenAICompatClient(config)

  const normalizedModelId = resolveModelId(modelId, options)
  const responseFormat = normalizeResponseFormat(options.responseFormat)
  const outputFormat = normalizeOutputFormat(options.outputFormat)
  const quality = normalizeGenerateQuality(options.quality)
  const rawSize = resolveRawSize(options)
  const size = normalizeOpenAIImageSize(rawSize)

  // 检查是否为 Agnes AI（response_format 需要放在 extra_body 中，且使用 generate 而非 edit）
  const isAgnesAI = providerId?.toLowerCase().includes('agnesai')

  if (referenceImages.length > 0) {
    if (isAgnesAI) {
      // Agnes AI：图生图也使用 generate 端点，image 放在 extra_body 中
      const response = await client.images.generate({
        model: normalizedModelId,
        prompt,
        extra_body: {
          image: referenceImages,
          response_format: responseFormat,
        },
        ...(quality ? { quality } : {}),
        ...(size ? { size } : {}),
      } as unknown as Parameters<typeof client.images.generate>[0])

      const imagePayload = readAllImagePayloads(response)
      const imageBase64 = imagePayload.b64Json
      if (typeof imageBase64 === 'string' && imageBase64.trim().length > 0) {
        const mimeType = toMimeFromOutputFormat(outputFormat)
        return {
          success: true,
          imageBase64,
          imageUrl: `data:${mimeType};base64,${imageBase64}`,
        }
      }
      const imageUrl = imagePayload.url
      if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
        return {
          success: true,
          imageUrl,
          ...(imagePayload.urls.length > 1 ? { imageUrls: imagePayload.urls } : {}),
        }
      }
      throw new Error('OPENAI_COMPAT_IMAGE_EMPTY_RESPONSE: no image data returned')
    }

    // 其他提供商：使用 edit 端点
    const response = await client.images.edit({
      model: normalizedModelId,
      prompt,
      image: await Promise.all(referenceImages.map((image, index) => toUploadFile(image, index))),
      response_format: responseFormat,
      ...(outputFormat ? { output_format: outputFormat } : {}),
      ...(quality ? { quality } : {}),
      ...(size ? { size } : {}),
    } as unknown as Parameters<typeof client.images.edit>[0])

    const imagePayload = readAllImagePayloads(response)
    const imageBase64 = imagePayload.b64Json
    if (typeof imageBase64 === 'string' && imageBase64.trim().length > 0) {
      const mimeType = toMimeFromOutputFormat(outputFormat)
      return {
        success: true,
        imageBase64,
        imageUrl: `data:${mimeType};base64,${imageBase64}`,
      }
    }
    const imageUrl = imagePayload.url
    if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
      return {
        success: true,
        imageUrl,
        ...(imagePayload.urls.length > 1 ? { imageUrls: imagePayload.urls } : {}),
      }
    }
    throw new Error('OPENAI_COMPAT_IMAGE_EMPTY_RESPONSE: no image data returned')
  }

  // 文生图：Agnes AI 需要将 response_format 放在 extra_body 中
  const response = await client.images.generate({
    model: normalizedModelId,
    prompt,
    ...(isAgnesAI
      ? {
          extra_body: {
            response_format: responseFormat,
          },
        }
      : {
          response_format: responseFormat,
          ...(outputFormat ? { output_format: outputFormat } : {}),
        }),
    ...(quality ? { quality } : {}),
    ...(size ? { size } : {}),
  } as unknown as Parameters<typeof client.images.generate>[0])

  const imagePayload = readAllImagePayloads(response)
  const imageBase64 = imagePayload.b64Json
  if (typeof imageBase64 === 'string' && imageBase64.trim().length > 0) {
    const mimeType = toMimeFromOutputFormat(outputFormat)
    return {
      success: true,
      imageBase64,
      imageUrl: `data:${mimeType};base64,${imageBase64}`,
    }
  }
  const imageUrl = imagePayload.url
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    return {
      success: true,
      imageUrl,
      ...(imagePayload.urls.length > 1 ? { imageUrls: imagePayload.urls } : {}),
    }
  }
  throw new Error('OPENAI_COMPAT_IMAGE_EMPTY_RESPONSE: no image data returned')
}
