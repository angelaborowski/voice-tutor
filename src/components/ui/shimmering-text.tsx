import React, { useMemo, useRef } from "react"
import { motion, useInView, UseInViewOptions } from "motion/react"

import { cn } from "@/lib/utils"

interface ShimmeringTextProps {
  /** Text to display with shimmer effect */
  text: string
  /** Animation duration in seconds */
  duration?: number
  /** Delay before starting animation */
  delay?: number
  /** Whether to repeat the animation */
  repeat?: boolean
  /** Pause duration between repeats in seconds */
  repeatDelay?: number
  /** Custom className */
  className?: string
  /** Whether to start animation when component enters viewport */
  startOnView?: boolean
  /** Whether to animate only once */
  once?: boolean
  /** Margin for in-view detection (rootMargin) */
  inViewMargin?: UseInViewOptions["margin"]
  /** Shimmer spread multiplier */
  spread?: number
  /** Base text color */
  color?: string
  /** Shimmer gradient color */
  shimmerColor?: string
}

export function ShimmeringText({
  text,
  duration = 2,
  delay = 0,
  repeat = true,
  repeatDelay = 0.5,
  className,
  startOnView = true,
  once = false,
  inViewMargin,
  spread = 2,
  color,
  shimmerColor,
}: ShimmeringTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once, margin: inViewMargin })

  // Calculate dynamic spread based on text length
  const dynamicSpread = useMemo(() => {
    return text.length * spread
  }, [text, spread])

  // Determine if we should start animation
  const shouldAnimate = !startOnView || isInView
  const maskWidth = Math.max(48, Math.min(180, dynamicSpread * 1.6))

  return (
    <motion.span
      ref={ref}
      data-shimmer-text={text}
      className={cn("shimmering-text", shouldAnimate && "is-animated", className)}
      style={
        {
          "--shimmer-base-color": color ?? "var(--muted-foreground)",
          "--shimmer-highlight-color": shimmerColor ?? "var(--foreground)",
          "--shimmer-mask-width": `${maskWidth}px`,
          "--shimmer-cycle-duration": `${duration + repeatDelay}s`,
          "--shimmer-delay": `${delay}s`,
          "--shimmer-iteration-count": repeat ? "infinite" : "1",
        } as React.CSSProperties
      }
      initial={{
        opacity: 0,
      }}
      animate={
        shouldAnimate
          ? {
              opacity: 1,
            }
          : {}
      }
      transition={{
        opacity: {
          duration: 0.3,
          delay,
        },
      }}
    >
      {text}
    </motion.span>
  )
}
