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
          marginBottom: '32px',
          padding: '24px 20px',
          borderRadius: '24px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1.5px solid rgba(245, 158, 11, 0.25)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', color: '#FBBF24' }}>
          <Wallet size={18} />
          <span style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#FBBF24' }}>
            DINERO DISPONIBLE EN LOS FRASCOS
          </span>
          <Sparkles size={16} style={{ color: '#FBBF24' }} />
        </div>

        <p style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '36px', color: '#FDE047', margin: '6px 0', textShadow: '0 2px 12px rgba(245,158,11,0.3)' }}>
          {fmt(totalRemaining)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', fontFamily: "'Pixelify Sans', monospace", color: 'rgba(255,255,255,0.6)', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span>Presupuesto: <strong style={{ color: '#FFFFFF' }}>{fmt(totalBudget)}</strong></span>
          <span>•</span>
          <span>Gastado: <strong style={{ color: '#F87171' }}>{fmt(totalSpent)}</strong></span>
        </div>
      </div>

      {/* The 2 Jars Side-by-Side (Salidas & Salud) */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '100%',
          maxWidth: '400px',
          gap: '28px',
          padding: '0 8px'
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
