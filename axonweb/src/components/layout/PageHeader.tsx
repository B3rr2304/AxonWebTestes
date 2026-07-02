import { ArrowLeft, Menu } from "lucide-react";
import type { ElementType, ReactNode } from "react";

// ===========================================================================
// TIPOS DO COMPONENTE
// ===========================================================================

type LeadingVariant = "logo" | "icon" | "back" | "none";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  // Elemento à esquerda: logo do Axon (padrão), ícone próprio, botão de voltar
  // ou nada.
  leadingVariant?: LeadingVariant;
  // Ícone usado quando leadingVariant === "icon".
  leadingIcon?: ElementType;
  // Clique no elemento à esquerda. Para "logo"/"back", onBack funciona como atalho.
  onLeadingClick?: () => void;
  onBack?: () => void;
  onMenuClick?: () => void;
  showMenu?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  rightSlot?: ReactNode;
  className?: string;
};

// ===========================================================================
// HEADER PADRÃO DAS PÁGINAS INTERNAS
// ===========================================================================
// Usado em telas internas do app. Por padrão mostra logo, título, subtítulo e
// botão de menu, mas é flexível: aceita ícone próprio, botão de voltar ou
// nenhum elemento à esquerda, além de esconder o menu quando necessário.
// Mantém o padrão visual mobile-first do AXON.

export default function PageHeader({
  title,
  subtitle,
  leadingVariant = "logo",
  leadingIcon: LeadingIcon,
  onLeadingClick,
  onBack,
  onMenuClick,
  showMenu = true,
  logoSrc = "/axon-logo.svg",
  logoAlt = "Axon",
  rightSlot,
  className = "",
}: PageHeaderProps) {
  // Para logo e back, onBack continua funcionando como atalho do clique.
  // Para "icon" não há navegação implícita: só clica se onLeadingClick vier.
  const leadingHandler =
    leadingVariant === "icon" ? onLeadingClick : onLeadingClick ?? onBack;

  const titleBlock = title ? (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white">{title}</p>

      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-white/40">{subtitle}</p>
      )}
    </div>
  ) : null;

  let leading: ReactNode = null;

  if (leadingVariant === "back") {
    const backButton = (
      <button
        type="button"
        onClick={leadingHandler}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
        aria-label="Voltar"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    );

    leading = titleBlock ? (
      <div className="flex min-w-0 items-center gap-3">
        {backButton}
        {titleBlock}
      </div>
    ) : (
      backButton
    );
  } else if (leadingVariant !== "none") {
    const visual =
      leadingVariant === "icon" ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200">
          {LeadingIcon && <LeadingIcon className="h-5 w-5" />}
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-500/15 text-purple-200 shadow-lg shadow-purple-950/30">
          <img src={logoSrc} alt={logoAlt} className="h-8 w-8 object-contain" />
        </div>
      );

    const inner = (
      <>
        {visual}
        {titleBlock}
      </>
    );

    // Vira botão só quando há ação; senão é apenas visual (ex.: ícone do Goals).
    leading = leadingHandler ? (
      <button
        type="button"
        onClick={leadingHandler}
        className="flex min-w-0 items-center gap-3 text-left active:scale-[0.98]"
      >
        {inner}
      </button>
    ) : (
      <div className="flex min-w-0 items-center gap-3">{inner}</div>
    );
  }

  return (
    <header className={`mb-5 flex items-center justify-between ${className}`}>
      {leading}

      <div className="flex shrink-0 items-center gap-2">
        {rightSlot}

        {showMenu && onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/65 backdrop-blur-2xl active:scale-[0.96]"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
