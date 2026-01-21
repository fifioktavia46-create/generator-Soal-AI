
import { GoogleGenAI, Type } from "@google/genai";
import { FormInputs } from "../types";

const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STUDENT_NAMES = "Kivlan, Zaid, May, Fio, Aisyah, Yasmin, Firzo, Uwais, Aca, Rayya, Azizi, Afi, Regina, Naya, Nia, Khalid, Alva, Rifky, Rafiq, Bariq, Bilal, Azka, Dzikra, Azra, Fatiha, Hanin, Hana";

export const generateAssessment = async (inputs: FormInputs) => {
  const tpText = inputs.learningObjectives.length > 0 
    ? `Tujuan Pembelajaran (TP): ${inputs.learningObjectives.join(", ")}` 
    : "Tujuan Pembelajaran (TP): Tidak dispesifikasikan (fokus pada materi pokok)";

  const prompt = `
    Bertindaklah sebagai Ahli Kurikulum dan Guru Profesional di Indonesia.
    Buatlah perangkat evaluasi berdasarkan Kurikulum Merdeka (CP 046/H/KR/2025).

    Parameter:
    - Jenjang & Kelas: ${inputs.level} - ${inputs.grade}
    - Mata Pelajaran: ${inputs.subject}
    - Materi Pokok: ${inputs.materials.join(", ")}
    - ${tpText}
    - Gaya: ${inputs.style}
    - Taksonomi: ${inputs.taxonomy}
    - Komposisi: PG (${inputs.countMCQ}), Isian (${inputs.countShort}), Uraian (${inputs.countEssay})

    Ketentuan Khusus (WAJIB):
    1. KONTEKS UMUM: Gunakan konteks kehidupan sehari-hari siswa di Indonesia yang inklusif dan umum (lingkungan sekolah, rumah, bermain, dsb).
    2. CAPAIAN PEMBELAJARAN (CP): Sertakan teks CP yang LENGKAP dan AKURAT sesuai Keputusan Kepala BSKAP No. 046/H/KR/2025 untuk Fase dan Jenjang tersebut.
    3. NAMA TOKOH: Jika soal menggunakan nama orang, WAJIB memilih dari daftar ini: ${STUDENT_NAMES}.
    4. GAMBAR (STIMULUS): Jika soal membutuhkan stimulus visual (grafik, diagram, ilustrasi), tandai "needsImage": true dan berikan "imagePrompt" yang detail untuk generator gambar.
    5. BAHASA: Gunakan bahasa yang ramah anak, sederhana, dan sesuai usia siswa.

    Output dalam JSON.
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
        { text: `Create a professional educational illustration. Subject: ${imagePrompt}. Style: Clean line art or minimalist flat vector, white background, high contrast, suitable for black and white printing on school exam papers.` }
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
