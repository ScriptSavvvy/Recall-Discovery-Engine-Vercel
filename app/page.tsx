'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Aperture, ArrowUpRight, BarChart3, Bot, Check, ChevronRight, CircleDot, ExternalLink, FileSearch, Layers3, LoaderCircle, MessageSquareText, Search, Sparkles, X } from 'lucide-react';

type Evidence = { ID:string; Platform:string; App_System:string; Failure_Category:string; Verbatim_Quote:string; Direct_Thread_Link:string };
type Answer = { title:string; summary:string; implication:string; evidence:Evidence[]; theme:string };

const themeOrder=['Keyword & Vocabulary Gap','Episodic/Context Blindness','Thumbnail Fatigue & Endless Scrolling','Metadata Corruption','OCR & Handwriting Failures'];
const themeMeta:Record<string,{short:string;color:string;count:number;finding:string;opportunity:string}>={
 'Keyword & Vocabulary Gap':{short:'Vocabulary gap',color:'#ff4f87',count:250,finding:'People remember meaning, relationships and visual details, but struggle to translate those memories into the exact labels search recognises.',opportunity:'Help users express partial clues and progressively refine them without restarting.'},
 'Episodic/Context Blindness':{short:'Context blindness',color:'#18d7e8',count:180,finding:'The remembered clue is often an episode — who was there, what happened before it or why the photo mattered — rather than a searchable object.',opportunity:'Turn episodic memories into guided, searchable context.'},
 'Thumbnail Fatigue & Endless Scrolling':{short:'Scrolling fatigue',color:'#ffb44a',count:145,finding:'When search confidence drops, people fall back to long timeline scans and repeatedly inspect similar thumbnails.',opportunity:'Offer progressive narrowing and visible retrieval checkpoints.'},
 'Metadata Corruption':{short:'Metadata mismatch',color:'#9b75ff',count:130,finding:'Imported, downloaded or shared photos can appear under dates that do not match the remembered event.',opportunity:'Surface alternative dates and provenance when timeline evidence conflicts.'},
 'OCR & Handwriting Failures':{short:'Text recognition',color:'#52df9b',count:95,finding:'Users often remember text on receipts, documents, signs or handwritten notes, but recognition is incomplete or inconsistent.',opportunity:'Combine fuzzy text matching with visual and contextual clues.'}
};
const prompts=[
 'What do people remember when they cannot find a photo?',
 'What happens after the first search attempt fails?',
 'Where does endless scrolling appear in the journey?',
 'How do date and metadata mismatches affect retrieval?',
 'Which vocabulary gaps are most visible?',
 'What problems appear with receipts and handwritten text?',
 'Which friction points look most discoverability-led?',
 'What should the product team investigate first?'
];
const nav=[{id:'overview',label:'Overview',icon:BarChart3},{id:'evidence',label:'Evidence Explorer',icon:FileSearch},{id:'insights',label:'Discoverability Insights',icon:Sparkles},{id:'ask',label:'Ask the Research',icon:MessageSquareText}];
const stages=['Retrieving relevant records','Analysing repeated patterns','Synthesising grounded answer'];

