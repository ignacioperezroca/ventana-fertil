export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-[linear-gradient(90deg,#f3e8df_0%,#fff7f1_50%,#f3e8df_100%)] vf-animate-shimmer ${className}`} aria-hidden="true" />;
}
