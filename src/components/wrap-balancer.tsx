import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type BalancerProps<T extends ElementType = 'span'> = {
  as?: T
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

/**
 * A script-free replacement for react-wrap-balancer.
 * Modern browsers balance supported text natively via CSS.
 */
function Balancer<T extends ElementType = 'span'>({
  as,
  children,
  className,
  ...props
}: BalancerProps<T>) {
  const Component = as ?? 'span'

  return (
    <Component
      className={['inline-block text-balance', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Balancer }
export default Balancer
