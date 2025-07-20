// components/ui/card.jsx
export function Card({ className = "", children }) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }) {
  return <div className={`border-b px-6 py-4 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
