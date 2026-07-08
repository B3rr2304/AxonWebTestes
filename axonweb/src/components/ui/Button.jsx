import { cn } from '@/lib/utils'

function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        variant === 'default' &&
          'bg-[var(--accent-strong)] text-white shadow-card hover:brightness-105',
        variant === 'outline' &&
          'border border-soft bg-surface-muted text-secondary hover:text-primary',
        variant === 'ghost' &&
          'text-secondary hover:bg-surface-muted hover:text-primary',
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
