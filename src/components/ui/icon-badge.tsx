import { LucideIcon } from "lucide-react";

interface IconBadgeProps {
  icon: LucideIcon;
  variant: "purple" | "green" | "blue" | "neutral";
}

const variantStyles: Record<IconBadgeProps["variant"], string> = {
  purple: "bg-purple-100 text-purple-600",
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
  neutral: "bg-slate-100 text-slate-500",
};

export function IconBadge({ icon: Icon, variant }: IconBadgeProps) {
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </div>
  );
}
