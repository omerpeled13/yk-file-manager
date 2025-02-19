"use client"

import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar"
import { useRouter } from "next/navigation";
import { ModeToggle } from "./ui/theme-provider"
import Link from 'next/link'
import { ChevronDownIcon, LogOutIcon } from "@/src/components/ui/icons"
import { useAuth } from "../hooks/useAuth"
import Image from 'next/image'
import YKLogo from '@/public/yk-logo.png'

export default function Header() {
    const router = useRouter()

    const { user, loading: user_loading } = useAuth();

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



    return (
        <header className="fixed top-0 left-0 right-0 bg-background border-b h-16 z-10">
            <div className="max-w-6xl mx-auto px-4 h-full flex justify-between items-center">
                <Link href="/main" className="flex items-end gap-2">
                    {/* Logo Image */}
                    <Image
                        src={YKLogo} // Path to image in the public folder
                        alt="YK Logo"
                        width={200} // Adjust width to fit the header
                        height={60} // Adjust height to fit the header
                        className="object-contain"
                    />
                    {/* Text Below the Logo */}
                    <div>
                        <h1 className="text-sm text-secondary-foreground mb-[10px]">{'ניהול דו"חות'}</h1>
                    </div>
                </Link>                <div className="flex items-center gap-4">

                    <ModeToggle />
                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>

                            <Button variant="link" className="h-8 px-0">
                                {user?.name && (
                                    <span className="text-sm text-muted-foreground">
                                        היי {user?.name}
                                    </span>
                                )}
                                <Avatar className="h-9 w-9 mx-1">
                                    <AvatarImage src="/placeholder-user.jpg" alt={user?.email} />
                                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <ChevronDownIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                                <Link href="/account" className="w-full">
                                    <div className="text-sm text-muted-foreground">{user?.email}</div>
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
