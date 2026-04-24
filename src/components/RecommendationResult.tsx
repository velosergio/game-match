import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Game } from "@/lib/types";

interface Props {
  game: Game;
  average: number;
  favoriteGenres: string[];
  onRestart: () => void;
}

export function RecommendationResult({ game, average, favoriteGenres, onRestart }: Props) {
  const cover = game.coverUrl ?? "https://placehold.co/960x540?text=Recommended";

  return (
    <Card className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-cyan-500/35 bg-black/50 text-cyan-50">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url("${cover}")` }}
        aria-hidden
      />
      <div className="absolute inset-0 backdrop-blur-md" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/72 to-slate-950/95" aria-hidden />

      <CardHeader className="relative z-10">
        <CardDescription className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">Final Match</CardDescription>
        <CardTitle className="text-3xl font-semibold text-cyan-50">Deberias probar: {game.title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <img
          src={cover}
          alt={`Portada de ${game.title}`}
          className="h-64 w-full rounded-xl border border-cyan-300/50 bg-black/40 object-contain p-2"
        />
        {game.descriptionInSpanish === false && (
          <p className="text-xs font-medium uppercase tracking-wide text-amber-300">Descripcion original</p>
        )}
        <p className="text-sm text-cyan-100/90">{game.description}</p>
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-cyan-400/30 bg-cyan-950/35 p-3 text-sm">
          <p className="text-cyan-100/75">Promedio de tus estrellas:</p>
          <p className="font-semibold text-cyan-50">{average.toFixed(1)} / 5</p>
          <p className="text-cyan-100/75">Tus generos favoritos:</p>
          <p className="font-semibold text-cyan-50">{favoriteGenres.join(", ") || "Variado"}</p>
        </div>
        <Button className="w-full border-cyan-300/55 bg-cyan-400/10 text-cyan-50 hover:bg-cyan-300/20" variant="outline" onClick={onRestart}>
          <RotateCcw className="size-4" />
          Volver a empezar
        </Button>
      </CardContent>
    </Card>
  );
}
