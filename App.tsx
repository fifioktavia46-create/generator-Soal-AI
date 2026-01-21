
import React, { useState } from 'react';
import { AssessmentData, FormInputs, Question } from './types';
import { generateAssessment, generateImageForQuestion } from './services/geminiService';
import InputForm from './components/InputForm';
import BlueprintTable from './components/BlueprintTable';
import QuestionPaper from './components/QuestionPaper';
import { Download, Printer, ArrowLeft, Table as TableIcon, FileText, Copy, Sparkles, Loader2, FileJson } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [activeTab, setActiveTab] = useState<'soal' | 'kisi-kisi'>('soal');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

  const handleGenerate = async (inputs: FormInputs) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      // Step 1: Generate Text Content
      const result = await generateAssessment(inputs);
      const initialData: AssessmentData = {
        ...inputs,
        phase: result.phase,
        cpReference: result.cpReference,
        questions: result.questions
      };
      
      setData(initialData);
      setLoading(false);

      // Step 2: Auto-generate images if needed
      const questionsToImg = initialData.questions.filter(q => q.needsImage);
      if (questionsToImg.length > 0) {
        setGeneratingImages(true);
        setProgress({ current: 0, total: questionsToImg.length });
        
        const updatedQuestions = [...initialData.questions];
        
        for (let i = 0; i < questionsToImg.length; i++) {
          const q = questionsToImg[i];
          try {
            const url = await generateImageForQuestion(q.imagePrompt || q.indicator);
            if (url) {
              const qIndex = updatedQuestions.findIndex(uq => uq.id === q.id);
              if (qIndex !== -1) {
                updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], generatedImageUrl: url };
                setData(prev => prev ? { ...prev, questions: [...updatedQuestions] } : null);
              }
            }
          } catch (err) {
            console.error("Failed to generate image for question " + q.id, err);
          }
          setProgress({ current: i + 1, total: questionsToImg.length });
        }
        setGeneratingImages(false);
        setProgress(null);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
      setLoading(false);
      setGeneratingImages(false);
    }
  };

  const updateQuestion = (updatedQ: Question) => {
    if (!data) return;
    const newQuestions = data.questions.map(q => q.id === updatedQ.id ? updatedQ : q);
    setData({ ...data, questions: newQuestions });
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToWord = () => {
    const el = document.getElementById('question-paper-root');
    if (el) {
      const range = document.createRange();
      range.selectNode(el);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      try {
        document.execCommand('copy');
        alert('Soal & Gambar berhasil disalin! Sekarang buka Microsoft Word dan tekan Ctrl+V.');
      } catch (err) {
        alert('Gagal menyalin secara otomatis. Silakan seleksi teks secara manual.');
      }
      window.getSelection()?.removeAllRanges();
    }
  };

  const copyTableToClipboard = () => {
    const table = document.querySelector('table');
    if (table) {
      const range = document.createRange();
      range.selectNode(table);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      alert('Tabel kisi-kisi disalin! Tempelkan (Paste) di Excel untuk hasil terbaik.');
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-lg mb-12 text-center">
           <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 font-bold text-xs mb-4 shadow-sm border border-indigo-100">
             <Sparkles size={14} /> Berbasis Gemini AI • Kurikulum Merdeka
           </div>
        </div>
        <InputForm onGenerate={handleGenerate} isLoading={loading} />
        {error && <p className="mt-6 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if(confirm('Mulai buat soal baru? Data saat ini akan hilang.')) setData(null); }}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Generator Soal AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.subject} • {data.grade}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('soal')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'soal' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileText size={16} /> Lembar Soal
            </button>
            <button 
              onClick={() => setActiveTab('kisi-kisi')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'kisi-kisi' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <TableIcon size={16} /> Kisi-kisi
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'soal' && (
              <button 
                onClick={copyToWord}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
              >
                <Copy size={16} /> Copy ke Word
              </button>
            )}
            {activeTab === 'kisi-kisi' && (
              <button 
                onClick={copyTableToClipboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"
              >
                <FileJson size={16} /> Copy ke Excel
              </button>
            )}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              <Printer size={16} /> Cetak
            </button>
          </div>
        </div>
        
        {/* Progress bar for image generation */}
        {generatingImages && progress && (
          <div className="w-full h-1 bg-slate-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
            <div className="max-w-6xl mx-auto px-4 py-1 flex justify-end">
               <p className="text-[10px] font-bold text-indigo-600 animate-pulse">
                 Bekerja menyusun ilustrasi stimulus ({progress.current}/{progress.total})...
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {activeTab === 'soal' ? (
          <QuestionPaper data={data} />
        ) : (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Matriks Kisi-kisi Soal</h2>
                     <p className="text-sm text-slate-500 font-medium tracking-tight">Perencanaan evaluasi berdasarkan CP 046/H/KR/2025.</p>
                   </div>
                   <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-700 font-bold text-[10px] uppercase tracking-wider border border-indigo-100">
                     Fase {data.phase}
                   </div>
                </div>
                <BlueprintTable data={data} />
             </div>
             
             <div className="p-8 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2rem] text-white shadow-2xl no-print flex items-center gap-8">
               <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
                 <Sparkles size={40} className="text-indigo-300" />
               </div>
               <div>
                 <h3 className="text-xl font-bold tracking-tight mb-2">Petunjuk Penggunaan:</h3>
                 <ul className="text-indigo-100 text-sm space-y-2 font-medium list-disc ml-5">
                   <li>Klik <strong>"Copy ke Word"</strong> untuk menyalin seluruh lembar soal beserta ilustrasi gambarnya secara otomatis.</li>
                   <li>Tabel kisi-kisi sudah mencakup referensi teks lengkap Capaian Pembelajaran (CP) terbaru.</li>
                   <li>Nama tokoh dalam soal diacak dari daftar nama siswa Indonesia yang telah ditentukan.</li>
                 </ul>
               </div>
             </div>
          </div>
        )}
      </div>
      
      <footer className="mt-20 py-10 border-t border-slate-200 bg-white/50 no-print">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Generator Soal AI v3.5 • 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
