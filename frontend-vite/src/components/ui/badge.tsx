// components/ui/badge.jsx
export function Badge({ className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 ${className}`}
    >
      {children}
    </span>
  );
}
