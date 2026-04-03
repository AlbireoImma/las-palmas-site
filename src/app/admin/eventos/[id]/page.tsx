"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEventById, updateEvent, deleteEvent, updateMatchScore } from "@/actions/event.actions";
import { getAllPlayers } from "@/actions/player.actions";
import { upsertMatchPlayerStat } from "@/actions/stats.actions";
import { markAttended } from "@/actions/attendance.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EVENT_TYPE_LABELS, MATCH_RESULT_LABELS } from "@/types/enums";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventById>>>;
type PlayerList = Awaited<ReturnType<typeof getAllPlayers>>;

export default function AdminEventoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ev, setEv] = useState<EventDetail | null>(null);
  const [players, setPlayers] = useState<PlayerList>([]);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const [e, p] = await Promise.all([getEventById(id), getAllPlayers()]);
    if (e) setEv(e);
    setPlayers(p);
  }

  useEffect(() => { refresh(); }, [id]);

  if (!ev) return <div className="p-6 text-gray-500">Cargando...</div>;

  async function handleSaveScore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ev?.match) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateMatchScore(
          ev.match!.id,
          parseInt(fd.get("goalsFor") as string),
          parseInt(fd.get("goalsAgainst") as string),
          (fd.get("notes") as string) || undefined
        );
        toast.success("Resultado guardado");
        await refresh();
      } catch { toast.error("Error"); }
    });
  }

  async function handleStatSubmit(e: React.FormEvent<HTMLFormElement>, playerId: string) {
    e.preventDefault();
    if (!ev?.match) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await upsertMatchPlayerStat({
          matchId: ev.match!.id,
          playerId,
          minutesPlayed: parseInt(fd.get("minutes") as string) || 0,
          goals: parseInt(fd.get("goals") as string) || 0,
          assists: parseInt(fd.get("assists") as string) || 0,
        });
        toast.success("Stats guardadas");
        await refresh();
      } catch { toast.error("Error"); }
    });
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este evento?")) return;
    startTransition(async () => {
      try {
        await deleteEvent(id);
        toast.success("Evento eliminado");
        router.push("/admin/eventos");
      } catch { toast.error("Error"); }
    });
  }

  const existingStats = Object.fromEntries(
    (ev.match?.playerStats ?? []).map((s) => [s.playerId, s])
  );

  const resultColor: Record<string, string> = {
    VICTORIA: "bg-green-100 text-green-800",
    EMPATE: "bg-yellow-100 text-yellow-800",
    DERROTA: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/eventos" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-3 inline-flex")}>
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold">{ev.title}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">
              {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(ev.date).toLocaleDateString("es-ES", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            {ev.location && <span className="text-sm text-gray-500">📍 {ev.location}</span>}
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="shrink-0"
        >
          Eliminar evento
        </Button>
      </div>

      <Tabs defaultValue={ev.match ? "partido" : "info"}>
        <TabsList>
          {ev.match && <TabsTrigger value="partido">Partido</TabsTrigger>}
          {ev.match && <TabsTrigger value="stats">Estadísticas</TabsTrigger>}
          <TabsTrigger value="alineacion">
            <Link href={`/admin/alineaciones/${ev.id}`} className="hover:underline">
              Alineación ↗
            </Link>
          </TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
        </TabsList>

        {/* Match result tab */}
        {ev.match && (
          <TabsContent value="partido" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultado del partido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-semibold">vs {ev.match.opponentName}</span>
                  <Badge variant="outline">{ev.match.isHome ? "Local" : "Visitante"}</Badge>
                  {ev.match.result && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${resultColor[ev.match.result]}`}>
                      {MATCH_RESULT_LABELS[ev.match.result as keyof typeof MATCH_RESULT_LABELS]}
                    </span>
                  )}
                </div>
                <form onSubmit={handleSaveScore} className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-1">
                    <Label>Goles a favor</Label>
                    <Input name="goalsFor" type="number" min={0} defaultValue={ev.match.goalsFor ?? ""} className="w-20" />
                  </div>
                  <div className="space-y-1">
                    <Label>Goles en contra</Label>
                    <Input name="goalsAgainst" type="number" min={0} defaultValue={ev.match.goalsAgainst ?? ""} className="w-20" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-40">
                    <Label>Notas</Label>
                    <Input name="notes" defaultValue={ev.match.notes ?? ""} placeholder="Observaciones..." />
                  </div>
                  <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isPending}>
                    Guardar resultado
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Stats tab */}
        {ev.match && (
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estadísticas por jugador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => {
                    const stat = existingStats[player.id];
                    return (
                      <form
                        key={player.id}
                        onSubmit={(e) => handleStatSubmit(e, player.id)}
                        className="flex items-center gap-3 flex-wrap border rounded-lg p-3"
                      >
                        <span className="w-36 font-medium text-sm shrink-0">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="text-xs text-gray-400 w-16 shrink-0">{player.category}</span>
                        <div className="flex gap-2 items-center">
                          <Label className="text-xs">Min</Label>
                          <Input name="minutes" type="number" min={0} max={120} defaultValue={stat?.minutesPlayed ?? 0} className="w-16 h-7 text-sm" />
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label className="text-xs">Goles</Label>
                          <Input name="goals" type="number" min={0} defaultValue={stat?.goals ?? 0} className="w-14 h-7 text-sm" />
                        </div>
                        <div className="flex gap-2 items-center">
                          <Label className="text-xs">Asist.</Label>
                          <Input name="assists" type="number" min={0} defaultValue={stat?.assists ?? 0} className="w-14 h-7 text-sm" />
                        </div>
                        <Button type="submit" size="sm" disabled={isPending} className="h-7 text-xs">
                          Guardar
                        </Button>
                      </form>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Attendance tab */}
        <TabsContent value="asistencia">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Asistencia ({ev.attendances.length} confirmaciones)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ev.attendances.length === 0 ? (
                <p className="text-gray-500 text-sm">Ningún jugador ha confirmado asistencia aún.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jugador</TableHead>
                      <TableHead>Confirmó</TableHead>
                      <TableHead>Asistió</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ev.attendances.map((att) => (
                      <TableRow key={att.id}>
                        <TableCell>
                          {att.player.firstName} {att.player.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={att.confirmed ? "default" : "secondary"}>
                            {att.confirmed ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {att.attended === null || att.attended === undefined
                            ? <span className="text-gray-400 text-xs">Pendiente</span>
                            : <Badge variant={att.attended ? "default" : "secondary"}>
                                {att.attended ? "Asistió" : "No asistió"}
                              </Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
