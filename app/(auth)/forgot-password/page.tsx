"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendPasswordRecovery } from "@/lib/actions/auth.actions";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;

    setIsLoading(true);

    try {
      await sendPasswordRecovery({ email });
      setSent(true);
    } catch (error) {
      console.log(error);
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
              Forgot Password
              <p className="text-16 font-normal text-gray-600">
                Enter your email and we'll send you a reset link
              </p>
            </h1>
          </div>
        </header>

        {sent ? (
          <div className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-3 text-14 dark:border-purple-900 dark:bg-purple-950/40">
            <p className="font-semibold text-purple-700 dark:text-purple-300">
              Check your inbox
            </p>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              If an account exists for{" "}
              <span className="font-medium">{email}</span>, a password reset
              link has been sent.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="form-item">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-class"
              />
            </div>

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
                "Send Reset Link"
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

export default ForgotPassword;
