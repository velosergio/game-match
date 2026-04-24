import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlatformSelector } from "@/components/PlatformSelector";
import { GameQuestionCard } from "@/components/GameQuestionCard";
import { RecommendationResult } from "@/components/RecommendationResult";
import { Progress } from "@/components/ui/progress";
import { fetchRandomGames, fetchRecommendedGame } from "@/lib/gamebrainApi";
import { averageStars, getFavoriteGenres } from "@/lib/recommendationEngine";
import type { Game, Platform, RatedGame } from "@/lib/types";

type Step = "platform" | "questions" | "result";

export default function App() {
  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState<Platform>();
  const [games, setGames] = useState<Game[]>([]);
  const [ratings, setRatings] = useState<number[]>([0, 0, 0, 0, 0]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [recommended, setRecommended] = useState<Game>();

  const ratedGames: RatedGame[] = useMemo(
    () => games.map((game, i) => ({ game, stars: ratings[i] ?? 0 })),
    [games, ratings],
  );

  async function startQuestions() {
    if (!platform) return;
    setLoading(true);
    setError("");
    const randomGames = await fetchRandomGames(platform, 5);
    if (randomGames.length < 5) {
      setError("No hubo suficientes juegos para armar tus 5 preguntas.");
      setLoading(false);
      return;
    }
    setGames(randomGames);
    setRatings([0, 0, 0, 0, 0]);
    setIndex(0);
    setStep("questions");
    setLoading(false);
  }

  async function nextQuestion() {
    if (index < 4) {
      setIndex((prev) => prev + 1);
      return;
    }
    if (!platform) return;
    setLoading(true);
    const recommendedGame = await fetchRecommendedGame(platform, ratedGames);
    setRecommended(recommendedGame);
    setStep("result");
    setLoading(false);
  }

  function updateRating(value: number) {
    setRatings((prev) => prev.map((rating, i) => (i === index ? value : rating)));
  }

  function restart() {
    setStep("platform");
    setPlatform(undefined);
    setGames([]);
    setRatings([0, 0, 0, 0, 0]);
    setRecommended(undefined);
    setError("");
  }

  const avg = averageStars(ratedGames.filter((item) => item.stars > 0));
  const favoriteGenres = getFavoriteGenres(ratedGames.filter((item) => item.stars > 0));
  const progressValue = step === "questions" ? ((index + 1) / 5) * 100 : step === "result" ? 100 : 0;
  const activeCover =
    step === "questions" ? games[index]?.coverUrl : step === "result" ? recommended?.coverUrl : undefined;

  return (
    <main className="grid-line relative min-h-screen overflow-hidden px-4 py-8 text-cyan-50">
      {activeCover && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-500"
            style={{ backgroundImage: `url("${activeCover}")` }}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 backdrop-blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-slate-950/55" aria-hidden />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.24),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.20),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col items-center justify-center gap-6">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/80">Game Match // Grid</p>
          <h1 className="text-3xl font-semibold tracking-tight text-cyan-50 sm:text-4xl">Recomendador de Juegos</h1>
          <p className="mt-1 text-sm text-cyan-100/80">Responde 5 preguntas y descubre tu siguiente aventura.</p>
        </header>

        {step !== "platform" && <Progress value={progressValue} className="w-full max-w-2xl" />}

        {loading && <p className="text-sm text-cyan-100/80">Cargando recomendaciones...</p>}
        {error && <p className="rounded-lg border border-red-300/35 bg-red-950/35 px-3 py-2 text-sm text-red-200">{error}</p>}

        <AnimatePresence mode="wait">
          {step === "platform" && (
            <motion.div key="platform" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <PlatformSelector selected={platform} onSelect={setPlatform} onContinue={startQuestions} />
            </motion.div>
          )}

          {step === "questions" && games[index] && (
            <motion.div key={`question-${index}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GameQuestionCard
                game={games[index]}
                currentQuestion={index + 1}
                totalQuestions={5}
                stars={ratings[index]}
                onStarsChange={updateRating}
                onNext={nextQuestion}
              />
            </motion.div>
          )}

          {step === "result" && recommended && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <RecommendationResult game={recommended} average={avg} favoriteGenres={favoriteGenres} onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
