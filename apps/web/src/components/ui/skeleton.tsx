import { cn } from "@/utils/cn"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  isLoaded?: boolean
}

function Skeleton({
  className,
  isLoaded = false,
  children,
  ...props
}: SkeletonProps) {
  if (isLoaded) return <>{children}</>
  
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 w-full", i === lines - 1 ? 'w-3/4' : '', className)}
          {...props}
        />
      ))}
    </div>
  )
}

function SkeletonImage({
  className,
  ...props
}: SkeletonProps) {
  return (
    <Skeleton
      className={cn("aspect-video w-full", className)}
      {...props}
    />
  )
}

export { 
  Skeleton,
  SkeletonText,
  SkeletonImage
}

