export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path
          d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
          fill="none"
          stroke="url(#hexGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M11 11 L21 11 M16 11 L16 22"
          stroke="url(#hexGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight">Techy</span>
    </div>
  );
}