import { NextResponse } from 'next/server';
import { sourceEvidence } from '@/lib/corpus';

export const runtime='nodejs';

export async function GET(){
  return NextResponse.json({records:sourceEvidence,total:sourceEvidence.length});
}
