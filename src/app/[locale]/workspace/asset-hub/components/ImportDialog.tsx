'use client'

import { useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { AppIcon } from '@/components/ui/icons'
import { MediaImageWithLoading } from '@/components/media/MediaImageWithLoading'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (files: File[]) => Promise<void>
  title?: string
  accept?: string
  maxFiles?: number
}

export function ImportDialog({
  open,
  onClose,
  onImport,
  title,
  accept = 'image/*',
  maxFiles = 20,
}: ImportDialogProps) {
  const t = useTranslations('assetHub')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, maxFiles - selectedFiles.length)
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'))

    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, maxFiles))

    // Generate previews
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [selectedFiles.length, maxFiles])

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setSelectedFiles([])
    setPreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    if (selectedFiles.length === 0) return
    setIsImporting(true)
    try {
      await onImport(selectedFiles)
      handleClearAll()
      onClose()
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] mx-4 glass-surface-modal rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-stroke-base)]">
          <h3 className="text-lg font-semibold text-[var(--glass-text-primary)]">
            {title || t('importTitle')}
          </h3>
          <button onClick={onClose} className="glass-icon-btn-sm">
            <AppIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[var(--glass-stroke-focus)] bg-[var(--glass-tone-info-bg)]'
                : 'border-[var(--glass-stroke-base)] hover:border-[var(--glass-stroke-focus)]'
            }`}
          >
            <AppIcon name="upload" className="w-12 h-12 mx-auto mb-3 text-[var(--glass-text-tertiary)]" />
            <p className="text-sm text-[var(--glass-text-secondary)] mb-1">
              {t('importDropzone')}
            </p>
            <p className="text-xs text-[var(--glass-text-tertiary)]">
              {t('importMaxFiles', { max: maxFiles })}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--glass-text-primary)]">
                  {t('importSelected', { count: selectedFiles.length })}
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-[var(--glass-tone-danger-fg)] hover:underline"
                >
                  {t('importClearAll')}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <MediaImageWithLoading
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFile(index) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <AppIcon name="close" className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/50 text-white truncate max-w-[80%]">
                      {selectedFiles[index]?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--glass-stroke-base)]">
          <button
            onClick={onClose}
            className="glass-btn-base glass-btn-secondary px-4 py-2 rounded-lg text-sm"
          >
            {t('importCancel')}
          </button>
          <button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isImporting}
            className="glass-btn-base glass-btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {isImporting ? t('importing') : t('importConfirm', { count: selectedFiles.length })}
          </button>
        </div>
      </div>
    </div>
  )
}
