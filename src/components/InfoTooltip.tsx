import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ExplanationItem } from "@/data/default-report";

interface InfoTooltipProps {
  explanation?: ExplanationItem;
  term?: string;
  description?: string;
  className?: string;
}

export function InfoTooltip({ explanation, term, description, className = "" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const title = explanation?.term || term;
  const text = explanation?.description || description;

  if (!text) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={`no-print inline-flex items-center justify-center text-muted-foreground/70 hover:text-sky transition-colors cursor-pointer rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-sky/30 ${className}`}
          title={`Entenda o indicador: ${title || ""}`}
          aria-label={`Explicação sobre ${title || "indicador"}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-80 max-w-[90vw] p-4 bg-card border border-border shadow-xl rounded-xl z-50 text-foreground"
      >
        <div className="flex items-start justify-between gap-2 border-b border-border pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 font-display text-sm font-semibold text-navy">
            <span className="h-2 w-2 rounded-full bg-sky" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-navy cursor-pointer rounded p-0.5"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
      </PopoverContent>
    </Popover>
  );
}
