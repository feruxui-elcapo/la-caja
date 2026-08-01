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
    <div className="w-full flex flex-col items-center">
      {/* Total Available Money Banner Card */}
      <div className="w-full max-w-sm mb-6 p-5 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 backdrop-blur-md text-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-center gap-2 mb-1.5 text-amber-400">
          <Wallet size={16} />
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-amber-400/90">
            Dinero disponible en los frascos
          </span>
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
        </div>

        <p className="font-sans font-extrabold text-3xl text-amber-300 tracking-tight my-1 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
          {fmt(totalRemaining)}
        </p>

        <div className="flex items-center justify-center gap-3 text-xs font-sans text-stone-400 mt-2 pt-2 border-t border-white/5">
          <span>Presupuesto: <strong className="text-stone-200">{fmt(totalBudget)}</strong></span>
          <span>•</span>
          <span>Gastado: <strong className="text-red-400">{fmt(totalSpent)}</strong></span>
        </div>
      </div>

      {/* The 2 Jars Side-by-Side (Salidas & Salud) */}
      <div 
        className="flex flex-row justify-center items-end w-full max-w-[390px] gap-6 px-2"
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
