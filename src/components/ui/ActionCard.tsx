import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}

export function ActionCard({ title, subtitle, icon, rightElement, onClick, highlight }: ActionCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl mb-3 flex items-center gap-4 transition-transform active:scale-95 ${onClick ? 'cursor-pointer' : ''} ${highlight ? 'bg-card border-l-4 border-accent-green' : 'bg-card border border-gray-800/50'}`}
    >
      {icon && <div className="text-accent-green flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {rightElement}
        {onClick && !rightElement && <ChevronRight className="w-6 h-6 text-gray-600" />}
      </div>
    </div>
  );
}
