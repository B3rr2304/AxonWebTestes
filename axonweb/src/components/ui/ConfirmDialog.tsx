import { AnimatePresence, motion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type ConfirmDialogVariant = "default" | "danger" | "success";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  icon?: ElementType;
  onConfirm: () => void;
  onClose: () => void;
};

// ===========================================================================
// CONFIGURAÇÕES VISUAIS POR VARIANTE
// ===========================================================================

const VARIANT_CONFIG: Record<
  ConfirmDialogVariant,
  {
    icon: ElementType;
    iconClassName: string;
    confirmClassName: string;
  }
> = {
  default: {
    icon: AlertTriangle,
    iconClassName: "border-purple-300/20 bg-purple-500/10 text-purple-200",
    confirmClassName: "bg-purple-500/90 text-white shadow-purple-950/30",
  },
  danger: {
    icon: AlertTriangle,
    iconClassName: "border-red-300/20 bg-red-500/10 text-red-200",
    confirmClassName: "bg-red-500/90 text-white shadow-red-950/30",
  },
  success: {
    icon: CheckCircle2,
    iconClassName:
      "border-emerald-300/20 bg-emerald-500/10 text-emerald-200",
    confirmClassName: "bg-emerald-500/90 text-white shadow-emerald-950/30",
  },
};

// ===========================================================================
// MODAL GLOBAL DE CONFIRMAÇÃO
// ===========================================================================
// Use para ações sensíveis: excluir, sair, confirmar criação contínua etc.

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  icon,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = icon ?? config.icon;

  function handleClose() {
    if (loading) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fechar confirmação"
            onClick={handleClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#15141f]/95 p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/40 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${config.iconClassName}`}
            >
              <Icon className="h-6 w-6" />
            </div>

            <h2
              id="confirm-dialog-title"
              className="text-xl font-semibold tracking-[-0.035em] text-white"
            >
              {title}
            </h2>

            {description && (
              <div className="mt-3 text-sm leading-6 text-white/45">
                {description}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-white/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${config.confirmClassName}`}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}