// src/components/layout/AppBackground.tsx

// ===========================================================================
// BACKGROUND VISUAL GLOBAL DO APP
// ===========================================================================
// Centraliza os fundos escuros/glassmorphism usados nas páginas internas.
// Use dentro de containers com `relative` e `overflow-hidden`.

type AppBackgroundVariant = "default" | "soft" | "minimal";

type AppBackgroundProps = {
  variant?: AppBackgroundVariant;
  className?: string;
};

const BACKGROUND_LAYERS: Record<AppBackgroundVariant, string[]> = {
  // Fundo principal usado em páginas internas como Dashboard, Profile,
  // Chat, Settings, Result e Planning.
  default: [
    "absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]",
    "absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]",
    "absolute right-[-12rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]",
    "absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]",
    "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]",
  ],

  // Fundo mais aberto usado em páginas analíticas/listas, como Insights e Rotinas.
  soft: [
    "absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]",
    "absolute right-[-14rem] top-[14rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[110px]",
    "absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]",
    "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-20",
    "absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.05),#05050b_88%)]",
  ],

  // Fundo mais simples usado quando a página já tem muitos cards/conteúdo visual.
  minimal: [
    "absolute inset-0 bg-[linear-gradient(to_bottom,#151520_0%,#101018_48%,#13131d_100%)]",
    "absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/22 blur-[120px]",
    "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]",
  ],
};

export default function AppBackground({
  variant = "default",
  className = "",
}: AppBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {BACKGROUND_LAYERS[variant].map((layerClassName, index) => (
        <div key={`${variant}-${index}`} className={layerClassName} />
      ))}
    </div>
  );
}