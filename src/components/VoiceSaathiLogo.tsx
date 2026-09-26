import React from 'react';

interface VoiceSaathiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
}

export const VoiceSaathiLogo: React.FC<VoiceSaathiLogoProps> = ({
  className = 'h-9 w-auto',
  size = 36,
  showText = false,
  textClassName = 'text-slate-900 font-black text-base',
  subtextClassName = 'text-amber-700 font-bold text-[10px] tracking-wider uppercase',
}) => {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={size ? { height: size, width: (size * 100) / 80 } : undefined}
      >
        {/* Left Figure Head (Charcoal Slate) */}
        <circle cx="32" cy="18" r="8" fill="#333333" />

        {/* Left Figure Dynamic Body (Reaching Up & Stepping) */}
        <path
          d="M 48 8 
             C 42 16, 28 24, 26 28 
             C 22 34, 12 48, 6 68 
             C 12 58, 20 50, 26 49 
             C 24 57, 23 66, 25 74 
             C 29 73, 34 71, 37 66 
             C 34 58, 33 50, 34 46 
             C 38 52, 42 64, 46 72 
             C 49 70, 52 64, 52 58 
             C 46 48, 41 38, 45 28 
             C 47 22, 49 14, 48 8 Z"
          fill="#333333"
        />

        {/* Right Figure Head (Saffron / Vibrant Orange) */}
        <circle cx="68" cy="18" r="8" fill="#EA580C" />

        {/* Right Figure Dynamic Body (Reaching Up & High-Fiving) */}
        <path
          d="M 52 8 
             C 58 16, 72 24, 74 28 
             C 78 34, 88 48, 94 68 
             C 88 58, 80 50, 74 49 
             C 76 57, 77 66, 75 74 
             C 71 73, 66 71, 63 66 
             C 66 58, 67 50, 66 46 
             C 62 52, 58 64, 54 72 
             C 51 70, 48 64, 48 58 
             C 54 48, 59 38, 55 28 
             C 53 22, 51 14, 52 8 Z"
          fill="#EA580C"
        />
      </svg>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className={textClassName}>Voice Saathi</span>
          <span className={subtextClassName}>Rural Voice Intelligence</span>
        </div>
      )}
    </div>
  );
};
