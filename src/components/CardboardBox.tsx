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
      {/* Total Available Money Banner Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '24px',
          padding: '18px 20px',
          borderRadius: '22px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1.5px solid rgba(245, 158, 11, 0.25)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          boxShadow: '0 10px 28px rgba(0,0,0,0.55)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px', color: '#FBBF24' }}>
          <Wallet size={16} />
          <span className="font-pixel" style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FBBF24' }}>
            DINERO DISPONIBLE EN FRASCOS
          </span>
          <Sparkles size={15} style={{ color: '#FBBF24' }} />
        </div>

        <p className="font-arcade" style={{ fontWeight: 700, fontSize: '38px', color: '#FDE047', margin: '4px 0', textShadow: '0 2px 12px rgba(245,158,11,0.4)', letterSpacing: '0.04em' }}>
          {fmt(totalRemaining)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
          maxWidth: '400px',
          gap: '22px',
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
