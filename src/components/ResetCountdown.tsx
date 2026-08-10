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
    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
      <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <Clock size={13} style={{ color: '#F59E0B' }} />
        <span>Renovación el 1° de cada mes en:</span>
      </p>
      <div 
        className="font-arcade"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '18px',
          fontWeight: 700,
          color: '#FDE047',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '4px 14px',
          borderRadius: '20px',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.12)',
          letterSpacing: '0.05em'
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
