// Mobile Design System Type Definitions

export type TouchTargetSize = 'default' | 'large' | 'xl'
export type ButtonSize = 'small' | 'default' | 'large'
export type ContainerSize = 'default' | 'full'
export type SpacingSize = 'compact' | 'default'

// Mobile Button Props
export interface MobileButtonProps {
  size?: ButtonSize
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  touchTarget?: TouchTargetSize
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

// Mobile Card Props
export interface MobileCardProps {
  variant?: 'default' | 'compact'
  interactive?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

// Mobile Container Props
export interface MobileContainerProps {
  size?: ContainerSize
  spacing?: SpacingSize
  children: React.ReactNode
  className?: string
}

// Mobile Input Props
export interface MobileInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  required?: boolean
  className?: string
}

// Mobile Navigation Props
export interface MobileNavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
  className?: string
}

// Mobile Grid Props
export interface MobileGridProps {
  variant?: 'default' | 'auto'
  gap?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

// Responsive Breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ResponsiveValue<T> {
  default?: T
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

// Touch Event Handlers
export interface TouchHandlers {
  onTouchStart?: (event: React.TouchEvent) => void
  onTouchMove?: (event: React.TouchEvent) => void
  onTouchEnd?: (event: React.TouchEvent) => void
  onTouchCancel?: (event: React.TouchEvent) => void
}

// Animation Types
export type AnimationType = 'touch-feedback' | 'slide-up' | 'fade-in' | 'none'

// Theme Configuration
export interface MobileTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
    background: {
      primary: string
      secondary: string
      surface: string
    }
    border: {
      default: string
      focus: string
      error: string
    }
  }
  spacing: {
    touch: {
      min: string
      recommended: string
      large: string
    }
    padding: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
    gap: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
  typography: {
    heading: string
    subheading: string
    body: string
    caption: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Utility Types
export type ClassNameValue = string | undefined | null | false
export type ClassNames = ClassNameValue | ClassNameValue[]

// Component Factory Types
export interface ComponentVariants<T extends string = string> {
  [key: string]: {
    [variant in T]?: string
  }
}

// Mobile Optimization Utils
export interface MobileOptimizationConfig {
  enableTouchOptimization: boolean
  enableSafeArea: boolean
  enableTapHighlightRemoval: boolean
  minTouchTargetSize: number
  enablePerformanceOptimizations: boolean
}

// Hook Types
export interface UseMobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: Breakpoint
  orientation: 'portrait' | 'landscape'
}

export interface UseTouch {
  isTouching: boolean
  touchPosition: { x: number; y: number } | null
  touchHandlers: TouchHandlers
}

// Constants
export const MOBILE_BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const TOUCH_TARGET_SIZES = {
  default: 44,
  large: 48,
  xl: 56,
} as const

export const MOBILE_SAFE_AREAS = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)',
} as const
