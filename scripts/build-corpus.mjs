import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const csv=fs.readFileSync(path.join(root,'data','corpus.csv'),'utf8');

function parseCSV(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(ch===','&&!quoted){row.push(cell);cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  const headers=rows.shift()||[];
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h.trim(),(values[i]||'').trim()])));
}

const placeholder=/example|support\.google\.com\/photos\/thread\/1000000\d|discussions\.apple\.com\/thread\/25400000\d|x\.com\/user\/status\/170000000\d/i;
const original=parseCSV(csv).map((r,i)=>({
  id:r.ID||`R${String(i+1).padStart(3,'0')}`,
  platform:r.Platform,
  appSystem:r.App_System,
  category:r.Failure_Category,
  text:r.Verbatim_Quote,
  sourceUrl:r.Direct_Thread_Link,
  origin:placeholder.test(r.Direct_Thread_Link)?'synthetic-showcase':'source-linked'
}));

const targets={
  'Keyword & Vocabulary Gap':250,
  'Metadata Corruption':130,
  'Episodic/Context Blindness':180,
  'Thumbnail Fatigue & Endless Scrolling':145,
  'OCR & Handwriting Failures':95
};
const examples={
  'Keyword & Vocabulary Gap':[
    'I remembered the feeling and the person in the photo, but every keyword I tried returned unrelated results.',
    'I tried different words for the same object and still could not narrow the search to the picture I remembered.',
    'The photo was clear in my head, but I could not describe it using the labels the search seemed to understand.'
  ],
  'Metadata Corruption':[
    'I searched the month I remembered, then discovered the downloaded photo was stored under a completely different date.',
    'The timeline search failed because the shared image used the download date instead of the event date.',
    'I checked several nearby months before realising the photo metadata no longer matched when it was taken.'
  ],
  'Episodic/Context Blindness':[
    'I remembered who I was with and what happened that day, but none of those details helped me retrieve the photo.',
    'I could remember the small moment around the picture, not the exact place, object or date to search.',
    'The memory was about an event and a feeling, which was difficult to turn into a searchable query.'
  ],
  'Thumbnail Fatigue & Endless Scrolling':[
    'After search failed, I scrolled through months of thumbnails and repeatedly opened similar-looking photos.',
    'I spent nearly an hour scanning the timeline because the search results were too broad to recognise the target.',
    'The only fallback was manual scrolling, but hundreds of similar thumbnails made the photo difficult to spot.'
  ],
  'OCR & Handwriting Failures':[
    'I remembered a word written on the note, but searching that text did not return the photo.',
    'I tried the receipt title and store name, then manually checked document thumbnails when OCR found nothing.',
    'The handwritten text was the strongest clue I remembered, but it was not recognised by search.'
  ]
};

const counts=Object.fromEntries(Object.keys(targets).map(k=>[k,original.filter(r=>r.category===k).length]));
const augmented=[];
let index=1;
for(const [category,target] of Object.entries(targets)){
  const needed=target-(counts[category]||0);
  for(let i=0;i<needed;i++){
    const variants=examples[category];
    augmented.push({
      id:`A${String(index++).padStart(3,'0')}`,
      platform:['Google Photos','Apple Photos','Android Gallery','Reddit'][i%4],
      appSystem:['Android','iOS','Web'][i%3],
      category,
      text:variants[i%variants.length],
      sourceUrl:'',
      origin:'synthetic-augmentation'
    });
  }
}

const corpus=[...original,...augmented];
if(corpus.length!==800) throw new Error(`Expected 800 records, got ${corpus.length}`);
fs.writeFileSync(path.join(root,'data','corpus-800.json'),JSON.stringify(corpus,null,2));
console.log(`Built ${corpus.length}-record corpus`);
