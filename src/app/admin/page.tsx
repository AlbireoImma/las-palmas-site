import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/lib/button-variants";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MATCH_RESULT_LABELS, CATEGORY_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";
import { Calendar, Users, UserCog, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
  const [playerCount, upcomingCount, recentMatches, pendingUsers, nextMatch, pendingResults] =
    await Promise.all([
      prisma.player.count({ where: { isActive: true } }),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.match.findMany({
        take: 5,
        include: { event: true },
        orderBy: { event: { date: "desc" } },
        where: { result: { not: null } },
      }),
      prisma.user.count({ where: { role: "INVITADO" } }),
      // Next upcoming match
      prisma.event.findFirst({
        where: { type: "PARTIDO", date: { gte: new Date() } },
        orderBy: { date: "asc" },
        include: { match: true },
      }),
      // Past matches missing a result
      prisma.event.findMany({
        where: {
          type: "PARTIDO",
          date: { lt: new Date() },
          match: { result: null },
        },
        include: { match: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

  const resultStyle: Record<string, string> = {
    VICTORIA: "bg-[#1B998B]/15 text-[#1B998B] font-bold",
    EMPATE: "bg-[#6699CC]/15 text-[#6699CC] font-bold",
    DERROTA: "bg-primary/15 text-primary font-bold",
  };

  return (
    <div className="p-6 space-y-8">
      <div className="border-b-2 border-border pb-5">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen del club</p>
      </div>

      {/* Next match spotlight */}
      {nextMatch?.match && (
        <div className="border-l-4 border-primary bg-primary/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1">
              Próximo Partido
            </p>
            <p className="text-lg font-bold">
              vs {nextMatch.match.opponentName}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                — {nextMatch.match.isHome ? "Local" : "Visitante"}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              —{" "}
              {new Date(nextMatch.date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {nextMatch.category && (
                <span className="ml-2 font-bold uppercase text-xs">
                  · {CATEGORY_LABELS[nextMatch.category as keyof typeof CATEGORY_LABELS] ?? nextMatch.category}
                </span>
              )}
            </p>
            {nextMatch.location && (
              <p className="text-xs text-muted-foreground mt-0.5">{nextMatch.location}</p>
            )}
          </div>
          <Link
            href={`/admin/eventos/${nextMatch.id}`}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
          >
            Ver detalle →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-border">
        {[
          { label: "Jugadores activos", value: playerCount, icon: <Users className="h-5 w-5" />, href: "/admin/jugadores" },
          { label: "Próximos eventos", value: upcomingCount, icon: <Calendar className="h-5 w-5" />, href: "/admin/eventos" },
          { label: "Usuarios invitados", value: pendingUsers, icon: <UserCog className="h-5 w-5" />, href: "/admin/usuarios" },
          { label: "Estadísticas", value: "→", icon: <BarChart3 className="h-5 w-5" />, href: "/admin/estadisticas" },
        ].map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`p-5 hover:bg-accent transition-colors group ${i < 3 ? "border-r-2 border-border" : ""} ${i >= 2 ? "border-t-2 md:border-t-0 border-border" : ""}`}
          >
            <div className="flex justify-between items-start mb-3 text-muted-foreground group-hover:text-primary transition-colors">
              {item.icon}
              <span className="text-2xl font-bold text-foreground">{item.value}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/eventos/nuevo" className={cn(buttonVariants(), "bg-primary hover:bg-primary/90 text-primary-foreground")}>
          + Nuevo Evento
        </Link>
        <Link href="/admin/jugadores/nuevo" className={buttonVariants({ variant: "outline" })}>
          + Nuevo Jugador
        </Link>
      </div>

      {/* Pending results alert */}
      {pendingResults.length > 0 && (
        <div className="border-2 border-border">
          <div className="px-4 py-3 border-b-2 border-border flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Resultados pendientes ({pendingResults.length})
            </p>
            <p className="text-xs text-muted-foreground">Partidos sin resultado registrado</p>
          </div>
          <div>
            {pendingResults.map((ev, i) => (
              <div
                key={ev.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors ${i < pendingResults.length - 1 ? "border-b border-border" : ""}`}
              >
                <div>
                  <span className="text-sm font-bold">{ev.title}</span>
                  {ev.match && (
                    <span className="text-sm text-muted-foreground ml-2">
                      vs {ev.match.opponentName}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(ev.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <Link
                  href={`/admin/eventos/${ev.id}`}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  Registrar →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent results */}
      {recentMatches.length > 0 && (
        <div className="border-2 border-border">
          <div className="px-4 py-3 border-b-2 border-border">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Últimos resultados
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Partido</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Fecha</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">Rival</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-center">Resultado</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-center">Marcador</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMatches.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-bold text-sm">{m.event.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(m.event.date).toLocaleDateString("es-ES", {
                      day: "numeric", month: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">{m.opponentName}</TableCell>
                  <TableCell className="text-center">
                    {m.result && (
                      <span className={`text-xs px-2 py-0.5 font-bold uppercase tracking-wide ${resultStyle[m.result] ?? ""}`}>
                        {MATCH_RESULT_LABELS[m.result as keyof typeof MATCH_RESULT_LABELS]}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold">
                    {m.goalsFor ?? "–"}–{m.goalsAgainst ?? "–"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/eventos/${m.eventId}`}
                      className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                      Ver →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
