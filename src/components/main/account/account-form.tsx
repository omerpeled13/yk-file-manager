"use client"
import { useCallback, useEffect, useState } from "react"
import supabase from "@/src/supabase/supabase-client"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card"

export default function AccountForm() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    async function getProfile() {
      setLoading(true)
      setUser(session?.user ? session?.user : null)
      setLoading(false)
    }
    getProfile()
  }, [session])

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      if (!user) return
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`name, image_url`)
        .eq("id", user?.id)
        .single()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setName(data.name)
        setImageUrl(data.image_url)
      }
    } catch (error) {
      alert("אירעה שגיאה בטעינת נתוני המשתמש")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  async function updateProfile(name: string | null, image_url: string | null) {
    try {
      setLoading(true)

      const { error } = await supabase
        .from("profiles")
        .update({
          name: name,
          image_url: image_url,
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
        <Button className="w-full" onClick={() => updateProfile(name, imageUrl)} disabled={loading}>
          {loading ? "טוען..." : "עדכן"}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          התנתק
        </Button>
      </CardFooter>
    </Card>
  )
}

