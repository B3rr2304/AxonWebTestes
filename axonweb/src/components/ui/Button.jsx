import { cn } from '@/lib/utils'

function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-purple-500 text-white shadow hover:bg-purple-400',
        variant === 'outline' && 'border border-white/10 bg-transparent hover:bg-white/[0.06]',
        variant === 'ghost' && 'hover:bg-white/[0.06]',
        size === 'default' && 'px-5 py-2.5',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    />
  )
}

export { Button }
