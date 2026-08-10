import React, { useState } from 'react';
import type { Expense, Jar } from '../types';
import { X, Trash2, Edit3 } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  jars: Jar[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onEditExpense?: (expense: Expense) => void;
}

export const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen, onClose, expenses, jars, onDeleteExpense, onEditExpense
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto? El dinero vuelve al frasco.')) return;
    setDeletingId(id);
    try { soundFX.playClick(); await onDeleteExpense(id); } catch {}
    setDeletingId(null);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-pixel text-lg font-bold text-white tracking-wider">HISTORIAL DE GASTOS</span>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {expenses.length === 0 ? (
            <p className="text-center text-white/40 font-body text-sm py-10">Sin gastos este mes.</p>
          ) : expenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3.5 py-3 border border-white/10 hover:border-white/20 transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-medium text-white truncate">{exp.description}</p>
                <p className="font-body text-xs text-white/50 mt-0.5">{exp.jarName} · {fmtDate(exp.date)} · {exp.userName || exp.userEmail?.split('@')[0]}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-arcade text-lg font-bold text-red-400">-{fmt(exp.amount)}</span>
                {onEditExpense && (
                  <button onClick={() => { soundFX.playClick(); onEditExpense(exp); }} className="p-1.5 text-white/30 hover:text-amber-400 transition-colors" title="Editar gasto">
                    <Edit3 size={15} />
                  </button>
                )}
                <button onClick={() => handleDelete(exp.id)} disabled={deletingId === exp.id} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Eliminar gasto">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
