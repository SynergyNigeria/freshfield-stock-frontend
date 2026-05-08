import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  icon?: React.ReactNode;
  accent?: "green" | "red" | "gray";
}

export default function StatCard({
  label,
  value,
  sub,
  subPositive,
  icon,
  accent = "gray",
}: StatCardProps) {
  const accentBg = {
    green: "bg-green-50",
    red: "bg-red-50",
    gray: "bg-gray-50",
  }[accent];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accentBg)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sub && (
        <p
          className={cn(
            "text-xs font-medium",
            subPositive === undefined
              ? "text-gray-500"
              : subPositive
              ? "text-green-600"
              : "text-red-500"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
