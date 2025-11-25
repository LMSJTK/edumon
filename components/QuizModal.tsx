
import React from 'react';
import { QuizQuestion } from '../types';
import { BookOpen } from 'lucide-react';

interface QuizModalProps {
  question: QuizQuestion;
  onAnswer: (index: number) => void;
  title?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({ question, onAnswer, title = "Knowledge Check" }) => {
  return (
    <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-6">
      <div className="bg-slate-800 border-4 border-indigo-500 rounded-xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-4">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-indigo-300 text-sm">Select the correct answer.</p>
          </div>
        </div>
        
        <p className="text-lg mb-6 font-medium text-slate-100">{question.question}</p>
        
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(idx)}
              className="p-4 text-left bg-slate-700 hover:bg-indigo-600 border border-slate-600 rounded-lg transition-all font-medium text-white"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
