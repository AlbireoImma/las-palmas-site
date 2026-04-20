"use client";

import { useEffect, useState, useTransition } from "react";
import { getMyAttendances, confirmAttendance } from "@/actions/attendance.actions";
import { getPublicUpcomingEvents } from "@/actions/event.actions";
import { EVENT_TYPE_LABELS } from "@/types/enums";
import { toast } from "sonner";

type Attendance = Awaited<ReturnType<typeof getMyAttendances>>[number];
type UpcomingEvent = Awaited<ReturnType<typeof getPublicUpcomingEvents>>[number];

// Left border color per event type (matches calendario)
const TYPE_BORDER: Record<string, string> = {
  PARTIDO: "#BB461E",
  REUNION: "#1B998B",
  ENTRENAMIENTO: "#6699CC",
  OTRO: "#80808080",
};

export default function AsistenciaPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyAttendances().then(setAttendances);
    getPublicUpcomingEvents().then(setUpcomingEvents);
  }, []);

  // Compute attendance rate from past events
  const pastAttendances = attendances.filter(
    (a) => a.attended !== null && a.attended !== undefined
  );
  const attendedCount = pastAttendances.filter((a) => a.attended === true).length;
  const attendanceRate =
    pastAttendances.length > 0
      ? Math.round((attendedCount / pastAttendances.length) * 100)
      : null;

  async function handleConfirm(eventId: string, confirmed: boolean) {
    const note = !confirmed ? notes[eventId] : undefined;
    startTransition(async () => {
      try {
        await confirmAttendance(eventId, confirmed, note);
        const updated = await getMyAttendances();
        setAttendances(updated);
        toast.success(confirmed ? "Confirmaste asistencia" : "Marcaste ausencia");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-10 border-b-2 border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Mi Asistencia</h1>
          <p className="text-sm text-muted-foreground">
            Confirma tu participación en los próximos eventos
          </p>
        </div>
        {attendanceRate !== null && (
          <div className="text-right shrink-0 ml-6">
            <div className="text-3xl font-bold text-primary">{attendanceRate}%</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Asistencia
            </div>
          </div>
        )}
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="border-2 border-border p-10 text-center text-sm text-muted-foreground">
          No hay eventos próximos.
        </div>
      ) : (
        <div className="border-2 border-border">
          {upcomingEvents.map((ev, i) => {
            const att = attendances.find((a) => a.eventId === ev.id);
            const isConfirmed = att?.confirmed === true;
            const isDeclined = att?.confirmed === false;
            const borderColor = TYPE_BORDER[ev.type] ?? TYPE_BORDER.OTRO;
            const isLast = i === upcomingEvents.length - 1;

            return (
              <div
                key={ev.id}
                className={`border-l-4 p-5 ${!isLast ? "border-b-2 border-b-border" : ""}`}
                style={{ borderLeftColor: borderColor }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm">{ev.title}</span>
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 text-white"
                        style={{ backgroundColor: borderColor }}
                      >
                        {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground mt-0.5">{ev.location}</p>
                    )}

                    {/* Note textarea — shown when declining */}
                    {isDeclined && (
                      <div className="mt-3">
                        <textarea
                          className="w-full border-2 border-border bg-background text-foreground text-xs p-2 resize-none focus:outline-none focus:border-ring"
                          rows={2}
                          placeholder="Motivo de la ausencia (opcional)..."
                          value={notes[ev.id] ?? att?.note ?? ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [ev.id]: e.target.value }))
                          }
                          onBlur={() => handleConfirm(ev.id, false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleConfirm(ev.id, true)}
                      disabled={isPending}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-colors disabled:opacity-50 ${
                        isConfirmed
                          ? "bg-[#1B998B] border-[#1B998B] text-white"
                          : "border-border text-muted-foreground hover:border-[#1B998B] hover:text-[#1B998B]"
                      }`}
                    >
                      Voy
                    </button>
                    <button
                      onClick={() => handleConfirm(ev.id, false)}
                      disabled={isPending}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-colors disabled:opacity-50 ${
                        isDeclined
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      No voy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
