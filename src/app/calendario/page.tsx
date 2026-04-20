import { auth } from "@/lib/auth";
import { getAllEvents } from "@/actions/event.actions";
import { hasRole, EVENT_TYPE_LABELS, MATCH_RESULT_LABELS, CATEGORY_LABELS } from "@/types/enums";

export default async function CalendarioPage() {
  const session = await auth();
  const role: string = (session?.user as any)?.role ?? "INVITADO";
  const includePrivate = hasRole(role, "SOCIO");

  const events = await getAllEvents(includePrivate);

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date()).reverse();

  const countByType = (list: typeof events) => ({
    PARTIDO: list.filter((e) => e.type === "PARTIDO").length,
    REUNION: list.filter((e) => e.type === "REUNION").length,
    ENTRENAMIENTO: list.filter((e) => e.type === "ENTRENAMIENTO").length,
  });

  const upcomingCounts = countByType(upcoming);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10 border-b-2 border-border pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-1">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Partidos, entrenamientos y reuniones del club
        </p>
      </div>

      {/* Upcoming */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-foreground">
            Próximos eventos
          </h2>
        </div>
        {upcoming.length > 0 && (
          <p className="text-xs text-muted-foreground mb-5">
            {upcomingCounts.PARTIDO > 0 && `${upcomingCounts.PARTIDO} Partido${upcomingCounts.PARTIDO > 1 ? "s" : ""}`}
            {upcomingCounts.PARTIDO > 0 && (upcomingCounts.REUNION > 0 || upcomingCounts.ENTRENAMIENTO > 0) && " · "}
            {upcomingCounts.REUNION > 0 && `${upcomingCounts.REUNION} Reunión${upcomingCounts.REUNION > 1 ? "es" : ""}`}
            {upcomingCounts.REUNION > 0 && upcomingCounts.ENTRENAMIENTO > 0 && " · "}
            {upcomingCounts.ENTRENAMIENTO > 0 && `${upcomingCounts.ENTRENAMIENTO} Entrenamiento${upcomingCounts.ENTRENAMIENTO > 1 ? "s" : ""}`}
          </p>
        )}
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground border-2 border-border p-6">
            No hay eventos próximos programados.
          </p>
        ) : (
          <div className="border-2 border-border">
            {upcoming.map((ev, i) => (
              <EventRow key={ev.id} ev={ev} last={i === upcoming.length - 1} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-5">
            Eventos pasados
          </h2>
          <div className="border-2 border-border opacity-65">
            {past.slice(0, 20).map((ev, i) => (
              <EventRow key={ev.id} ev={ev} last={i === Math.min(past.length, 20) - 1} past />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Left border color per event type (uses inline style for custom palette colors)
const TYPE_BORDER: Record<string, string> = {
  PARTIDO: "#BB461E",      // rust
  REUNION: "#1B998B",      // teal
  ENTRENAMIENTO: "#6699CC", // steel blue
  OTRO: "#80808080",
};

const RESULT_STYLE: Record<string, string> = {
  VICTORIA: "font-bold text-[#1B998B]",
  EMPATE: "font-bold text-[#6699CC]",
  DERROTA: "font-bold text-[#BB461E]",
};

function EventRow({
  ev,
  past = false,
  last = false,
}: {
  ev: Awaited<ReturnType<typeof getAllEvents>>[number];
  past?: boolean;
  last?: boolean;
}) {
  const borderColor = TYPE_BORDER[ev.type] ?? TYPE_BORDER.OTRO;

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 border-l-4 ${!last ? "border-b-2 border-b-border" : ""}`}
      style={{ borderLeftColor: borderColor }}
    >
      {/* Date block */}
      <div className="md:w-36 shrink-0">
        <p className="text-sm font-bold uppercase tracking-wide">
          {new Date(ev.date).toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(ev.date).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

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
          {ev.category && (
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 bg-secondary text-secondary-foreground">
              {CATEGORY_LABELS[ev.category as keyof typeof CATEGORY_LABELS] ?? ev.category}
            </span>
          )}
          {!ev.isPublic && (
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 bg-muted text-muted-foreground">
              Privado
            </span>
          )}
        </div>

        {ev.match && (
          <p className="text-sm text-muted-foreground">
            vs{" "}
            <span className="font-bold text-foreground">{ev.match.opponentName}</span>
            {" — "}
            {ev.match.isHome ? "Local" : "Visitante"}
            {ev.match.result && (
              <span className={`ml-2 ${RESULT_STYLE[ev.match.result] ?? ""}`}>
                {ev.match.goalsFor}–{ev.match.goalsAgainst}{" "}
                ({MATCH_RESULT_LABELS[ev.match.result as keyof typeof MATCH_RESULT_LABELS]})
              </span>
            )}
          </p>
        )}

        {ev.location && (
          <p className="text-xs text-muted-foreground mt-0.5">{ev.location}</p>
        )}
      </div>
    </div>
  );
}
