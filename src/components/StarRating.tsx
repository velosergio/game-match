import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} estrellas`}
          onClick={() => onChange(star)}
          className={cn(
            "rounded-md p-1 transition-transform hover:scale-110",
            value >= star ? "text-amber-400" : "text-zinc-300",
          )}
        >
          <Star className={cn("size-8", value >= star && "fill-current")} />
        </button>
      ))}
    </div>
  );
}
