"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Image from 'next/image';


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
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (res.ok) {
        router.refresh();
      } else {
        const errorMessage = await res.text();
        setError(errorMessage || 'התחברות נכשלה');
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

  return (
    <section className="bg-blue-gray-50">
      <div className="w-[30rem] flex flex-col items-center justify-center px-6 py-8 mx-auto">
        <div className="mb-6 w-full">
          <Image
            src="/yk-logo.png" // path to image in the public folder
            alt="YK Logo"
            layout="intrinsic" // Keeps the aspect ratio
            width={1366} // original width
            height={406} // original height
            className="w-full" // Ensures it fills the width of its container
          />
        </div>

        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl mb-6">
          {'מערכת הדו"חות'}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 w-full">
            {error}
          </div>
        )}

        <div className="w-full">
          <div className="mb-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mb-6">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            className="w-full"
            disabled={isLoading}
            onClick={handleSignIn}
          >
            {isLoading ? "מתחבר..." : "התחבר"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
