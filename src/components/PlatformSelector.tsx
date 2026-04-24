import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["PC", "PlayStation", "Xbox", "Nintendo"];

interface Props {
  selected?: Platform;
  onSelect: (platform: Platform) => void;
  onContinue: () => void;
}

export function PlatformSelector({ selected, onSelect, onContinue }: Props) {
  return (
    <Card className="grid-surface w-full max-w-2xl overflow-hidden rounded-2xl">
      <CardHeader>
        <CardDescription className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">Init Sequence</CardDescription>
        <CardTitle className="text-2xl font-semibold text-cyan-50">Encuentra tu proximo juego favorito</CardTitle>
        <CardDescription className="text-cyan-100/75">Elige una plataforma para iniciar tu recomendacion personalizada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => (
            <Button
              key={platform}
              variant={selected === platform ? "default" : "outline"}
              size="lg"
              className={
                selected === platform
                  ? "grid-glow border-cyan-300 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-300/25"
                  : "border-cyan-500/35 bg-cyan-950/20 text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-400/10"
              }
              onClick={() => onSelect(platform)}
            >
              {platform}
            </Button>
          ))}
        </div>
        <Button
          className="grid-glow mt-5 w-full border border-cyan-300/50 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-300/30"
          size="lg"
          disabled={!selected}
          onClick={onContinue}
        >
          Continuar
        </Button>
      </CardContent>
    </Card>
  );
}
