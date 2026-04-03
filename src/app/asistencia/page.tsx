"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { getMyAttendances, confirmAttendance } from "@/actions/attendance.actions";
import { getPublicUpcomingEvents } from "@/actions/event.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS } from "@/types/enums";
import { toast } from "sonner";

type Attendance = Awaited<ReturnType<typeof getMyAttendances>>[number];
type UpcomingEvent = Awaited<ReturnType<typeof getPublicUpcomingEvents>>[number];

export default function AsistenciaPage() {
  const { data: session } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyAttendances().then(setAttendances);
    getPublicUpcomingEvents().then(setUpcomingEvents);
  }, []);

  const attendedEventIds = new Set(attendances.map((a) => a.eventId));

  async function handleConfirm(eventId: string, confirmed: boolean) {
    startTransition(async () => {
      try {
        await confirmAttendance(eventId, confirmed);
        const updated = await getMyAttendances();
        setAttendances(updated);
        toast.success(confirmed ? "Confirmaste asistencia" : "Marcaste ausencia");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Mi Asistencia</h1>
      <p className="text-gray-500 mb-8">Confirma tu participación en los próximos eventos</p>

      {upcomingEvents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No hay eventos próximos.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingEvents.map((ev) => {
            const att = attendances.find((a) => a.eventId === ev.id);
            return (
              <Card key={ev.id}>
                <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{ev.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      📅{" "}
                      {new Date(ev.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      —{" "}
                      {new Date(ev.date).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {ev.location && (
                      <p className="text-xs text-gray-400">📍 {ev.location}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(ev.id, true)}
                      disabled={isPending}
                      className={
                        att?.confirmed === true
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-green-100"
                      }
                    >
                      ✓ Voy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(ev.id, false)}
                      disabled={isPending}
                      className={
                        att?.confirmed === false
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100"
                      }
                    >
                      ✗ No voy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
