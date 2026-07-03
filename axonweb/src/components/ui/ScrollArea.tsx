import type { ReactNode } from "react";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fadeTop?: boolean;
  fadeBottom?: boolean;
};

export function ScrollArea({
  children,
  className = "",
  contentClassName = "",
  fadeTop = false,
  fadeBottom = false,
}: ScrollAreaProps) {
  return (
    <div className={`relative min-h-0 ${className}`}>
      {fadeTop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[#171720] to-transparent" />
      )}

      <div
        className={`custom-scrollbar h-full min-h-0 overflow-y-auto ${contentClassName}`}
      >
        {children}
      </div>

      {fadeBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-[#171720] to-transparent" />
      )}
    </div>
  );
}