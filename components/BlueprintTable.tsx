
import React from 'react';
import { AssessmentData } from '../types';

interface Props {
  data: AssessmentData;
}

const BlueprintTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="overflow-x-auto bg-white border rounded-xl shadow-lg">
      <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-800 text-white border-b">
            <th className="p-3 border border-slate-700 text-center">No</th>
            <th className="p-3 border border-slate-700">CP</th>
            <th className="p-3 border border-slate-700">TP</th>
            <th className="p-3 border border-slate-700">Indikator Soal</th>
            <th className="p-3 border border-slate-700 text-center">No Soal</th>
            <th className="p-3 border border-slate-700">Soal</th>
            <th className="p-3 border border-slate-700">Kunci Jawaban</th>
            <th className="p-3 border border-slate-700 text-center">Bentuk</th>
            <th className="p-3 border border-slate-700 text-center">Level</th>
            <th className="p-3 border border-slate-700 text-center">Kesulitan</th>
          </tr>
        </thead>
        <tbody>
          {data.questions.map((q, idx) => (
            <tr key={idx} className="border-b hover:bg-indigo-50 transition-colors">
              <td className="p-3 border text-center font-bold">{idx + 1}</td>
              <td className="p-3 border align-top text-[10px] leading-tight max-w-[200px]">
                {idx === 0 ? data.cpReference : <span className="text-slate-300">"</span>}
              </td>
              <td className="p-3 border align-top text-xs max-w-[150px]">{q.tpAssociated}</td>
              <td className="p-3 border text-xs">{q.indicator}</td>
              <td className="p-3 border text-center font-bold">{idx + 1}</td>
              <td className="p-3 border text-xs max-w-[300px] italic">"{q.questionText.substring(0, 100)}..."</td>
              <td className="p-3 border font-medium text-indigo-600">{q.correctAnswer}</td>
              <td className="p-3 border text-center text-xs whitespace-nowrap">{q.type}</td>
              <td className="p-3 border text-center font-bold text-indigo-700">{q.cognitiveLevel}</td>
              <td className="p-3 border text-center">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  q.difficulty === 'Mudah' ? 'bg-emerald-100 text-emerald-700' : 
                  q.difficulty === 'Sedang' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {q.difficulty}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlueprintTable;
