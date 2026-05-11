import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props} />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
}

export { Card, CardContent, CardHeader, CardTitle }
