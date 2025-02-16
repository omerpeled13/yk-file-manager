"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import { Loader2 } from "lucide-react"
import supabase from "@/src/lib/supabaseClientComponentClient"
import { isAdmin } from "@/src/lib/auth-helper"
import { Database } from "@/src/types/supabase"
import { Label } from "@radix-ui/react-dropdown-menu"
import { useAuth } from "@/src/hooks/useAuth"

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([])
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserName, setNewUserName] = useState("")
    const [invitingUser, setInvitingUser] = useState(false)
    const [loadingProfiles, setLoadingProfiles] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { user, loading: user_loading } = useAuth()

    const fetchProfiles = useCallback(async () => {
        try {
            setLoadingProfiles(true)
            setError(null)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            console.log('Profiles fetch response:', { data, error }) // Debug log

            if (error) {
                console.error('Profiles fetch error:', error)
                throw error
            }

            if (!data || data.length === 0) {
                console.log('No profiles found or access denied')
            }

            setUsers(data || [])
        } catch (err) {
            setError('שגיאה בטעינת משתמשים')
            console.error('Error fetching profiles:', err)
        } finally {
            setLoadingProfiles(false)
        }
    }, [])


    useEffect(() => {
        const init = async () => {
                if (user?.isAdmin) {
                    await fetchProfiles()
                }
        }
        init()
    }, [user])

    const handleInviteUser = async () => {
        try {
            setInvitingUser(true)
            setError(null)

            const response = await fetch('/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newUserEmail, name: newUserName }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation')
            }

            setNewUserEmail("")
            fetchProfiles()
            alert('הזמנה נשלחה בהצלחה')
        } catch (err) {
            setError('שגיאה בשליחת ההזמנה')
            console.error('Invitation error:', err)
        } finally {
            setInvitingUser(false)
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

            fetchProfiles()
        } catch (err) {
            setError('Failed to delete user')
            console.error(err)
        }
    }

    if (!user?.isAdmin) {
        return <div>מאמת גישת מנהל</div>
    }

    return (
        <div className="space-y-4">
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
                <CardContent>
                    {loadingProfiles ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">אימייל</TableHead>
                                    <TableHead className="text-right">תפקיד</TableHead>
                                    <TableHead className="text-right">נוצר</TableHead>
                                    <TableHead className="text-right">פעולות</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('he-IL')}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                מחק
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 