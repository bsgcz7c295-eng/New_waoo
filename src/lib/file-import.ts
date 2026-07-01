/**
 * 文件导入工具 - 支持 txt、docx、json 格式
 */

import mammoth from 'mammoth'

/** 支持的文件类型 */
export const SUPPORTED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/json': ['.json'],
} as const

/** 接受的文件扩展名 */
export const ACCEPTED_EXTENSIONS = '.txt,.docx,.json'

/** 最大文件大小 (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export interface FileImportResult {
  success: boolean
  content?: string
  error?: string
  fileName?: string
}

/**
 * 读取文件内容
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 验证文件
 */
function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `文件大小超过限制 (最大 ${MAX_FILE_SIZE / 1024 / 1024}MB)`
  }

  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  const validExtensions = Object.values(SUPPORTED_FILE_TYPES).flat()
  if (!validExtensions.includes(extension as typeof validExtensions[number])) {
    return `不支持的文件类型: ${extension}`
  }

  return null
}

/**
 * 解析 TXT 文件
 */
async function parseTxtFile(file: File): Promise<FileImportResult> {
  try {
    const content = await readFileAsText(file)
    return {
      success: true,
      content: content.trim(),
      fileName: file.name,
    }
  } catch {
    return {
      success: false,
      error: '读取 TXT 文件失败',
      fileName: file.name,
    }
  }
}

/**
 * 解析 Word 文档 (docx)
 */
async function parseDocxFile(file: File): Promise<FileImportResult> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file)
    const result = await mammoth.extractRawText({ arrayBuffer })
    return {
      success: true,
      content: result.value.trim(),
      fileName: file.name,
    }
  } catch {
    return {
      success: false,
      error: '读取 Word 文档失败',
      fileName: file.name,
    }
  }
}

/**
 * 解析 JSON 文件
 */
async function parseJsonFile(file: File): Promise<FileImportResult> {
  try {
    const text = await readFileAsText(file)
    const data = JSON.parse(text)

    // 支持多种 JSON 结构
    let content = ''

    if (typeof data === 'string') {
      // 纯字符串 JSON
      content = data
    } else if (data.content) {
      // { content: "..." } 结构
      content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content, null, 2)
    } else if (data.text) {
      // { text: "..." } 结构
      content = typeof data.text === 'string' ? data.text : JSON.stringify(data.text, null, 2)
    } else if (data.story || data.script || data.novel) {
      // { story: "..." } 或 { script: "..." } 或 { novel: "..." } 结构
      const key = data.story ? 'story' : data.script ? 'script' : 'novel'
      content = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key], null, 2)
    } else if (Array.isArray(data)) {
      // 数组结构 - 尝试提取文本字段
      const textFields = ['content', 'text', 'description', 'body', 'story', 'script']
      const texts: string[] = []

      for (const item of data) {
        if (typeof item === 'string') {
          texts.push(item)
        } else if (typeof item === 'object' && item !== null) {
          for (const field of textFields) {
            if (typeof item[field] === 'string') {
              texts.push(item[field])
              break
            }
          }
        }
      }

      content = texts.join('\n\n')
    } else {
      // 其他结构 - 格式化为可读文本
      content = JSON.stringify(data, null, 2)
    }

    if (!content.trim()) {
      return {
        success: false,
        error: 'JSON 文件中未找到可导入的文本内容',
        fileName: file.name,
      }
    }

    return {
      success: true,
      content: content.trim(),
      fileName: file.name,
    }
  } catch {
    return {
      success: false,
      error: '解析 JSON 文件失败，请确保文件格式正确',
      fileName: file.name,
    }
  }
}

/**
 * 导入文件
 */
export async function importFile(file: File): Promise<FileImportResult> {
  // 验证文件
  const validationError = validateFile(file)
  if (validationError) {
    return {
      success: false,
      error: validationError,
      fileName: file.name,
    }
  }

  // 根据文件类型解析
  const extension = file.name.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'txt':
      return parseTxtFile(file)
    case 'docx':
      return parseDocxFile(file)
    case 'json':
      return parseJsonFile(file)
    default:
      return {
        success: false,
        error: `不支持的文件类型: ${extension}`,
        fileName: file.name,
      }
  }
}
