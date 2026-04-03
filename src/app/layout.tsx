import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Las Palmas FC",
  description: "Club de fútbol amateur Las Palmas — gestión de equipo, eventos y estadísticas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white py-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Las Palmas FC — Club de Fútbol Amateur
          </footer>
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
