"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Radio, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await login(formData);
      if (res && !res.success) {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sign in to TaskDeck
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Newsroom Terminal & Telecast Access
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Newsroom Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="reporter@newshour.internal"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 mt-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-500">
          New correspondent or desk lead?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register station credentials
          </Link>
        </p>
      </div>
    </div>
  );
}