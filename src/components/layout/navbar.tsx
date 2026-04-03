"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/actions/auth.actions";
import { hasRole, ROLE_LABELS } from "@/types/enums";
import { buttonVariants } from "@/components/ui/button";
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
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-green-700">
          ⚽ Las Palmas FC
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-green-700 ${
                pathname === link.href ? "text-green-700" : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {hasRole(role, "JUGADOR") && (
            <Link href="/asistencia" className="text-sm font-medium text-gray-600 hover:text-green-700">
              Asistencia
            </Link>
          )}
          {hasRole(role, "ADMINISTRADOR") && (
            <Link href="/admin" className="text-sm font-medium text-green-700 font-semibold hover:text-green-800">
              Admin
            </Link>
          )}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-green-800 text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
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
                  className="text-red-600 cursor-pointer"
                  onClick={() => logout()}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "bg-green-700 hover:bg-green-800")}
            >
              Iniciar sesión
            </Link>
          )}

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {publicLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium">
                      {link.label}
                    </Link>
                  ))}
                  {hasRole(role, "JUGADOR") && (
                    <Link href="/asistencia" className="text-lg font-medium">
                      Asistencia
                    </Link>
                  )}
                  {hasRole(role, "ADMINISTRADOR") && (
                    <Link href="/admin" className="text-lg font-medium text-green-700">
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
