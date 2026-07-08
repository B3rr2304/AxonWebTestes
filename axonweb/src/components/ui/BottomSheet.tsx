import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { ScrollArea } from "../ui/ScrollArea";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;

  children: ReactNode;

  title?: string;
  subtitle?: string;
  footer?: ReactNode;

  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  dismissDisabled?: boolean;

  className?: string;
  contentClassName?: string;
  footerClassName?: string;
  maxHeightClassName?: string;
  // Cor de fundo do painel e do footer.
  // Mantida como prop para permitir exceções visuais específicas,
  // mas o padrão agora usa tokens de tema.
  surfaceClassName?: string;

  ariaLabel?: string;
};

// ===========================================================================
// BOTTOM SHEET MOBILE-FIRST
// ===========================================================================
// Componente base para sheets que sobem de baixo no mobile.
// Centraliza overlay, animação, handle, header, botão de fechar, área rolável
// e footer. As cores usam tokens globais para responder aos temas claro/escuro.

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  footer,
  showHandle = true,
  showCloseButton = true,
  closeOnOverlayClick = true,
  dismissDisabled = false,
  className = "",
  contentClassName = "",
  footerClassName = "",
  maxHeightClassName = "max-h-[90vh]",
  surfaceClassName = "bg-surface-elevated",
  ariaLabel = "Painel inferior",
}: BottomSheetProps) {
  const hasHeader = title || subtitle || showCloseButton || showHandle;

  function handleClose() {
    if (dismissDisabled) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar painel"
            onClick={closeOnOverlayClick ? handleClose : undefined}
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className={`fixed inset-x-0 bottom-0 z-[110] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2rem] border border-soft ${surfaceClassName} text-primary shadow-soft backdrop-blur-2xl ${maxHeightClassName} ${className}`}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-muted), transparent 46%, var(--accent-soft))",
              }}
            />

            {hasHeader && (
              <header className="relative shrink-0 border-b border-[var(--border-soft)] px-5 pb-4 pt-4">
                {showHandle && (
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border-medium)]" />
                )}

                {(title || subtitle || showCloseButton) && (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {title && (
                        <h2 className="text-xl font-semibold tracking-tight text-primary">
                          {title}
                        </h2>
                      )}

                      {subtitle && (
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {subtitle}
                        </p>
                      )}
                    </div>

                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={dismissDisabled}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-soft bg-surface-muted text-muted transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Fechar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </header>
            )}

            <ScrollArea
              className="min-h-0 flex-1"
              contentClassName={`relative px-5 py-4 ${contentClassName}`}
            >
              {children}
            </ScrollArea>

            {footer && (
              <footer
                className={`relative shrink-0 border-t border-[var(--border-soft)] ${surfaceClassName} px-5 pb-6 pt-4 ${footerClassName}`}
              >
                {footer}
              </footer>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
