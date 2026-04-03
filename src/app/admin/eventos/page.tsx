import Link from "next/link";
import { getAllEvents } from "@/actions/event.actions";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EVENT_TYPE_LABELS, MATCH_RESULT_LABELS, CATEGORY_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

export default async function AdminEventosPage() {
  const events = await getAllEvents(true);

  const typeBadge: Record<string, string> = {
    PARTIDO: "bg-green-100 text-green-800",
    ENTRENAMIENTO: "bg-blue-100 text-blue-800",
    REUNION: "bg-purple-100 text-purple-800",
    OTRO: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1">{events.length} eventos registrados</p>
        </div>
        <Link href="/admin/eventos/nuevo" className={cn(buttonVariants(), "bg-green-700 hover:bg-green-800")}>
          + Nuevo evento
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Visibilidad</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[ev.type] ?? "bg-gray-100"}`}>
                      {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(ev.date).toLocaleDateString("es-ES", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ev.category
                      ? CATEGORY_LABELS[ev.category as keyof typeof CATEGORY_LABELS]
                      : <span className="text-gray-400">Todas</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ev.isPublic ? "default" : "secondary"}>
                      {ev.isPublic ? "Público" : "Privado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {ev.match?.result
                      ? `${ev.match.goalsFor}–${ev.match.goalsAgainst}`
                      : ev.type === "PARTIDO"
                      ? <span className="text-gray-400">Pendiente</span>
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/eventos/${ev.id}`}
                      className="text-green-700 hover:underline text-sm"
                    >
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
