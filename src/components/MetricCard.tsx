import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  trend?: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "accent";
}

export const MetricCard = ({ title, value, suffix, trend, icon: Icon, variant = "primary" }: MetricCardProps) => {
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-medium mt-2",
              trend.startsWith('+') ? "text-success" : "text-warning"
            )}>
              {trend} from last week
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          {
            "bg-gradient-primary": variant === "primary",
            "bg-success": variant === "success", 
            "bg-warning": variant === "warning",
            "bg-gradient-accent": variant === "accent"
          }
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};