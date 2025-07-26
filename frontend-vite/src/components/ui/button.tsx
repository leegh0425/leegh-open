import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={
        "inline-flex items-center justify-center rounded-xl font-bold px-4 py-2 text-base transition-colors bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
