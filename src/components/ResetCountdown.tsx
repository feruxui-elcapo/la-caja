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
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <p style={{ fontFamily: "'Pixelify Sans', 'VT323', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
        El presupuesto se renueva el 1° de cada mes en:
      </p>
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '13px',
          color: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '6px 14px',
          borderRadius: '20px'
        }}
      >
        <span>{timeLeft.days}d</span>
        <span style={{ opacity: 0.5 }}>:</span>
        <span>{pad(timeLeft.hours)}h</span>
        <span style={{ opacity: 0.5 }}>:</span>
        <span>{pad(timeLeft.minutes)}m</span>
        <span style={{ opacity: 0.5 }}>:</span>
        <span>{pad(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
};
