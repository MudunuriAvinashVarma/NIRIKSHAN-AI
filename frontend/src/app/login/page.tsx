"use client";

import { Suspense } from "react";
import AuthBackground from "@/components/auth/AuthBackground";
import LoginForm from "@/components/auth/LoginForm";
import FadeIn from "@/components/animations/FadeIn";
import { Loader2 } from "lucide-react";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto p-10 rounded-3xl bg-brand-card/80 border border-brand-border text-center space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-brand-gold mx-auto" />
      <p className="text-xs text-brand-muted font-mono">Initializing Secure Clearance Portal...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Cinematic Looping Video & Digital Particle Network Background */}
      <AuthBackground />

      <FadeIn direction="up" duration={0.4} className="w-full">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </FadeIn>
    </div>
  );
}
