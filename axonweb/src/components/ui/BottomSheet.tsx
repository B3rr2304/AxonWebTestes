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
  // Cor de fundo do painel (e do footer). Prop dedicada porque, com valores
  // arbitrários do Tailwind, a ordem no CSS gerado decide qual bg vence — então
  // sobrescrever via className não é confiável.
  surfaceClassName?: string;

  ariaLabel?: string;
};

// ===========================================================================
// BOTTOM SHEET MOBILE-FIRST
// ===========================================================================
// Componente base para sheets que sobem de baixo no mobile.
// Ele centraliza overlay, animação, handle, header, botão de fechar e footer.
//
// Use para sheets como:
// - NotificationSettingsSheet
// - TagEditorSheet
// - NewRoutineSheet
// - UndatedTasksSheet

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
  surfaceClassName = "bg-[#15141f]/97",
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
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm"
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
            className={`fixed inset-x-0 bottom-0 z-[110] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2rem] border border-white/10 ${surfaceClassName} shadow-2xl shadow-black/50 backdrop-blur-2xl ${maxHeightClassName} ${className}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-fuchsia-400/8" />

            {hasHeader && (
              <header className="relative shrink-0 border-b border-white/[0.07] px-5 pb-4 pt-4">
                {showHandle && (
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
                )}

                {(title || subtitle || showCloseButton) && (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {title && (
                        <h2 className="text-xl font-semibold tracking-tight text-white">
                          {title}
                        </h2>
                      )}

                      {subtitle && (
                        <p className="mt-1 text-xs leading-5 text-white/40">
                          {subtitle}
                        </p>
                      )}
                    </div>

                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={dismissDisabled}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/55 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
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
              className="flex-1"
              contentClassName={`relative px-5 py-4 ${contentClassName}`}
            >
              {children}
            </ScrollArea>

            {footer && (
              <footer
                className={`relative shrink-0 border-t border-white/[0.07] ${surfaceClassName} px-5 pb-6 pt-4 ${footerClassName}`}
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