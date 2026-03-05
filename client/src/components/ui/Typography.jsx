export function PageTitle({ children, className = "" }) {
  return (
    <h1
      className={`
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl
        font-semibold tracking-tight
        ${className}
      `}
    >
      {children}
    </h1>
  );
}

export function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`
        text-base sm:text-lg md:text-xl
        font-medium
        ${className}
      `}
    >
      {children}
    </h2>
  );
}

export function MetricValue({ children, className = "" }) {
  return (
    <div
      className={`
        text-xl sm:text-2xl md:text-3xl lg:text-4xl
        font-semibold
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function BodyText({ children, className = "" }) {
  return (
    <p
      className={`
        text-sm sm:text-base md:text-lg
        text-zinc-400
        ${className}
      `}
    >
      {children}
    </p>
  );
}

export function Label({ children, className = "" }) {
  return (
    <span
      className={`
        text-xs sm:text-sm
        text-zinc-500
        ${className}
      `}
    >
      {children}
    </span>
  );
}