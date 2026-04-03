import Link from "next/link";
import { getPlayersByCategory } from "@/actions/player.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS } from "@/types/enums";

export default async function EquipoPage() {
  const [primera, segunda, senior] = await Promise.all([
    getPlayersByCategory("PRIMERA"),
    getPlayersByCategory("SEGUNDA"),
    getPlayersByCategory("SENIOR"),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Nómina del Equipo</h1>
      <p className="text-gray-500 mb-8">Jugadores activos por categoría</p>

      <Tabs defaultValue="PRIMERA">
        <TabsList className="mb-6">
          <TabsTrigger value="PRIMERA">Primera ({primera.length})</TabsTrigger>
          <TabsTrigger value="SEGUNDA">Segunda ({segunda.length})</TabsTrigger>
          <TabsTrigger value="SENIOR">Senior ({senior.length})</TabsTrigger>
        </TabsList>

        {(
          [
            { value: "PRIMERA", players: primera },
            { value: "SEGUNDA", players: segunda },
            { value: "SENIOR", players: senior },
          ] as const
        ).map(({ value, players }) => (
          <TabsContent key={value} value={value}>
            {players.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">
                No hay jugadores registrados en esta categoría.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {players.map((player) => (
                  <Link key={player.id} href={`/jugadores/${player.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
                      <CardContent className="pt-5 pb-4 space-y-2">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarFallback className="bg-green-100 text-green-800 text-lg font-bold">
                            {player.dorsal ?? player.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm leading-tight">
                            {player.firstName} {player.lastName}
                          </p>
                          {player.position && (
                            <p className="text-xs text-gray-500 mt-0.5">{player.position}</p>
                          )}
                        </div>
                        {player.dorsal && (
                          <Badge variant="secondary" className="text-xs">
                            #{player.dorsal}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
