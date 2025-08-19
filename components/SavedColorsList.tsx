
import React from 'react';
import type { SavedColor } from '../types';
import { TrashIcon } from './Icons';

interface SavedColorsListProps {
  savedColors: SavedColor[];
  onDelete: (id: string) => void;
}

const SavedColorsList: React.FC<SavedColorsListProps> = ({ savedColors, onDelete }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">나만의 색상 목록</h2>
      {savedColors.length === 0 ? (
        <p className="text-center text-gray-500 bg-gray-200 p-6 rounded-2xl">아직 저장된 색상이 없어요. <br/>새로운 색을 만들어 저장해보세요!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {savedColors.map((savedColor) => (
            <div key={savedColor.id} className="bg-white rounded-2xl shadow-lg p-3 flex flex-col items-center text-center transition-transform hover:scale-105">
              <div 
                className="w-20 h-20 rounded-full mb-3 border-4 border-white shadow-inner" 
                style={{ backgroundColor: savedColor.color.hex }}
              ></div>
              <p className="font-bold text-gray-800 break-all">{savedColor.customName}</p>
              <p className="text-xs text-gray-500 mb-2">{savedColor.color.hex}</p>
              <button
                onClick={() => onDelete(savedColor.id)}
                className="mt-auto bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition"
                aria-label={`Delete ${savedColor.customName}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedColorsList;
