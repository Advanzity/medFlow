"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { uploadFile, deleteUpload } from '@/app/actions/uploads'
import { toast } from 'sonner'
import { File, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RecordAttachmentsProps {
  patientId: string
  recordId: string
  attachments?: Array<{
    id: string
    filename: string
    url: string
    type: string
    size: number
    uploadedAt: Date
  }>
  onUpload?: () => void
  onDelete?: () => void
}

export function RecordAttachments({
  patientId,
  recordId,
  attachments = [],
  onUpload,
  onDelete
}: RecordAttachmentsProps) {
  const [showUpload, setShowUpload] = useState(false)

  const handleUpload = async (files: File[]) => {
    try {
      const uploads = await Promise.all(
        files.map(file => 
          uploadFile({
            filename: file.name,
            type: file.type,
            size: file.size,
            patientId,
            recordId
          })
        )
      )

      const failed = uploads.filter(result => !result.success)
      if (failed.length) {
        toast.error(`Failed to upload ${failed.length} files`)
      } else {
        toast.success('Files uploaded successfully')
        onUpload?.()
      }
    } catch (error) {
      toast.error('Failed to upload files')
    }
    setShowUpload(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteUpload(id)
      if (result.success) {
        toast.success('File deleted successfully')
        onDelete?.()
      } else {
        toast.error(result.error || 'Failed to delete file')
      }
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Attachments</CardTitle>
        <Button
          variant="outline"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? 'Cancel' : 'Add Files'}
        </Button>
      </CardHeader>
      <CardContent>
        {showUpload ? (
          <FileUpload
            onUpload={handleUpload}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
          />
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attachments yet
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 rounded-lg border bg-background"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{attachment.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    View
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this attachment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(attachment.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}