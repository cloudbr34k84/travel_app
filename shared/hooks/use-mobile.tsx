import * as React from "react"

/**
 * Mobile breakpoint value in pixels
 * Matches Tailwind's md breakpoint (768px)
 */
const MOBILE_BREAKPOINT: number = 768

/**
 * Custom hook that detects if the viewport is mobile sized
 * @returns {boolean} True if the viewport width is less than the mobile breakpoint
 */
export function useIsMobile(): boolean {
  // State to track mobile status with proper type annotation
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect((): (() => void) => {
    // Create media query list with proper type
    const mql: MediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    /**
     * Event handler for media query changes
     * @param {MediaQueryListEvent} event The media query change event
     */
    const onChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches)
    }
    
    // Initial check without waiting for event
    setIsMobile(mql.matches)
    
    // Add event listener with proper types
    mql.addEventListener("change", onChange)
    
    // Cleanup function with proper types
    return (): void => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}
