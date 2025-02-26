"use client"

import { Button } from "@/src/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/src/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { ModeToggle } from "./ui/theme-provider"
import Link from 'next/link'
import { ChevronDownIcon, LogOutIcon } from "@/src/components/ui/icons"
import { useAuth } from "../hooks/useAuth"
import Image from 'next/image'
import YKLogo from '@/public/yk-logo.png'
import YKLogoDark from '@/public/yk-logo-dark.png'
import { useTheme } from 'next-themes';

export default function Header() {
    const { theme } = useTheme();
    const router = useRouter()

    const { user, loading: user_loading } = useAuth();

    const handleSignOut = async () => {
        try {
            //set otp verified to false
            const res = await fetch(`/api/users/${user?.id}/otpVerify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    verified: false
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update OTP verification status');
            }

            //sign out
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
                    {theme === 'dark' ? (
                        <Image
                            src={YKLogoDark} // Path to image in the public folder
                            alt="YK Logo"
                            width={200} // Adjust width to fit the header
                            height={60} // Adjust height to fit the header
                            className="object-contain"
                        />
                    ) : (
                        <Image
                            src={YKLogo} // Path to image in the public folder
                            alt="YK Logo"
                            width={200} // Adjust width to fit the header
                            height={60} // Adjust height to fit the header
                            className="object-contain"
                        />
                    )}

                    {/* Text Below the Logo */}
                    <div>
                        <h1 className="text-sm text-secondary-foreground mb-[10px]">{'מערכת לניהול דו"חות'}</h1>
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
                                <ChevronDownIcon className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <div dir="rtl">
                                <DropdownMenuItem>
                                    <Link href="/account" className="w-full">
                                        <div className="text-sm text-muted-foreground">ערוך פרופיל</div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <div className="flex items-center">
                                        <LogOutIcon className="w-4 h-4 ml-2" />
                                        התנתק
                                    </div>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
