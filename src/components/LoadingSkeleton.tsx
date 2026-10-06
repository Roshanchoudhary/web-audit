interface LoadingSkeletonProps {
  /** Number of placeholder rows to render. */
  rows?: number;
  className?: string;
}

const block =
  'animate-shimmer bg-[linear-gradient(90deg,#f1f5f9_0%,#e2e8f0_50%,#f1f5f9_100%)] bg-[length:400px_100%] rounded-2xl';

/** Shimmer placeholders shown while a stored report is being restored. */
export function LoadingSkeleton({ rows = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className ?? ''}`} aria-hidden="true">
      <div className={`${block} h-36 w-full`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={`${block} h-20 w-full`} />
      ))}
    </div>
  );
}
