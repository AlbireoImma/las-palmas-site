import Link from "next/link";
import { getAllPlayers } from "@/actions/player.actions";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CATEGORY_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

export default async function AdminJugadoresPage() {
  const players = await getAllPlayers();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jugadores</h1>
          <p className="text-gray-500 text-sm mt-1">{players.length} jugadores activos</p>
        </div>
        <Link href="/admin/jugadores/nuevo" className={cn(buttonVariants(), "bg-green-700 hover:bg-green-800")}>
          + Nuevo jugador
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Email</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-gray-400 font-mono">{p.dorsal ?? "—"}</TableCell>
                  <TableCell className="font-medium">
                    {p.firstName} {p.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{p.position ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-700 text-xs">
                      {CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS] ?? p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{p.user?.email ?? "—"}</TableCell>
                  <TableCell>
                    <Link href={`/admin/jugadores/${p.id}`} className="text-green-700 hover:underline text-sm">
                      Editar
                    </Link>
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
