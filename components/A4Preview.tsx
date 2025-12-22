
import React from 'react';
import { ExamPaperData } from '../types';

interface A4PreviewProps {
  data: ExamPaperData;
  id?: string;
  isExportVersion?: boolean;
}

const stripOptionLabel = (text: string): string => {
  if (!text) return "";
  return text.replace(/^(\(?[a-zA-Z0-9]\s?[\)\.]\s?)/i, '').trim();
};

const stripQuestionPrefix = (num: string): string => {
  if (!num) return "";
  return num.replace(/^(Q|Question|Quest|Q\.)\s*\.?\s*/i, '').trim();
};

const FormattedMathText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Regex to match: 
  // 1. ^{...} or _{...} (braced multi-char)
  // 2. ^x or _x (single char)
  const mathRegex = /(\^\{[^}]+\}|_\{[^}]+\}|\^[a-zA-Z0-9]|_[a-zA-Z0-9])/g;
  const parts = text.split(mathRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('^')) {
          // Remove ^ and potential {}
          const exponent = part.startsWith('^{') 
            ? part.slice(2, -1) 
            : part.slice(1);
          return <sup key={index} className="text-[0.8em] leading-none align-baseline relative -top-[0.5em]">{exponent}</sup>;
        } else if (part.startsWith('_')) {
          // Remove _ and potential {}
          const subscript = part.startsWith('_{') 
            ? part.slice(2, -1) 
            : part.slice(1);
          return <sub key={index} className="text-[0.8em] leading-none align-baseline relative top-[0.3em]">{subscript}</sub>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const A4Preview: React.FC<A4PreviewProps> = ({ data, id, isExportVersion = false }) => {
  return (
    <div 
      id={id}
      className={`a4-page bg-white text-black ${!isExportVersion ? 'shadow-2xl origin-top scale-[0.75] md:scale-[0.8] lg:scale-[0.9] xl:scale-100' : ''}`} 
      style={{
        width: '210mm',
        minHeight: isExportVersion ? '0' : '297mm',
        padding: '15mm 20mm', 
        fontFamily: "'Times New Roman', Times, serif",
        boxSizing: 'border-box',
        color: 'black',
        backgroundColor: 'white',
        lineHeight: '1.5',
        position: 'relative',
        margin: '0 auto',
        display: 'block',
        textAlign: 'left',
        overflow: 'visible'
      }}
    >
      {/* Header */}
      <div style={{ pageBreakInside: 'avoid', marginBottom: '25px' }}>
        <div className="text-center mb-4">
          <h1 className="text-[20pt] font-bold uppercase tracking-tight leading-tight mb-2">
            {data.title || "EXAMINATION PAPER"}
          </h1>
          <div className="w-full h-[1.5pt] bg-black"></div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-12 gap-y-4 text-[12pt]">
          <div className="col-span-8 flex items-end">
            <span className="font-bold mr-2">Subject:</span>
            <div className="flex-1 border-b border-black pb-0.5 px-2 font-medium">
              {data.subject}
            </div>
          </div>
          <div className="col-span-4 flex items-end justify-end">
            <span className="font-bold mr-2">Total Marks:</span>
            <div className="w-16 text-center border-b border-black pb-0.5 font-medium">
              {data.totalMarks}
            </div>
          </div>

          <div className="col-span-8 flex items-end">
            <span className="font-bold mr-2">Time Allowed:</span>
            <div className="flex-1 border-b border-black pb-0.5 px-2 font-medium">
              {data.timeAllowed}
            </div>
          </div>
          <div className="col-span-4 flex items-end justify-end">
            <span className="font-bold mr-2">Roll No:</span>
            <div className="w-32 border-b border-black pb-0.5">
              &nbsp;
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx} className="section" style={{ pageBreakInside: 'auto' }}>
            <div style={{ pageBreakInside: 'avoid', marginBottom: '15px' }}>
              <div className="flex justify-center mb-4">
                <div className="border-[1.5pt] border-black px-10 py-1.5 inline-block bg-white">
                  <h2 className="text-[13pt] font-bold uppercase tracking-widest leading-none text-center">
                    {section.title}
                  </h2>
                </div>
              </div>
              
              {section.instructions && (
                <div className="mb-6 flex justify-center">
                  <p className="italic text-[11pt] text-center border-y border-dotted border-black py-1.5 px-4 inline-block opacity-90">
                    (Instructions: <FormattedMathText text={section.instructions} />)
                  </p>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {section.questions.map((q, qIdx) => (
                <div 
                  key={q.id || qIdx} 
                  className="question-row flex gap-4 items-start" 
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div className="font-bold text-[12pt] min-w-[50px] text-left">
                    Q.{stripQuestionPrefix(q.number)}
                  </div>
                  <div className="flex-1 text-[12pt]">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 whitespace-pre-wrap leading-tight text-justify">
                        <FormattedMathText text={q.text} />
                      </div>
                      {q.marks && (
                        <div className="font-bold text-[11pt] whitespace-nowrap pt-0.5 text-right min-w-[40px]">
                          [{q.marks}]
                        </div>
                      )}
                    </div>
                    
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2 pl-6">
                        {q.subQuestions.map((sub, subIdx) => (
                          <div key={subIdx} className="flex gap-3 items-start" style={{ pageBreakInside: 'avoid' }}>
                            <span className="font-bold text-[12pt]">({String.fromCharCode(97 + subIdx)})</span>
                            <span className="flex-1 leading-tight text-left">
                              <FormattedMathText text={stripOptionLabel(sub)} />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* End Marker */}
      <div className="mt-16 text-center pt-8 pb-4" style={{ pageBreakInside: 'avoid' }}>
        <div className="inline-block border-y-[1.5pt] border-black py-1.5 px-16">
          <p className="text-[11pt] font-bold tracking-[0.5em] text-black uppercase">
            *** End of Paper ***
          </p>
        </div>
      </div>
    </div>
  );
};

export default A4Preview;
