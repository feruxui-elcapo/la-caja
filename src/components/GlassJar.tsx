import React from 'react';
import type { Jar } from '../types';
import { Minus, Coffee, Heart, Package } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface GlassJarProps {
  jar: Jar;
  spentAmount: number;
  onDeductClick: (jar: Jar) => void;
}

export const GlassJar: React.FC<GlassJarProps> = ({ jar, spentAmount, onDeductClick }) => {
  const remaining = Math.max(0, jar.allocatedBudget - spentAmount);
  const pct = jar.allocatedBudget > 0
    ? Math.max(0, Math.min(100, (remaining / jar.allocatedBudget) * 100))
    : 0;

  const remainingPct = Math.round(pct);
  let pctColor = '#10B981';
  let pctBg = 'rgba(16, 185, 129, 0.12)';
  let pctBorder = 'rgba(16, 185, 129, 0.35)';

  if (pct < 20) {
    pctColor = '#EF4444';
    pctBg = 'rgba(239, 68, 68, 0.12)';
    pctBorder = 'rgba(239, 68, 68, 0.35)';
  } else if (pct < 50) {
    pctColor = '#FBBF24';
    pctBg = 'rgba(251, 191, 36, 0.12)';
    pctBorder = 'rgba(251, 191, 36, 0.35)';
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const getIcon = () => {
    if (jar.name.toLowerCase().includes('salida')) return <Coffee size={13} color="#FBBF24" />;
    if (jar.name.toLowerCase().includes('salud')) return <Heart size={13} color="#34D399" />;
    return <Package size={13} color="#60A5FA" />;
  };

  return (
    <div className="jar-outer-compact">
      {/* Remaining Percentage Badge */}
      <div 
        className="font-pixel"
        style={{ 
          fontSize: '13px', 
          fontWeight: 700,
          color: pctColor, 
          backgroundColor: pctBg,
          border: `1px solid ${pctBorder}`,
          padding: '3px 12px',
          borderRadius: '20px',
          marginBottom: '10px',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '0.04em'
        }}
      >
        {remainingPct}% RESTANTE
      </div>

      {/* Glass Jar Body with Stacked Gold Coins */}
      <div className="jar-lid-compact" />
      <div className="jar-neck-compact" />
      <div className="jar-body-compact">
        {/* Stacked Gold Coins Fill */}
        <div className="jar-coins-fill" style={{ height: `${pct}%` }}>
          <div className="jar-coins-texture" />
          {pct > 8 && (
            <div 
              style={{
                position: 'absolute',
                top: '5px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '11px',
                pointerEvents: 'none',
                opacity: 0.9,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
              }}
            >
              🪙 🪙
            </div>
          )}
        </div>

        {/* Jar Label Text */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              backgroundColor: 'rgba(0,0,0,0.65)', 
              padding: '3px 9px', 
              borderRadius: '10px', 
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '4px'
            }}
          >
            {getIcon()}
            <span 
              className="font-pixel"
              style={{ 
                fontSize: '13px', 
                fontWeight: 700,
                color: '#FFFFFF', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textShadow: '0 2px 4px rgba(0,0,0,0.95)'
              }}
            >
              {jar.name}
            </span>
          </div>
          
          <span 
            className="font-arcade"
            style={{ 
              fontSize: '23px', 
              fontWeight: 700,
              color: '#FEF08A', 
              textShadow: '0 2px 8px rgba(0,0,0,0.95)',
              marginTop: '1px',
              letterSpacing: '0.04em'
            }}
          >
            {fmt(remaining)}
          </span>

          <span 
            style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '11px', 
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)', 
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              marginTop: '1px'
            }}
          >
            de {fmt(jar.allocatedBudget)}
          </span>
        </div>
      </div>

      {/* Deduct Button */}
      <button
        onClick={() => { soundFX.playClick(); onDeductClick(jar); }}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '11px 14px',
          borderRadius: '15px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#FFFFFF',
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          border: 'none',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
      >
        <Minus size={16} strokeWidth={3} />
        <span>GASTO</span>
      </button>
    </div>
  );
};
