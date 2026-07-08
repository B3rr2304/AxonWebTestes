// ===========================================================================
// BACKGROUND VISUAL GLOBAL DO APP
// ===========================================================================

type AppBackgroundVariant =
  | "default"
  | "soft"
  | "minimal"
  | "auth"
  | "onboarding";

type AppBackgroundProps = {
  variant?: AppBackgroundVariant;
  className?: string;
};

const variantBackgrounds: Record<AppBackgroundVariant, string> = {
  default: [
    "radial-gradient(circle at 18% 8%, var(--app-glow-primary), transparent 34%)",
    "radial-gradient(circle at 86% 12%, var(--app-glow-secondary), transparent 32%)",
    "radial-gradient(circle at 52% 88%, var(--app-glow-tertiary), transparent 38%)",
  ].join(", "),

  soft: [
    "radial-gradient(circle at 22% 10%, var(--app-glow-secondary), transparent 30%)",
    "radial-gradient(circle at 82% 18%, var(--app-glow-primary), transparent 28%)",
  ].join(", "),

  minimal: [
    "radial-gradient(circle at 50% 0%, var(--app-glow-secondary), transparent 34%)",
  ].join(", "),

  auth: [
    "radial-gradient(circle at 50% 0%, var(--app-glow-primary), transparent 34%)",
    "radial-gradient(circle at 18% 82%, var(--app-glow-secondary), transparent 30%)",
  ].join(", "),

  onboarding: [
    "radial-gradient(circle at 20% 8%, var(--app-glow-primary), transparent 36%)",
    "radial-gradient(circle at 88% 20%, var(--app-glow-tertiary), transparent 32%)",
    "radial-gradient(circle at 50% 92%, var(--app-glow-secondary), transparent 40%)",
  ].join(", "),
};

export function AppBackground({
  variant = "default",
  className = "",
}: AppBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--app-bg)] ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: variantBackgrounds[variant],
        }}
      />

      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(var(--app-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--app-grid-color) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 78%)",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 78%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(var(--app-noise-color) 0.7px, transparent 0.7px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--app-vignette) 100%)",
        }}
      />
    </div>
  );
}

export default AppBackground;