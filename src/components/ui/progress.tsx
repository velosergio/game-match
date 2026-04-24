import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full border border-cyan-400/35 bg-slate-950/55 shadow-[0_0_0_1px_rgba(34,211,238,0.12)_inset,0_0_20px_rgba(34,211,238,0.15)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-[linear-gradient(90deg,rgba(34,211,238,0.75),rgba(56,189,248,0.95),rgba(34,211,238,0.75))] shadow-[0_0_14px_rgba(34,211,238,0.65)] transition-all duration-500"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
