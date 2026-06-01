export default function AuthLogo() {
  return (
    <div className="mx-auto mb-8 flex w-fit items-center justify-center">
      <div className="flex h-16 w-16 rotate-45 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.045] backdrop-blur-2xl">
        <img src="/axon-logo.svg" alt="Axon" className="-rotate-45 h-20 w-20" />
      </div>
    </div>
  );
}
