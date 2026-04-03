"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasRole } from "@/types/enums";

function requireAdmin(role: string | undefined) {
  if (!hasRole(role ?? "INVITADO", "ADMINISTRADOR")) throw new Error("Sin permisos");
}

export async function upsertLineup(data: {
  eventId: string;
  formation?: string;
  notes?: string;
  entries: {
    playerId: string;
    position?: string;
    isStarter: boolean;
    order?: number;
  }[];
}) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const { entries, ...lineupData } = data;

  const lineup = await prisma.lineup.upsert({
    where: { eventId: data.eventId },
    create: lineupData,
    update: {
      formation: lineupData.formation,
      notes: lineupData.notes,
    },
  });

  await prisma.lineupEntry.deleteMany({ where: { lineupId: lineup.id } });

  if (entries.length > 0) {
    await prisma.lineupEntry.createMany({
      data: entries.map((e) => ({ ...e, lineupId: lineup.id })),
    });
  }

  revalidatePath(`/admin/alineaciones/${data.eventId}`);
  revalidatePath(`/admin/eventos/${data.eventId}`);
  return lineup;
}

export async function getLineupForEvent(eventId: string) {
  return prisma.lineup.findUnique({
    where: { eventId },
    include: {
      entries: {
        include: { player: true },
        orderBy: { order: "asc" },
      },
    },
  });
}
