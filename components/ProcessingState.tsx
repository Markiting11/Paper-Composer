
import React, { useEffect, useState } from 'react';

const ProcessingState: React.FC = () => {
  const [dots, setDots] = useState('');
  const messages = [
    "Analyzing handwriting patterns...",
    "Correcting spelling and grammar...",
    "Formatting questions and sections...",
    "Aligning mathematical expressions...",
    "Polishing the A4 layout...",
    "Generating professional headers..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Composing Your Paper{dots}
      </h2>
      <p className="text-slate-500 animate-pulse h-6">
        {messages[msgIdx]}
      </p>
      
      <div className="mt-12 w-full max-w-md bg-slate-200 h-2 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full animate-[loading_10s_ease-in-out_infinite]"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
};

export default ProcessingState;
