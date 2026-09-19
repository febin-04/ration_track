export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getAllShops } from '@/lib/db';

export async function GET() {
  try {
    const shops = getAllShops();
    return NextResponse.json({ success: true, shops });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
