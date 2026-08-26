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
  const remaining = jar.allocatedBudget - spentAmount;
  const isBroken = remaining < 0;
  const overspent = Math.abs(remaining);

  const pct = jar.allocatedBudget > 0
    ? Math.max(0, Math.min(100, (remaining / jar.allocatedBudget) * 100))
    : 0;

  const remainingPct = Math.round(pct);
  let pctColor = '#10B981';
  let pctBg = 'rgba(16, 185, 129, 0.12)';
  let pctBorder = 'rgba(16, 185, 129, 0.35)';

  if (isBroken) {
    pctColor = '#EF4444';
    pctBg = 'rgba(239, 68, 68, 0.2)';
    pctBorder = 'rgba(239, 68, 68, 0.6)';
  } else if (pct < 20) {
    pctColor = '#EF4444';
    pctBg = 'rgba(239, 68, 68, 0.12)';
    pctBorder = 'rgba(239, 68, 68, 0.35)';
  } else if (pct < 50) {
    pctColor = '#FBBF24';
    pctBg = 'rgba(251, 191, 36, 0.12)';
    pctBorder = 'rgba(251, 191, 36, 0.35)';
  }

  const fmt = (n: number) => {
    const isNeg = n < 0;
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(Math.abs(n));
    return isNeg ? `-${formatted}` : formatted;
  };

  const getIcon = () => {
    if (jar.name.toLowerCase().includes('salida')) return <Coffee size={13} color="#FBBF24" />;
    if (jar.name.toLowerCase().includes('salud')) return <Heart size={13} color="#34D399" />;
    return <Package size={13} color="#60A5FA" />;
  };

  return (
    <div className={`jar-outer-compact ${isBroken ? 'jar-broken' : ''}`}>
      {/* Remaining Percentage or Broken Badge */}
      <div 
        className="font-pixel"
        style={{ 
          fontSize: '12px', 
          fontWeight: 700,
          color: pctColor, 
          backgroundColor: pctBg,
          border: `1px solid ${pctBorder}`,
          padding: '3px 10px',
          borderRadius: '20px',
          marginBottom: '10px',
          userSelect: 'none',
          boxShadow: isBroken ? '0 0 14px rgba(239, 68, 68, 0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap'
        }}
      >
        {isBroken ? `💥 ¡ROTO! (${fmt(remaining)})` : `${remainingPct}% RESTANTE`}
      </div>

      {/* Glass Jar Body with Stacked Gold Coins or Broken Shards */}
      <div className="jar-lid-compact" />
      <div className="jar-neck-compact" />
      <div className="jar-body-compact">
        {/* Stacked Gold Coins Fill (Only when not broken) */}
        {!isBroken && (
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
        )}

        {/* Broken Jar Hazard Glow & Glass Cracks */}
        {isBroken && (
          <>
            <div className="jar-broken-hazard" />
            <svg 
              className="jar-cracks-overlay" 
              viewBox="0 0 144 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Glow filter background cracks */}
              <path 
                d="M124 18 L96 52 L108 76 L68 118 L82 148 L46 192" 
                stroke="#EF4444" 
                strokeWidth="3.5" 
                strokeOpacity="0.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M96 52 L58 62 L42 88 L18 82" 
                stroke="#EF4444" 
                strokeWidth="2.5" 
                strokeOpacity="0.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Crisp Glass Fracture Lines */}
              <path 
                d="M124 18 L96 52 L108 76 L68 118 L82 148 L46 192" 
                stroke="#FFFFFF" 
                strokeWidth="1.6" 
                strokeOpacity="0.85" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M96 52 L58 62 L42 88 L18 82" 
                stroke="#FFFFFF" 
                strokeWidth="1.3" 
                strokeOpacity="0.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M68 118 L38 132 L26 162 L8 168" 
                stroke="#FFFFFF" 
                strokeWidth="1.2" 
                strokeOpacity="0.75" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M82 148 L114 162 L132 188" 
                stroke="#FFFFFF" 
                strokeWidth="1.2" 
                strokeOpacity="0.75" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M60 4 L72 26 L54 46" 
                stroke="#FFFFFF" 
                strokeWidth="1.1" 
                strokeOpacity="0.7" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Impact point micro cracks */}
              <path d="M112 32 L130 40 M124 14 L116 30 M134 24 L110 18" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.9" />

              {/* Shard Facet Reflections */}
              <polygon points="96,52 108,76 90,70" fill="rgba(255,255,255,0.18)" />
              <polygon points="68,118 82,148 62,136" fill="rgba(239,68,68,0.25)" />
              <polygon points="58,62 42,88 34,72" fill="rgba(255,255,255,0.12)" />
            </svg>
          </>
        )}

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
              backgroundColor: isBroken ? 'rgba(127, 29, 29, 0.85)' : 'rgba(0,0,0,0.65)', 
              padding: '3px 9px', 
              borderRadius: '10px', 
              border: isBroken ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.2)',
              marginBottom: '4px'
            }}
          >
            {getIcon()}
            <span 
              className="font-pixel"
              style={{ 
                fontSize: '13px', 
                fontWeight: 700,
                color: isBroken ? '#FCA5A5' : '#FFFFFF', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textShadow: isBroken ? '0 0 8px rgba(239,68,68,0.9)' : '0 2px 4px rgba(0,0,0,0.95)'
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
              color: isBroken ? '#EF4444' : '#FEF08A', 
              textShadow: isBroken ? '0 0 14px rgba(239, 68, 68, 0.95)' : '0 2px 8px rgba(0,0,0,0.95)',
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
              color: isBroken ? 'rgba(254, 202, 202, 0.9)' : 'rgba(255,255,255,0.85)', 
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              marginTop: '1px'
            }}
          >
            de {fmt(jar.allocatedBudget)}
          </span>

          {isBroken && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                fontWeight: 700,
                color: '#FCA5A5',
                backgroundColor: 'rgba(239, 68, 68, 0.35)',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                padding: '2px 6px',
                borderRadius: '8px',
                marginTop: '4px',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
              }}
            >
              + {fmt(overspent)} de más
            </span>
          )}
        </div>
      </div>

      {/* Deduct Button */}
      <button
        onClick={() => { 
          if (isBroken) {
            soundFX.playGlassBreak();
          } else {
            soundFX.playClick();
          }
          onDeductClick(jar); 
        }}
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '11px 14px',
          borderRadius: '15px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#FFFFFF',
          background: isBroken 
            ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' 
            : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          border: isBroken ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
          boxShadow: isBroken ? '0 4px 18px rgba(220, 38, 38, 0.6)' : '0 4px 14px rgba(239, 68, 68, 0.4)',
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
