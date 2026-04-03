import { notFound } from "next/navigation";
import { getPlayerById } from "@/actions/player.actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORY_LABELS, CARD_TYPE_LABELS } from "@/types/enums";

export default async function JugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const totalGoals = player.matchStats.reduce((s, m) => s + m.goals, 0);
  const totalAssists = player.matchStats.reduce((s, m) => s + m.assists, 0);
  const totalMinutes = player.matchStats.reduce((s, m) => s + m.minutesPlayed, 0);
  const totalYellow = player.matchStats.flatMap((m) => m.cards).filter((c) => c.type === "AMARILLA").length;
  const totalRed = player.matchStats.flatMap((m) => m.cards).filter((c) => c.type === "ROJA" || c.type === "DOBLE_AMARILLA").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="bg-green-100 text-green-800 text-3xl font-bold">
            {player.dorsal ?? player.firstName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {player.firstName} {player.lastName}
          </h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge className="bg-green-700">
              {CATEGORY_LABELS[player.category as keyof typeof CATEGORY_LABELS] ?? player.category}
            </Badge>
            {player.position && <Badge variant="secondary">{player.position}</Badge>}
            {player.dorsal && <Badge variant="outline">#{player.dorsal}</Badge>}
          </div>
          {player.bio && <p className="text-gray-600 mt-2 text-sm max-w-md">{player.bio}</p>}
        </div>
      </div>

      {/* Season summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Partidos", value: player.matchStats.length },
          { label: "Goles", value: totalGoals },
          { label: "Asistencias", value: totalAssists },
          { label: "Minutos", value: totalMinutes },
          { label: "Amarillas", value: totalYellow },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Match history */}
      {player.matchStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de partidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                  <TableHead className="text-center">G</TableHead>
                  <TableHead className="text-center">A</TableHead>
                  <TableHead className="text-center">Tarjetas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {player.matchStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">
                      {stat.match.event.title}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(stat.match.event.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-center">{stat.minutesPlayed}'</TableCell>
                    <TableCell className="text-center font-semibold">{stat.goals}</TableCell>
                    <TableCell className="text-center">{stat.assists}</TableCell>
                    <TableCell className="text-center">
                      {stat.cards.map((c, i) => (
                        <span
                          key={i}
                          title={CARD_TYPE_LABELS[c.type as keyof typeof CARD_TYPE_LABELS]}
                          className={
                            c.type === "AMARILLA"
                              ? "inline-block w-3 h-4 bg-yellow-400 rounded-sm mr-1"
                              : "inline-block w-3 h-4 bg-red-600 rounded-sm mr-1"
                          }
                        />
                      ))}
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
