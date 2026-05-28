import { memo, type ComponentProps } from "react"
import { createMathPlugin } from "@streamdown/math"
import { Streamdown } from "streamdown"
import "katex/dist/katex.min.css"
import "streamdown/styles.css"

import { cn } from "@/lib/utils"

type ResponseProps = ComponentProps<typeof Streamdown>

const mathPlugin = createMathPlugin({
  singleDollarTextMath: true,
})

const mathSignalPattern = /(?:\\(?:frac|sqrt|pm|times|cdot)|\^|=|[a-zA-Z]\d|\d[a-zA-Z])/

function normalizeMathDelimiters(children: ResponseProps["children"]) {
  if (typeof children !== "string") {
    return children
  }

  return children
    .replace(/\\\[((?:.|\n)*?)\\\]/g, (_, expression: string) => `$$${expression.trim()}$$`)
    .replace(/\\\(((?:.|\n)*?)\\\)/g, (_, expression: string) => `$${expression.trim()}$`)
    .replace(/(^|\n)\[\s*([^\]\n]*?(?:\\(?:frac|sqrt|pm|times|cdot)|\^|=)[^\]\n]*?)\s*\](?=\n|$)/g, (_, prefix: string, expression: string) => `${prefix}$$${expression.trim()}$$`)
    .replace(/\(([^()\n]*?(?:\\(?:frac|sqrt|pm|times|cdot)|\^|=|[a-zA-Z]\d|\d[a-zA-Z])[^()\n]*?)\)/g, (match, expression: string) => {
      const trimmed = expression.trim()
      return mathSignalPattern.test(trimmed) ? `$${trimmed}$` : match
    })
}

export const Response = memo(
  ({ className, children, plugins, ...props }: ResponseProps) => {
    const normalizedChildren = normalizeMathDelimiters(children)

    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        plugins={{ math: mathPlugin, ...plugins }}
        {...props}
      >
        {normalizedChildren}
      </Streamdown>
    )
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
)

Response.displayName = "Response"
