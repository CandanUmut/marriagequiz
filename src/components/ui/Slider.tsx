'use client';


interface SliderProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  color?: string;
}

export default function Slider({
  min = 1,
  max = 7,
  value,
  onChange,
  minLabel,
  maxLabel,
  color = '#2d9a89',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative pt-2 pb-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-sand-200 dark:bg-sand-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e8e4db ${percentage}%, #e8e4db 100%)`,
          }}
        />
        <div className="absolute -bottom-1 left-0 right-0 flex justify-between text-xs text-sand-500 dark:text-sand-400">
          <span>{minLabel || min}</span>
          <span className="font-medium text-primary-700 dark:text-primary-400">{value}</span>
          <span>{maxLabel || max}</span>
        </div>
      </div>
    </div>
  );
}
