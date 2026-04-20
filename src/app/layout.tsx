import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${spaceGrotesk.className} min-h-full flex flex-col bg-background`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t-2 border-border bg-foreground py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
            © {new Date().getFullYear()} Las Palmas FC
          </footer>
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
