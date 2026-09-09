export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="35"
      height="39"
      viewBox="0 0 35 39"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 36V3h15c9 0 16 7 16 16.5S26 36 17 36H2Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M9 36V10h8c5.5 0 9 4 9 9.5S22.5 29 17 29H9M16 10v19"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
