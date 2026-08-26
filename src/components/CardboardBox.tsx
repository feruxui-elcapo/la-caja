import React from 'react';
import { GlassJar } from './GlassJar';
import type { Jar, Expense } from '../types';
import { Wallet, Sparkles, AlertTriangle, Flame } from 'lucide-react';

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

  const totalRemaining = totalBudget - totalSpent;
  const isOverBudget = totalRemaining < 0;
  const totalOverspent = Math.abs(totalRemaining);

  const fmt = (n: number) => {
    const isNeg = n < 0;
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(Math.abs(n));
    return isNeg ? `-${formatted}` : formatted;
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Total Available Money or Overbudget Banner Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '24px',
          padding: '18px 20px',
          borderRadius: '22px',
          backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.08)',
          border: isOverBudget ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(245, 158, 11, 0.25)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          boxShadow: isOverBudget 
            ? '0 10px 28px rgba(0,0,0,0.55), 0 0 25px rgba(239, 68, 68, 0.25)' 
            : '0 10px 28px rgba(0,0,0,0.55)',
          transition: 'all 0.3s ease'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            marginBottom: '4px', 
            color: isOverBudget ? '#EF4444' : '#FBBF24' 
          }}
        >
          {isOverBudget ? <AlertTriangle size={17} /> : <Wallet size={16} />}
          <span 
            className="font-pixel" 
            style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em', 
              color: isOverBudget ? '#EF4444' : '#FBBF24' 
            }}
          >
            {isOverBudget ? 'PRESUPUESTO EXCEDIDO' : 'DINERO DISPONIBLE EN FRASCOS'}
          </span>
          {isOverBudget ? <Flame size={16} style={{ color: '#EF4444' }} /> : <Sparkles size={15} style={{ color: '#FBBF24' }} />}
        </div>

        <p 
          className="font-arcade" 
          style={{ 
            fontWeight: 700, 
            fontSize: '38px', 
            color: isOverBudget ? '#EF4444' : '#FDE047', 
            margin: '4px 0', 
            textShadow: isOverBudget 
              ? '0 0 16px rgba(239, 68, 68, 0.85)' 
              : '0 2px 12px rgba(245,158,11,0.4)', 
            letterSpacing: '0.04em' 
          }}
        >
          {fmt(totalRemaining)}
        </p>

        {isOverBudget && (
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: 'rgba(239, 68, 68, 0.22)', 
              border: '1px solid rgba(239, 68, 68, 0.45)', 
              padding: '3px 12px', 
              borderRadius: '12px', 
              margin: '2px 0 6px', 
              color: '#FCA5A5', 
              fontSize: '12px', 
              fontWeight: 700 
            }}
          >
            <span>Gastaron {fmt(totalOverspent)} de más</span>
          </div>
        )}

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            fontSize: '13px', 
            fontFamily: 'var(--font-sans)', 
            fontWeight: 500, 
            color: 'rgba(255,255,255,0.7)', 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid rgba(255,255,255,0.08)' 
          }}
        >
          <span>Presupuesto: <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{fmt(totalBudget)}</strong></span>
          <span>•</span>
          <span>Gastado: <strong style={{ color: '#EF4444', fontWeight: 700 }}>{fmt(totalSpent)}</strong></span>
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
