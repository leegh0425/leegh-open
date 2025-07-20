// components/ui/textarea.jsx
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
        placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
