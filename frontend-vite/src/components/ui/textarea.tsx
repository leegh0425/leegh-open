import * as React from "react";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={
        "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 " +
        className
      }
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
