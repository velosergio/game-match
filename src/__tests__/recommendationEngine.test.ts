import { averageStars, getFavoriteGenres, scoreCandidate } from "@/lib/recommendationEngine";
import type { RatedGame } from "@/lib/types";

const ratedGames: RatedGame[] = [
  {
    game: { id: "1", title: "A", description: "", platform: "PC", genres: ["Accion", "Indie"], score: 90 },
    stars: 5,
  },
  {
    game: { id: "2", title: "B", description: "", platform: "PC", genres: ["Indie", "RPG"], score: 82 },
    stars: 4,
  },
];

describe("recommendationEngine", () => {
  it("calcula promedio correctamente", () => {
    expect(averageStars(ratedGames)).toBe(4.5);
  });

  it("prioriza generos mejor puntuados", () => {
    expect(getFavoriteGenres(ratedGames)[0]).toBe("Indie");
  });

  it("asigna mayor score a candidato alineado con gustos", () => {
    const favoriteGenres = getFavoriteGenres(ratedGames);
    const avg = averageStars(ratedGames);
    const aligned = scoreCandidate(
      { id: "3", title: "C", description: "", platform: "PC", genres: ["Indie"], score: 85 },
      favoriteGenres,
      avg,
    );
    const offGenre = scoreCandidate(
      { id: "4", title: "D", description: "", platform: "PC", genres: ["Deportes"], score: 85 },
      favoriteGenres,
      avg,
    );
    expect(aligned).toBeGreaterThan(offGenre);
  });
});
