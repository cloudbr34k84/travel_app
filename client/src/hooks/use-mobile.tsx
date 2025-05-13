import * as React from "react"

/**
 * Mobile breakpoint value in pixels
 */
const MOBILE_BREAKPOINT: number = 768

/**
 * Custom hook that detects if the viewport is mobile sized
 * @returns {boolean} True if the viewport width is less than the mobile breakpoint
 */
export function useIsMobile(): boolean {
  // State to track mobile status with proper type annotation
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query list with proper type
    const mql: MediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    /**
     * Event handler for media query changes
     * @param {MediaQueryListEvent} event The media query change event
     */
    const onChange = (event: MediaQueryListEvent): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check without waiting for event
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Add event listener with proper types
    mql.addEventListener("change", onChange)
    
    // Cleanup function with proper types
    return (): void => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  // Ensure return value is always boolean
  return !!isMobile
}
