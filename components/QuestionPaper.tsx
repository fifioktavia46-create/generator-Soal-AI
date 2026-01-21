
import React from 'react';
import { AssessmentData, Question } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  data: AssessmentData;
}

const QuestionPaper: React.FC<Props> = ({ data }) => {
  const mcqs = data.questions.filter(q => q.type.includes('Pilihan Ganda'));
  const shortAnswers = data.questions.filter(q => q.type.includes('Isian'));
  const essays = data.questions.filter(q => q.type.includes('Uraian'));

  const renderQuestion = (q: Question, idx: number, totalOffset: number) => (
    <div key={q.id} className="relative pl-6 text-sm mb-6 leading-relaxed">
      <span className="absolute left-0 font-bold">{idx + 1 + totalOffset}.</span>
      
      {q.generatedImageUrl && (
        <div className="mb-4 text-center">
          <img 
            src={q.generatedImageUrl} 
            alt="Stimulus" 
            className="max-h-[8cm] max-w-full mx-auto rounded border border-slate-100 shadow-sm" 
          />
        </div>
      )}

      <div className="mb-3 whitespace-pre-wrap">{q.questionText}</div>
      
      {q.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 ml-2 mb-4">
          {q.options.map((opt, oIdx) => (
            <div key={oIdx} className="flex gap-2">
              <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
      
      {q.type.includes('Isian') && <div className="mt-2 border-b border-dotted border-slate-400 w-1/2 h-4 mb-4"></div>}
      
      {q.type.includes('Uraian') && (
        <div className="mt-3 space-y-2 mb-4">
          <div className="border-b border-dotted border-slate-300 w-full h-1"></div>
          <div className="border-b border-dotted border-slate-300 w-full h-1"></div>
          <div className="border-b border-dotted border-slate-300 w-full h-1"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-10 md:p-14 shadow-2xl max-w-[210mm] mx-auto min-h-[297mm] text-slate-800 border border-slate-200" id="question-paper-root">
      {/* Header Kop Soal Umum */}
      <div className="text-center border-b-[3px] border-double border-slate-900 pb-5 mb-8 flex flex-col items-center">
        <h1 className="text-xl font-bold uppercase tracking-tight mb-1">LEMBAR EVALUASI PESERTA DIDIK</h1>
        <h2 className="text-lg font-bold uppercase">{data.schoolName}</h2>
        <p className="text-sm font-medium tracking-wide">Tahun Pelajaran 2024/2025</p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] mb-8 p-4 border border-slate-300 rounded-sm">
        <div className="space-y-1">
          <p>Mata Pelajaran : <strong>{data.subject}</strong></p>
          <p>Kelas / Fase : <strong>{data.grade} / {data.phase}</strong></p>
          <p>Materi Pokok : <strong>{data.materials.join(", ")}</strong></p>
        </div>
        <div className="space-y-1">
          <p>Nama Siswa : ....................................</p>
          <p>Nomor Absen : ....................................</p>
          <p>Hari/Tanggal : ....................................</p>
        </div>
      </div>

      <div className="space-y-8">
        {mcqs.length > 0 && (
          <section>
            <div className="font-bold border-b border-slate-800 mb-4 pb-1 text-sm">I. PILIHAN GANDA</div>
            <p className="text-[11px] italic mb-4">Silanglah (X) pada huruf A, B, C, atau D untuk jawaban yang benar!</p>
            {mcqs.map((q, idx) => renderQuestion(q, idx, 0))}
          </section>
        )}

        {shortAnswers.length > 0 && (
          <section>
            <div className="font-bold border-b border-slate-800 mb-4 pb-1 text-sm mt-8">II. ISIAN SINGKAT</div>
            <p className="text-[11px] italic mb-4">Lengkapilah titik-titik di bawah ini dengan jawaban yang benar!</p>
            {shortAnswers.map((q, idx) => renderQuestion(q, idx, mcqs.length))}
          </section>
        )}

        {essays.length > 0 && (
          <section>
            <div className="font-bold border-b border-slate-800 mb-4 pb-1 text-sm mt-8">III. URAIAN</div>
            <p className="text-[11px] italic mb-4">Jawablah pertanyaan di bawah ini dengan uraian yang tepat!</p>
            {essays.map((q, idx) => renderQuestion(q, idx, mcqs.length + shortAnswers.length))}
          </section>
        )}
      </div>

      <div className="mt-16 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="mb-16">Orang Tua/Wali Murid</p>
          <p className="font-bold">( ................................ )</p>
        </div>
        <div>
          <p>Bandung, ....................... 2025</p>
          <p className="mb-16">Guru Mata Pelajaran</p>
          <p className="font-bold">( ................................ )</p>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t-2 border-slate-100 no-print page-break">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-700">
          <Sparkles size={24} /> Kunci Jawaban & Panduan Penskoran
        </h3>
        <div className="grid grid-cols-1 gap-4 text-[11px]">
          {data.questions.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-slate-900">No {idx + 1} ({q.cognitiveLevel})</span>
                 <span className="text-[9px] text-slate-500 italic">{q.indicator}</span>
              </div>
              <p className="mb-1"><strong>Jawaban:</strong> <span className="text-indigo-600 font-bold">{q.correctAnswer}</span></p>
              {q.scoringGuide && <p className="text-slate-500"><strong>Pedoman:</strong> {q.scoringGuide}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaper;
