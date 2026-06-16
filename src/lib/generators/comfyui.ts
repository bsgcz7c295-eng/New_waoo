import { BaseImageGenerator, type GenerateResult, type ImageGenerateParams } from './base'
import { getProviderConfig } from '@/lib/api-config'
import { createScopedLogger } from '@/lib/logging/core'
import type { GenerateOptions } from './base'
import { prepareWorkflow, getWorkflowTypeLabel, analyzeWorkflow } from '../comfyui/workflow-engine'
import { loadWorkflow } from '../comfyui/workflow-storage'
import type { ComfyUIWorkflow, WorkflowType } from '../comfyui/types'

interface ComfyUIGenerateOptions extends GenerateOptions {
  workflow?: ComfyUIWorkflow
  workflowId?: string
  modelId?: string
  checkpointModel?: string
  steps?: number
  cfg?: number
  seed?: number
  denoise?: number
  negativePrompt?: string
  workflowType?: WorkflowType
}

const DEFAULT_TXT2IMG_WORKFLOW: ComfyUIWorkflow = {
  '1': {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: 'SDXL\\animosity_illustriousV11.safetensors' },
  },
  '2': {
    class_type: 'CLIPTextEncode',
    inputs: { text: '', clip: ['1', 1] },
  },
  '3': {
    class_type: 'CLIPTextEncode',
    inputs: { text: 'low quality, blurry, distorted, watermark, text', clip: ['1', 1] },
  },
  '4': {
    class_type: 'EmptyLatentImage',
    inputs: { width: 1024, height: 1024, batch_size: 1 },
  },
  '5': {
    class_type: 'KSampler',
    inputs: {
      seed: 0, steps: 20, cfg: 7.0, sampler_name: 'euler',
      scheduler: 'normal', denoise: 1.0,
      model: ['1', 0], positive: ['2', 0], negative: ['3', 0], latent_image: ['4', 0],
    },
  },
  '6': {
    class_type: 'VAEDecode',
    inputs: { samples: ['5', 0], vae: ['1', 2] },
  },
  '7': {
    class_type: 'SaveImage',
    inputs: { filename_prefix: 'waoowaoo', images: ['6', 0] },
  },
}

const DEFAULT_IMG2IMG_WORKFLOW: ComfyUIWorkflow = {
  '1': {
    class_type: 'LoadImage',
    inputs: { image: 'input.png' },
  },
  '2': {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: 'SDXL\\animosity_illustriousV11.safetensors' },
  },
  '3': {
    class_type: 'CLIPTextEncode',
    inputs: { text: '', clip: ['2', 1] },
  },
  '4': {
    class_type: 'CLIPTextEncode',
    inputs: { text: 'low quality, blurry, distorted', clip: ['2', 1] },
  },
  '5': {
    class_type: 'VAEEncode',
    inputs: { pixels: ['1', 0], vae: ['2', 2] },
  },
  '6': {
    class_type: 'KSampler',
    inputs: {
      seed: 0, steps: 20, cfg: 7.0, sampler_name: 'euler',
      scheduler: 'normal', denoise: 0.75,
      model: ['2', 0], positive: ['3', 0], negative: ['4', 0], latent_image: ['5', 0],
    },
  },
  '7': {
    class_type: 'VAEDecode',
    inputs: { samples: ['6', 0], vae: ['2', 2] },
  },
  '8': {
    class_type: 'SaveImage',
    inputs: { filename_prefix: 'waoowaoo', images: ['7', 0] },
  },
}

const DEFAULT_MULTIREF_WORKFLOW: ComfyUIWorkflow = {
  '1': {
    class_type: 'LoadImage',
    inputs: { image: 'ref1.png' },
  },
  '2': {
    class_type: 'LoadImage',
    inputs: { image: 'ref2.png' },
  },
  '3': {
    class_type: 'LoadImage',
    inputs: { image: 'ref3.png' },
  },
  '4': {
    class_type: 'CheckpointLoaderSimple',
    inputs: { ckpt_name: 'SDXL\\animosity_illustriousV11.safetensors' },
  },
  '5': {
    class_type: 'CLIPTextEncode',
    inputs: { text: '', clip: ['4', 1] },
  },
  '6': {
    class_type: 'CLIPTextEncode',
    inputs: { text: 'low quality, blurry, distorted', clip: ['4', 1] },
  },
  '7': {
    class_type: 'IPAdapterAdvanced',
    inputs: {
      weight: 0.8, weight_type: 'linear', combine_embeds: 'concat',
      embeds_scaling: 'V only',
      model: ['4', 0],
      ipadapter: ['10', 0],
      clip_vision_output: ['11', 0],
    },
  },
  '8': {
    class_type: 'EmptyLatentImage',
    inputs: { width: 1024, height: 1024, batch_size: 1 },
  },
  '9': {
    class_type: 'KSampler',
    inputs: {
      seed: 0, steps: 20, cfg: 7.0, sampler_name: 'euler',
      scheduler: 'normal', denoise: 1.0,
      model: ['7', 0], positive: ['5', 0], negative: ['6', 0], latent_image: ['8', 0],
    },
  },
  '10': {
    class_type: 'IPAdapterModelLoader',
    inputs: { ipadapter_file: 'ip-adapter-plus_sd15.safetensors' },
  },
  '11': {
    class_type: 'CLIPVisionLoader',
    inputs: { clip_name: 'CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors' },
  },
  '12': {
    class_type: 'VAEDecode',
    inputs: { samples: ['9', 0], vae: ['4', 2] },
  },
  '13': {
    class_type: 'SaveImage',
    inputs: { filename_prefix: 'waoowaoo', images: ['12', 0] },
  },
}

