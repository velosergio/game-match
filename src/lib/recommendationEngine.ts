import type { Game, RatedGame } from "@/lib/types";

export function averageStars(items: RatedGame[]): number {
  if (!items.length) return 0;
  return items.reduce((acc, item) => acc + item.stars, 0) / items.length;
}

export function getFavoriteGenres(items: RatedGame[]): string[] {
  const scoreMap = new Map<string, number>();
  for (const item of items) {
    for (const genre of item.game.genres) {
      scoreMap.set(genre, (scoreMap.get(genre) ?? 0) + item.stars);
    }
  }
  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
}

export function scoreCandidate(candidate: Game, favoriteGenres: string[], avgStars: number): number {
  const genreBonus = candidate.genres.reduce(
    (acc, genre) => (favoriteGenres.includes(genre) ? acc + 12 : acc),
    0,
  );
  const ratingBonus = (candidate.score ?? 70) / 10;
  return genreBonus + ratingBonus + avgStars * 5;
}
