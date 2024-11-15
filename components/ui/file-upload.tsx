"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { X, File, FileImage, Upload } from 'lucide-react'
import { Button } from './button'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
}

export function FileUpload({ 
  onUpload, 
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf']
  }
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out any files that would exceed the maxFiles limit
    const remainingSlots = maxFiles - files.length
    const newFiles = acceptedFiles.slice(0, remainingSlots)
    
    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    maxFiles: maxFiles - files.length,
    disabled: uploading || files.length >= maxFiles
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      await onUpload(files)
      
      clearInterval(interval)
      setProgress(100)
      
      // Reset after successful upload
      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setUploading(false)
      }, 500)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploading(false)
      setProgress(0)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-500" />
    }
    return <File className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          (uploading || files.length >= maxFiles) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            {accept['image/*']?.join(', ')}, {accept['application/pdf']?.join(', ')}
          </div>
          <div className="text-xs text-muted-foreground">
            Up to {maxFiles} files, max {(maxSize / (1024 * 1024)).toFixed(0)}MB each
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 rounded-lg border bg-background"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={uploading}
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {uploading && (
            <Progress value={progress} className="h-2" />
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
            <Button
              type="button"
              disabled={uploading || files.length === 0}
              onClick={handleUpload}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}