function resolveDefaultWorkflow(type: WorkflowType): ComfyUIWorkflow {
  switch (type) {
    case 'img2img': return JSON.parse(JSON.stringify(DEFAULT_IMG2IMG_WORKFLOW))
    case 'multi-ref': return JSON.parse(JSON.stringify(DEFAULT_MULTIREF_WORKFLOW))
    case 'txt2img':
    default: return JSON.parse(JSON.stringify(DEFAULT_TXT2IMG_WORKFLOW))
  }
}

async function uploadImageToComfyUI(
  baseUrl: string,
  imageData: string,
  filename: string,
  apiKey?: string,
): Promise<string> {
  const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
  const buffer = Buffer.from(base64Data, 'base64')
  const mimeType = imageData.includes('data:')
    ? imageData.split(';')[0].split(':')[1]
    : 'image/png'
  const ext = mimeType.split('/')[1] || 'png'
  const fullFilename = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`

  const formData = new FormData()
  formData.append('image', new Blob([buffer], { type: mimeType }), fullFilename)
  formData.append('overwrite', 'true')

  const headers: Record<string, string> = {}
  if (apiKey && apiKey !== 'none' && apiKey !== 'local-no-auth') {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${baseUrl}/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ComfyUI upload failed (${response.status}): ${errorText}`)
  }

  const result = await response.json() as { name: string }
  return result.name
}

async function waitForCompletion(
  baseUrl: string,
  promptId: string,
  apiKey?: string,
  timeoutMs: number = 300000,
  pollIntervalMs: number = 2000,
): Promise<{ images: Array<{ filename: string; subfolder: string; type: string }> }> {
  const startTime = Date.now()
  const headers: Record<string, string> = {}
  if (apiKey && apiKey !== 'none' && apiKey !== 'local-no-auth') {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`${baseUrl}/history/${promptId}`, { headers })
    if (!response.ok) {
      await new Promise((r) => setTimeout(r, pollIntervalMs))
      continue
    }

    const history = await response.json() as Record<string, {
      outputs?: Record<string, {
        images?: Array<{ filename: string; subfolder: string; type: string }>
        gifs?: Array<{ filename: string; subfolder: string; type: string }>
        videos?: Array<{ filename: string; subfolder: string; type: string }>
      }>
      status?: { status_str: string }
    }>

    const entry = history[promptId]
    if (!entry) {
      await new Promise((r) => setTimeout(r, pollIntervalMs))
      continue
    }

    if (entry.status?.status_str === 'error') {
      throw new Error('ComfyUI workflow execution failed')
    }

    const outputs = entry.outputs
    if (!outputs) {
      await new Promise((r) => setTimeout(r, pollIntervalMs))
      continue
    }

    for (const nodeId of Object.keys(outputs)) {
      const nodeOutput = outputs[nodeId]
      if (!nodeOutput) continue

      const images = nodeOutput.images || nodeOutput.gifs || nodeOutput.videos
      if (images && images.length > 0) {
        return { images }
      }
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs))
  }

  throw new Error('ComfyUI workflow timed out')
}

export class ComfyuiImageGenerator extends BaseImageGenerator {
  private readonly modelId?: string

  constructor(modelId?: string) {
    super()
    this.modelId = modelId
  }

