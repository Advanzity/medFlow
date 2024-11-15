import Link from "next/link"
import { cn } from "@/lib/utils"
import { Activity } from "lucide-react"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className="flex items-center space-x-2 font-medium"
      >
        <Activity className="h-5 w-5" />
        <span>MedFlow</span>
      </Link>
    </nav>
  )
}