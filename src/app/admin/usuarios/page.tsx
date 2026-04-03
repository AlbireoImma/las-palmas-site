"use client";

import { useEffect, useState, useTransition } from "react";
import { getUsers, updateUserRole } from "@/actions/auth.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/types/enums";
import type { Role } from "@/types/enums";
import { toast } from "sonner";

type Users = Awaited<ReturnType<typeof getUsers>>;

const roleBadge: Record<Role, string> = {
  INVITADO: "bg-gray-100 text-gray-700",
  JUGADOR: "bg-blue-100 text-blue-800",
  SOCIO: "bg-purple-100 text-purple-800",
  ADMINISTRADOR: "bg-green-100 text-green-800",
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<Users>([]);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const data = await getUsers();
    setUsers(data);
  }

  useEffect(() => { refresh(); }, []);

  async function handleRoleChange(userId: string, role: Role) {
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        toast.success("Rol actualizado");
        await refresh();
      } catch { toast.error("Error"); }
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Asigna roles a los usuarios registrados en el sistema
        </p>
      </div>

      {/* Role legend */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
              <div key={role} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[role]}`}>
                  {label}
                </span>
                <span className="text-gray-500 text-xs">
                  {role === "INVITADO" && "Solo lectura pública"}
                  {role === "JUGADOR" && "Perfil + asistencia"}
                  {role === "SOCIO" && "Acceso a reuniones"}
                  {role === "ADMINISTRADOR" && "Acceso completo"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead>Rol actual</TableHead>
                <TableHead>Cambiar rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-500">{user.email}</TableCell>
                  <TableCell className="text-sm">
                    {user.player
                      ? `${user.player.firstName} ${user.player.lastName} (${user.player.category})`
                      : <span className="text-gray-400">Sin perfil</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role as Role] ?? ""}`}>
                      {ROLE_LABELS[user.role as Role] ?? user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => v && handleRoleChange(user.id, v as Role)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INVITADO">Invitado</SelectItem>
                        <SelectItem value="JUGADOR">Jugador</SelectItem>
                        <SelectItem value="SOCIO">Socio</SelectItem>
                        <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
