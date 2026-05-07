
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ProcessingState from './components/ProcessingState';
import EditorSection from './components/EditorSection';
import A4Preview from './components/A4Preview';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { processHandwrittenImage } from './services/geminiService';
import { exportToDocx } from './services/wordExportService';
import { AppState, ExamPaperData, UploadedFile, User, UserStatus } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getUserProfile, 
  subscribeToAllUsers, 
  updateUserStatus as fsUpdateUserStatus, 
  getGlobalConfig,
  updateGlobalConfig
} from './services/userService';
import { saveExamPaper } from './services/examPaperService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [examData, setExamData] = useState<ExamPaperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setAuthLoading(true);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        if (profile && profile.status === 'APPROVED') {
          setCurrentUser(profile);
          // Only switch to landing if we were at AUTH or if we refreshed
          setAppState(prev => (prev === AppState.AUTH ? AppState.LANDING : prev));
        } else {
          setCurrentUser(null);
          setAppState(AppState.AUTH);
        }
      } else {
        setCurrentUser(null);
        setAppState(AppState.AUTH);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Admin Listeners
  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      const unsubUsers = subscribeToAllUsers(setUsers);
      const unsubConfig = getGlobalConfig((config) => {
        setSignupEnabled(config.signupEnabled);
      });
      return () => {
        unsubUsers();
        unsubConfig();
      };
    }
  }, [currentUser]);

  // Initial Config Listener (needed for Login screen)
  useEffect(() => {
    if (appState === AppState.AUTH) {
      const unsubConfig = getGlobalConfig((config) => {
        setSignupEnabled(config.signupEnabled);
      });
      return () => unsubConfig();
    }
  }, [appState]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState(AppState.LANDING);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setAppState(AppState.AUTH);
  };

  const updateUserStatus = async (id: string, status: UserStatus) => {
    await fsUpdateUserStatus(id, status);
  };

  const toggleSignup = async (enabled: boolean) => {
    await updateGlobalConfig(enabled);
  };

  const deleteUser = (id: string) => {
    // Note: We don't delete from auth in this simple version, just from Firestore
    // userService would need a delete implementation if needed
    console.log("Delete user requested for ID:", id);
  };

  const reset = () => {
    setAppState(AppState.LANDING);
    setUploadedFiles([]);
    setExamData(null);
    setError(null);
  };

  const startProcessing = async (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const base64Images = files.map(f => f.preview);
      const result = await processHandwrittenImage(base64Images);
      setExamData(result);
      
      // Save to Firebase for persistence
      if (currentUser) {
        await saveExamPaper(currentUser.id, result);
      }
      
      setAppState(AppState.EDITOR);
    } catch (err: any) {
      console.error(err);
      setError("Paper Composition Failed. Please make sure the image is clear and try again.");
      setAppState(AppState.LANDING);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-export-content');
    if (!element || !examData) return;

    setIsExportingPDF(true);
    
    const opt = {
      margin: 0,
      filename: `${(examData.subject || 'Exam_Paper').replace(/\s+/g, '_')}_Composed.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: 794,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      alert("PDF generation failed. Using 'Direct System Print' is recommended as a fallback.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportWord = async () => {
    if (!examData) return;
    try {
      await exportToDocx(examData);
    } catch (err) {
      console.error("Word Export Error:", err);
      alert("Word document generation failed. Please check your data and try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100">
      <Header 
        onReset={reset} 
        user={currentUser} 
        onLogout={handleLogout}
        onOpenAdmin={() => setAppState(AppState.ADMIN_PANEL)}
        currentState={appState}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden no-print">
        {appState === AppState.AUTH && (
          <Login 
            onLogin={handleLogin} 
            allowSignup={signupEnabled} 
          />
        )}

        {appState === AppState.ADMIN_PANEL && (
          <AdminPanel 
            users={users} 
            onApprove={(id) => updateUserStatus(id, 'APPROVED')}
            onReject={(id) => updateUserStatus(id, 'REJECTED')}
            onDelete={deleteUser}
            signupEnabled={signupEnabled}
            onToggleSignup={toggleSignup}
          />
        )}

        {appState === AppState.LANDING && (
          <div className="relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_70%)] -z-10"></div>
            
            <div className="max-w-5xl mx-auto w-full px-6 py-20 flex flex-col gap-20">
              <div className="text-center space-y-10">
                <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden p-2 border border-slate-100">
                    <img src="logo.png" alt="Anwar Ali Sehar Logo" className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Anwar+Ali+Sehar&background=0F172A&color=fff&bold=true";
                    }} />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-full text-xs font-black border border-slate-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  ANWAR ALI SEHAR PREMIER TOOL
                </div>
                
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter lg:text-8xl leading-[0.95] max-w-4xl mx-auto">
                  Handwritten to <br />
                  <span className="text-blue-600">Professional.</span>
                </h1>
                
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-semibold leading-relaxed">
                  Transform your handwritten notes into high-quality, 
                  structured examination papers with the power of Anwar Ali Sehar's AI technology.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-5 rounded-3xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <div className="bg-red-100 p-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <div className="shadow-2xl rounded-[2.5rem] overflow-hidden">
                <FileUploader onFilesSelected={startProcessing} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'AI Transcriber', desc: 'Precision conversion of diverse handwriting styles using Anwar Ali Sehar optimized models.', icon: '⚡' },
                  { title: 'Standard Layout', desc: 'Complies with official examination standards and professional A4 formatting.', icon: '⚖️' },
                  { title: 'Multi-Export', desc: 'Download as PDF or Word document for final distribution and printing.', icon: '📂' },
                ].map((feature, i) => (
                  <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-blue-100">
                    <div className="text-4xl mb-6">{feature.icon}</div>
                    <h3 className="font-black text-slate-900 text-lg mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-bold text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {appState === AppState.PROCESSING && (
          <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-xl">
            <ProcessingState />
          </div>
        )}

        {appState === AppState.EDITOR && examData && (
          <div className="flex-1 flex h-full overflow-hidden bg-slate-100">
            {/* Left Editor Panel */}
            <div className="w-[450px] flex flex-col bg-white border-r border-slate-200 shadow-2xl z-20 overflow-hidden no-print">
              <div className="flex-1 overflow-auto preview-scroll-container">
                <EditorSection data={examData} onChange={setExamData} />
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-200 no-print space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className={`flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-[1.25rem] font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all ${isExportingPDF ? 'opacity-50 cursor-wait' : 'hover:-translate-y-1'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isExportingPDF ? 'Processing...' : 'Export PDF'}
                  </button>
                  <button 
                    onClick={handleExportWord}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.25rem] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Word Doc
                  </button>
                </div>
                <button 
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-200 text-slate-700 rounded-[1.25rem] font-bold hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all shadow-md active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Direct System Print
                </button>
              </div>
            </div>

            {/* Preview Workspace */}
            <div className="flex-1 overflow-auto p-16 flex justify-center items-start scroll-smooth bg-slate-200/50 no-print">
              <A4Preview data={examData} />
            </div>
          </div>
        )}
      </main>

      {/* Capture container for PDF generation */}
      <div className="pdf-export-wrapper no-print">
        {examData && (
          <div id="pdf-export-content">
            <A4Preview data={examData} isExportVersion={true} />
          </div>
        )}
      </div>

      {/* Dedicated container for Direct System Print (only visible during print) */}
      <div className="print-only-container hidden">
        {examData && <A4Preview data={examData} isExportVersion={true} />}
      </div>

      <footer className="no-print border-t border-slate-200 py-16 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black overflow-hidden shadow-md">
              <img src="logo.png" alt="AS" className="w-full h-full object-cover" onError={(e) => {
                (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Anwar+Ali+Sehar&background=0F172A&color=fff&bold=true";
              }} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 tracking-tight text-xl uppercase">Anwar Ali Sehar</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Professional AI Composer</span>
            </div>
          </div>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">
            © 2024 Anwar Ali Sehar. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
