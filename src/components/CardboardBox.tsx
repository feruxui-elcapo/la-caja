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
  // Calculate spent amounts per jar
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
    <div className="w-full">
      {/* Total summary - one simple line */}
      <div className="text-center mb-10">
        <p className="font-body text-sm text-white/50 mb-1">Total disponible</p>
        <p className="font-pixel text-xl md:text-2xl text-emerald-400">{fmt(totalRemaining)}</p>
        <p className="font-body text-xs text-white/30 mt-1">de {fmt(totalBudget)} · gastado {fmt(totalSpent)}</p>
      </div>

      {/* The jars - side by side, big and clear */}
      <div className="flex justify-center items-end gap-10 md:gap-16 flex-wrap">
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
