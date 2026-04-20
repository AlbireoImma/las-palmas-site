import Link from "next/link";
import { getPublicUpcomingEvents } from "@/actions/event.actions";
import { getTeamStats } from "@/actions/stats.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BarChart3 } from "lucide-react";
import { EVENT_TYPE_LABELS } from "@/types/enums";

export default async function HomePage() {
  const [events, statsFirst] = await Promise.all([
    getPublicUpcomingEvents(),
    getTeamStats("PRIMERA"),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero — flat Bauhaus color block */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-6 opacity-60">
              Club de Fútbol Amateur
            </p>
            <h1 className="text-6xl font-bold mb-5 leading-none tracking-tight uppercase">
              Las Palmas FC
            </h1>
            <p className="text-base mb-10 opacity-75 max-w-md leading-relaxed">
              Gestión de partidos, jugadores y estadísticas del equipo.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/calendario"
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
              >
                Ver Calendario
              </Link>
              <Link
                href="/equipo"
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                Ver Equipo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14 space-y-14">
        {/* Quick stats */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Primera División — Temporada 2025/26
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-border">
            {[
              { label: "Partidos", value: statsFirst.played },
              { label: "Victorias", value: statsFirst.wins },
              { label: "Empates", value: statsFirst.draws },
              { label: "Derrotas", value: statsFirst.losses },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-6 text-center ${i < 3 ? "border-r-2 border-border" : ""} ${i >= 2 ? "border-t-2 md:border-t-0 border-border" : ""}`}
              >
                <div className="text-4xl font-bold text-primary">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight">Próximos Eventos</h2>
            <Link
              href="/calendario"
              className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="border-2 border-border p-10 text-center text-muted-foreground text-sm">
              No hay eventos programados próximamente.
            </div>
          ) : (
            <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 border-2 border-border">
              {events.slice(0, 6).map((ev: (typeof events)[number], i) => (
                <div
                  key={ev.id}
                  className="p-5 border-b-2 border-r-0 md:border-r-2 border-border last:border-b-0 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-sm leading-tight">{ev.title}</h3>
                    <Badge
                      variant={ev.type === "PARTIDO" ? "default" : "secondary"}
                      className="text-xs font-bold uppercase tracking-wide shrink-0"
                    >
                      {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">
                      {new Date(ev.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                      {" · "}
                      {new Date(ev.date).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {ev.location && <p>{ev.location}</p>}
                    {ev.match && (
                      <p className="font-bold text-foreground uppercase tracking-wide">
                        vs {ev.match.opponentName} — {ev.match.isHome ? "Local" : "Visitante"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick access */}
        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Accesos Rápidos</h2>
          <div className="grid md:grid-cols-3 gap-0 border-2 border-border">
            {[
              {
                href: "/equipo",
                icon: <Users className="h-8 w-8" />,
                title: "Nómina del Equipo",
                desc: "Jugadores de Primera, Segunda y Senior",
              },
              {
                href: "/calendario",
                icon: <Calendar className="h-8 w-8" />,
                title: "Calendario",
                desc: "Partidos, entrenamientos y reuniones",
              },
              {
                href: "/estadisticas",
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Estadísticas",
                desc: "Rendimiento del equipo y jugadores",
              },
            ].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-8 flex flex-col gap-4 hover:bg-primary hover:text-primary-foreground transition-colors group ${i < 2 ? "border-b-2 md:border-b-0 md:border-r-2 border-border" : ""}`}
              >
                <div className="text-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
