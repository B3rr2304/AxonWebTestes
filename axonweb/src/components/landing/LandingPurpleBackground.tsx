// ===========================================================================
// FUNDO ROXO AXON
// ===========================================================================
// Background reutilizável para seções escuras da landing.
// Mantém o visual do hero: roxo profundo, glows suaves e textura pontilhada.

export default function LandingPurpleBackground({
  className = "",
  intensity = "default",
}) {
  const glowOpacity =
    intensity === "strong"
      ? "bg-[#7b2cbf]/70"
      : intensity === "soft"
      ? "bg-[#7b2cbf]/35"
      : "bg-[#7b2cbf]/60";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#2d0850] ${className}`}
    >
      <div
        className={`absolute left-1/2 top-[-12rem] h-[25rem] w-[25rem] -translate-x-1/2 rounded-full ${glowOpacity} blur-[105px] lg:left-[72%] lg:top-[-10rem] lg:h-[34rem] lg:w-[34rem] lg:blur-[120px]`}
      />

      <div className="absolute bottom-[-15rem] left-[-9rem] h-[26rem] w-[26rem] rounded-full bg-[#7b2cbf]/35 blur-[105px]" />

      <div className="absolute bottom-[10%] right-[-14rem] hidden h-[30rem] w-[30rem] rounded-full bg-[#7b2cbf]/30 blur-[120px] lg:block" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.12]" />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#160028]/70 to-transparent" />
    </div>
  );
}
