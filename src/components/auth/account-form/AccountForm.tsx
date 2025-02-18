"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card"
import { useAuth } from "@/src/hooks/useAuth"

export default function AccountForm() {
  const [loading, setLoading] = useState(true)
  const [selectedName, setSelectedName] = useState("")
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter()
  const { user, loading: user_loading } = useAuth();

  useEffect(() => {
    setLoading(user_loading)
    setSelectedName(user?.name!)
  }
    , [user, user_loading])
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.log(err);
    } finally {
      router.refresh()
    }
  };

  async function updateProfile() {
    if (!selectedName || !user?.id) return
    setLoading(true)
    setError("")

    let profileUpdates:any = {name:selectedName}
    let authUpdates:any = {}
    if (newPassword){
      authUpdates.password = newPassword
    }
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: {profileUpdates,authUpdates}
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        alert("הפרטים שונו בהצלחה")
        console.log("User updated successfully");
      }
    }
    catch (err) {
      console.error('Editing error:', err)
      setError('שגיאה בעדכון המשתמש')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>עריכת פרופיל</CardTitle>
        <CardDescription>עדכן את פרטי החשבון שלך</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" type="text" value={user?.email || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">שם מלא</Label>
          <Input id="name" type="text" value={selectedName || ""} onChange={(e) => setSelectedName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">סיסמה חדשה</Label>
          <Input 
            id="password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={() => updateProfile()} disabled={loading || !selectedName || selectedName.length < 4}>
          {loading ? "טוען..." : "עדכן"}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          התנתק
        </Button>
      </CardFooter>
    </Card>
  )
}

