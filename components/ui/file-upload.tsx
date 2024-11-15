"use client"

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from './card'
import { X, File, FileImage, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string[]
}

export function FileUpload({ onUpload, maxFiles = 5, maxSize = 5 * 1024 * 1024, accept }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept ? Object.fromEntries(accept.map(type => [type, []])) : undefined
  })

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            {accept ? accept.join(', ') : 'Any file type'} up to {Math.round(maxSize / 1024 / 1024)}MB
          </div>
        </div>
      </Card>

      {acceptedFiles.length > 0 && (
        <div className="space-y-2">
          {acceptedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-2 p-2 rounded-md border bg-background"
            >
              {file.type.startsWith('image/') ? (
                <FileImage className="h-4 w-4 text-blue-500" />
              ) : (
                <File className="h-4 w-4 text-blue-500" />
              )}
              <div className="flex-1 text-sm truncate">
                {file.name} ({Math.round(file.size / 1024)}KB)
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const dt = new DataTransfer()
                  for (const f of acceptedFiles) {
                    if (f !== file) dt.items.add(f)
                  }
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  if (input) input.files = dt.files
                }}
                className="text-destructive hover:text-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}