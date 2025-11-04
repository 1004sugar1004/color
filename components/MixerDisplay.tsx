import React, { useState } from 'react';
import type { MunsellColor } from '../types';
import { SaveIcon, UndoIcon } from './Icons';

interface MixerDisplayProps {
  selectedColors: (MunsellColor | null)[];
  mixedColor: MunsellColor | null;
  feedback: string;
  mixRatio: number;
  onRatioChange: (ratio: number) => void;
  onUndo: () => void;
  onSave: (name: string) => boolean;
  onClearSlot: (index: number) => void;
}

const ColorSlot: React.FC<{ color: MunsellColor | null; onClear: () => void; }> = ({ color, onClear }) => {
    return (
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white shadow-inner border-4 border-gray-200 flex items-center justify-center transition-colors duration-300"
             style={{ backgroundColor: color ? color.hex : '#fff' }}>
            {color && (
                <>
                    <div className="text-white text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                        <p className="font-bold text-lg">{color.name}</p>
                        <p className="text-sm">{color.code}</p>
                    </div>
                    <button onClick={onClear} className="absolute -top-3 -right-3 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-transform hover:scale-110">
                        &times;
                    </button>
                </>
            )}
        </div>
    );
}

const RatioDisplay: React.FC<{ percent: number }> = ({ percent }) => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    
    const commonDivisor = gcd(percent, 100);
    const num = percent / commonDivisor;
    const den = 100 / commonDivisor;

    return (
        <div className="flex flex-col items-center mt-2">
            <p className="text-xl font-bold text-gray-800 tracking-wider">
                {percent}%
            </p>
            {den > 1 ? (
                <div className="flex flex-col items-center text-lg font-bold text-gray-700 mt-1" aria-label={`분수 ${den}분의 ${num}`}>
                    <span>{num}</span>
                    <span className="border-t-2 border-gray-700 w-6 my-0.5"></span>
                    <span>{den}</span>
                </div>
            ) : (
                <div className="h-[58px]"></div>
            )}
        </div>
    );
};


const MixerDisplay: React.FC<MixerDisplayProps> = ({ selectedColors, mixedColor, feedback, mixRatio, onRatioChange, onUndo, onSave, onClearSlot }) => {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [colorName, setColorName] = useState('');
    const [saveError, setSaveError] = useState('');

    const handleSaveClick = () => {
        if (mixedColor) {
            setShowSaveModal(true);
            setColorName(mixedColor.name === '새로운 색' ? '' : mixedColor.name);
            setSaveError('');
        }
    };
    
    const handleConfirmSave = () => {
        if (!colorName.trim()) {
            setSaveError('이름을 입력해주세요!');
            return;
        }
        const success = onSave(colorName.trim());
        if(success) {
            setShowSaveModal(false);
        } else {
            setSaveError('이미 사용 중인 이름입니다!');
        }
    }

    const showSlider = selectedColors[0] && selectedColors[1];
    
    // Per user feedback, reverting to the "reversed" ratio logic.
    // The slider's mixRatio represents the proportion of the RIGHT color.
    // 0 = 100% left, 0% right. 1 = 0% left, 100% right.
    const percent_right = Math.round(mixRatio * 100);
    const percent_left = 100 - percent_right;

    return (
        <div className="w-full bg-gray-200 rounded-3xl p-4 md:p-8 my-6 shadow-lg">
             <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">2. 색을 섞어봐요!</h2>
             <p className="text-center text-gray-500 -mt-4 mb-6">💡 색을 넣고 비율을 조절해 보세요!</p>
            <div className="flex justify-around items-start gap-2">
                {/* Left Slot & Ratio */}
                <div className="flex flex-col items-center">
                    <ColorSlot color={selectedColors[0]} onClear={() => onClearSlot(0)} />
                    {showSlider && <RatioDisplay percent={percent_left} />}
                </div>

                {/* Center Control */}
                <div className="flex-grow flex flex-col items-center justify-center max-w-xs pt-16">
                    {showSlider ? (
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={mixRatio}
                            onChange={e => onRatioChange(parseFloat(e.target.value))}
                            className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, ${selectedColors[0]?.hex} 0%, ${selectedColors[1]?.hex} 100%)`
                            }}
                        />
                    ) : (
                        <span className="text-4xl font-bold text-gray-400">+</span>
                    )}
                </div>

                 {/* Right Slot & Ratio */}
                 <div className="flex flex-col items-center">
                    <ColorSlot color={selectedColors[1]} onClear={() => onClearSlot(1)} />
                    {showSlider && <RatioDisplay percent={percent_right} />}
                 </div>
            </div>

            <div className="my-6 text-center text-4xl font-bold text-gray-500">=</div>
            
            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full shadow-lg border-8 border-white flex items-center justify-center transition-colors duration-500"
                 style={{ backgroundColor: mixedColor ? mixedColor.hex : '#e5e7eb' }}>
                {mixedColor && (
                     <div className="text-white text-center" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                        <p className="font-bold text-2xl md:text-3xl">{mixedColor.name}</p>
                        {mixedColor.code !== '혼합색' && <p className="text-md md:text-lg">{mixedColor.code}</p>}
                    </div>
                )}
                 {feedback && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white text-xl font-bold p-4">
                        {feedback}
                    </div>
                 )}
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={onUndo} className="flex items-center gap-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded-full shadow-md hover:bg-yellow-600 transition-transform hover:scale-105">
                    <UndoIcon className="w-5 h-5" />
                    다시하기
                </button>
                <button 
                    onClick={handleSaveClick} 
                    disabled={!mixedColor || !!feedback}
                    className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full shadow-md hover:bg-green-600 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <SaveIcon className="w-5 h-5" />
                    저장하기
                </button>
            </div>
            
            {showSaveModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-sm text-center">
                         <h3 className="text-xl font-bold mb-4">색깔 이름 짓기</h3>
                         <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-inner" style={{backgroundColor: mixedColor?.hex}}></div>
                         <input 
                             type="text"
                             value={colorName}
                             onChange={(e) => setColorName(e.target.value)}
                             placeholder="예: 바다색, 레몬색"
                             className="w-full border-2 border-gray-300 rounded-lg p-2 text-center focus:border-blue-500 focus:ring-blue-500"
                         />
                         {saveError && <p className="text-red-500 text-sm mt-2">{saveError}</p>}
                         <div className="flex gap-4 mt-6">
                            <button onClick={() => setShowSaveModal(false)} className="w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition">취소</button>
                            <button onClick={handleConfirmSave} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition">저장</button>
                         </div>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default MixerDisplay;