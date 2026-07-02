import type { ElementType, ReactNode } from "react";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type EmptyStateTone = "default" | "purple" | "danger" | "success";

type EmptyStateProps = {
  icon?: ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tone?: EmptyStateTone;
  children?: ReactNode;
  className?: string;
};

const TONE_STYLES: Record<
  EmptyStateTone,
  {
    iconBox: string;
    primaryButton: string;
  }
> = {
  default: {
    iconBox: "border-white/10 bg-white/[0.055] text-white/55",
    primaryButton:
      "bg-white/[0.08] text-white border border-white/10 shadow-black/20",
  },
  purple: {
    iconBox: "border-purple-300/20 bg-purple-500/12 text-purple-200",
    primaryButton:
      "bg-purple-500 text-white border border-purple-300/10 shadow-purple-950/30",
  },
  danger: {
    iconBox: "border-red-300/20 bg-red-500/10 text-red-200",
    primaryButton:
      "bg-red-500/90 text-white border border-red-300/10 shadow-red-950/30",
  },
  success: {
    iconBox: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    primaryButton:
      "bg-emerald-500/90 text-white border border-emerald-300/10 shadow-emerald-950/30",
  },
};

// ===========================================================================
// EMPTY STATE REUTILIZÁVEL
// ===========================================================================
// Use para estados vazios de listas, agendas, objetivos, conversas e buscas.
// Mantém o visual mobile-first, centralizado e compatível com o tema dark/glass.

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  tone = "purple",
  children,
  className = "",
}: EmptyStateProps) {
  const styles = TONE_STYLES[tone];
  const hasPrimaryAction = actionLabel && onAction;
  const hasSecondaryAction = secondaryActionLabel && onSecondaryAction;

  return (
    <div
      className={`flex flex-col items-center rounded-[1.6rem] border border-dashed border-white/12 bg-black/15 px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}

      <p className="text-sm font-semibold text-white">{title}</p>

      {description && (
        <p className="mt-1 max-w-[18rem] text-xs leading-5 text-white/42">
          {description}
        </p>
      )}

      {children && <div className="mt-4 w-full">{children}</div>}

      {(hasPrimaryAction || hasSecondaryAction) && (
        <div className="mt-4 flex w-full flex-col gap-2 sm:max-w-[18rem]">
          {hasPrimaryAction && (
            <button
              type="button"
              onClick={onAction}
              className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-xs font-semibold shadow-lg active:scale-[0.97] ${styles.primaryButton}`}
            >
              {actionLabel}
            </button>
          )}

          {hasSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-xs font-semibold text-white/55 active:scale-[0.97]"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}