import { Bolt } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  textClassName?: string
}

const sizeMap = {
  sm: { container: "w-6 h-6", icon: "w-3 h-3", text: "text-sm" },
  md: { container: "w-8 h-8", icon: "w-5 h-5", text: "text-xl" },
  lg: { container: "w-12 h-12", icon: "w-8 h-8", text: "text-2xl" },
}

export function Logo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: LogoProps) {
  const sizes = sizeMap[size]

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div
        className={cn(
          "bg-indigo-600 rounded-lg flex items-center justify-center",
          sizes.container
        )}
      >
        <Bolt className={cn("text-white", sizes.icon)} />
      </div>
      {showText && (
        <span className={cn("font-bold", sizes.text, textClassName)}>
          Vibecode DB
        </span>
      )}
    </div>
  )
}
