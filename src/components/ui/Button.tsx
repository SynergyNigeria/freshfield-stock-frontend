import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm shadow-green-200",
  secondary: "bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-50 active:bg-gray-100",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-200",
  outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
};

const sizeStyles = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && iconPosition === "left" ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 flex-shrink-0" />
      )}
    </button>
  );
}
