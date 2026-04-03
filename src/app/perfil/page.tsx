"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { getPlayerByUserId, updatePlayer } from "@/actions/player.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { CATEGORY_LABELS } from "@/types/enums";
import { toast } from "sonner";

type Player = Awaited<ReturnType<typeof getPlayerByUserId>>;

export default function PerfilPage() {
  const { data: session } = useSession();
  const [player, setPlayer] = useState<Player>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (userId) {
      getPlayerByUserId(userId).then(setPlayer);
    }
  }, [session]);

  if (!session) return <div className="container mx-auto px-4 py-20 text-center text-gray-500">Cargando...</div>;
  if (player === null) return <div className="container mx-auto px-4 py-20 text-center text-gray-500">Cargando perfil...</div>;
  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-2">No tienes un perfil de jugador asignado.</p>
        <p className="text-sm text-gray-400">Contacta con el administrador del club.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePlayer(player!.id, {
          bio: fd.get("bio") as string || null,
          phone: fd.get("phone") as string || null,
        });
        toast.success("Perfil actualizado");
        setSaved(true);
      } catch {
        toast.error("Error al guardar");
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del jugador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nombre</span>
            <span className="font-medium">{player.firstName} {player.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Dorsal</span>
            <span>#{player.dorsal ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Posición</span>
            <span>{player.position ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Categoría</span>
            <Badge className="bg-green-700">
              {CATEGORY_LABELS[player.category as keyof typeof CATEGORY_LABELS] ?? player.category}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={player.phone ?? ""}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio / Descripción</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={player.bio ?? ""}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
              />
            </div>
            <Button
              type="submit"
              className="bg-green-700 hover:bg-green-800"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
