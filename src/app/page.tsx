import Link from "next/link";
import { getPublicUpcomingEvents } from "@/actions/event.actions";
import { getTeamStats } from "@/actions/stats.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { Calendar, Users, BarChart3 } from "lucide-react";
import { EVENT_TYPE_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [events, statsFirst] = await Promise.all([
    getPublicUpcomingEvents(),
    getTeamStats("PRIMERA"),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-4xl font-bold mb-3">Las Palmas FC</h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Club de fútbol amateur. Gestión de partidos, jugadores y estadísticas del equipo.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/calendario"
              className={cn(buttonVariants({ size: "lg" }), "bg-white text-green-800 hover:bg-green-50")}
            >
              Ver Calendario
            </Link>
            <Link
              href="/equipo"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white text-white hover:bg-green-700")}
            >
              Ver Equipo
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Quick stats */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Primera División — Temporada 2025/26</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Partidos", value: statsFirst.played },
              { label: "Victorias", value: statsFirst.wins },
              { label: "Empates", value: statsFirst.draws },
              { label: "Derrotas", value: statsFirst.losses },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Próximos Eventos</h2>
            <Link href="/calendario" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Ver todos
            </Link>
          </div>
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                No hay eventos programados próximamente.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((ev: (typeof events)[number]) => (
                <Card key={ev.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{ev.title}</CardTitle>
                      <Badge
                        variant={ev.type === "PARTIDO" ? "default" : "secondary"}
                        className={ev.type === "PARTIDO" ? "bg-green-700" : ""}
                      >
                        {EVENT_TYPE_LABELS[ev.type as keyof typeof EVENT_TYPE_LABELS] ?? ev.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-1">
                    <p>
                      📅{" "}
                      {new Date(ev.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    <p>
                      🕐{" "}
                      {new Date(ev.date).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {ev.location && <p>📍 {ev.location}</p>}
                    {ev.match && (
                      <p className="font-medium text-gray-800">
                        vs {ev.match.opponentName} — {ev.match.isHome ? "Local" : "Visitante"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Nav cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Accesos rápidos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                href: "/equipo",
                icon: <Users className="h-10 w-10 text-green-600 mx-auto" />,
                title: "Nómina del Equipo",
                desc: "Jugadores de Primera, Segunda y Senior",
              },
              {
                href: "/calendario",
                icon: <Calendar className="h-10 w-10 text-green-600 mx-auto" />,
                title: "Calendario",
                desc: "Partidos, entrenamientos y reuniones",
              },
              {
                href: "/estadisticas",
                icon: <BarChart3 className="h-10 w-10 text-green-600 mx-auto" />,
                title: "Estadísticas",
                desc: "Rendimiento del equipo y jugadores",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
                  <CardContent className="pt-6 text-center space-y-3">
                    {item.icon}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
