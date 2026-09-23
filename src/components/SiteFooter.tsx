import { ExternalLink } from "lucide-react";
import { SCHOOL_NAME, SMEM_LINK, SOLIDMEMORY_LINK } from "../lib/brand";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-border/70 bg-gradient-to-b from-transparent to-accent/40">
      <div className="container max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Keep building your streak on{" "}
          <a
            href={SOLIDMEMORY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-strong underline-offset-4 transition-colors hover:text-brand-deep hover:underline"
          >
            SolidMemory
            <ExternalLink className="h-5 w-5" />
          </a>{" "}
          and climb the rankings.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Visit{" "}
          <a
            href={SMEM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand-strong underline-offset-4 hover:underline"
          >
            english.kslo.hk/smem
            <ExternalLink className="h-3.5 w-3.5" />
          </a>{" "}
          for details on the SolidMemory competitions and awards.
        </p>
        <p className="mt-3 text-xs text-muted-foreground/80">
          {"\u00A9"} 2026 {SCHOOL_NAME}
        </p>
      </div>
    </footer>
  );
}
