// Enum constants — used as type-safe string literals throughout the app.
// SQLite stores these as TEXT; Prisma validates them in TypeScript.

export const Role = {
  INVITADO: "INVITADO",
  JUGADOR: "JUGADOR",
  SOCIO: "SOCIO",
  ADMINISTRADOR: "ADMINISTRADOR",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Category = {
  PRIMERA: "PRIMERA",
  SEGUNDA: "SEGUNDA",
  SENIOR: "SENIOR",
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const EventType = {
  PARTIDO: "PARTIDO",
  ENTRENAMIENTO: "ENTRENAMIENTO",
  REUNION: "REUNION",
  OTRO: "OTRO",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const MatchResult = {
  VICTORIA: "VICTORIA",
  EMPATE: "EMPATE",
  DERROTA: "DERROTA",
} as const;
export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];

export const CardType = {
  AMARILLA: "AMARILLA",
  ROJA: "ROJA",
  DOBLE_AMARILLA: "DOBLE_AMARILLA",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<Role, number> = {
  INVITADO: 0,
  JUGADOR: 1,
  SOCIO: 2,
  ADMINISTRADOR: 3,
};

export function hasRole(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0;
  return userLevel >= ROLE_HIERARCHY[requiredRole];
}

// Human-readable labels
export const ROLE_LABELS: Record<Role, string> = {
  INVITADO: "Invitado",
  JUGADOR: "Jugador",
  SOCIO: "Socio",
  ADMINISTRADOR: "Administrador",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  PRIMERA: "Primera",
  SEGUNDA: "Segunda",
  SENIOR: "Senior",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  PARTIDO: "Partido",
  ENTRENAMIENTO: "Entrenamiento",
  REUNION: "Reunión",
  OTRO: "Otro",
};

export const MATCH_RESULT_LABELS: Record<MatchResult, string> = {
  VICTORIA: "Victoria",
  EMPATE: "Empate",
  DERROTA: "Derrota",
};

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  AMARILLA: "Tarjeta Amarilla",
  ROJA: "Tarjeta Roja",
  DOBLE_AMARILLA: "Doble Amarilla",
};

export const POSITIONS = [
  "Portero",
  "Defensa Central",
  "Lateral Derecho",
  "Lateral Izquierdo",
  "Mediocentro Defensivo",
  "Mediocentro",
  "Mediocentro Ofensivo",
  "Extremo Derecho",
  "Extremo Izquierdo",
  "Delantero Centro",
  "Segundo Delantero",
] as const;
