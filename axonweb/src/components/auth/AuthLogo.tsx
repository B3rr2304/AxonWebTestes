type AuthLogoProps = {
  variant?: "auth" | "header";
  className?: string;
};

export default function AuthLogo({
  variant = "auth",
  className = "",
}: AuthLogoProps) {
  const isHeader = variant === "header";

  return (
    <div
      className={`flex w-fit items-center justify-center ${
        isHeader ? "" : "mx-auto mb-8"
      } ${className}`}
    >
      <div
        className={`flex rotate-45 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.045] backdrop-blur-2xl ${
          isHeader ? "h-11 w-11" : "h-16 w-16"
        }`}
      >
        <img
          src="/axon-logo.svg"
          alt="Axon"
          className={`-rotate-45 object-contain ${
            isHeader ? "h-14 w-14" : "h-20 w-20"
          }`}
        />
      </div>
    </div>
  );
}