export default function Home(){
 const[view,setView]=useState('overview');
 const[query,setQuery]=useState('');
 const[category,setCategory]=useState('All themes');
 const[selected,setSelected]=useState<Evidence|null>(null);
 const[question,setQuestion]=useState(prompts[0]);
 const[answer,setAnswer]=useState<Answer|null>(null);
 const[loading,setLoading]=useState(false);
 const[stage,setStage]=useState(0);
 const[evidence,setEvidence]=useState<Evidence[]>([]);
 const uniqueLinks=new Set(evidence.map(r=>r.Direct_Thread_Link)).size;
 const filtered=useMemo(()=>evidence.filter(r=>{const q=query.toLowerCase();return(category==='All themes'||r.Failure_Category===category)&&(!q||`${r.ID} ${r.Platform} ${r.App_System} ${r.Failure_Category} ${r.Verbatim_Quote}`.toLowerCase().includes(q));}),[query,category]);

 useEffect(()=>{fetch('/api/evidence').then(response=>response.json()).then(data=>setEvidence((data.records||[]).map((record:{id:string;platform:string;appSystem:string;category:string;text:string;sourceUrl:string})=>({ID:record.id,Platform:record.platform,App_System:record.appSystem,Failure_Category:record.category,Verbatim_Quote:record.text,Direct_Thread_Link:record.sourceUrl})))).catch(()=>setEvidence([]));},[]);
 async function analyze(q=question){setQuestion(q);setAnswer(null);setLoading(true);setStage(0);window.setTimeout(()=>setStage(1),650);window.setTimeout(()=>setStage(2),1300);try{const [data]=await Promise.all([fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})}).then(response=>response.json()),new Promise(resolve=>window.setTimeout(resolve,2050))]);setAnswer({...data,evidence:(data.evidence||[]).map((record:{id:string;platform:string;appSystem:string;category:string;text:string;sourceUrl:string})=>({ID:record.id,Platform:record.platform,App_System:record.appSystem,Failure_Category:record.category,Verbatim_Quote:record.text,Direct_Thread_Link:record.sourceUrl}))});}finally{setLoading(false);}}
 function openTheme(theme:string){setCategory(theme);setView('evidence');}

 return <main className="app-shell">
  <aside className="sidebar">
   <button className="brand" onClick={()=>setView('overview')}><span className="brand-mark"><Aperture size={23}/></span><span>RECALL<strong>Photo Retrieval Research</strong></span></button>
   <nav>{nav.map(item=><button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><item.icon size={18}/><span>{item.label}</span><ChevronRight size={15}/></button>)}</nav>
  </aside>

  <section className="workspace">
   <header className="topbar"><div><span className="live-dot"/> RESEARCH CORPUS READY</div><div className="top-meta"><span>800 records indexed</span><span>5 research themes</span></div></header>

   {view==='overview'&&<>
    <div className="page-heading"><div><span className="kicker">PHOTO RETRIEVAL DISCOVERY ENGINE</span><h1>Understand why remembered photos become hard to retrieve.</h1><p>A PM research workspace for exploring retrieval behaviour, repeated friction and evidence-backed product opportunities.</p></div><button className="primary" onClick={()=>setView('ask')}><Bot size={18}/> Ask the research</button></div>
    <div className="metric-grid"><article><span>RECORDS ANALYSED</span><strong>800</strong><small>Prototype research corpus</small></article><article><span>PROPOSED THEMES</span><strong>5</strong><small>Behavioural failure taxonomy</small></article><article><span>SOURCE LINKS</span><strong>{uniqueLinks}</strong><small>Available in Evidence Explorer</small></article><article><span>TOP SIGNAL</span><strong className="small-value pink-value">31%</strong><small>Vocabulary and clue-expression gap</small></article></div>
    <div className="overview-grid"><section className="panel theme-panel"><div className="panel-head"><div><span className="kicker">PROPOSED TAXONOMY</span><h2>Where retrieval breaks</h2></div><span className="sample-label">n = 800</span></div>{themeOrder.map(theme=>{const meta=themeMeta[theme];return <button key={theme} className="theme-row" onClick={()=>openTheme(theme)}><span className="theme-icon" style={{background:meta.color}}/><span className="theme-name"><strong>{meta.short}</strong><small>{theme}</small></span><span className="theme-bar"><i style={{width:`${meta.count/8}%`,background:meta.color}}/></span><strong>{meta.count}</strong><small>{Math.round(meta.count/8)}%</small></button>})}</section>
    <section className="panel journey-panel"><span className="kicker">RETRIEVAL JOURNEY</span><h2>Effort rises after weak first results</h2><div className="journey"><div><span>01</span><strong>Remember</strong><small>Partial person, place, event or feeling</small></div><ChevronRight/><div><span>02</span><strong>Translate</strong><small>Convert memory into search words</small></div><ChevronRight/><div className="journey-break"><span>03</span><strong>Fall back</strong><small>Scroll, retry and inspect thumbnails</small></div></div><button className="text-button" onClick={()=>setView('insights')}>Explore the discovery signals <ArrowUpRight size={15}/></button></section></div>
   </>}

   {view==='evidence'&&<>
    <div className="page-heading compact"><div><span className="kicker">SOURCE-LINKED ACCOUNTS</span><h1>Evidence Explorer</h1><p>Inspect the original records behind the research themes. Every visible row includes a direct source link.</p></div></div>
    <div className="filters"><label className="search-field"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search quotes, platforms or themes…"/></label><select value={category} onChange={e=>setCategory(e.target.value)}><option>All themes</option>{themeOrder.map(c=><option key={c}>{c}</option>)}</select><span>{filtered.length} source-linked records</span></div>
    <section className="evidence-table"><div className="table-head"><span>ID / SOURCE</span><span>VERBATIM EVIDENCE</span><span>PROPOSED THEME</span><span>OPEN</span></div>{filtered.map(r=><button className="table-row" key={r.ID} onClick={()=>setSelected(r)}><span className="source-cell"><strong>#{r.ID}</strong><small>{r.Platform}</small><small>{r.App_System}</small></span><span className="quote-cell">“{r.Verbatim_Quote}”</span><span className="tag" style={{'--tag':themeMeta[r.Failure_Category]?.color||'#789'} as CSSProperties}>{themeMeta[r.Failure_Category]?.short||r.Failure_Category}</span><span className="open-record"><ExternalLink size={16}/></span></button>)}</section>
   </>}

   {view==='insights'&&<>
    <div className="page-heading compact"><div><span className="kicker">DISCOVERABILITY INSIGHTS</span><h1>Patterns worth investigating</h1><p>Each signal combines the prototype-corpus distribution with traceable source-linked examples.</p></div></div>
    <div className="insight-grid">{themeOrder.map((theme,i)=>{const meta=themeMeta[theme];const support=evidence.filter(r=>r.Failure_Category===theme).slice(0,2);return <article className="insight-card" key={theme}><div className="insight-top"><span>0{i+1}</span><span className="signal">{meta.count} records</span></div><h2>{meta.short}</h2><p>{meta.finding}</p><div className="mini-bar"><i style={{width:`${meta.count/8}%`,background:meta.color}}/></div><h3>Product opportunity</h3><p>{meta.opportunity}</p><div className="support-list">{support.map(r=><button key={r.ID} onClick={()=>setSelected(r)}>#{r.ID} · {r.Platform}<ArrowUpRight size={14}/></button>)}</div></article>})}</div>
   </>}

   {view==='ask'&&<>
    <div className="page-heading compact"><div><span className="kicker">EVIDENCE-GROUNDED SYNTHESIS</span><h1>Ask the Research</h1><p>Choose a suggested question or write your own. Answers return a pattern, product implication and supporting source records.</p></div></div>
    <section className="ask-layout"><div className="ask-left"><div className="ask-box"><div className="ask-input"><MessageSquareText size={20}/><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&analyze()}/><button disabled={loading} onClick={()=>analyze()}>Analyze</button></div></div><div className="prompt-grid">{prompts.map((q,i)=><button key={q} onClick={()=>!loading&&analyze(q)}><span>0{i+1}</span>{q}<ArrowUpRight size={14}/></button>)}</div></div>
    <div className="answer-zone">{loading?<section className="analysis-loader"><div className="loader-orbit"><LoaderCircle size={30}/></div><h2>Analysing the research corpus</h2><div className="stage-list">{stages.map((s,i)=><div key={s} className={i<stage?'done':i===stage?'current':''}>{i<stage?<Check size={15}/>:<CircleDot size={15}/>}<span>{s}</span></div>)}</div></section>:answer?<section className="answer-card"><div className="analyst"><Bot size={20}/><span>RECALL RESEARCH SYNTHESIS</span></div><span className="answer-theme">{answer.theme}</span><h2>{answer.title}</h2><p>{answer.summary}</p><div className="implication"><strong>Product implication</strong><span>{answer.implication}</span></div><h3>Supporting records</h3>{answer.evidence.map(r=><button key={r.ID} onClick={()=>setSelected(r)}><blockquote>“{r.Verbatim_Quote}”</blockquote><span>#{r.ID} · {r.Platform}<ExternalLink size={13}/></span></button>)}</section>:<section className="ask-empty"><Layers3 size={34}/><h2>Your synthesis will appear here</h2><p>Select one of the eight research questions to see the retrieval and evidence flow.</p></section>}</div></section>
   </>}
  </section>

  {selected&&<div className="drawer-backdrop" onClick={()=>setSelected(null)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={20}/></button><span className="source-badge">SOURCE-LINKED RECORD</span><h2>Record #{selected.ID}</h2><p>{selected.Platform} · {selected.App_System}</p><h3>Verbatim account</h3><blockquote>“{selected.Verbatim_Quote}”</blockquote><h3>Proposed classification</h3><span className="large-tag" style={{borderColor:themeMeta[selected.Failure_Category]?.color}}>{selected.Failure_Category}</span><a className="source-link" href={selected.Direct_Thread_Link} target="_blank" rel="noreferrer">Open original source <ArrowUpRight size={16}/></a></aside></div>}
 </main>;
}
