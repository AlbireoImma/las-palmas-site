import { auth } from "@/lib/auth";
import { getAllEvents } from "@/actions/event.actions";
import { hasRole, EVENT_TYPE_LABELS, MATCH_RESULT_LABELS, CATEGORY_LABELS } from "@/types/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CalendarioPage() {
  const session = await auth();
  const role: string = (session?.user as any)?.role ?? "INVITADO";
  const includePrivate = hasRole(role, "SOCIO");

  const events = await getAllEvents(includePrivate);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date()).reverse();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Calendario</h1>
      <p className="text-gray-500 mb-8">Partidos, entrenamientos y reuniones del club</p>

      {/* Upcoming */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-green-700">Próximos eventos</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No hay eventos próximos programados.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((ev) => (
              <EventRow key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-500">Eventos pasados</h2>
          <div className="space-y-3">
            {past.slice(0, 20).map((ev) => (
              <EventRow key={ev.id} ev={ev} past />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventRow({
  ev,
  past = false,
}: {
  ev: Awaited<ReturnType<typeof getAllEvents>>[number];
  past?: boolean;
}) {
  const typeBadgeColor: Record<string, string> = {
    PARTIDO: "bg-green-700 text-white",
    ENTRENAMIENTO: "bg-blue-100 text-blue-800",
    REUNION: "bg-purple-100 text-purple-800",
    OTRO: "bg-gray-100 text-gray-700",
  };

  const resultColor: Record<string, string> = {
    VICTORIA: "text-green-700 font-bold",
    EMPATE: "text-yellow-600 font-bold",
    DERROTA: "text-red-600 font-bold",
  };

  return (
    <Card className={past ? "opacity-70" : ""}>
      <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-3">
        {/* Date */}
        <div className="md:w-40 shrink-0 text-sm">
          <p className="font-semibold">
            {new Date(ev.date).toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-gray-500">
            {new Date(ev.date).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{ev.title}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                typeBadgeColor[ev.type] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
            </span>
            {ev.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {CATEGORY_LABELS[ev.category as keyof typeof CATEGORY_LABELS] ?? ev.category}
              </span>
            )}
            {!ev.isPublic && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Privado
              </span>
            )}
          </div>
          {ev.match && (
            <p className="text-sm text-gray-600 mt-0.5">
              vs {ev.match.opponentName} — {ev.match.isHome ? "Local" : "Visitante"}
              {ev.match.result && (
                <span className={`ml-2 ${resultColor[ev.match.result] ?? ""}`}>
                  {ev.match.goalsFor}–{ev.match.goalsAgainst} (
                  {MATCH_RESULT_LABELS[ev.match.result as keyof typeof MATCH_RESULT_LABELS]})
                </span>
              )}
            </p>
          )}
          {ev.location && (
            <p className="text-xs text-gray-500 mt-0.5">📍 {ev.location}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
