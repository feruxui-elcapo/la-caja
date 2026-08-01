import React from 'react';
import { GlassJar } from './GlassJar';
import type { Jar, Expense } from '../types';
import { Package, MinusCircle, Wallet, Coins } from 'lucide-react';
import { soundFX } from '../utils/audio';

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
  const remainingPercent = totalBudget > 0 ? (totalRemaining / totalBudget) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleDeductClick = () => {
    soundFX.playClick();
    onDeductClick();
  };

  return (
    <div className="pixel-cardboard p-6 md:p-8 rounded-3xl">
      {/* Decorative 8-Bit Tape Strips & Stamp */}
      <div className="pixel-tape pixel-tape-left" />
      <div className="pixel-tape pixel-tape-right" />
      <div className="absolute bottom-4 right-6 pixel-stamp pointer-events-none">
        ★ CAJA 8-BIT ★
      </div>

      {/* Header Inside Cardboard Box */}
      <div className="relative z-10 mb-8 pb-6 border-b-4 border-black/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#4D331A] border-3 border-black rounded-2xl text-amber-300 shadow-[3px_3px_0_0_#000]">
              <Package size={32} />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-pixel-title text-amber-100 tracking-tight flex items-center gap-2">
                FRASCOS EN LA CAJA
              </h2>
              <p className="text-xs font-pixel-body text-amber-200/80 mt-1">
                ( ◠‿◠ ) Dinero repartido por frascos
              </p>
            </div>
          </div>

          {/* Quick Main Action Button */}
          <button
            onClick={handleDeductClick}
            className="btn-pixel btn-pixel-red px-6 py-3.5 rounded-2xl font-pixel-title text-xs md:text-sm flex items-center justify-center gap-2"
          >
            <MinusCircle size={22} strokeWidth={2.5} />
            <span>- ANOTAR GASTO</span>
          </button>
        </div>

        {/* Total Budget Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#1E1A17] border-3 border-black rounded-xl p-4 flex items-center gap-3 shadow-[3px_3px_0_0_#000]">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <Wallet size={20} />
            </div>
            <div>
              <span className="block text-[10px] font-pixel-title text-amber-300">PRESUPUESTO TOTAL</span>
              <span className="text-base font-pixel-title text-amber-100">{formatCurrency(totalBudget)}</span>
            </div>
          </div>

          <div className="bg-[#1E1A17] border-3 border-black rounded-xl p-4 flex items-center gap-3 shadow-[3px_3px_0_0_#000]">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/40">
              <Coins size={20} />
            </div>
            <div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="block text-[10px] font-pixel-title text-emerald-400">DINERO RESTANTE</span>
                <span className="text-[10px] font-pixel-title text-emerald-400">{remainingPercent.toFixed(0)}%</span>
              </div>
              <span className="text-base font-pixel-title text-emerald-200">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>

          <div className="bg-[#1E1A17] border-3 border-black rounded-xl p-4 flex items-center gap-3 shadow-[3px_3px_0_0_#000]">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/40">
              <MinusCircle size={20} />
            </div>
            <div>
              <span className="block text-[10px] font-pixel-title text-red-400">GASTADO EN EL MES</span>
              <span className="text-base font-pixel-title text-red-200">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Glass Jars */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {jars.map((jar) => (
          <GlassJar
            key={jar.id}
            jar={jar}
            spentAmount={spentByJar[jar.id] || 0}
            onDeductClick={(selectedJar) => onDeductClick(selectedJar)}
          />
        ))}
      </div>
    </div>
  );
};
