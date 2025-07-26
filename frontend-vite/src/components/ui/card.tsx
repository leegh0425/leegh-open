import * as React from "react";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div className={"bg-white rounded-2xl shadow-xl " + className} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={"p-6 " + className} {...props} />;
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={"px-6 pt-6 pb-3 " + className} {...props} />;
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return <h2 className={"text-lg font-bold " + className} {...props} />;
}
