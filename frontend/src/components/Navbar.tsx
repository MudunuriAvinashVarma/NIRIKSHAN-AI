"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Activity,
  BarChart3,
  Database,
  FileText,
  Info,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    async function verify() {
      const result = await checkBackendHealth();
      if (mounted) {
        setBackendStatus(result.connected ? "connected" : "offline");
      }
    }
    verify();
    const interval = setInterval(verify, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: "Overview", href: "/", icon: ShieldCheck },
    { name: "National Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Anomaly Intelligence", href: "/anomalies", icon: Activity },
    { name: "Methodology", href: "/methodology", icon: FileText },
    { name: "About", href: "/about", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-bg/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand with Refined Hover */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-10 h-10 rounded-lg bg-brand-card border border-brand-gold/30 flex items-center justify-center text-brand-gold group-hover:border-brand-gold group-hover:shadow-goldGlow transition-all duration-300"
            >
              <Database className="w-5 h-5 text-brand-gold group-hover:text-brand-goldLight transition-colors" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-brand-text group-hover:text-brand-goldLight transition-colors">
                  NIRIKSHAN
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-gold/15 text-brand-goldLight border border-brand-gold/30 shadow-sm">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-brand-muted tracking-tight hidden sm:block">
                Intelligence Behind Every Public Fund
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links with Animated Active Indicator */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 relative">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 z-10 ${
                    isActive
                      ? "text-brand-gold"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-brand-gold scale-105" : "text-brand-muted"}`} />
                  <span>{link.name}</span>

                  {/* Smooth Animated Active Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-brand-card border border-brand-gold/30 rounded-md -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System Status & Authentication Controls */}
          <div className="flex items-center gap-3">
            
            {/* Backend Connectivity Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-300 ${
                backendStatus === "connected"
                  ? "bg-brand-success/10 text-brand-success border-brand-success/30"
                  : backendStatus === "offline"
                  ? "bg-brand-warning/10 text-brand-warning border-brand-warning/30"
                  : "bg-brand-card text-brand-muted border-brand-border"
              }`}
              title={
                backendStatus === "connected"
                  ? "Connected to FastAPI Backend (127.0.0.1:8000)"
                  : "Using Verified Dataset Snapshot (FastAPI Offline)"
              }
            >
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full animate-soft-breath ${
                    backendStatus === "connected" ? "bg-brand-success/60" : "bg-brand-warning/60"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    backendStatus === "connected" ? "bg-brand-success" : "bg-brand-warning"
                  }`}
                />
              </span>
              <span className="hidden sm:inline">
                {backendStatus === "connected" ? "FastAPI Live" : "Snapshot Mode"}
              </span>
              {backendStatus === "connected" ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Authentication States */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-card border border-brand-border text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-brand-gold" />
                  <span className="text-brand-text font-medium">{user.full_name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-surface text-brand-goldLight border border-brand-gold/30">
                    {user.role}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-brand-card hover:bg-brand-cardHover border border-brand-border text-brand-muted hover:text-brand-critical transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-surface hover:bg-brand-card border border-brand-border hover:border-brand-gold/40 text-brand-text transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Sign In</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden sm:block">
                  <Link
                    href="/anomalies"
                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-md text-xs font-semibold bg-brand-gold hover:bg-brand-goldLight text-brand-bg transition-all shadow-sm hover:shadow-goldGlow"
                  >
                    Review Signals
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-brand-border/60 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] rounded transition-colors ${
                  isActive ? "text-brand-gold font-semibold" : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
