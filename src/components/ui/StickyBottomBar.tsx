import { ReactNode } from "react";

interface StickyBottomBarProps {
  leftContent?: ReactNode;
  mainActionText: string;
  onMainAction: () => void;
  disabled?: boolean;
}

export function StickyBottomBar({ leftContent, mainActionText, onMainAction, disabled }: StickyBottomBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-gray-800 flex items-center justify-between z-50 rounded-b-xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]">
      <div className="flex-1">
        {leftContent}
      </div>
      <button 
        onClick={onMainAction}
        disabled={disabled}
        className="ml-4 px-8 h-14 bg-accent-green text-primary font-bold text-lg rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      >
        {mainActionText}
      </button>
    </div>
  );
}
