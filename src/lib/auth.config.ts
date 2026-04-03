import type { NextAuthConfig } from "next-auth";
import { hasRole } from "@/types/enums";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const role: string = (auth?.user as any)?.role ?? "INVITADO";
      const path = nextUrl.pathname;

      if (path.startsWith("/admin") && !hasRole(role, "ADMINISTRADOR")) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (path.startsWith("/reuniones") && !hasRole(role, "SOCIO")) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (
        (path.startsWith("/perfil") || path.startsWith("/asistencia")) &&
        !hasRole(role, "JUGADOR")
      ) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "INVITADO";
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
};