  protected async doGenerate(params: ImageGenerateParams): Promise<GenerateResult> {
    const { userId, prompt, referenceImages = [], options = {} } = params

    const { apiKey, baseUrl } = await getProviderConfig(userId, 'comfyui')
    const {
      aspectRatio,
      workflow: userWorkflow,
      workflowId,
      modelId,
      checkpointModel,
      steps,
      cfg,
      seed,
      denoise,
      negativePrompt,
      workflowType,
    } = options as ComfyUIGenerateOptions

    const logger = createScopedLogger({
      module: 'worker.comfyui-image',
      action: 'comfyui_image_generate',
    })

    const serverUrl = (baseUrl || 'http://127.0.0.1:8188').replace(/\/+$/, '')
    const hasReferenceImages = referenceImages.length > 0

    logger.info({
      message: 'ComfyUI image generation request',
      details: {
        serverUrl,
        hasReferenceImages,
        referenceImagesCount: referenceImages.length,
        aspectRatio: aspectRatio ?? null,
        hasUserWorkflow: !!userWorkflow,
        workflowId: workflowId ?? null,
        modelId: modelId ?? null,
        checkpointModel: checkpointModel ?? null,
      },
    })

    let baseWorkflow: ComfyUIWorkflow

    if (userWorkflow) {
      baseWorkflow = userWorkflow
    } else if (workflowId) {
      const saved = loadWorkflow(workflowId)
      if (saved) {
        baseWorkflow = saved.workflow
        logger.info({
          message: 'Loaded saved workflow',
          details: { workflowId, name: saved.name, type: saved.type },
        })
      } else {
        const detectedType = workflowType || (hasReferenceImages ? 'multi-ref' : 'txt2img')
        baseWorkflow = resolveDefaultWorkflow(detectedType)
      }
    } else if (this.modelId) {
      const saved = loadWorkflow(this.modelId)
      if (saved) {
        baseWorkflow = saved.workflow
        logger.info({
          message: 'Loaded workflow by modelId',
          details: { modelId: this.modelId, name: saved.name, type: saved.type },
        })
      } else {
        const detectedType = workflowType || (hasReferenceImages ? 'multi-ref' : 'txt2img')
        baseWorkflow = resolveDefaultWorkflow(detectedType)
      }
    } else {
      const detectedType = workflowType || (hasReferenceImages ? 'multi-ref' : 'txt2img')
      baseWorkflow = resolveDefaultWorkflow(detectedType)
    }

    if (checkpointModel) {
      for (const node of Object.values(baseWorkflow)) {
        if (node?.class_type === 'CheckpointLoaderSimple') {
          node.inputs.ckpt_name = checkpointModel
        }
      }
    }

    const { workflow: preparedWorkflow, loadImageNodeIds } = prepareWorkflow({
      workflow: baseWorkflow,
      prompt,
      negativePrompt,
      referenceImages: hasReferenceImages ? referenceImages : undefined,
      options: {
        aspectRatio,
        seed: typeof seed === 'number' ? seed : Math.floor(Math.random() * 2 ** 32),
        steps,
        cfg,
        denoise: hasReferenceImages && typeof denoise !== 'number' ? 0.75 : denoise,
      },
    })

    const analysis = analyzeWorkflow(preparedWorkflow)
    const workflowLabel = getWorkflowTypeLabel(analysis.type)
    logger.info({
      message: `ComfyUI workflow type: ${workflowLabel}`,
      details: {
        type: analysis.type,
        promptNodes: analysis.promptNodes,
        loadImageNodes: analysis.loadImageNodes,
        samplerNodes: analysis.samplerNodes,
      },
    })

    if (hasReferenceImages && loadImageNodeIds.length > 0) {
      for (let i = 0; i < Math.min(referenceImages.length, loadImageNodeIds.length); i++) {
        const imageData = referenceImages[i]
        const uploadFilename = `input_${Date.now()}_${i}`
        const uploadedName = await uploadImageToComfyUI(serverUrl, imageData, uploadFilename, apiKey)
        preparedWorkflow[loadImageNodeIds[i]].inputs.image = uploadedName

        logger.info({
          message: 'ComfyUI reference image uploaded',
          details: { index: i, uploadedName, nodeId: loadImageNodeIds[i] },
        })
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey && apiKey !== 'none' && apiKey !== 'local-no-auth') {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const submitResponse = await fetch(`${serverUrl}/prompt`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: preparedWorkflow }),
      cache: 'no-store',
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      throw new Error(`ComfyUI submit failed (${submitResponse.status}): ${errorText}`)
    }

    const submitData = await submitResponse.json() as { prompt_id: string }
    const promptId = submitData.prompt_id

    if (!promptId) {
      throw new Error('ComfyUI did not return prompt_id')
    }

    logger.info({
      message: 'ComfyUI prompt submitted, waiting for completion',
      details: { promptId },
    })

    const result = await waitForCompletion(serverUrl, promptId, apiKey)
    const firstImage = result.images[0]
    const imageUrl = `${serverUrl}/view?filename=${encodeURIComponent(firstImage.filename)}&subfolder=${encodeURIComponent(firstImage.subfolder || '')}&type=${encodeURIComponent(firstImage.type)}`

    const isVideo = firstImage.type === 'output' && (firstImage.filename.endsWith('.mp4') || firstImage.filename.endsWith('.webp') || firstImage.filename.endsWith('.gif'))

    logger.info({
      message: 'ComfyUI generation completed',
      details: { promptId, filename: firstImage.filename, isVideo },
    })

    if (isVideo) {
      return {
        success: true,
        videoUrl: imageUrl,
      }
    }

    return {
      success: true,
      imageUrl,
    }
  }
}
