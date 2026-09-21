import {NextResponse} from 'next/server';
import {records} from '@/lib/corpus';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({records,total:records.length,dataset:'Photo retrieval research corpus'});}
