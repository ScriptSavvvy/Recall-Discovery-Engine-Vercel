import {NextRequest,NextResponse} from 'next/server';
import {counts,families,familyStats,records,relevantRecords,rate} from '@/lib/corpus';
export const runtime='nodejs';

const domain=/photo|memory|remember|clue|search|query|retriev|date|english|hinglish|language|problem|family|families|abandon|success|candidate|taxonomy|outcome|scroll|account|content|forgot|workaround|journey/i;
const pct=(n:number,d:number)=>d?Math.round(n/d*100):0;

export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>({}));const question=typeof body.question==='string'?body.question.trim():'';
  if(!question||!domain.test(question))return NextResponse.json({insufficient:true,finding:'The current dataset does not contain enough evidence to answer this reliably.',breakdown:[],interpretation:'The question does not map to the retrieval-episode fields in this prototype.',confidence:'Low',limitations:'This engine only analyses the current 300-account research corpus.',evidence:[]});
  const q=question.toLowerCase();let subset=relevantRecords(question);let finding='';let breakdown:{label:string;value:string}[]=[];let interpretation='';
  if(/hinglish|english|language/.test(q)){
    const en=records.filter(r=>r.language==='English'),hi=records.filter(r=>r.language==='Hinglish');
    finding=`English and Hinglish each contribute ${en.length} accounts. Their leading behaviours can be compared without a sample-size imbalance.`;
    breakdown=[{label:'English · exact photo found',value:`${rate(en,'Exact photo found')}%`},{label:'Hinglish · exact photo found',value:`${rate(hi,'Exact photo found')}%`},{label:'English · leading behaviour',value:counts(en,'retrievalBehaviour')[0]?.[0]||'Unknown'},{label:'Hinglish · leading behaviour',value:counts(hi,'retrievalBehaviour')[0]?.[0]||'Unknown'}];interpretation='Differences describe the balanced language groups in this corpus and do not establish language-driven causality.';
  }else if(/five primary|problem families differ|compare.*famil/.test(q)){
    subset=records.filter(r=>families.includes(r.primaryProblemFamily));const stats=families.map(familyStats);finding='The five families separate difficulty in forming clues, grounding memory, narrowing results, recognising candidates, and confirming library scope.';breakdown=stats.map(s=>({label:s.family,value:`${s.count} records · ${s.success}% exact success · ${s.abandonment}% abandoned`}));interpretation='The categories describe different retrieval mechanisms and should not be collapsed into one generic “search failed” bucket.';
  }else if(/abandon/.test(q)){
    const ranked=families.map(familyStats).sort((a,b)=>b.abandonment-a.abandonment);finding=`Within this dataset, ${ranked[0].family.toLowerCase()} has the highest abandonment rate at ${ranked[0].abandonment}%.`;breakdown=ranked.map(s=>({label:s.family,value:`${s.abandonment}% abandoned (${records.filter(r=>r.primaryProblemFamily===s.family&&r.outcome==='Abandoned').length}/${s.count})`}));interpretation='This is a within-corpus comparison and should be treated as directional evidence.';
  }else if(/exact.photo success|success rate|highest exact/.test(q)){
    const ranked=families.map(familyStats).sort((a,b)=>b.success-a.success);finding=`Within the five problem families, ${ranked[0].family.toLowerCase()} has the highest exact-photo success rate at ${ranked[0].success}%.`;breakdown=ranked.map(s=>({label:s.family,value:`${s.success}% exact success`}));interpretation='Successful cases can still contain substantial effort; outcome alone does not measure retrieval quality.';
  }else if(/new clues|emerge|progressive/.test(q)){
    subset=records.filter(r=>r.retrievalBehaviour==='Progressive recall');finding=`${subset.length} accounts describe progressive recall: inspecting initial candidates triggered a new clue, followed by refinement and exact retrieval.`;breakdown=counts(subset,'contentType').slice(0,5).map(([label,value])=>({label,value:`${value} records`}));interpretation='Candidate inspection appears to support memory reconstruction in these scenarios, but the dataset cannot establish causality.';
  }else if(/cannot remember the date|forgot.*date/.test(q)){
    subset=records.filter(r=>r.explicitlyForgotten.toLowerCase().includes('date'));finding=`${subset.length} of 300 accounts explicitly state that the date was forgotten or uncertain. These accounts retain visual, subject, place, or purpose-related cues instead.`;breakdown=counts(subset,'primaryProblemFamily').slice(0,5).map(([label,value])=>({label,value:`${value} records (${pct(value,subset.length)}%)`}));interpretation='The remembered-clue field is explicit evidence; the engine does not infer clues that were not stated.';
  }else if(/do not fit|don't fit|insufficient|unknown/.test(q)){
    subset=records.filter(r=>r.primaryProblemFamily==='Unknown / insufficient evidence');finding=`${subset.length} accounts remain unknown or insufficient rather than being forced into a failure family.`;breakdown=counts(subset,'outcome').map(([label,value])=>({label,value:`${value} records`}));interpretation='Preserving an unknown class prevents weak evidence from becoming false certainty.';
  }else{
    finding=`${subset.length} records are relevant to this question. The leading pattern is ${counts(subset,'primaryProblemFamily')[0]?.[0]?.toLowerCase()||'not determinable'}.`;breakdown=counts(subset,'outcome').slice(0,5).map(([label,value])=>({label,value:`${value} records (${pct(value,subset.length)}%)`}));interpretation='This is a deterministic keyword-grounded synthesis. Review the cited episodes before treating it as a product conclusion.';
  }
  const evidence=subset.filter(r=>r.userText).slice(0,4);const low=subset.filter(r=>r.classificationConfidence==='Low').length;
  return NextResponse.json({finding,breakdown,interpretation,confidence:low>subset.length/3?'Low':'Medium',limitations:'Prototype research corpus; results are directional and not prevalence estimates.',evidence,matched:subset.length});
}
