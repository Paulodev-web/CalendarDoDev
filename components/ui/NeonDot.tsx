export function NeonDot() {
  return (
    <div className="relative flex w-full items-center justify-center py-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-700" />
      <div className="mx-4 h-2 w-2 animate-pulse rounded-full bg-neon-green shadow-[0_0_12px_rgba(0,255,65,0.8)]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-700" />
    </div>
  );
}
