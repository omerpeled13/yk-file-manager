"use client"

import { useState, useEffect } from "react"
import PDFViewer from "./PDFViewer"
import { Button } from "@/src/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import { FileIcon, Loader2, Eye, Download, Trash2, Pencil, MoreHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"

import { Database } from "@/src/types/supabase"
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
  DialogDescription,
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
  uploaded_by: { name: string }
  user: { name: string, id: string }
}

type Profile = Database['public']['Tables']['profiles']['Row']


export function FileManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showFileDialog, setShowFileDialog] = useState<'edit' | 'upload' | ''>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileId, setSelectedFileId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [selectedDescription, setSelectedDescription] = useState("")
  const [signedUrl, setSignedUrl] = useState("")
  const [signedFileName, setSignedFileName] = useState("")

  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { user, loading: user_loading } = useAuth()

  const [files, setFiles] = useState<FileRecord[]>([]);

  const fetchFiles = async () => {
    if (user_loading) return;
    setIsLoading(true);
    const res = await fetch("/api/files");
    const data = await res.json();
    if (!data.error) setFiles(data.files);
    else setError(data.error)
    setIsLoading(false);
  };

  useEffect(() => {//fetch files
    fetchFiles();
  }, [user_loading]);

  useEffect(() => {//fetch profiles
    if (!user?.isAdmin) return
    const fetchProfiles = async () => {
      setIsLoading(true);
      const res = await fetch("/api/profiles");
      const data = await res.json();

      if (!data.error) setProfiles(data.profiles);
      else setError(data.error)
      setIsLoading(false);
    };

    fetchProfiles();
  }, [user?.isAdmin]);



  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if the selected file is a PDF
    if (file.type !== 'application/pdf') {
      alert('המערכת תומכת בקבצי PDF בלבד');
      return;
    }



    setSelectedFile(file)
    setSelectedName(file.name)
    setShowFileDialog('upload')
  }

  const handleUpload = async () => {

    if (!selectedFile || !selectedUserId || !selectedName) return
    setUpdating(true)
    setError(null)

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", selectedUserId);
      formData.append("displayName", selectedName);
      formData.append("description", selectedDescription);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      }


    } catch (err) {
      console.error('Upload error:', err)
      setError('שגיאה בהעלאת הדו"ח')
    } finally {
      // TODO: Refresh the file list
      setUpdating(false)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      setSelectedFile(null)
      setSelectedUserId("")
      setSelectedName("")
      setSelectedDescription("")
      setShowFileDialog('')
      await fetchFiles();
      console.log("Frfsdfhsdfhsdg")

    }
  };

  const handleDelete = async (fileId: string, fileUrl: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק דו"ח זה?')) return
    console.log(fileId)
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, fileId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error)
    }
    await fetchFiles();
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const res = await fetch(`/api/files/download?fileUrl=${encodeURIComponent(fileUrl)}`);
      if (!res.ok)
        throw new Error("שגיאה ביצירת url להורדה")
      // Convert response to a blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)

    } catch (err) {
      setError('שגיאה בהורדת הדו"ח')
    }
  }

  const handleView = async (fileUrl: string, fileName: string) => {
    try {
      const res = await fetch(`/api/files/view?fileUrl=${encodeURIComponent(fileUrl)}`);
      if (!res.ok)
        throw new Error("שגיאה ביצירת url לצפייה")

      const data = await res.json();
      if (!data) throw error

      setSignedUrl(data.url)
      setSignedFileName(fileName);
      setIsPdfViewerOpen(true);
    } catch (err) {
      setError('שגיאה בפתיחת הדו"ח')
      console.error(err)
    }
  }

  const handleEdit = async () => {
    if (!selectedFileId || !selectedUserId || !selectedName) return

    setUpdating(true)
    setError(null)

    try {
      const res = await fetch("/api/files", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedFileId,
          name: selectedName,
          description: selectedDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        // Optionally, you can refresh the file list or update the UI accordingly
        console.log("File updated successfully");
      }
    }
    catch (err) {
      console.error('Editing error:', err)
      setError('שגיאה בעריכת הדו"ח')
    } finally {
      setUpdating(false)
      setSelectedName("")
      setSelectedUserId("")
      setSelectedDescription("")
      setSelectedFileId("")
      setShowFileDialog('')
      await fetchFiles();
    }
  }

  const showEditDialog = async (fileName: string, fileId: string, fileDescription: string, fileUserId: string) => {
    setOpenDropdownId(null); // Ensure only the active dropdown closes
    setSelectedName(fileName)
    setSelectedUserId(fileUserId)
    setSelectedDescription(fileDescription)
    setSelectedFileId(fileId)
    setShowFileDialog('edit')
  }

  return (
    <div className="max-w-6xl max-h-[70vh] mx-auto px-4 py-8 z-0">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <Dialog open={!!showFileDialog} onOpenChange={(open: boolean) => {
        if (!open) {
          setShowFileDialog('')
        }
      }} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showFileDialog === 'edit' ? 'עריכת דו"ח' : 'דו"ח חדש'}
            </DialogTitle>
            <DialogDescription>
              {'פרטי הדו"ח'}
            </DialogDescription>

          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שם</label>
              <Input
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                placeholder='שם הדו"ח'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">תיאור</label>
              <Input
                value={selectedDescription}
                onChange={(e) => setSelectedDescription(e.target.value)}
                placeholder='תיאור'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">משתמש</label>
              <Select disabled={showFileDialog === 'edit'} value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר משתמש" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.email})
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
                setShowFileDialog('')
                setSelectedFile(null)
                setSelectedFileId('')
                setSelectedUserId("")
                setSelectedDescription("")
                setSelectedName("")
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                if (showFileDialog === 'edit') handleEdit()
                else if (showFileDialog === 'upload') handleUpload()
              }}
              disabled={!selectedUserId || !selectedName || updating}
            >
              {showFileDialog === 'edit' ?
                (updating ? 'עורך...' : 'ערוך')
                : (showFileDialog === 'upload' ?
                  (updating ? 'מעלה...' : 'העלה')
                  : '')}

            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center"><div>{'דו"חות'}</div>
              {user?.isAdmin && (
                <div>
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={updating || isLoading || user_loading}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        מעלה...
                      </>
                    ) : (
                      'העלה דו"ח חדש'
                    )}
                  </Button>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={updating}
                  />
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] flex flex-col">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col flex-grow">
              {/* Table Header - Fixed */}
              <div className="overflow-hidden">
                <Table className="table-fixed w-full">
                  <TableHeader className="bg-white sticky top-0 shadow-md z-10">
                    <TableRow>
                      <TableHead className="text-right">{'דו"ח'}</TableHead>
                      {user?.isAdmin && <TableHead className="text-right">שייך למשתמש</TableHead>}
                      <TableHead className="text-right">תיאור</TableHead>
                      <TableHead className="text-right">גודל</TableHead>
                      <TableHead className="text-right">הועלה</TableHead>
                      <TableHead className="text-right">{user?.isAdmin ? 'פעולות' : 'צפייה'}</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Table Body - Scrollable */}
              <div className="overflow-y-auto flex-grow max-h-[50vh] scrollbar-thin">
                <Table className="table-fixed w-full border-collapse">
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileIcon className="ml-2 h-4 w-4" />
                            {file.name}
                          </div>
                        </TableCell>
                        {user?.isAdmin && <TableCell>{file.user?.name}</TableCell>}
                        <TableCell className="relative group">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[300px] truncate">{file.description}</div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{file.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>{(file.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                        <TableCell>{new Date(file.created_at).toLocaleDateString('he-IL')}</TableCell>
                        <TableCell>
                          {user?.isAdmin ? (
                            <DropdownMenu
                              open={openDropdownId === file.id}
                              onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? file.id : null)}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(file.file_url, file.name)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>צפה</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(file.file_url, file.name)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>הורד</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setOpenDropdownId(null);
                                  setTimeout(() => showEditDialog(file.name, file.id, file.description, file.user.id), 50);
                                }}>
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
                              onClick={() => handleView(file.file_url, file.name)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {files.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {' לא נמצאו דו"חות'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>

      </Card>
      <PDFViewer fileName={signedFileName} pdfUrl={signedUrl} open={isPdfViewerOpen} onOpenChange={setIsPdfViewerOpen} trigger={<></>} />
    </div>
  )
} 