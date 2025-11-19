import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface InfoTooltipProps {
  content: string;
  examples?: string[];
}

export function InfoTooltip({ content, examples }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-2 touch-manipulation"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Info className="w-3 h-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Informação</DialogTitle>
          <DialogDescription className="text-base">{content}</DialogDescription>
        </DialogHeader>
        {examples && examples.length > 0 && (
          <div className="text-sm">
            <p className="font-medium mb-2">Exemplos:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {examples.map((example, i) => (
                <li key={i}>{example}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

