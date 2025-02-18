"use client"

import { FileManager } from "./FileManager"
import { UserManagement } from "./UserManagement"
import { ClientManagment } from "./ClientManagement"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useAuth } from "@/src/hooks/useAuth"

function Main() {
  const { user, loading: user_loading } = useAuth()
  return (
    <div className="container py-6 max-w-6xl mx-auto px-4 h-full ">
      <Tabs defaultValue="files" dir="rtl">
        {(user?.role === "admin" || user?.role == "client_admin") && <TabsList>
          <TabsTrigger value="files">{'דו"חות'}</TabsTrigger>
          <TabsTrigger value="users">משתמשים</TabsTrigger>
          {user?.role === "admin" && <TabsTrigger value="clients">לקוחות</TabsTrigger>}
        </TabsList>
        }
        <TabsContent value="files">
          <FileManager />
        </TabsContent>
        {(user?.role === "admin" || user?.role == "client_admin") && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
        {
          user?.role === "admin" &&
          <TabsContent value="clients">
            <ClientManagment />
          </TabsContent>
        }
      </Tabs>
    </div>
  )
}

export default Main