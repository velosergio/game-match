export type Platform = "PC" | "PlayStation" | "Xbox" | "Nintendo";

export interface Game {
  id: string;
  title: string;
  description: string;
  descriptionInSpanish?: boolean;
  platform: Platform;
  genres: string[];
  coverUrl?: string;
  score?: number;
}

export interface RatedGame {
  game: Game;
  stars: number;
}
