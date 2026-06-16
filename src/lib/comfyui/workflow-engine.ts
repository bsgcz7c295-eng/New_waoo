import type {
  ComfyUIWorkflow,
  ComfyUINode,
  WorkflowType,
  WorkflowAnalysis,
  WorkflowInjectionResult,
  ComfyUIWorkflowConfig,
} from './types'

const PROMPT_NODE_TYPES = new Set(['CLIPTextEncode'])
const NEGATIVE_PROMPT_KEYWORDS = ['negative', 'bad', 'worst', 'low quality', 'ugly']
const LOAD_IMAGE_TYPES = new Set(['LoadImage', 'LoadImageFromPath'])
const SAMPLER_TYPES = new Set(['KSampler', 'KSamplerAdvanced', 'SamplerCustom'])
const LATENT_TYPES = new Set(['EmptyLatentImage', 'EmptyLatentBatch', 'LatentUpscale'])
const CHECKPOINT_TYPES = new Set(['CheckpointLoaderSimple', 'CheckpointLoader', 'unCLIPCheckpointLoader'])
const VIDEO_NODE_TYPES = new Set([
  'SaveAnimatedWEBP', 'VHS_VideoCombine', 'VHS_LoadVideo',
  'WanImageToVideo', 'WanTextToVideo', 'SVD_img2vid_Conditioning',
  'AnimateDiffLoader', 'AnimateDiffCombine', 'LoadVideo',
  'HunyuanVideoSampler', 'LTXVSampler', 'CogVideoSampler',
])

export function analyzeWorkflow(workflow: ComfyUIWorkflow): WorkflowAnalysis {
  const analysis: WorkflowAnalysis = {
    type: 'unknown',
    promptNodes: [],
    negativePromptNodes: [],
    loadImageNodes: [],
    samplerNodes: [],
    latentNodes: [],
    checkpointNodes: [],
    videoNodes: [],
  }

  for (const [nodeId, node] of Object.entries(workflow)) {
    if (!node || !node.class_type) continue
    const classType = node.class_type

    if (PROMPT_NODE_TYPES.has(classType)) {
      const text = String(node.inputs.text || '')
      const isNegative = NEGATIVE_PROMPT_KEYWORDS.some(kw =>
        text.toLowerCase().includes(kw)
      ) || isNodeConnectedToNegative(workflow, nodeId)

      if (isNegative) {
        analysis.negativePromptNodes.push(nodeId)
      } else {
        analysis.promptNodes.push(nodeId)
      }
    }

    if (LOAD_IMAGE_TYPES.has(classType)) {
      analysis.loadImageNodes.push(nodeId)
    }

    if (SAMPLER_TYPES.has(classType)) {
      analysis.samplerNodes.push(nodeId)
    }

    if (LATENT_TYPES.has(classType)) {
      analysis.latentNodes.push(nodeId)
    }

    if (CHECKPOINT_TYPES.has(classType)) {
      analysis.checkpointNodes.push(nodeId)
    }

    if (VIDEO_NODE_TYPES.has(classType)) {
      analysis.videoNodes.push(nodeId)
    }
  }

  analysis.type = detectWorkflowType(analysis)
  return analysis
}

function isNodeConnectedToNegative(workflow: ComfyUIWorkflow, nodeId: string): boolean {
  for (const node of Object.values(workflow)) {
    if (!node?.inputs) continue
    for (const value of Object.values(node.inputs)) {
      if (Array.isArray(value) && value[0] === nodeId && value[1] === 0) {
        if (node.class_type === 'KSampler' || node.class_type === 'KSamplerAdvanced') {
          if (node.inputs.negative && Array.isArray(node.inputs.negative) && node.inputs.negative[0] === nodeId) {
            return true
          }
        }
      }
    }
  }
  return false
}

function detectWorkflowType(analysis: WorkflowAnalysis): WorkflowType {
  const hasLoadImage = analysis.loadImageNodes.length > 0
  const hasVideo = analysis.videoNodes.length > 0

  if (hasVideo) {
    return hasLoadImage ? 'img2vid' : 'txt2vid'
  }

  if (hasLoadImage) {
    return analysis.loadImageNodes.length > 1 ? 'multi-ref' : 'img2img'
  }

  if (analysis.samplerNodes.length > 0 || analysis.latentNodes.length > 0) {
    return 'txt2img'
  }

  return 'unknown'
}

function injectPrompt(
  workflow: ComfyUIWorkflow,
  nodeIds: string[],
  prompt: string,
): void {
  if (nodeIds.length === 0) return
  const targetNodeId = nodeIds[0]
  const node = workflow[targetNodeId]
  if (!node) return

  const existingText = String(node.inputs.text || '')
  if (!existingText || NEGATIVE_PROMPT_KEYWORDS.some(kw => existingText.toLowerCase().includes(kw))) {
    node.inputs.text = prompt
  } else {
    node.inputs.text = prompt
  }
}

