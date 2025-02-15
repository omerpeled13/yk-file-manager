"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user || !data.session) {
      setError("Login failed");
      return;
    }

    router.refresh();
  };

  return (
    <section className="bg-blue-gray-50">
      <div className="w-[30rem] flex flex-col items-center justify-center px-6 py-8 mx-auto">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl mb-6">
          Sign In
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
            />
          </div>
          
          <div className="mb-6">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
