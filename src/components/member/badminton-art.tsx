/** Ornamen garis raket & shuttlecock untuk Member Card (tanpa aset eksternal). */
export function RacketArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 300"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <ellipse cx="110" cy="92" rx="72" ry="86" />
      <path d="M110 178v58" />
      <path d="M96 236h28" />
      <path d="M84 70h52M78 92h64M84 114h52" strokeWidth={2} opacity={0.6} />
      <path d="M92 34v116M110 22v124M128 34v116" strokeWidth={2} opacity={0.6} />
    </svg>
  );
}

export function ShuttlecockArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <circle cx="80" cy="142" r="20" fill="currentColor" fillOpacity={0.15} />
      <path d="M80 122 34 52M80 122l46-70M80 122V34M80 122 52 40M80 122l28-82" />
      <path d="M34 52l18-8M126 52l-18-8M52 40l16-6M108 40l-16-6M80 34l-8-4M80 34l8-4" opacity={0.6} />
    </svg>
  );
}
