type IconProps = {
  className?: string;
};

function baseClasses(className?: string) {
  return className ?? "h-5 w-5";
}

export function PlaneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 12.5 20 4l-4.8 16-2.8-5.2L7 12.1Z" />
      <path d="m7 12.1 5.4 2.7" />
    </svg>
  );
}

export function CoinsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="7" rx="6" ry="3.5" />
      <path d="M6 7v5c0 1.9 2.7 3.5 6 3.5s6-1.6 6-3.5V7" />
      <path d="M8.3 16v3c0 1.1 1.7 2 3.7 2s3.7-.9 3.7-2v-3" />
    </svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="m12 3 1.7 4.5L18 9.2l-4.3 1.6L12 15.5l-1.7-4.7L6 9.2l4.3-1.7L12 3Z" />
      <path d="m18.5 14 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
      <path d="m5 14 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
    </svg>
  );
}

export function WalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5Z" />
      <path d="M4 8.5h12.5A2.5 2.5 0 0 0 19 6" />
      <path d="M16.5 13h3" />
    </svg>
  );
}

export function CrownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="m3 8 5 4 4-6 4 6 5-4-2 11H5Z" />
      <path d="M6.5 19h11" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 11.5 12 5l8 6.5V20H4Z" />
      <path d="M9.5 20v-5h5V20" />
    </svg>
  );
}

export function PlannerIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="m12 3 1.4 3.8L17 8.2l-3.6 1.3L12 13.3l-1.4-3.8L7 8.2l3.6-1.4L12 3Z" />
    </svg>
  );
}

export function BedIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 8.5V20" />
      <path d="M20 12v8" />
      <path d="M4 12h16" />
      <path d="M7 12V9.5A2.5 2.5 0 0 1 9.5 7h1A2.5 2.5 0 0 1 13 9.5V12" />
      <path d="M13 12V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function TicketIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 8.5A2.5 2.5 0 0 0 6.5 11 2.5 2.5 0 0 0 4 13.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5A2.5 2.5 0 0 0 17.5 11 2.5 2.5 0 0 0 20 8.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" />
      <path d="M12 7.5v9" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M7 5.5h10a1.5 1.5 0 0 1 1.5 1.5V20l-6.5-4-6.5 4V7A1.5 1.5 0 0 1 7 5.5Z" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M12 20s-6.7-4.3-8.8-8.2C1.7 8.8 3.2 5 6.8 5c2 0 3.1 1 4.2 2.5C12 6 13.1 5 15.2 5c3.5 0 5.1 3.8 3.6 6.8C18.7 15.7 12 20 12 20Z" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.6l5.9-.8Z" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" />
      <path d="M12 19.3v2.2" />
      <path d="m4.9 4.9 1.6 1.6" />
      <path d="m17.5 17.5 1.6 1.6" />
      <path d="M2.5 12h2.2" />
      <path d="M19.3 12h2.2" />
      <path d="m4.9 19.1 1.6-1.6" />
      <path d="m17.5 6.5 1.6-1.6" />
    </svg>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M7 18h9a4 4 0 0 0 .6-8A5.5 5.5 0 0 0 6 11.3 3.5 3.5 0 0 0 7 18Z" />
    </svg>
  );
}

export function WifiIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M2.6 8.7A16.3 16.3 0 0 1 12 5.8c3.6 0 6.9 1.2 9.4 2.9" />
      <path d="M5.4 12.3A11.8 11.8 0 0 1 12 10.1c2.5 0 4.9.8 6.6 2.2" />
      <path d="M8.4 15.8A6.7 6.7 0 0 1 12 14.7c1.3 0 2.6.4 3.6 1.1" />
      <circle cx="12" cy="18.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SignalIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={baseClasses(className)}
      aria-hidden="true"
    >
      <path d="M4 18.5h2.4V15H4Zm4.2 0h2.4V12H8.2Zm4.2 0h2.4V8.8H12.4Zm4.2 0H19V5h-2.4Z" />
    </svg>
  );
}

export function BatteryIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 28 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-7"}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="22" height="14" rx="3" />
      <path d="M25 5.2h2v5.6h-2Z" />
      <rect x="3.5" y="3.5" width="14.5" height="9" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
