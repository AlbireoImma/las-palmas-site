"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/actions/event.actions";
import { getAllPlayers } from "@/actions/player.actions";
import { upsertLineup, getLineupForEvent } from "@/actions/lineup.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CATEGORY_LABELS } from "@/types/enums";

type PlayerList = Awaited<ReturnType<typeof getAllPlayers>>;
type LineupData = Awaited<ReturnType<typeof getLineupForEvent>>;

interface LineupEntry {
  playerId: string;
  isStarter: boolean;
  order: number;
  position: string;
}

export default function AlineacionPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const [eventTitle, setEventTitle] = useState("");
  const [players, setPlayers] = useState<PlayerList>([]);
  const [lineup, setLineup] = useState<LineupData>(null);
  const [formation, setFormation] = useState("4-3-3");
  const [entries, setEntries] = useState<LineupEntry[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      getEventById(eventoId),
      getAllPlayers(),
      getLineupForEvent(eventoId),
    ]).then(([ev, ps, lu]) => {
      if (ev) setEventTitle(ev.title);
      setPlayers(ps);
      if (lu) {
        setLineup(lu);
        setFormation(lu.formation ?? "4-3-3");
        setEntries(
          lu.entries.map((e, i) => ({
            playerId: e.playerId,
            isStarter: e.isStarter,
            order: e.order ?? i,
            position: e.position ?? "",
          }))
        );
      }
    });
  }, [eventoId]);

  function togglePlayer(playerId: string) {
    setEntries((prev) => {
      const exists = prev.find((e) => e.playerId === playerId);
      if (exists) return prev.filter((e) => e.playerId !== playerId);
      return [...prev, { playerId, isStarter: true, order: prev.length, position: "" }];
    });
  }

  function updateEntry(playerId: string, field: "isStarter" | "position", value: boolean | string) {
    setEntries((prev) =>
      prev.map((e) => (e.playerId === playerId ? { ...e, [field]: value } : e))
    );
  }

  async function handleSave() {
    startTransition(async () => {
      try {
        await upsertLineup({ eventId: eventoId, formation, entries });
        toast.success("Alineación guardada");
        const updated = await getLineupForEvent(eventoId);
        setLineup(updated);
      } catch { toast.error("Error al guardar"); }
    });
  }

  const selectedIds = new Set(entries.map((e) => e.playerId));

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href={`/admin/eventos/${eventoId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Volver al evento
        </Link>
        <h1 className="text-2xl font-bold">Alineación — {eventTitle}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: player selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar jugadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
            {players.map((p) => {
              const selected = selectedIds.has(p.id);
              const entry = entries.find((e) => e.playerId === p.id);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selected ? "border-green-400 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => togglePlayer(p.id)}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    <span className="w-6 text-center text-sm text-gray-400 font-mono">{p.dorsal ?? "—"}</span>
                    <span className="font-medium text-sm">{p.firstName} {p.lastName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS] ?? p.category}
                    </Badge>
                  </button>
                  {selected && (
                    <div className="flex gap-2 items-center">
                      <Select
                        value={entry?.isStarter ? "titular" : "suplente"}
                        onValueChange={(v) => updateEntry(p.id, "isStarter", (v ?? "titular") === "titular")}
                      >
                        <SelectTrigger className="h-6 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="titular">Titular</SelectItem>
                          <SelectItem value="suplente">Suplente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right: formation + summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Formación</Label>
                <Select value={formation} onValueChange={(v) => setFormation(v ?? "4-3-3")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "3-4-3"].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar alineación"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Titulares ({entries.filter((e) => e.isStarter).length}) / Suplentes (
                {entries.filter((e) => !e.isStarter).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {["Titulares", "Suplentes"].map((section) => {
                const isStarter = section === "Titulares";
                const sectionEntries = entries.filter((e) => e.isStarter === isStarter);
                if (sectionEntries.length === 0) return null;
                return (
                  <div key={section}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-3 mb-1">{section}</p>
                    {sectionEntries.map((entry) => {
                      const p = players.find((pl) => pl.id === entry.playerId);
                      return p ? (
                        <div key={entry.playerId} className="text-sm py-0.5 flex items-center gap-2">
                          <span className="text-gray-400 font-mono w-5">{p.dorsal ?? "—"}</span>
                          <span>{p.firstName} {p.lastName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
