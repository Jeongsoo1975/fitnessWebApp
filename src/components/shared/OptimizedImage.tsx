'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLazyImage } from '@/hooks/usePerformance'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  placeholder?: string
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  placeholder,
  className = '',
  priority = false,
  sizes,
  quality = 75,
  onLoad,
  onError
}: OptimizedImageProps) {
  const isMobile = useIsMobile()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  // 우선순위가 높은 이미지는 즉시 로드, 그렇지 않으면 지연 로딩
  const { targetRef, imageSrc, shouldLoad } = useLazyImage(
    priority ? src : src,
    placeholder
  )

  // 반응형 이미지 소스 생성 - useCallback으로 메모이제이션
  const generateResponsiveSrc = useCallback((originalSrc: string, targetWidth?: number) => {
    if (!targetWidth) return originalSrc
    
    // Next.js Image Optimization API 사용 (실제 구현에서는 이미지 CDN 사용)
    const params = new URLSearchParams({
      url: originalSrc,
      w: targetWidth.toString(),
      q: quality.toString()
    })
    
    return `/api/image?${params.toString()}`
  }, [quality])

  // 모바일/데스크톱에 따른 최적 크기 계산 - useCallback으로 메모이제이션
  const getOptimalSize = useCallback(() => {
    const devicePixelRatio = typeof window !== 'undefined' 
      ? window.devicePixelRatio || 1 
      : 1
    
    if (isMobile) {
      // 모바일에서는 화면 너비의 최대 90%
      const maxWidth = Math.min(width || 400, window.innerWidth * 0.9)
      return Math.round(maxWidth * devicePixelRatio)
    }
    
    // 데스크톱에서는 원본 크기 또는 지정된 크기
    return width ? Math.round(width * devicePixelRatio) : undefined
  }, [isMobile, width])

  const optimalSize = getOptimalSize()
  const optimizedSrc = generateResponsiveSrc(src, optimalSize)

  // handleLoad 함수를 useCallback으로 메모이제이션하여 의존성 안정화
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  // handleError 함수를 useCallback으로 메모이제이션
  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // 우선순위가 높은 이미지는 즉시 로드 - 의존성 배열에 handleLoad 추가
  useEffect(() => {
    if (priority && imgRef.current) {
      const img = imgRef.current
      if (img.complete) {
        handleLoad()
      }
    }
  }, [priority, handleLoad])

  return (
    <div 
      ref={priority ? undefined : targetRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* 로딩 플레이스홀더 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* 에러 플레이스홀더 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm">이미지 로드 실패</span>
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      {(priority || shouldLoad) && (
        <img
          ref={imgRef}
          src={priority ? optimizedSrc : imageSrc || optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}

      {/* 이미지 메타데이터 (SEO 및 접근성) */}
      {isLoaded && (
        <div className="sr-only">
          이미지 로드 완료: {alt}
        </div>
      )}
    </div>
  )
}

/**
 * 아바타 전용 최적화 이미지 컴포넌트
 */
interface AvatarImageProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallbackInitials?: string
  className?: string
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className = ''
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  // handleError 함수를 useCallback으로 메모이제이션
  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (!src || hasError) {
    // 폴백 아바타 (이니셜 또는 기본 아이콘)
    return (
      <div 
        className={`${sizeClasses[size]} ${className} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium`}
        role="img"
        aria-label={alt}
      >
        {fallbackInitials ? (
          fallbackInitials.slice(0, 2).toUpperCase()
        ) : (
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-1/2 h-1/2">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
      height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      priority={false}
      onError={handleError}
    />
  )
}