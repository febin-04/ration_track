export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { updateStockItem, getShopById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, itemKey, status, quantityNote, expectedRestockDate } = body;

    if (!shopId || !itemKey || !status) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    if (!['AVAILABLE', 'LOW', 'OUT_OF_STOCK'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status code' }, { status: 400 });
    }

    updateStockItem(shopId, itemKey, status, quantityNote, expectedRestockDate);
    const updatedShop = getShopById(shopId);

    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error) {
    console.error('Error updating stock status:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
