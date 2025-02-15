"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar"
import supabase from "@/src/supabase/supabase-client";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./ui/theme-provider"
import Link from 'next/link'
import { ChevronDownIcon, LogOutIcon } from "@/src/components/ui/icons"
import { getUserProfile } from "@/src/supabase/auth-helper"

export default function Header() {
    const [session, setSession] = useState<Session | null>(null)
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [userName, setUserName] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('name, email')
                .eq('id', userId)
                .single()

            if (error) throw error

            if (profile) {
                setUserName(profile.name || '')
                setUserEmail(profile.email)
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                fetchUserProfile(session.user.id)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session?.user) {
                fetchUserProfile(session.user.id)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-background border-b h-16">
            <div className="max-w-6xl mx-auto px-4 h-full flex justify-between items-center">
                <Link href="/main">
                    <h1 className="text-xl font-bold">YK-Intelligence</h1>
                    <h1 className="text-sm text-secondary-foreground">מערכת לניהול דו"חות</h1>
                </Link>
                <div className="flex items-center gap-4">

                    <ModeToggle />
                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>

                            <Button variant="link" className="h-8 px-0">
                                {session && userName && (
                                    <span className="text-sm text-muted-foreground">
                                        היי {userName}
                                    </span>
                                )}
                                <Avatar className="h-9 w-9 mx-1">
                                    <AvatarImage src="/placeholder-user.jpg" alt={userEmail} />
                                    <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <ChevronDownIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <Link href="/account" className="w-full">
                                    <div className="text-sm text-muted-foreground">{userEmail}</div>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <div className="flex items-center">
                                    <LogOutIcon className="w-4 h-4 ml-2" />
                                    התנתק
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
