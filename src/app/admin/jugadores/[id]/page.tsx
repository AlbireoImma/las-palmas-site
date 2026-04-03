"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPlayerById, updatePlayer, deactivatePlayer } from "@/actions/player.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { POSITIONS } from "@/types/enums";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Player = NonNullable<Awaited<ReturnType<typeof getPlayerById>>>;

export default function EditarJugadorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<string>("PRIMERA");
  const [position, setPosition] = useState<string>("");

  useEffect(() => {
    getPlayerById(id).then((p) => {
      if (p) {
        setPlayer(p);
        setCategory(p.category);
        setPosition(p.position ?? "");
      }
    });
  }, [id]);

  if (!player) return <div className="p-6 text-gray-500">Cargando...</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePlayer(id, {
          firstName: fd.get("firstName") as string,
          lastName: fd.get("lastName") as string,
          dorsal: (fd.get("dorsal") as string) ? parseInt(fd.get("dorsal") as string) : null,
          position: position || null,
          category: category as any,
          phone: (fd.get("phone") as string) || null,
          bio: (fd.get("bio") as string) || null,
        });
        toast.success("Jugador actualizado");
      } catch { toast.error("Error al guardar"); }
    });
  }

  async function handleDeactivate() {
    if (!confirm(`¿Dar de baja a ${player!.firstName} ${player!.lastName}?`)) return;
    startTransition(async () => {
      try {
        await deactivatePlayer(id);
        toast.success("Jugador dado de baja");
        router.push("/admin/jugadores");
      } catch { toast.error("Error"); }
    });
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/jugadores" className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">
          {player.firstName} {player.lastName}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" defaultValue={player.firstName} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" defaultValue={player.lastName} required />
              </div>

              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={category} onValueChange={(v) => setCategory(v ?? "PRIMERA")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIMERA">Primera</SelectItem>
                    <SelectItem value="SEGUNDA">Segunda</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dorsal">Dorsal</Label>
                <Input id="dorsal" name="dorsal" type="number" min={1} max={99} defaultValue={player.dorsal ?? ""} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Posición</Label>
                <Select value={position} onValueChange={(v) => setPosition(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin posición" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" defaultValue={player.phone ?? ""} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} defaultValue={player.bio ?? ""} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeactivate}
                disabled={isPending}
              >
                Dar de baja
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estadísticas acumuladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Partidos", value: player.matchStats.length },
              { label: "Goles", value: player.matchStats.reduce((s, m) => s + m.goals, 0) },
              { label: "Asistencias", value: player.matchStats.reduce((s, m) => s + m.assists, 0) },
              { label: "Minutos", value: player.matchStats.reduce((s, m) => s + m.minutesPlayed, 0) },
            ].map((s) => (
              <div key={s.label} className="border rounded-lg py-3">
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
