import { forwardRef } from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = {
  default:
    "bg-[var(--accent-strong)] text-white shadow-card hover:brightness-105",
  primary:
    "bg-[var(--accent-strong)] text-white shadow-card hover:brightness-105",
  secondary:
    "border border-soft bg-surface-muted text-secondary hover:text-primary",
  outline:
    "border border-soft bg-transparent text-secondary hover:bg-surface-muted hover:text-primary",
  ghost:
    "text-secondary hover:bg-surface-muted hover:text-primary",
  danger:
    "bg-red-500/90 text-white shadow-card hover:bg-red-500",
  success:
    "bg-emerald-500/90 text-white shadow-card hover:bg-emerald-500",
  subtle:
    "border border-soft bg-surface-muted text-muted hover:text-primary",
}

const buttonSizes = {
  default: "min-h-11 px-5 py-2.5 text-sm",
  sm: "min-h-9 rounded-xl px-3 py-1.5 text-xs",
  lg: "min-h-14 px-6 py-3 text-sm",
  icon: "h-11 w-11 p-0",
  iconSm: "h-9 w-9 rounded-xl p-0",
  iconLg: "h-14 w-14 p-0",
}

const Button = forwardRef(function Button(
  {
    className,
    variant = "default",
    size = "default",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
        "active:scale-[0.98]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        buttonVariants[variant] ?? buttonVariants.default,
        buttonSizes[size] ?? buttonSizes.default,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon
      )}

      {children}

      {!loading && rightIcon}
    </button>
  )
})

export { Button }