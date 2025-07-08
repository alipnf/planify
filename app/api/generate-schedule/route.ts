import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { Course } from '@/lib/types/course';

export async function POST(req: NextRequest) {
  const { courses, preferences, userPrompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing GEMINI_API_KEY' },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Berdasarkan deskripsi pengguna: "${userPrompt}", buat 3 sampai 5 opsi jadwal kuliah yang bebas bentrok waktu antar mata kuliah. Setiap opsi harus berupa JSON array of arrays yang berisi objek mata kuliah lengkap dengan semua propertinya: id, code, name, class, day, startTime, endTime, credits, category, lecturer, dan room. Berikut data mata kuliah yang tersedia: ${JSON.stringify(
    courses
  )}. Sesuaikan jadwal dengan preferensi: ${JSON.stringify(preferences)}. Response harus hanya JSON tanpa teks penjelasan (contoh: [[{id:"...",code:"...",...}, {...}], [...], [...]]).`;

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
    // Parse model output as JSON schedules
    let schedules: Course[][];
    try {
      schedules = JSON.parse(sanitized) as Course[][];
    } catch (e) {
      return NextResponse.json(
        {
          error: `Failed to parse Gemini output, messege ${e}`,
          raw: sanitized,
        },
        { status: 500 }
      );
    }
    // Return full schedule options
    return NextResponse.json({ options: schedules });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', details: e },
      { status: 500 }
    );
  }
}
