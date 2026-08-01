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
      {/* Total Summary Row */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontFamily: "'Pixelify Sans', 'VT323', monospace", fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
          Total disponible en La Caja
        </p>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '24px', color: '#10B981', margin: '4px 0' }}>
          {fmt(totalRemaining)}
        </p>
        <p style={{ fontFamily: "'Pixelify Sans', 'VT323', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          de {fmt(totalBudget)} · total gastado {fmt(totalSpent)}
        </p>
      </div>

      {/* Jars side-by-side container */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '40px',
          width: '100%'
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
