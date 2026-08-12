export default function ScrollCue() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <div className="flex flex-col items-center gap-2 text-surface/80">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-surface/60" />
      </div>
    </div>
  );
}
