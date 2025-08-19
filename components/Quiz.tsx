import React, { useState, useEffect, useCallback } from 'react';
import type { MunsellColor, QuizQuestion } from '../types';
import { generateMixQuestion, generateRelationQuestion } from '../utils/colorUtils';
import { CheckIcon, XIcon, PlusIcon } from './Icons';

const Quiz: React.FC = () => {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [score, setScore] = useState(0);
    const [selectedRelationAnswers, setSelectedRelationAnswers] = useState<MunsellColor[]>([]);

    const generateQuestion = useCallback(() => {
        const quizType = Math.random() < 0.6 ? 'MIX' : 'RELATION'; // 60% mix, 40% relation
        let newQuestion: QuizQuestion | null;

        if (quizType === 'MIX') {
            newQuestion = generateMixQuestion();
        } else {
            newQuestion = generateRelationQuestion();
        }
        
        setQuestion(newQuestion);
        setFeedback(null);
        setSelectedRelationAnswers([]);
    }, []);

    useEffect(() => {
        generateQuestion();
    }, [generateQuestion]);

    const handleAnswer = (selectedAnswer: [MunsellColor, MunsellColor] | MunsellColor) => {
        if (feedback || !question) return;

        if (question.type === 'MIX' && Array.isArray(selectedAnswer)) {
            const correctAnswer = question.correctAnswer;
            const isCorrect = (selectedAnswer[0].hex === correctAnswer[0].hex && selectedAnswer[1].hex === correctAnswer[1].hex) ||
                        (selectedAnswer[0].hex === correctAnswer[1].hex && selectedAnswer[1].hex === correctAnswer[0].hex);
            
            if (isCorrect) {
                setFeedback('correct');
                setScore(s => s + 10);
                setTimeout(() => generateQuestion(), 1500);
            } else {
                setFeedback('incorrect');
                setTimeout(() => setFeedback(null), 1500);
            }
        } else if (question.type === 'RELATION' && !Array.isArray(selectedAnswer)) {
            const singleSelectedColor = selectedAnswer;

            if (question.relationType === 'OPPOSITE') {
                const isCorrect = question.correctAnswers.some(c => c.hex === singleSelectedColor.hex);
                if (isCorrect) {
                    setFeedback('correct');
                    setScore(s => s + 10);
                    setTimeout(() => generateQuestion(), 1500);
                } else {
                    setFeedback('incorrect');
                    setTimeout(() => setFeedback(null), 1500);
                }
            } else { // SIMILAR - multi-select
                const newSelection = selectedRelationAnswers.some(c => c.hex === singleSelectedColor.hex)
                    ? selectedRelationAnswers.filter(c => c.hex !== singleSelectedColor.hex)
                    : [...selectedRelationAnswers, singleSelectedColor];

                setSelectedRelationAnswers(newSelection);

                if (newSelection.length === 2) {
                    const selectedHexes = newSelection.map(c => c.hex).sort();
                    const correctHexes = question.correctAnswers.map(c => c.hex).sort();
                    const isCorrect = JSON.stringify(selectedHexes) === JSON.stringify(correctHexes);
                    
                    if (isCorrect) {
                        setFeedback('correct');
                        setScore(s => s + 10);
                        setTimeout(() => generateQuestion(), 1500);
                    } else {
                        setFeedback('incorrect');
                        setTimeout(() => {
                            setFeedback(null);
                            setSelectedRelationAnswers([]);
                        }, 1500);
                    }
                }
            }
        }
    }

    if (!question) {
        return <div className="text-center p-10 text-xl font-bold">퀴즈를 불러오는 중...</div>;
    }
    
    const renderQuestion = () => {
        if (question.type === 'MIX') {
            return (
                <>
                    <p className="text-lg md:text-xl text-center text-gray-800 mb-2">아래의 색깔을 만들려면 어떤 색들을 섞어야 할까요?</p>
                    <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-8 border-white shadow-xl mb-8 flex items-center justify-center text-center" style={{ backgroundColor: question.targetColor.hex }}>
                        <p className="font-bold text-2xl" style={{ color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                            {question.targetColor.name}
                        </p>
                    </div>
                </>
            );
        }
        if (question.type === 'RELATION') {
            const relationText = question.relationType === 'SIMILAR' ? '비슷한' : '반대되는';
            return (
                <>
                     <p className="text-lg md:text-xl text-center text-gray-800 mb-2">
                        <span className="font-bold p-2 rounded-lg" style={{backgroundColor: question.targetColor.hex, color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.5)'}}>{question.targetColor.name}</span>
                        과(와) <span className="font-bold text-blue-600">{relationText}</span> 색은 무엇일까요?
                        {question.relationType === 'SIMILAR' && <span className="block text-base text-gray-500 mt-1">정답 2개를 골라주세요!</span>}
                    </p>
                    <div className="w-48 h-12 md:w-56 h-12 mb-8"></div>
                </>
            )
        }
    };

    const renderOptions = () => {
        if (question.type === 'MIX') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    {question.options.map((pair, index) => (
                        <button 
                            key={index}
                            onClick={() => handleAnswer(pair)}
                            className="flex items-center justify-center gap-4 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-gray-100" style={{backgroundColor: pair[0].hex}}></div>
                            <PlusIcon className="w-6 h-6 text-gray-500" />
                            <div className="w-16 h-16 rounded-full border-4 border-gray-100" style={{backgroundColor: pair[1].hex}}></div>
                        </button>
                    ))}
                </div>
            );
        }
        if (question.type === 'RELATION') {
            return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                     {question.options.map((color, index) => {
                        const isSelected = selectedRelationAnswers.some(c => c.hex === color.hex);
                        return (
                            <button 
                                key={index}
                                onClick={() => handleAnswer(color)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                            >
                                <div className="w-20 h-20 rounded-full border-4 border-gray-100" style={{backgroundColor: color.hex}}></div>
                                <p className="font-bold text-gray-700">{color.name}</p>
                            </button>
                        )
                    })}
                </div>
            );
        }
    };


    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-700">알록달록 색깔 퀴즈!</h2>
                 <div className="text-xl md:text-2xl font-bold bg-yellow-400 text-white px-4 py-2 rounded-full shadow-md">점수: {score}</div>
            </div>

            {renderQuestion()}

            <div className="relative w-full flex justify-center">
                {renderOptions()}
                {feedback === 'correct' && <div className="absolute inset-0 bg-green-500 bg-opacity-80 rounded-3xl flex items-center justify-center"><CheckIcon className="w-32 h-32 text-white"/></div>}
                {feedback === 'incorrect' && <div className="absolute inset-0 bg-red-500 bg-opacity-80 rounded-3xl flex items-center justify-center"><XIcon className="w-32 h-32 text-white"/></div>}
            </div>

            <button onClick={generateQuestion} className="mt-8 bg-blue-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-blue-600 transition-transform hover:scale-105">
                다른 문제 풀기
            </button>
        </div>
    );
};

export default Quiz;