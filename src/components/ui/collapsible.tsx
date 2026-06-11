'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open = false, onOpenChange, className, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open)

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    return (
      <div ref={ref} className={cn('w-full', className)} data-state={isOpen ? 'open' : 'closed'} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { isOpen, onOpenChange: handleOpenChange } as any)
          }
          return child
        })}
      </div>
    )
  }
)
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, onClick, isOpen = false, onOpenChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn('w-full', className)}
      onClick={(e) => {
        onClick?.(e)
        onOpenChange?.(!isOpen)
      }}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    />
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }
>(({ className, isOpen = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('overflow-hidden transition-all', isOpen ? 'block' : 'hidden', className)}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    />
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
