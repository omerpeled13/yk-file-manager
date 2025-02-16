"use client"
import { useEffect, useState } from "react"
import supabase from "@/src/lib/supabaseClientComponentClient"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card"
import { useAuth } from "@/src/hooks/useAuth"

export default function AccountForm() {
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const router = useRouter()
  const { user, loading: user_loading } = useAuth();

  useEffect(() => {
    setLoading(user_loading)
    setName(user?.name!)
  }
    , [user,user_loading])
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  async function updateProfile(name: string | null) {
    try {
      setLoading(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (error) throw error
      alert("הפרופיל עודכן בהצלחה")
    } catch (error) {
      alert("אירעה שגיאה בעדכון הנתונים")
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
          <Input id="name" type="text" value={name || ""} onChange={(e) => setName(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={() => updateProfile(name)} disabled={loading}>
          {loading ? "טוען..." : "עדכן"}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          התנתק
        </Button>
      </CardFooter>
    </Card>
  )
}

