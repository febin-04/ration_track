import { NextRequest, NextResponse } from 'next/server';
import { addConfirmation, getShopById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, isConfirmed } = body;

    if (!shopId || typeof isConfirmed !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    addConfirmation(shopId, isConfirmed);
    const updatedShop = getShopById(shopId);

    return NextResponse.json({ success: true, confirmationsCount: updatedShop?.confirmationsCount });
  } catch (error) {
    console.error('Error submitting crowd confirmation:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
