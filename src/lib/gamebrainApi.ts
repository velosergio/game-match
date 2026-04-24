import type { Game, Platform, RatedGame } from "@/lib/types";

const API_URL = "/api/gamebrain";
const HAS_TOKEN = Boolean(import.meta.env.VITE_GAMEBRAIN_API_KEY);
const API_KEY = import.meta.env.VITE_GAMEBRAIN_API_KEY;
const SPANISH_PLACEHOLDER = "Sin descripcion disponible.";

function withApiKey(url: string): string {
  if (!API_KEY) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}api-key=${encodeURIComponent(API_KEY)}`;
}

function withSpanishLocale(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=es&locale=es`;
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.7",
  };
  if (API_KEY) {
    return { ...headers, "x-api-key": API_KEY };
  }
  return headers;
}

const FALLBACK: Game[] = [
  { id: "1", title: "Hades", description: "Roguelike de accion rapido.", platform: "PC", genres: ["Roguelike", "Accion"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2m73.jpg", score: 93 },
  { id: "2", title: "Celeste", description: "Plataformas desafiante y emotivo.", platform: "Nintendo", genres: ["Plataformas", "Indie"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg", score: 92 },
  { id: "3", title: "Forza Horizon 5", description: "Carreras arcade de mundo abierto.", platform: "Xbox", genres: ["Carreras", "Mundo abierto"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3z9r.jpg", score: 90 },
  { id: "4", title: "Ghost of Tsushima", description: "Accion y sigilo en Japon feudal.", platform: "PlayStation", genres: ["Accion", "Aventura"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2crj.jpg", score: 88 },
  { id: "5", title: "Hollow Knight", description: "Metroidvania atmosferico y retador.", platform: "PC", genres: ["Metroidvania", "Indie"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg", score: 91 },
  { id: "6", title: "Hi-Fi Rush", description: "Accion ritmica con mucho estilo.", platform: "Xbox", genres: ["Accion", "Ritmo"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6a8c.jpg", score: 89 },
  { id: "7", title: "Astro Bot", description: "Plataformas creativo y carismatico.", platform: "PlayStation", genres: ["Plataformas", "Familia"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8fju.jpg", score: 94 },
  { id: "8", title: "The Legend of Zelda: Tears of the Kingdom", description: "Aventura de exploracion y fisicas.", platform: "Nintendo", genres: ["Aventura", "Mundo abierto"], coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6hkn.jpg", score: 96 },
];

function randomUniqueGames(games: Game[], amount: number) {
  const shuffled = [...games].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, amount);
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}

function extractApiGames(payload: unknown): Array<Record<string, unknown>> {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;
  return asRecordArray(body.data ?? body.results ?? body.games);
}

function takeUniqueGames(primary: Game[], fallback: Game[], amount: number): Game[] {
  const seen = new Set<string>();
  const merged = [...primary, ...fallback].filter((game) => {
    if (seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
  return randomUniqueGames(merged, amount);
}

function hasMissingDescription(game: Game): boolean {
  return !game.description || game.description.trim().toLowerCase() === SPANISH_PLACEHOLDER.toLowerCase();
}

function sanitizeDescription(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  if (["n/a", "null", "undefined", "-", "--"].includes(clean.toLowerCase())) return undefined;
  return clean;
}

function isLikelySpanish(text: string): boolean {
  const normalized = text.toLowerCase();
  const markers = [" el ", " la ", " los ", " las ", " para ", " con ", " una ", " un ", " juego ", " aventura ", " accion ", " mundo "];
  const markerHits = markers.reduce((count, marker) => (normalized.includes(marker) ? count + 1 : count), 0);
  const accentHits = (normalized.match(/[áéíóúñ]/g) ?? []).length;
  return markerHits >= 2 || accentHits >= 1;
}

function needsSpanishEnrichment(game: Game): boolean {
  if (hasMissingDescription(game)) return true;
  return !isLikelySpanish(game.description);
}

async function enrichGameDescription(game: Game, platform: Platform): Promise<Game> {
  if (!HAS_TOKEN || !needsSpanishEnrichment(game)) return game;
  const numericId = Number(game.id);
  if (!Number.isFinite(numericId)) return game;

  try {
    const response = await fetch(withApiKey(withSpanishLocale(`${API_URL}/games/${numericId}`)), {
      headers: authHeaders(),
    });
    if (!response.ok) return game;
    const payload = (await response.json()) as Record<string, unknown>;
    const detailed = normalizeGame(payload, platform);
    if (!hasMissingDescription(detailed)) {
      return {
        ...game,
        description: detailed.description,
        descriptionInSpanish: isLikelySpanish(detailed.description),
      };
    }
    return game;
  } catch {
    return game;
  }
}

function normalizeGame(raw: Record<string, unknown>, platform: Platform): Game {
  const cover = raw.cover;
  const coverUrl =
    typeof raw.coverUrl === "string"
      ? raw.coverUrl
      : cover && typeof cover === "object" && typeof (cover as Record<string, unknown>).url === "string"
        ? String((cover as Record<string, unknown>).url)
        : undefined;

  const rawGenres = Array.isArray(raw.genres) ? raw.genres : [];
  const parsedGenres = rawGenres
    .map((genre) => {
      if (typeof genre === "string") return genre;
      if (genre && typeof genre === "object") {
        const name = (genre as Record<string, unknown>).name;
        if (typeof name === "string") return name;
      }
      return "";
    })
    .filter(Boolean);
  const genreString = typeof raw.genre === "string" ? raw.genre : "";
  const genreFromString = genreString
    .split(/[|,/]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const genres = [...new Set([...parsedGenres, ...genreFromString])];

  const rating = raw.rating;
  const score =
    typeof rating === "number"
      ? rating
      : rating && typeof rating === "object" && typeof (rating as Record<string, unknown>).rating === "number"
        ? Number((rating as Record<string, unknown>).rating)
        : typeof raw.computed_rating === "number"
          ? raw.computed_rating
          : undefined;

  const description =
    sanitizeDescription(raw.description) ??
    sanitizeDescription(raw.shortDescription) ??
    sanitizeDescription(raw.summary) ??
    SPANISH_PLACEHOLDER;

  return {
    id: String(raw.id ?? crypto.randomUUID()),
    title: String(raw.name ?? raw.title ?? "Juego sin titulo"),
    description,
    platform,
    genres,
    coverUrl: coverUrl ?? (typeof raw.image === "string" ? raw.image : undefined),
    score,
    descriptionInSpanish: isLikelySpanish(description),
  };
}

export async function fetchRandomGames(platform: Platform, amount = 5): Promise<Game[]> {
  if (!HAS_TOKEN) {
    return randomUniqueGames(FALLBACK.filter((g) => g.platform === platform), amount);
  }

  try {
    const endpoint = withApiKey(withSpanishLocale(`${API_URL}/games?query=${encodeURIComponent(platform)}&limit=10`));
    const response = await fetch(endpoint, {
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("No se pudo consultar la API de GameBrain.");

    const payload = await response.json();
    const rawItems = extractApiGames(payload).map((item) => normalizeGame(item, platform));
    const items = await Promise.all(rawItems.map((game) => enrichGameDescription(game, platform)));
    const fallbackForPlatform = FALLBACK.filter((g) => g.platform === platform);
    return takeUniqueGames(items, fallbackForPlatform, amount);
  } catch {
    return randomUniqueGames(FALLBACK.filter((g) => g.platform === platform), amount);
  }
}

export async function fetchRecommendedGame(platform: Platform, ratedGames: RatedGame[]): Promise<Game> {
  const favoriteGenres = ratedGames
    .filter((entry) => entry.stars >= 4)
    .flatMap((entry) => entry.game.genres)
    .slice(0, 3);

  if (!HAS_TOKEN) {
    const candidates = FALLBACK.filter((g) => g.platform === platform);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  try {
    const queryText = [platform, ...favoriteGenres].filter(Boolean).join(" ");
    const query = new URLSearchParams({
      query: queryText || platform,
      limit: "1",
      sort: "computed_rating",
      "sort-order": "desc",
    });
    const response = await fetch(withApiKey(withSpanishLocale(`${API_URL}/games?${query.toString()}`)), {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("No se pudo obtener recomendacion de API.");
    const payload = await response.json();
    const recommended = extractApiGames(payload)[0];
    if (!recommended) throw new Error("Sin recomendacion API.");
    const normalized = normalizeGame(recommended, platform);
    return enrichGameDescription(normalized, platform);
  } catch {
    const candidates = FALLBACK.filter((g) => g.platform === platform);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
