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
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <p style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Clock size={15} style={{ color: '#F59E0B' }} />
        <span>Renovación el 1° de cada mes en:</span>
      </p>
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'Pixelify Sans', monospace",
          fontSize: '16px',
          fontWeight: 700,
          color: '#FDE047',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '8px 20px',
          borderRadius: '24px',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)'
        }}
      >
        <span>{timeLeft.days}d</span>
        <span style={{ opacity: 0.4 }}>:</span>
        <span>{pad(timeLeft.hours)}h</span>
        <span style={{ opacity: 0.4 }}>:</span>
        <span>{pad(timeLeft.minutes)}m</span>
        <span style={{ opacity: 0.4 }}>:</span>
        <span>{pad(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
};