function injectNegativePrompt(
  workflow: ComfyUIWorkflow,
  nodeIds: string[],
  negativePrompt: string,
): void {
  if (nodeIds.length === 0) return
  const targetNodeId = nodeIds[0]
  const node = workflow[targetNodeId]
  if (!node) return
  node.inputs.text = negativePrompt
}

function injectReferenceImages(
  workflow: ComfyUIWorkflow,
  loadImageNodeIds: string[],
  imageNames: string[],
): void {
  const count = Math.min(loadImageNodeIds.length, imageNames.length)
  for (let i = 0; i < count; i++) {
    const nodeId = loadImageNodeIds[i]
    const node = workflow[nodeId]
    if (!node) continue
    node.inputs.image = imageNames[i]
  }
}

function injectSamplerParams(
  workflow: ComfyUIWorkflow,
  samplerNodeIds: string[],
  options: {
    seed?: number
    steps?: number
    cfg?: number
    denoise?: number
  },
): void {
  for (const nodeId of samplerNodeIds) {
    const node = workflow[nodeId]
    if (!node) continue

    if (typeof options.seed === 'number') node.inputs.seed = options.seed
    else if (typeof node.inputs.seed === 'number') node.inputs.seed = Math.floor(Math.random() * 2 ** 32)

    if (typeof options.steps === 'number') node.inputs.steps = options.steps
    if (typeof options.cfg === 'number') node.inputs.cfg = options.cfg
    if (typeof options.denoise === 'number') node.inputs.denoise = options.denoise
  }
}

function injectLatentSize(
  workflow: ComfyUIWorkflow,
  latentNodeIds: string[],
  width: number,
  height: number,
): void {
  for (const nodeId of latentNodeIds) {
    const node = workflow[nodeId]
    if (!node) continue
    if ('width' in node.inputs) node.inputs.width = width
    if ('height' in node.inputs) node.inputs.height = height
  }
}

function parseAspectRatio(aspectRatio?: string): { width: number; height: number } {
  if (!aspectRatio) return { width: 1024, height: 1024 }
  const map: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:4': { width: 896, height: 1152 },
    '3:2': { width: 1216, height: 832 },
    '2:3': { width: 832, height: 1216 },
  }
  return map[aspectRatio] || { width: 1024, height: 1024 }
}

export function prepareWorkflow(config: ComfyUIWorkflowConfig): WorkflowInjectionResult {
  const { workflow, prompt, negativePrompt, referenceImages, options } = config
  const cloned: ComfyUIWorkflow = JSON.parse(JSON.stringify(workflow))
  const analysis = analyzeWorkflow(cloned)

  if (prompt) {
    injectPrompt(cloned, analysis.promptNodes, prompt)
  }

  if (negativePrompt) {
    injectNegativePrompt(cloned, analysis.negativePromptNodes, negativePrompt)
  }

  if (referenceImages && referenceImages.length > 0 && analysis.loadImageNodes.length > 0) {
    const imageNames = referenceImages.map((_, i) => `input_${Date.now()}_${i}`)
    injectReferenceImages(cloned, analysis.loadImageNodes, imageNames)
  }

  if (options) {
    const { aspectRatio, seed, steps, cfg, denoise } = options as {
      aspectRatio?: string
      seed?: number
      steps?: number
      cfg?: number
      denoise?: number
    }

    const size = parseAspectRatio(aspectRatio)
    injectSamplerParams(cloned, analysis.samplerNodes, { seed, steps, cfg, denoise })
    injectLatentSize(cloned, analysis.latentNodes, size.width, size.height)
  }

  for (const nodeId of Object.keys(cloned)) {
    const node = cloned[nodeId]
    if (!node) continue
    if (node.class_type === 'SaveImage' && node.inputs.filename_prefix) {
      node.inputs.filename_prefix = `waoowaoo_${Date.now()}`
    }
  }

  return {
    workflow: cloned,
    promptNodeId: analysis.promptNodes[0],
    negativePromptNodeId: analysis.negativePromptNodes[0],
    loadImageNodeIds: analysis.loadImageNodes,
  }
}

export function getWorkflowTypeLabel(type: WorkflowType): string {
  const labels: Record<WorkflowType, string> = {
    txt2img: '文生图',
    img2img: '图生图',
    'multi-ref': '多参考生图',
    txt2vid: '文生视频',
    img2vid: '图生视频',
    unknown: '自定义',
  }
  return labels[type]
}
