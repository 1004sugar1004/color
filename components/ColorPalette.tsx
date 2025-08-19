import React, { useState, useEffect } from 'react';
import type { MunsellColor } from '../types';
import { MUNSELL_COLORS, NEUTRAL_COLORS, WARM_COLOR_CODES, COOL_COLOR_CODES } from '../constants';

interface ColorPaletteProps {
  onColorSelect: (color: MunsellColor) => void;
  selectedColors: (MunsellColor | null)[];
}

// Helper functions for SVG arc
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians)),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    ].join(' ');

    return d;
};


const ColorPalette: React.FC<ColorPaletteProps> = ({ onColorSelect, selectedColors }) => {
  const angleStep = 360 / MUNSELL_COLORS.length;
  const firstSelected = selectedColors[0];
  const [relationInfo, setRelationInfo] = useState<{similar: number[], opposite: number | null}>({similar: [], opposite: null});

  useEffect(() => {
      if (firstSelected && !NEUTRAL_COLORS.some(nc => nc.code === firstSelected.code)) {
          const index = MUNSELL_COLORS.findIndex(c => c.hex === firstSelected.hex);
          if (index > -1) {
              const similar = [(index - 1 + MUNSELL_COLORS.length) % MUNSELL_COLORS.length, (index + 1) % MUNSELL_COLORS.length];
              const opposite = (index + MUNSELL_COLORS.length / 2) % MUNSELL_COLORS.length;
              setRelationInfo({similar, opposite});
          }
      } else {
          setRelationInfo({similar: [], opposite: null});
      }
  }, [firstSelected]);
  
  const isSelected = (color: MunsellColor) => {
    return selectedColors.some(sc => sc?.hex === color.hex);
  };
  
  const numColors = MUNSELL_COLORS.length;
  const anglePerColor = 360 / numColors;
  const radius = 45;
  const center = 50;

  const getPosition = (index: number) => {
    const angle = anglePerColor * index - 90;
    return {
        x: center + radius * Math.cos(angle * Math.PI / 180),
        y: center + radius * Math.sin(angle * Math.PI / 180)
    };
  }

  const redPos = getPosition(MUNSELL_COLORS.findIndex(c => c.code === '5R'));
  const bgPos = getPosition(MUNSELL_COLORS.findIndex(c => c.code === '5BG'));
  
  const warmStartIndex = MUNSELL_COLORS.findIndex(c => c.code === '5R');
  const warmEndIndex = MUNSELL_COLORS.findIndex(c => c.code === '5Y');
  const warmStartAngle = (warmStartIndex - 0.5) * anglePerColor - 90;
  const warmEndAngle = (warmEndIndex + 0.5) * anglePerColor - 90;

  const coolStartIndex = MUNSELL_COLORS.findIndex(c => c.code === '5BG');
  const coolEndIndex = MUNSELL_COLORS.findIndex(c => c.code === '5PB');
  const coolStartAngle = (coolStartIndex - 0.5) * anglePerColor - 90;
  const coolEndAngle = (coolEndIndex + 0.5) * anglePerColor - 90;

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">1. 섞을 색을 골라보세요!</h2>
      
      <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 rounded-lg mb-6 shadow-sm text-sm">
          <p><strong className="font-bold">💡 비슷한 색:</strong> 색상환에서 양쪽 주변에 있는 색</p>
          <p className="mt-2"><strong className="font-bold">🎨 반대색:</strong> 색상환에서 마주보고 있는 색</p>
      </div>

      <div className="relative mb-8 mt-4">
        <div className="absolute top-0 right-0 text-center -translate-y-8">
            <div className="font-bold text-orange-500">따뜻한 색</div>
            <div className="text-sm text-gray-500">(빨강, 주황, 노랑)</div>
        </div>

        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
            {MUNSELL_COLORS.map((color, index) => {
            const pos = getPosition(index);
            const isWarm = WARM_COLOR_CODES.includes(color.code);
            const isCool = COOL_COLOR_CODES.includes(color.code);
            const isSimilar = relationInfo.similar.includes(index);
            const isOpposite = relationInfo.opposite === index;

            return (
                <button
                key={color.hex}
                onClick={() => onColorSelect(color)}
                className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center text-white text-xs shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 hover:z-10 
                    ${isSelected(color) ? 'ring-4 ring-offset-2 ring-yellow-400 scale-105' : 'ring-2 ring-white'}
                    ${isWarm && !isSelected(color) ? 'shadow-orange-400/50' : ''}
                    ${isCool && !isSelected(color) ? 'shadow-blue-400/50' : ''}
                `}
                style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                    backgroundColor: color.hex,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
                aria-label={`Select ${color.name}`}
                >
                {(isSimilar || isOpposite) && (
                    <span className={`absolute -top-5 text-xs font-bold px-2 py-0.5 rounded-full shadow ${isOpposite ? 'bg-purple-500 text-white' : 'bg-green-400 text-white'}`}>
                        {isOpposite ? '반대색' : '비슷한 색'}
                    </span>
                )}
                <span className="font-bold">{color.name}</span>
                <span className="opacity-80">{color.code}</span>
                </button>
            );
            })}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-inner flex items-center justify-center text-center text-gray-500 font-bold p-2">
            </div>
            <svg
                className="absolute inset-0 w-full h-full overflow-visible"
                viewBox="-30 -30 160 160" 
                style={{ pointerEvents: 'none' }}
            >
                <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563"></path>
                </marker>
                <linearGradient id="warm-gradient" gradientTransform="rotate(45)">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
                <linearGradient id="cool-gradient" gradientTransform="rotate(225)">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                </defs>
                
                <g>
                {/* Warm Arc */}
                <path
                    d={describeArc(50, 50, 60, warmStartAngle, warmEndAngle)}
                    fill="none"
                    stroke="url(#warm-gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                {/* Cool Arc */}
                <path
                    d={describeArc(50, 50, 60, coolStartAngle, coolEndAngle)}
                    fill="none"
                    stroke="url(#cool-gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                {/* Opposite Color Arrow */}
                <line
                    x1={redPos.x}
                    y1={redPos.y}
                    x2={bgPos.x}
                    y2={bgPos.y}
                    stroke="#4b5563"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    markerStart="url(#arrow)"
                    markerEnd="url(#arrow)"
                />
                <text x={50} y={50} fill="#374151" fontSize="8px" fontWeight="bold" dominantBaseline="middle" textAnchor="middle" transform={`translate(0, -5)`}>
                    반대색
                </text>
                </g>
            </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 text-center translate-y-8">
            <div className="font-bold text-blue-500">차가운 색</div>
            <div className="text-sm text-gray-500">(남색, 파랑, 청록)</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="flex justify-center items-center gap-6">
          {NEUTRAL_COLORS.map(color => (
            <button
              key={color.hex}
              onClick={() => onColorSelect(color)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-xs shadow-lg transition-all duration-300 hover:scale-110 ${isSelected(color) ? 'ring-4 ring-offset-2 ring-yellow-400 scale-105' : 'ring-2 ring-gray-300'}`}
              style={{ 
                backgroundColor: color.hex,
                color: color.hex === '#FFFFFF' ? '#000000' : '#FFFFFF',
                textShadow: color.hex === '#FFFFFF' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)'
              }}
              aria-label={`Select ${color.name}`}
            >
              <span className="font-bold text-lg">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ColorPalette;