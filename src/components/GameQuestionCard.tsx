import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import type { Game } from "@/lib/types";

interface Props {
  game: Game;
  currentQuestion: number;
  totalQuestions: number;
  stars: number;
  onStarsChange: (stars: number) => void;
  onNext: () => void;
}

export function GameQuestionCard({
  game,
  currentQuestion,
  totalQuestions,
  stars,
  onStarsChange,
  onNext,
}: Props) {
  return (
    <Card className="grid-surface w-full max-w-2xl overflow-hidden rounded-2xl">
      <CardHeader>
        <CardDescription className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">
          Pregunta {currentQuestion} de {totalQuestions}
        </CardDescription>
        <CardTitle className="text-2xl text-cyan-50">{game.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <img
          src={game.coverUrl ?? "https://placehold.co/640x360?text=Game"}
          alt={`Portada de ${game.title}`}
          className="h-52 w-full rounded-xl border border-cyan-400/30 object-cover shadow-[0_0_30px_rgba(34,211,238,0.22)]"
        />
        {game.descriptionInSpanish === false && (
          <p className="text-xs font-medium uppercase tracking-wide text-amber-300">Descripcion original</p>
        )}
        <p className="text-sm leading-relaxed text-cyan-100/85">{game.description}</p>
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/25 p-4">
          <p className="mb-2 text-center text-sm text-cyan-100">¿Cuanto te llama la atencion este juego?</p>
          <StarRating value={stars} onChange={onStarsChange} />
        </div>
        <Button
          className="grid-glow w-full border border-cyan-300/50 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-300/30"
          size="lg"
          disabled={stars === 0}
          onClick={onNext}
        >
          Siguiente
        </Button>
      </CardContent>
    </Card>
  );
}
