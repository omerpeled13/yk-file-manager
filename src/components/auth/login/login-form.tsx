"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Image from 'next/image';
import YKLogo from '@/public/yk-logo.png';
import SupabaseLogo from '@/public/supabase-logo.png';
import Link from "next/link";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: new URLSearchParams({ email, password }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.ok) {
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
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isLoading && event.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className="w-full h-full">
      <section className="bg-blue-gray-50 min-h-screen flex items-center justify-center relative">
        <div className="w-[30rem] flex flex-col items-center justify-center px-6 py-8 mx-auto">
          <div className="mb-6 w-full">
            <Image src={YKLogo} alt="YK-Intelligence" layout="intrinsic" width={1366} height={406} className="w-full" />
          </div>

          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl mb-6">
            {'מערכת לניהול דו"חות'}
          </h1>

          {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 w-full">{error}</div>}

          <div className="w-full">
            <div className="mb-4">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
            </div>

            <div className="mb-6">
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
            </div>

            <Button className="w-full" disabled={isLoading} onClick={handleSignIn}>
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </div>
        </div>
      </section>

      {/* Security Powered By - Floating Bottom Left */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-gray-500 text-sm">
        <Link href="https://supabase.com/" target="_blank" rel="noopener noreferrer">
          <Image src={SupabaseLogo} alt="Supabase" width={100} height={30} className="w-auto h-6 cursor-pointer" />
        </Link>
        <span className="font-bold pr-2">Security Powered By</span>
      </div>
    </div>
  );
};

export default LoginForm;
