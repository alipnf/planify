import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API Key tidak disertakan.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // A lightweight call to a model to verify the key
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Test',
    });

    return NextResponse.json({
      success: true,
      message: 'Koneksi berhasil! API key valid dan siap digunakan.',
    });
  } catch (error: unknown) {
    let errorMessage = 'API key tidak valid atau terjadi kesalahan jaringan.';
    const errorString = String(error);

    if (errorString.includes('API key not valid')) {
      errorMessage = 'API key yang Anda masukkan tidak valid. Periksa kembali.';
    } else if (errorString.includes('fetch failed')) {
      errorMessage =
        'Gagal terhubung ke Google AI. Periksa koneksi internet Anda.';
    }

    return NextResponse.json(
      { success: false, message: errorMessage, details: errorString },
      { status: 400 }
    );
  }
}
