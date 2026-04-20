"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasRole } from "@/types/enums";

export async function confirmAttendance(eventId: string, confirmed: boolean, note?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const player = await prisma.player.findUnique({
    where: { userId: (session.user as any).id },
  });
  if (!player) throw new Error("No tienes perfil de jugador");

  await prisma.eventAttendance.upsert({
    where: { eventId_playerId: { eventId, playerId: player.id } },
    create: { eventId, playerId: player.id, confirmed, note: note ?? null },
    update: { confirmed, ...(note !== undefined && { note }) },
  });

  revalidatePath("/asistencia");
  revalidatePath(`/admin/eventos/${eventId}`);
}

export async function getMyAttendances() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const player = await prisma.player.findUnique({
    where: { userId: (session.user as any).id },
  });
  if (!player) return [];

  return prisma.eventAttendance.findMany({
    where: { playerId: player.id },
    include: { event: { include: { match: true } } },
    orderBy: { event: { date: "asc" } },
  });
}

export async function markAttended(
  eventId: string,
  playerId: string,
  attended: boolean
) {
  const session = await auth();
  if (!hasRole((session?.user as any)?.role ?? "INVITADO", "ADMINISTRADOR")) {
    throw new Error("Sin permisos");
  }

  await prisma.eventAttendance.upsert({
    where: { eventId_playerId: { eventId, playerId } },
    create: { eventId, playerId, confirmed: true, attended },
    update: { attended },
  });

  revalidatePath(`/admin/eventos/${eventId}`);
}
