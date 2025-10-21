
import React, { useState, useEffect, useCallback } from 'react';
import type { MunsellColor, SavedColor } from './types';
import { mixTwoColors } from './utils/colorUtils';
import ColorPalette from './components/ColorPalette';
import MixerDisplay from './components/MixerDisplay';
import SavedColorsList from './components/SavedColorsList';
import Quiz from './components/Quiz';

const App: React.FC = () => {
    const [mode, setMode] = useState<'mix' | 'quiz'>('mix');
    const [selectedColors, setSelectedColors] = useState<(MunsellColor | null)[]>([null, null]);
    const [mixedColor, setMixedColor] = useState<MunsellColor | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
    const [mixRatio, setMixRatio] = useState(0.5);

    useEffect(() => {
        try {
            const storedColors = localStorage.getItem('savedColors');
            if (storedColors) {
                setSavedColors(JSON.parse(storedColors));
            }
        } catch (error) {
            console.error("Failed to load saved colors from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('savedColors', JSON.stringify(savedColors));
        } catch (error) {
            console.error("Failed to save colors to localStorage", error);
        }
    }, [savedColors]);

    const handleColorSelect = useCallback((color: MunsellColor) => {
        setFeedback('');
        setMixRatio(0.5);
        const newSelectedColors = [...selectedColors];
        const alreadySelected = newSelectedColors.some(c => c?.hex === color.hex);

        if (alreadySelected) return;

        const emptySlotIndex = newSelectedColors.indexOf(null);
        if (emptySlotIndex !== -1) {
            newSelectedColors[emptySlotIndex] = color;
        } else {
            // If both slots are full, replace the first one and clear the second
            newSelectedColors[0] = color;
            newSelectedColors[1] = null;
            setMixedColor(null);
        }
        setSelectedColors(newSelectedColors);
    }, [selectedColors]);
    
    useEffect(() => {
        const [color1, color2] = selectedColors;
        if (color1 && color2) {
            if (color1.hex === color2.hex) {
                setFeedback('같은 색이에요!');
                setMixedColor(color1);
            } else {
                setFeedback('');
                const result = mixTwoColors(color1, color2, mixRatio);
                setMixedColor(result);
            }
        } else {
            setMixedColor(null);
            setFeedback('');
        }
    }, [selectedColors, mixRatio]);

    const handleUndo = () => {
        setSelectedColors([null, null]);
        setMixedColor(null);
        setFeedback('');
        setMixRatio(0.5);
    };

    const handleClearSlot = (index: number) => {
        const newSelectedColors = [...selectedColors];
        newSelectedColors[index] = null;
        setMixRatio(0.5);
        // To keep the selected color in the first slot
        if(index === 0 && newSelectedColors[1]) {
            newSelectedColors[0] = newSelectedColors[1];
            newSelectedColors[1] = null;
        }
        setSelectedColors(newSelectedColors);
    };

    const handleSaveColor = (name: string): boolean => {
        if (savedColors.some(c => c.customName === name)) {
            return false; // Name already exists
        }
        if (mixedColor) {
            const newSavedColor: SavedColor = {
                id: new Date().toISOString(),
                customName: name,
                color: mixedColor,
            };
            setSavedColors(prev => [newSavedColor, ...prev]);
            return true;
        }
        return false;
    };

    const handleDeleteColor = (id: string) => {
        setSavedColors(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                        알록달록 색깔 연구소
                    </h1>
                    <nav className="mt-4 md:mt-0 flex items-center gap-2 bg-gray-200 p-1 rounded-full">
                        <button 
                            onClick={() => setMode('mix')}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${mode === 'mix' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
                            색깔 섞기
                        </button>
                        <button 
                            onClick={() => setMode('quiz')}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${mode === 'quiz' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
                            색깔 퀴즈
                        </button>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto p-4 flex-grow w-full">
                {mode === 'mix' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                        <div className="lg:sticky lg:top-24 h-max">
                            <ColorPalette onColorSelect={handleColorSelect} selectedColors={selectedColors} />
                        </div>
                        <div>
                            <MixerDisplay 
                                selectedColors={selectedColors} 
                                mixedColor={mixedColor}
                                feedback={feedback}
                                mixRatio={mixRatio}
                                onRatioChange={setMixRatio}
                                onUndo={handleUndo}
                                onSave={handleSaveColor}
                                onClearSlot={handleClearSlot}
                            />
                            <div className="my-8 border-t-2 border-dashed border-gray-300"></div>
                            <SavedColorsList savedColors={savedColors} onDelete={handleDeleteColor} />
                        </div>
                    </div>
                ) : (
                    <Quiz />
                )}
            </main>

            <footer className="text-center py-4 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} 색깔 혼합 연구소. 즐겁게 배워요!</p>
                <p className="mt-1">오류 문의 : <a href="mailto:nalrary@mensakorea.org" className="hover:underline text-blue-500">nalrary@mensakorea.org</a></p>
            </footer>
        </div>
    );
};

export default App;
