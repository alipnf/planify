import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { Course } from '@/lib/types/course';

export async function POST(req: NextRequest) {
  const {
    courses,
    preferences,
    userPrompt,
    apiKey: userApiKey,
  } = await req.json();

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'API key tidak dikonfigurasi. Harap atur di halaman Pengaturan.',
      },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Tugas Anda adalah asisten pembuat jadwal kuliah. Pertama, evaluasi permintaan pengguna: "${userPrompt}".
Jika permintaan ini tidak relevan untuk membuat jadwal kuliah (misalnya, hanya sapaan, pertanyaan acak, atau tidak masuk akal), response Anda HARUS berupa satu objek JSON: {"status": "irrelevant_prompt", "reason": "Penjelasan singkat mengapa prompt tidak relevan"}.
Jika permintaan relevan, buat 3 sampai 5 opsi jadwal kuliah yang bebas bentrok. Setiap opsi harus berupa JSON array of arrays, di mana setiap array berisi objek mata kuliah lengkap (id, code, name, class, day, startTime, endTime, credits, category, lecturer, room).
Gunakan data mata kuliah ini: ${JSON.stringify(
    courses
  )}. Pertimbangkan preferensi ini: ${JSON.stringify(preferences)}.
Response Anda HARUS HANYA JSON, tanpa teks atau markup lain.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    const text = response.text ?? '';
    // Sanitize output: remove Markdown code fences and whitespace
    let sanitized = text.trim();
    if (sanitized.startsWith('```')) {
      sanitized = sanitized
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '');
    }
    // Parse model output as JSON
    let modelResponse: Course[][] | { status: string; reason: string };
    try {
      modelResponse = JSON.parse(sanitized);
    } catch (e) {
      return NextResponse.json(
        {
          error: `Failed to parse Gemini output, messege ${e}`,
          raw: sanitized,
        },
        { status: 500 }
      );
    }

    // Check if AI determined the prompt was irrelevant
    if (
      typeof modelResponse === 'object' &&
      !Array.isArray(modelResponse) &&
      'status' in modelResponse &&
      modelResponse.status === 'irrelevant_prompt'
    ) {
      return NextResponse.json(
        { error: 'Prompt tidak relevan.', details: modelResponse.reason },
        { status: 400 }
      );
    }

    // Return full schedule options
    return NextResponse.json({ options: modelResponse as Course[][] });
  } catch (error) {
    console.error('Detailed error in generate-schedule:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: (error as Error).message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
