"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid official or institutional email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email, password, remember_me: rememberMe });
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setErrorMsg(result.error || "Authentication failed. Please verify credentials.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md mx-auto"
    >
      {/* Glassmorphic Card Container */}
      <div className="relative rounded-3xl bg-brand-card/80 backdrop-blur-xl border border-brand-border hover:border-brand-gold/40 shadow-2xl p-8 sm:p-10 space-y-6 transition-all duration-300">
        
        {/* Subtle Ambient Card Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:border-brand-gold transition-colors shadow-goldGlow">
              <Database className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="flex items-center gap-1.5 text-left">
              <span className="font-bold text-lg tracking-wider text-brand-text">NIRIKSHAN</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30">
                AI
              </span>
            </div>
          </Link>
          
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            Enter your credentials to access the Public Finance Intelligence Platform.
          </p>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3.5 rounded-xl bg-brand-critical/10 border border-brand-critical/30 text-xs text-brand-critical flex items-start gap-2.5 leading-relaxed"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-brand-muted uppercase">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auditor@nirikshan.gov.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface/90 border border-brand-border text-brand-text placeholder-brand-muted/50 text-xs focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-mono text-brand-muted uppercase">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset workflow is handled through your institutional nodal coordinator.")}
                className="text-[11px] text-brand-gold hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-surface/90 border border-brand-border text-brand-text placeholder-brand-muted/50 text-xs focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/40 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-brand-muted select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-brand-surface border-brand-border text-brand-gold focus:ring-brand-gold h-3.5 w-3.5"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-brand-muted/70 font-mono">
              MoSPI Audit Tier
            </span>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-goldGlow flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-bg" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Intelligence Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Link to Register */}
        <div className="pt-4 border-t border-brand-border/60 text-center text-xs text-brand-muted">
          <span>Need institutional clearance? </span>
          <Link
            href="/register"
            className="text-brand-gold hover:text-brand-goldLight font-semibold underline underline-offset-4 transition-colors"
          >
            Request Access / Register
          </Link>
        </div>

        {/* Security Badge */}
        <div className="p-3 rounded-xl bg-brand-surface/60 border border-brand-border/60 text-[11px] text-brand-muted flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0" />
          <span>Encrypted Session • HTTP-Only Cookie Standard</span>
        </div>

      </div>
    </motion.div>
  );
}

