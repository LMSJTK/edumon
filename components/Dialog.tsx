
import React, { useEffect, useState } from 'react';

interface DialogProps {
  text: string;
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ text, onClose }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [index, text]);

  return (
    <div 
      className="absolute bottom-4 left-4 right-4 bg-slate-900 border-4 border-white p-4 rounded-lg shadow-lg cursor-pointer z-[100]"
      onClick={() => {
        if (index < text.length) {
            setDisplayedText(text);
            setIndex(text.length);
        } else {
            onClose();
        }
      }}
    >
      <p className="text-white text-lg font-mono leading-relaxed">{displayedText}</p>
      {index >= text.length && (
        <div className="absolute bottom-2 right-4 animate-bounce text-yellow-400">▼</div>
      )}
    </div>
  );
};
