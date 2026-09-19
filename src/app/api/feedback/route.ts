import { NextRequest, NextResponse } from 'next/server';
import { addFeedback, getShopById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, category, message, rating } = body;

    if (!shopId || !message) {
      return NextResponse.json({ success: false, message: 'Missing shopId or message' }, { status: 400 });
    }

    addFeedback(shopId, category || 'General Discrepancy', message, rating || 5);
    const updatedShop = getShopById(shopId);

    return NextResponse.json({ success: true, feedbackList: updatedShop?.feedbackList });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
