"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlayer } from "@/actions/player.actions";
import { getUsers } from "@/actions/auth.actions";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { POSITIONS } from "@/types/enums";
import { toast } from "sonner";

type Users = Awaited<ReturnType<typeof getUsers>>;

export default function NuevoJugadorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<Users>([]);
  const [category, setCategory] = useState<string>("PRIMERA");
  const [userId, setUserId] = useState<string>("");
  const [position, setPosition] = useState<string>("");

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) { toast.error("Selecciona un usuario"); return; }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createPlayer({
          userId,
          firstName: fd.get("firstName") as string,
          lastName: fd.get("lastName") as string,
          dorsal: (fd.get("dorsal") as string) ? parseInt(fd.get("dorsal") as string) : null,
          position: position || null,
          category: category as any,
          phone: (fd.get("phone") as string) || null,
        });
        toast.success("Jugador creado");
        router.push("/admin/jugadores");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/jugadores" className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Jugador</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Usuario del sistema *</Label>
                <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => !u.player)
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name ?? u.email} ({u.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">El usuario debe registrarse primero. Solo aparecen usuarios sin perfil de jugador.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" name="lastName" required />
              </div>

              <div className="space-y-1.5">
                <Label>Categoría *</Label>
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
                <Input id="dorsal" name="dorsal" type="number" min={1} max={99} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Posición</Label>
                <Select value={position} onValueChange={(v) => setPosition(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una posición..." />
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
                <Input id="phone" name="phone" placeholder="+34 600 000 000" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isPending}>
                {isPending ? "Creando..." : "Crear jugador"}
              </Button>
              <Link href="/admin/jugadores" className={buttonVariants({ variant: "outline" })}>
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
