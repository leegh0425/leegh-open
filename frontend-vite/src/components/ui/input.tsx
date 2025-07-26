import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={
        "block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 " +
        className
      }
      {...props}
    />
  )
);
Input.displayName = "Input";
