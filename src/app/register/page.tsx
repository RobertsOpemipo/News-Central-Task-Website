"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { Radio, Lock, Mail, User, Loader2, ArrowRight, Shield } from "lucide-react";

export default function RegisterPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await register(formData);
      if (res && !res.success) {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Station Credential Registration
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Provision New Editorial Staff Identity
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="maya.lin@newshour.internal"
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
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Role
                </label>
                <select
                  name="role"
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="MEMBER">Staff Correspondent</option>
                  <option value="UNIT_LEAD">Desk Lead / Editor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Access Level
                </label>
                <div className="h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center px-3 gap-1.5 text-xs text-slate-500 font-mono">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Standard</span>
                </div>
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
                  <span>Create Newsroom Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}