import React, { useState, useEffect } from 'react';

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
    <div className="text-center mb-8">
      <p className="font-body text-xs text-white/40 mb-2">Reinicio el 1° del mes en</p>
      <div className="inline-flex items-center gap-1 font-pixel text-sm text-amber-400">
        <span>{timeLeft.days}d</span>
        <span className="text-amber-400/40">:</span>
        <span>{pad(timeLeft.hours)}h</span>
        <span className="text-amber-400/40">:</span>
        <span>{pad(timeLeft.minutes)}m</span>
        <span className="text-amber-400/40">:</span>
        <span>{pad(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
};
