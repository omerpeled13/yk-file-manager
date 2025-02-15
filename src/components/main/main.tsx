"use client"

import { useState, useCallback, useEffect } from "react"
import { FileManager } from "./file-manager/FileManager"
import { UserManagement } from "./user-management/UserManagement"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { isAdmin } from "@/src/supabase/auth-helper"

export function Main() {
  const [isAdminUser, setIsAdminUser] = useState(false)

  const checkAdminStatus = useCallback(async () => {
    const adminStatus = await isAdmin()
    setIsAdminUser(adminStatus)
  }, [])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  return (
    <div className="container py-6 max-w-6xl mx-auto px-4 h-full ">
      <Tabs defaultValue="files" dir="rtl">
        {isAdminUser && <TabsList>
          <TabsTrigger value="files">דו"חות</TabsTrigger>
          <TabsTrigger value="users">משתמשים</TabsTrigger>
        </TabsList>
        }
        <TabsContent value="files">
          <FileManager />
        </TabsContent>
        {isAdminUser && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
