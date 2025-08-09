import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  // CSS 변수 타입 안전하게 지정
  type CSSVars = React.CSSProperties & {
    ["--normal-bg"]?: string;
    ["--normal-text"]?: string;
    ["--normal-border"]?: string;
  };

  const styleVars: CSSVars = {
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)",
  };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={styleVars}
      {...props}
    />
  );
}
