import { forwardRef } from "react"

import { cn } from "@/lib/utils"

const cardVariants = {
  default:
    "border border-soft bg-surface-elevated text-primary shadow-card",
  elevated:
    "border border-soft bg-surface-elevated text-primary shadow-soft",
  muted:
    "border border-soft bg-surface-muted text-primary",
  accent:
    "border border-accent-soft bg-accent-soft text-primary shadow-card",
  danger:
    "border border-red-300/25 bg-red-500/10 text-primary",
  success:
    "border border-emerald-300/25 bg-emerald-500/10 text-primary",
  transparent:
    "border border-soft bg-transparent text-primary",
}

const cardPaddings = {
  none: "p-0",
  sm: "p-3",
  default: "p-5",
  md: "p-5",
  lg: "p-6",
}

const Card = forwardRef(function Card(
  {
    className,
    variant = "default",
    padding = "default",
    interactive = false,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[1.7rem] backdrop-blur-2xl",
        cardVariants[variant] ?? cardVariants.default,
        cardPaddings[padding] ?? cardPaddings.default,
        interactive &&
          "cursor-pointer transition duration-200 hover:border-medium active:scale-[0.99]",
        className
      )}
      {...props}
    />
  )
})

const CardHeader = forwardRef(function CardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("mb-4 flex flex-col gap-1.5", className)}
      {...props}
    />
  )
})

const CardContent = forwardRef(function CardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("", className)} {...props} />
})

const CardFooter = forwardRef(function CardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("mt-5 flex items-center gap-3", className)}
      {...props}
    />
  )
})

const CardTitle = forwardRef(function CardTitle(
  { className, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-base font-semibold leading-tight tracking-[-0.025em] text-primary",
        className
      )}
      {...props}
    />
  )
})

const CardDescription = forwardRef(function CardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn("text-sm leading-6 text-muted", className)}
      {...props}
    />
  )
})

const CardIcon = forwardRef(function CardIcon(
  { className, variant = "accent", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
        variant === "accent" && "border-accent-soft bg-accent-soft text-accent",
        variant === "muted" && "border-soft bg-surface-muted text-muted",
        variant === "danger" &&
          "border-red-300/25 bg-red-500/10 text-red-600 dark:text-red-200",
        variant === "success" &&
          "border-emerald-300/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
        className
      )}
      {...props}
    />
  )
})

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardIcon,
}