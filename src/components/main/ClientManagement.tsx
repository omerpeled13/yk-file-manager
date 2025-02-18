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

type Client = Database['public']['Tables']['clients']['Row']

export function ClientManagment() {
    const [clients, setClients] = useState<Client[]>([])
    const [newClientName, setNewClientName] = useState("")
    const [addingClient, setAddingClient] = useState(false)
    const [loadingClients, setLoadingClients] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showAddClientDialog, setShowAddClientDialog] = useState(false)


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

    const handleAddClient = async () => {
        if (!newClientName) return
        try {
            setAddingClient(true)
            setError(null)

            const formData = new FormData();
            formData.append("name", newClientName);


            const response = await fetch('/api/clients', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add client')
            }
        } catch (err) {
            setError('שגיאה בהוספת הלקוח')
        } finally {
            setAddingClient(false)
            setNewClientName("")
            setShowAddClientDialog(false)
            await fetchClients()
        }

    }

    const handleDeleteClient = async (clientId: string) => {
        if (!window.confirm('מחיקת הלקוח תביא גם למחיקת כל הדו"חות שלו. האם אתה בטוח?')) return;

        try {
            setError(null)

            const response = await fetch('/api/clients', {
                method: 'DELETE',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId }),
            })

            if (!response.ok) {
                throw new Error('Failed to delete client')
            }
        } catch (err) {
            setError('Failed to delete client')
            console.error(err)
        } finally {
            await fetchClients()
        }
    }

    if (user?.role !== "admin") {
        return <div>מאמת גישת מנהל</div>
    }

    return (
        <div className="space-y-4 max-w-6xl max-h-[70vh] mx-auto px-4 py-8 z-0" >

            <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog} >
                <DialogContent >
                    <DialogHeader>
                        <DialogTitle>
                            הוספת לקוח
                        </DialogTitle>
                        <DialogDescription>
                            הזן את פרטי הלקוח
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">שם</label>
                            <Input
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                placeholder='שם'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddClientDialog(false)
                                setNewClientName("")
                            }}
                        >
                            ביטול
                        </Button>
                        <Button
                            onClick={handleAddClient}
                            disabled={!newClientName || addingClient}
                        >
                            {addingClient ? 'מוסיף...' : 'הוסף'}
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
                        <div className="flex justify-between items-center"><div>לקוחות</div>
                            {(user?.role === 'admin') && (
                                <div>
                                    <Button
                                        onClick={() => setShowAddClientDialog(true)}
                                        disabled={addingClient || loadingClients || user_loading}
                                    >
                                        {addingClient ? (
                                            <>
                                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                                מוסיף...
                                            </>
                                        ) : (
                                            'הוספת לקוח חדש'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[50vh] flex flex-col">
                    {loadingClients ? (
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
                                            <TableHead className="text-right">שם</TableHead>
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
                                        {clients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell>{client.name}</TableCell>
                                                <TableCell>
                                                    {new Date(client.created_at).toLocaleDateString('he-IL')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClient(client.id)}
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
        </div >
    )
} 