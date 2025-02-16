"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import supabase from "@/src/lib/supabaseClientComponentClient"
import { FileIcon, DownloadIcon, Loader2, Eye, Download, Trash2, Pencil, MoreHorizontal } from "lucide-react"
import { isAdmin, getUser } from "@/src/lib/auth-helper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { useAuth } from "@/src/hooks/useAuth"

interface FileRecord {
  id: string
  name: string
  file_url: string
  description: string
  created_at: string
  file_type: string
  file_size: number
  uploaded_by: string
  profiles: { name: string }
}

interface User {
  id: string
  name: string
  email: string
}

export function FileManager() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const { user, loading: user_loading } = useAuth()



  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let query = supabase.from('files').select(`
        *,
        profiles:user_id (
          name
        )
      `)
      if (!user?.isAdmin) {
        query = query.eq('user_id', user?.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      console.log(data)

      if (error) throw error
      setFiles(data || [])
    } catch (err) {
      setError('שגיאה בטעינת דוח"ות')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.isAdmin])



  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!user_loading) {
        await fetchFiles()
        if (user?.isAdmin) {
          await fetchUsers()
        }
      }
    }
    init()
  }, [fetchFiles, fetchUsers, user])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setDisplayName(file.name)
    setShowUploadDialog(true)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedUserId || !displayName) return

    try {
      setUploadLoading(true)
      setError(null)

      const user = await getUser()
      if (!user) throw new Error('User not found')

      // Create a unique file name
      const timestamp = Date.now()
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${selectedUserId}/${fileName}`

      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) throw storageError

      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      // Insert file record into the database
      const { error: dbError } = await supabase.from('files').insert({
        name: displayName,
        file_url: filePath,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        uploaded_by: user.id,
        user_id: selectedUserId,
        description: '',
      })

      if (dbError) throw dbError

      // Reset states
      setSelectedFile(null)
      setSelectedUserId("")
      setDisplayName("")
      setShowUploadDialog(false)

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

  const handleDelete = async (fileId: string, fileUrl: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק דו"ח זה?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([fileUrl])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      await fetchFiles()
    } catch (err) {
      setError('שגיאה במחיקת הדו"ח')
      console.error(err)
    }
  }

  const handleView = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .createSignedUrl(fileUrl, 20)

      if (error || !data) throw error

      window.open(data.signedUrl, '_blank')
    } catch (err) {
      setError('שגיאה בפתיחת הדו"ח')
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

      {user?.isAdmin && (
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
              'העלאת דו&quotח'
            )}
          </Button>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploadLoading}
          />
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרטי הדו&quotח</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שם</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='שם הדו"ח'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">משתמש</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר משתמש" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadDialog(false)
                setSelectedFile(null)
                setSelectedUserId("")
                setDisplayName("")
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedUserId || !displayName || uploadLoading}
            >
              {uploadLoading ? 'מעלה...' : 'העלה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>דו&quotחות</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">דו&quotח</TableHead>
                  <TableHead className="text-right">שייך למשתמש</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
                  <TableHead className="text-right">גודל</TableHead>
                  <TableHead className="text-right">הועלה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
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
                    <TableCell>{file.profiles.name}</TableCell>
                    <TableCell>{file.file_type}</TableCell>
                    <TableCell>{(file.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.created_at).toLocaleDateString('he-IL')}</TableCell>
                    <TableCell>
                      {user?.isAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(file.file_url)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>צפה</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(file.file_url, file.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>הורד</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFile(null) // TODO: Implement edit functionality
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>ערוך</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(file.id, file.file_url)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>מחק</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(file.file_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {files.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      לא נמצאו דו&quotחות
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