import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={
        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 " +
        className
      }
      {...props}
    >
      {children}
    </span>
  );
}
