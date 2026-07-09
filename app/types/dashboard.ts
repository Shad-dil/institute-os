import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
}
