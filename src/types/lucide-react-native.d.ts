declare module "lucide-react-native" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  export interface LucideProps extends SvgProps {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
  }

  export type LucideIcon = FC<LucideProps>;

  export const Sparkles: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Layers: LucideIcon;
  export const Clock: LucideIcon;
  export const MapPin: LucideIcon;
  export const User: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const WifiOff: LucideIcon;
  export const Check: LucideIcon;
  export const X: LucideIcon;
  export const Slash: LucideIcon;
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Search: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Calendar: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const Share2: LucideIcon;
  export const Settings: LucideIcon;
  export const Bell: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const FileText: LucideIcon;
  export const Info: LucideIcon;
}
