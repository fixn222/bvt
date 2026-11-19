"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
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
        setErrorMessage(data.error || "Login failed. Please check credentials.");
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
    <div className="min-h-screen bg-party-dark flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-party-neonPurple/20 blur-[120px] pointer-events-none rounded-full" />

      <Card className="w-full max-w-md p-8 sm:p-10 border-party-border/80 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-party-neonPink via-purple-600 to-party-neonCyan p-0.5 shadow-glow-pink mx-auto mb-4">
            <div className="w-full h-full bg-party-dark rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-party-neonPink" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Organizer Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to manage the event, voting state, and passes
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
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
                className="pl-10"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
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
                className="pl-10 pr-10"
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
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-2 py-3.5 shadow-glow"
          >
            Authenticate & Enter
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-party-border/60 text-center">
          <p className="text-xs text-gray-500">
            Authorized production personnel only. All access is audited.
          </p>
        </div>
      </Card>
    </div>
  );
}
