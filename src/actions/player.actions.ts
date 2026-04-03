"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasRole } from "@/types/enums";
import type { Category } from "@/types/enums";

function requireAdmin(role: string | undefined) {
  if (!hasRole(role ?? "INVITADO", "ADMINISTRADOR")) throw new Error("Sin permisos");
}

export async function getPlayersByCategory(category: Category) {
  return prisma.player.findMany({
    where: { category, isActive: true },
    include: { user: { select: { email: true, image: true } } },
    orderBy: [{ dorsal: "asc" }, { lastName: "asc" }],
  });
}

export async function getAllPlayers() {
  return prisma.player.findMany({
    where: { isActive: true },
    include: { user: { select: { email: true, image: true } } },
    orderBy: [{ category: "asc" }, { dorsal: "asc" }],
  });
}

export async function getPlayerById(id: string) {
  return prisma.player.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, image: true, role: true } },
      matchStats: {
        include: {
          cards: true,
          match: { include: { event: { select: { date: true, title: true } } } },
        },
        orderBy: { match: { event: { date: "desc" } } },
      },
    },
  });
}

export async function getPlayerByUserId(userId: string) {
  return prisma.player.findUnique({
    where: { userId },
    include: { user: { select: { email: true, image: true } } },
  });
}

export async function createPlayer(data: {
  userId: string;
  firstName: string;
  lastName: string;
  dorsal?: number | null;
  position?: string | null;
  category: Category;
  dateOfBirth?: Date | null;
  phone?: string | null;
  bio?: string | null;
}) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const player = await prisma.player.create({ data });
  // Upgrade user role to JUGADOR if currently INVITADO
  await prisma.user.update({
    where: { id: data.userId },
    data: {
      role: {
        // Only upgrade, never downgrade
      },
    },
  }).catch(() => {});

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (user && !hasRole(user.role, "JUGADOR")) {
    await prisma.user.update({ where: { id: data.userId }, data: { role: "JUGADOR" } });
  }

  revalidatePath("/equipo");
  revalidatePath("/admin/jugadores");
  return player;
}

export async function updatePlayer(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    dorsal?: number | null;
    position?: string | null;
    category?: Category;
    dateOfBirth?: Date | null;
    phone?: string | null;
    bio?: string | null;
    isActive?: boolean;
    photoUrl?: string | null;
  }
) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const player = await prisma.player.update({ where: { id }, data });
  revalidatePath("/equipo");
  revalidatePath(`/jugadores/${id}`);
  revalidatePath("/admin/jugadores");
  return player;
}

export async function deactivatePlayer(id: string) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  await prisma.player.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/admin/jugadores");
  revalidatePath("/equipo");
}
