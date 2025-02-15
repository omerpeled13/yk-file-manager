"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table"
import { Loader2 } from "lucide-react"
import supabase from "@/src/supabase/supabase-client"
import { isAdmin } from "@/src/supabase/auth-helper"
import { Database } from "@/src/types/supabase"

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserManagement() {
    const [users, setUsers] = useState<Profile[]>([])
    const [newUserEmail, setNewUserEmail] = useState("")
    const [invitingUser, setInvitingUser] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAdminUser, setIsAdminUser] = useState(false)

    const fetchProfiles = useCallback(async () => {
        try {
            setIsLoading(true)
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
            setIsLoading(false)
        }
    }, [])

    const checkAdminStatus = useCallback(async () => {
        const adminStatus = await isAdmin()
        setIsAdminUser(adminStatus)
    }, [])

    useEffect(() => {
        const init = async () => {
            await checkAdminStatus()
            if (isAdminUser) {
                await fetchProfiles()
            }
        }
        init()
    }, [checkAdminStatus, fetchProfiles, isAdminUser])

    const handleInviteUser = async () => {
        try {
            setInvitingUser(true)
            setError(null)

            const response = await fetch('/api/users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newUserEmail }),
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

    if (!isAdminUser) {
        return <div>Access denied</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    type="email"
                    placeholder="אימייל משתמש חדש"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    disabled={invitingUser}
                />
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
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>אימייל</TableHead>
                                    <TableHead>תפקיד</TableHead>
                                    <TableHead>נוצר</TableHead>
                                    <TableHead>פעולות</TableHead>
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