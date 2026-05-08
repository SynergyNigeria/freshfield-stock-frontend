import Skeleton from "@/components/ui/Skeleton";

function StockRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-3.5 w-14 ml-auto" />
        <Skeleton className="h-2.5 w-10 ml-auto" />
      </div>
    </div>
  );
}

function StockGridCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-10" />
            <Skeleton className="h-2 w-14" />
          </div>
        </div>
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-2.5 w-12" />
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="bg-green-600 px-4 sm:px-6 lg:px-8 pt-6 pb-14">
          <Skeleton className="h-3 w-24 mb-3 bg-white/20" />
          <Skeleton className="h-10 w-40 mb-2 bg-white/30" />
          <Skeleton className="h-3 w-28 bg-white/20" />
        </div>
        {/* Floating card */}
        <div className="absolute -bottom-10 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex divide-x divide-gray-100 overflow-hidden">
            <div className="flex-1 px-4 py-3 space-y-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-2.5 w-12" />
            </div>
            <div className="flex-1 px-4 py-3 space-y-1.5">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-6" />

      {/* Top Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((col) => (
          <div key={col} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="divide-y divide-gray-50">
              {[0, 1, 2].map((row) => (
                <StockRowSkeleton key={row} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Watchlist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StockGridCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="divide-y divide-gray-50">
          {[0, 1, 2].map((row) => (
            <StockRowSkeleton key={row} />
          ))}
        </div>
      </div>
    </div>
  );
}
