// ===========================================================================
// BACKGROUND DAS TELAS DE AUTENTICAÇÃO
// ===========================================================================

type AuthBackgroundProps = {
  className?: string;
};

export default function AuthBackground({ className = "" }: AuthBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#05050b]" />

      <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="absolute right-[-10rem] top-[18rem] h-[22rem] w-[22rem] rounded-full bg-fuchsia-500/10 blur-[100px]" />
      <div className="absolute bottom-[-12rem] left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-indigo-500/10 blur-[110px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.12]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,11,0.1),#05050b_88%)]" />
    </div>
  );
}