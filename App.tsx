
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

  const handlePrint = () => {
    // Small timeout to ensure everything is rendered before print dialog appears
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const copyToWord = () => {
    const el = document.getElementById('question-paper-root');
    if (el) {
      // Temporarily hide no-print elements to ensure a clean copy
      const noPrintElements = el.querySelectorAll('.no-print');
      noPrintElements.forEach(item => (item as HTMLElement).style.display = 'none');

      const range = document.createRange();
      range.selectNode(el);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Berhasil disalin! Sekarang buka Microsoft Word dan tempelkan (Ctrl+V) soal Anda.');
        }
      } catch (err) {
        alert('Gagal menyalin. Silakan seleksi manual isi lembar soal.');
      } finally {
        window.getSelection()?.removeAllRanges();
        // Restore visibility
        noPrintElements.forEach(item => (item as HTMLElement).style.display = '');
      }
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
      alert('Tabel kisi-kisi disalin! Tempelkan di Microsoft Excel untuk format terbaik.');
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-lg mb-12 text-center">
           <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 font-bold text-xs mb-4 shadow-sm border border-indigo-100">
             <Sparkles size={14} /> Berbasis Gemini AI • Kurikulum Merdeka 2025/2026
           </div>
        </div>
        <InputForm onGenerate={handleGenerate} isLoading={loading} />
        {error && <p className="mt-6 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if(confirm('Buat soal baru? Data yang sudah ada akan terhapus.')) setData(null); }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter">Lembar Evaluasi AI</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{data.subject} • TP 2025/2026</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setActiveTab('soal')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'soal' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileText size={16} /> Soal
            </button>
            <button 
              onClick={() => setActiveTab('kisi-kisi')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'kisi-kisi' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <TableIcon size={16} /> Kisi-kisi
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'soal' ? (
              <button 
                onClick={copyToWord}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all border border-indigo-200 shadow-sm"
              >
                <Copy size={14} /> COPY KE WORD
              </button>
            ) : (
              <button 
                onClick={copyTableToClipboard}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all border border-emerald-200 shadow-sm"
              >
                <FileJson size={14} /> COPY KE EXCEL
              </button>
            )}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg"
            >
              <Printer size={14} /> CETAK SEKARANG
            </button>
          </div>
        </div>
        
        {generatingImages && progress && (
          <div className="w-full h-1 bg-slate-100 relative">
            <div 
              className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10">
        {activeTab === 'soal' ? (
          <QuestionPaper data={data} />
        ) : (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Matriks Kisi-kisi Evaluasi</h2>
                     <p className="text-slate-500 font-medium text-sm mt-1">Struktur penilaian mandiri TP 2025/2026 • CP 046/H/KR/2025.</p>
                   </div>
                   <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">
                     Fase {data.phase}
                   </div>
                </div>
                <BlueprintTable data={data} />
             </div>
             
             <div className="p-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-black rounded-[2.5rem] text-white shadow-2xl no-print relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                 <Sparkles size={180} />
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-inner">
                   <FileText size={48} className="text-indigo-400" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-2xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">Tips & Panduan Cepat</h3>
                   <ul className="space-y-4">
                     {[
                       "Gunakan tombol 'Copy ke Word' untuk memindahkan seluruh soal dan gambar ke dokumen sekolah dengan rapi.",
                       "Seluruh soal pilihan ganda (PG) menggunakan format rumpang (....) sesuai permintaan Anda.",
                       "Tahun Pelajaran telah diperbarui ke 2025/2026 untuk persiapan tahun ajaran baru.",
                       "Isi opsi jawaban kini menggunakan huruf kecil di awal kalimat agar lebih bersahabat bagi siswa jenjang awal."
                     ].map((item, i) => (
                       <li key={i} className="flex gap-4 text-indigo-100/80 text-sm font-semibold">
                         <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center text-[10px] text-indigo-300 border border-indigo-500/30">{i+1}</div>
                         {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>
      
      <footer className="mt-20 py-12 border-t border-slate-200 bg-white/80 no-print">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Kurikulum Merdeka Assistant • 2025/2026</p>
          <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
