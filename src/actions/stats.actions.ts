"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasRole } from "@/types/enums";
import type { CardType, Category } from "@/types/enums";

function requireAdmin(role: string | undefined) {
  if (!hasRole(role ?? "INVITADO", "ADMINISTRADOR")) throw new Error("Sin permisos");
}

export async function upsertMatchPlayerStat(data: {
  matchId: string;
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  isCaptain?: boolean;
  cards?: { type: CardType; minute?: number }[];
}) {
  const session = await auth();
  requireAdmin((session?.user as any)?.role);

  const { cards, ...statData } = data;

  const stat = await prisma.matchPlayerStat.upsert({
    where: { matchId_playerId: { matchId: data.matchId, playerId: data.playerId } },
    create: statData,
    update: statData,
  });

  if (cards !== undefined) {
    await prisma.card.deleteMany({ where: { statId: stat.id } });
    if (cards.length > 0) {
      await prisma.card.createMany({
        data: cards.map((c) => ({ ...c, statId: stat.id })),
      });
    }
  }

  revalidatePath("/estadisticas");
  return stat;
}

export async function getPlayerSeasonStats(playerId: string) {
  return prisma.matchPlayerStat.findMany({
    where: { playerId },
    include: {
      cards: true,
      match: { include: { event: { select: { date: true, title: true } } } },
    },
    orderBy: { match: { event: { date: "desc" } } },
  });
}

export async function getTeamStats(category: Category) {
  // Aggregate from all matches for the category
  const events = await prisma.event.findMany({
    where: { category, type: "PARTIDO" },
    include: { match: true },
  });

  const matches = events
    .map((e) => e.match)
    .filter((m): m is NonNullable<typeof m> => m !== null && m.result !== null);

  return {
    played: matches.length,
    wins: matches.filter((m) => m.result === "VICTORIA").length,
    draws: matches.filter((m) => m.result === "EMPATE").length,
    losses: matches.filter((m) => m.result === "DERROTA").length,
    goalsFor: matches.reduce((sum, m) => sum + (m.goalsFor ?? 0), 0),
    goalsAgainst: matches.reduce((sum, m) => sum + (m.goalsAgainst ?? 0), 0),
    points:
      matches.filter((m) => m.result === "VICTORIA").length * 3 +
      matches.filter((m) => m.result === "EMPATE").length,
  };
}

export async function getTopScorers(category?: Category) {
  const stats = await prisma.matchPlayerStat.groupBy({
    by: ["playerId"],
    where: category
      ? { player: { category } }
      : {},
    _sum: { goals: true, assists: true, minutesPlayed: true },
    orderBy: { _sum: { goals: "desc" } },
    take: 10,
  });

  const playerIds = stats.map((s) => s.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
  });

  const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

  return stats.map((s) => ({
    player: playerMap[s.playerId],
    goals: s._sum.goals ?? 0,
    assists: s._sum.assists ?? 0,
    minutesPlayed: s._sum.minutesPlayed ?? 0,
  }));
}
