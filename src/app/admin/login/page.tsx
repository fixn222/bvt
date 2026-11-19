"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (res.ok) {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password!");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed. Check your password!");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login request error:", err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-party-bg bg-party-dots flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 sm:p-10 border-4 border-black bg-party-card shadow-cartoon-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-party-yellow border-3 border-black shadow-cartoon mx-auto mb-4 flex items-center justify-center rotate-[-6deg]">
            <ShieldCheck className="w-8 h-8 text-party-pink fill-party-pink" />
          </div>
          <h1 className="text-3xl font-black text-white font-cartoon uppercase tracking-tight">
            ORGANIZER BOOTH
          </h1>
          <p className="text-xs text-gray-300 font-bold mt-1">
            Sign in to start voting, end voting, and reveal the winner!
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-party-pink text-white border-2 border-black text-xs font-black flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="pl-10 bg-party-surface border-2 border-black rounded-2xl"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-party-yellow uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="pl-10 pr-10 bg-party-surface border-2 border-black rounded-2xl"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-white absolute right-3 top-2.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="yellow"
            isLoading={isLoading}
            className="w-full mt-4 py-4 text-slate-950 font-black shadow-cartoon"
          >
            Enter Control Center 🚀
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-party-border text-center">
          <p className="text-[11px] text-gray-400 font-bold">
            Authorized party hosts only. Guest votes never need a login!
          </p>
        </div>
      </Card>
    </div>
  );
}
