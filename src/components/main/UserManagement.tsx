"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import { Loader2 } from "lucide-react"
import { Database } from "@/src/types/supabase"
import { Label } from "@radix-ui/react-dropdown-menu"
import { useAuth } from "@/src/hooks/useAuth"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManagement() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserName, setNewUserName] = useState("")
    const [newUseRole, setNewUserRole] = useState<'client' | 'admin'>('client')
    const [invitingUser, setInvitingUser] = useState(false)
    const [loadingProfiles, setLoadingProfiles] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { user, loading: user_loading } = useAuth()

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

    const handleInviteUser = async () => {
        try {
            setInvitingUser(true)
            setError(null)

            const response = await fetch('/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newUserEmail, name: newUserName, role: newUseRole }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation')
            }

            setNewUserEmail("")
            //TODO: refresh profiles
            alert('הזמנה נשלחה בהצלחה')
        } catch (err) {
            setError('שגיאה בשליחת ההזמנה')
            console.error('Invitation error:', err)
        } finally {
            setInvitingUser(false)
            await fetchProfiles()
        }
    }
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('מחיקת הלקוח תביא גם למחיקת כל הדו"חות שלו. האם אתה בטוח?')) return;

        try {
            setError(null)

            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            //TODO: refresh profiles
        } catch (err) {
            setError('Failed to delete user')
            console.error(err)
        } finally {
            await fetchProfiles()
        }
    }

    if (!user?.isAdmin) {
        return <div>מאמת גישת מנהל</div>
    }

    return (
        <div className="space-y-4 max-w-6xl max-h-[70vh] mx-auto px-4 py-8 z-0">
            <div className="flex justify-center gap-8 items-center border px-10 py-2 rounded-md bg-muted">
                <div>
                    <Label className="justify-self-start">
                        הוספת משתמש חדש
                    </Label>
                </div>
                <div>
                    <Input
                        type="email"
                        placeholder="אימייל"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        disabled={invitingUser}
                    />
                </div>
                <div>
                    <Input
                        type="text"
                        placeholder="שם"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        disabled={invitingUser}
                    />
                </div>
                <div>
                    <Select value={newUseRole} onValueChange={(newRole: 'client' | 'admin') => setNewUserRole(newRole)}>
                        <SelectTrigger>
                            <SelectValue placeholder="בחר תפקיד" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="client">לקוח</SelectItem>
                            <SelectItem value="admin">מנהל</SelectItem>
                        </SelectContent>
                    </Select>

                </div>
                <div>

                    <Button onClick={handleInviteUser} disabled={invitingUser || !newUserEmail}>
                        {invitingUser ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                שולח...
                            </>
                        ) : (
                            'הזמן משתמש'
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>משתמשים</CardTitle>
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
                                    <TableHeader className="bg-white sticky top-0 shadow-md z-10">
                                        <TableRow>
                                            <TableHead className="text-right">אימייל</TableHead>
                                            <TableHead className="text-right">שם</TableHead>
                                            <TableHead className="text-right">תפקיד</TableHead>
                                            <TableHead className="text-right">נוצר</TableHead>
                                            <TableHead className="text-right">פעולות</TableHead>
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
                                                <TableCell>{profile.role === 'admin' ? "מנהל" : "לקוח"}</TableCell>
                                                <TableCell>
                                                    {new Date(profile.created_at).toLocaleDateString('he-IL')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(profile.id)}
                                                    >
                                                        מחק
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>

            </Card>
        </div>
    )
} 