import { NextRequest, NextResponse } from 'next/server';
import { authenticateDealer } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fpsCode, pin } = body;

    if (!fpsCode || !pin) {
      return NextResponse.json({ success: false, message: 'Please provide FPS Code and PIN' }, { status: 400 });
    }

    const dealerShop = authenticateDealer(fpsCode.trim(), pin.trim());

    if (!dealerShop) {
      return NextResponse.json({ success: false, message: 'Invalid FPS License Code or Security PIN' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      shop: {
        id: dealerShop.id,
        fps_code: dealerShop.fps_code,
        name: dealerShop.name,
        dealer_name: dealerShop.dealer_name,
      }
    });
  } catch (error) {
    console.error('Error during dealer login:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
