import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='netops-logo'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('size-6', className)}
      {...props}
    >
      <title>NetOps Platform</title>

      {/* outer system frame */}
      <rect x='3' y='3' width='18' height='18' rx='4' />

      {/* core controller */}
      <circle cx='12' cy='12' r='2.5' />

      {/* extraction lines */}
      <line x1='12' y1='5' x2='12' y2='8' />
      <line x1='12' y1='16' x2='12' y2='19' />
      <line x1='5' y1='12' x2='8' y2='12' />
      <line x1='16' y1='12' x2='19' y2='12' />

      {/* vendor nodes */}
      <circle cx='12' cy='4' r='1' />
      <circle cx='12' cy='20' r='1' />
      <circle cx='4' cy='12' r='1' />
      <circle cx='20' cy='12' r='1' />
    </svg>
  )
}
