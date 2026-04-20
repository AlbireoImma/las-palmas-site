"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/actions/auth.actions";
import { hasRole, ROLE_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/calendario", label: "Calendario" },
  { href: "/equipo", label: "Equipo" },
  { href: "/estadisticas", label: "Estadísticas" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const role: string = (session?.user as any)?.role ?? "INVITADO";
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="bg-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-sm tracking-[0.18em] uppercase text-primary-foreground"
        >
          Las Palmas FC
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 h-14 flex items-center text-xs font-bold uppercase tracking-widest transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-background/50 hover:text-primary-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {hasRole(role, "JUGADOR") && (
            <Link
              href="/asistencia"
              className={cn(
                "px-4 h-14 flex items-center text-xs font-bold uppercase tracking-widest transition-colors",
                pathname === "/asistencia"
                  ? "bg-primary text-primary-foreground"
                  : "text-background/50 hover:text-primary-foreground"
              )}
            >
              Asistencia
            </Link>
          )}
          {hasRole(role, "ADMINISTRADOR") && (
            <Link
              href="/admin"
              className={cn(
                "px-4 h-14 flex items-center text-xs font-bold uppercase tracking-widest transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:text-primary-foreground"
              )}
            >
              Admin
            </Link>
          )}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm uppercase tracking-wide">{user.name}</span>
                    <span className="text-xs text-muted-foreground normal-case font-normal">{user.email}</span>
                    <Badge variant="secondary" className="w-fit text-xs mt-1 font-bold uppercase tracking-wide">
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hasRole(role, "JUGADOR") && (
                  <DropdownMenuItem onClick={() => router.push("/perfil")}>
                    Mi Perfil
                  </DropdownMenuItem>
                )}
                {hasRole(role, "ADMINISTRADOR") && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    Panel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => logout()}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 text-background/50 hover:text-primary-foreground transition-colors">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-foreground border-l border-background/15 p-0">
                <div className="flex flex-col mt-14">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-background/15 transition-colors",
                        pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-background/55 hover:text-primary-foreground hover:bg-background/8"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {hasRole(role, "JUGADOR") && (
                    <Link
                      href="/asistencia"
                      className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-background/15 text-background/55 hover:text-primary-foreground hover:bg-background/8 transition-colors"
                    >
                      Asistencia
                    </Link>
                  )}
                  {hasRole(role, "ADMINISTRADOR") && (
                    <Link
                      href="/admin"
                      className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-background/15 text-primary hover:text-primary-foreground hover:bg-background/8 transition-colors"
                    >
                      Panel Admin
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
