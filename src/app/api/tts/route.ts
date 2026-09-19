import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'en';

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    // Limit text chunk length for TTS stability
    const cleanText = text.trim().slice(0, 200);

    // Fetch audio from Google TTS endpoint server-side (bypassing CORS)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(cleanText)}`;

    const ttsRes = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!ttsRes.ok) {
      console.warn('TTS upstream response error:', ttsRes.status);
      return NextResponse.json({ error: 'Failed to generate speech audio' }, { status: 502 });
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in TTS API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
