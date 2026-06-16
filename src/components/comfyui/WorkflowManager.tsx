'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AppIcon, type AppIconName } from '@/components/ui/icons'

interface WorkflowItem {
  id: string
  name: string
  type: string
  typeLabel: string
  createdAt: string
}

interface WorkflowManagerProps {
  onWorkflowSelect?: (workflow: WorkflowItem) => void
}

export function WorkflowManager({ onWorkflowSelect }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importName, setImportName] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/comfyui-workflows')
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data.workflows || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportError('')

    try {
      const text = await file.text()
      const name = importName.trim() || file.name.replace(/\.json$/i, '')

      const res = await fetch('/api/comfyui-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, json: text }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Import failed')
      }

      setImportName('')
      await fetchWorkflows()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [importName, fetchWorkflows])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('确定删除此工作流？')) return

    try {
      await fetch(`/api/comfyui-workflows?id=${id}`, { method: 'DELETE' })
      await fetchWorkflows()
    } catch {
      // ignore
    }
  }, [fetchWorkflows])

  const handleExport = useCallback((workflow: WorkflowItem) => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'txt2img': return 'fileText'
      case 'img2img': return 'imageEdit'
      case 'multi-ref': return 'image'
      case 'txt2vid': return 'video'
      case 'img2vid': return 'clapperboard'
      default: return 'cube'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'txt2img': return 'text-blue-500'
      case 'img2img': return 'text-green-500'
      case 'multi-ref': return 'text-purple-500'
      case 'txt2vid': return 'text-orange-500'
      case 'img2vid': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-[var(--glass-text-primary)]">
          ComfyUI 工作流管理
        </h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="glass-btn-base glass-btn-primary flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium disabled:opacity-50"
        >
          <AppIcon name="upload" className="h-3 w-3" />
          {importing ? '导入中...' : '导入工作流'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileImport}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={importName}
          onChange={(e) => setImportName(e.target.value)}
          placeholder="工作流名称（可选，默认使用文件名）"
          className="glass-input-base flex-1 px-2 py-1 text-[11px]"
        />
      </div>

      {importError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-500">
          {importError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4 text-[var(--glass-text-tertiary)]">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2 text-[11px]">加载中...</span>
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--glass-stroke-base)] bg-[var(--glass-bg-surface)] p-4 text-center">
          <AppIcon name="cube" className="mx-auto mb-2 h-8 w-8 text-[var(--glass-text-tertiary)]" />
          <p className="text-[12px] text-[var(--glass-text-tertiary)]">
            暂无自定义工作流
          </p>
          <p className="mt-1 text-[10px] text-[var(--glass-text-tertiary)]">
            从 ComfyUI 导出 API 格式 JSON 后导入
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="group flex items-center gap-2 rounded-xl bg-[var(--glass-bg-surface)] px-3 py-2 transition-colors hover:bg-[var(--glass-bg-surface-strong)]"
            >
              <AppIcon
                name={getTypeIcon(wf.type) as AppIconName}
                className={`h-4 w-4 shrink-0 ${getTypeColor(wf.type)}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-semibold text-[var(--glass-text-primary)]">
                    {wf.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-[var(--glass-bg-muted)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--glass-text-secondary)]">
                    {wf.typeLabel}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--glass-text-tertiary)]">
                  {new Date(wf.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {onWorkflowSelect && (
                  <button
                    onClick={() => onWorkflowSelect(wf)}
                    className="glass-icon-btn-sm text-green-500"
                    title="使用此工作流"
                  >
                    <AppIcon name="check" className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleExport(wf)}
                  className="glass-icon-btn-sm"
                  title="导出"
                >
                  <AppIcon name="download" className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(wf.id)}
                  className="glass-icon-btn-sm text-red-500"
                  title="删除"
                >
                  <AppIcon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
