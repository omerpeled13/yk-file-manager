"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Image from 'next/image';
import YKLogo from '@/public/yk-logo.png';
import YKLogoDark from '@/public/yk-logo-dark.png'
import SupabaseLogo from '@/public/supabase-logo.png';
import SupabaseLogoDark from '@/public/supabase-logo-dark.png';
import Link from "next/link";
import { useTheme } from 'next-themes';
import { useAuth } from "@/src/hooks/useAuth";


const AuthForm = () => {
  const { theme } = useTheme();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendingToken, setSendingToken] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const { user, loading: user_loading } = useAuth();


  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer); // Clean up timer
    }
  }, [cooldown]);

  const router = useRouter();

  const sendCode = async () => {
    if (cooldown > 0) return;
    setCooldown(60);
    setSendingToken(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", user?.email!);


      const res = await fetch('/api/auth/login/otp/send', {
        method: 'POST',
        body: formData
      });

    }
    catch (error) {
      setError('שגיאה בלתי צפויה בשליחת קוד');
    }
    finally {
      setSendingToken(false);
    }
  }

  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth/login/otp/verify', {
        method: 'POST',
        body: new URLSearchParams({
          token,
          email: user?.email!,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (res.ok) {



        const res = await fetch(`/api/users/${user?.id}/otpVerify`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verified: true
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
        }

        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'התחברות נכשלה');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('שגיאה בהתחברות:', error);
      setError('שגיאה בלתי צפויה בהתחברות');
      setIsLoading(false);
      return;
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isLoading) return
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };
  if (!theme) return

  return (
    <div className="w-full h-full">
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="w-[30rem] flex flex-col items-center justify-center px-6 py-8 mx-auto">
          <div className="mb-6 w-full">

            <Image
              src={theme === 'dark' ? YKLogoDark : YKLogo} alt="YK-Intelligence" layout="intrinsic" width={1366} height={406} className="w-full" />

          </div>

          <h1 className="text-xl font-bold text-secondary-foreground md:text-2xl mb-6">
            {'הזן קוד אימות שנשלח למייל'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 w-full">
              {error}
            </div>
          )}

          <div className="w-full">

            <div className="mb-6 flex">
              <Input
                type="text"
                placeholder="קוד בעל 6 ספרות"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                variant={"link"}
                disabled={isLoading || sendingToken || user_loading || cooldown > 0}
                onClick={sendCode}
              >
                {sendingToken ? "שולח..." : "שלח שוב" + (cooldown > 0 ? ` (${cooldown})` : "")}
              </Button>

            </div>


            <Button
              className="w-full my-1"
              disabled={isLoading}
              onClick={handleSignIn}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>

          </div>
        </div>
      </section>
      {/* Security Powered By - Floating Bottom Left */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-gray-500 text-sm">
        <Link href="https://supabase.com/" target="_blank" rel="noopener noreferrer">
          <Image src={theme === 'dark' ? SupabaseLogoDark : SupabaseLogo} alt="Supabase" width={100} height={30} className="w-auto h-6 cursor-pointer" />
        </Link>
        <span className="font-bold pr-2 text-secondary-foreground">Security Powered By</span>
      </div>
    </div>

  );
};

export default AuthForm;
