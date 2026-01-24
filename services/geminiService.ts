
import { GoogleGenAI, Type } from "@google/genai";
import { FormInputs } from "../types";

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STUDENT_NAMES = "Kivlan, Zaid, May, Fio, Aisyah, Yasmin, Firzo, Uwais, Aca, Rayya, Azizi, Afi, Regina, Naya, Nia, Khalid, Alva, Rifky, Rafiq, Bariq, Bilal, Azka, Dzikra, Azra, Fatiha, Hanin, Hana";

export const generateAssessment = async (inputs: FormInputs) => {
  const isLowerGrade = inputs.grade === 'Kelas 1' || inputs.grade === 'Kelas 2';
  const optionCount = isLowerGrade ? 3 : 4;
  
  const tpText = inputs.learningObjectives.length > 0 
    ? `Tujuan Pembelajaran (TP): ${inputs.learningObjectives.join(", ")}` 
    : "Tujuan Pembelajaran (TP): Fokus pada kompetensi dasar kurikulum nasional";

  const prompt = `
    Bertindaklah sebagai Guru Profesional Indonesia. Buatlah soal evaluasi Kurikulum Merdeka Tahun Pelajaran 2025/2026.
    
    JUMLAH SOAL WAJIB (HARUS TEPAT):
    - Pilihan Ganda: ${inputs.countMCQ} soal
    - Isian Singkat: ${inputs.countShort} soal
    - Uraian: ${inputs.countEssay} soal
    TOTAL: ${inputs.countMCQ + inputs.countShort + inputs.countEssay} soal.

    PARAMETER:
    - Kelas: ${inputs.grade}
    - Mata Pelajaran: ${inputs.subject}
    - Materi: ${inputs.materials.join(", ")}
    - Gaya: ${inputs.style}
    - Taksonomi: ${inputs.taxonomy}

    ATURAN KONTEN & FORMAT:
    1. PILIHAN GANDA (PG): Gunakan format kalimat rumpang diakhiri titik-titik (....). JANGAN pakai tanda tanya.
       Contoh: "${STUDENT_NAMES.split(',')[0].trim()} membeli buah apel. Apel berwarna ...."
    2. OPSI JAWABAN:
       - Untuk ${inputs.grade}, berikan ${optionCount} opsi.
       - Teks opsi HARUS diawali huruf kecil (kecuali nama/tempat).
       - JANGAN sertakan label A/B/C dalam string opsi.
    3. STIMULUS GAMBAR: 
       - Untuk Kelas 1 dan 2, minimal 70% soal HARUS memiliki "needsImage": true.
       - Berikan deskripsi "imagePrompt" yang sangat detail untuk ilustrasi hitam putih.
    4. NAMA TOKOH: Pilih dari: ${STUDENT_NAMES}.

    Output HARUS JSON lengkap. Jangan dipotong.
  `;

  const response = await aiClient.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cpReference: { type: Type.STRING },
          phase: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                type: { type: Type.STRING },
                indicator: { type: Type.STRING },
                cognitiveLevel: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                questionText: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                scoringGuide: { type: Type.STRING },
                tpAssociated: { type: Type.STRING },
                needsImage: { type: Type.BOOLEAN },
                imagePrompt: { type: Type.STRING }
              },
              required: ["id", "type", "indicator", "cognitiveLevel", "difficulty", "questionText", "correctAnswer", "tpAssociated", "needsImage"]
            }
          }
        },
        required: ["cpReference", "phase", "questions"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateImageForQuestion = async (imagePrompt: string) => {
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Sederhana, garis hitam putih, minimalis, tanpa bayangan, latar putih, untuk soal anak sekolah: ${imagePrompt}` }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};
