
import React from 'react';
import { ExamPaperData, ExamSection, ExamQuestion } from '../types';

interface EditorSectionProps {
  data: ExamPaperData;
  onChange: (newData: ExamPaperData) => void;
}

const EditorSection: React.FC<EditorSectionProps> = ({ data, onChange }) => {
  const updateField = (field: keyof ExamPaperData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateSection = (sIdx: number, updates: Partial<ExamSection>) => {
    const newSections = [...data.sections];
    newSections[sIdx] = { ...newSections[sIdx], ...updates };
    onChange({ ...data, sections: newSections });
  };

  const updateQuestion = (sIdx: number, qIdx: number, updates: Partial<ExamQuestion>) => {
    const newSections = [...data.sections];
    const newQuestions = [...newSections[sIdx].questions];
    newQuestions[qIdx] = { ...newQuestions[qIdx], ...updates };
    newSections[sIdx] = { ...newSections[sIdx], questions: newQuestions };
    onChange({ ...data, sections: newSections });
  };

  const addQuestion = (sIdx: number) => {
    const newSections = [...data.sections];
    newSections[sIdx].questions.push({
      id: Math.random().toString(36).substr(2, 9),
      number: (newSections[sIdx].questions.length + 1).toString(),
      text: "Enter new question text...",
      marks: "5"
    });
    onChange({ ...data, sections: newSections });
  };

  return (
    <div className="h-full flex flex-col bg-white no-print">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          Paper Editor
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-8 space-y-10">
        <section className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Header Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Institution Title</label>
              <input 
                type="text" 
                value={data.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1rem] focus:ring-4 focus:ring-blue-50 outline-none font-bold transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Subject</label>
                <input 
                  type="text" 
                  value={data.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1rem] outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Total Marks</label>
                <input 
                  type="text" 
                  value={data.totalMarks}
                  onChange={(e) => updateField('totalMarks', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[1rem] outline-none font-bold text-center"
                />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-8">
          {data.sections.map((section, sIdx) => (
            <div key={sIdx} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 space-y-6">
              <input 
                type="text" 
                value={section.title}
                onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                className="w-full font-black text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none p-1 transition-all"
              />
              
              <div className="space-y-4">
                {section.questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="bg-white border border-slate-200 rounded-[1.25rem] p-5 shadow-sm">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <input 
                          type="text" 
                          value={q.number}
                          onChange={(e) => updateQuestion(sIdx, qIdx, { number: e.target.value })}
                          className="w-10 text-center font-black text-blue-600 bg-blue-50 rounded-lg p-1 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <textarea 
                          value={q.text}
                          onChange={(e) => updateQuestion(sIdx, qIdx, { text: e.target.value })}
                          className="w-full text-sm font-medium bg-transparent outline-none resize-none leading-relaxed"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => addQuestion(sIdx)}
                  className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-[1.25rem] text-slate-400 font-bold text-sm hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + Add Question
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default EditorSection;
