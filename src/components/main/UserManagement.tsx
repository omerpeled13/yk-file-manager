"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import { Loader2 } from "lucide-react"
import { Database } from "@/src/types/supabase"
import { useAuth } from "@/src/hooks/useAuth"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/src/components/ui/dialog"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

type Profile = Database['public']['Tables']['profiles']['Row']
type Client = Database['public']['Tables']['clients']['Row']

export function UserManagement() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserName, setNewUserName] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [newUserClientId, setNewUserClientId] = useState("")
    const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'client_admin'>('user')
    const [addingUser, setAddingUser] = useState(false)
    const [loadingProfiles, setLoadingProfiles] = useState(true)
    const [loadingClients, setLoadingClients] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showAddUserDialog, setShowAddUserDialog] = useState(false)


    const { user, loading: user_loading } = useAuth()

    const fetchClients = async () => {
        setLoadingClients(true);
        const res = await fetch("/api/clients");
        const data = await res.json();
        if (!data.error) setClients(data.clients);
        else setError(data.error)
        setLoadingClients(false);
    };
    useEffect(() => {//fetch clients
        fetchClients();
    }, []);

    const fetchProfiles = async () => {
        setLoadingProfiles(true);
        const res = await fetch("/api/profiles");
        const data = await res.json();
        if (!data.error) setProfiles(data.profiles);
        else setError(data.error)
        setLoadingProfiles(false);
    };
    useEffect(() => {//fetch profiles
        fetchProfiles();
    }, []);

    const handleAddUser = async () => {
        if (!newUserEmail || !newUserName || !newUserRole || !newUserClientId || !newUserPassword) return
        try {
            setAddingUser(true)
            setError(null)

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newUserEmail, name: newUserName, role: newUserRole, client_id: newUserClientId, password: newUserPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add user')
            }

        } catch (err) {
            setError('שגיאה בהוספת המשתמש')
            console.error('add user error:', err)
        } finally {
            setAddingUser(false)
            setNewUserEmail("")
            setNewUserClientId("")
            setNewUserPassword("")
            setNewUserName("")
            setNewUserRole("user")
            setShowAddUserDialog(false)
            await fetchProfiles()
        }

    }

    const handleDeleteUser = async (userId: string) => {
        try {
            setError(null)

            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }
        } catch (err) {
            setError('Failed to delete user')
            console.error(err)
        } finally {
            await fetchProfiles()
        }
    }

    if (user?.role !== "admin" && user?.role !== "client_admin") {
        return <div>מאמת גישת מנהל</div>
    }

    return (
        <div className="space-y-4 max-w-6xl max-h-[70vh] mx-auto px-4 py-8 z-0" >

            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog} >
                <DialogContent >
                    <DialogHeader>
                        <DialogTitle>
                            הוספת משתמש
                        </DialogTitle>
                        <DialogDescription>
                            הזן את פרטי המשתמש
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">אימייל</label>
                            <Input
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder='אימייל'
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">שם</label>
                            <Input
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder='שם'
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">סוג משתמש</label>
                            <Select value={newUserRole} onValueChange={(newRole: 'user' | 'admin' | 'client_admin') => { if (newRole === 'admin') { setNewUserClientId('') }; setNewUserRole(newRole) }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר תפקיד" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">משתמש</SelectItem>
                                    <SelectItem value="client_admin">מנהל לקוח</SelectItem>
                                    <SelectItem value="admin">מנהל</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {
                            user?.role === "admin" &&
                            <div className="space-y-2">
                                <label className="text-sm font-medium">לקוח</label>
                                <Select disabled={newUserRole==='admin'} value={newUserClientId} onValueChange={setNewUserClientId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="בחר לקוח" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        }
                        <div className="space-y-2">
                            <label className="text-sm font-medium">סיסמא</label>
                            <Input
                                type="password"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                placeholder='שם'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddUserDialog(false)
                                setNewUserClientId("")
                                setNewUserEmail("")
                                setNewUserName("")
                                setNewUserPassword("")
                                setNewUserRole("user")
                            }}
                        >
                            ביטול
                        </Button>
                        <Button
                            onClick={handleAddUser}
                            disabled={!newUserClientId || !newUserEmail || !newUserName || !newUserPassword || !newUserRole || addingUser}
                        >
                            {addingUser ? 'מוסיף...' : 'הוסף'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {
                error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md">
                        {error}
                    </div>
                )
            }

            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-between items-center"><div>משתמשים</div>
                            {user?.role === 'admin' && (
                                <div>
                                    <Button
                                        onClick={() => setShowAddUserDialog(true)}
                                        disabled={addingUser || loadingClients || loadingProfiles || user_loading}
                                    >
                                        {addingUser ? (
                                            <>
                                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                                מוסיף...
                                            </>
                                        ) : (
                                            'הוספת משתמש חדש'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[50vh] flex flex-col">
                    {loadingProfiles ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="flex flex-col flex-grow">
                            {/* Table Header - Fixed */}
                            <div className="overflow-hidden">
                                <Table className="table-fixed w-full">
                                    <TableHeader className="sticky top-0 shadow-md z-10">
                                        <TableRow>
                                            <TableHead className="text-right">אימייל</TableHead>
                                            <TableHead className="text-right">שם</TableHead>
                                            {user?.role === "admin" && <TableHead className="text-right">לקוח</TableHead>}
                                            <TableHead className="text-right">תפקיד</TableHead>
                                            <TableHead className="text-right">נוצר</TableHead>
                                            {user?.role === "admin" &&<TableHead className="text-right">פעולות</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                            </div>

                            {/* Table Body - Scrollable */}
                            <div className="overflow-y-auto flex-grow max-h-[40vh] scrollbar-thin">
                                <Table className="table-fixed w-full border-collapse">
                                    <TableBody>
                                        {profiles.map((profile) => (
                                            <TableRow key={profile.id}>
                                                <TableCell>{profile.email}</TableCell>
                                                <TableCell>{profile.name}</TableCell>
                                                {user?.role === "admin" && <TableCell>{profile.client?.name}</TableCell>}
                                                <TableCell>{profile.role === 'admin' ? "מנהל" : (profile.role === 'client_admin' ? "מנהל לקוח" : (profile.role==='user' ? "משתמש" : "שגיאה בזיהו תפקיד"))}</TableCell>
                                                <TableCell>
                                                    {new Date(profile.created_at).toLocaleDateString('he-IL')}
                                                </TableCell>
                                                {user?.role === "admin" && <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(profile.id)}
                                                    >
                                                        מחק
                                                    </Button>
                                                </TableCell>}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>

            </Card>
        </div >
    )
} 
