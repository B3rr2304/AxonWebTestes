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
    iconBox: "border-soft bg-surface-muted text-muted",
    primaryButton:
      "border border-soft bg-surface-muted text-primary shadow-card",
  },
  purple: {
    iconBox: "border-accent-soft bg-accent-soft text-accent",
    primaryButton:
      "border border-accent-soft bg-[var(--accent-strong)] text-white shadow-card",
  },
  danger: {
    iconBox: "border-red-300/25 bg-red-500/10 text-red-600 dark:text-red-200",
    primaryButton:
      "border border-red-300/20 bg-red-500/90 text-white shadow-card",
  },
  success: {
    iconBox:
      "border-emerald-300/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100",
    primaryButton:
      "border border-emerald-300/20 bg-emerald-500/90 text-white shadow-card",
  },
};

// ===========================================================================
// EMPTY STATE REUTILIZÁVEL
// ===========================================================================
// Use para estados vazios de listas, agendas, objetivos, conversas e buscas.
// Mantém o visual mobile-first, centralizado e compatível com os temas do AXON.

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
      className={`flex flex-col items-center rounded-[1.6rem] border border-dashed border-soft bg-surface-muted px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}

      <p className="text-sm font-semibold text-primary">{title}</p>

      {description && (
        <p className="mt-1 max-w-[18rem] text-xs leading-5 text-muted">
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
              className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-xs font-semibold transition active:scale-[0.97] ${styles.primaryButton}`}
            >
              {actionLabel}
            </button>
          )}

          {hasSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-soft bg-surface-muted px-4 text-xs font-semibold text-secondary transition active:scale-[0.97]"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
