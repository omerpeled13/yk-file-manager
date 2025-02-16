"use client"

import { FileManager } from "./FileManager"
import { UserManagement } from "./UserManagement"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useAuth } from "@/src/hooks/useAuth"

function Main() {
  const { user, loading: user_loading } = useAuth()

  return (
    <div className="container py-6 max-w-6xl mx-auto px-4 h-full ">
      <Tabs defaultValue="files" dir="rtl">
        {user?.isAdmin && <TabsList>
          <TabsTrigger value="files">דו"חות</TabsTrigger>
          <TabsTrigger value="users">משתמשים</TabsTrigger>
        </TabsList>
        }
        <TabsContent value="files">
          <FileManager />
        </TabsContent>
        {user?.isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default Main