type GeselligMarkProps = {
  className?: string;
};

export function GeselligMark({ className = "h-10 w-10" }: GeselligMarkProps) {
  return (
    <svg className={className} viewBox="0 0 96 64" fill="none" aria-hidden="true">
      <path
        d="M14 50C15 28 27 9 39 12C50 15 38 42 35 50C42 27 55 7 67 12C81 18 63 47 57 52C65 36 76 27 83 32C90 38 78 52 68 52"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
