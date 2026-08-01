import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Sparkles } from 'lucide-react';

export const ResetCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    progressPercent: number;
    nextResetDateStr: string;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    progressPercent: 0,
    nextResetDateStr: ''
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const nextMonthFirst = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0);
      const currentMonthFirst = new Date(currentYear, currentMonth, 1, 0, 0, 0);

      const totalDuration = nextMonthFirst.getTime() - currentMonthFirst.getTime();
      const elapsed = now.getTime() - currentMonthFirst.getTime();
      const diff = nextMonthFirst.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          progressPercent: 100,
          nextResetDateStr: nextMonthFirst.toLocaleDateString('es-AR', { month: 'long', day: 'numeric' })
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      const nextResetDateStr = nextMonthFirst.toLocaleDateString('es-AR', { 
        month: 'long', 
        day: 'numeric' 
      });

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        progressPercent,
        nextResetDateStr
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pixel-box p-4 md:p-6 mb-6 rounded-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-pixel-title mb-2">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <span>LEVEL RESET: 1° DE CADA MES</span>
          </div>
          <h2 className="text-base md:text-xl font-pixel-title text-white tracking-tight">
            <span>PRÓXIMO REINICIO: 1 DE {timeLeft.nextResetDateStr.split(' ')[2]?.toUpperCase() || 'PRÓXIMO MES'}</span>
          </h2>
          <p className="text-xs text-amber-200/70 font-pixel-body mt-2">
            ( ◠‿◠ ) Tu presupuesto total se renovará automáticamente al inicio de mes.
          </p>
        </div>

        {/* 8-Bit Pixel Countdown Display */}
        <div className="bg-[#000] border-3 border-amber-500 rounded-xl p-3 md:px-5 shadow-[4px_4px_0_0_#F59E0B]">
          <div className="flex items-center gap-2 mb-1 text-[10px] font-pixel-title text-amber-400">
            <Clock size={14} />
            <span>TIEMPO RESTANTE</span>
          </div>
          <div className="flex items-baseline gap-2 font-pixel-title text-amber-300 text-sm md:text-base">
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-black text-amber-400">{timeLeft.days}</span>
              <span className="text-[9px] text-amber-500/80">DÍAS</span>
            </div>
            <span className="text-amber-500 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-black text-amber-400">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-amber-500/80">HS</span>
            </div>
            <span className="text-amber-500 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-black text-amber-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-amber-500/80">MIN</span>
            </div>
            <span className="text-amber-500 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl md:text-2xl font-black text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-amber-500/80">SEG</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Bit Pixel Progress Bar */}
      <div className="mt-5 relative z-10">
        <div className="flex justify-between text-xs font-pixel-title text-gray-400 mb-2">
          <span>AVANCE DEL MES</span>
          <span className="text-amber-400">{timeLeft.progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-[#000] border-3 border-gray-700 p-0.5 rounded-lg">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 border-r-2 border-white"
            style={{ width: `${timeLeft.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
