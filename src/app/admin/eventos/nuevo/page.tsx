"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/event.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string>("PARTIDO");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dateStr = fd.get("date") as string;
    const timeStr = fd.get("time") as string;

    startTransition(async () => {
      try {
        await createEvent({
          title: fd.get("title") as string,
          type: type as any,
          date: new Date(`${dateStr}T${timeStr || "00:00"}`),
          location: (fd.get("location") as string) || undefined,
          description: (fd.get("description") as string) || undefined,
          isPublic: fd.get("isPublic") === "true",
          category: ((fd.get("category") as string) || undefined) as any,
          opponentName: type === "PARTIDO" ? (fd.get("opponentName") as string) : undefined,
          isHome: type === "PARTIDO" ? fd.get("isHome") === "true" : undefined,
        });
        toast.success("Evento creado");
        router.push("/admin/eventos");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error al crear evento");
      }
    });
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/eventos" className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Evento</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" name="title" required placeholder="ej. Jornada 12 vs CD Atlético" />
              </div>

              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={type} onValueChange={(v) => setType(v ?? "PARTIDO")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTIDO">Partido</SelectItem>
                    <SelectItem value="ENTRENAMIENTO">Entrenamiento</SelectItem>
                    <SelectItem value="REUNION">Reunión</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select name="category" defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="PRIMERA">Primera</SelectItem>
                    <SelectItem value="SEGUNDA">Segunda</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Fecha *</Label>
                <Input id="date" name="date" type="date" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" name="time" type="time" defaultValue="10:00" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="location">Lugar</Label>
                <Input id="location" name="location" placeholder="Estadio Municipal, Campo Nº2..." />
              </div>

              {type === "PARTIDO" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="opponentName">Equipo rival *</Label>
                    <Input id="opponentName" name="opponentName" placeholder="CD Ejemplo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>¿Local o visitante?</Label>
                    <Select name="isHome" defaultValue="true">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Local</SelectItem>
                        <SelectItem value="false">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" rows={3} placeholder="Detalles adicionales..." />
              </div>

              <div className="space-y-1.5">
                <Label>Visibilidad</Label>
                <Select name="isPublic" defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Público (visible para todos)</SelectItem>
                    <SelectItem value="false">Privado (solo socios y admins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isPending}>
                {isPending ? "Creando..." : "Crear evento"}
              </Button>
              <Link href="/admin/eventos" className={buttonVariants({ variant: "outline" })}>
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
