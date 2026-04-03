import { getTeamStats, getTopScorers } from "@/actions/stats.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { Category } from "@/types/enums";

const CATEGORIES: Category[] = ["PRIMERA", "SEGUNDA", "SENIOR"];
const LABELS: Record<Category, string> = { PRIMERA: "Primera", SEGUNDA: "Segunda", SENIOR: "Senior" };

async function CategoryStats({ category }: { category: Category }) {
  const [stats, scorers] = await Promise.all([getTeamStats(category), getTopScorers(category)]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
        {[
          { label: "PJ", value: stats.played },
          { label: "V", value: stats.wins },
          { label: "E", value: stats.draws },
          { label: "D", value: stats.losses },
          { label: "GF", value: stats.goalsFor },
          { label: "GC", value: stats.goalsAgainst },
          { label: "Pts", value: stats.points },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Goleadores</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">Min</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {scorers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-6">
                    Sin datos aún
                  </TableCell>
                </TableRow>
              ) : scorers.map((s, i) => (
                <TableRow key={s.player?.id ?? i}>
                  <TableCell className="text-gray-400">{i + 1}</TableCell>
                  <TableCell className="font-medium">
                    {s.player ? `${s.player.firstName} ${s.player.lastName}` : "—"}
                  </TableCell>
                  <TableCell className="text-center font-bold">{s.goals}</TableCell>
                  <TableCell className="text-center">{s.assists}</TableCell>
                  <TableCell className="text-center text-gray-500">{s.minutesPlayed}'</TableCell>
                  <TableCell>
                    {s.player && (
                      <Link href={`/admin/jugadores/${s.player.id}`} className="text-green-700 hover:underline text-xs">
                        Ver
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminEstadisticasPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Las stats se actualizan automáticamente al ingresar resultados en los eventos.
        </p>
      </div>

      <Tabs defaultValue="PRIMERA">
        <TabsList>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{LABELS[cat]}</TabsTrigger>
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
