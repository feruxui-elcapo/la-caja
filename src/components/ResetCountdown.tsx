import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const ResetCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = next.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="text-center mb-6">
      <p className="font-sans text-xs text-stone-400 mb-2 flex items-center justify-center gap-1.5">
        <Clock size={13} className="text-amber-400/80" />
        <span>Renovación el 1° de cada mes en:</span>
      </p>
      <div 
        className="inline-flex items-center gap-2 font-sans font-bold text-sm text-amber-300 bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      >
        <span>{timeLeft.days}d</span>
        <span className="opacity-40">:</span>
        <span>{pad(timeLeft.hours)}h</span>
        <span className="opacity-40">:</span>
        <span>{pad(timeLeft.minutes)}m</span>
        <span className="opacity-40">:</span>
        <span>{pad(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
};
