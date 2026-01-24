
import React, { useState } from 'react';
import { AssessmentData, FormInputs, Question } from './types';
import { generateAssessment, generateImageForQuestion } from './services/geminiService';
import InputForm from './components/InputForm';
import BlueprintTable from './components/BlueprintTable';
import QuestionPaper from './components/QuestionPaper';
import { Download, Printer, ArrowLeft, Table as TableIcon, FileText, Sparkles, FileJson } from 'lucide-react';

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
      const result = await generateAssessment(inputs);
      const initialData: AssessmentData = {
        ...inputs,
        phase: result.phase,
        cpReference: result.cpReference,
        questions: result.questions
      };
      
      setData(initialData);
      setLoading(false);

      const questionsToImg = result.questions.filter((q: any) => q.needsImage);
      if (questionsToImg.length > 0) {
        setGeneratingImages(true);
        setProgress({ current: 0, total: questionsToImg.length });
        
        const updatedQuestions = [...result.questions];
        
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
            console.error("Image gen failed", err);
          }
          setProgress({ current: i + 1, total: questionsToImg.length });
        }
        setGeneratingImages(false);
        setProgress(null);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghasilkan soal. Pastikan koneksi internet stabil.");
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  const downloadWord = () => {
    const el = document.getElementById('question-paper-root');
    if (!el) return;
    
    // Simple HTML to Word (DOC) trick
    const htmlHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export DOC</title>
      <style>
        body { font-family: 'Times New Roman', serif; }
        .no-print { display: none !important; }
        table { width: 100%; border-collapse: collapse; }
        .question-block { margin-bottom: 15px; }
      </style>
      </head><body>`;
    const htmlFooter = "</body></html>";
    const sourceHTML = htmlHeader + el.innerHTML + htmlFooter;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Soal_${data?.subject.replace(/\s+/g, '_')}_${data?.grade.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = () => {
    if (!data) return;
    
    // Create CSV content for simplicity and high compatibility
    const headers = ["No", "CP", "TP", "Indikator", "Level", "Kesulitan", "Soal", "Kunci"];
    const rows = data.questions.map((q, i) => [
      (i + 1).toString(),
      data.cpReference.replace(/,/g, ';'),
      q.tpAssociated.replace(/,/g, ';'),
      q.indicator.replace(/,/g, ';'),
      q.cognitiveLevel,
      q.difficulty,
      q.questionText.replace(/,/g, ';').replace(/\n/g, ' '),
      q.correctAnswer.replace(/,/g, ';')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kisi_Kisi_${data.subject.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-lg mb-12 text-center">
           <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 font-bold text-xs mb-4 shadow-sm border border-indigo-100">
             <Sparkles size={14} /> Generator Soal Kurikulum Merdeka 2025/2026
           </div>
        </div>
        <InputForm onGenerate={handleGenerate} isLoading={loading} />
        {error && <p className="mt-6 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 no-print shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setData(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-200">
              <ArrowLeft size={18} className="text-slate-700" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 tracking-tighter">Lembar Evaluasi</h1>
              <p className="text-[10px] font-bold text-indigo-600">{data.subject} • {data.grade}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('soal')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold ${activeTab === 'soal' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              <FileText size={16} /> Soal
            </button>
            <button onClick={() => setActiveTab('kisi-kisi')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold ${activeTab === 'kisi-kisi' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>
              <TableIcon size={16} /> Kisi-kisi
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'soal' ? (
              <button onClick={downloadWord} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-md">
                <Download size={14} /> DOWNLOAD WORD
              </button>
            ) : (
              <button onClick={downloadExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md">
                <FileJson size={14} /> DOWNLOAD EXCEL
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
              <Printer size={14} /> CETAK
            </button>
          </div>
        </div>
        
        {generatingImages && progress && (
          <div className="w-full h-1 bg-slate-100">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {activeTab === 'soal' ? <QuestionPaper data={data} /> : <BlueprintTable data={data} />}
      </div>
    </div>
  );
};

export default App;
