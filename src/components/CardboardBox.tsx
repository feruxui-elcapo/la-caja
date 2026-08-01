import React from 'react';
import { GlassJar } from './GlassJar';
import type { Jar, Expense } from '../types';

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
      {/* Total Available Money Banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ fontFamily: "'Pixelify Sans', 'VT323', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
          Dinero disponible en los frascos
        </p>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '20px', color: '#FBBF24', margin: '4px 0' }}>
          {fmt(totalRemaining)}
        </p>
        <p style={{ fontFamily: "'Pixelify Sans', 'VT323', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          de {fmt(totalBudget)} · gastado {fmt(totalSpent)}
        </p>
      </div>

      {/* The 2 Jars Side-by-Side (Salidas & Salud) */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '100%',
          maxWidth: '380px',
          gap: '24px',
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
