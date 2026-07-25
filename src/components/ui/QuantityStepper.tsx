import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 0, max = 9999 }: QuantityStepperProps) {
  const handleDec = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (value > min) onChange(value - 1); 
  };
  
  const handleInc = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (value < max) onChange(value + 1); 
  };

  return (
    <div className="flex items-center bg-primary rounded-full p-1 border border-gray-800 shrink-0">
      <button 
        onClick={handleDec}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-card active:bg-gray-800 transition-colors"
      >
        <Minus className="w-6 h-6 text-accent-red" />
      </button>
      <div className="w-14 text-center font-bold text-xl">{value}</div>
      <button 
        onClick={handleInc}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-card active:bg-gray-800 transition-colors"
      >
        <Plus className="w-6 h-6 text-accent-green" />
      </button>
    </div>
  );
}
