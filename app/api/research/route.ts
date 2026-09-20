import { NextRequest,NextResponse } from 'next/server';
import { records,sourceEvidence,themeFor } from '@/lib/corpus';

export const runtime='nodejs';

const findings:Record<string,{title:string;finding:string;implication:string}>={
  'Keyword & Vocabulary Gap':{title:'Vocabulary gap',finding:'People remember meaning, relationships and visual details, but struggle to translate those memories into the exact labels search recognises.',implication:'Help users express partial clues and progressively refine them without restarting.'},
  'Episodic/Context Blindness':{title:'Context blindness',finding:'The remembered clue is often an episode — who was there, what happened before it or why the photo mattered — rather than a searchable object.',implication:'Turn episodic memories into guided, searchable context.'},
  'Thumbnail Fatigue & Endless Scrolling':{title:'Scrolling fatigue',finding:'When search confidence drops, people fall back to long timeline scans and repeatedly inspect similar thumbnails.',implication:'Offer progressive narrowing and visible retrieval checkpoints.'},
  'Metadata Corruption':{title:'Metadata mismatch',finding:'Imported, downloaded or shared photos can appear under dates that do not match the remembered event.',implication:'Surface alternative dates and provenance when timeline evidence conflicts.'},
  'OCR & Handwriting Failures':{title:'Text recognition',finding:'Users often remember text on receipts, documents, signs or handwritten notes, but recognition is incomplete or inconsistent.',implication:'Combine fuzzy text matching with visual and contextual clues.'}
};

export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>({}));
  const question=typeof body.question==='string'?body.question:'';
  const theme=themeFor(question);
  const meta=findings[theme];
  const count=records.filter(record=>record.category===theme).length;
  const evidence=sourceEvidence.filter(record=>record.category===theme).slice(0,4);
  return NextResponse.json({
    theme,
    title:meta.title,
    summary:`Across the 800-record prototype corpus, ${count} records were classified under ${theme.toLowerCase()}. ${meta.finding}`,
    implication:meta.implication,
    evidence
  });
}
