import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  subtitleClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  iconClassName,
  titleClassName,
  valueClassName,
  subtitleClassName
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium", titleClassName)}>
              {title}
            </p>
            <p className={cn("text-3xl font-bold", valueClassName)}>
              {value}
            </p>
            {subtitle && (
              <p className={cn("text-xs", subtitleClassName)}>
                {subtitle}
              </p>
            )}
          </div>
          <Icon className={cn("h-8 w-8", iconClassName)} />
        </div>
      </CardContent>
    </Card>
  );
}