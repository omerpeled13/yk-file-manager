"use client";  // Ensure it's a client component

import { useEffect, useRef } from "react";
import { useAuth } from "@/src/hooks/useAuth";

export default function AutoLogout({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, loading: user_loading } = useAuth();
  // Function to reset the logout timer
  const resetTimer = () => {
    console.log("Resetting timer");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      console.log("User inactive, logging out...");

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

      window.location.href = "/login"; // Redirect after sign out
    }, (5*60*1000)); // Set timeout to 5 minutes
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"];

    // Attach event listeners
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      // Cleanup event listeners
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <>{children}</>;
}
