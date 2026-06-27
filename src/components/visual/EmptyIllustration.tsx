export function EmptyIllustration({ variant = "cycle" }: { variant?: "cycle" | "data" | "reminders" }) {
  if (variant === "data") {
    return (
      <svg viewBox="0 0 160 120" className="w-full max-w-[180px]" aria-hidden="true">
        <rect x="30" y="18" width="100" height="84" rx="24" fill="rgba(255,255,255,0.85)" stroke="#e8ddd7" />
        <rect x="44" y="34" width="72" height="10" rx="5" fill="#f2e2d8" />
        <rect x="44" y="52" width="52" height="10" rx="5" fill="#f7d6dc" />
        <rect x="44" y="70" width="62" height="10" rx="5" fill="#f2c866" />
      </svg>
    );
  }

  if (variant === "reminders") {
    return (
      <svg viewBox="0 0 160 120" className="w-full max-w-[180px]" aria-hidden="true">
        <circle cx="80" cy="60" r="34" fill="rgba(75,44,85,0.1)" />
        <rect x="52" y="36" width="56" height="56" rx="16" fill="#fff" stroke="#e8ddd7" />
        <path d="M64 60h32" stroke="#d86f8f" strokeWidth="6" strokeLinecap="round" />
        <path d="M64 46h22" stroke="#e4b733" strokeWidth="6" strokeLinecap="round" />
        <path d="M64 74h14" stroke="#4b2c55" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 140" className="w-full max-w-[220px]" aria-hidden="true">
      <circle cx="90" cy="70" r="46" fill="rgba(75,44,85,0.08)" />
      <ellipse cx="90" cy="66" rx="22" ry="30" fill="url(#egg-grad)" stroke="#fff" strokeWidth="3" />
      <circle cx="90" cy="70" r="56" fill="none" stroke="#d86f8f" strokeOpacity="0.2" strokeDasharray="6 8" />
      <circle cx="90" cy="70" r="66" fill="none" stroke="#e4b733" strokeOpacity="0.12" strokeDasharray="2 10" />
      <defs>
        <radialGradient id="egg-grad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="45%" stopColor="#fff0dc" />
          <stop offset="100%" stopColor="#ead5b5" />
        </radialGradient>
      </defs>
    </svg>
  );
}
