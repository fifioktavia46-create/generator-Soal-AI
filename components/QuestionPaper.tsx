
import React from 'react';
import { AssessmentData, Question } from '../types';
import { Sparkles } from 'lucide-react';

interface Props {
  data: AssessmentData;
}

const QuestionPaper: React.FC<Props> = ({ data }) => {
  const mcqs = data.questions.filter(q => 
    q.type.toLowerCase().includes('pilihan ganda') || q.type.toLowerCase() === 'pg'
  );
  
  const shortAnswers = data.questions.filter(q => 
    q.type.toLowerCase().includes('isian') || q.type.toLowerCase().includes('singkat')
  );
  
  const essays = data.questions.filter(q => 
    q.type.toLowerCase().includes('uraian') || q.type.toLowerCase().includes('essay')
  );

  const cleanOption = (text: string) => text.replace(/^[A-D][.\s]+/, '').trim();

  const renderQuestion = (q: Question, idx: number, totalOffset: number) => (
    <div key={q.id} className="question-block mb-6" style={{ breakInside: 'avoid' }}>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="align-top font-bold pr-2" style={{ width: '30px' }}>{idx + 1 + totalOffset}.</td>
            <td className="align-top">
              {q.generatedImageUrl && (
                <div className="mb-4">
                  <img src={q.generatedImageUrl} alt="Img" className="max-h-[160px] rounded border border-slate-100" />
                </div>
              )}
              <div className="mb-2 text-[12pt]">{q.questionText}</div>
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
              {q.type.toLowerCase().includes('isian') && (
                <div className="mt-3 border-b border-dotted border-black w-2/3 h-1 mb-4"></div>
              )}
              {q.type.toLowerCase().includes('uraian') && (
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
    <div className="bg-white p-12 max-w-[210mm] mx-auto text-black print:p-0" id="question-paper-root">
      <div className="text-center border-b-[3px] border-double border-black pb-4 mb-8">
        <h1 className="text-xl font-bold uppercase leading-tight">LEMBAR EVALUASI PESERTA DIDIK</h1>
        <h2 className="text-lg font-bold uppercase mt-1">{data.schoolName}</h2>
        <p className="text-sm font-medium">Tahun Pelajaran 2025/2026</p>
      </div>

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

      <div className="space-y-8">
        {mcqs.length > 0 && (
          <section>
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">I. PILIHAN GANDA</div>
            <p className="text-[11pt] italic mb-6">Berilah tanda silang (X) pada huruf A, B, atau C untuk jawaban yang paling benar!</p>
            {mcqs.map((q, idx) => renderQuestion(q, idx, 0))}
          </section>
        )}
        {shortAnswers.length > 0 && (
          <section className="mt-10">
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">II. ISIAN SINGKAT</div>
            {shortAnswers.map((q, idx) => renderQuestion(q, idx, mcqs.length))}
          </section>
        )}
        {essays.length > 0 && (
          <section className="mt-10">
            <div className="font-bold border-b border-black mb-4 pb-1 text-sm uppercase">III. URAIAN</div>
            {essays.map((q, idx) => renderQuestion(q, idx, mcqs.length + shortAnswers.length))}
          </section>
        )}
      </div>

      <div className="mt-20 pt-10 border-t-2 border-slate-100 no-print">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Sparkles size={20} className="text-indigo-600" /> Kunci Jawaban</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {data.questions.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p><strong>{idx + 1}. Jawaban:</strong> <span className="text-indigo-600 font-bold">{q.correctAnswer}</span></p>
              {q.scoringGuide && <p className="text-slate-500 italic mt-1">{q.scoringGuide}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaper;
