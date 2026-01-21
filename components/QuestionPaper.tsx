
import React from 'react';
import { AssessmentData, Question } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  data: AssessmentData;
}

const QuestionPaper: React.FC<Props> = ({ data }) => {
  const mcqs = data.questions.filter(q => 
    q.type.toLowerCase().includes('pilihan ganda') || 
    q.type.toLowerCase() === 'pg'
  );
  
  const shortAnswers = data.questions.filter(q => 
    q.type.toLowerCase().includes('isian') || 
    q.type.toLowerCase().includes('singkat')
  );
  
  const essays = data.questions.filter(q => 
    q.type.toLowerCase().includes('uraian') || 
    q.type.toLowerCase().includes('essay')
  );

  // Helper to clean up option text (remove labels like A. or B. if AI included them accidentally)
  const cleanOption = (text: string) => {
    return text.replace(/^[A-D][.\s]+/, '').trim();
  };

  const renderQuestion = (q: Question, idx: number, totalOffset: number) => (
    <div key={q.id} className="question-block mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="align-top font-bold pr-2" style={{ width: '30px' }}>{idx + 1 + totalOffset}.</td>
            <td className="align-top">
              {q.generatedImageUrl && (
                <div className="mb-4 no-print-shadow">
                  <img 
                    src={q.generatedImageUrl} 
                    alt="Stimulus" 
                    className="max-h-[160px] max-w-full rounded border border-slate-100"
                    style={{ display: 'block' }}
                  />
                </div>
              )}
              <div className="mb-2 text-[12pt] leading-normal">{q.questionText}</div>
              
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 gap-1 ml-1 mt-2 mb-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2 text-[12pt]">
                      <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{cleanOption(opt)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {(q.type.toLowerCase().includes('isian') || q.type.toLowerCase().includes('singkat')) && (
                <div className="mt-3 border-b border-dotted border-black w-3/4 h-1 mb-4"></div>
              )}
              
              {(q.type.toLowerCase().includes('uraian') || q.type.toLowerCase().includes('essay')) && (
                <div className="mt-3 space-y-4 mb-4">
                  <div className="border-b border-dotted border-black w-full h-1"></div>
                  <div className="border-b border-dotted border-black w-full h-1"></div>
                  <div className="border-b border-dotted border-black w-full h-1"></div>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white p-8 md:p-12 shadow-2xl max-w-[210mm] mx-auto text-black print:shadow-none print:p-0" id="question-paper-root" style={{ fontVariantLigatures: 'none' }}>
      {/* Header Kop Soal */}
      <div className="text-center border-b-[3px] border-double border-black pb-4 mb-8">
        <h1 className="text-xl font-bold uppercase tracking-tight leading-tight">LEMBAR EVALUASI PESERTA DIDIK</h1>
        <h2 className="text-lg font-bold uppercase mt-1">{data.schoolName}</h2>
        <p className="text-sm font-medium">Tahun Pelajaran 2025/2026</p>
      </div>

      {/* Identitas Peserta */}
      <table className="w-full text-sm mb-10 border-collapse">
        <tbody>
          <tr>
            <td className="py-1 w-[18%]">Mata Pelajaran</td>
            <td className="py-1 w-[32%]">: <strong>{data.subject}</strong></td>
            <td className="py-1 w-[18%]">Nama Siswa</td>
            <td className="py-1 w-[32%] border-b border-dotted border-black"></td>
          </tr>
          <tr>
            <td className="py-1">Kelas / Fase</td>
            <td className="py-1">: <strong>{data.grade} / {data.phase}</strong></td>
            <td className="py-1">Nomor Absen</td>
            <td className="py-1 border-b border-dotted border-black"></td>
          </tr>
          <tr>
            <td className="py-1">Materi Pokok</td>
            <td className="py-1">: <strong>{data.materials.join(", ")}</strong></td>
            <td className="py-1">Hari/Tanggal</td>
            <td className="py-1 border-b border-dotted border-black"></td>
          </tr>
        </tbody>
      </table>

      {/* Bagian Soal */}
      <div className="space-y-8">
        {mcqs.length > 0 && (
          <section>
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">Bagian I. Pilihan Ganda</div>
            <p className="text-[11pt] italic mb-6">Berilah tanda silang (X) pada huruf A, B, atau C untuk jawaban yang paling benar!</p>
            {mcqs.map((q, idx) => renderQuestion(q, idx, 0))}
          </section>
        )}

        {shortAnswers.length > 0 && (
          <section className="mt-10">
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">Bagian II. Isian Singkat</div>
            <p className="text-[11pt] italic mb-6">Isilah titik-titik di bawah ini dengan jawaban yang tepat!</p>
            {shortAnswers.map((q, idx) => renderQuestion(q, idx, mcqs.length))}
          </section>
        )}

        {essays.length > 0 && (
          <section className="mt-10">
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">Bagian III. Uraian</div>
            <p className="text-[11pt] italic mb-6">Jawablah pertanyaan di bawah ini dengan uraian yang benar!</p>
            {essays.map((q, idx) => renderQuestion(q, idx, mcqs.length + shortAnswers.length))}
          </section>
        )}
      </div>

      {/* Tanda Tangan */}
      <div className="mt-16 grid grid-cols-2 text-center text-sm print:mt-24">
        <div>
          <p>Mengetahui,</p>
          <p className="mb-24">Orang Tua/Wali</p>
          <p className="font-bold">( ____________________ )</p>
        </div>
        <div>
          <p>Jakarta, ....................... 2025</p>
          <p className="mb-24">Guru Kelas/Mata Pelajaran</p>
          <p className="font-bold">( ____________________ )</p>
        </div>
      </div>

      {/* Kunci Jawaban (no-print) */}
      <div className="mt-20 pt-10 border-t-2 border-slate-100 no-print">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Kunci Jawaban & Panduan Penskoran</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {data.questions.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-slate-700">No {idx + 1} ({q.cognitiveLevel})</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${q.difficulty === 'Sulit' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {q.difficulty}
                </span>
              </div>
              <p className="mb-2"><strong>Kunci:</strong> <span className="text-indigo-600 text-sm font-bold">{q.correctAnswer}</span></p>
              {q.scoringGuide && <p className="text-slate-500 italic">Pedoman: {q.scoringGuide}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaper;
