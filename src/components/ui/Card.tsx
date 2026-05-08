import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export default function Card({
  children,
  className,
  padding = "md",
  onClick,
}: CardProps) {
  const hasCustomBg = className?.includes("bg-");
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={cn(
        !hasCustomBg && "bg-white",
        "rounded-2xl border border-gray-100 shadow-sm",
        paddingStyles[padding],
        onClick && "w-full text-left hover:border-green-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
