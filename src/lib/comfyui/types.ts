import type { GenerateOptions } from '../generators/base'

export interface ComfyUINode {
  class_type: string
  inputs: Record<string, unknown>
}

export type ComfyUIWorkflow = Record<string, ComfyUINode>

export type WorkflowType = 'txt2img' | 'img2img' | 'multi-ref' | 'txt2vid' | 'img2vid' | 'unknown'

export interface WorkflowAnalysis {
  type: WorkflowType
  promptNodes: string[]
  negativePromptNodes: string[]
  loadImageNodes: string[]
  samplerNodes: string[]
  latentNodes: string[]
  checkpointNodes: string[]
  videoNodes: string[]
}

export interface WorkflowInjectionResult {
  workflow: ComfyUIWorkflow
  promptNodeId?: string
  negativePromptNodeId?: string
  loadImageNodeIds: string[]
}

export interface ComfyUIWorkflowConfig {
  workflow: ComfyUIWorkflow
  prompt?: string
  negativePrompt?: string
  referenceImages?: string[]
  options?: GenerateOptions
}
