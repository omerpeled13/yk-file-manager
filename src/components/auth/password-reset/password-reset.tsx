"use client";

import supabase from "@/src/supabase/supabase-client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const PasswordResetForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const resetPassword = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.log(error.message);
      alert(error.message);
    } else {
      alert("Password reset successfully");
      router.replace("/");
    }
  };

  return (
    <section className="bg-blue-gray-50">
      <div className="w-[30rem] flex flex-col items-center justify-center px-6 py-8 mx-auto">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          YK-INTELLIGENCE
        </h1>
        <br />
        <div className="w-full bg-white rounded-lg shadow p-10">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl">
            איפוס סיסמא
          </h2>
          <p>נשלח לך מייל עם קישור לאיפוס סיסמא</p>
          <br />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              סיסמא חדשה
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="********"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <br />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              אשר סיסמא
            </label>
            <input
              type="password"
              name="password"
              id="confirm_password"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="********"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>
          <br />
        </div>
        <br />
        <button
          onClick={() => resetPassword()}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          אפס סיסמא
        </button>
      </div>
    </section>
  );
};
