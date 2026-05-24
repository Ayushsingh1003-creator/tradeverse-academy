import { isValidLeagueId } from "@/lib/league/tiers";

export type LeagueSymbolProps = {
  /** Tier id: bronze, silver, gold, … */
  leagueId: string;
  /** Pixel width and height (square). */
  size?: number;
  className?: string;
  /** Accessible label; defaults to league name. */
  title?: string;
};

/**
 * Distinct geometric mark per competitive league tier.
 * Renders on colored badges — uses currentColor (set text-white on parent).
 */
export function LeagueSymbol({ leagueId, size = 22, className, title }: LeagueSymbolProps) {
  const id = isValidLeagueId(leagueId) ? leagueId : "bronze";
  const a11y = title ?? `${id} league`;

  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    role: "img" as const,
    "aria-label": a11y,
  };

  switch (id) {
    case "bronze":
      return (
        <svg {...svgProps} fill="currentColor">
          {/* Podium — foundation */}
          <rect x="3.5" y="15" width="5" height="6" rx="1" />
          <rect x="9.5" y="11" width="5" height="10" rx="1" />
          <rect x="15.5" y="7" width="5" height="14" rx="1" />
        </svg>
      );
    case "silver":
      return (
        <svg {...svgProps} fill="currentColor">
          {/* Stacked chevrons — ascent */}
          <path d="M12 3.5 19 9.5h-3L12 6.5 10 9.5H5z" opacity="0.95" />
          <path d="M12 9.5 19 15.5h-3L12 12.5 10 15.5H5z" opacity="0.75" />
          <path d="M12 15.5 19 21.5h-3L12 18.5 10 21.5H5z" opacity="0.55" />
        </svg>
      );
    case "gold":
      return (
        <svg {...svgProps}>
          {/* Compass star — momentum */}
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          <path
            d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2M5.1 5.1l2.3 2.3M16.6 16.6l2.3 2.3M18.9 5.1l-2.3 2.3M7.1 16.6l-2.3 2.3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "platinum":
      return (
        <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinejoin="round">
          {/* Hex frame — precision */}
          <polygon points="12,3.3 19.2,7.65 19.2,16.35 12,20.7 4.8,16.35 4.8,7.65" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinejoin="round">
          <polygon points="12,4 19.5,12 12,20 4.5,12" />
          <path d="M4.5 12h15M12 4v16" opacity="0.55" />
        </svg>
      );
    case "master":
      return (
        <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinejoin="round">
          <path d="M12 2.8 20 6.5v7.4c0 4.2-3.2 7.4-8 7.7-4.8-.3-8-3.5-8-7.7V6.5z" />
          <path d="M12 9.5 15.5 13 12 16.5 8.5 13z" fill="currentColor" stroke="none" opacity="0.9" />
        </svg>
      );
    case "grandmaster":
      return (
        <svg {...svgProps} fill="currentColor">
          {/* Octagram — peak competition */}
          <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
        </svg>
      );
    case "legend":
      return (
        <svg {...svgProps} fill="currentColor">
          {/* Flame + crown star */}
          <path
            d="M12 21c-2.8 0-5-2-5-4.5 0-2.2 1.5-3.8 2.8-5.5.4-.6.8-1.2 1-1.8.2 1.2 1 2.2 1.8 3.1.3-1.9-.2-3.8-1.2-5.4C14.5 9.2 15.5 11 15.5 13c0 1.2-.4 2.3-1 3.2 1.5-.8 2.5-2.4 2.5-4.2 0 3.5-2.2 6.3-5 8.5V21z"
            opacity="0.92"
          />
          <path d="M12 3.5l1.2 2.5h2.6l-2 1.6.8 2.7L12 8.4l-2.6 1.9.8-2.7-2-1.6h2.6z" />
        </svg>
      );
    default:
      return (
        <svg {...svgProps} fill="currentColor">
          <rect x="3.5" y="15" width="5" height="6" rx="1" />
          <rect x="9.5" y="11" width="5" height="10" rx="1" />
          <rect x="15.5" y="7" width="5" height="14" rx="1" />
        </svg>
      );
  }
}
