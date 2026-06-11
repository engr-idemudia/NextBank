"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmPasswordRecovery } from "@/lib/actions/user.actions";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") || "";
  const secret = searchParams.get("secret") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!userId || !secret) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await confirmPasswordRecovery({
        userId,
        secret,
        password,
      });

      if (result?.success) {
        setDone(true);
        setTimeout(() => router.push("/sign-in"), 2500);
      } else {
        setError("Could not reset password. The link may have expired.");
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-center size-full max-sm:px-6">
      <div className="auth-form">
        <header className="flex flex-col gap-5 md:gap-8">
          <Link href="/" className="cursor-pointer flex items-center gap-1">
            <Image
              src="/icons/logo.svg"
              width={34}
              height={34}
              alt="NextBank logo"
            />
            <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
              NextBank
            </h1>
          </Link>

          <div className="flex flex-col gap-1 md:gap-3">
            <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
              Reset Password
              <p className="text-16 font-normal text-gray-600">
                Enter a new password for your account
              </p>
            </h1>
          </div>
        </header>

        {done ? (
          <div className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-3 text-14 dark:border-purple-900 dark:bg-purple-950/40">
            <p className="font-semibold text-purple-700 dark:text-purple-300">
              Password updated
            </p>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="form-item">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="input-class"
              />
            </div>

            <div className="form-item">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="input-class"
              />
            </div>

            {error && (
              <p className="text-14 font-medium text-red-500">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="form-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp;
                  Loading...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        )}

        <footer className="flex justify-center gap-1">
          <p className="text-14 font-normal text-gray-600">
            Remember your password?
          </p>
          <Link href="/sign-in" className="form-link">
            Sign in
          </Link>
        </footer>
      </div>
    </section>
  );
};

export default ResetPassword;
