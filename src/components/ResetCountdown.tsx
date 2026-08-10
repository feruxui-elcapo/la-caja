import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const ResetCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, monthPct: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const diff = nextMonth.getTime() - now.getTime();
      const totalMonthMs = nextMonth.getTime() - startOfMonth.getTime();

      if (diff <= 0) { 
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, monthPct: 0 }); 
        return; 
      }

      const monthPct = Math.max(0, Math.min(100, (diff / totalMonthMs) * 100));

      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        monthPct: Math.round(monthPct)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', marginBottom: '22px' }}>
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Clock size={14} style={{ color: '#F59E0B' }} />
        <span>Renovación el 1° de cada mes en:</span>
      </p>
      
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div 
          className="font-arcade"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#FDE047',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '5px 16px',
            borderRadius: '20px',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.12)',
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

        <div 
          className="font-pixel"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#34D399',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '5px 12px',
            borderRadius: '20px',
            letterSpacing: '0.04em'
          }}
        >
          ({timeLeft.monthPct}% del mes)
        </div>
      </div>
    </div>
  );
};
