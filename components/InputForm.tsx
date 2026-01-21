
import React, { useState, useEffect } from 'react';
import { FormInputs, EducationLevel, QuestionStyle, TaxonomyType } from '../types';
import { Sparkles, ClipboardList, Send, School, Plus, Trash2, Settings2, Image as ImageIcon, Info, GraduationCap } from 'lucide-react';

interface Props {
  onGenerate: (inputs: FormInputs) => void;
  isLoading: boolean;
}

const InputForm: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.SD);
  const [grade, setGrade] = useState('Kelas 1');
  const [materials, setMaterials] = useState<string[]>(['']);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  
  const [formData, setFormData] = useState<Partial<FormInputs>>({
    schoolName: 'Sekolah Nasional Bangsa',
    subject: '',
    countMCQ: 10,
    countShort: 5,
    countEssay: 5,
    style: QuestionStyle.REGULAR,
    taxonomy: TaxonomyType.BLOOM,
    smartImages: true
  });

  const grades = {
    [EducationLevel.SD]: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    [EducationLevel.SMP]: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
    [EducationLevel.SMA]: ['Kelas 10', 'Kelas 11', 'Kelas 12']
  };

  useEffect(() => {
    setGrade(grades[level][0]);
  }, [level]);

  const addMaterial = () => setMaterials([...materials, '']);
  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  const addTP = () => setLearningObjectives([...learningObjectives, '']);
  const removeTP = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const handleTPChange = (index: number, value: string) => {
    const newTPs = [...learningObjectives];
    newTPs[index] = value;
    setLearningObjectives(newTPs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      ...formData,
      level,
      grade,
      materials: materials.filter(m => m.trim() !== ''),
      learningObjectives: learningObjectives.filter(tp => tp.trim() !== ''),
    } as FormInputs);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Generator Soal AI</h2>
        <p className="text-slate-500 mt-2 font-medium">Asisten cerdas penyusun evaluasi pembelajaran mandiri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><School size={16} className="text-indigo-500" /> Nama Sekolah</label>
          <input 
            required value={formData.schoolName} 
            onChange={e => setFormData({...formData, schoolName: e.target.value})}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Jenjang</label>
          <select value={level} onChange={e => setLevel(e.target.value as EducationLevel)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <option value={EducationLevel.SD}>SD</option>
            <option value={EducationLevel.SMP}>SMP</option>
            <option value={EducationLevel.SMA}>SMA</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Kelas</label>
          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            {grades[level].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><ClipboardList size={16} className="text-indigo-500" /> Mata Pelajaran</label>
          <input 
            required value={formData.subject} 
            onChange={e => setFormData({...formData, subject: e.target.value})}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Matematika, IPA, IPS, Bahasa Indonesia, dll..."
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-700">Materi Pokok</label>
            <button type="button" onClick={addMaterial} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 transition-all">
              + Tambah Materi
            </button>
          </div>
          {materials.map((m, index) => (
            <div key={index} className="flex gap-2">
              <input 
                required value={m} 
                onChange={e => handleMaterialChange(index, e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500" 
                placeholder={`Materi ${index + 1}...`}
              />
              {materials.length > 1 && (
                <button type="button" onClick={() => removeMaterial(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-bold text-slate-700">Tujuan Pembelajaran (TP)</label>
              <p className="text-[10px] text-slate-500 italic flex items-center gap-1"><Info size={12} /> Disarankan diisi agar soal sesuai target kurikulum.</p>
            </div>
            <button type="button" onClick={addTP} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-all">
              + Tambah TP
            </button>
          </div>
          {learningObjectives.map((tp, index) => (
            <div key={index} className="flex gap-2">
              <textarea 
                value={tp} onChange={e => handleTPChange(index, e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:border-indigo-500 outline-none" 
                placeholder={`Ketik TP ${index + 1} (Opsional)...`} rows={1}
              />
              <button type="button" onClick={() => removeTP(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-widest">
          <Settings2 size={16} /> Konfigurasi Soal
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">Gaya Soal</label>
            <select value={formData.style} onChange={e => setFormData({...formData, style: e.target.value as QuestionStyle})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">
              <option value={QuestionStyle.REGULAR}>Reguler</option>
              <option value={QuestionStyle.HOTS}>HOTS (Penalaran)</option>
              <option value={QuestionStyle.AKM}>AKM (Literasi/Numerasi)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">Stimulus Gambar</label>
            <div className="flex items-center gap-2 h-10">
              <input type="checkbox" id="smartImg" checked={formData.smartImages} onChange={e => setFormData({...formData, smartImages: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
              <label htmlFor="smartImg" className="text-xs font-bold text-slate-700">Otomatisasi Gambar</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-2xl border text-center">
            <label className="text-[9px] font-bold text-slate-400 block mb-1">PG</label>
            <input type="number" value={formData.countMCQ} onChange={e => setFormData({...formData, countMCQ: parseInt(e.target.value) || 0})} className="w-full text-center font-bold text-indigo-600 outline-none" />
          </div>
          <div className="bg-white p-3 rounded-2xl border text-center">
            <label className="text-[9px] font-bold text-slate-400 block mb-1">ISIAN</label>
            <input type="number" value={formData.countShort} onChange={e => setFormData({...formData, countShort: parseInt(e.target.value) || 0})} className="w-full text-center font-bold text-indigo-600 outline-none" />
          </div>
          <div className="bg-white p-3 rounded-2xl border text-center">
            <label className="text-[9px] font-bold text-slate-400 block mb-1">URAIAN</label>
            <input type="number" value={formData.countEssay} onChange={e => setFormData({...formData, countEssay: parseInt(e.target.value) || 0})} className="w-full text-center font-bold text-indigo-600 outline-none" />
          </div>
        </div>
      </div>

      <button 
        type="submit" disabled={isLoading}
        className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Menyusun Evaluasi...</> : <><Send size={18} /> Buat Soal Sekarang</>}
      </button>
    </form>
  );
};

export default InputForm;
