
import { GoogleGenAI, Type } from "@google/genai";
import { FormInputs } from "../types";

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STUDENT_NAMES = "Kivlan, Zaid, May, Fio, Aisyah, Yasmin, Firzo, Uwais, Aca, Rayya, Azizi, Afi, Regina, Naya, Nia, Khalid, Alva, Rifky, Rafiq, Bariq, Bilal, Azka, Dzikra, Azra, Fatiha, Hanin, Hana";

export const generateAssessment = async (inputs: FormInputs) => {
  const isLowerGrade = inputs.grade === 'Kelas 1' || inputs.grade === 'Kelas 2';
  const optionCount = isLowerGrade ? 3 : 4;
  
  const tpText = inputs.learningObjectives.length > 0 
    ? `Tujuan Pembelajaran (TP): ${inputs.learningObjectives.join(", ")}` 
    : "Tujuan Pembelajaran (TP): Sesuai standar kurikulum nasional";

  const prompt = `
    Bertindaklah sebagai Guru Profesional Indonesia yang ahli dalam Kurikulum Merdeka (CP 046/H/KR/2025).
    Buatlah soal evaluasi untuk Tahun Pelajaran 2025/2026.

    Parameter:
    - Kelas: ${inputs.grade}
    - Mata Pelajaran: ${inputs.subject}
    - Materi: ${inputs.materials.join(", ")}
    - ${tpText}
    - Gaya: ${inputs.style}
    - Taksonomi: ${inputs.taxonomy}

    ATURAN KHUSUS KONTEN & FORMAT:
    1. PILIHAN GANDA (PG): Jangan menggunakan tanda tanya (?). Gunakan format kalimat rumpang (kalimat tidak lengkap) yang diakhiri dengan titik-titik (....).
       Contoh: "${STUDENT_NAMES.split(',')[0].trim()} sedang belajar seni rupa materi kolase. Kolase adalah ...."
    2. JUMLAH OPSI: Untuk ${inputs.grade}, berikan TEPAT ${optionCount} pilihan jawaban.
    3. PENULISAN OPSI (PENTING): 
       - Jangan menyertakan label "A.", "B.", "C." di dalam teks opsi (hanya isi jawabannya saja).
       - Awalan isi opsi menggunakan huruf kecil (kecuali nama orang/tempat atau aturan EBI lainnya).
       - Contoh: "seni menempel kertas", "melukis di atas kanvas".
    4. NAMA TOKOH: Gunakan nama dari daftar ini saja: ${STUDENT_NAMES}.
    5. BAHASA: Gunakan diksi yang akrab bagi anak-anak Indonesia, sederhana, dan mudah dipahami.
    6. TAHUN PELAJARAN: 2025/2026.

    Output dalam format JSON.
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
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: `Exactly ${optionCount} options. No labels like A/B/C.`
                },
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
        { text: `Educational illustration for kids: ${imagePrompt}. Style: Black and white line art, clean strokes, minimalist, no shading, white background, suitable for school printing.` }
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
