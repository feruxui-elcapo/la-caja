import React from 'react';
import { GlassJar } from './GlassJar';
import type { Jar, Expense } from '../types';
import { Wallet, Sparkles } from 'lucide-react';

interface CardboardBoxProps {
  jars: Jar[];
  expenses: Expense[];
  totalBudget: number;
  onDeductClick: (jar?: Jar) => void;
}

export const CardboardBox: React.FC<CardboardBoxProps> = ({
  jars,
  expenses,
  totalBudget,
  onDeductClick
}) => {
  const spentByJar: Record<string, number> = {};
  let totalSpent = 0;
  expenses.forEach((exp) => {
    spentByJar[exp.jarId] = (spentByJar[exp.jarId] || 0) + exp.amount;
    totalSpent += exp.amount;
  });

  const totalRemaining = Math.max(0, totalBudget - totalSpent);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Total Available Money Banner Card (Compact Single-Screen) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '380px',
          marginBottom: '14px',
          padding: '12px 14px',
          borderRadius: '18px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1.5px solid rgba(245, 158, 11, 0.25)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px', color: '#FBBF24' }}>
          <Wallet size={14} />
          <span className="font-pixel" style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FBBF24' }}>
            DINERO DISPONIBLE EN FRASCOS
          </span>
          <Sparkles size={14} style={{ color: '#FBBF24' }} />
        </div>

        <p className="font-arcade" style={{ fontWeight: 700, fontSize: '32px', color: '#FDE047', margin: '2px 0', textShadow: '0 2px 10px rgba(245,158,11,0.4)', letterSpacing: '0.04em' }}>
          {fmt(totalRemaining)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span>Presupuesto: <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{fmt(totalBudget)}</strong></span>
          <span>•</span>
          <span>Gastado: <strong style={{ color: '#F87171', fontWeight: 700 }}>{fmt(totalSpent)}</strong></span>
        </div>
      </div>

      {/* The 2 Jars Side-by-Side */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '100%',
          maxWidth: '380px',
          gap: '16px',
          padding: '0 4px'
        }}
      >
        {jars.map((jar) => (
          <GlassJar
            key={jar.id}
            jar={jar}
            spentAmount={spentByJar[jar.id] || 0}
            onDeductClick={(j) => onDeductClick(j)}
          />
        ))}
      </div>
    </div>
  );
};
