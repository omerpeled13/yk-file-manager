"use client";

import { ROUTES } from "@/src/constants";
import supabase from "@/src/lib/supabaseClientComponentClient";
import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";

export const PasswordRecoveryForm = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPasswordResetToEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${ROUTES.RESET_PASSWORD}`,
      });

      if (error) throw error;

      setEmailSent(true);
    } catch (err) {
      setError("שגיאה בשליחת האימייל");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>שחזור סיסמה</CardTitle>
          <CardDescription>
            {!emailSent
              ? "הזן את כתובת האימייל שלך לקבלת קישור לאיפוס הסיסמה"
              : "נשלח אליך אימייל עם הוראות לאיפוס הסיסמה"}
          </CardDescription>
        </CardHeader>
        {!emailSent ? (
          <>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                  {error}
                </div>
              )}
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={sendPasswordResetToEmail}
                disabled={loading || !email}
              >
                {loading ? "שולח..." : "שלח קישור לאיפוס"}
              </Button>
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <p className="text-center text-green-600">
              אימייל נשלח בהצלחה! אנא בדוק את תיבת הדואר שלך
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
