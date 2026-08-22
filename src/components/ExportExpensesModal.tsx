import React, { useState, useEffect } from 'react';
import type { Expense, Jar } from '../types';
import { subscribeToExpenses, getCurrentMonthKey } from '../services/firestore';
import { X, Copy, Check, Share2, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ExportExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
}

const generateMonthOptions = () => {
  const options: { key: string; label: string }[] = [];
  const now = new Date();
  
  // Generate options for the last 18 months + next 1 month
  for (let i = -1; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    
    const monthName = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    options.push({ key, label: capitalized });
  }
  return options;
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export const ExportExpensesModal: React.FC<ExportExpensesModalProps> = ({
  isOpen,
  onClose,
  jars
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(getCurrentMonthKey());
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [copied, setCopied] = useState(false);
  const [monthOptions] = useState(generateMonthOptions());

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    
    // Subscribe to expenses for the selected month
    const unsubscribe = subscribeToExpenses(selectedMonthKey, (expenses) => {
      setMonthExpenses(expenses);
    });

    return () => unsubscribe();
  }, [isOpen, selectedMonthKey]);

  if (!isOpen) return null;

  // Build the WhatsApp message
  const [yearStr, monthStr] = selectedMonthKey.split('-');
  const selectedDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const monthName = selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const totalSpent = monthExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Group by jar
  const jarTotals: Record<string, { name: string; total: number }> = {};
  monthExpenses.forEach((exp) => {
    const jarName = exp.jarName || 'Otros';
    if (!jarTotals[jarName]) {
      jarTotals[jarName] = { name: jarName, total: 0 };
    }
    jarTotals[jarName].total += exp.amount;
  });

  // Sort expenses chronological
  const sortedExpenses = [...monthExpenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let messageText = '';
  if (monthExpenses.length === 0) {
    messageText = `📦 *LA CAJA - HISTORIAL DE GASTOS*\n📅 *Mes:* ${capitalizedMonth}\n\n_No hay gastos registrados en este mes._`;
  } else {
    messageText = `📦 *LA CAJA - HISTORIAL DE GASTOS*\n`;
    messageText += `📅 *Mes:* ${capitalizedMonth}\n`;
    messageText += `💰 *Total Gastado:* ${formatCurrency(totalSpent)} (${monthExpenses.length} ${monthExpenses.length === 1 ? 'gasto' : 'gastos'})\n\n`;
    
    messageText += `📊 *Resumen por frasco:*\n`;
    Object.values(jarTotals).forEach((j) => {
      messageText += `• *${j.name}:* ${formatCurrency(j.total)}\n`;
    });

    messageText += `\n📝 *Detalle de gastos:*\n`;
    sortedExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      const day = d.getDate();
      const shortMonth = d.toLocaleDateString('es-AR', { month: 'short' });
      messageText += `• ${day} ${shortMonth} - ${exp.description}: ${formatCurrency(exp.amount)} (${exp.jarName})\n`;
    });
  }

  const handleCopy = async () => {
    try {
      soundFX.playClick();
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    soundFX.playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          backgroundColor: '#13131a',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B'
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <h3
                className="font-pixel"
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FBBF24',
                  margin: 0,
                  letterSpacing: '0.03em'
                }}
              >
                EXPORTAR GASTOS
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                Resumen listo para enviar por WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Month Selector */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#FBBF24',
                marginBottom: '8px',
                letterSpacing: '0.03em'
              }}
            >
              <Calendar size={15} />
              <span>ELEGIR MES A EXPORTAR</span>
            </label>
            <select
              value={selectedMonthKey}
              onChange={(e) => {
                soundFX.playClick();
                setSelectedMonthKey(e.target.value);
              }}
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {monthOptions.map((opt) => (
                <option
                  key={opt.key}
                  value={opt.key}
                  style={{ backgroundColor: '#181822', color: '#FFFFFF' }}
                >
                  {opt.label} {opt.key === getCurrentMonthKey() ? '(Mes Actual)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 14px'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>TOTAL MES</div>
              <div className="font-arcade" style={{ fontSize: '20px', color: '#34D399', fontWeight: 700 }}>
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>REGISTROS</div>
              <div className="font-arcade" style={{ fontSize: '20px', color: '#FBBF24', fontWeight: 700 }}>
                {monthExpenses.length} {monthExpenses.length === 1 ? 'gasto' : 'gastos'}
              </div>
            </div>
          </div>

          {/* WhatsApp Message Preview */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.03em'
                }}
              >
                <MessageSquare size={15} style={{ color: '#25D366' }} />
                MENSAJE PARA WHATSAPP
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                Vista previa
              </span>
            </div>

            <div
              style={{
                position: 'relative',
                backgroundColor: 'rgba(11, 20, 16, 0.7)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '16px',
                padding: '14px',
                maxHeight: '220px',
                overflowY: 'auto'
              }}
            >
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: '#e5e7eb',
                  margin: 0
                }}
              >
                {messageText}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: copied ? '#10B981' : '#F59E0B',
                color: '#000000',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '14px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: copied
                  ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                  : '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  <span>¡MENSAJE COPIADO AL PORTAPAPELES!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>COPIAR MENSAJE PARA PEGAR</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#25D366',
                fontWeight: 700,
                fontSize: '14px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ExternalLink size={16} />
              <span>ABRIR DIRECTAMENTE EN WHATSAPP</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
