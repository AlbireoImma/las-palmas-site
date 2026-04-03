import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MATCH_RESULT_LABELS, EVENT_TYPE_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";
import { Calendar, Users, UserCog, BarChart3 } from "lucide-react";

export default async function AdminDashboard() {
  const [playerCount, upcomingCount, recentMatches, pendingUsers] = await Promise.all([
    prisma.player.count({ where: { isActive: true } }),
    prisma.event.count({ where: { date: { gte: new Date() } } }),
    prisma.match.findMany({
      take: 5,
      include: { event: true },
      orderBy: { event: { date: "desc" } },
      where: { result: { not: null } },
    }),
    prisma.user.count({ where: { role: "INVITADO" } }),
  ]);

  const resultColor: Record<string, string> = {
    VICTORIA: "bg-green-100 text-green-800",
    EMPATE: "bg-yellow-100 text-yellow-800",
    DERROTA: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del club</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Jugadores activos", value: playerCount, icon: <Users className="h-5 w-5 text-green-600" />, href: "/admin/jugadores" },
          { label: "Próximos eventos", value: upcomingCount, icon: <Calendar className="h-5 w-5 text-blue-600" />, href: "/admin/eventos" },
          { label: "Usuarios Invitados", value: pendingUsers, icon: <UserCog className="h-5 w-5 text-orange-500" />, href: "/admin/usuarios" },
          { label: "Estadísticas", value: "→", icon: <BarChart3 className="h-5 w-5 text-purple-600" />, href: "/admin/estadisticas" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <div className="flex justify-between items-start">
                  {item.icon}
                  <span className="text-2xl font-bold">{item.value}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{item.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/eventos/nuevo" className={cn(buttonVariants(), "bg-green-700 hover:bg-green-800")}>
          + Nuevo Evento
        </Link>
        <Link href="/admin/jugadores/nuevo" className={buttonVariants({ variant: "outline" })}>
          + Nuevo Jugador
        </Link>
      </div>

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Rival</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                  <TableHead className="text-center">Marcador</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMatches.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.event.title}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(m.event.date).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short",
                      })}
                    </TableCell>
                    <TableCell>{m.opponentName}</TableCell>
                    <TableCell className="text-center">
                      {m.result && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${resultColor[m.result] ?? ""}`}>
                          {MATCH_RESULT_LABELS[m.result as keyof typeof MATCH_RESULT_LABELS]}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {m.goalsFor ?? "–"}–{m.goalsAgainst ?? "–"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/eventos/${m.eventId}`}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
