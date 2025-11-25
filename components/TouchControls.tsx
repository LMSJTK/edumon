import React, { useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface TouchControlsProps {
  onInput: (input: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'INTERACT') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onInput }) => {
  const intervalRef = useRef<number | null>(null);

  const handleStart = (e: React.PointerEvent, input: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger immediately
    onInput(input);

    // Clear existing timer if any
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start repeat
    intervalRef.current = window.setInterval(() => {
      onInput(input);
    }, 150); // 150ms repeat rate
  };

  const handleEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleInteract = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInput('INTERACT');
  };

  return (
    <>
      {/* D-Pad - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50 grid grid-cols-3 gap-2 p-2 bg-slate-900/40 rounded-full backdrop-blur-sm select-none touch-none border border-white/10">
        <div />
        <button
          className="w-14 h-14 bg-slate-800/80 rounded-xl flex items-center justify-center active:bg-indigo-600 transition-colors shadow-lg border border-slate-600"
          onPointerDown={(e) => handleStart(e, 'UP')}
          onPointerUp={handleEnd}
          onPointerLeave={handleEnd}
        >
          <ChevronUp className="text-white" size={36} />
        </button>
        <div />
        
        <button
          className="w-14 h-14 bg-slate-800/80 rounded-xl flex items-center justify-center active:bg-indigo-600 transition-colors shadow-lg border border-slate-600"
          onPointerDown={(e) => handleStart(e, 'LEFT')}
          onPointerUp={handleEnd}
          onPointerLeave={handleEnd}
        >
          <ChevronLeft className="text-white" size={36} />
        </button>
        <div className="w-14 h-14" />
        <button
          className="w-14 h-14 bg-slate-800/80 rounded-xl flex items-center justify-center active:bg-indigo-600 transition-colors shadow-lg border border-slate-600"
          onPointerDown={(e) => handleStart(e, 'RIGHT')}
          onPointerUp={handleEnd}
          onPointerLeave={handleEnd}
        >
          <ChevronRight className="text-white" size={36} />
        </button>

        <div />
        <button
          className="w-14 h-14 bg-slate-800/80 rounded-xl flex items-center justify-center active:bg-indigo-600 transition-colors shadow-lg border border-slate-600"
          onPointerDown={(e) => handleStart(e, 'DOWN')}
          onPointerUp={handleEnd}
          onPointerLeave={handleEnd}
        >
          <ChevronDown className="text-white" size={36} />
        </button>
        <div />
      </div>

      {/* Action Button - Bottom Right */}
      <div className="fixed bottom-12 right-8 z-50 select-none touch-none">
        <button
          className="w-24 h-24 bg-amber-600/90 rounded-full flex items-center justify-center active:bg-amber-500 transition-transform active:scale-95 shadow-xl border-4 border-amber-400 group"
          onPointerDown={handleInteract}
        >
          <span className="text-white font-bold text-2xl group-active:scale-90 transition-transform">A</span>
        </button>
      </div>
    </>
  );
};
