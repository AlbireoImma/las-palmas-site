"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { Role } from "@/types/enums";
import { hasRole } from "@/types/enums";
import { AuthError } from "next-auth";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("El email ya está registrado");

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "INVITADO",
    },
  });
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales incorrectas" };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth();
  if (!hasRole((session?.user as any)?.role, "ADMINISTRADOR")) {
    throw new Error("Sin permisos");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/usuarios");
}

export async function getUsers() {
  const session = await auth();
  if (!hasRole((session?.user as any)?.role, "ADMINISTRADOR")) {
    throw new Error("Sin permisos");
  }
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { player: { select: { firstName: true, lastName: true, category: true } } },
  });
}
