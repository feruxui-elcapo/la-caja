import React from 'react';
import type { Jar } from '../types';
import { Minus, ShoppingCart, Zap, Coffee, Box, PiggyBank, HeartHandshake } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface GlassJarProps {
  jar: Jar;
  spentAmount: number;
  onDeductClick: (jar: Jar) => void;
}

export const GlassJar: React.FC<GlassJarProps> = ({ jar, spentAmount, onDeductClick }) => {
  const remaining = Math.max(0, jar.allocatedBudget - spentAmount);
  const remainingPercent = jar.allocatedBudget > 0 
    ? Math.max(0, Math.min(100, (remaining / jar.allocatedBudget) * 100))
    : 0;

  // Chibi Face & 8-Bit Fill Color logic
  let fillColor = '#10B981'; // Pixel emerald
  let chibiFace = '( ◠‿◠ )';
  let chibiEmotion = 'Lleno ★';

  if (remainingPercent < 25) {
    fillColor = '#EF4444'; // Pixel red
    chibiFace = '( > ﹏ < )';
    chibiEmotion = '¡Socorro!';
  } else if (remainingPercent < 60) {
    fillColor = '#F59E0B'; // Pixel amber
    chibiFace = '( • ɷ • )';
    chibiEmotion = 'Ajustado';
  }

  const renderIcon = () => {
    switch (jar.icon) {
      case 'shopping-cart': return <ShoppingCart size={18} className="text-black" />;
      case 'zap': return <Zap size={18} className="text-black" />;
      case 'coffee': return <Coffee size={18} className="text-black" />;
      case 'piggy': return <PiggyBank size={18} className="text-black" />;
      case 'heart': return <HeartHandshake size={18} className="text-black" />;
      default: return <Box size={18} className="text-black" />;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleButtonClick = () => {
    soundFX.playClick();
    onDeductClick(jar);
  };

  return (
    <div className="chibi-jar-container">
      <div className="chibi-glass-jar">
        {/* 8-Bit Wooden Lid */}
        <div className="chibi-jar-lid" />
        <div className="chibi-jar-neck" />

        {/* 8-Bit Pixel Liquid / Money Fill */}
        <div 
          className="chibi-fill-container"
          style={{ height: `${remainingPercent}%` }}
        >
          <div 
            className="chibi-fill-pixel"
            style={{ backgroundColor: fillColor }}
          >
            {/* Floating Pixel Coins */}
            <div className="absolute inset-0 flex items-center justify-around opacity-30 text-white font-pixel-title text-xs pixel-coin-float">
              <span>$</span>
              <span>$</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between pt-2">
          {/* Chibi Face Badge */}
          <div className="chibi-face-container">
            <span className="font-extrabold text-sm">{chibiFace}</span>
            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-900">{chibiEmotion}</span>
          </div>

          {/* Pixel Paper Label */}
          <div className="bg-[#FAF0CA] border-3 border-black p-3 rounded-xl shadow-[3px_3px_0_0_#000] text-black text-center my-2">
            <div className="flex items-center justify-center gap-1.5 font-pixel-title text-xs font-bold text-black mb-1">
              {renderIcon()}
              <span>{jar.name}</span>
            </div>

            <div className="my-1.5">
              <span className="block text-[9px] font-pixel-title uppercase text-gray-700">Queda:</span>
              <div className="font-pixel-title text-sm md:text-base font-black text-black tracking-tight">
                {formatCurrency(remaining)}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] pt-1 border-t-2 border-dashed border-black/30 font-pixel-body font-bold">
              <span>Total:</span>
              <span>{formatCurrency(jar.allocatedBudget)}</span>
            </div>

            <div className="mt-1 text-[10px] font-pixel-title text-right text-emerald-900 font-extrabold">
              {remainingPercent.toFixed(0)}%
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleButtonClick}
            className="btn-pixel btn-pixel-red py-2.5 px-3 rounded-xl text-xs font-bold w-full flex items-center justify-center gap-1.5 mt-2"
          >
            <Minus size={16} strokeWidth={3} />
            <span>- Anotar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
