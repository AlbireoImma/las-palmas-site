"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasRole } from "@/types/enums";
import type { EventType, Category } from "@/types/enums";

function requireAdmin(role: string | undefined) {
  if (!hasRole(role ?? "INVITADO", "ADMINISTRADOR")) throw new Error("Sin permisos");
}

export async function getPublicUpcomingEvents() {
  return prisma.event.findMany({
    where: { isPublic: true, date: { gte: new Date() } },
    include: { match: true },
    orderBy: { date: "asc" },
    take: 20,
  });
}

export async function getAllEvents(includePrivate = false) {
  return prisma.event.findMany({
    where: includePrivate ? {} : { isPublic: true },
    include: { match: true },
    orderBy: { date: "asc" },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      match: {
        include: {
          playerStats: {
            include: { player: true, cards: true },
          },
        },
      },
      lineup: {
        include: {
          entries: {
            include: { player: true },
            orderBy: { order: "asc" },
          },
        },
      },
      attendances: {
        include: { player: true },
      },
    },
  });
}

export async function createEvent(data: {
  title: string;
  type: EventType;
  date: Date;
  location?: string;
  description?: string;
  isPublic?: boolean;
  category?: Category;
  opponentName?: string;
  isHome?: boolean;
}) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const { opponentName, isHome, ...eventData } = data;

  const event = await prisma.event.create({
    data: {
      ...eventData,
      ...(data.type === "PARTIDO" && opponentName
        ? {
            match: {
              create: { opponentName, isHome: isHome ?? true },
            },
          }
        : {}),
    },
    include: { match: true },
  });

  revalidatePath("/calendario");
  revalidatePath("/admin/eventos");
  return event;
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    type?: EventType;
    date?: Date;
    location?: string;
    description?: string;
    isPublic?: boolean;
    category?: Category;
  }
) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const event = await prisma.event.update({ where: { id }, data });
  revalidatePath("/calendario");
  revalidatePath(`/admin/eventos/${id}`);
  return event;
}

export async function updateMatchScore(
  matchId: string,
  goalsFor: number,
  goalsAgainst: number,
  notes?: string
) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const result =
    goalsFor > goalsAgainst ? "VICTORIA" : goalsFor < goalsAgainst ? "DERROTA" : "EMPATE";

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { goalsFor, goalsAgainst, result, ...(notes ? { notes } : {}) },
    include: { event: true },
  });

  revalidatePath("/estadisticas");
  revalidatePath(`/admin/eventos/${match.event.id}`);
  return match;
}

export async function deleteEvent(id: string) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  await prisma.event.delete({ where: { id } });
  revalidatePath("/calendario");
  revalidatePath("/admin/eventos");
}
