import { APP_NAME, SCHOOL_NAME } from "../lib/brand";

export function SiteHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-brand-strong via-brand to-brand-deep text-white">
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="print-site-header container relative max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <button type="button" onClick={onHome} aria-label="Go to leaderboards" className="shrink-0 rounded-2xl border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <span className="print-logo inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/40">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="K S Lo English" className="h-full w-full object-contain p-1" />
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] text-white/80">{SCHOOL_NAME}</p>
            <h1 className="font-display text-xl sm:text-3xl font-extrabold leading-tight drop-shadow-sm">
              SolidMemory <span className="text-white/95">Leaderboards</span>
            </h1>
            <p className="mt-0.5 hidden sm:block text-sm text-white/85">Celebrating consistency and word power in English vocabulary learning</p>
          </div>
        </div>
      </div>
    </header>
  );
}
