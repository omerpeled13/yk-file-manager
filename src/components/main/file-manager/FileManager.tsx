"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import supabase from "@/src/supabase/supabase-client"
import { FileIcon, DownloadIcon, Loader2 } from "lucide-react"
import { isAdmin, getUser } from "@/src/supabase/auth-helper"

interface File {
  id: string
  name: string
  file_url: string
  description: string
  created_at: string
  file_type: string
  file_size: number
  uploaded_by: string
}

export function FileManager() {
  const [files, setFiles] = useState<File[]>([])
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const user = await getUser()
      if (!user) return

      let query = supabase.from('files').select('*')

      if (!isAdminUser) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (err) {
      setError('שגיאה בטעינת דו"ות')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [isAdminUser])

  const checkAdminStatus = useCallback(async () => {
    const adminStatus = await isAdmin()
    setIsAdminUser(adminStatus)
  }, [])

  useEffect(() => {
    const init = async () => {
      await checkAdminStatus()
      await fetchFiles()
    }
    init()
  }, [checkAdminStatus, fetchFiles])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadLoading(true)
      setError(null)

      const user = await getUser()
      if (!user) throw new Error('User not found')

      // Create a unique file name
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(`public/${fileName}`)

      // Insert file record into the database
      const { error: dbError } = await supabase.from('files').insert({
        name: file.name,
        file_url: `public/${fileName}`,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        user_id: user.id,
        description: ''
      })

      if (dbError) throw dbError

      // Refresh the file list
      await fetchFiles()

      // Clear the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err) {
      console.error('Upload error:', err)
      setError('שגיאה בהעלאת הדו"ח')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(fileUrl)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('שגיאה בהורדת הדו"ח')
      console.error(err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {isAdminUser && (
        <div className="mb-6">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploadLoading}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מעלה...
              </>
            ) : (
              'העלאת דו"ח'
            )}
          </Button>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadLoading}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>דו"חות</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>סוג</TableHead>
                  <TableHead>גודל</TableHead>
                  <TableHead>הועלה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileIcon className="ml-2 h-4 w-4" />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell>{file.file_type}</TableCell>
                    <TableCell>{(file.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.file_url, file.name)}
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {files.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      לא נמצאו דו"חות
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 