import { getTeamStats, getTopScorers } from "@/actions/stats.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import type { Category } from "@/types/enums";

const CATEGORIES: Category[] = ["PRIMERA", "SEGUNDA", "SENIOR"];
const CATEGORY_LABELS: Record<Category, string> = {
  PRIMERA: "Primera",
  SEGUNDA: "Segunda",
  SENIOR: "Senior",
};

async function CategoryStats({ category }: { category: Category }) {
  const [stats, scorers] = await Promise.all([
    getTeamStats(category),
    getTopScorers(category),
  ]);

  const goalDiff = stats.goalsFor - stats.goalsAgainst;

  return (
    <div className="space-y-6">
      {/* Team summary */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
        {[
          { label: "PJ", value: stats.played },
          { label: "V", value: stats.wins },
          { label: "E", value: stats.draws },
          { label: "D", value: stats.losses },
          { label: "GF", value: stats.goalsFor },
          { label: "GC", value: stats.goalsAgainst },
          { label: "+/-", value: goalDiff > 0 ? `+${goalDiff}` : goalDiff },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top scorers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goleadores</CardTitle>
        </CardHeader>
        <CardContent>
          {scorers.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Sin datos de goles aún.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">G</TableHead>
                  <TableHead className="text-center">A</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scorers.map((s, i) => (
                  <TableRow key={s.player?.id ?? i}>
                    <TableCell className="text-gray-400 font-mono">{i + 1}</TableCell>
                    <TableCell>
                      {s.player ? (
                        <Link
                          href={`/jugadores/${s.player.id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-green-100 text-green-800">
                              {s.player.firstName[0]}{s.player.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {s.player.firstName} {s.player.lastName}
                          </span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">{s.goals}</TableCell>
                    <TableCell className="text-center">{s.assists}</TableCell>
                    <TableCell className="text-center text-gray-500">{s.minutesPlayed}'</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EstadisticasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Estadísticas</h1>
      <p className="text-gray-500 mb-8">Rendimiento del equipo y goleadores por categoría</p>

      <Tabs defaultValue="PRIMERA">
        <TabsList className="mb-6">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <CategoryStats category={cat} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
