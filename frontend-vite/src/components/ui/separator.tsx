import * as React from "react";
export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export function Separator({ className = "", ...props }: SeparatorProps) {
  return (
    <hr className={"my-3 border-t border-gray-200 " + className} {...props} />
  );
}
