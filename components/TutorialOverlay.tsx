import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, X } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onEnter?: () => void; // Trigger action when step starts
}

interface TutorialOverlayProps {
  step: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const updateTargetPosition = () => {
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
        // Element not found, fallback to center or retry
        setTargetRect(null);
    }
  };

  useEffect(() => {
    if (step.onEnter) {
      step.onEnter();
      // Give time for UI to update (tabs switching, etc)
      setTimeout(updateTargetPosition, 300);
    } else {
      updateTargetPosition();
    }

    // Monitor resize
    resizeObserver.current = new ResizeObserver(updateTargetPosition);
    const el = document.getElementById(step.targetId);
    if(el) resizeObserver.current.observe(el);

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      if(resizeObserver.current) resizeObserver.current.disconnect();
    };
  }, [step]);

  if (!targetRect) return null;

  // Calculate Tooltip Position
  const getTooltipStyle = () => {
    const gap = 20;
    const tooltipWidth = 320; // approximate
    const tooltipHeight = 150; // approximate

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = targetRect.top - gap - tooltipHeight;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - gap - tooltipWidth;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + gap;
        break;
    }

    // Basic viewport boundary check (simplified)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;
    if (top < 10) top = 10;

    return { top, left, width: tooltipWidth };
  };

  const style = getTooltipStyle();

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Cutout Effect using big borders or composed divs is hard to responsive perfectly.
          Using a simpler semi-transparent overlay + high z-index target approach is tricky without modifying target styles.
          We will use the "Box Shadow" trick on a helper element.
      */}
      <div 
        className="absolute transition-all duration-300 ease-in-out pointer-events-none border-2 border-yellow-400 rounded-lg animate-pulse"
        style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute bg-white rounded-xl shadow-2xl p-5 flex flex-col transition-all duration-300 animate-bounce-in"
        style={{
            top: style.top,
            left: style.left,
            width: style.width
        }}
      >
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-800 text-lg">{step.title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            {step.content}
        </p>

        {/* Arrow pointing to target */}
        <div className={`absolute text-yellow-400 ${
            step.position === 'bottom' ? '-top-6 left-1/2 -translate-x-1/2 animate-bounce' :
            step.position === 'top' ? '-bottom-6 left-1/2 -translate-x-1/2 animate-bounce' :
            step.position === 'left' ? '-right-6 top-1/2 -translate-y-1/2 animate-pulse' : // bounce horizontal is harder with generic classes
            '-left-6 top-1/2 -translate-y-1/2 animate-pulse'
        }`}>
            {step.position === 'bottom' && <ArrowUp size={32} />}
            {step.position === 'top' && <ArrowDown size={32} />}
            {step.position === 'left' && <ArrowRight size={32} />}
            {step.position === 'right' && <ArrowLeft size={32} />}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
                Step {currentStepIndex + 1} / {totalSteps}
            </span>
            <div className="flex gap-2">
                {currentStepIndex > 0 && (
                    <button 
                        onClick={onPrev}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors"
                    >
                        戻る
                    </button>
                )}
                <button 
                    onClick={onNext}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md font-bold shadow-md transition-all transform hover:scale-105"
                >
                    {currentStepIndex === totalSteps - 1 ? '完了' : '次へ'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;