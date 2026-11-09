"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Database, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect unauthenticated requests to login with return path
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Loading state while checking HTTP-only session
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 rounded-xl bg-brand-card border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-goldGlow"
        >
          <Database className="w-6 h-6 text-brand-gold" />
        </motion.div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono font-medium text-brand-gold uppercase tracking-wider">
            NIRIKSHAN Security Gate
          </p>
          <p className="text-xs text-brand-muted">
            Verifying institutional credentials and session status...
          </p>
        </div>
      </div>
    );
  }

  // Fallback gate screen if unauthenticated and redirect is settling
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-brand-warning/10 border border-brand-warning/30 flex items-center justify-center text-brand-warning">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-brand-text">Restricted Intelligence Area</h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            Public fund audit telemetry and ML candidate matrices require verified institutional authentication.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-goldLight text-brand-bg font-semibold text-xs transition-all shadow-md"
          >
            <span>Proceed to Secure Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

