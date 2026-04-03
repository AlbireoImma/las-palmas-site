"use client";

import { useSession } from "next-auth/react";
import { hasRole } from "@/types/enums";
import type { Role } from "@/types/enums";

interface RoleGateProps {
  requiredRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ requiredRole, children, fallback = null }: RoleGateProps) {
  const { data: session } = useSession();
  const role: string = (session?.user as any)?.role ?? "INVITADO";

  if (!hasRole(role, requiredRole)) return <>{fallback}</>;
  return <>{children}</>;
}
