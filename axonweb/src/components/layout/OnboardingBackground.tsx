// ===========================================================================
// BACKGROUND DAS TELAS DE ONBOARDING E CARREGAMENTO
// ===========================================================================

type OnboardingBackgroundVariant = "default" | "loading";

type OnboardingBackgroundProps = {
  variant?: OnboardingBackgroundVariant;
  className?: string;
};

const BACKGROUND_LAYERS: Record<OnboardingBackgroundVariant, string[]> = {
  // Fundo principal para telas de introdução/questionário.
  default: [
    "absolute inset-0 bg-[#05050b]",
    "absolute left-1/2 top-[-14rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-700/24 blur-[120px]",
    "absolute right-[-12rem] top-[16rem] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[110px]",
    "absolute bottom-[-12rem] left-[-12rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]",
    "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.12]",
    "absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.02),#05050b_92%)]",
  ],

  // Fundo mais concentrado para telas em que a animação/logo fica no centro.
  loading: [
    "absolute inset-0 bg-[#05050b]",
    "absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/22 blur-[120px]",
    "absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[90px]",
    "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.1]",
    "absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.05),#05050b_90%)]",
  ],
};

export default function OnboardingBackground({
  variant = "default",
  className = "",
}: OnboardingBackgroundProps) {
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