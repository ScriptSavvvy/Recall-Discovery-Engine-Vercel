import corpus from '@/data/corpus-800.json';

export type ResearchRecord={
  id:string;
  platform:string;
  appSystem:string;
  category:string;
  text:string;
  sourceUrl:string;
  origin:'source-linked'|'synthetic-showcase'|'synthetic-augmentation';
};

export const records=corpus as ResearchRecord[];
export const sourceEvidence=records.filter(record=>record.origin==='source-linked'&&record.sourceUrl);
export const categories=[
  'Keyword & Vocabulary Gap',
  'Episodic/Context Blindness',
  'Thumbnail Fatigue & Endless Scrolling',
  'Metadata Corruption',
  'OCR & Handwriting Failures'
];

export function themeFor(question:string){
  const text=question.toLowerCase();
  if(/scroll|journey|first search|fails/.test(text))return 'Thumbnail Fatigue & Endless Scrolling';
  if(/date|metadata|timeline/.test(text))return 'Metadata Corruption';
  if(/receipt|handwrit|text|ocr/.test(text))return 'OCR & Handwriting Failures';
  if(/vocabulary|keyword|words|express/.test(text))return 'Keyword & Vocabulary Gap';
  return 'Episodic/Context Blindness';
}
