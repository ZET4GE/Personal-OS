type WINFLogoProps = {
  showWordmark?: boolean
  showTagline?: boolean
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  taglineClassName?: string
}

export function WINFLogo({
  showWordmark = true,
  showTagline = false,
  className = '',
  markClassName = 'h-7 w-7',
  wordmarkClassName = 'text-sm font-semibold tracking-tight',
  taglineClassName = 'text-[10px] font-medium uppercase tracking-[0.18em] text-muted',
}: WINFLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 96 64"
        aria-hidden="true"
        className={`shrink-0 ${markClassName}`}
        fill="currentColor"
      >
        <path d="M5 4h18v18H5z" />
        <path d="M73 4h18v18H73z" />
        <path d="M28 11l18 28-14 21-18-28z" />
        <path d="M48 18l16 23-16 19-16-19z" />
        <path d="M68 11l14 21-18 28-14-21z" />
        <path d="M23 22l9-11 8 13-13 9z" />
        <path d="M73 22l-9-11-8 13 13 9z" />
      </svg>

      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={wordmarkClassName}>WINF</span>
          {showTagline ? (
            <span className={taglineClassName}>Work in One Framework</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}
