import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/animations/PageTransition";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "NIRIKSHAN AI — Intelligence Behind Every Public Fund",
  description:
    "A Public Finance Intelligence Platform for MPLADS fund sanction analysis, detecting statistical anomalies and delay patterns through unsupervised machine learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-brand-bg text-brand-text min-h-screen flex flex-col antialiased selection:bg-brand-gold/30 selection:text-brand-goldLight">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
