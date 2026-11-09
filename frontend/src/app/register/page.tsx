"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthBackground from "@/components/auth/AuthBackground";
import RegisterForm from "@/components/auth/RegisterForm";
import FadeIn from "@/components/animations/FadeIn";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Cinematic Looping Video & Digital Particle Network Background */}
      <AuthBackground />

      <FadeIn direction="up" duration={0.4} className="w-full">
        <RegisterForm />
      </FadeIn>
    </div>
  );
}

