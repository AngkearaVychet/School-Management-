/**
 * កម្មវិធីសាលាអន្តរជាតិ ហេមតុន (Hampton International School)
 * Unified School Management & Learning Repository System (ប្រព័ន្ធរួមបញ្ចូលតែមួយ)
 */

(function(){
"use strict";

/* ---------- constants & periods ---------- */
const PNAME={e1m:"ប្រឡងពាក់កណ្ដាលវគ្គ១",e1f:"ប្រឡងបញ្ចប់វគ្គ១",e2m:"ប្រឡងពាក់កណ្ដាលវគ្គ២",e2f:"ប្រឡងបញ្ចប់វគ្គ២",m09:"ខែកញ្ញា",m10:"ខែតុលា",m11:"ខែវិច្ឆិកា",m12:"ខែធ្នូ",q1:"ត្រីមាសទី១",m01:"ខែមករា",m02:"ខែកុម្ភៈ",m03:"ខែមីនា",s1:"ឆមាសទី១",m04:"ខែមេសា",m05:"ខែឧសភា",m06:"ខែមិថុនា",q2:"ត្រីមាសទី២",m07:"ខែកក្កដា",m08:"ខែសីហា",s2:"ឆមាសទី២"};
const MONTH_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const PNAME_EN={e1m:"Midterm Exam · Course 1",e1f:"Final Exam · Course 1",e2m:"Midterm Exam · Course 2",e2f:"Final Exam · Course 2",q1:"Quarter 1",q2:"Quarter 2",s1:"Semester 1",s2:"Semester 2"};
for(let i=1;i<=12;i++)PNAME_EN["m"+String(i).padStart(2,"0")]=MONTH_EN[i-1];

const ENG_PERIODS=["m09","m10","m11","e1m","m12","m01","m02","e1f","m03","m04","m05","e2m","m06","m07","m08","e2f"];
const ENG_GRADES=[["A","Excellent","A"],["B","Very Good","B"],["C","Good","C"],["D","Fair","D"],["E","Pass","E"],["F","Fail","F"]];
const ENG_SCALE=[["A","91 – 100"],["B","81 – 90"],["C","71 – 80"],["D","61 – 70"],["E","50 – 60"],["F","0 – 49"]];
const ENG_GRADE=a=>a>=91?"A":a>=81?"B":a>=71?"C":a>=61?"D":a>=50?"E":"F";

const KINDS={
 eng_k:{name:"English មត្តេយ្យ (Pre-Nursery – K4)",en:true,letters:true,avgMode:"pct",pass:50,periods:ENG_PERIODS,grades:ENG_GRADES,scale:ENG_SCALE,grade:ENG_GRADE},
 eng_p:{name:"English បឋម (Primary 1 – 3 & GEP)",en:true,letters:true,avgMode:"pct",pass:50,periods:ENG_PERIODS,grades:ENG_GRADES,scale:ENG_SCALE,grade:ENG_GRADE},
 primary:{name:"បឋមសិក្សា (ថ្នាក់ទី១-៦)",letters:true,avgMode:"entered",
   periods:["m09","m10","q1","m12","m01","s1","m03","m04","q2","m06","m07","s2"],
   grades:[["A","ល្អណាស់","A"],["B","ល្អ","B"],["C","ល្អបង្គួរ","C"],["D","មធ្យម","D"],["E","ខ្សោយ","E"],["F","គ្មានពិន្ទុ","F"]],
   scale:[["A","៩.៥ – ១០"],["B","៨ – ៩.៤៩"],["C","៦.៥ – ៧.៩៩"],["D","៥ – ៦.៤៩"],["E","តិចជាង ៥"],["F","០"]],
   grade:a=>a<=0?"F":a<5?"E":a<6.5?"D":a<8?"C":a<9.5?"B":"A"},
 kinder:{name:"មត្តេយ្យ (ទាប មធ្យម ខ្ពស់)",letters:false,avgMode:"all",
   periods:["m09","m10","q1","m12","m01","s1","m03","m04","q2","m06","m07","s2"],
   grades:[["G","ល្អ","B"],["P","ល្អបង្គួរ","C"],["M","មធ្យម","D"],["W","ខ្សោយ","E"]],
   scale:[["G","៨ – ១០"],["P","៦.៥ – ៧.៩៩"],["M","៥ – ៦.៤៩"],["W","តិចជាង ៥"]],
   grade:a=>a>=8?"G":a>=6.5?"P":a>=5?"M":"W"}
};
const ALL_PERIODS=Object.keys(PNAME);

const ENG_K_SUBJECTS=[
 {key:"e01",name:"English",max:100,group:"Main Subjects"},{key:"e02",name:"Math",max:100,group:"Main Subjects"},{key:"e03",name:"Science",max:100,group:"Main Subjects"},
 {key:"e04",name:"Social Studies",max:100,group:"Main Subjects"},{key:"e05",name:"Arts",max:50,group:"Main Subjects"},
 {key:"e06",name:"PE",max:10,group:"Other Tasks"},{key:"e07",name:"Att",max:10,group:"Other Tasks"},{key:"e08",name:"CP",max:10,group:"Other Tasks"},
 {key:"e09",name:"Homework",max:10,group:"Other Tasks"},{key:"e10",name:"Morality",max:10,group:"Other Tasks"}];

const ENG_P_SUBJECTS=[
 {key:"g01",name:"Reading",max:50,group:"Main Subjects"},{key:"g02",name:"Listening",max:50,group:"Main Subjects"},{key:"g03",name:"Speaking",max:50,group:"Main Subjects"},
 {key:"g04",name:"Writing",max:50,group:"Main Subjects"},{key:"g05",name:"Math",max:100,group:"Main Subjects"},{key:"g06",name:"Science",max:100,group:"Main Subjects"},
 {key:"g07",name:"Grammar",max:50,group:"Main Subjects"},{key:"g08",name:"Vocabulary",max:50,group:"Main Subjects"},
 {key:"g09",name:"Att",max:10,group:"Other Tasks"},{key:"g10",name:"Class Participation",max:10,group:"Other Tasks"},{key:"g11",name:"Homework",max:10,group:"Other Tasks"},
 {key:"g12",name:"PE",max:10,group:"Other Tasks"},{key:"g13",name:"Morality",max:10,group:"Other Tasks"}];

const KINDER_SUBJECTS=[
 {key:"k01",name:"រៀនអាន",group:""},{key:"k02",name:"សរសេរតាមអាន",group:""},{key:"k03",name:"គណិតវិទ្យា",group:""},
 {key:"k04",name:"ពលរដ្ឋ-សីលធម៌",group:""},{key:"k05",name:"គំនូរ",group:""},{key:"k06",name:"តន្ត្រី របាំ ចម្រៀង",group:""},
 {key:"k07",name:"កីឡា និងហត្ថកម្ម",group:""},{key:"k08",name:"វត្តមាន",group:""},{key:"k09",name:"កិច្ចការផ្ទះ",group:""},{key:"k10",name:"កិច្ចការសាលា",group:""}
];

const DEFAULT_SUBJECTS=[
 {key:"s01",name:"សមត្ថភាពស្តាប់",group:"ភាសាខ្មែរ"},{key:"s02",name:"សមត្ថភាពសរសេរ",group:"ភាសាខ្មែរ"},
 {key:"s03",name:"សមត្ថភាពអាន",group:"ភាសាខ្មែរ"},{key:"s04",name:"សមត្ថភាពនិយាយ",group:"ភាសាខ្មែរ"},
 {key:"s05",name:"ចំនួន",group:"គណិតវិទ្យា"},{key:"s06",name:"រង្វាស់រង្វាល់",group:"គណិតវិទ្យា"},
 {key:"s07",name:"ធរណីមាត្រ",group:"គណិតវិទ្យា"},{key:"s08",name:"ពីជគណិត",group:"គណិតវិទ្យា"},{key:"s09",name:"ស្ថិតិ",group:"គណិតវិទ្យា"},
 {key:"s10",name:"វិទ្យាសាស្ត្រ",group:""},{key:"s11",name:"សិក្សាសង្គម",group:""},{key:"s12",name:"គេហៈ-អប់រំសិល្បៈ",group:""},
 {key:"s13",name:"អប់រំកាយ-កីឡា",group:""},{key:"s14",name:"សុខភាព-អនាម័យ",group:""},{key:"s15",name:"គំនូរ-ហត្ថកម្ម",group:""},
 {key:"s16",name:"អប់រំបំណិនជីវិត",group:""},{key:"s17",name:"ភាសាបរទេស",group:""}
];

const KH_DIG="០១២៣៤៥៦៧៨៩";
const smax=sb=>+(sb&&sb.max)||10;

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
const fmt=v=>v==null||isNaN(v)?"":String(Math.round(v*100)/100);
const fmt2=v=>v==null?"–":v.toFixed(2);
const pct=(a,b)=>b?Math.round(a/b*1000)/10+"%":"–";

function parseScore(raw,max=10){
  if(raw==null)return {v:null,ok:true};
  let s=String(raw).trim().replace(/[០-៩]/g,c=>KH_DIG.indexOf(c)).replace(",",".");
  if(s==="")return {v:null,ok:true};
  const n=Number(s);
  if(!isFinite(n)||n<0||n>max)return {v:null,ok:false};
  return {v:Math.round(n*100)/100,ok:true};
}

function grade(avg,kind){
  if(avg==null)return null;const K=KINDS[kind]||KINDS.primary;const c=K.grade(avg);
  const g=K.grades.find(x=>x[0]===c);return [c,g[1],g[2],K.letters];
}
const gradeOf=(code,kind)=>{const K=KINDS[kind]||KINDS.primary;const g=K.grades.find(x=>x[0]===code);return g?[g[0],g[1],g[2],K.letters]:null};
const pill=g=>g?`<span class="gpill ${g[2]}">${g[3]?`<b>${g[0]}</b>`:""}${esc(g[1])}</span>`:"";
const clone=o=>JSON.parse(JSON.stringify(o??null));

function toast(msg){
  const t=$("#toast");if(!t)return;
  t.textContent=msg;t.style.display="block";
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>{t.style.display="none"},2800);
}

function arm(btn,label,fn){
  if(btn.dataset.armed){fn();return}
  const old=btn.textContent;btn.dataset.armed="1";btn.classList.add("armed");btn.textContent=label;
  setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.classList.remove("armed");btn.textContent=old}},3500);
}

/* ---------- state ---------- */
const S={
  ready:{classes:false,settings:false},
  classes:[], settings:null, sheet:null, sheetKey:null,
  sel:{classId:null,period:"m09"}, tab:"home", rcStudent:null,
  canWrite:true, canAdmin:true, user:null, needsSetup:false, users:null, backend:"local", status:"", statusErr:false,
  pending:{}, inflight:{},
  photos:{}, photoLoading:new Set(), honor:{}, honorLoading:new Set(), att:{date:new Date().toISOString().slice(0,10),view:"day",key:null,doc:null,pend:{days:{},marked:{}},attCache:{}},
  notice:{sort:"rank",note:"",photos:false},
  idc:{sel:null,cur:null,yearEn:true},
  cert:{sel:null,key:null,num:"",pn:true,cls:"",exam:"",year:""},
  fin:{docs:{},ready:false,unsub:null,year:null,month:null,edit:null,q:"",feeView:"month",onlyDebt:false},
  lessons:{selectedSubject:'all',selectedGrade:'all',searchQuery:'',activeItem:null,quizAnswers:{},quizSubmitted:false}
};

try{
  const p=JSON.parse(localStorage.getItem("hampton-ui-v2")||"{}");
  if(p.period&&PNAME[p.period])S.sel.period=p.period;
  if(p.classId)S.sel.classId=p.classId;
  if(p.tab)S.tab=p.tab;
  if(p.branch)S.branch=p.branch;
}catch(e){}

function saveUI(){
  try{localStorage.setItem("hampton-ui-v2",JSON.stringify({period:S.sel.period,classId:S.sel.classId,tab:S.tab,branch:S.branch}))}catch(e){}
}

const FIN_TAB_IDS=["fdash","fin_in","fin_out","fin_pay","fin_fee","fin_debt","fin_year","fin_set"];
const curClass=()=>S.classes.find(c=>c.id===S.sel.classId)||null;

function levels(){
  const st=S.settings||{};const L=clone(st.levels||{});
  if(!L.primary)L.primary={name:"បឋមសិក្សា (ថ្នាក់ទី១-៦)",kind:"primary",subjects:(st.subjects&&st.subjects.length)?clone(st.subjects):clone(DEFAULT_SUBJECTS),avgMode:st.avgMode||"entered"};
  if(!L.kinder)L.kinder={name:"មត្តេយ្យ (ទាប មធ្យម ខ្ពស់)",kind:"kinder",subjects:clone(KINDER_SUBJECTS),avgMode:"all"};
  if(!L.eng_k)L.eng_k={name:"English Pre-Nursery – K4",kind:"eng_k",subjects:clone(ENG_K_SUBJECTS),avgMode:"pct"};
  if(!L.eng_p)L.eng_p={name:"English Primary 1 – 3 & GEP",kind:"eng_p",subjects:clone(ENG_P_SUBJECTS),avgMode:"pct"};
  for(const id in L){
    const l=L[id];
    if(!KINDS[l.kind])l.kind="primary";
    if(!l.subjects||!l.subjects.length)l.subjects=clone(defSubjects(l.kind));
    if(!l.avgMode||(KINDS[l.kind].en&&l.avgMode!=="pct"))l.avgMode=KINDS[l.kind].avgMode;
  }
  return L;
}

function defSubjects(kind){return kind==="kinder"?KINDER_SUBJECTS:kind==="eng_k"?ENG_K_SUBJECTS:kind==="eng_p"?ENG_P_SUBJECTS:DEFAULT_SUBJECTS}

const DEPTS={khmer:"ផ្នែកខ្មែរ",english:"ផ្នែកអង់គ្លេស",chinese:"ផ្នែកចិន"};
const levelDept=l=>(l&&l.dept)||(l&&KINDS[l.kind]&&KINDS[l.kind].en?"english":"khmer");
const isHead=()=>S.backend==="server"&&!!S.user&&S.user.role==="head";
const myDepts=()=>isHead()?(S.user.depts||[]):Object.keys(DEPTS);
const isEn=(cls=curClass())=>!!(cls&&KINDS[kindOf(cls)].en);
const clsLabel=c=>c.name+(c.shift?" · "+c.shift:"");
const levelId=cls=>{const L=levels();const id=cls&&cls.levelId;return id&&L[id]?id:"primary"};
const levelOf=cls=>levels()[levelId(cls)];
const subjects=(cls=curClass())=>levelOf(cls).subjects;
const avgMode=(cls=curClass())=>levelOf(cls).avgMode;
const kindOf=(cls=curClass())=>levelOf(cls).kind;
const periodsOf=(cls=curClass())=>KINDS[kindOf(cls)].periods;
const sheetKey=()=>S.sel.classId?`${S.sel.classId}__${S.sel.period}`:null;

/* ---------- Local & Server API Handlers ---------- */
let api=null;

function makeLocalApi(){
  const KEY="hampton_school_db_v3";
  let st;
  try{st=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  st=st||{classes:{},settings:null,sheets:{},docs:{}};
  st.docs=st.docs||{};

  if(!Object.keys(st.classes).length){
    const initialClasses=[
      {id:"c_kg_low",name:"មត្តេយ្យទាប",year:"២០២៦-២០២៧",teacher:"អ្នកគ្រូ សុខ ស្រីម៉ៅ",levelId:"kinder",branch:"main",students:[{id:"s1",name:"សុខ សម្បត្តិ",g:"M"},{id:"s2",name:"កែវ ធីតា",g:"F"}]},
      {id:"c_kg_high",name:"មត្តេយ្យខ្ពស់",year:"២០២៦-២០២៧",teacher:"អ្នកគ្រូ ចាន់ ណារី",levelId:"kinder",branch:"main",students:[{id:"s3",name:"លី ហួរ",g:"M"},{id:"s4",name:"ចេង ពិសី",g:"F"}]},
      {id:"c_p1",name:"ថ្នាក់ទី១",year:"២០២៦-២០២៧",teacher:"លោកគ្រូ អ៊ុក វិបុល",levelId:"primary",branch:"main",students:[{id:"s5",name:"សុខ ពិសិដ្ឋ",g:"M"},{id:"s6",name:"ជា ចិន្តា",g:"F"},{id:"s7",name:"ហ៊ាន វណ្ណៈ",g:"M"}]},
      {id:"c_p3",name:"ថ្នាក់ទី៣",year:"២០២៦-២០២៧",teacher:"អ្នកគ្រូ ម៉ៅ ចិន្តា",levelId:"primary",branch:"main",students:[{id:"s8",name:"តាំង គឹមហុង",g:"M"},{id:"s9",name:"សេង ស្រីលក្ខណ៍",g:"F"}]},
      {id:"c_p6",name:"ថ្នាក់ទី៦",year:"២០២៦-២០២៧",teacher:"លោកគ្រូ ចាន់ សុផល",levelId:"primary",branch:"main",students:[{id:"s10",name:"រស់ សុវណ្ណ",g:"M"},{id:"s11",name:"អ៊ុំ សារ៉ាត",g:"M"},{id:"s12",name:"វ៉ាន់ ធីតា",g:"F"}]},
      {id:"c_k2",name:"English K2",year:"2026-2027",shift:"Morning",teacher:"Teacher Sarah Jenkins",levelId:"eng_k",branch:"main",students:[{id:"s13",name:"Sok Piseth",g:"M"},{id:"s14",name:"Keo Thida",g:"F"}]},
      {id:"c_p1en",name:"Primary 1 English",year:"2026-2027",shift:"Morning",teacher:"Teacher Michael Ross",levelId:"eng_p",branch:"main",students:[{id:"s15",name:"David Chan",g:"M"},{id:"s16",name:"Lisa Sovann",g:"F"}]},
      {id:"c_gep2",name:"GEP 2",year:"2026-2027",shift:"Afternoon",teacher:"Teacher Alex Smith",levelId:"eng_p",branch:"main",students:[{id:"s17",name:"John Heng",g:"M"},{id:"s18",name:"Mary Chea",g:"F"}]}
    ];
    initialClasses.forEach(c=>{st.classes[c.id]=c});
  }

  const subs={classes:new Set(),settings:new Set(),sheets:new Map(),docs:new Map()};
  const collSubs=new Map();
  const collOf=c=>{const o={};for(const k in st.docs){if(k.startsWith(c+"/"))o[k.slice(c.length+1)]=clone(st.docs[k])}return o};
  const emitD=p=>{(subs.docs.get(p)||new Set()).forEach(f=>f(clone(st.docs[p]||null)));const c=p.split("/")[0];(collSubs.get(c)||new Set()).forEach(f=>f(collOf(c)))};
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
  const emitC=()=>subs.classes.forEach(f=>f(Object.entries(st.classes).map(([id,d])=>({id,...clone(d)}))));
  const emitS=()=>subs.settings.forEach(f=>f(clone(st.settings)));
  const emitSh=k=>(subs.sheets.get(k)||new Set()).forEach(f=>f(clone(st.sheets[k]||null)));
  const merge=(a,b)=>{for(const k in b){if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==="object")merge(a[k],b[k]);else a[k]=clone(b[k])}return a};

  return {
    watchClasses(cb){subs.classes.add(cb);setTimeout(emitC);return()=>subs.classes.delete(cb)},
    async saveClass(c){const {id,...r}=c;st.classes[id]=clone(r);persist();emitC()},
    async deleteClass(id){delete st.classes[id];persist();emitC()},
    async deleteSheet(k){delete st.sheets[k];persist();emitSh(k)},
    watchSettings(cb){subs.settings.add(cb);setTimeout(emitS);return()=>subs.settings.delete(cb)},
    async saveSettings(o){st.settings=clone(o);persist();emitS()},
    async getDoc(p){return clone(st.docs[p]||null)},
    async setDoc(p,d){st.docs[p]=clone(d);persist();emitD(p)},
    watchDoc(p,cb){if(!subs.docs.has(p))subs.docs.set(p,new Set());subs.docs.get(p).add(cb);setTimeout(()=>cb(clone(st.docs[p]||null)));return()=>subs.docs.get(p).delete(cb)},
    async patchDoc(p,data){st.docs[p]=merge(st.docs[p]||{},data);persist();emitD(p)},
    watchColl(c,cb){if(!collSubs.has(c))collSubs.set(c,new Set());collSubs.get(c).add(cb);setTimeout(()=>cb(collOf(c)));return()=>collSubs.get(c).delete(cb)},
    watchSheet(k,cb){if(!subs.sheets.has(k))subs.sheets.set(k,new Set());subs.sheets.get(k).add(cb);setTimeout(()=>cb(clone(st.sheets[k]||null)));return()=>subs.sheets.get(k).delete(cb)},
    async patchSheet(k,base,patch){if(!st.sheets[k])st.sheets[k]={...base,scores:{}};merge(st.sheets[k].scores,patch);persist();emitSh(k)}
  };
}

const pollers=new Set();
function kick(){pollers.forEach(f=>f())}
async function req(a,body){
  const opt={method:body?"POST":"GET",credentials:"same-origin",headers:{"Accept":"application/json"}};
  if(body){opt.headers["Content-Type"]="application/json";opt.body=JSON.stringify(body)}
  let r;try{r=await fetch("api.php?a="+a,opt)}catch(e){throw {code:"unavailable",message:"network"}}
  let j=null;try{j=await r.json()}catch(e){}
  if(r.status===401&&a!=="login"){if(S.user)location.reload();throw {code:"unauthenticated"}}
  if(r.status===403||r.status===401)throw {code:"invalid_argument",message:(j&&j.error)||"forbidden"};
  if(!r.ok||!j)throw {code:"unavailable",message:(j&&j.error)||String(r.status)};
  if(body&&/^(set|patch|del)$/.test(a))setTimeout(kick,50);
  return j;
}
function poll(fetcher,cb,ms){
  let stop=false,last=null,t=null,busy=false;
  const tick=async()=>{if(stop||busy)return;busy=true;clearTimeout(t);
    try{const v=await fetcher();if(v!==SAME){const k=JSON.stringify(v);if(k!==last){last=k;cb(v)}}}catch(e){}
    busy=false;if(!stop)t=setTimeout(tick,document.hidden?ms*4:ms)};
  pollers.add(tick);t=setTimeout(tick,0);
  return()=>{stop=true;clearTimeout(t);pollers.delete(tick)};
}
const SAME={};
function makeServerApi(){
  let batch=null;
  const flushGet=async()=>{const b=batch;batch=null;const paths=[...b.keys()];
    for(let i=0;i<paths.length;i+=150){const part=paths.slice(i,i+150);
      try{const j=await req("getmany",{paths:part});part.forEach(p=>b.get(p).forEach(([ok])=>ok(j.docs&&j.docs[p]!==undefined?j.docs[p]:null)))}
      catch(e){part.forEach(p=>b.get(p).forEach(([,no])=>no(e)))}}};
  const get=p=>new Promise((ok,no)=>{if(!batch){batch=new Map();setTimeout(flushGet,10)}if(!batch.has(p))batch.set(p,[]);batch.get(p).push([ok,no])});
  const pollGet=(p,cb,ms)=>{let v="";return poll(()=>req("get&p="+encodeURIComponent(p)+"&v="+v).then(j=>{if(j.same)return SAME;v=j.v||"";return j.data}),cb,ms)};
  const pollList=(c,map,cb,ms)=>{let v="";return poll(()=>req("list&c="+c+"&v="+v).then(j=>{if(j.same)return SAME;v=j.v||"";return map(j.docs)}),cb,ms)};
  return {
    watchClasses(cb){return pollList("classes",docs=>docs.map(d=>({id:d.id,...d.data})),cb,15000)},
    saveClass(c){const {id,...rest}=c;return req("set",{p:"classes/"+id,data:rest})},
    deleteClass(id){return req("del",{p:"classes/"+id})},
    deleteSheet(k){return req("del",{p:"sheets/"+k})},
    watchSettings(cb){return pollGet("settings/main",cb,30000)},
    saveSettings(o){return req("set",{p:"settings/main",data:o})},
    getDoc:get,
    setDoc(p,d){return req("set",{p,data:d})},
    watchSheet(k,cb){return pollGet("sheets/"+k,cb,10000)},
    watchDoc(p,cb){return pollGet(p,cb,15000)},
    watchColl(c,cb){return pollList(c,docs=>{const o={};docs.forEach(d=>{o[d.id]=d.data});return o},cb,15000)},
    patchDoc(p,data){return req("patch",{p,data})},
    patchSheet(k,base,patch){return req("patch",{p:"sheets/"+k,data:{...base,scores:patch}})}
  };
}

/* ---------- score flushing & computation ---------- */
let flushTimer=null,writing=Promise.resolve();
function setStatus(t,err){S.status=t;S.statusErr=!!err;const el=$("#saveStatus");if(el){el.textContent=t;el.className="status"+(err?" err":"")}}

function queueScore(sid,key,v){
  (S.pending[sid]=S.pending[sid]||{})[key]=v;
  setStatus("មិនទាន់រក្សាទុក…");clearTimeout(flushTimer);flushTimer=setTimeout(flush,600);
}
function flush(){
  const k=sheetKey();if(!k)return;
  const patch=S.pending;if(!Object.keys(patch).length)return;
  S.pending={};
  for(const sid in patch){S.inflight[sid]=Object.assign(S.inflight[sid]||{},patch[sid])}
  setStatus("កំពុងរក្សាទុក…");
  writing=writing.then(()=>api.patchSheet(k,{classId:S.sel.classId,period:S.sel.period},patch)).then(()=>{
    for(const sid in patch)for(const key in patch[sid]){if(S.inflight[sid]&&S.inflight[sid][key]===patch[sid][key])delete S.inflight[sid][key]}
    setStatus("បានរក្សាទុក ✓");
  }).catch(e=>{
    for(const sid in patch){S.pending[sid]=Object.assign({},patch[sid],S.pending[sid]||{})}
    S.inflight={};setStatus("រក្សាទុកមិនបាន",true);
  });
}
function scoreOf(sid,key){
  if(S.pending[sid]&&key in S.pending[sid])return S.pending[sid][key];
  if(S.inflight[sid]&&key in S.inflight[sid])return S.inflight[sid][key];
  const sc=S.sheet&&S.sheet.scores&&S.sheet.scores[sid];
  const v=sc?sc[key]:null;return typeof v==="number"?v:null;
}

function compute(cls){
  const subs=subjects(cls),mode=avgMode(cls),kind=kindOf(cls),K=KINDS[kind];
  const fullMax=subs.reduce((a,sb)=>a+smax(sb),0);
  const rows=(cls?cls.students:[]).map((s,i)=>{
    const vals=subs.map(sb=>scoreOf(s.id,sb.key));
    const got=vals.filter(v=>v!=null);
    const total=got.length?total_sum(got):null;
    const avg=got.length?(mode==="pct"?total/fullMax*100:mode==="all"?total/subs.length:total/got.length):null;
    return {s,i,vals,total:got.length?total:null,avg:avg==null?null:Math.round(avg*100)/100,count:got.length};
  });
  rows.forEach(r=>{r.rank=r.avg==null?null:1+rows.filter(o=>o.avg!=null&&o.avg>r.avg).length;r.g=grade(r.avg,kind)});
  const subjAvg=subs.map((_,j)=>{const v=rows.map(r=>r.vals[j]).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null});
  const graded=rows.filter(r=>r.avg!=null);
  const tot=rows.length,fem=rows.filter(r=>r.s.g==="F").length;
  const PM=K.pass??5;const pass=graded.filter(r=>r.avg>=PM),fail=graded.filter(r=>r.avg<PM);
  const dist={};K.grades.forEach(([l])=>{const rs=graded.filter(r=>r.g[0]===l);dist[l]={n:rs.length,f:rs.filter(r=>r.s.g==="F").length}});
  const classAvg=graded.length?graded.reduce((a,r)=>a+r.avg,0)/graded.length:null;
  return {K,kind,subs,rows,subjAvg,tot,fem,graded,pass,fail,dist,classAvg,fullMax,en:!!K.en,
    passF:pass.filter(r=>r.s.g==="F").length,failF:fail.filter(r=>r.s.g==="F").length};
}
function total_sum(arr){return arr.reduce((a,b)=>a+b,0)}

/* ---------- school, branches & users ---------- */
function branches(){const b=(S.settings&&S.settings.branches)||[];return b.length?b:[{id:"main",name:"សាខាកណ្ដាល"}]}
const multiBranch=()=>branches().length>1;
function myBranches(){return branches()}
function curBranch(){const my=myBranches();let b=my.find(x=>x.id===S.branch);if(!b){b=my[0];S.branch=b.id}return b}
const isOwner=()=>true;
const classBranch=c=>(c&&c.branch)||"main";
function applyBranch(){
  const bid=curBranch().id;
  S.classes=(S.allClasses||[]).filter(c=>classBranch(c)===bid);
  if(!S.classes.find(c=>c.id===S.sel.classId))S.sel.classId=S.classes[0]?S.classes[0].id:null;
}
function school(){
  const s=S.settings||{};const b=curBranch();
  return {
    kh:s.schoolKh||SCHOOL_INFO.nameKhmer,
    en:s.schoolEn||SCHOOL_INFO.nameEnglish,
    pt:b.principalTitle||s.principalTitle||"នាយកសាលា",
    pn:b.principalName||s.principalName||"អ្នកគ្រប់គ្រង ហេមតុន",
    br:multiBranch()?b.name:"",
    addr:b.address||"ទូរស័ព្ទ៖ 077 66 22 29 / 069 80 23 23"
  };
}

/* ---------- navigation structure ---------- */
const NAV=[
 {g:"ទូទៅ និងមេរៀន",items:[
   ["home","ផ្ទាំងដើម","fa-solid fa-house","ទិដ្ឋភាពទូទៅនៃសាលា ហេមតុន"],
   ["lessons","ឃ្លាំងមេរៀន & វីដេអូ","fa-solid fa-book-open","មេរៀនទ្រឹស្តី វីដេអូពន្យល់ និងឯកសារ PDF"],
   ["quizzes","កម្រងលំហាត់","fa-solid fa-clipboard-question","លំហាត់អន្តរកម្ម ផ្ទៀងផ្ទាត់ពិន្ទុ និងដំណោះស្រាយ"]
 ]},
 {g:"ការសិក្សា និងគ្រប់គ្រងសិស្ស",items:[
   ["scores","បញ្ចូលពិន្ទុ","fa-solid fa-table-cells","វាយពិន្ទុ មធ្យមភាគ ចំណាត់ថ្នាក់ និទ្ទេស"],
   ["attendance","វត្តមាន","fa-solid fa-clipboard-user","ស្រង់វត្តមានប្រចាំថ្ងៃ និងសរុបប្រចាំខែ"],
   ["students","បញ្ជីសិស្ស","fa-solid fa-users","បន្ថែម កែ និងនាំចូលបញ្ជីសិស្ស"],
   ["report","ព្រឹត្តិបត្រពិន្ទុ","fa-solid fa-file-invoice","ព្រឹត្តិបត្រសិស្សម្នាក់ៗ PDF/JPG"],
   ["notice","តារាងបិទផ្សាយ","fa-solid fa-chalkboard","លទ្ធផលសិក្សា សម្រាប់បិទក្នុងថ្នាក់"],
   ["honor","តារាងកិត្តិយស","fa-solid fa-award","សិស្សពូកែប្រចាំខែ ជាមួយរូបថត"],
   ["idcard","កាតសិស្ស","fa-solid fa-id-card","កាតសម្គាល់ខ្លួនសិស្ស តាមគំរូសាលា ហេមតុន"],
   ["cert","ប័ណ្ណសរសើរ","fa-solid fa-certificate","ប័ណ្ណសរសើរសិស្សពូកែ តាមគំរូសាលា ហេមតុន"],
   ["seal","ត្រា និងហត្ថលេខា","fa-solid fa-stamp","ត្រាសាលា ហត្ថលេខានាយក និងគ្រូ"],
   ["settings","ថ្នាក់ និងមុខវិជ្ជា","fa-solid fa-gear","ថ្នាក់ កម្រិត មុខវិជ្ជា និងឡូហ្គោ"]
 ]},
 {g:"ហិរញ្ញវត្ថុ",fin:true,items:[
   ["fdash","របាយការណ៍ប្រចាំខែ","fa-solid fa-chart-line","ចំណូល ចំណាយ និងសមតុល្យប្រចាំខែ"],
   ["fin_in","ចំណូល","fa-solid fa-arrow-down-long","កត់ត្រាចំណូល និងបង្កាន់ដៃ"],
   ["fin_out","ចំណាយ","fa-solid fa-arrow-up-long","កត់ត្រាចំណាយប្រចាំថ្ងៃ"],
   ["fin_pay","ប្រាក់ខែ","fa-solid fa-wallet","តារាងបើកប្រាក់ខែបុគ្គលិក"],
   ["fin_fee","ថ្លៃសិក្សា","fa-solid fa-receipt","បញ្ជីសិស្សបង់ថ្លៃ និងការបង់ប្រចាំខែ"],
   ["fin_debt","សិស្សជំពាក់","fa-solid fa-triangle-exclamation","សិស្សមិនទាន់បង់ ឬបង់ខ្វះ និងលេខទូរស័ព្ទ"],
   ["fin_year","សង្ខេបប្រចាំឆ្នាំ","fa-solid fa-calendar-days","១២ ខែក្បែរគ្នា ជាមួយក្រាហ្វ"],
   ["fin_set","ការកំណត់ហិរញ្ញវត្ថុ","fa-solid fa-sliders","អត្រាប្ដូរប្រាក់ បញ្ជី និងនាំចូល Excel"]
 ]},
 {g:"គណនី និងសិទ្ធិ",items:[
   ["teachers","គណនី និងសិទ្ធិ","fa-solid fa-users-gear","គ្រប់គ្រង User (Admin, គ្រូ, សិស្ស, មាតាបិតា)"]
 ]}
];

const NAV_LABEL=Object.fromEntries(NAV.flatMap(g=>g.items.map(i=>[i[0],i[1]])));

function navVisible(id,grp){
  const u=StorageManager.getCurrentUser();
  if(!u)return id==="home"||id==="lessons"||id==="quizzes";
  if(u.role==="admin")return true;
  if(grp&&grp.fin)return u.role==="accountant"||u.role==="admin";
  if(id==="teachers"||id==="settings")return u.role==="admin";
  if(u.role==="teacher")return ["home","lessons","quizzes","scores","attendance","students","report","notice","honor","idcard","cert","seal"].includes(id);
  if(u.role==="student"||u.role==="parent")return ["home","lessons","quizzes","report"].includes(id);
  return true;
}

function buildNav(){
  const nav=$("#sideNav");if(!nav)return;
  nav.innerHTML=NAV.map((g,gi)=>`<div class="sn-sec" data-g="${gi}"><div class="sn-grp">${g.g}</div>${g.items.map(([id,l,ic])=>`<button class="tab" data-tab="${id}" aria-selected="false"><i class="${ic}"></i><span>${l}</span></button>`).join("")}</div>`).join("");
}

function renderNav(){
  const u=StorageManager.getCurrentUser();
  NAV.forEach((g,gi)=>{
    let any=false;
    g.items.forEach(([id])=>{
      const b=document.querySelector(`#sideNav [data-tab="${id}"]`);if(!b)return;
      const v=navVisible(id,g);b.hidden=!v;if(v)any=true;
      b.setAttribute("aria-selected",String(id===S.tab));
    });
    const sec=document.querySelector(`.sn-sec[data-g="${gi}"]`);if(sec)sec.hidden=!any;
  });
  const t=$("#pageTitle"),sub=$("#pageSub");
  if(t)t.textContent=NAV_LABEL[S.tab]||"សាលាអន្តរជាតិ ហេមតុន";
  if(sub){
    const c=curClass();
    sub.textContent=S.tab==="home"?todayKh():c?c.name+(c.year?" · "+c.year:""):"Hampton International School";
  }
}

function renderBrand(){
  const sc=school();
  const kh=$("#sbKh"),en=$("#sbEn");
  if(kh)kh.textContent=sc.kh;
  if(en)en.textContent=sc.en;
}

function renderWho(){
  const w=$("#who");if(!w)return;
  const u=StorageManager.getCurrentUser();
  if(!u){
    w.innerHTML=`<div class="who-badge"><i class="fa-solid fa-user"></i> ភ្ញៀវ (Guest)</div><button onclick="openRegisterModal()" style="margin-top:4px;">+ បង្កើតគណនី</button>`;
    return;
  }
  const roleNameMap={admin:"Admin (ពេញលេញ)",teacher:"គ្រូបង្រៀន",student:"សិស្សានុសិស្ស",parent:"មាតាបិតា",accountant:"គណនេយ្យករ"};
  w.innerHTML=`
    <div class="who-badge"><i class="fa-solid fa-circle-user"></i> ${esc(u.name)}</div>
    <div style="font-size:0.72rem;opacity:0.85;margin-bottom:4px;">${roleNameMap[u.role]||u.role} • @${esc(u.username)}</div>
    <div style="display:flex;gap:4px;">
      <button onclick="openRegisterModal()" title="បង្កើតគណនីថ្មី">+ បង្កើត User</button>
      <button onclick="handleLogout()">ចាកចេញ</button>
    </div>
  `;
}

function goTab(id){
  S.tab=id;S.mode=FIN_TAB_IDS.includes(id)?"fin":"acad";
  document.body.classList.remove("nav-open");
  saveUI();render();window.scrollTo(0,0);
}

function renderPickers(){
  const sc=$("#selClass");
  if(sc){
    sc.innerHTML=S.classes.length?S.classes.map(c=>`<option value="${esc(c.id)}">${esc(clsLabel(c))}${c.year?" · "+esc(c.year):""}</option>`).join(""):`<option value="">— មិនទាន់មានថ្នាក់ —</option>`;
    sc.value=S.sel.classId||"";
  }
  const sp=$("#selPeriod");
  if(sp){
    const ps=periodsOf();if(!ps.includes(S.sel.period)){S.sel.period=ps[0];watchSheet()}
    sp.innerHTML=ps.map(k=>`<option value="${k}">${PNAME[k]}${isEn()&&/^m/.test(k)?" · "+PNAME_EN[k]:""}</option>`).join("");
    sp.value=S.sel.period;
  }
  const acadPick=["scores","attendance","students","report","notice","honor","idcard","cert"].includes(S.tab);
  document.querySelectorAll(".pick.acad").forEach(p=>p.hidden=!acadPick);
  document.querySelectorAll(".pick.finp").forEach(p=>p.hidden=!FIN_TAB_IDS.includes(S.tab)||S.tab==="fin_set");
}

/* ---------- rendering router ---------- */
function render(){
  const m=$("#main");if(!m)return;
  renderWho();renderBrand();renderNav();renderPickers();

  if(S.tab==="home"){m.innerHTML=viewHome();bindHome();return}
  if(S.tab==="lessons"){m.innerHTML=viewLessons();bindLessons();return}
  if(S.tab==="quizzes"){m.innerHTML=viewQuizzes();bindQuizzes();return}

  // Academic Modules
  if(S.tab==="scores"){m.innerHTML=viewScores();bindScores();return}
  if(S.tab==="attendance"){m.innerHTML=viewAttendance();bindAttendance();return}
  if(S.tab==="students"){m.innerHTML=viewStudents();bindStudents();return}
  if(S.tab==="report"){m.innerHTML=viewReport();bindReport();return}
  if(S.tab==="notice"){m.innerHTML=viewNotice();bindNotice();return}
  if(S.tab==="honor"){m.innerHTML=viewHonor();bindHonor();return}
  if(S.tab==="idcard"){m.innerHTML=viewIdCard();bindIdCard();return}
  if(S.tab==="cert"){m.innerHTML=viewCert();bindCert();return}
  if(S.tab==="seal"){m.innerHTML=viewSeal();bindSeal();return}
  if(S.tab==="settings"){m.innerHTML=viewBranches()+viewSettings();bindSettings();bindBranches();return}
  if(S.tab==="teachers"){m.innerHTML=viewTeachers();bindUsers();return}

  // Finance Modules
  if(FIN_TAB_IDS.includes(S.tab)){renderFinance(m);return}
}

/* ================= VIEW: HOME DASHBOARD ================= */
function viewHome(){
  const sc=school();
  const studs=S.classes.reduce((a,c)=>a+c.students.length,0);
  const fem=S.classes.reduce((a,c)=>a+c.students.filter(x=>x.g==="F").length,0);
  const items=StorageManager.getItems();
  const lessonsCount=items.filter(i=>i.type==='lesson').length;
  const quizCount=items.filter(i=>i.type==='exercise').length;
  const currentUser=StorageManager.getCurrentUser();

  return `
    <section class="hero">
      <div class="hlogo"><img src="images/logo.png" alt="Logo"></div>
      <div class="htxt">
        <h2>${esc(sc.kh)}</h2>
        <div class="en">${esc(sc.en)}</div>
        <div class="meta">
          <span><i class="fa-solid fa-graduation-cap text-blue-900"></i> ប្រព័ន្ធគ្រប់គ្រងសាលា និងឃ្លាំងមេរៀនរួមបញ្ចូលតែមួយ</span>
          ${currentUser?`<span style="margin-left:8px;">• ចូលប្រើជា៖ <strong>${esc(currentUser.name)} (${esc(currentUser.roleNameKhmer||currentUser.role)})</strong></span>`:''}
        </div>
      </div>
    </section>

    <!-- Top Statistical Overview -->
    <div class="stats">
      <div class="stat"><div class="k">ថ្នាក់រៀនទាំងអស់</div><div class="v num">${toKh(S.classes.length)}</div><div class="s">មត្តេយ្យ បឋម & English</div></div>
      <div class="stat"><div class="k">សិស្សសរុប</div><div class="v num">${toKh(studs)}</div><div class="s">ស្រី ${toKh(fem)} នាក់</div></div>
      <div class="stat"><div class="k">មេរៀនក្នុងឃ្លាំង</div><div class="v num" style="color:var(--navy);">${toKh(lessonsCount)}</div><div class="s">មានវីដេអូ & រូបមន្ត KaTeX</div></div>
      <div class="stat"><div class="k">កម្រងលំហាត់</div><div class="v num" style="color:var(--red);">${toKh(quizCount)}</div><div class="s">តេស្តអន្តរកម្ម & ចម្លើយពន្យល់</div></div>
    </div>

    <!-- Quick Navigation Tiles -->
    <div class="tgrp">
      <h3>១. ឃ្លាំងមេរៀន និងលំហាត់ឌីជីថល (Learning Hub)</h3>
      <div class="tiles">
        <button class="tile edu" onclick="goTab('lessons')">
          <span class="ic"><i class="fa-solid fa-book-open"></i></span>
          <div><b>ឃ្លាំងមេរៀន & វីដេអូ</b><span>អានមេរៀន មើលវីដេអូ និងទាញយកឯកសារ PDF</span></div>
        </button>
        <button class="tile edu" onclick="goTab('quizzes')">
          <span class="ic"><i class="fa-solid fa-pen-nib"></i></span>
          <div><b>កម្រងលំហាត់អនុវត្ត</b><span>សាកល្បងធ្វើលំហាត់ ទទួលបានពិន្ទុភ្លាមៗ</span></div>
        </button>
      </div>
    </div>

    <div class="tgrp">
      <h3>២. ការសិក្សា និងរដ្ឋបាលសិស្ស (Academic Records)</h3>
      <div class="tiles">
        <button class="tile" onclick="goTab('scores')"><span class="ic"><i class="fa-solid fa-table-cells"></i></span><div><b>បញ្ចូលពិន្ទុ</b><span>តារាងពិន្ទុ គណនាមធ្យមភាគ ចំណាត់ថ្នាក់ និទ្ទេស</span></div></button>
        <button class="tile" onclick="goTab('attendance')"><span class="ic"><i class="fa-solid fa-clipboard-user"></i></span><div><b>វត្តមានសិស្ស</b><span>ស្រង់វត្តមានប្រចាំថ្ងៃ និងសរុបប្រចាំខែ</span></div></button>
        <button class="tile" onclick="goTab('students')"><span class="ic"><i class="fa-solid fa-users"></i></span><div><b>បញ្ជីសិស្ស</b><span>គ្រប់គ្រងឈ្មោះ រូបថតសិស្ស និងនាំចូលពី Excel</span></div></button>
        <button class="tile" onclick="goTab('report')"><span class="ic"><i class="fa-solid fa-file-invoice"></i></span><div><b>ព្រឹត្តិបត្រពិន្ទុ</b><span>ព្រីនព្រឹត្តិបត្រសិស្សម្នាក់ៗចេញជាក្រដាស A4</span></div></button>
        <button class="tile" onclick="goTab('notice')"><span class="ic"><i class="fa-solid fa-chalkboard"></i></span><div><b>តារាងបិទផ្សាយ</b><span>តារាងលទ្ធផលប្រចាំខែ សម្រាប់បិទក្នុងថ្នាក់</span></div></button>
        <button class="tile" onclick="goTab('honor')"><span class="ic"><i class="fa-solid fa-award"></i></span><div><b>តារាងកិត្តិយស</b><span>សិស្សពូកែ ១ ដល់ ៥ ជាមួយរូបថត និងមេដាយ</span></div></button>
        <button class="tile" onclick="goTab('idcard')"><span class="ic"><i class="fa-solid fa-id-card"></i></span><div><b>កាតសិស្ស</b><span>កាតសម្គាល់ខ្លួនសិស្ស តាមគំរូសាលា ហេមតុន</span></div></button>
        <button class="tile" onclick="goTab('cert')"><span class="ic"><i class="fa-solid fa-certificate"></i></span><div><b>ប័ណ្ណសរសើរ</b><span>ប័ណ្ណសរសើរសិស្សពូកែ តាមគំរូសាលា ហេមតុន</span></div></button>
        <button class="tile" onclick="goTab('seal')"><span class="ic"><i class="fa-solid fa-stamp"></i></span><div><b>ត្រា និងហត្ថលេខា</b><span>ដាក់ត្រាសាលា និងហត្ថលេខានាយក/គ្រូ</span></div></button>
      </div>
    </div>

    ${finAccess()?`
      <div class="tgrp">
        <h3>៣. ហិរញ្ញវត្ថុសាលា (School Finance)</h3>
        <div class="tiles">
          <button class="tile fin" onclick="goTab('fdash')"><span class="ic"><i class="fa-solid fa-chart-line"></i></span><div><b>របាយការណ៍ប្រចាំខែ</b><span>ចំណូល ចំណាយ សមតុល្យដៃ និងធនាគារ</span></div></button>
          <button class="tile fin" onclick="goTab('fin_in')"><span class="ic"><i class="fa-solid fa-arrow-down-long"></i></span><div><b>ចំណូល</b><span>កត់ត្រាចំណូល និងចេញបង្កាន់ដៃ</span></div></button>
          <button class="tile fin" onclick="goTab('fin_out')"><span class="ic"><i class="fa-solid fa-arrow-up-long"></i></span><div><b>ចំណាយ</b><span>កត់ត្រាចំណាយប្រតិបត្តិការប្រចាំថ្ងៃ</span></div></button>
          <button class="tile fin" onclick="goTab('fin_pay')"><span class="ic"><i class="fa-solid fa-wallet"></i></span><div><b>ប្រាក់ខែ</b><span>តារាងបើកប្រាក់ខែគ្រូ និងបុគ្គលិក</span></div></button>
          <button class="tile fin" onclick="goTab('fin_fee')"><span class="ic"><i class="fa-solid fa-receipt"></i></span><div><b>ថ្លៃសិក្សា</b><span>បញ្ជីសិស្សបង់ថ្លៃ និងការបង់ប្រចាំខែ</span></div></button>
          <button class="tile fin" onclick="goTab('fin_debt')"><span class="ic"><i class="fa-solid fa-triangle-exclamation"></i></span><div><b>សិស្សជំពាក់</b><span>បញ្ជីសិស្សមិនទាន់បង់ និងលេខទូរស័ព្ទ</span></div></button>
          <button class="tile fin" onclick="goTab('fin_year')"><span class="ic"><i class="fa-solid fa-calendar-days"></i></span><div><b>សង្ខេបប្រចាំឆ្នាំ</b><span>ទិន្នន័យ ១២ ខែ និងក្រាហ្វវិភាគ</span></div></button>
        </div>
      </div>
    `:''}
  `;
}
function bindHome(){}

/* ================= VIEW: LESSONS & VIDEOS ================= */
function viewLessons(){
  const items=StorageManager.getItems();
  const currentUser=StorageManager.getCurrentUser();
  const canAdd=currentUser&&(currentUser.role==='admin'||currentUser.role==='teacher');
  const subjList=INITIAL_SUBJECTS;

  let filtered=items.filter(i=>i.type==='lesson');
  if(S.lessons.selectedSubject!=='all')filtered=filtered.filter(i=>i.subject===S.lessons.selectedSubject);
  if(S.lessons.selectedGrade!=='all')filtered=filtered.filter(i=>i.grade===S.lessons.selectedGrade);
  if(S.lessons.searchQuery){
    const q=S.lessons.searchQuery.toLowerCase().trim();
    filtered=filtered.filter(i=>(i.title||'').toLowerCase().includes(q)||(i.summary||'').toLowerCase().includes(q)||(i.teacher||'').toLowerCase().includes(q));
  }

  const cardsHtml=filtered.map(item=>{
    const subj=INITIAL_SUBJECTS.find(s=>s.id===item.subject)||{name:'ទូទៅ',icon:'fa-book',color:'blue'};
    const hasVid=item.videoUrl&&item.videoUrl.trim()!=='';
    return `
      <div class="panel card-hover" style="display:flex;flex-direction:column;justify-content:space-between;padding:16px;">
        <div>
          <div class="row" style="justify-content:space-between;margin-bottom:8px;">
            <span class="gpill B"><i class="fa-solid ${subj.icon}"></i> ${subj.name}</span>
            <span class="chip N" style="font-size:0.75rem;">${item.grade}</span>
          </div>
          <h3 onclick="openDetailModal('${item.id}')" style="cursor:pointer;font-size:1.05rem;font-weight:700;color:var(--navy);margin:6px 0;line-height:1.4;">${esc(item.title)}</h3>
          <p class="hint" style="line-height:1.5;margin-bottom:12px;">${esc(item.summary||'ចុចដើម្បីអានខ្លឹមសារមេរៀន...')}</p>
        </div>
        <div style="border-top:1px solid var(--line);padding-top:10px;display:flex;align-items:center;justify-content:space-between;">
          <span class="hint" style="font-size:0.78rem;"><i class="fa-solid fa-chalkboard-user"></i> ${esc(item.teacher||'គ្រូ')}</span>
          <div class="row" style="gap:6px;">
            ${hasVid?`<span style="color:var(--red);font-size:0.78rem;font-weight:700;"><i class="fa-solid fa-circle-play"></i> វីដេអូ</span>`:''}
            <button class="btn sm primary" onclick="openDetailModal('${item.id}')">អានមេរៀន</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;margin-bottom:12px;">
        <div>
          <h2 style="margin:0;">ឃ្លាំងមេរៀន និងវីដេអូបង្រៀន</h2>
          <p class="sub" style="margin:2px 0 0;">មេរៀនទ្រឹស្តី រូបមន្ត KaTeX វីដេអូ និងឯកសារ PDF ភ្ជាប់</p>
        </div>
        <div class="row" style="gap:8px;">
          ${canAdd?`<button class="btn primary" onclick="openAddModal()"><i class="fa-solid fa-circle-plus"></i> + បន្ថែមមេរៀនថ្មី</button>`:''}
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="row" style="gap:10px;margin-bottom:14px;">
        <input class="inp" id="lsSearch" placeholder="ស្វែងរកចំណងជើង ខ្លឹមសារ គ្រូ..." value="${esc(S.lessons.searchQuery)}" style="flex:1;min-width:200px;">
        <select class="inp" id="lsSubjSelect">
          <option value="all">គ្រប់មុខវិជ្ជា</option>
          ${subjList.map(s=>`<option value="${s.id}" ${S.lessons.selectedSubject===s.id?'selected':''}>${s.name}</option>`).join('')}
        </select>
        <select class="inp" id="lsGradeSelect">
          <option value="all">គ្រប់កម្រិតថ្នាក់</option>
          ${ALL_GRADES.map(g=>`<option value="${g}" ${S.lessons.selectedGrade===g?'selected':''}>${g}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">
        ${cardsHtml||`<div class="empty" style="grid-column:1/-1;"><p>មិនមានមេរៀនត្រូវគ្នានឹងការស្វែងរកឡើយ</p></div>`}
      </div>
    </section>
  `;
}

function bindLessons(){
  const s=$("#lsSearch");if(s)s.oninput=()=>{S.lessons.searchQuery=s.value;render()};
  const sj=$("#lsSubjSelect");if(sj)sj.onchange=()=>{S.lessons.selectedSubject=sj.value;render()};
  const g=$("#lsGradeSelect");if(g)g.onchange=()=>{S.lessons.selectedGrade=g.value;render()};
  renderMath();
}

/* ================= VIEW: PRACTICE QUIZZES ================= */
function viewQuizzes(){
  const items=StorageManager.getItems();
  const currentUser=StorageManager.getCurrentUser();
  const canAdd=currentUser&&(currentUser.role==='admin'||currentUser.role==='teacher');

  const quizzes=items.filter(i=>i.questions&&i.questions.length>0);

  const cards=quizzes.map(item=>{
    const subj=INITIAL_SUBJECTS.find(s=>s.id===item.subject)||{name:'ទូទៅ',icon:'fa-book'};
    return `
      <div class="panel card-hover" style="display:flex;flex-direction:column;justify-content:space-between;padding:16px;">
        <div>
          <div class="row" style="justify-content:space-between;margin-bottom:8px;">
            <span class="gpill C">${subj.name}</span>
            <span class="chip E">${item.grade}</span>
          </div>
          <h3 onclick="openQuizModal('${item.id}')" style="cursor:pointer;font-size:1.05rem;font-weight:700;color:var(--navy);margin:6px 0;">${esc(item.title)}</h3>
          <p class="hint" style="line-height:1.5;margin-bottom:12px;">${esc(item.summary||'កម្រងលំហាត់អនុវត្តអន្តរកម្ម')}</p>
        </div>
        <div style="border-top:1px solid var(--line);padding-top:10px;display:flex;align-items:center;justify-content:space-between;">
          <span class="chip P"><i class="fa-solid fa-list-check"></i> ${item.questions.length} សំណួរ</span>
          <button class="btn primary sm" onclick="openQuizModal('${item.id}')"><i class="fa-solid fa-pen-nib"></i> ធ្វើលំហាត់</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;margin-bottom:12px;">
        <div>
          <h2 style="margin:0;">កម្រងលំហាត់ និងតេស្តអនុវត្ត</h2>
          <p class="sub" style="margin:2px 0 0;">ដោះស្រាយសំណួរពហុជ្រើសរើស (A, B, C, D) ផ្ទៀងផ្ទាត់ពិន្ទុ និងដំណោះស្រាយ</p>
        </div>
        ${canAdd?`<button class="btn primary" onclick="openAddModal()"><i class="fa-solid fa-circle-plus"></i> + បន្ថែមលំហាត់ថ្មី</button>`:''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">
        ${cards||`<div class="empty" style="grid-column:1/-1;"><p>មិនទាន់មានលំហាត់នៅឡើយទេ</p></div>`}
      </div>
    </section>
  `;
}
function bindQuizzes(){renderMath();}

/* ================= LESSON DETAILS & QUIZ SOLVER ================= */
function parseMarkdown(mdText) {
  if (!mdText) return '';
  let html = mdText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1.1rem;font-weight:700;color:#0d2b6b;margin:14px 0 6px;"><i class="fa-solid fa-chevron-right text-xs"></i> $1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:1.25rem;font-weight:700;color:#081a42;margin:18px 0 8px;border-bottom:1px solid #d8e0ec;padding-bottom:4px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size:1.45rem;font-weight:700;color:#081a42;margin:20px 0 10px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code style="background:#f1f5f9;color:#c8102e;padding:1px 5px;border-radius:4px;font-family:monospace;">$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:20px;list-style:disc;">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-left:20px;list-style:decimal;">$1</li>')
    .replace(/\n\s*\n/g, '</p><p style="margin-bottom:10px;line-height:1.7;">');
  return '<p style="margin-bottom:10px;line-height:1.7;">' + html + '</p>';
}

function renderMath() {
  if (typeof renderMathInElement === 'function') {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {}
  }
}

function openDetailModal(id) {
  const item = StorageManager.getItemById(id);if(!item)return;
  StorageManager.incrementViews(id);
  const modal=$("#detailModal"),c=$("#detailModalContent");if(!modal||!c)return;

  let vidHtml='';
  if(item.videoUrl){
    let src=item.videoUrl;
    if(src.includes('watch?v='))src=src.replace('watch?v=','embed/');
    vidHtml=`<div class="video-container" style="margin:14px 0;"><iframe src="${src}" allowfullscreen></iframe></div>`;
  }

  c.innerHTML=`
    <div style="padding:16px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span class="chip E">${item.grade}</span>
        <h2 style="margin:4px 0 0;color:var(--navy);font-size:1.25rem;">${esc(item.title)}</h2>
      </div>
      <button onclick="closeAllModals()" class="btn sm"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div style="padding:20px;max-height:75vh;overflow-y:auto;">
      ${vidHtml}
      <div style="line-height:1.7;">${parseMarkdown(item.content)}</div>
      ${item.questions&&item.questions.length?`
        <div style="margin-top:20px;padding:16px;background:var(--navy-soft);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
          <div><b>មានលំហាត់អនុវត្ត ${item.questions.length} សំណួរ</b><p class="hint" style="margin:0;">ដោះស្រាយដើម្បីវាស់ស្ទង់សមត្ថភាព</p></div>
          <button class="btn primary" onclick="closeAllModals();openQuizModal('${item.id}')"><i class="fa-solid fa-pen-nib"></i> ធ្វើលំហាត់</button>
        </div>`:''}
    </div>
  `;
  modal.classList.remove('hidden');renderMath();
}

function openQuizModal(id) {
  const item = StorageManager.getItemById(id);if(!item||!item.questions)return;
  S.lessons.activeItem=item;S.lessons.quizAnswers={};S.lessons.quizSubmitted=false;
  renderQuizUI();
  const modal=$("#quizModal");if(modal)modal.classList.remove('hidden');
}

function renderQuizUI() {
  const item=S.lessons.activeItem;const c=$("#quizModalContent");if(!item||!c)return;
  const questions=item.questions;

  c.innerHTML=`
    <div style="padding:16px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span class="chip P">កម្រងលំហាត់ • ${item.grade}</span>
        <h3 style="margin:4px 0 0;color:var(--navy);font-size:1.15rem;">${esc(item.title)}</h3>
      </div>
      <button onclick="closeAllModals()" class="btn sm"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div style="padding:20px;max-height:75vh;overflow-y:auto;">
      ${questions.map((q,qi)=>{
        const sel=S.lessons.quizAnswers[qi];
        const isSub=S.lessons.quizSubmitted;
        const isCor=isSub&&sel===q.answer;
        return `
          <div style="margin-bottom:18px;padding:14px;border:1px solid var(--line);border-radius:8px;background:${isSub?(isCor?'#e1f3ea':'#fbe4e1'):'#fff'};">
            <h4 style="margin:0 0 10px;font-size:0.95rem;color:var(--navy);">
              <span class="chip N">${qi+1}</span> ${q.question}
            </h4>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${q.options.map((opt,oi)=>{
                const isSelected=sel===oi;
                let bg=isSelected?'var(--navy-soft)':'#fff';
                if(isSub){if(oi===q.answer)bg='#c6f6d5';else if(isSelected)bg='#fed7d7';}
                return `
                  <button type="button" ${isSub?'disabled':''} onclick="selectQuizOption(${qi},${oi})" style="text-align:left;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:${bg};cursor:pointer;font-size:0.88rem;">
                    <b>${String.fromCharCode(65+oi)}.</b> ${opt}
                  </button>
                `;
              }).join('')}
            </div>
            ${isSub?`<div style="margin-top:8px;font-size:0.85rem;color:#1e3a8a;"><strong>ការពន្យល់៖</strong> ${q.explanation||'ចម្លើយត្រឹមត្រូវគឺ ' + String.fromCharCode(65+q.answer)}</div>`:''}
          </div>
        `;
      }).join('')}

      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:14px;">
        ${S.lessons.quizSubmitted?`
          <button class="btn" onclick="retryQuiz()"><i class="fa-solid fa-rotate-right"></i> ធ្វើម្ដងទៀត</button>
        `:`
          <span class="hint">ឆ្លើយគ្រប់សំណួររួចចុច «បញ្ជូនចម្លើយ»</span>
          <button class="btn primary" onclick="submitQuiz()"><i class="fa-solid fa-paper-plane"></i> បញ្ជូនចម្លើយ</button>
        `}
      </div>
    </div>
  `;
  renderMath();
}

window.selectQuizOption=function(qi,oi){
  S.lessons.quizAnswers[qi]=oi;renderQuizUI();
};
window.submitQuiz=function(){
  const item=S.lessons.activeItem;if(!item)return;
  let score=0;item.questions.forEach((q,i)=>{if(S.lessons.quizAnswers[i]===q.answer)score++});
  S.lessons.quizSubmitted=true;
  StorageManager.saveQuizResult(item.id,score,item.questions.length);
  renderQuizUI();
  toast(`អ្នកទទួលបានពិន្ទុ ${score}/${item.questions.length} (${Math.round(score/item.questions.length*100)}%)`);
};
window.retryQuiz=function(){
  S.lessons.quizAnswers={};S.lessons.quizSubmitted=false;renderQuizUI();
};

/* ================= AUTHENTICATION MODALS & LOGIC ================= */
window.quickLogin=function(role){
  const users=StorageManager.getUsers();
  const u=users.find(x=>x.role===role);
  if(u){
    StorageManager.setCurrentUser(u);
    toast(`បានចូលប្រើជា៖ ${u.name} (${u.roleNameKhmer||u.role})`);
    render();
  }
};
window.handleLogout=function(){
  StorageManager.logout();
  toast("បានចាកចេញពីគណនី");
  render();
};
window.openRegisterModal=function(){
  closeAllModals();const m=$("#registerModal");if(m)m.classList.remove('hidden');
};
window.closeAllModals=function(){
  document.querySelectorAll('.app-modal').forEach(m=>m.classList.add('hidden'));
};

window.openAddModal=function(){
  const modal=$("#editModal");if(!modal)return;
  $("#itemForm").reset();
  const sel=$("#modalItemGrade");
  if(sel)sel.innerHTML=ALL_GRADES.map(g=>`<option value="${g}">${g}</option>`).join('');
  renderQuestionBuilder([]);
  modal.classList.remove('hidden');
};

function renderQuestionBuilder(questions=[]){
  const c=$("#questionsBuilderContainer");if(!c)return;
  c.innerHTML=`
    <div class="row" style="justify-content:space-between;margin-bottom:6px;">
      <label class="block text-xs font-bold text-slate-700">សំណួរពហុជ្រើសរើស (${questions.length})</label>
      <button type="button" class="btn sm" onclick="addQuestionRow()">+ បន្ថែមសំណួរ</button>
    </div>
    <div id="qRows">${questions.map((q,i)=>questionRowHtml(i,q)).join('')}</div>
  `;
}
function questionRowHtml(i,q={question:'',options:['','','',''],answer:0,explanation:''}){
  const opts=q.options||['','','',''];
  return `
    <div class="q-row" style="border:1px solid var(--line);border-radius:6px;padding:8px;margin-bottom:8px;background:#f9fafb;">
      <input type="text" name="q_txt_${i}" value="${esc(q.question)}" placeholder="សំណួរទី ${i+1}" class="inp" style="width:100%;margin-bottom:6px;" required>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
        <input class="inp" name="q_opt_${i}_0" value="${esc(opts[0])}" placeholder="ជម្រើស A" required>
        <input class="inp" name="q_opt_${i}_1" value="${esc(opts[1])}" placeholder="ជម្រើស B" required>
        <input class="inp" name="q_opt_${i}_2" value="${esc(opts[2])}" placeholder="ជម្រើស C" required>
        <input class="inp" name="q_opt_${i}_3" value="${esc(opts[3])}" placeholder="ជម្រើស D" required>
      </div>
      <div class="row" style="gap:6px;">
        <select class="inp" name="q_ans_${i}">
          <option value="0" ${q.answer===0?'selected':''}>ចម្លើយត្រូវ៖ A</option>
          <option value="1" ${q.answer===1?'selected':''}>ចម្លើយត្រូវ៖ B</option>
          <option value="2" ${q.answer===2?'selected':''}>ចម្លើយត្រូវ៖ C</option>
          <option value="3" ${q.answer===3?'selected':''}>ចម្លើយត្រូវ៖ D</option>
        </select>
        <input class="inp" name="q_exp_${i}" value="${esc(q.explanation)}" placeholder="ការពន្យល់ដំណោះស្រាយ..." style="flex:1;">
      </div>
    </div>
  `;
}
window.addQuestionRow=function(){
  const rows=$("#qRows");if(!rows)return;
  const count=rows.querySelectorAll('.q-row').length;
  const div=document.createElement('div');div.innerHTML=questionRowHtml(count);
  rows.appendChild(div.firstElementChild);
};

/* ================= VIEW: SCORES / GRADEBOOK ================= */
function viewScores(){
  const cls=curClass();const C=compute(cls);
  const subs=C.subs;
  const hasGroups=subs.some(s=>s.group);
  let g1="",g2="";
  if(hasGroups){
    let i=0;
    while(i<subs.length){
      const g=subs[i].group||"";let j=i;while(j<subs.length&&(subs[j].group||"")===g)j++;
      g1+=g?`<th class="grp" colspan="${j-i}">${esc(g)}</th>`:`<th class="grp" colspan="${j-i}" rowspan="1"></th>`;
      i=j;
    }
  }
  const subjTh=subs.map(s=>`<th class="subj" title="${esc(s.name)}">${esc(s.name)}${C.en?` <small class="mx">${smax(s)}</small>`:""}</th>`).join("");
  const rs=hasGroups?' rowspan="2"':"";
  const head=hasGroups
    ?`<tr class="r1"><th class="c-no"${rs}>ល.រ</th><th class="c-name"${rs}>គោត្តនាម និងនាម</th><th class="c-g"${rs}>ភេទ</th>${g1}<th${rs}>សរុប</th><th${rs}>មធ្យមភាគ</th><th${rs}>ចំណាត់<br>ថ្នាក់</th><th${rs}>និទ្ទេស</th></tr><tr class="r2">${subjTh}</tr>`
    :`<tr><th class="c-no">ល.រ</th><th class="c-name">គោត្តនាម និងនាម</th><th class="c-g">ភេទ</th>${subjTh}<th>សរុប</th><th>មធ្យមភាគ</th><th>ចំណាត់<br>ថ្នាក់</th><th>និទ្ទេស</th></tr>`;
  const ro=S.canWrite?"":"readonly";
  const body=C.rows.map((r,ri)=>`<tr data-sid="${esc(r.s.id)}">
     <td class="c-no num">${ri+1}</td><td class="c-name" title="${esc(r.s.name)}"><span class="nmwrap">${avatar(r.s,26)}<span>${esc(r.s.name)}</span></span></td><td class="c-g">${r.s.g==="F"?"ស":"ប"}</td>
     ${r.vals.map((v,j)=>`<td class="cell"><input data-r="${ri}" data-c="${j}" data-k="${esc(subs[j].key)}" data-max="${smax(subs[j])}" inputmode="decimal" autocomplete="off" aria-label="${esc(r.s.name)} ${esc(subs[j].name)}" value="${v==null?"":fmt(v)}" class="${v!=null&&v<smax(subs[j])/2?"low":""}" ${ro}></td>`).join("")}
     <td class="calc num" data-o="total">${r.total==null?"":fmt(r.total)}</td>
     <td class="calc avg num" data-o="avg">${fmt2(r.avg)==="–"?"":fmt2(r.avg)}</td>
     <td class="calc num" data-o="rank">${r.rank?`<span class="rank ${r.rank<=3?"top":""}">${r.rank}</span>`:""}</td>
     <td class="calc" data-o="g">${pill(r.g)}</td></tr>`).join("");
  const foot=`<tr><td class="c-no"></td><td class="c-name">មធ្យមភាគមុខវិជ្ជា</td><td></td>${C.subjAvg.map((v,j)=>`<td data-sa="${j}">${v==null?"":v.toFixed(1)}</td>`).join("")}<td></td><td data-o="cavg">${C.classAvg==null?"":C.classAvg.toFixed(2)}</td><td></td><td></td></tr>`;
  const empty=!C.rows.length?`<div class="empty" style="padding:24px"><p>ថ្នាក់នេះមិនទាន់មានសិស្សទេ។</p><button class="btn primary" id="goStudents">បញ្ចូលបញ្ជីសិស្ស</button></div>`:"";
  return `
  <div class="stats" id="statStrip">${statsHTML(C)}</div>
  <section class="panel" style="padding:14px">
    <div class="row" style="margin-bottom:10px">
      <div><h2 style="margin:0">${esc(clsLabel(cls))} — ${esc(PNAME[S.sel.period])}</h2>
      <div class="hint">${C.en?`វាយពិន្ទុតាមពិន្ទុពេញនៃមុខវិជ្ជានីមួយៗ · ពិន្ទុពេញសរុប ${C.fullMax} · មធ្យមភាគ = សរុប ÷ ${fmt(C.fullMax/100)}។`:"វាយពិន្ទុ ០–១០ (អាចប្រើ ០.៥)។"} ចុច Enter ឬព្រួញ ដើម្បីទៅប្រអប់បន្ទាប់។ រក្សាទុកដោយស្វ័យប្រវត្តិ។</div></div>
      <span class="spacer"></span>
      <span id="saveStatus" class="status${S.statusErr?" err":""}">${esc(S.status)}</span>
      <button class="btn" id="btnImp" ${S.canWrite?"":"disabled"}>នាំចូលពី Excel</button>
      <button class="btn" id="btnPdf">PDF</button>
      <button class="btn" id="btnJpg">JPG</button>
      <button class="btn primary" id="btnExp">ទាញយក Excel</button>
    </div>
    <div class="row" style="margin-bottom:10px;align-items:flex-end"><span class="hint" style="align-self:center">ថ្ងៃខែលើ PDF/JPG៖</span>${dateFieldsHTML()}</div>
    ${empty||`<div class="gridwrap"><table class="grid" id="grid"><thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table></div>`}
  </section>
  <section class="panel" id="sumPanel">${summaryHTML(C)}</section>`;
}

function statsHTML(C){
  const bar=C.graded.length?C.K.grades.map(([l,k,css])=>C.dist[l].n?`<span class="sw-${css}" style="width:${C.dist[l].n/C.graded.length*100}%" title="${k}: ${C.dist[l].n}"></span>`:"").join(""):"";
  return `
   <div class="stat"><div class="k">សិស្សសរុប</div><div class="v num">${C.tot}</div><div class="s">ស្រី ${C.fem} នាក់</div></div>
   <div class="stat"><div class="k">សិស្សជាប់ (មធ្យមភាគ ≥ ${toKh(C.K.pass??5)})</div><div class="v num">${C.pass.length}</div><div class="s">${pct(C.pass.length,C.graded.length)} · ស្រី ${C.passF}</div></div>
   <div class="stat"><div class="k">សិស្សធ្លាក់</div><div class="v num" style="color:${C.fail.length?"var(--gE)":"inherit"}">${C.fail.length}</div><div class="s">${pct(C.fail.length,C.graded.length)} · ស្រី ${C.failF}</div></div>
   <div class="stat"><div class="k">មធ្យមភាគថ្នាក់</div><div class="v num">${C.classAvg==null?"–":C.classAvg.toFixed(2)}</div><div class="s">${C.graded.length} នាក់មានពិន្ទុ</div><div class="dist">${bar}</div></div>`;
}

function summaryHTML(C){
  const n=C.graded.length;
  const rows=C.K.grades.map(([l])=>`<tr><td>${pill(gradeOf(l,C.kind))}</td><td class="n">${C.dist[l].n}</td><td class="n">${C.dist[l].f}</td><td class="n">${pct(C.dist[l].n,n)}</td></tr>`).join("");
  return `<h2>សេចក្ដីសរុបលទ្ធផល</h2><p class="sub">គណនាដោយស្វ័យប្រវត្តិ ពីពិន្ទុក្នុងតារាងខាងលើ</p>
  <div class="sumgrid">
    <div class="tbl"><table class="plain"><thead><tr><th></th><th style="text-align:right">សរុប</th><th style="text-align:right">ស្រី</th><th style="text-align:right">ភាគរយ</th></tr></thead><tbody>
      <tr><td>បញ្ឈប់បញ្ជីត្រឹមចំនួន</td><td class="n">${C.tot}</td><td class="n">${C.fem}</td><td class="n"></td></tr>
      <tr><td>មធ្យមភាគសិស្សជាប់</td><td class="n">${C.pass.length}</td><td class="n">${C.passF}</td><td class="n">${pct(C.pass.length,n)}</td></tr>
      <tr><td>មធ្យមភាគសិស្សធ្លាក់</td><td class="n">${C.fail.length}</td><td class="n">${C.failF}</td><td class="n">${pct(C.fail.length,n)}</td></tr>
      <tr><td>គ្មានពិន្ទុ</td><td class="n">${C.tot-n}</td><td class="n">${C.rows.filter(r=>r.avg==null&&r.s.g==="F").length}</td><td class="n"></td></tr>
    </tbody></table></div>
    <div class="tbl"><table class="plain"><thead><tr><th>និទ្ទេស</th><th style="text-align:right">សរុប</th><th style="text-align:right">ស្រី</th><th style="text-align:right">ភាគរយ</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}

function bindScores(){
  const c=curClass();if(c)ensurePhotos(c.students.map(s=>s.id));
  const gs=$("#goStudents");if(gs)gs.onclick=()=>goTab("students");
  $("#btnImp").onclick=()=>$("#fileImport").click();
  $("#btnExp").onclick=exportXlsx;
  bindDateFields();
  $("#btnPdf").onclick=()=>exportScoreSheet("pdf");$("#btnJpg").onclick=()=>exportScoreSheet("jpg");
  const grid=$("#grid");if(!grid)return;
  grid.addEventListener("input",e=>{
    const inp=e.target;if(!inp.matches("input")||!S.canWrite)return;
    const sid=inp.closest("tr").dataset.sid,key=inp.dataset.k;
    const mx=+inp.dataset.max||10;const p=parseScore(inp.value,mx);
    inp.classList.toggle("bad",!p.ok);
    if(!p.ok)return;
    inp.classList.toggle("low",p.v!=null&&p.v<mx/2);
    queueScore(sid,key,p.v);refreshComputed();
  });
}

function refreshComputed(){
  const cls=curClass();if(!cls||S.tab!=="scores")return;
  const C=compute(cls);const grid=$("#grid");if(!grid)return;
  C.rows.forEach((r,ri)=>{
    const tr=grid.tBodies[0].rows[ri];if(!tr)return;
    tr.querySelector('[data-o="total"]').textContent=r.total==null?"":fmt(r.total);
    tr.querySelector('[data-o="avg"]').textContent=r.avg==null?"":r.avg.toFixed(2);
    tr.querySelector('[data-o="rank"]').innerHTML=r.rank?`<span class="rank ${r.rank<=3?"top":""}">${r.rank}</span>`:"";
    tr.querySelector('[data-o="g"]').innerHTML=pill(r.g);
  });
  grid.querySelectorAll("[data-sa]").forEach(td=>{const v=C.subjAvg[+td.dataset.sa];td.textContent=v==null?"":v.toFixed(1)});
  const ca=grid.querySelector('[data-o="cavg"]');if(ca)ca.textContent=C.classAvg==null?"":C.classAvg.toFixed(2);
  $("#statStrip").innerHTML=statsHTML(C);$("#sumPanel").innerHTML=summaryHTML(C);
}

/* ================= VIEW: ATTENDANCE ================= */
const ATT=[["P","មក"],["L","យឺត"],["E","ច្បាប់"],["A","ឥតច្បាប់"]];
const ATT_SYM={L:"យ",E:"ច",A:"អ"};
function attWatch(){
  const cls=curClass();if(!cls)return;
  const k=`${cls.id}__${S.att.date.slice(0,7)}`;if(k===S.att.key)return;
  flushAtt();
  S.att.key=k;S.att.doc=null;
  api.watchDoc("attendance/"+k,d=>{S.att.doc=d||{};if(S.tab==="attendance")refreshAtt()});
}
function attStatus(date,sid){
  const p=S.att.pend.days[date];if(p&&sid in p)return p[sid]||"P";
  const d=S.att.doc&&S.att.doc.days&&S.att.doc.days[date];return (d&&d[sid])||"P";
}
const attMarked=date=>!!(S.att.pend.marked[date]||(S.att.doc&&S.att.doc.marked&&S.att.doc.marked[date]));

function setAtt(sid,code){
  const d=S.att.date;(S.att.pend.days[d]=S.att.pend.days[d]||{})[sid]=code==="P"?null:code;S.att.pend.marked[d]=true;
  setStatus("មិនទាន់រក្សាទុក…");flushAtt();
}
function flushAtt(){
  const k=S.att.key;const pend=S.att.pend;if(!k)return;
  const [cid,month]=k.split("__");
  api.patchDoc("attendance/"+k,{classId:cid,month,days:pend.days,marked:pend.marked});
}
function viewAttendance(){
  attWatch();const cls=curClass();const dis=S.canWrite?"":"disabled";
  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;margin-bottom:10px;">
        <div class="seg"><button data-v="day" class="P" aria-pressed="${S.att.view==="day"}">ប្រចាំថ្ងៃ</button><button data-v="month" class="P" aria-pressed="${S.att.view==="month"}">សរុបប្រចាំខែ</button></div>
        <input class="inp" type="date" id="attDate" value="${S.att.date}">
      </div>
      <div id="attBody">${S.att.view==="day"?attDayHTML(cls,dis):attMonthHTML(cls)}</div>
    </section>
  `;
}
function attDayHTML(cls,dis){
  const d=S.att.date;
  const rows=cls.students.map((st,i)=>{const c=attStatus(d,st.id);
    return `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line);justify-content:space-between;">
      <span class="nmwrap">${avatar(st,28)}<span>${i+1}. ${esc(st.name)}</span></span>
      <div class="seg">${ATT.map(([k,l])=>`<button class="${k}" data-c="${k}" aria-pressed="${c===k}" ${dis}>${l}</button>`).join("")}</div>
    </div>`}).join("");
  return `<div class="att-list" id="attList">${rows||'<p class="hint">មិនទាន់មានសិស្សទេ</p>'}</div>`;
}
function attMonthHTML(cls){
  return `<p class="hint">ទិដ្ឋភាពសរុបប្រចាំខែ</p>`;
}
function bindAttendance(){
  const list=$("#attList");
  if(list)list.addEventListener("click",e=>{const b=e.target.closest("button[data-c]");if(!b||!S.canWrite)return;
    const sid=b.closest(".row").dataset.sid||b.closest("[data-sid]")?.dataset.sid;
    setAtt(sid,b.dataset.c);b.closest(".seg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  });
  const d=$("#attDate");if(d)d.onchange=()=>{S.att.date=d.value;render()};
}
function refreshAtt(){const b=$("#attBody");const cls=curClass();if(!b||!cls)return;b.innerHTML=S.att.view==="day"?attDayHTML(cls,""):attMonthHTML(cls);}

/* ================= VIEW: STUDENTS ================= */
function viewStudents(){
  const cls=curClass();const dis=S.canWrite?"":"disabled";
  const list=cls.students.map((s,i)=>`<div class="row srow" data-i="${i}" style="padding:6px 0;border-bottom:1px solid var(--line);">
     <span class="no num" style="width:24px;">${i+1}</span>
     <button type="button" class="av btn-av" data-av="${esc(s.id)}" data-a="photo" style="--s:36px" ${dis}>${S.photos[s.id]?`<img src="${S.photos[s.id]}" alt="">`:`<i>${esc(photoInitial(s.name))}</i>`}</button>
     <input class="inp" data-f="name" value="${esc(s.name)}" style="flex:1;" ${dis}>
     <select class="inp" data-f="g" ${dis}><option value="M"${s.g!=="F"?" selected":""}>ប្រុស</option><option value="F"${s.g==="F"?" selected":""}>ស្រី</option></select>
     <button class="btn sm danger" data-a="del" ${dis}>លុប</button>
  </div>`).join("");
  return `
    <div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px;">
      <section class="panel">
        <h2>បញ្ជីសិស្ស ${esc(cls.name)} (${cls.students.length} នាក់)</h2>
        <div id="slist">${list||'<p class="hint">មិនទាន់មានសិស្ស</p>'}</div>
      </section>
      <section class="panel">
        <h2>បន្ថែមសិស្សម្នាក់</h2>
        <form id="fAdd" class="row" style="margin-top:10px">
          <input class="inp" id="aName" placeholder="ឈ្មោះសិស្ស" style="flex:1" required ${dis}>
          <select class="inp" id="aG" ${dis}><option value="M">ប្រុស</option><option value="F">ស្រី</option></select>
          <button class="btn primary" ${dis}>បន្ថែម</button>
        </form>
      </section>
    </div>
  `;
}
function bindStudents(){
  const cls=clone(curClass());
  $("#fAdd").onsubmit=e=>{e.preventDefault();const n=$("#aName").value.trim();if(!n)return;
    cls.students.push({id:uid(),name:n,g:$("#aG").value});saveClass(cls);toast("បានបន្ថែម "+n);render();};
}
function saveClass(cls){api.saveClass(cls);renderPickers();}

/* ================= VIEW: STUDENT REPORT CARDS ================= */
function viewReport(){
  const cls=curClass();const C=compute(cls);
  if(!C.rows.length)return `<section class="panel empty"><p>ថ្នាក់នេះមិនទាន់មានសិស្សទេ</p></section>`;
  if(!C.rows.find(r=>r.s.id===S.rcStudent))S.rcStudent=C.rows[0].s.id;
  const r=C.rows.find(x=>x.s.id===S.rcStudent);
  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;">
        <h2>ព្រឹត្តិបត្រពិន្ទុ</h2>
        <div class="row" style="gap:6px;">
          <button class="btn" onclick="window.print()"><i class="fa-solid fa-print"></i> បោះពុម្ព</button>
          <button class="btn primary" id="rcPdf">ទាញយក PDF</button>
        </div>
      </div>
      <div style="margin-top:14px;" class="card paper">${rcInner(cls,C,r)}</div>
    </section>
  `;
}
function rcInner(cls,C,r){
  const subRows=C.subs.map((sb,j)=>`<tr><td>${esc(sb.name)}</td><td class="n">${r.vals[j]==null?"–":fmt(r.vals[j])}</td><td class="n">${C.subjAvg[j]==null?"–":C.subjAvg[j].toFixed(1)}</td></tr>`).join("");
  return `
    <div style="padding:20px;">
      <h3 style="text-align:center;font-family:var(--f-display);color:var(--navy);font-size:1.2rem;margin:0 0 10px;">ព្រឹត្តិបត្រពិន្ទុសិស្ស</h3>
      <div class="row" style="justify-content:space-between;margin-bottom:12px;">
        <div><b>ឈ្មោះសិស្ស៖ ${esc(r.s.name)}</b> • ភេទ៖ ${r.s.g==='F'?'ស្រី':'ប្រុស'}</div>
        <div>ថ្នាក់៖ ${esc(cls.name)} • ឆ្នាំសិក្សា៖ ${esc(cls.year||'២០២៦-២០២៧')}</div>
      </div>
      <table class="plain"><thead><tr><th>មុខវិជ្ជា</th><th style="text-align:right">ពិន្ទុ</th><th style="text-align:right">មធ្យមភាគថ្នាក់</th></tr></thead><tbody>${subRows}</tbody></table>
      <div class="stats" style="margin-top:14px;">
        <div class="stat"><div class="k">ពិន្ទុសរុប</div><div class="v num">${r.total==null?"–":fmt(r.total)}</div></div>
        <div class="stat"><div class="k">មធ្យមភាគ</div><div class="v num">${r.avg==null?"–":r.avg.toFixed(2)}</div></div>
        <div class="stat"><div class="k">ចំណាត់ថ្នាក់</div><div class="v num" style="color:var(--red);">${r.rank||'–'}</div></div>
        <div class="stat"><div class="k">និទ្ទេស</div><div class="v">${r.g?pill(r.g):'–'}</div></div>
      </div>
    </div>
  `;
}
function bindReport(){
  $("#rcPdf").onclick=()=>window.print();
}

/* ================= VIEW: NOTICE BOARD ================= */
function viewNotice(){
  const cls=curClass();const C=compute(cls);
  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;margin-bottom:14px;">
        <h2>តារាងបិទផ្សាយលទ្ធផល</h2>
        <button class="btn primary" onclick="window.print()">បោះពុម្ព</button>
      </div>
      <div class="pv-wrap" id="pvWrap">${noticeHTML(cls,C)}</div>
    </section>
  `;
}
function noticeHTML(cls,C){
  const body=C.rows.map((r,k)=>`<tr><td>${k+1}</td><td class="nm">${esc(r.s.name)}</td><td>${r.s.g==="F"?"ស":"ប"}</td><td>${r.total==null?"–":fmt(r.total)}</td><td><b>${r.avg==null?"–":r.avg.toFixed(2)}</b></td><td class="rk">${r.rank?`<span class="medal">${toKh(r.rank)}</span>`:"–"}</td><td>${r.g?r.g[0]:"–"}</td></tr>`).join("");
  return pageHTML(`
    <h1 class="ss-title">លទ្ធផលសិក្សា ${esc(PNAME[S.sel.period])}</h1>
    <div class="ss-sub">${esc(cls.name)}</div>
    <table class="nb"><thead><tr><th>ល.រ</th><th>គោត្តនាម និងនាម</th><th>ភេទ</th><th>ពិន្ទុសរុប</th><th>មធ្យមភាគ</th><th>ចំណាត់ថ្នាក់</th><th>និទ្ទេស</th></tr></thead><tbody>${body}</tbody></table>
  `);
}
function bindNotice(){}

/* ================= VIEW: HONOR ROLL ================= */
function viewHonor(){
  const cls=curClass();const C=compute(cls);
  return `
    <section class="panel">
      <div class="row" style="justify-content:space-between;margin-bottom:14px;">
        <h2>តារាងកិត្តិយស</h2>
        <button class="btn primary" onclick="window.print()">បោះពុម្ព A4</button>
      </div>
      <div class="hs-wrap" id="hsWrap">${honorSheetHTML(cls,C,honorMeta(),false)}</div>
    </section>
  `;
}
function honorSheetHTML(cls,C,meta,edit){
  const top=C.rows.filter(r=>r.rank&&r.rank<=5).sort((a,b)=>a.rank-b.rank);
  return `
    <div style="padding:24px;border:3px solid var(--marigold);border-radius:12px;background:#fff;text-align:center;">
      <h1 class="ss-title" style="font-size:24px;">តារាងកិត្តិយសសិស្សពូកែ</h1>
      <div class="ss-sub" style="font-size:16px;">${esc(cls.name)} — ${esc(PNAME[S.sel.period])}</div>
      <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin:24px 0;">
        ${top.map(r=>`
          <div style="display:flex;flex-direction:column;align-items:center;min-width:110px;">
            <div class="av" style="--s:70px;border-color:var(--marigold);">${S.photos[r.s.id]?`<img src="${S.photos[r.s.id]}">`:`<i>${photoInitial(r.s.name)}</i>`}</div>
            <div class="medal" style="margin-top:-10px;z-index:2;">${toKh(r.rank)}</div>
            <b style="margin-top:6px;font-size:0.95rem;">${esc(r.s.name)}</b>
            <span class="hint">មធ្យមភាគ ${r.avg.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function bindHonor(){}

/* ---------- student ID cards: the school's printed design with photo, name, ID and class filled in ---------- */
S.idc={sel:null,cur:null,yearEn:true};
// positions on the 1024×1536 design (scaled if a replacement template has another size)
const IDC={W:1024,H:1536,photo:[307,480,411,456,46],name:[500,1007],id:[500,1085],grade:[500,1162],right:930,color:"#0b1d5c"};
function idTpl(){return S.photos.idtpl||"idcard-template.jpg"}
async function ensureIdTpl(){if(!("idtpl" in S.photos)){try{const d=await api.getDoc("photos/idtpl");S.photos.idtpl=d&&d.data||null}catch(e){S.photos.idtpl=null}}}
const imgCache=new Map();
function loadImg(src){if(!src)return Promise.resolve(null);if(imgCache.has(src))return imgCache.get(src);
  const p=new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});imgCache.set(src,p);return p}
async function idFonts(){try{await Promise.all([document.fonts.load('700 34px "Kantumruy Pro"',"កខគ ABC 123"),document.fonts.load('600 22px "Kantumruy Pro"',"ABC")])}catch(e){}}
function fitText(x,txt,max,size,weight){let s=size;do{x.font=`${weight} ${s}px "Kantumruy Pro", "Noto Sans Khmer", sans-serif`;if(x.measureText(txt).width<=max)break;s-=1}while(s>12);return s}
function idGrade(cls){const yr=S.idc.yearEn&&cls.year?"  ·  "+String(cls.year).replace(/[០-៩]/g,c=>KH_DIG.indexOf(c)):"";return (cls.name||"")+yr}
async function drawIdCard(st,cls){
  const tpl=await loadImg(idTpl());const W=tpl?tpl.naturalWidth:IDC.W,H=tpl?tpl.naturalHeight:IDC.H,k=W/IDC.W;
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  x.fillStyle="#fff";x.fillRect(0,0,W,H);if(tpl)x.drawImage(tpl,0,0,W,H);
  await idFonts();
  // photo, cropped to fill the rounded box
  const [px,py,pw,ph,pr]=IDC.photo.map(v=>v*k);const img=await loadImg(S.photos[st.id]);
  x.save();x.beginPath();x.roundRect?x.roundRect(px,py,pw,ph,pr):x.rect(px,py,pw,ph);x.clip();
  if(img){const r=Math.max(pw/img.naturalWidth,ph/img.naturalHeight),w=img.naturalWidth*r,h=img.naturalHeight*r;x.drawImage(img,px+(pw-w)/2,py+(ph-h)/2.6,w,h)}
  else{x.fillStyle="rgba(255,255,255,.55)";x.textAlign="center";x.textBaseline="middle";x.font=`600 ${30*k}px "Kantumruy Pro", sans-serif`;x.fillText("រូបថត ៣×៤",px+pw/2,py+ph/2)}
  x.restore();
  // text on the lines
  x.fillStyle=IDC.color;x.textAlign="left";x.textBaseline="middle";const max=(IDC.right-IDC.name[0])*k;
  const kh=st.name||"",en=(st.en||"").trim().toUpperCase();
  if(en){fitText(x,kh,max,30*k,700);x.fillText(kh,IDC.name[0]*k,(IDC.name[1]-12)*k);fitText(x,en,max,21*k,600);x.fillText(en,IDC.name[0]*k,(IDC.name[1]+21)*k)}
  else{fitText(x,kh,max,34*k,700);x.fillText(kh,IDC.name[0]*k,IDC.name[1]*k)}
  const code=st.code||"";fitText(x,code,max,32*k,700);x.fillText(code,IDC.id[0]*k,IDC.id[1]*k);
  const gr=idGrade(cls);fitText(x,gr,max,30*k,700);x.fillText(gr,IDC.grade[0]*k,IDC.grade[1]*k);
  return c;
}
function idPrefix(){return (S.settings&&S.settings.idPrefix)||"HIS"}
function autoCodes(cls){
  const yy=String(new Date().getFullYear()).slice(2);const pre=idPrefix()+"-"+yy;
  let n=0;(S.allClasses||S.classes).forEach(c=>c.students.forEach(s=>{const m=String(s.code||"").match(/(\d+)$/);if(s.code&&s.code.startsWith(pre)&&m)n=Math.max(n,+m[1])}));
  let added=0;cls.students.forEach(s=>{if(!s.code){n++;s.code=pre+String(n).padStart(4,"0");added++}});return added;
}
function idSelected(cls){if(!S.idc.sel||S.idc.selCls!==cls.id){S.idc.sel=new Set(cls.students.map(s=>s.id));S.idc.selCls=cls.id}return cls.students.filter(s=>S.idc.sel.has(s.id))}
function viewIdCard(){
  const cls=curClass();if(!cls.students.length)return `<section class="panel empty"><p>ថ្នាក់នេះមិនទាន់មានសិស្សទេ។</p></section>`;
  idSelected(cls);if(!cls.students.some(s=>s.id===S.idc.cur))S.idc.cur=cls.students[0].id;
  const dis=S.canWrite?"":"disabled";const owner=S.backend!=="server"||isOwner();const noCode=cls.students.filter(s=>!s.code).length;
  const rows=cls.students.map((s,i)=>`<tr data-id="${esc(s.id)}" class="${s.id===S.idc.cur?"on":""}">
      <td><input type="checkbox" data-a="sel" ${S.idc.sel.has(s.id)?"checked":""} aria-label="ជ្រើស ${esc(s.name)}"></td>
      <td class="num">${toKh(i+1)}</td><td class="l"><span class="nmwrap">${avatar(s,28)}<span>${esc(s.name)}</span></span></td>
      <td class="l"><input class="inp sm" data-f="en" value="${esc(s.en||"")}" placeholder="ឈ្មោះឡាតាំង" aria-label="ឈ្មោះឡាតាំង ${esc(s.name)}" ${dis}></td>
      <td class="l"><input class="inp sm" data-f="code" value="${esc(s.code||"")}" placeholder="អត្តលេខ" aria-label="អត្តលេខ ${esc(s.name)}" ${dis}></td></tr>`).join("");
  return `<div class="hon-layout idc-layout">
    <section class="panel hon-form">
      <div><h2>កាតសម្គាល់ខ្លួនសិស្ស</h2><p class="sub" style="margin:0">ប្រើគំរូកាតរបស់សាលា។ រូបថត ឈ្មោះ អត្តលេខ និងថ្នាក់ ចូលដោយស្វ័យប្រវត្តិ។ ចុចលើជួរ ដើម្បីមើលកាតរបស់សិស្សនោះ។</p></div>
      <div class="row" style="gap:8px">
        <div class="field" style="flex:1;min-width:110px"><label for="idPre">បុព្វបទអត្តលេខ</label><input class="inp" id="idPre" value="${esc(idPrefix())}" ${owner&&S.canWrite?"":"disabled"}></div>
        <button class="btn" id="idAuto" ${dis} style="align-self:flex-end">បង្កើតអត្តលេខ${noCode?` (${toKh(noCode)})`:""}</button>
      </div>
      <p class="hint" style="margin:0">អត្តលេខស្វ័យប្រវត្តិ៖ ${esc(idPrefix())}-${String(new Date().getFullYear()).slice(2)}0001 … (បង្កើតតែសិស្សដែលមិនទាន់មាន)។ អាចវាយកែបានផ្ទាល់។</p>
      <label class="row" style="gap:8px"><input type="checkbox" id="idYr" ${S.idc.yearEn?"checked":""}> បង្ហាញឆ្នាំសិក្សាជាប់នឹងថ្នាក់</label>
      <div class="row"><button class="btn primary" id="idPdf">ទាញយក PDF (A4 · ៩ កាត/ទំព័រ)</button><button class="btn" id="idJpg">JPG កាតនេះ</button></div>
      <p class="hint" style="margin:0" id="idCount">បានជ្រើស ${toKh(S.idc.sel.size)} នាក់ · ទំហំកាតពេលបោះពុម្ព ៥៤×៨១ មម</p>
      ${owner?`<details class="idc-tpl"><summary>គំរូកាត</summary><p class="hint">ប្ដូរគំរូបាន (ត្រូវមានប្លង់ដូចគំរូបច្ចុប្បន្ន រូបភាពបញ្ឈរ ២:៣)។</p>
        <div class="row"><button class="btn sm" id="idTplBtn" ${dis}>ប្ដូររូបគំរូ</button>${S.photos.idtpl?`<button class="btn sm" id="idTplReset" ${dis}>ប្រើគំរូដើម</button>`:""}</div>
        <input type="file" id="idTplFile" accept="image/*" hidden></details>`:""}
      <div class="idc-prev"><canvas id="idCanvas" aria-label="កាតសិស្ស"></canvas></div>
    </section>
    <div class="idc-right">
      <section class="panel" style="padding:10px 12px">
        <div class="gridwrap"><table class="ftab idc-tab"><thead><tr><th><input type="checkbox" id="idAll" ${S.idc.sel.size===cls.students.length?"checked":""} aria-label="ជ្រើសទាំងអស់"></th><th>ល.រ</th><th class="l">គោត្តនាម និងនាម</th><th class="l">ឈ្មោះឡាតាំង</th><th class="l">អត្តលេខ</th></tr></thead><tbody id="idBody">${rows}</tbody></table></div>
      </section>
    </div>
  </div>`;
}
async function drawIdPreview(){
  const cls=curClass();const st=cls&&cls.students.find(s=>s.id===S.idc.cur);const cv=$("#idCanvas");if(!st||!cv)return;
  const tok=drawIdPreview.t=(drawIdPreview.t||0)+1;const c=await drawIdCard(st,cls);if(tok!==drawIdPreview.t)return;
  const cv2=$("#idCanvas");if(!cv2)return;cv2.width=c.width;cv2.height=c.height;cv2.getContext("2d").drawImage(c,0,0);
}
function bindIdCard(){
  const cls=curClass();if(!$("#idBody"))return;
  const redraw=()=>drawIdPreview();
  Promise.all([ensureIdTpl(),ensurePhotos(cls.students.map(s=>s.id))]).then(()=>{if(S.tab==="idcard")redraw()});redraw();
  const body=$("#idBody");
  body.addEventListener("click",e=>{const tr=e.target.closest("tr[data-id]");if(!tr||e.target.matches("input"))return;S.idc.cur=tr.dataset.id;body.querySelectorAll("tr").forEach(r=>r.classList.toggle("on",r===tr));redraw()});
  body.addEventListener("focusin",e=>{const tr=e.target.closest("tr[data-id]");if(tr&&e.target.dataset.f&&S.idc.cur!==tr.dataset.id){S.idc.cur=tr.dataset.id;body.querySelectorAll("tr").forEach(r=>r.classList.toggle("on",r===tr));redraw()}});
  body.addEventListener("input",e=>{const f=e.target.dataset.f;if(!f)return;const st=cls.students.find(s=>s.id===e.target.closest("tr").dataset.id);st[f]=e.target.value.trim();clearTimeout(bindIdCard.t);bindIdCard.t=setTimeout(redraw,150)});
  body.addEventListener("change",e=>{
    if(e.target.dataset.a==="sel"){const id=e.target.closest("tr").dataset.id;e.target.checked?S.idc.sel.add(id):S.idc.sel.delete(id);$("#idAll").checked=S.idc.sel.size===cls.students.length;$("#idCount").textContent=`បានជ្រើស ${toKh(S.idc.sel.size)} នាក់ · ទំហំកាតពេលបោះពុម្ព ៥៤×៨១ មម`;return}
    if(e.target.dataset.f){const code=e.target.dataset.f==="code"&&e.target.value.trim();
      if(code&&(S.allClasses||S.classes).some(c=>c.students.some(s=>s.code===code&&s.id!==e.target.closest("tr").dataset.id)))toast("ប្រយ័ត្ន៖ អត្តលេខ "+code+" មានសិស្សផ្សេងប្រើរួចហើយ");
      saveClass(cls)}});
  $("#idAll").onchange=e=>{S.idc.sel=new Set(e.target.checked?cls.students.map(s=>s.id):[]);render()};
  $("#idYr").onchange=e=>{S.idc.yearEn=e.target.checked;redraw()};
  const pre=$("#idPre");if(pre)pre.onchange=()=>{const v=pre.value.trim().replace(/\s+/g,"")||"HIS";const o=clone(S.settings||{});o.idPrefix=v;saveSettings(o);render()};
  $("#idAuto").onclick=()=>{const n=autoCodes(cls);if(!n){toast("សិស្សទាំងអស់មានអត្តលេខរួចហើយ");return}saveClass(cls);toast(`បានបង្កើតអត្តលេខ ${n} នាក់`);render()};
  $("#idJpg").onclick=async()=>{const st=cls.students.find(s=>s.id===S.idc.cur);setStatus("កំពុងបង្កើត…");const c=await drawIdCard(st,cls);
    const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.93));await saveFile(`កាតសិស្ស-${st.code||""}-${st.name}.jpg`.replace(/--/,"-"),blob);setStatus("")};
  $("#idPdf").onclick=()=>exportIdPdf(cls);
  const tb=$("#idTplBtn"),tf=$("#idTplFile");
  if(tb){tb.onclick=()=>tf.click();tf.onchange=async()=>{const f=tf.files[0];if(!f)return;
    try{const data=await shrinkImage(f,1024,1536,true);S.photos.idtpl=data;await api.setDoc("photos/idtpl",{data,at:Date.now()});toast("បានប្ដូរគំរូកាត")}catch(e){toast("រក្សាទុកគំរូមិនបាន")}render()}}
  const rs=$("#idTplReset");if(rs)rs.onclick=async()=>{S.photos.idtpl=null;try{await api.setDoc("photos/idtpl",{data:null,at:Date.now()})}catch(e){}render()};
}
async function exportIdPdf(cls){
  const list=idSelected(cls);if(!list.length){toast("សូមជ្រើសសិស្សយ៉ាងហោចណាស់ម្នាក់");return}
  try{await loadRender(true)}catch(e){toast("ផ្ទុកកម្មវិធីបង្កើត PDF មិនបាន");return}
  await ensureIdTpl();await ensurePhotos(list.map(s=>s.id));
  const pdf=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  const CW=54,CH=81,G=6,mx=(210-3*CW-2*G)/2,my=(297-3*CH-2*G)/2;
  for(let i=0;i<list.length;i++){
    setStatus(`កំពុងបង្កើតកាត ${i+1}/${list.length}…`);
    if(i&&i%9===0)pdf.addPage();const j=i%9,col=j%3,row=Math.floor(j/3);const X=mx+col*(CW+G),Y=my+row*(CH+G);
    const c=await drawIdCard(list[i],cls);pdf.addImage(c.toDataURL("image/jpeg",.9),"JPEG",X,Y,CW,CH,undefined,"FAST");
    pdf.setDrawColor(190);pdf.setLineWidth(.15);pdf.rect(X,Y,CW,CH);
  }
  setStatus("");await saveFile(`កាតសិស្ស-${cls.name}.pdf`,pdf.output("blob"));
}


/* ---------- certificates of merit: the school's printed certificate, 2 per A4 page ---------- */
S.cert={sel:null,key:null,num:"",pn:true,cls:"",exam:"",year:""};
// positions on the 2480-wide original design (scaled to the template's real width)
const CERT={W:2480,num:[419,716,90],name:[1041,898,370],gender:[1380,898,125],rank:[854,985,112],cls:[1141,985,98],exam:[1577,985,330],year:[2030,985,270],lunar:[1810,1150,800],solar:[1810,1212,720],pn:[1805,1440,600],ink:"#14237a",red:"#d0161b"};
function certTpl(){return S.photos.certtpl||"cert-template.jpg"}
async function ensureCertTpl(){if(!("certtpl" in S.photos)){try{const d=await api.getDoc("photos/certtpl");S.photos.certtpl=d&&d.data||null}catch(e){S.photos.certtpl=null}}}
const certClassText=cls=>String(cls.name||"").replace(/^ថ្នាក់\s*(ទី)?\s*/,"").trim();
const khNum=s=>String(s).replace(/[0-9]/g,d=>KH_DIG[d]);
function certTexts(cls){return {cls:S.cert.cls||certClassText(cls),exam:S.cert.exam||PNAME[S.sel.period]||"",year:S.cert.year||khNum(cls.year||"")}}
function certRows(cls){const C=compute(cls);return C.rows.filter(r=>r.rank!=null).sort((a,b)=>a.rank-b.rank||a.i-b.i)}
function certSelected(cls){
  const key=cls.id+"__"+S.sel.period;const rows=certRows(cls);
  if(S.cert.key!==key){S.cert.key=key;const n=honorMeta().count||5;S.cert.sel=new Set(rows.filter(r=>r.rank<=n).map(r=>r.s.id))}
  return rows.filter(r=>S.cert.sel.has(r.s.id));
}
function certFont(x,txt,max,size,family,weight){let s=size;const lo=size*.4,st=Math.max(.25,size/60);do{x.font=`${weight} ${s}px ${family}`;if(x.measureText(txt).width<=max)break;s-=st}while(s>lo);}
async function certFonts(){try{await Promise.all([document.fonts.load('52px "Moul"',"សិស្ស"),document.fonts.load('700 56px "Kantumruy Pro"',"ក ១ A"),document.fonts.load('500 44px "Kantumruy Pro"',"ក ១ A")])}catch(e){}}
async function drawCert(r,cls,scale,idx){
  const tpl=await loadImg(certTpl());const W0=tpl?tpl.naturalWidth:2200,H0=tpl?tpl.naturalHeight:1551;
  const k=W0/CERT.W*scale;const c=document.createElement("canvas");c.width=Math.round(W0*scale);c.height=Math.round(H0*scale);const x=c.getContext("2d");
  x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);if(tpl)x.drawImage(tpl,0,0,c.width,c.height);
  await certFonts();x.textAlign="center";x.textBaseline="alphabetic";
  const MOUL='"Moul", "Kantumruy Pro", serif',KP='"Kantumruy Pro", "Noto Sans Khmer", sans-serif';
  const put=(pos,txt,size,fam,w,col)=>{if(!txt)return;x.fillStyle=col||CERT.ink;certFont(x,txt,pos[2]*k,size*k,fam,w);x.fillText(txt,pos[0]*k,pos[1]*k)};
  const T=certTexts(cls);
  if(S.cert.num){const n=parseInt(String(S.cert.num).replace(/[០-៩]/g,c=>KH_DIG.indexOf(c)),10);if(!isNaN(n))put(CERT.num,khNum(String(n+idx).padStart(3,"0")),34,KP,700)}
  put(CERT.name,r.s.name,50,MOUL,400);
  put(CERT.gender,r.s.g==="F"?"ស្រី":"ប្រុស",52,KP,700);
  put(CERT.rank,khNum(r.rank),64,KP,800,CERT.red);
  put(CERT.cls,T.cls,52,KP,700);put(CERT.exam,T.exam,52,KP,700);put(CERT.year,T.year,52,KP,700);
  const m=honorMeta();put(CERT.lunar,m.lunar||LUNAR_BLANK,42,KP,500,"#222");put(CERT.solar,"ត្រូវនឹង"+(m.solar||todayKh()),42,KP,500,"#222");
  // stamp to the left behind the title (multiplied so the printed words stay readable), signature over its edge, name below to the right
  const sc=school();let sg=null,sp=null;
  if(sealOn("cert")){sg=await loadImg(S.photos[sigPKey()]);sp=await loadImg(S.photos.stamp)}
  if(sp){const d=265*k,dh=d*sp.naturalHeight/sp.naturalWidth;x.save();x.globalCompositeOperation="multiply";x.globalAlpha=.9;x.drawImage(sp,1830*k-d,1335*k-dh/2,d,dh);x.restore()}
  if(sg){const h=135*k,w=Math.min(sg.naturalWidth*h/sg.naturalHeight,330*k);const hh=w*sg.naturalHeight/sg.naturalWidth;x.drawImage(sg,1835*k-w/2,1345*k-hh/2,w,hh)}
  if(S.cert.pn&&sc.pn)put(sp?[1930,1445,520]:CERT.pn,sc.pn,44,MOUL,400);
  return c;
}
// one A4 portrait page with up to two certificates (landscape), stacked
async function certPage(list,cls,p,dpmm){
  const PW=210,PH=297,CW=200,CH=CW*1551/2200,GAP=(PH-2*CH)/3;
  const c=document.createElement("canvas");c.width=Math.round(PW*dpmm);c.height=Math.round(PH*dpmm);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  for(let j=0;j<2;j++){const r=list[p*2+j];if(!r)break;const cc=await drawCert(r,cls,CW*dpmm/2200,p*2+j);
    const X=(PW-CW)/2*dpmm,Y=(GAP+j*(CH+GAP))*dpmm;x.drawImage(cc,X,Y,CW*dpmm,CH*dpmm)}
  x.strokeStyle="#bbb";x.setLineDash([6,6]);x.lineWidth=1;x.beginPath();x.moveTo(0,PH/2*dpmm);x.lineTo(c.width,PH/2*dpmm);x.stroke();
  return c;
}
function viewCert(){
  const cls=curClass();const rows=certRows(cls);
  if(!rows.length)return `<section class="panel empty"><h2>មិនទាន់មានចំណាត់ថ្នាក់</h2><p>សូមបញ្ចូលពិន្ទុ${esc(PNAME[S.sel.period])}ជាមុនសិន ទើបអាចចេញប័ណ្ណសរសើរបាន។</p></section>`;
  certSelected(cls);const T=certTexts(cls);const sc=school();
  const list=rows.map(r=>`<label class="crow"><input type="checkbox" data-id="${esc(r.s.id)}" ${S.cert.sel.has(r.s.id)?"checked":""}><b class="rk">${toKh(r.rank)}</b><span class="nmwrap">${avatar(r.s,24)}<span>${esc(r.s.name)}</span></span><span class="hint num">${r.avg.toFixed(2)}</span></label>`).join("");
  return `<div class="hon-layout cert-layout">
    <section class="panel hon-form">
      <div><h2>ប័ណ្ណសរសើរ</h2><p class="sub" style="margin:0">ប្រើគំរូប័ណ្ណរបស់សាលា។ ឈ្មោះ ភេទ ចំណាត់ថ្នាក់ ថ្នាក់ ការប្រឡង និងឆ្នាំសិក្សា ចូលដោយស្វ័យប្រវត្តិ។ ក្រដាស A4 មួយសន្លឹក = ២ ប័ណ្ណ។</p></div>
      ${dateFieldsHTML()}
      <div class="row" style="gap:8px">
        <div class="field" style="flex:1;min-width:80px"><label for="ctCls">ថ្នាក់ទី</label><input class="inp" id="ctCls" value="${esc(T.cls)}"></div>
        <div class="field" style="flex:2;min-width:120px"><label for="ctExam">ក្នុងការប្រឡង</label><input class="inp" id="ctExam" value="${esc(T.exam)}"></div>
      </div>
      <div class="row" style="gap:8px">
        <div class="field" style="flex:1;min-width:120px"><label for="ctYear">ឆ្នាំសិក្សា</label><input class="inp" id="ctYear" value="${esc(T.year)}"></div>
        <div class="field" style="flex:1;min-width:100px"><label for="ctNum">លេខប័ណ្ណចាប់ផ្ដើម</label><input class="inp" id="ctNum" value="${esc(S.cert.num)}" placeholder="ទុកទទេ = មិនដាក់" inputmode="numeric"></div>
      </div>
      <label class="row" style="gap:8px"><input type="checkbox" id="ctPn" ${S.cert.pn?"checked":""}> ដាក់ឈ្មោះ${esc(sc.pt)} ${sc.pn?`(${esc(sc.pn)})`:"(មិនទាន់កំណត់ក្នុង «ថ្នាក់ និងមុខវិជ្ជា»)"}</label>
      <div class="field"><div class="row" style="justify-content:space-between"><label>សិស្សដែលទទួលប័ណ្ណ (<span id="ctN">${toKh(S.cert.sel.size)}</span> នាក់)</label>
        <span class="row" style="gap:4px"><button class="btn sm" data-top="3">លេខ១–៣</button><button class="btn sm" data-top="5">១–៥</button><button class="btn sm" data-top="10">១–១០</button><button class="btn sm" data-top="0">ដកចេញ</button></span></div>
        <div class="clist" id="ctList">${list}</div></div>
      <div class="row"><button class="btn primary" id="ctPdf">ទាញយក PDF</button><button class="btn" id="ctJpg">JPG ទំព័រទី១</button></div>
      ${S.backend!=="server"||isOwner()?`<details class="idc-tpl"><summary>គំរូប័ណ្ណ</summary><p class="hint">ប្ដូររូបគំរូបាន (ត្រូវមានប្លង់ដូចគំរូបច្ចុប្បន្ន និងគ្មានកាលបរិច្ឆេទលើរូប)។</p>
        <div class="row"><button class="btn sm" id="ctTplBtn">ប្ដូររូបគំរូ</button>${S.photos.certtpl?`<button class="btn sm" id="ctTplReset">ប្រើគំរូដើម</button>`:""}</div><input type="file" id="ctTplFile" accept="image/*" hidden></details>`:""}
    </section>
    <div><p class="hint" id="ctInfo" style="margin:0 0 8px"></p><div id="ctPrev" class="ct-prev"></div></div>
  </div>`;
}
async function drawCertPreview(){
  const cls=curClass();const w=$("#ctPrev");if(!w)return;const list=certSelected(cls);const pages=Math.ceil(list.length/2);
  const tok=drawCertPreview.t=(drawCertPreview.t||0)+1;
  $("#ctInfo").textContent=list.length?`${toKh(list.length)} ប័ណ្ណ · ${toKh(pages)} ទំព័រ A4`:"សូមជ្រើសសិស្សយ៉ាងហោចណាស់ម្នាក់";
  const cs=[];for(let p=0;p<pages;p++){const c=await certPage(list,cls,p,3.2);if(tok!==drawCertPreview.t)return;cs.push(c)}
  w.innerHTML="";cs.forEach(c=>{c.className="ct-page";w.appendChild(c)});
}
function bindCert(){
  const cls=curClass();if(!$("#ctList"))return;
  const redraw=()=>{clearTimeout(bindCert.t);bindCert.t=setTimeout(drawCertPreview,120)};
  Promise.all([ensureCertTpl(),ensureDateMeta(),ensureSeals(cls)]).then(()=>{if(S.tab==="cert")redraw()});redraw();
  bindDateFields(redraw);
  ensurePhotos(cls.students.map(s=>s.id));
  const cnt=()=>{$("#ctN").textContent=toKh(S.cert.sel.size)};
  $("#ctList").addEventListener("change",e=>{const id=e.target.dataset.id;if(!id)return;e.target.checked?S.cert.sel.add(id):S.cert.sel.delete(id);cnt();redraw()});
  document.querySelectorAll("[data-top]").forEach(b=>b.onclick=()=>{const n=+b.dataset.top;S.cert.sel=new Set(certRows(cls).filter(r=>r.rank<=n).map(r=>r.s.id));
    document.querySelectorAll("#ctList input").forEach(i=>i.checked=S.cert.sel.has(i.dataset.id));cnt();redraw()});
  const fld=(id,key,def)=>{$(id).oninput=e=>{const v=e.target.value.trim();S.cert[key]=v===def?"":v;redraw()}};
  const T=certTexts(cls);fld("#ctCls","cls",certClassText(cls));fld("#ctExam","exam",PNAME[S.sel.period]||"");fld("#ctYear","year",khNum(cls.year||""));
  $("#ctNum").oninput=e=>{S.cert.num=e.target.value.trim();redraw()};
  $("#ctPn").onchange=e=>{S.cert.pn=e.target.checked;redraw()};
  $("#ctPdf").onclick=()=>exportCertPdf(cls);
  $("#ctJpg").onclick=async()=>{const list=certSelected(cls);if(!list.length){toast("សូមជ្រើសសិស្ស");return}setStatus("កំពុងបង្កើត…");
    const c=await certPage(list,cls,0,11.8);const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.9));setStatus("");await saveFile(`ប័ណ្ណសរសើរ-${cls.name}-${PNAME[S.sel.period]}.jpg`,blob)};
  const tb=$("#ctTplBtn"),tf=$("#ctTplFile");
  if(tb){tb.onclick=()=>tf.click();tf.onchange=async()=>{const f=tf.files[0];if(!f)return;
    try{const data=await shrinkImage(f,2200,1551,true);S.photos.certtpl=data;await api.setDoc("photos/certtpl",{data,at:Date.now()});toast("បានប្ដូរគំរូប័ណ្ណ")}catch(e){toast("រក្សាទុកគំរូមិនបាន")}render()}}
  const rs=$("#ctTplReset");if(rs)rs.onclick=async()=>{S.photos.certtpl=null;try{await api.setDoc("photos/certtpl",{data:null,at:Date.now()})}catch(e){}render()};
}
async function exportCertPdf(cls){
  const list=certSelected(cls);if(!list.length){toast("សូមជ្រើសសិស្សយ៉ាងហោចណាស់ម្នាក់");return}
  try{await loadRender(true)}catch(e){toast("ផ្ទុកកម្មវិធីបង្កើត PDF មិនបាន");return}
  await ensureCertTpl();await ensureDateMeta();await ensureSeals(cls);
  const pdf=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  const CW=200,CH=CW*1551/2200,GAP=(297-2*CH)/3;
  for(let i=0;i<list.length;i++){
    setStatus(`កំពុងបង្កើតប័ណ្ណ ${i+1}/${list.length}…`);
    if(i&&i%2===0)pdf.addPage();const j=i%2;
    const c=await drawCert(list[i],cls,1,i);pdf.addImage(c.toDataURL("image/jpeg",.9),"JPEG",5,GAP+j*(CH+GAP),CW,CH,undefined,"FAST");
    if(j===0){pdf.setDrawColor(190);pdf.setLineDashPattern([1.5,1.5],0);pdf.setLineWidth(.15);pdf.line(0,148.5,210,148.5);pdf.setLineDashPattern([],0)}
  }
  setStatus("");await saveFile(`ប័ណ្ណសរសើរ-${cls.name}-${PNAME[S.sel.period]}.pdf`,pdf.output("blob"));
}

/* ---------- school stamp and signatures, placed on every printed document ---------- */
const SEAL_DOCS=[["report","ព្រឹត្តិបត្រពិន្ទុ"],["sheet","តារាងពិន្ទុ"],["notice","តារាងបិទផ្សាយ"],["honor","តារាងកិត្តិយស"],["cert","ប័ណ្ណសរសើរ"]];
const sigPKey=()=>"sigp_"+curBranch().id;
const sigTKey=cls=>"sigt_"+cls.id;
function sealOn(kind){const o=(S.settings&&S.settings.sealOff)||{};return !o[kind]}
function sealKeys(cls){return ["stamp",sigPKey()].concat(cls?[sigTKey(cls)]:[])}
function ensureSeals(cls){return ensurePhotos(sealKeys(cls))}
function kickSeals(){const cls=curClass();const ks=sealKeys(cls);if(ks.every(k=>k in S.photos))return;
  // redraw only after this call really fetched something; while another request is still loading them,
  // redrawing straight away would call this again and again and freeze the page
  if(!ks.some(k=>k&&!(k in S.photos)&&!S.photoLoading.has(k)))return;
  ensurePhotos(ks).then(()=>{if(ks.some(k=>S.photos[k])&&["report","notice","honor","scores","cert"].includes(S.tab))render()})}
// the blank signing space under a title: signature, plus the stamp for the principal
function sigBox(who,cls,kind){
  if(!sealOn(kind))return `<div class="sp"></div>`;
  const sig=who==="p"?S.photos[sigPKey()]:cls&&S.photos[sigTKey(cls)];const st=who==="p"&&S.photos.stamp;
  if(!sig&&!st)return `<div class="sp"></div>`;
  return `<div class="sp sigsp${st?" st":""}">${sig?`<img class="sig" src="${sig}" alt="">`:""}${st?`<img class="stamp" src="${st}" alt="">`:""}</div>`;
}
}
// photo of ink on paper → transparent PNG, trimmed to the ink
async function inkImage(file,maxW,maxH){
  const url=URL.createObjectURL(file);
  try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
    const r=Math.min(1,maxW/img.width,maxH/img.height);const W=Math.round(img.width*r),H=Math.round(img.height*r);
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(img,0,0,W,H);
    const d=x.getImageData(0,0,W,H),p=d.data;let x0=W,y0=H,x1=-1,y1=-1;
    for(let i=0;i<p.length;i+=4){
      if(p[i+3]<10){p[i+3]=0;continue}
      const mn=Math.min(p[i],p[i+1],p[i+2]),mx=Math.max(p[i],p[i+1],p[i+2]);
      const ink=Math.max(255-mn,(mx-mn)*1.6);           // dark or coloured = ink
      const a=Math.max(0,Math.min(1,(ink-40)/90));
      p[i+3]=Math.round(p[i+3]*a);
      if(p[i+3]>30){const q=i/4,px=q%W,py=(q-px)/W;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py}
    }
    if(x1<0)throw new Error("empty");
    x.putImageData(d,0,0);const pad=4;x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
    const o=document.createElement("canvas");o.width=x1-x0+1;o.height=y1-y0+1;o.getContext("2d").drawImage(c,x0,y0,o.width,o.height,0,0,o.width,o.height);
    return o.toDataURL("image/png");
  }finally{URL.revokeObjectURL(url)}
}
async function uploadSeal(key,file){
  let data;try{data=await inkImage(file,key==="stamp"?480:640,key==="stamp"?480:300)}catch(e){toast("អានរូបភាពមិនបាន ឬរូបទទេ");return}
  S.photos[key]=data;render();
  try{await api.setDoc("photos/"+key,{data,at:Date.now()});toast("បានរក្សាទុក")}catch(e){toast(e&&e.code==="quota_exceeded"?"ទំហំផ្ទុកពេញ":"រក្សាទុកមិនបាន (គ្មានសិទ្ធិ?)")}
}
async function removeSeal(key){S.photos[key]=null;render();try{await api.setDoc("photos/"+key,{data:null,at:Date.now()});toast("បានលុប")}catch(e){toast("លុបមិនបាន")}}
function canSigP(){return S.canWrite&&(S.backend!=="server"||S.canAdmin)}
function viewSeal(){
  const sc=school(),own=isOwner()&&S.canWrite,br=curBranch();
  const ks=["stamp",sigPKey(),...S.classes.map(sigTKey)];
  if(ks.some(k=>k&&!(k in S.photos)&&!S.photoLoading.has(k)))ensurePhotos(ks).then(()=>{if(S.tab==="seal")render()});
  const box=(key,can,label,hint,cls2)=>{const v=S.photos[key];return `<div class="sealbox ${cls2||""}"><div class="sealimg">${v?`<img src="${v}" alt="${esc(label)}">`:`<span>${v===undefined?"កំពុងផ្ទុក…":"មិនទាន់មាន"}</span>`}</div>
    <div class="sealtxt"><b>${esc(label)}</b>${hint?`<span class="hint">${hint}</span>`:""}
    ${can?`<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm primary" data-up="${esc(key)}">${v?"ប្ដូររូប":"ដាក់រូប"}</button>${v?`<button class="btn sm danger" data-rm="${esc(key)}">លុប</button>`:""}</div>`:""}</div></div>`};
  const tRows=S.classes.map(c=>box(sigTKey(c),S.canWrite,c.name,c.teacher?`គ្រូបន្ទុកថ្នាក់៖ ${esc(c.teacher)}`:"មិនទាន់មានឈ្មោះគ្រូ (កំណត់នៅ «ថ្នាក់ និងមុខវិជ្ជា»)","sm")).join("");
  const off=(S.settings&&S.settings.sealOff)||{};
  const sample=`<div class="paper seal-sample"><div class="ss-signs" style="margin:0">
      <div class="ss-sign"><div>បានឃើញ និងឯកភាព</div><div class="ttl">${esc(sc.pt)}</div>${sigBox("p",null,"_")}<div class="nm">${esc(sc.pn)||"ឈ្មោះនាយក"}</div></div>
      <div class="ss-sign"><div>${esc(todayKh())}</div><div class="ttl">គ្រូបន្ទុកថ្នាក់</div>${sigBox("t",curClass(),"_")}<div class="nm">${esc((curClass()||{}).teacher||"ឈ្មោះគ្រូ")}</div></div></div></div>`;
  return `<div id="sealRoot">
    <section class="panel" style="margin-bottom:20px"><h2 style="margin:0 0 4px">ត្រាសាលា និងហត្ថលេខា</h2>
      <p class="sub" style="margin:0 0 14px">ថតរូបត្រា ឬហត្ថលេខាលើក្រដាសស (ទឹកខ្មៅខៀវ ឬខ្មៅ) ឱ្យភ្លឺ និងត្រង់។ កម្មវិធីលុបផ្ទៃក្រដាសចេញដោយស្វ័យប្រវត្តិ ហើយដាក់លើឯកសារដែលព្រីនចេញ។</p>
      <div class="seal-top">
        ${box("stamp",own,"ត្រាសាលា",own?"ប្រើរួមគ្រប់សាខា · ត្រាគាបលើហត្ថលេខានាយក":"មានតែម្ចាស់សាលាទេដែលអាចប្ដូរបាន","big")}
        ${box(sigPKey(),canSigP(),"ហត្ថលេខា"+sc.pt+(multiBranch()?" · "+br.name:""),sc.pn?esc(sc.pn):"","big")}
        <div class="sealbox big"><div style="width:100%"><div class="hint" style="margin-bottom:6px">គំរូលើឯកសារ</div>${sample}</div></div>
      </div>
      <input type="file" id="sealFile" accept="image/*" hidden>
    </section>
    <section class="panel" style="margin-bottom:20px"><h2 style="margin:0 0 4px">ហត្ថលេខាគ្រូបន្ទុកថ្នាក់</h2>
      <p class="sub" style="margin:0 0 12px">${S.canAdmin?"មួយថ្នាក់ មួយហត្ថលេខា។ គ្រូក៏អាចចូលដាក់ហត្ថលេខាសម្រាប់ថ្នាក់របស់ខ្លួនបានដែរ។":"ដាក់ហត្ថលេខារបស់អ្នក សម្រាប់ថ្នាក់ដែលអ្នកបង្រៀន។"}</p>
      <div class="seal-grid">${tRows||`<p class="hint">មិនទាន់មានថ្នាក់</p>`}</div>
    </section>
    <section class="panel"><h2 style="margin:0 0 4px">ដាក់ត្រា និងហត្ថលេខាលើ</h2>
      <div class="row" style="gap:6px 18px;margin-top:8px">${SEAL_DOCS.map(([k,l])=>`<label class="row" style="gap:6px"><input type="checkbox" data-seal="${k}" ${off[k]?"":"checked"} ${own?"":"disabled"}> ${l}</label>`).join("")}</div>
      ${own?"":`<p class="hint" style="margin:8px 0 0">មានតែម្ចាស់សាលាទេដែលអាចប្ដូរការកំណត់នេះ។</p>`}
    </section></div>`;
}
function bindSeal(){
  const root=$("#sealRoot");if(!root)return;const f=$("#sealFile");let key=null;
  root.addEventListener("click",e=>{const u=e.target.closest("[data-up]"),r=e.target.closest("[data-rm]");
    if(u){key=u.dataset.up;f.value="";f.click()}
    if(r)arm(r,"ប្រាកដ?",()=>removeSeal(r.dataset.rm))});
  f.onchange=()=>{if(f.files[0]&&key)uploadSeal(key,f.files[0])};
  root.querySelectorAll("[data-seal]").forEach(cb=>cb.onchange=()=>{const o=clone(S.settings||{});o.sealOff=Object.assign({},o.sealOff);o.sealOff[cb.dataset.seal]=!cb.checked;saveSettings(o)});
}

const loadScript=(src)=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
async function exportHonor(kind){
  const cls=curClass();await ensureLogo();await ensureDateMeta();
  await exportDoc([()=>honorSheetHTML(cls,compute(cls),honorMeta(),false)],`តារាងកិត្តិយស-${cls.name}-${periodTitle(S.sel.period)}`,kind);
}

/* ---------- SheetJS (loaded on demand) ---------- */
let xlsxP=null;
function loadXLSX(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  return xlsxP=xlsxP||new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=()=>res(window.XLSX);s.onerror=()=>{xlsxP=null;rej(new Error("load"))};document.head.appendChild(s)});
}
async function exportXlsx(){
  const cls=curClass();const C=compute(cls);
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  if(C.en){
    const sc=school();const head=["No.","Name of Students","Sex",...C.subs.map(s=>s.name+" "+smax(s)),"Total","Average","Rank","Grade"];
    const aoa=[[sc.kh],[sc.en],[enTitle(S.sel.period)],[`English Class: ${cls.name}${cls.year?" "+cls.year:""}`],[`Shift: ${cls.shift||""}`],[enFor(S.sel.period)],head];
    C.rows.forEach((r,i)=>aoa.push([i+1,r.s.name,r.s.g==="F"?"F":"M",...r.vals.map(v=>v==null?"":v),r.total??"",r.avg??"",r.rank??"",r.g?r.g[0]:""]));
    aoa.push(["","Subject average","",...C.subjAvg.map(v=>v==null?"":Math.round(v*100)/100),"",C.classAvg==null?"":Math.round(C.classAvg*100)/100]);
    aoa.push([]);const n=C.graded.length,P=a=>n?Math.round(a/n*1000)/10+"%":"";
    aoa.push(["","Total students",C.tot,"Girls",C.fem]);aoa.push(["","Passed",C.pass.length,"Girls",C.passF,"",P(C.pass.length)]);aoa.push(["","Failed",C.fail.length,"Girls",C.failF,"",P(C.fail.length)]);
    C.K.grades.forEach(([l,k])=>aoa.push(["","Grade "+l+" ("+k+")",C.dist[l].n,"Girls",C.dist[l].f,"",P(C.dist[l].n)]));
    const ws=X.utils.aoa_to_sheet(aoa);ws["!cols"]=[{wch:5},{wch:26},{wch:5},...C.subs.map(()=>({wch:10})),{wch:8},{wch:9},{wch:6},{wch:7}];
    const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,(PNAME_EN[S.sel.period]||"Scores").replace(/[·:\\/?*\[\]]/g," ").slice(0,30));
    const fname=`Scores-${cls.name}${cls.shift?"-"+cls.shift:""}-${PNAME_EN[S.sel.period]}.xlsx`.replace(/[\\/:*?"<>|·]/g,"-");
    if(await saveFile(fname,new Uint8Array(X.write(wb,{type:"array",bookType:"xlsx"}))))toast("បានទាញយក "+fname);
    return;
  }
  const head=["ល.រ","គោត្តនាម និងនាម","ភេទ",...C.subs.map(s=>s.name),"ពិន្ទុសរុប","មធ្យមភាគ","ចំណាត់ថ្នាក់","និទ្ទេស",""];
  const aoa=[["តារាងពិន្ទុ "+cls.name+" — "+PNAME[S.sel.period]+(cls.year?" ឆ្នាំសិក្សា "+cls.year:"")],[],head];
  C.rows.forEach((r,i)=>aoa.push([i+1,r.s.name,r.s.g==="F"?"ស":"ប",...r.vals.map(v=>v==null?"":v),r.total??"",r.avg??"",r.rank??"",r.g&&r.g[3]?r.g[0]:"",r.g?r.g[1]:""]));
  aoa.push(["","មធ្យមភាគមុខវិជ្ជា","",...C.subjAvg.map(v=>v==null?"":Math.round(v*100)/100),"",C.classAvg==null?"":Math.round(C.classAvg*100)/100]);
  aoa.push([]);
  const n=C.graded.length,P=a=>n?Math.round(a/n*1000)/10+"%":"";
  aoa.push(["","បញ្ឈប់បញ្ជីត្រឹមចំនួន",C.tot,"ស្រី",C.fem]);
  aoa.push(["","មធ្យមភាគសិស្សជាប់",C.pass.length,"ស្រី",C.passF,"ភាគរយ",P(C.pass.length)]);
  aoa.push(["","មធ្យមភាគសិស្សធ្លាក់",C.fail.length,"ស្រី",C.failF,"ភាគរយ",P(C.fail.length)]);
  C.K.grades.forEach(([l,k])=>aoa.push(["","និទ្ទេស "+(C.K.letters?l+" ("+k+")":k),C.dist[l].n,"ស្រី",C.dist[l].f,"ភាគរយ",P(C.dist[l].n)]));
  const ws=X.utils.aoa_to_sheet(aoa);
  ws["!cols"]=[{wch:5},{wch:24},{wch:5},...C.subs.map(()=>({wch:7})),{wch:9},{wch:9},{wch:8},{wch:6},{wch:10}];
  ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:head.length-1}}];
  const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,"ពិន្ទុ");
  const buf=X.write(wb,{type:"array",bookType:"xlsx"});
  const fname=`ពិន្ទុ-${cls.name}-${PNAME[S.sel.period]}.xlsx`.replace(/[\\/:*?"<>|]/g,"-");
  if(await saveFile(fname,new Uint8Array(buf)))toast("បានទាញយក "+fname);
}
// English files: every sheet names its own class, shift and month (their usual layout)
async function importEnglish(parsed){
  let L=levels();const idOf=n=>String(n).replace(/\s+/g,"").toLowerCase();
  const nrm=v=>String(v||"").replace(/[\s,\-–.]/g,"").toLowerCase();
  let done=0,studs=0;const skipped=[];
  for(const p of parsed){
    const meta=p.meta;if(!p.studs.some(st=>Object.keys(st.sc).length)&&parsed.length>1)continue;
    const labels=p.cols.map(x=>nrm(x.label));
    const engIds=Object.keys(L).filter(id=>KINDS[L[id].kind].en);
    const fit=id=>L[id].subjects.filter(s=>labels.includes(nrm(s.name))).length;
    const best=engIds.sort((a,b)=>fit(b)-fit(a))[0]||"eng_p";
    const shift=meta.shift||"";const cur=curClass();
    if(!meta.cls&&!(cur&&KINDS[kindOf(cur)].en)){toast("សូមវាយឈ្មោះថ្នាក់ក្នុង Excel នៅជួរ «English Class:» ឧ. English Class: Primary 1A 2026-2027 ឬជ្រើសថ្នាក់អង់គ្លេសមុននាំចូល");return}
    const name=meta.cls||cur.name;
    let cls=meta.cls?(S.classes.find(c=>idOf(c.name)===idOf(name)&&(c.shift||"")===shift)||S.classes.find(c=>idOf(c.name)===idOf(name)&&!c.shift&&!shift)||null):cur;
    if(!cls){cls=await createClass(name,meta.year||"",meta.teacher||"",best);if(!cls)return;cls=clone(cls);cls.shift=shift}else cls=clone(cls);
    if(!KINDS[kindOf(cls)].en)cls.levelId=best;
    if(meta.year&&!cls.year)cls.year=meta.year;
    const lv=L[levelId(cls)];const keyFor={};let added=false;
    p.cols.forEach(({label,max})=>{let sb=lv.subjects.find(s=>nrm(s.name)===nrm(label));
      if(!sb){sb={key:"x"+uid(),name:label,group:"",max:max||100};lv.subjects.push(sb);added=true}
      keyFor[label]=sb.key});
    if(added)await saveLevels(L);
    const per=meta.period&&periodsOf(cls).includes(meta.period)?meta.period:(periodsOf(cls).includes(S.sel.period)?S.sel.period:"m09");
    const patch={};
    p.studs.forEach(st=>{let ex=cls.students.find(s=>idOf(s.name)===idOf(st.name));
      if(!ex){ex={id:uid(),name:st.name,g:st.g};cls.students.push(ex)}
      const sc={};for(const lab in st.sc)sc[keyFor[lab]]=st.sc[lab];if(Object.keys(sc).length)patch[ex.id]=sc;studs++});
    await saveClass(cls);
    S.classes=S.classes.some(c=>c.id===cls.id)?S.classes.map(c=>c.id===cls.id?cls:c):[...S.classes,cls];
    if(Object.keys(patch).length){try{await api.patchSheet(`${cls.id}__${per}`,{classId:cls.id,period:per},patch)}catch(e){skipped.push(p.sheet)}}
    S.sel.classId=cls.id;S.sel.period=per;done++;L=levels();
  }
  saveUI();watchSheet();render();
  toast(`បាននាំចូល ${done} សន្លឹក · សិស្ស ${studs} នាក់${skipped.length?" · មិនបាន៖ "+skipped.join(", "):""}`);
}
async function importXlsx(file){
  if(!S.canWrite)return;
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  const clean=v=>String(v??"").replace(/[\u200b\u200c\u200d\ufeff]/g,"").replace(/\s+/g," ").trim();
  const norm=v=>clean(v).replace(/\s*\d+\s*%?$/,"").replace(/\s*(១០)$/,"").replace(/[\s,\-–.]/g,"").replace("អបរំ","អប់រំ").toLowerCase();
  const pnorm=v=>clean(v).replace(/ត្រីមសា/g,"ត្រីមាស").replace(/ប្រឡង|ខែ|ទី|\s/g,"");
  const parsed=[];
  try{
    const wb=X.read(await file.arrayBuffer(),{type:"array"});
    for(const sn of wb.SheetNames){
      const rows=X.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:null});
      const NAMERE=/គោត្តនាម|ឈ្មោះសិស្ស|name of student/i,ENDRE=/សរុប|មធ្យមភាគ|^total$|^average$/i;
      const hi=rows.findIndex(row=>row&&row.some(c=>typeof c==="string"&&NAMERE.test(c)));
      if(hi<0)continue;
      const H0=rows[hi];const nameCol=H0.findIndex(c=>typeof c==="string"&&NAMERE.test(c));
      const gCol=H0.findIndex(c=>/^(ភេទ|sex|gender)$/i.test(clean(c)));
      // the subject names sit on the row that also says Total / Average (one, two or three header rows)
      let hr=hi;for(let q=hi;q<=Math.min(hi+3,rows.length-1);q++){if((rows[q]||[]).some(c=>ENDRE.test(clean(c)))){hr=q;break}}
      const sub=rows[hi+1]||[];
      const useSub=hr===hi&&!clean(sub[nameCol])&&sub.some(c=>typeof c==="string"&&clean(c));
      const HR=rows[hr]||[];
      const H=(hr>hi?HR:H0).map((c,k)=>hr>hi?clean(c):useSub&&clean(sub[k])?clean(sub[k]):clean(c));
      const width=Math.max(H0.length,sub.length,HR.length);
      let endCol=-1;for(let k=nameCol+1;k<width;k++){if(ENDRE.test(H[k]||"")){endCol=k;break}}
      const cols=[];for(let k=Math.max(nameCol,gCol)+1;k<(endCol>0?endCol:width);k++){const h=H[k]||"";if(h&&h!=="មុខវិជ្ជា"){const mm=h.match(/(\d+)\s*%\s*$/);cols.push({c:k,label:h.replace(/\s*\d+\s*%\s*$/,"").replace(/\s*(១០|10)$/,"").replace(/,/g," ").trim(),max:mm?+mm[1]:null})}}
      const studs=[];
      for(let r=(hr>hi?hr+1:hi+(useSub?2:1));r<rows.length;r++){
        const row=rows[r]||[];const nm=clean(row[nameCol]);
        const lead=clean(row[0]);
        if(/សិស្សសរុប|បញ្ឈប់|total students/i.test(lead))break;
        if(!nm)continue;
        if(/[:៖ៈ]|បញ្ឈប់|មធ្យមភាគ|សរុប/.test(nm))break;
        const gv=gCol>=0?clean(row[gCol]):"";
        const sc={};cols.forEach(({c,label,max})=>{const p=parseScore(row[c],max||1000);if(p.ok&&p.v!=null)sc[label]=p.v});
        studs.push({name:nm.replace(/\.\s*/g," ").replace(/\s+/g," ").trim(),g:/^(ស|f)/i.test(gv)?"F":"M",sc});
      }
      const meta={};
      for(let r=0;r<hi;r++){const row=rows[r]||[];row.forEach((c,k)=>{const t=clean(c).replace(/[៖:ៈ]$/,"").trim();
        const key=t==="ថ្នាក់"?"cls":t==="ឆ្នាំសិក្សា"?"year":t==="គ្រូបន្ទុកថ្នាក់"?"teacher":null;
        if(key&&!meta[key]){for(let q=k+1;q<row.length;q++){const v=clean(row[q]);if(v){meta[key]=v;break}}}
        // English layout: "English Class: Primary 1A 2026-2027", "Shift: Morning", "For the month of October" / "Midterm Exam · Course 1"
        const tc=clean(c);let m;
        if((m=tc.match(/^English\s*Class\s*:?\s*(.+?)(?:\s+(\d{4}\s*-\s*\d{4}))?$/i))){meta.cls=m[1].trim();if(m[2])meta.year=m[2].replace(/\s/g,"");meta.en=true}
        if((m=tc.match(/^Shift\s*:?\s*(\w+)/i)))meta.shift=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
        if((m=tc.match(/^For the month of\s+(\w+)/i))){const i=MONTH_EN.findIndex(x=>x.toLowerCase()===m[1].toLowerCase());if(i>=0)meta.period="m"+String(i+1).padStart(2,"0")}
        if((m=tc.match(/(midterm|final)[^0-9]*course\s*(\d)/i)))meta.period="e"+m[2]+(m[1].toLowerCase()==="midterm"?"m":"f");})}
      // the sheet name may say the shift: "GEP2 (Morning)"
      {const m2=String(sn).match(/morning|afternoon|evening/i);if(m2)meta.shift=m2[0][0].toUpperCase()+m2[0].slice(1).toLowerCase()}
      if(/name of student/i.test(clean(H0[nameCol])))meta.en=true;
      if(studs.length)parsed.push({sheet:sn,cols,studs,meta});
    }
  }catch(e){toast("អានឯកសារមិនបាន");return}
  if(!parsed.length){toast("រកមិនឃើញឈ្មោះសិស្សក្នុងឯកសារ");return}
  if(parsed.some(p=>p.meta.en)){await importEnglish(parsed);return}
  // keep only sheets that hold scores (a blank template repeats the names on every month)
  const withScores=parsed.filter(p=>p.studs.some(st=>Object.keys(st.sc).length));
  if(withScores.length)parsed.splice(0,parsed.length,...withScores);else parsed.splice(1);
  const meta=Object.assign({},...parsed.map(p=>p.meta).reverse());
  // which level do these subjects belong to?
  let L=levels();
  const labels=parsed[0].cols.map(x=>norm(x.label));
  const fit=id=>L[id].subjects.filter(s=>labels.includes(norm(s.name))).length;
  const best=Object.keys(L).sort((a,b)=>fit(b)-fit(a))[0];
  const idOf=n=>String(n).replace(/\s+/g,"");
  let cls=null;
  if(meta.cls){
    cls=S.classes.find(c=>idOf(c.name)===idOf(meta.cls))||null;
    if(!cls){cls=await createClass(meta.cls,meta.year||"",meta.teacher||"",best);if(!cls)return}
  }else{
    cls=curClass();
    if(!cls||(levelId(cls)!==best&&fit(levelId(cls))<fit(best))){cls=await createClass(L[best].name+" (នាំចូល)","","",best);if(!cls)return}
  }
  cls=clone(cls);
  if(levelId(cls)!==best&&fit(levelId(cls))<fit(best))cls.levelId=best;
  if(meta.year&&!cls.year)cls.year=meta.year;
  if(meta.teacher&&!cls.teacher)cls.teacher=meta.teacher;
  const lid=levelId(cls);
  // map columns to subject keys, adding any new subjects to this level
  const lv=L[lid];const keyFor={};const added=[];
  parsed.forEach(p=>p.cols.forEach(({label})=>{
    if(keyFor[label])return;
    let sb=lv.subjects.find(s=>norm(s.name)===norm(label));
    if(!sb){sb={key:"x"+uid(),name:label,group:""};lv.subjects.push(sb);added.push(label)}
    keyFor[label]=sb.key;
  }));
  if(added.length){await saveLevels(L)}
  // map sheets to periods
  const plist=periodsOf(cls);
  const plan=[];const skipped=[];
  parsed.forEach(p=>{
    let per=plist.find(k=>pnorm(PNAME[k])===pnorm(p.sheet));
    if(!per&&parsed.length===1)per=plist.includes(S.sel.period)?S.sel.period:plist[0];
    if(per)plan.push([per,p]);else skipped.push(p.sheet);
  });
  if(!plan.length){toast("ឈ្មោះសន្លឹកមិនត្រូវនឹងខែណាមួយទេ");return}
  const patches={};
  plan.forEach(([per,p])=>{
    const patch=patches[per]=patches[per]||{};
    p.studs.forEach(st=>{
      let ex=cls.students.find(s=>idOf(s.name)===idOf(st.name));
      if(!ex){ex={id:uid(),name:st.name,g:st.g};cls.students.push(ex)}
      const sc={};for(const lab in st.sc)sc[keyFor[lab]]=st.sc[lab];
      if(Object.keys(sc).length)patch[ex.id]=Object.assign(patch[ex.id]||{},sc);
    });
  });
  await saveClass(cls);
  S.classes=S.classes.some(c=>c.id===cls.id)?S.classes.map(c=>c.id===cls.id?cls:c):[...S.classes,cls];
  setStatus("កំពុងរក្សាទុក…");
  try{for(const per in patches){if(Object.keys(patches[per]).length)await api.patchSheet(`${cls.id}__${per}`,{classId:cls.id,period:per},patches[per])}
    setStatus("បានរក្សាទុក ✓")}
  catch(e){setStatus("រក្សាទុកពិន្ទុមិនបាន",true)}
  S.sel.classId=cls.id;S.sel.period=plan[plan.length-1][0];S.tab="scores";saveUI();
  S.sheetKey=null;watchSheet();render();
  const names=plan.map(([per])=>PNAME[per]).join(", ");
  toast(`បាននាំចូល ${cls.name} · សិស្ស ${cls.students.length} នាក់ · ${names}`+(added.length?` · មុខវិជ្ជាថ្មី ${added.length}`:"")+(skipped.length?` · រំលង ${skipped.join(", ")}`:""));
}

function viewLogin(){
  const su=S.needsSetup;
  return `<section class="panel" style="max-width:420px;width:100%;margin:32px auto">
    <h2>${su?"បង្កើតគណនីអ្នកគ្រប់គ្រង":"ចូលប្រើកម្មវិធីគ្រប់គ្រងព័ត៌មាន និងចុះឈ្មោះសិស្ស"}</h2>
    <p class="sub">${su?"នេះជាលើកដំបូង។ គណនីនេះគ្រប់គ្រងថ្នាក់ មុខវិជ្ជា និងគណនីគ្រូ។":"សូមប្រើឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់ ដែលសាលាផ្ដល់ឱ្យ។"}</p>
    <form id="fLogin" class="hon-form">
      ${su?`<div class="field"><label for="lgName">ឈ្មោះពេញ</label><input class="inp" id="lgName" required></div>`:""}
      <div class="field"><label for="lgUser">ឈ្មោះអ្នកប្រើ (អក្សរឡាតាំង)</label><input class="inp" id="lgUser" autocomplete="username" autocapitalize="off" required></div>
      <div class="field"><label for="lgPass">ពាក្យសម្ងាត់</label><input class="inp" id="lgPass" type="password" autocomplete="${su?"new-password":"current-password"}" minlength="6" required></div>
      <p id="lgErr" class="status err" style="margin:0"></p>
      <button class="btn primary">${su?"បង្កើត និងចូល":"ចូល"}</button>
    </form></section>`;
}
function bindLogin(){
  $("#fLogin").addEventListener("submit",async e=>{
    e.preventDefault();const err=$("#lgErr");err.textContent="";
    const body={username:$("#lgUser").value.trim(),password:$("#lgPass").value};
    if(S.needsSetup)body.name=$("#lgName").value.trim();
    try{const j=await req(S.needsSetup?"setup":"login",body);setUser(j.user);S.needsSetup=false;start()}
    catch(x){err.textContent=x&&x.code==="unavailable"?"ភ្ជាប់ម៉ាស៊ីនមេមិនបាន":(x&&x.message)||"ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ"}
  });
}
function viewTeachers(){
  const users=S.users||[];
  const cover=(S.allClasses||S.classes).map(c=>{const t=users.filter(u=>u.role!=="admin"&&(u.classes||[]).includes(c.id));
    return `<div class="urow" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)"><strong>${esc(c.name)}${multiBranch()?` <span class="hint">${esc((branches().find(b=>b.id===classBranch(c))||{}).name||"")}</span>`:""}</strong><div class="ucls">${t.length?t.map(u=>`<span class="chip E">${esc(u.name)}</span>`).join(""):`<span class="chip A">មិនទាន់មានគ្រូ</span>`}</div></div>`}).join("");
  return `<div class="two">
   <section class="panel guide">
     <h2>របៀបកំណត់ថ្នាក់ឱ្យគ្រូ</h2>
     <p class="sub">ធ្វើដោយអ្នកគ្រប់គ្រង។ គ្រូម្នាក់អាចមានមួយថ្នាក់ ឬច្រើនថ្នាក់។</p>
     <ol class="steps">
       <li>នៅផ្នែក <b>«គណនីគ្រូ»</b> ខាងក្រោម ចុច <b>កែ</b> ត្រង់ឈ្មោះគ្រូ។</li>
       <li>គូសធីកថ្នាក់ដែលគាត់បង្រៀន៖ មួយថ្នាក់ ឬច្រើនថ្នាក់ក៏បាន។</li>
       <li>ចុច <b>រក្សាទុកការកែ</b>។</li>
     </ol>
     <p class="hint">ពេលបង្កើតគណនីគ្រូថ្មី ក៏អាចគូសធីកថ្នាក់បានភ្លាមៗ។ បញ្ជីគណនីបង្ហាញថ្នាក់របស់គ្រូម្នាក់ៗ ហើយគ្រូដែលមិនទាន់មានថ្នាក់ មានស្លាកក្រហម «មិនទាន់កំណត់ថ្នាក់»។ ថ្នាក់ដែលទើបបង្កើតថ្មី ត្រូវកំណត់ឱ្យគ្រូរាល់ពេល។</p>
   </section>
   <section class="panel guide">
     <h2>អ្វីដែលគ្រូឃើញ</h2>
     <ul class="seelist">
       <li><b>គ្រូមួយថ្នាក់៖</b> ឃើញតែថ្នាក់នោះ ទាំងពិន្ទុ វត្តមាន បញ្ជីសិស្ស ព្រឹត្តិបត្រ តារាងបិទផ្សាយ និងតារាងកិត្តិយស។</li>
       <li><b>គ្រូច្រើនថ្នាក់៖</b> ប្ដូរថ្នាក់ពីប្រអប់ «ថ្នាក់» ខាងលើ។ ប្រអប់នោះមានតែថ្នាក់របស់គាត់ប៉ុណ្ណោះ។</li>
       <li><b>គ្រូដែលមិនទាន់មានថ្នាក់៖</b> ឃើញសារ «សូមស្នើអ្នកគ្រប់គ្រងឱ្យកំណត់ថ្នាក់»។</li>
       <li><b>អ្នកគ្រប់គ្រង (នាយក)៖</b> ឃើញគ្រប់ថ្នាក់ដដែល។</li>
     </ul>
   </section></div>
  ${viewUsers()}
  ${S.users?`<section class="panel" style="margin-top:20px"><h2>ថ្នាក់ និងគ្រូបង្រៀន</h2><p class="sub">ពិនិត្យថាថ្នាក់នីមួយៗមានគ្រូទទួលបន្ទុកហើយឬនៅ។</p>${cover||`<p class="hint">មិនទាន់មានថ្នាក់។ បង្កើតថ្នាក់នៅផ្ទាំង «ថ្នាក់ និងមុខវិជ្ជា»។</p>`}</section>`:""}`;
}
function viewUsers(){
  if(S.backend!=="server"||!isOwner())return `<section class="panel" style="margin-top:20px"><p class="hint">មានតែម្ចាស់សាលា (អ្នកគ្រប់គ្រងគ្រប់សាខា) ទេ ដែលគ្រប់គ្រងគណនីបាន។</p></section>`;
  if(!S.users){req("users").then(j=>{S.users=j.users;if(S.tab==="teachers")render()}).catch(()=>{});return `<section class="panel" style="margin-top:20px"><h2>គណនីគ្រូ</h2><p class="hint">កំពុងផ្ទុក…</p></section>`}
  const AC=S.allClasses||S.classes;const brName=id=>{const b=branches().find(x=>x.id===id);return b?b.name:id};
  const cname=id=>{const c=AC.find(x=>x.id===id);return c?c.name+(multiBranch()?" ("+brName(classBranch(c))+")":""):null};
  const ed=S.userEdit||{};const editing=!!ed.username;
  const rows=S.users.map(u=>{const cl=(u.classes||[]).map(cname).filter(Boolean);
    return `<div class="urow" data-u="${esc(u.username)}">
    <div class="uname"><strong>${esc(u.name)}</strong> <span class="hint">${esc(u.username)}</span></div>
    <div class="ucls">${u.role==="admin"?`<span class="chip N">អ្នកគ្រប់គ្រង · ${u.branches&&u.branches.length?esc(u.branches.map(brName).join(", ")):multiBranch()?"គ្រប់សាខា":"គ្រប់ថ្នាក់ និងហិរញ្ញវត្ថុ"}</span>`:u.role==="head"?`<span class="chip P">${esc((u.depts||[]).map(d=>"ប្រធាន"+DEPTS[d]).join(" · ")||"ប្រធានផ្នែក")} · ${u.branches&&u.branches.length?esc(u.branches.map(brName).join(", ")):multiBranch()?"គ្រប់សាខា":"គ្រប់ថ្នាក់ក្នុងផ្នែក"}</span>`:u.role==="accountant"?`<span class="chip L">គណនេយ្យករ · ${u.branches&&u.branches.length?esc(u.branches.map(brName).join(", ")):multiBranch()?"គ្រប់សាខា":"ហិរញ្ញវត្ថុប៉ុណ្ណោះ"}</span>`:cl.length?cl.map(n=>`<span class="chip E">${esc(n)}</span>`).join(""):`<span class="chip A">មិនទាន់កំណត់ថ្នាក់</span>`}</div>
    <div class="row" style="gap:6px"><button class="btn sm" data-a="edit">កែ</button>${u.username===S.user.username?`<span class="hint">អ្នក</span>`:`<button class="btn sm danger" data-a="del">លុប</button>`}</div></div>`}).join("");
  const sel=new Set(ed.classes||[]);
  const boxes=(multiBranch()?branches().map(b=>{const cs=AC.filter(c=>classBranch(c)===b.id);return cs.length?`<div style="width:100%"><div class="hint" style="margin:4px 0">${esc(b.name)}</div><div class="cbxs">${cs.map(c=>`<label class="cbx"><input type="checkbox" name="nuCls" value="${esc(c.id)}"${sel.has(c.id)?" checked":""}> ${esc(c.name)}</label>`).join("")}</div></div>`:""}).join("")
    :AC.map(c=>`<label class="cbx"><input type="checkbox" name="nuCls" value="${esc(c.id)}"${sel.has(c.id)?" checked":""}> ${esc(c.name)}</label>`).join(""))||`<span class="hint">មិនទាន់មានថ្នាក់</span>`;
  const bsel=new Set(ed.branches||[]);
  const bboxes=branches().map(b=>`<label class="cbx"><input type="checkbox" name="nuBr" value="${esc(b.id)}"${bsel.has(b.id)?" checked":""}> ${esc(b.name)}</label>`).join("");
  return `<section class="panel" style="margin-top:20px">
    <h2>គណនីគ្រូ</h2>
    <p class="sub">គ្រូម្នាក់ៗឃើញ និងកែបានតែថ្នាក់ដែលកំណត់ឱ្យគាត់ប៉ុណ្ណោះ (អាចកំណត់មួយ ឬច្រើនថ្នាក់)។ អ្នកគ្រប់គ្រងឃើញគ្រប់ថ្នាក់ ហើយអាចបង្កើត/លុបថ្នាក់ កែមុខវិជ្ជា និងគ្រប់គ្រងគណនី។</p>
    <div id="userList">${rows}</div>
    <form id="fUser" class="ufrm">
      <h3>${editing?`កែគណនី «${esc(ed.username)}»`:"បង្កើតគណនីថ្មី"}</h3>
      <div class="row">
        <div class="field" style="flex:1;min-width:160px"><label for="nuName">ឈ្មោះពេញ</label><input class="inp" id="nuName" value="${esc(ed.name||"")}" required></div>
        <div class="field" style="flex:1;min-width:140px"><label for="nuUser">ឈ្មោះអ្នកប្រើ</label><input class="inp" id="nuUser" value="${esc(ed.username||"")}" placeholder="ឧ. teacher1" autocapitalize="off" required ${editing?"readonly":""}></div>
        <div class="field" style="flex:1;min-width:140px"><label for="nuPass">ពាក្យសម្ងាត់${editing?" ថ្មី (ទុកទទេ = មិនប្ដូរ)":""}</label><input class="inp" id="nuPass" type="password" autocomplete="new-password" minlength="6" ${editing?"":"required"}></div>
        <div class="field"><label for="nuRole">តួនាទី</label><select class="inp" id="nuRole"><option value="teacher"${!["admin","accountant","head"].includes(ed.role)?" selected":""}>គ្រូ</option><option value="head"${ed.role==="head"?" selected":""}>ប្រធានផ្នែកភាសា</option><option value="accountant"${ed.role==="accountant"?" selected":""}>គណនេយ្យករ</option><option value="admin"${ed.role==="admin"?" selected":""}>អ្នកគ្រប់គ្រង</option></select></div>
      </div>
      <div class="field" id="nuDeptBox" ${ed.role==="head"?"":"hidden"}><label>ផ្នែកដែលប្រធាននេះគ្រប់គ្រង (គ្រប់ថ្នាក់ក្នុងផ្នែក)</label><div class="cbxs">${Object.entries(DEPTS).map(([k,n])=>`<label class="cbx"><input type="checkbox" name="nuDept" value="${k}"${(ed.depts||[]).includes(k)?" checked":""}> ${n}</label>`).join("")}</div></div>
      <div class="field" id="nuClsBox" ${["admin","accountant","head"].includes(ed.role)?"hidden":""}><label>ថ្នាក់ដែលគ្រូនេះបង្រៀន</label><div class="cbxs">${boxes}</div></div>
      ${multiBranch()?`<div class="field" id="nuBrBox" ${["admin","accountant","head"].includes(ed.role)?"":"hidden"}><label>សាខាដែលគណនីនេះគ្រប់គ្រង (មិនគូស = គ្រប់សាខា)</label><div class="cbxs">${bboxes}</div></div>`:""}
      <div class="row"><button class="btn primary">${editing?"រក្សាទុកការកែ":"បង្កើតគណនី"}</button>${editing?`<button type="button" class="btn" id="nuCancel">បោះបង់</button>`:""}<span id="nuErr" class="status err"></span></div>
    </form></section>`;
}
function bindUsers(){
  const f=$("#fUser");if(!f)return;
  $("#nuRole").onchange=e=>{const r=e.target.value;$("#nuClsBox").hidden=r!=="teacher";$("#nuDeptBox").hidden=r!=="head";const bb=$("#nuBrBox");if(bb)bb.hidden=r==="teacher"};
  const c=$("#nuCancel");if(c)c.onclick=()=>{S.userEdit=null;render()};
  f.addEventListener("submit",async e=>{e.preventDefault();$("#nuErr").textContent="";
    const classes=[...document.querySelectorAll('input[name="nuCls"]:checked')].map(x=>x.value);
    const brs=[...document.querySelectorAll('input[name="nuBr"]:checked')].map(x=>x.value);
    const depts=[...document.querySelectorAll('input[name="nuDept"]:checked')].map(x=>x.value);
    try{const j=await req("user_save",{name:$("#nuName").value.trim(),username:$("#nuUser").value.trim(),password:$("#nuPass").value,role:$("#nuRole").value,classes,branches:brs,depts});
      S.users=j.users;S.userEdit=null;toast("បានរក្សាទុកគណនី");render()}catch(x){$("#nuErr").textContent=(x&&x.message)||"រក្សាទុកមិនបាន"}});
  $("#userList").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const u=b.closest("[data-u]").dataset.u;
    if(b.dataset.a==="edit"){S.userEdit=clone(S.users.find(x=>x.username===u));render();setTimeout(()=>{const n=$("#nuName");if(n){n.scrollIntoView({block:"center"});n.focus()}},50);return}
    arm(b,"ប្រាកដ?",async()=>{try{const j=await req("user_del",{username:u});S.users=j.users;render()}catch(x){toast((x&&x.message)||"លុបមិនបាន")}})});
}

/* ---------- branch management (owner) and overview ---------- */
function viewBranches(){
  if(!isOwner())return "";
  const list=branches(),AC=S.allClasses||[];const dis=S.canWrite?"":"disabled";
  const rows=list.map((b,i)=>{const n=AC.filter(c=>classBranch(c)===b.id).length;
    return `<div class="brow" data-i="${i}">
      <input class="inp" data-f="name" value="${esc(b.name)}" aria-label="ឈ្មោះសាខា" ${dis}>
      <input class="inp" data-f="principalTitle" value="${esc(b.principalTitle||"")}" placeholder="តួនាទី ឧ. នាយកសាខា" aria-label="តួនាទីអ្នកចុះហត្ថលេខា" ${dis}>
      <input class="inp" data-f="principalName" value="${esc(b.principalName||"")}" placeholder="ឈ្មោះនាយកសាខា" aria-label="ឈ្មោះនាយកសាខា" ${dis}>
      <input class="inp" data-f="address" value="${esc(b.address||"")}" placeholder="អាសយដ្ឋាន / ទូរស័ព្ទ" aria-label="អាសយដ្ឋាន" ${dis}>
      <span class="row" style="gap:6px;flex-wrap:nowrap"><span class="hint num">${toKh(n)} ថ្នាក់</span>${list.length>1?`<button class="btn sm danger" data-a="del" ${dis||(n?"disabled":"")} title="${n?"លុបបានតែសាខាដែលគ្មានថ្នាក់":""}">លុប</button>`:""}</span></div>`}).join("");
  return `<section class="panel" style="margin-bottom:20px">
    <div class="row"><div><h2 style="margin:0">សាខា</h2><p class="sub" style="margin:2px 0 0">សាខានីមួយៗមានថ្នាក់ សិស្ស និងហិរញ្ញវត្ថុដាច់ដោយឡែក។ ឈ្មោះសាលា ឡូហ្គោ កម្រិតថ្នាក់ និងមុខវិជ្ជា ប្រើរួមគ្នា។ ប្ដូរសាខានៅម៉ឺនុយខាងឆ្វេង។</p></div></div>
    <div class="brow hint" style="border-bottom:1px solid var(--line-strong)"><span>ឈ្មោះសាខា</span><span>តួនាទីអ្នកចុះហត្ថលេខា</span><span>ឈ្មោះនាយកសាខា</span><span>អាសយដ្ឋាន</span><span></span></div>
    <div id="brList">${rows}</div>
    <form id="fBr" class="row" style="margin-top:12px"><input class="inp" id="nbName" placeholder="ឈ្មោះសាខាថ្មី ឧ. សាខាទី២ ផ្សារដើមថ្កូវ" style="flex:1;min-width:220px" required ${dis}><button class="btn primary" ${dis}>បន្ថែមសាខា</button></form>
  </section>`;
}
function saveBranches(list){const o=clone(S.settings||{});o.branches=list;return saveSettings(o)}
function bindBranches(){
  const l=$("#brList");if(!l)return;
  l.addEventListener("change",e=>{const row=e.target.closest(".brow");if(!row)return;const list=clone(branches());const i=+row.dataset.i;const f=e.target.dataset.f;const v=e.target.value.trim();
    if(f==="name"&&!v){e.target.value=list[i].name;return}list[i][f]=v;saveBranches(list);renderBrand();renderNav()});
  l.addEventListener("click",e=>{const b=e.target.closest("button[data-a=del]");if(!b)return;const i=+b.closest(".brow").dataset.i;
    arm(b,"ប្រាកដ?",()=>{const list=clone(branches());const gone=list.splice(i,1)[0];saveBranches(list);if(S.branch===gone.id){S.branch=list[0].id;applyBranch()}toast("បានលុបសាខា "+gone.name);render()})});
  $("#fBr").addEventListener("submit",e=>{e.preventDefault();const name=$("#nbName").value.trim();if(!name)return;
    const list=clone(branches());const id="br"+uid();list.push({id,name});saveBranches(list);toast("បានបន្ថែម "+name+" · ប្ដូរទៅសាខានេះនៅម៉ឺនុយខាងឆ្វេង");render()});
}
function branchOverview(){
  if(!isOwner()||!multiBranch())return "";
  const AC=S.allClasses||[];const m=isoOf(new Date()).slice(0,7);const fin=finAccess()&&S.fin.ready;
  const rows=branches().map(b=>{const cs=AC.filter(c=>classBranch(c)===b.id);const st=cs.reduce((a,c)=>a+c.students.length,0),fe=cs.reduce((a,c)=>a+c.students.filter(x=>x.g==="F").length,0);
    let f=null;if(fin)f=withBranch(b.id,()=>{const ms=fyMonths();return monthStats(ms.includes(m)?m:ms[0])});
    return {b,n:cs.length,st,fe,f}});
  const T=k=>rows.reduce((a,r)=>a+(r.f?r.f[k]:0),0);
  return `<section class="panel" style="margin-top:20px;padding:14px"><div class="row" style="margin-bottom:8px"><h2 style="margin:0">សាខាទាំងអស់</h2><span class="hint">ចុចលើសាខា ដើម្បីប្ដូរ</span></div>
    <div class="gridwrap"><table class="ftab"><thead><tr><th class="l">សាខា</th><th class="r">ថ្នាក់</th><th class="r">សិស្ស</th>${fin?`<th class="r">ចំណូលខែនេះ</th><th class="r">ចំណាយខែនេះ</th><th class="r">ចំណេញ</th><th class="r">សិស្សជំពាក់</th>`:""}</tr></thead><tbody>
    ${rows.map(r=>`<tr class="brpick" data-b="${esc(r.b.id)}" style="cursor:pointer"><td class="l"><b>${esc(r.b.name)}</b>${r.b.id===S.branch?` <span class="chip N">កំពុងមើល</span>`:""}</td><td class="r num">${toKh(r.n)}</td><td class="r num">${toKh(r.st)} <span class="hint">(ស្រី ${toKh(r.fe)})</span></td>
      ${fin?`<td class="r num" style="color:var(--gA)">${usd(r.f.inT)}</td><td class="r num" style="color:var(--gE)">${usd(r.f.totalOut)}</td><td class="r num"><b>${usd(r.f.net)}</b></td><td class="r num">${r.f.debtors?`<span class="chip A">${toKh(r.f.debtors)} · ${usd(r.f.owed)}</span>`:"–"}</td>`:""}</tr>`).join("")}
    </tbody><tfoot><tr><td class="l">សរុប</td><td class="r num">${toKh(rows.reduce((a,r)=>a+r.n,0))}</td><td class="r num">${toKh(rows.reduce((a,r)=>a+r.st,0))}</td>${fin?`<td class="r num">${usd(T("inT"))}</td><td class="r num">${usd(T("totalOut"))}</td><td class="r num">${usd(T("net"))}</td><td class="r num">${usd(T("owed"))}</td>`:""}</tr></tfoot></table></div></section>`;
}
document.addEventListener("click",e=>{const r=e.target.closest&&e.target.closest("tr.brpick");if(r&&r.dataset.b&&r.dataset.b!==S.branch)switchBranch(r.dataset.b)});

/* ---------- navigation, brand and home page ---------- */
const ICON={
 home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 grid:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16M15 4v16"/>',
 check:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M8 14l3 3 5-6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c2 .8 3.2 2.5 3.5 5.2"/>',
 doc:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/>',
/* ---------- Utility & Finance Helpers ---------- */
const pad2=n=>String(n).padStart(2,'0');
const isoOf=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const clean=v=>String(v??'').replace(/[\u200b\u200c\u200d\ufeff]/g,'').replace(/\s+/g,' ').trim();
const num=v=>{const n=Number(String(v??'').trim().replace(/[áŸ -áŸ©]/g,c=>KH_DIG.indexOf(c)).replace(',','.'));return isFinite(n)?n:0};
const dstr=v=>{if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Math.round(v)*864e5-25569*864e5);return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`}return String(v||'').slice(0,10)};
const fpath=(k,bid=S.branch||'main')=>bid==='main'?k:`${bid}~${k}`;
function branchDocs(all,bid){const o={};for(const k in all){const i=k.indexOf('~');if(bid==='main'?i<0:k.startsWith(bid+'~'))o[bid==='main'?k:k.slice(bid.length+1)]=all[k]}return o}
function withBranch(bid,fn){const keep=S.fin.docs,kb=S.branch;S.branch=bid;S.fin.docs=branchDocs(S.fin.allDocs||{},bid);try{return fn()}finally{S.fin.docs=keep;S.branch=kb}}
/* ================= finance (income, expenses, payroll, tuition) ================= */
const FIN_TABS=[["fdash","របាយការណ៍ប្រចាំខែ"],["fin_in","ចំណូល"],["fin_out","ចំណាយ"],["fin_pay","ប្រាក់ខែ"],["fin_fee","ថ្លៃសិក្សា"],["fin_debt","សិស្សជំពាក់"],["fin_year","សង្ខេបប្រចាំឆ្នាំ"],["fin_set","ការកំណត់ហិរញ្ញវត្ថុ"]];
const CASH="សាច់ប្រាក់",BANK="ធនាគារ";
const FIN_DEFAULT={startMonth:10,startYear:2026,rate:4100,openCash:0,openBank:0,prepared:"",reviewed:"",approved:"",
  lists:{
    inCats:["ថ្លៃសិក្សាថ្នាក់មត្តេយ្យ","ថ្លៃសិក្សាថ្នាក់បឋមសិក្សា","ថ្លៃសិក្សាភាសាអង់គ្លេស","ថ្លៃសិក្សាភាសាចិន","ថ្លៃសិក្សាថ្នាក់ក្រៅម៉ោង","ថ្លៃចុះឈ្មោះចូលរៀន","ថ្លៃឯកសណ្ឋាន","ថ្លៃសៀវភៅ និងសម្ភារៈសិក្សា","ថ្លៃឡានដឹកជញ្ជូន","ថ្លៃអាហារ និងអាហារសម្រន់","ចំណូលផ្សេងៗ"],
    outCats:["ថ្លៃជួលអគារ","ថ្លៃអគ្គិសនី","ថ្លៃទឹក","ថ្លៃអ៊ីនធឺណិត និងទូរស័ព្ទ","សម្ភារៈសិក្សា និងការិយាល័យ","ទិញឯកសណ្ឋាន","ទិញសៀវភៅ","ប្រេងឥន្ធនៈ និងថែទាំឡាន","ជួសជុល និងថែទាំអគារ","អនាម័យ និងសម្អាត","ផ្សព្វផ្សាយ","ព្រឹត្តិការណ៍ និងសកម្មភាពសិស្ស","ពន្ធ និងអាជ្ញាប័ណ្ណ","ចំណាយផ្សេងៗ","ចំណាយលើការជួលសម្ភារៈ"],
    classes:["មត្តេយ្យកម្រិតទាប","មត្តេយ្យកម្រិតមធ្យម","មត្តេយ្យកម្រិតខ្ពស់","ថ្នាក់ទី១","ថ្នាក់ទី២","ថ្នាក់ទី៣","ថ្នាក់ទី៤","ថ្នាក់ទី៥","ថ្នាក់ទី៦"],
    roles:["គ្រូមត្តេយ្យ","គ្រូភាសាខ្មែរ","គ្រូភាសាអង់គ្លេស","គ្រូភាសាចិន","នាយក/នាយករង","បុគ្គលិករដ្ឋបាល","គណនេយ្យករ","អ្នកបើកបរ","សន្តិសុខ","អ្នកអនាម័យ"],
    programs:["ខ្មែរ","អង់គ្លេស","ខ្មែរ + អង់គ្លេស","ក្រៅម៉ោងចិន","ក្រៅម៉ោងអង់គ្លេស"]}};
S.mode="acad";
S.fin={docs:{},ready:false,unsub:null,year:null,month:null,edit:null,q:"",feeView:"month",onlyDebt:false};
if(FIN_TAB_IDS.includes(S.tab)){S.mode="fin";S.fin.tab=S.tab}
function finAccess(){return S.backend!=="server"||(S.user&&(S.user.role==="admin"||S.user.role==="accountant"))}
const isAcct=()=>S.backend==="server"&&S.user&&S.user.role==="accountant";
function finSettings(){const d=(S.fin.docs.settings)||{};const o=Object.assign(clone(FIN_DEFAULT),d);o.lists=Object.assign(clone(FIN_DEFAULT.lists),d.lists||{});return o}
const fy=()=>S.fin.year??finSettings().startYear;
function fyMonths(y=fy()){const sm=finSettings().startMonth;return [...Array(12)].map((_,i)=>{const m=(sm-1+i)%12+1;return `${y+(sm-1+i>=12?1:0)}-${pad2(m)}`})}
const monthLabel=k=>`ខែ${KH_MONTHS[+k.slice(5)-1]} ${toKh(k.slice(0,4))}`;
function curFm(){const ms=fyMonths();if(ms.includes(S.fin.month))return S.fin.month;const t=isoOf(new Date()).slice(0,7);return S.fin.month=ms.includes(t)?t:ms[0]}
const n2=v=>{const x=Number(v);return isFinite(x)?x:0};
const usd=v=>(v<0?"-":"")+"$"+Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const riel=v=>Math.round(v*finSettings().rate).toLocaleString("en-US")+" ៛";
function frows(kind,m){const d=S.fin.docs[`${kind}_${m}`];return Object.entries((d&&d.rows)||{}).filter(([,r])=>r&&typeof r==="object").map(([id,r])=>({id,...r}))}
function fees(){const d=S.fin.docs.fees;return Object.entries((d&&d.rows)||{}).filter(([,r])=>r&&typeof r==="object").map(([id,r])=>({id,...r})).sort((a,b)=>(a.order??0)-(b.order??0)||String(a.name).localeCompare(String(b.name),"km"))}
const gross=r=>n2(r.base)+n2(r.allow)+n2(r.bonus);
const net=r=>gross(r)-n2(r.tax)-n2(r.nssf)-n2(r.deduct);
const sumBy=(rs,f)=>rs.reduce((a,r)=>a+f(r),0);
const isTuition=cat=>String(cat||"").startsWith("ថ្លៃសិក្សា");
const sameName=(a,b)=>String(a||"").replace(/\s+/g,"")===String(b||"").replace(/\s+/g,"");
function feePaid(name,m){return sumBy(frows("in",m).filter(r=>sameName(r.party,name)&&isTuition(r.cat)),r=>n2(r.amount))}
function monthStats(m){
  const L=finSettings().lists;const inc=frows("in",m),out=frows("out",m),pay=frows("pay",m);
  const byCat=(rs,cats)=>{const o={};cats.forEach(c=>o[c]=0);let other=0;rs.forEach(r=>{if(r.cat in o)o[r.cat]+=n2(r.amount);else other+=n2(r.amount)});return {o,other}};
  const I=byCat(inc,L.inCats),E=byCat(out,L.outCats);
  const inT=sumBy(inc,r=>n2(r.amount)),exT=sumBy(out,r=>n2(r.amount)),payT=sumBy(pay,gross);
  const by=(rs,meth,f)=>sumBy(rs.filter(r=>r.method===meth),f);
  const fl=fees();const due=sumBy(fl,f=>Math.max(0,n2(f.fee)-n2(f.discount)));
  const paidFee=fl.map(f=>({f,due:Math.max(0,n2(f.fee)-n2(f.discount)),paid:feePaid(f.name,m)}));
  const collected=sumBy(paidFee,x=>Math.min(x.paid,x.due)),owed=sumBy(paidFee,x=>Math.max(0,x.due-x.paid));
  const noMethod=[...inc,...out,...pay].filter(r=>r.method!==CASH&&r.method!==BANK).length;
  return {inc,out,pay,I,E,inT,exT,payT,totalOut:exT+payT,net:inT-exT-payT,
    cashIn:by(inc,CASH,r=>n2(r.amount)),bankIn:by(inc,BANK,r=>n2(r.amount)),
    cashOut:by(out,CASH,r=>n2(r.amount)),bankOut:by(out,BANK,r=>n2(r.amount)),
    cashPay:by(pay,CASH,gross),bankPay:by(pay,BANK,gross),
    due,collected,owed,debtors:paidFee.filter(x=>x.due-x.paid>0.005).length,feeCount:fl.length,noMethod};
}
function yearStats(){
  const st=finSettings();let cash=n2(st.openCash),bank=n2(st.openBank);
  return fyMonths().map(m=>{const s=monthStats(m);s.m=m;s.openCash=cash;s.openBank=bank;
    cash=cash+s.cashIn-s.cashOut-s.cashPay;bank=bank+s.bankIn-s.bankOut-s.bankPay;s.closeCash=cash;s.closeBank=bank;return s});
}
function startFin(){
  if(S.fin.unsub||!api||!api.watchColl)return;
  S.fin.unsub=api.watchColl("fin",docs=>{const first=!S.fin.ready;S.fin.allDocs=docs;S.fin.docs=branchDocs(docs,curBranch().id);S.fin.ready=true;if(S.mode==="fin")finRefresh();else if(S.tab==="home"&&first)render()},()=>{S.fin.ready=true;if(S.mode==="fin")render()});
}
function finLocal(path,patch){ // show a write at once; the store's copy follows
  const k=path.replace(/^fin\//,"");const d=clone(S.fin.docs[k]||{});
  const mergeIn=(a,b)=>{for(const x in b){if(b[x]&&typeof b[x]==="object"&&!Array.isArray(b[x])&&a[x]&&typeof a[x]==="object")mergeIn(a[x],b[x]);else a[x]=clone(b[x])}return a};
  S.fin.docs[k]=mergeIn(d,patch);S.fin.allDocs=S.fin.allDocs||{};S.fin.allDocs[fpath(k)]=S.fin.docs[k];
}
let finWrite=Promise.resolve();
function finPatch(path,patch){finLocal(path,patch);setStatus("កំពុងរក្សាទុក…");
  const real="fin/"+fpath(path.replace(/^fin\//,""));finWrite=finWrite.then(()=>api.patchDoc(real,patch)).then(()=>setStatus("បានរក្សាទុក ✓")).catch(e=>{setStatus(e&&e.code==="invalid_argument"?"អ្នកមិនមានសិទ្ធិកែហិរញ្ញវត្ថុទេ":"រក្សាទុកមិនបាន",true);toast("រក្សាទុកមិនបាន")});return finWrite}
function finSet(path,data){const k=path.replace(/^fin\//,"");S.fin.docs[k]=clone(data);S.fin.allDocs=S.fin.allDocs||{};S.fin.allDocs[fpath(k)]=S.fin.docs[k];setStatus("កំពុងរក្សាទុក…");
  const real="fin/"+fpath(k);finWrite=finWrite.then(()=>api.setDoc(real,data)).then(()=>setStatus("បានរក្សាទុក ✓")).catch(()=>{setStatus("រក្សាទុកមិនបាន",true);toast("រក្សាទុកមិនបាន")});return finWrite}

/* ---------- finance shell ---------- */
function finRefresh(){
  // keep a half-typed form; only redraw the part that shows data
  const a=document.activeElement;const inForm=a&&a.closest&&a.closest(".finform");
  if(inForm&&$("#finBody")){const b=$("#finBody");b.innerHTML=finBodyHTML();bindFinBody();renderFinPickers();return}
  render();
}
function renderFinPickers(){
  const ys=$("#selFy"),ms=$("#selFm");if(!ys)return;
  const st=finSettings();const y0=st.startYear;const ys2=new Set([y0-1,y0,y0+1,fy()]);
  Object.keys(S.fin.docs).forEach(k=>{const mm=k.match(/^(?:in|out|pay)_(\d{4})-(\d{2})$/);if(mm){const y=+mm[1],m=+mm[2];ys2.add(m>=st.startMonth?y:y-1)}});
  ys.innerHTML=[...ys2].sort().map(y=>`<option value="${y}">${toKh(y)}-${toKh(y+1)}</option>`).join("");ys.value=fy();
  ms.innerHTML=fyMonths().map(m=>`<option value="${m}">${monthLabel(m)}</option>`).join("");ms.value=curFm();
}
function renderMode(){
  const fin=S.mode==="fin",t=S.tab;
  const acadPick=["scores","attendance","students","report","notice","honor","idcard","cert"].includes(t);
  document.querySelectorAll(".pick.acad").forEach(p=>p.hidden=fin||!acadPick);
  document.querySelectorAll(".pick.finp").forEach(p=>p.hidden=!fin||t==="fin_set");
  if(fin)renderFinPickers();
  renderNav();
}
function renderFinance(m){
  startFin();
  if(!FIN_TAB_IDS.includes(S.tab))S.tab=S.fin.tab||"fdash";
  S.fin.tab=S.tab;
  renderMode();
  if(!S.fin.ready){m.innerHTML=`<div class="empty"><h2>កំពុងផ្ទុកទិន្នន័យហិរញ្ញវត្ថុ…</h2></div>`;return}
  const t=S.tab;
  if(t==="fdash"){m.innerHTML=banner()+viewFinDash();bindFinDash()}
  else if(t==="fin_in"||t==="fin_out"){m.innerHTML=banner()+viewLedger(t==="fin_in"?"in":"out");bindLedger(t==="fin_in"?"in":"out")}
  else if(t==="fin_pay"){m.innerHTML=banner()+viewPayroll();bindPayroll()}
  else if(t==="fin_fee"){m.innerHTML=banner()+viewFees();bindFees()}
  else if(t==="fin_debt"){m.innerHTML=banner()+viewDebtors();bindDebtors()}
  else if(t==="fin_year"){m.innerHTML=banner()+viewFinYear();bindFinYear()}
  else if(t==="fin_set"){m.innerHTML=banner()+viewFinSettings();bindFinSettings()}
}
// the part of each finance tab that redraws when data arrives
function finBodyHTML(){const t=S.tab;
  if(t==="fin_in")return ledgerBody("in");if(t==="fin_out")return ledgerBody("out");if(t==="fin_pay")return payrollBody();if(t==="fin_fee")return feesBody();return ""}
function bindFinBody(){const t=S.tab;if(t==="fin_in")bindLedgerBody("in");else if(t==="fin_out")bindLedgerBody("out");else if(t==="fin_pay")bindPayrollBody();else if(t==="fin_fee")bindFeesBody()}
const opts=(list,sel,blank)=>(blank?`<option value="">${blank}</option>`:"")+[...new Set([...(list||[]),...(sel&&!(list||[]).includes(sel)?[sel]:[])])].map(x=>`<option${x===sel?" selected":""}>${esc(x)}</option>`).join("");
const finDis=()=>S.canWrite?"":"disabled";

/* ---------- monthly report ---------- */
function finStatTiles(s,ys){
  const close=ys.find(x=>x.m===s.m)||{closeCash:0,closeBank:0};
  return `<div class="stats">
    <div class="stat"><div class="k">ចំណូលខែនេះ</div><div class="v num" style="color:var(--gA)">${usd(s.inT)}</div><div class="s">${riel(s.inT)}</div></div>
    <div class="stat"><div class="k">ចំណាយខែនេះ (រួមប្រាក់ខែ)</div><div class="v num" style="color:var(--gE)">${usd(s.totalOut)}</div><div class="s">ប្រាក់ខែ ${usd(s.payT)}</div></div>
    <div class="stat"><div class="k">${s.net>=0?"ចំណេញ":"ខាត"}</div><div class="v num" style="color:${s.net>=0?"var(--gA)":"var(--gE)"}">${usd(s.net)}</div><div class="s">${s.inT?Math.round(s.net/s.inT*100)+"% នៃចំណូល":"–"}</div></div>
    <div class="stat"><div class="k">សមតុល្យចុងខែ</div><div class="v num">${usd(close.closeCash+close.closeBank)}</div><div class="s">ដៃ ${usd(close.closeCash)} · ធនាគារ ${usd(close.closeBank)}</div></div>
  </div>`;
}
function finReportHTML(m){
  const st=finSettings(),L=st.lists,ys=yearStats(),s=ys.find(x=>x.m===m),idx=ys.indexOf(s);
  const ytd=ys.slice(0,idx+1);
  const pc=(v,t)=>t?Math.round(v/t*1000)/10+"%":"–";
  const cell=v=>v?usd(v):"–";
  const inRows=L.inCats.map(c=>`<tr><td class="l">${esc(c)}</td><td>${cell(s.I.o[c])}</td><td>${s.I.o[c]?pc(s.I.o[c],s.inT):""}</td><td>${s.I.o[c]?riel(s.I.o[c]):""}</td><td>${cell(sumBy(ytd,x=>x.I.o[c]||0))}</td></tr>`).join("");
  const outRows=L.outCats.map(c=>`<tr><td class="l">${esc(c)}</td><td>${cell(s.E.o[c])}</td><td>${s.E.o[c]?pc(s.E.o[c],s.totalOut):""}</td><td>${s.E.o[c]?riel(s.E.o[c]):""}</td><td>${cell(sumBy(ytd,x=>x.E.o[c]||0))}</td></tr>`).join("");
  const ytdIn=sumBy(ytd,x=>x.inT),ytdOut=sumBy(ytd,x=>x.totalOut);
  const head=`<tr><th class="l">${"%s"}</th><th>ខែនេះ ($)</th><th>ភាគរយ</th><th>ខែនេះ (៛)</th><th>ពីដើមឆ្នាំ ($)</th></tr>`;
  return pageHTML(`${sheetHeader()}
    <h1 class="ss-title">របាយការណ៍ហិរញ្ញវត្ថុប្រចាំ${esc(monthLabel(m))}</h1>
    <div class="ss-sub">ឆ្នាំសិក្សា ${toKh(fy())}-${toKh(fy()+1)} · អត្រាប្ដូរប្រាក់ ${toKh(st.rate.toLocaleString("en-US"))} ៛ / $1</div>
    <table class="fr"><thead>${head.replace("%s","១. ចំណូល")}</thead><tbody>${inRows}
      ${s.I.other?`<tr><td class="l">មិនទាន់ចាត់ប្រភេទ (ពិនិត្យ)</td><td>${usd(s.I.other)}</td><td>${pc(s.I.other,s.inT)}</td><td>${riel(s.I.other)}</td><td>${usd(sumBy(ytd,x=>x.I.other))}</td></tr>`:""}
      <tr class="tot"><td class="l">ចំណូលសរុប</td><td>${usd(s.inT)}</td><td>${s.inT?"100%":""}</td><td>${riel(s.inT)}</td><td>${usd(ytdIn)}</td></tr></tbody></table>
    <table class="fr"><thead>${head.replace("%s","២. ចំណាយ")}</thead><tbody>
      <tr><td class="l">ប្រាក់ខែបុគ្គលិក និងគ្រូ</td><td>${cell(s.payT)}</td><td>${s.payT?pc(s.payT,s.totalOut):""}</td><td>${s.payT?riel(s.payT):""}</td><td>${cell(sumBy(ytd,x=>x.payT))}</td></tr>${outRows}
      ${s.E.other?`<tr><td class="l">មិនទាន់ចាត់ប្រភេទ (ពិនិត្យ)</td><td>${usd(s.E.other)}</td><td>${pc(s.E.other,s.totalOut)}</td><td>${riel(s.E.other)}</td><td>${usd(sumBy(ytd,x=>x.E.other))}</td></tr>`:""}
      <tr class="tot"><td class="l">ចំណាយសរុប</td><td>${usd(s.totalOut)}</td><td>${s.totalOut?"100%":""}</td><td>${riel(s.totalOut)}</td><td>${usd(ytdOut)}</td></tr></tbody></table>
    <div class="fr-two">
      <table class="fr"><thead><tr><th class="l">៣. លទ្ធផល</th><th>ខែនេះ ($)</th><th>ពីដើមឆ្នាំ ($)</th></tr></thead><tbody>
        <tr><td class="l">ចំណូលសរុប</td><td>${usd(s.inT)}</td><td>${usd(ytdIn)}</td></tr>
        <tr><td class="l">ចំណាយសរុប</td><td>${usd(s.totalOut)}</td><td>${usd(ytdOut)}</td></tr>
        <tr class="tot"><td class="l">ចំណេញ / (ខាត) សុទ្ធ</td><td class="${s.net<0?"neg":""}">${usd(s.net)}</td><td class="${ytdIn-ytdOut<0?"neg":""}">${usd(ytdIn-ytdOut)}</td></tr>
        <tr><td class="l">អត្រាចំណេញ</td><td>${pc(s.net,s.inT)}</td><td>${pc(ytdIn-ytdOut,ytdIn)}</td></tr></tbody></table>
      <table class="fr"><thead><tr><th class="l">៥. ការប្រមូលថ្លៃសិក្សា</th><th>ខែនេះ</th></tr></thead><tbody>
        <tr><td class="l">ត្រូវប្រមូល</td><td>${usd(s.due)}</td></tr><tr><td class="l">ប្រមូលបាន</td><td>${usd(s.collected)}</td></tr>
        <tr><td class="l">នៅជំពាក់</td><td class="${s.owed>0?"neg":""}">${usd(s.owed)}</td></tr><tr><td class="l">អត្រាប្រមូលបាន</td><td>${pc(s.collected,s.due)}</td></tr>
        <tr><td class="l">សិស្សនៅជំពាក់</td><td>${toKh(s.debtors)} / ${toKh(s.feeCount)} នាក់</td></tr></tbody></table>
    </div>
    <table class="fr"><thead><tr><th class="l">៤. ចលនាសាច់ប្រាក់</th><th>សាច់ប្រាក់ក្នុងដៃ</th><th>ធនាគារ</th><th>សរុប ($)</th></tr></thead><tbody>
      <tr><td class="l">សមតុល្យដើមខែ</td><td>${usd(s.openCash)}</td><td>${usd(s.openBank)}</td><td>${usd(s.openCash+s.openBank)}</td></tr>
      <tr><td class="l">បូក៖ ចំណូល</td><td>${usd(s.cashIn)}</td><td>${usd(s.bankIn)}</td><td>${usd(s.cashIn+s.bankIn)}</td></tr>
      <tr><td class="l">ដក៖ ចំណាយប្រតិបត្តិការ</td><td>${usd(-s.cashOut)}</td><td>${usd(-s.bankOut)}</td><td>${usd(-(s.cashOut+s.bankOut))}</td></tr>
      <tr><td class="l">ដក៖ ប្រាក់ខែបុគ្គលិក</td><td>${usd(-s.cashPay)}</td><td>${usd(-s.bankPay)}</td><td>${usd(-(s.cashPay+s.bankPay))}</td></tr>
      <tr class="tot"><td class="l">សមតុល្យចុងខែ</td><td>${usd(s.closeCash)}</td><td>${usd(s.closeBank)}</td><td>${usd(s.closeCash+s.closeBank)}</td></tr>
      <tr><td class="l">សមតុល្យចុងខែ (៛)</td><td>${riel(s.closeCash)}</td><td>${riel(s.closeBank)}</td><td>${riel(s.closeCash+s.closeBank)}</td></tr></tbody></table>
    ${s.noMethod?`<p class="fr-warn">⚠ មានប្រតិបត្តិការ ${toKh(s.noMethod)} មិនបានកំណត់វិធីបង់ប្រាក់ (សាច់ប្រាក់/ធនាគារ) ដូច្នេះមិនបានគិតក្នុងចលនាសាច់ប្រាក់។</p>`:""}
    <div class="fr-signs"><div><div>រៀបចំដោយ</div><div class="sp"></div><div class="nm">${esc(st.prepared)||"……………………"}</div></div>
      <div><div>ពិនិត្យដោយ</div><div class="sp"></div><div class="nm">${esc(st.reviewed)||"……………………"}</div></div>
      <div><div>ធ្វើនៅ${esc(todayKh())}</div><div>អនុម័តដោយ</div><div class="sp"></div><div class="nm">${esc(st.approved)||"……………………"}</div></div></div>`,742);
}
function viewFinDash(){
  const m=curFm();const ys=yearStats();const s=ys.find(x=>x.m===m);
  return `${finStatTiles(s,ys)}
   <div class="hon-layout" style="margin-top:20px">
    <section class="panel hon-form">
      <div><h2>របាយការណ៍ប្រចាំខែ</h2><p class="sub" style="margin:0">${esc(monthLabel(m))}។ ជ្រើសខែនៅខាងលើ។ ក្រដាស A4 មួយទំព័រ សម្រាប់បោះពុម្ព និងចុះហត្ថលេខា។</p></div>
      <div class="row"><button class="btn primary" id="frPdf">ទាញយក PDF</button><button class="btn" id="frJpg">JPG</button></div>
      ${s.inc.length+s.out.length+s.pay.length?"":`<p class="note" style="margin:0">មិនទាន់មានប្រតិបត្តិការក្នុងខែនេះទេ។ ចាប់ផ្ដើមនៅផ្ទាំង «ចំណូល» ឬនាំចូលពី Excel នៅ «ការកំណត់ហិរញ្ញវត្ថុ»។</p>`}
      ${(()=>{const ms=fyMonths();const out=Object.keys(S.fin.docs).filter(k=>/^(in|out|pay)_\d{4}-\d{2}$/.test(k)&&!ms.includes(k.slice(-7))&&Object.values((S.fin.docs[k]||{}).rows||{}).some(Boolean)).map(k=>k.slice(-7));
        return out.length?`<p class="note" style="margin:0">មានប្រតិបត្តិការនៅក្រៅឆ្នាំសិក្សានេះ (${[...new Set(out)].sort().map(monthLabel).join(", ")})។ ជ្រើសឆ្នាំសិក្សាផ្សេងនៅខាងលើ ដើម្បីមើល។</p>`:""})()}
      <div class="chips">${s.debtors?`<span class="chip A">សិស្សជំពាក់ ${toKh(s.debtors)} នាក់ · ${usd(s.owed)}</span>`:`<span class="chip P">គ្មានសិស្សជំពាក់</span>`}</div>
    </section>
    <div class="pv-wrap" id="pvWrap"></div>
   </div>`;
}
function bindFinDash(){
  const m=curFm();renderPreview($("#pvWrap"),finReportHTML(m));
  if(!S.photos.logo)ensureLogo().then(()=>{const w=$("#pvWrap");if(w&&S.photos.logo&&S.tab==="fdash")renderPreview(w,finReportHTML(m))});
  const go=async k=>{await ensureLogo();exportDoc([()=>finReportHTML(m)],`របាយការណ៍ហិរញ្ញវត្ថុ-${monthLabel(m)}`,k)};
  $("#frPdf").onclick=()=>go("pdf");$("#frJpg").onclick=()=>go("jpg");
}

/* ---------- income / expense ledgers ---------- */
const LEDGER={
  in:{title:"ចំណូល",ref:"លេខបង្កាន់ដៃ",party:"ឈ្មោះសិស្ស / អ្នកបង់",cats:"inCats",cls:true},
  out:{title:"ចំណាយ",ref:"លេខប័ណ្ណចំណាយ",party:"អ្នកទទួលប្រាក់ / អ្នកផ្គត់ផ្គង់",cats:"outCats",cls:false}};
function nextRef(kind){let mx=0;fyMonths().forEach(m=>frows(kind,m).forEach(r=>{const v=parseInt(String(r.ref||"").replace(/\D/g,""),10);if(v>mx)mx=v}));return mx?String(mx+1):""}
function viewLedger(kind){
  const C=LEDGER[kind],L=finSettings().lists,m=curFm(),dis=finDis();
  const e=S.fin.edit&&S.fin.edit.kind===kind?S.fin.edit.row:null;
  const today=isoOf(new Date());const dflt=today.slice(0,7)===m?today:`${m}-01`;
  const parties=[...new Set([...(kind==="in"?fees().map(f=>f.name):[]),...fyMonths().flatMap(mm=>frows(kind,mm).map(r=>r.party))].filter(Boolean))];
  return `<section class="panel finform" id="finForm">
    <h2>${e?"កែ"+C.title:"បន្ថែម"+C.title}</h2>
    <form id="fLed" class="fgrid">
      <div class="field"><label for="lDate">កាលបរិច្ឆេទ</label><input class="inp" type="date" id="lDate" value="${esc(e?e.date:dflt)}" required ${dis}></div>
      <div class="field"><label for="lRef">${C.ref}</label><input class="inp" id="lRef" value="${esc(e?e.ref||"":nextRef(kind))}" ${dis}></div>
      <div class="field wide"><label for="lParty">${C.party}</label><input class="inp" id="lParty" list="partyList" value="${esc(e?e.party||"":"")}" ${dis}><datalist id="partyList">${parties.map(p=>`<option value="${esc(p)}">`).join("")}</datalist></div>
      ${C.cls?`<div class="field"><label for="lCls">ថ្នាក់</label><select class="inp" id="lCls" ${dis}>${opts(L.classes,e?e.cls:"","—")}</select></div>`:""}
      <div class="field wide"><label for="lCat">ប្រភេទ${C.title}</label><select class="inp" id="lCat" required ${dis}>${opts(L[C.cats],e?e.cat:"","— ជ្រើស —")}</select></div>
      <div class="field wide"><label for="lDesc">បរិយាយ</label><input class="inp" id="lDesc" value="${esc(e?e.desc||"":"")}" ${dis}></div>
      <div class="field"><label for="lMeth">វិធីបង់ប្រាក់</label><select class="inp" id="lMeth" ${dis}>${opts([CASH,BANK],e?e.method:CASH)}</select></div>
      <div class="field"><label for="lAmt">ចំនួនទឹកប្រាក់ ($)</label><input class="inp num" id="lAmt" inputmode="decimal" value="${e?esc(e.amount):""}" required ${dis}></div>
      <div class="fbtns"><button class="btn primary" ${dis}>${e?"រក្សាទុកការកែ":"បន្ថែម"}</button>${e?`<button type="button" class="btn" id="lCancel">បោះបង់</button>`:""}<span id="saveStatus" class="status${S.statusErr?" err":""}">${esc(S.status)}</span></div>
    </form></section>
  <section class="panel" style="margin-top:20px;padding:14px"><div id="finBody">${ledgerBody(kind)}</div></section>`;
}
function ledgerBody(kind){
  const C=LEDGER[kind],m=curFm(),q=S.fin.q.trim();
  let rs=frows(kind,m).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.ref||"").localeCompare(String(b.ref||""),"en",{numeric:true}));
  const all=rs;if(q)rs=rs.filter(r=>[r.party,r.cat,r.desc,r.ref,r.cls].join(" ").includes(q));
  const tot=sumBy(rs,r=>n2(r.amount)),cash=sumBy(rs.filter(r=>r.method===CASH),r=>n2(r.amount)),bank=sumBy(rs.filter(r=>r.method===BANK),r=>n2(r.amount));
  const ed=S.fin.edit&&S.fin.edit.row&&S.fin.edit.row.id;
  return `<div class="row" style="margin-bottom:10px"><div><h2 style="margin:0">${C.title} ${esc(monthLabel(m))}</h2><div class="hint">${toKh(all.length)} ប្រតិបត្តិការ</div></div><span class="spacer"></span>
    <input class="inp" id="lQ" placeholder="ស្វែងរក…" value="${esc(S.fin.q)}" style="width:180px"><button class="btn" id="lExp">ទាញយក Excel</button></div>
    <div class="chips" style="margin-bottom:10px"><span class="chip ${kind==="in"?"P":"A"}">សរុប ${usd(tot)}</span><span class="chip N">សាច់ប្រាក់ ${usd(cash)}</span><span class="chip E">ធនាគារ ${usd(bank)}</span><span class="chip N">${riel(tot)}</span></div>
    ${rs.length?`<div class="gridwrap"><table class="ftab"><thead><tr><th>ល.រ</th><th>កាលបរិច្ឆេទ</th><th>${C.ref}</th><th class="l">${C.party}</th>${C.cls?"<th>ថ្នាក់</th>":""}<th class="l">ប្រភេទ</th><th class="l">បរិយាយ</th><th>វិធីបង់</th><th class="r">ទឹកប្រាក់ ($)</th><th></th></tr></thead><tbody>
    ${rs.map((r,i)=>`<tr data-id="${esc(r.id)}" class="${r.id===ed?"editing":""}"><td>${i+1}</td><td class="num">${esc(String(r.date||"").split("-").reverse().join("/"))}</td><td>${esc(r.ref||"")}</td><td class="l">${esc(r.party||"")}</td>${C.cls?`<td>${esc(r.cls||"")}</td>`:""}<td class="l">${esc(r.cat||"")}</td><td class="l muted">${esc(r.desc||"")}</td>
      <td><span class="chip ${r.method===BANK?"E":r.method===CASH?"N":"A"}">${esc(r.method||"?")}</span></td><td class="r num"><b>${usd(n2(r.amount))}</b></td>
      <td class="acts"><button class="btn sm" data-a="edit" ${finDis()}>កែ</button><button class="btn sm danger" data-a="del" ${finDis()}>លុប</button></td></tr>`).join("")}
    </tbody></table></div>`:`<div class="empty" style="padding:24px"><p>${q?"រកមិនឃើញ":"មិនទាន់មាន"+C.title+"ក្នុង"+esc(monthLabel(m))+"ទេ"}</p></div>`}`;
}
function bindLedger(kind){
  const f=$("#fLed");const L=finSettings().lists;
  const party=$("#lParty");
  if(kind==="in"&&party)party.addEventListener("change",()=>{const fe=fees().find(x=>sameName(x.name,party.value));if(!fe)return;
    if($("#lCls")&&!$("#lCls").value&&fe.cls){$("#lCls").innerHTML=opts(L.classes,fe.cls,"—")}
    if(!$("#lAmt").value){const due=Math.max(0,n2(fe.fee)-n2(fe.discount)),paid=feePaid(fe.name,($("#lDate").value||curFm()).slice(0,7));const rest=Math.max(0,due-paid);if(rest)$("#lAmt").value=rest}
    if(!$("#lCat").value){const tc=L.inCats.find(c=>isTuition(c)&&fe.program&&c.includes(fe.program))||"";if(tc)$("#lCat").value=tc}});
  const c=$("#lCancel");if(c)c.onclick=()=>{S.fin.edit=null;render()};
  f.addEventListener("submit",e=>{e.preventDefault();
    const amt=parseScore10($("#lAmt").value);if(amt==null){toast("សូមបញ្ចូលចំនួនទឹកប្រាក់ឱ្យត្រឹមត្រូវ");$("#lAmt").focus();return}
    const date=$("#lDate").value;if(!date)return;
    const row={date,ref:$("#lRef").value.trim(),party:$("#lParty").value.trim(),cat:$("#lCat").value,desc:$("#lDesc").value.trim(),method:$("#lMeth").value,amount:amt};
    if(LEDGER[kind].cls)row.cls=$("#lCls").value;
    const old=S.fin.edit&&S.fin.edit.kind===kind?S.fin.edit.row:null;const id=old?old.id:"r"+uid();
    const bucket=`${kind}_${date.slice(0,7)}`;
    if(old&&old.bucket!==bucket)finPatch("fin/"+old.bucket,{rows:{[id]:null}});
    finPatch("fin/"+bucket,{rows:{[id]:row}});
    const where=date.slice(0,7)!==curFm()?` (ក្នុង${monthLabel(date.slice(0,7))})`:"";
    toast((old?"បានកែ":"បានបន្ថែម")+" "+usd(amt)+where);
    S.fin.edit=null;
    if(old){render();return}
    // keep date, method and category for the next entry
    $("#lParty").value="";$("#lDesc").value="";$("#lAmt").value="";$("#lRef").value=nextRef(kind);if($("#lCls"))$("#lCls").value="";
    $("#finBody").innerHTML=ledgerBody(kind);bindLedgerBody(kind);$("#lParty").focus();
  });
  bindLedgerBody(kind);
}
function parseScore10(v){const s=String(v??"").trim().replace(/[០-៩]/g,c=>KH_DIG.indexOf(c)).replace(/[,$\s]/g,"");if(!s)return null;const x=Number(s);return isFinite(x)&&x>=0?Math.round(x*100)/100:null}
function bindLedgerBody(kind){
  const q=$("#lQ");if(q)q.oninput=()=>{S.fin.q=q.value;clearTimeout(bindLedgerBody.t);bindLedgerBody.t=setTimeout(()=>{const pos=q.selectionStart;$("#finBody").innerHTML=ledgerBody(kind);bindLedgerBody(kind);const q2=$("#lQ");q2.focus();q2.setSelectionRange(pos,pos)},250)};
  const ex=$("#lExp");if(ex)ex.onclick=()=>exportLedger(kind);
  const tb=document.querySelector("#finBody tbody");if(!tb)return;
  tb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.closest("tr").dataset.id;const m=curFm();
    const r=frows(kind,m).find(x=>x.id===id);if(!r)return;
    if(b.dataset.a==="edit"){S.fin.edit={kind,row:{...r,bucket:`${kind}_${m}`}};render();setTimeout(()=>{const el=$("#finForm");if(el)el.scrollIntoView({block:"start"})},30);return}
    arm(b,"ប្រាកដ?",()=>{finPatch(`fin/${kind}_${m}`,{rows:{[id]:null}});toast("បានលុប");$("#finBody").innerHTML=ledgerBody(kind);bindLedgerBody(kind)})});
}
async function exportLedger(kind){
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  const C=LEDGER[kind],m=curFm();const rs=frows(kind,m).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const aoa=[[`${C.title} ${monthLabel(m)}`],[],["ល.រ","កាលបរិច្ឆេទ",C.ref,C.party,...(C.cls?["ថ្នាក់"]:[]),"ប្រភេទ","បរិយាយ","វិធីបង់ប្រាក់","ចំនួនទឹកប្រាក់ ($)"]];
  rs.forEach((r,i)=>aoa.push([i+1,r.date,r.ref||"",r.party||"",...(C.cls?[r.cls||""]:[]),r.cat||"",r.desc||"",r.method||"",n2(r.amount)]));
  aoa.push([],["","","","សរុប",...(C.cls?[""]:[]),"","","",sumBy(rs,r=>n2(r.amount))]);
  const ws=X.utils.aoa_to_sheet(aoa);ws["!cols"]=[{wch:5},{wch:12},{wch:10},{wch:26},...(C.cls?[{wch:16}]:[]),{wch:26},{wch:26},{wch:12},{wch:14}];
  const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,C.title);
  const fn=`${C.title}-${monthLabel(m)}.xlsx`.replace(/[\\/:*?"<>|]/g,"-");
  if(await saveFile(fn,new Uint8Array(X.write(wb,{type:"array",bookType:"xlsx"}))))toast("បានទាញយក "+fn);
}

/* ---------- payroll ---------- */
const PAYF=[["base","ប្រាក់ខែគោល"],["allow","ឧបត្ថម្ភ"],["bonus","ម៉ោងបន្ថែម / រង្វាន់"],["tax","ពន្ធលើប្រាក់បៀវត្ស"],["nssf","ភាគទាន ប.ស.ស"],["deduct","ខ្ចីមុន / កាត់ផ្សេងៗ"]];
function viewPayroll(){
  const L=finSettings().lists,m=curFm(),dis=finDis();
  const e=S.fin.edit&&S.fin.edit.kind==="pay"?S.fin.edit.row:null;
  const names=[...new Set(fyMonths().flatMap(mm=>frows("pay",mm).map(r=>r.name)).filter(Boolean))];
  return `<section class="panel finform" id="finForm">
    <h2>${e?"កែប្រាក់ខែ":"បន្ថែមបុគ្គលិកក្នុង"+esc(monthLabel(m))}</h2>
    <form id="fPay" class="fgrid">
      <div class="field wide"><label for="pName">ឈ្មោះបុគ្គលិក</label><input class="inp" id="pName" list="staffList" value="${esc(e?e.name:"")}" required ${dis}><datalist id="staffList">${names.map(n=>`<option value="${esc(n)}">`).join("")}</datalist></div>
      <div class="field wide"><label for="pRole">តួនាទី</label><select class="inp" id="pRole" ${dis}>${opts(L.roles,e?e.role:"","—")}</select></div>
      ${PAYF.map(([k,l])=>`<div class="field"><label for="p_${k}">${l} ($)</label><input class="inp num" id="p_${k}" inputmode="decimal" value="${e&&e[k]?esc(e[k]):""}" ${dis}></div>`).join("")}
      <div class="field"><label for="pMeth">វិធីបើកប្រាក់</label><select class="inp" id="pMeth" ${dis}>${opts([CASH,BANK],e?e.method:BANK)}</select></div>
      <div class="fbtns"><button class="btn primary" ${dis}>${e?"រក្សាទុកការកែ":"បន្ថែម"}</button>${e?`<button type="button" class="btn" id="pCancel">បោះបង់</button>`:""}<span id="saveStatus" class="status${S.statusErr?" err":""}">${esc(S.status)}</span></div>
    </form></section>
  <section class="panel" style="margin-top:20px;padding:14px"><div id="finBody">${payrollBody()}</div></section>`;
}
function prevMonth(m){const ms=fyMonths();const i=ms.indexOf(m);if(i>0)return ms[i-1];const d=dateOf(m+"-01");d.setMonth(d.getMonth()-1);return isoOf(d).slice(0,7)}
function payrollBody(){
  const m=curFm(),rs=frows("pay",m).sort((a,b)=>(a.order??0)-(b.order??0)||String(a.name).localeCompare(String(b.name),"km"));
  const prev=frows("pay",prevMonth(m));
  const ed=S.fin.edit&&S.fin.edit.row&&S.fin.edit.row.id;
  const T=k=>sumBy(rs,r=>n2(r[k]));
  return `<div class="row" style="margin-bottom:10px"><div><h2 style="margin:0">តារាងបើកប្រាក់ខែ ${esc(monthLabel(m))}</h2><div class="hint">${toKh(rs.length)} នាក់ · ប្រាក់ខែសរុបគិតជាចំណាយ</div></div><span class="spacer"></span>
    ${!rs.length&&prev.length?`<button class="btn primary" id="pCopy" ${finDis()}>ចម្លងបុគ្គលិក ${toKh(prev.length)} នាក់ពី${esc(monthLabel(prevMonth(m)))}</button>`:""}
    <button class="btn" id="pExp">ទាញយក Excel</button></div>
    ${rs.length?`<div class="gridwrap"><table class="ftab"><thead><tr><th>ល.រ</th><th class="l">ឈ្មោះបុគ្គលិក</th><th class="l">តួនាទី</th>${PAYF.slice(0,3).map(([,l])=>`<th class="r">${l}</th>`).join("")}<th class="r">ប្រាក់ខែសរុប</th>${PAYF.slice(3).map(([,l])=>`<th class="r">${l}</th>`).join("")}<th class="r">ទទួលបានសុទ្ធ</th><th>វិធីបើក</th><th></th></tr></thead><tbody>
    ${rs.map((r,i)=>`<tr data-id="${esc(r.id)}" class="${r.id===ed?"editing":""}"><td>${i+1}</td><td class="l"><b>${esc(r.name)}</b></td><td class="l muted">${esc(r.role||"")}</td>${PAYF.slice(0,3).map(([k])=>`<td class="r num">${n2(r[k])?usd(n2(r[k])):"–"}</td>`).join("")}<td class="r num"><b>${usd(gross(r))}</b></td>${PAYF.slice(3).map(([k])=>`<td class="r num">${n2(r[k])?usd(n2(r[k])):"–"}</td>`).join("")}<td class="r num"><b style="color:var(--gA)">${usd(net(r))}</b></td><td><span class="chip ${r.method===BANK?"E":"N"}">${esc(r.method||"?")}</span></td>
      <td class="acts"><button class="btn sm" data-a="edit" ${finDis()}>កែ</button><button class="btn sm danger" data-a="del" ${finDis()}>លុប</button></td></tr>`).join("")}
    </tbody><tfoot><tr><td></td><td class="l"><b>សរុប</b></td><td></td>${PAYF.slice(0,3).map(([k])=>`<td class="r num">${usd(T(k))}</td>`).join("")}<td class="r num"><b>${usd(sumBy(rs,gross))}</b></td>${PAYF.slice(3).map(([k])=>`<td class="r num">${usd(T(k))}</td>`).join("")}<td class="r num"><b>${usd(sumBy(rs,net))}</b></td><td></td><td></td></tr></tfoot></table></div>`
    :`<div class="empty" style="padding:24px"><p>មិនទាន់មានប្រាក់ខែក្នុង${esc(monthLabel(m))}ទេ។${prev.length?" ចុច «ចម្លង…» ដើម្បីយកបញ្ជីបុគ្គលិកពីខែមុន ហើយកែតែអ្វីដែលប្ដូរ។":""}</p></div>`}`;
}
function bindPayroll(){
  const c=$("#pCancel");if(c)c.onclick=()=>{S.fin.edit=null;render()};
  const nm=$("#pName");nm.addEventListener("change",()=>{ // fill from this person's latest month
    if(S.fin.edit)return;let last=null;fyMonths().forEach(mm=>frows("pay",mm).forEach(r=>{if(sameName(r.name,nm.value))last=r}));if(!last)return;
    $("#pRole").innerHTML=opts(finSettings().lists.roles,last.role,"—");PAYF.forEach(([k])=>{if(!$("#p_"+k).value&&n2(last[k]))$("#p_"+k).value=last[k]});$("#pMeth").value=last.method||BANK});
  $("#fPay").addEventListener("submit",e=>{e.preventDefault();const m=curFm();
    const row={name:$("#pName").value.trim(),role:$("#pRole").value,method:$("#pMeth").value};
    for(const [k] of PAYF){const v=$("#p_"+k).value.trim();if(v===""){row[k]=0;continue}const x=parseScore10(v);if(x==null){toast("ចំនួនទឹកប្រាក់មិនត្រឹមត្រូវ");$("#p_"+k).focus();return}row[k]=x}
    if(!row.name)return;
    const old=S.fin.edit&&S.fin.edit.kind==="pay"?S.fin.edit.row:null;const id=old?old.id:"p"+uid();
    if(!old)row.order=frows("pay",m).length;else row.order=old.order??0;
    finPatch(`fin/pay_${m}`,{rows:{[id]:row}});toast((old?"បានកែ ":"បានបន្ថែម ")+row.name);S.fin.edit=null;render()});
  bindPayrollBody();
}
function bindPayrollBody(){
  const m=curFm();
  const cp=$("#pCopy");if(cp)cp.onclick=()=>{const prev=frows("pay",prevMonth(m));const rows={};prev.forEach((r,i)=>{const {id,...rest}=r;rows["p"+uid()+i]={...rest,order:i}});finPatch(`fin/pay_${m}`,{rows});toast(`បានចម្លង ${prev.length} នាក់`);$("#finBody").innerHTML=payrollBody();bindPayrollBody()};
  const ex=$("#pExp");if(ex)ex.onclick=()=>exportPayroll();
  const tb=document.querySelector("#finBody tbody");if(!tb)return;
  tb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.closest("tr").dataset.id;const r=frows("pay",m).find(x=>x.id===id);if(!r)return;
    if(b.dataset.a==="edit"){S.fin.edit={kind:"pay",row:r};render();setTimeout(()=>{const el=$("#finForm");if(el)el.scrollIntoView({block:"start"})},30);return}
    arm(b,"ប្រាកដ?",()=>{finPatch(`fin/pay_${m}`,{rows:{[id]:null}});$("#finBody").innerHTML=payrollBody();bindPayrollBody()})});
}
async function exportPayroll(){
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  const m=curFm(),rs=frows("pay",m).sort((a,b)=>(a.order??0)-(b.order??0));
  const aoa=[[`តារាងបើកប្រាក់ខែ ${monthLabel(m)}`],[],["ល.រ","ឈ្មោះបុគ្គលិក","តួនាទី",...PAYF.slice(0,3).map(x=>x[1]+" ($)"),"ប្រាក់ខែសរុប ($)",...PAYF.slice(3).map(x=>x[1]+" ($)"),"ទទួលបានសុទ្ធ ($)","វិធីបើកប្រាក់","ហត្ថលេខា"]];
  rs.forEach((r,i)=>aoa.push([i+1,r.name,r.role||"",...PAYF.slice(0,3).map(([k])=>n2(r[k])),gross(r),...PAYF.slice(3).map(([k])=>n2(r[k])),net(r),r.method||"",""]));
  aoa.push([],["","សរុប","",...PAYF.slice(0,3).map(([k])=>sumBy(rs,r=>n2(r[k]))),sumBy(rs,gross),...PAYF.slice(3).map(([k])=>sumBy(rs,r=>n2(r[k]))),sumBy(rs,net)]);
  const ws=X.utils.aoa_to_sheet(aoa);ws["!cols"]=[{wch:5},{wch:24},{wch:18},...Array(8).fill({wch:13}),{wch:12},{wch:16}];
  const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,"ប្រាក់ខែ");
  const fn=`ប្រាក់ខែ-${monthLabel(m)}.xlsx`;if(await saveFile(fn,new Uint8Array(X.write(wb,{type:"array",bookType:"xlsx"}))))toast("បានទាញយក "+fn);
}

/* ---------- tuition tracking and debtors ---------- */
function viewFees(){
  const L=finSettings().lists,dis=finDis();
  const e=S.fin.edit&&S.fin.edit.kind==="fee"?S.fin.edit.row:null;
  return `<section class="panel finform" id="finForm">
    <h2>${e?"កែព័ត៌មានសិស្ស":"បន្ថែមសិស្សក្នុងបញ្ជីបង់ថ្លៃសិក្សា"}</h2>
    <p class="sub">ការបង់ប្រាក់ប្រចាំខែ ទាញពីផ្ទាំង «ចំណូល» ដោយស្វ័យប្រវត្តិ (ប្រភេទ «ថ្លៃសិក្សា…» ហើយឈ្មោះអ្នកបង់ត្រូវដូចឈ្មោះសិស្ស)។</p>
    <form id="fFee" class="fgrid">
      <div class="field wide"><label for="fName">ឈ្មោះសិស្ស</label><input class="inp" id="fName" value="${esc(e?e.name:"")}" required ${dis}></div>
      <div class="field"><label for="fCls">ថ្នាក់</label><select class="inp" id="fCls" ${dis}>${opts(L.classes,e?e.cls:"","—")}</select></div>
      <div class="field"><label for="fProg">កម្មវិធីសិក្សា</label><select class="inp" id="fProg" ${dis}>${opts(L.programs,e?e.program:"","—")}</select></div>
      <div class="field"><label for="fFeeAmt">ថ្លៃសិក្សា / ខែ ($)</label><input class="inp num" id="fFeeAmt" inputmode="decimal" value="${e?esc(e.fee):""}" required ${dis}></div>
      <div class="field"><label for="fDisc">បញ្ចុះតម្លៃ ($)</label><input class="inp num" id="fDisc" inputmode="decimal" value="${e&&e.discount?esc(e.discount):""}" ${dis}></div>
      <div class="field"><label for="fPhone">ទូរស័ព្ទអាណាព្យាបាល</label><input class="inp" id="fPhone" inputmode="tel" value="${esc(e?e.phone||"":"")}" ${dis}></div>
      <div class="fbtns"><button class="btn primary" ${dis}>${e?"រក្សាទុកការកែ":"បន្ថែម"}</button>${e?`<button type="button" class="btn" id="fCancel">បោះបង់</button>`:""}<span id="saveStatus" class="status${S.statusErr?" err":""}">${esc(S.status)}</span></div>
    </form></section>
  <section class="panel" style="margin-top:20px;padding:14px"><div id="finBody">${feesBody()}</div></section>`;
}
function feesBody(){
  const m=curFm(),ms=fyMonths(),fl=fees();const ed=S.fin.edit&&S.fin.edit.row&&S.fin.edit.row.id;
  const rows=fl.map(f=>{const due=Math.max(0,n2(f.fee)-n2(f.discount)),paid=feePaid(f.name,m);return {f,due,paid,owe:Math.max(0,due-paid)}});
  const st=x=>x.owe<=0.005?["P","បង់រួច"]:x.paid>0?["L","បង់ខ្លះ"]:["A","មិនទាន់បង់"];
  const due=sumBy(rows,x=>x.due),col=sumBy(rows,x=>Math.min(x.paid,x.due)),owe=sumBy(rows,x=>x.owe),nd=rows.filter(x=>x.owe>0.005).length;
  const shown=S.fin.onlyDebt?rows.filter(x=>x.owe>0.005):rows;
  const head=`<div class="row" style="margin-bottom:10px"><div><h2 style="margin:0">ថ្លៃសិក្សា ${esc(monthLabel(m))}</h2><div class="hint">សិស្ស ${toKh(fl.length)} នាក់</div></div><span class="spacer"></span>
    <div class="seg"><button data-fv="month" class="P" aria-pressed="${S.fin.feeView==="month"}">ខែនេះ</button><button data-fv="year" class="P" aria-pressed="${S.fin.feeView==="year"}">ពេញមួយឆ្នាំ</button></div>
    <label class="row" style="gap:6px"><input type="checkbox" id="fOnly" ${S.fin.onlyDebt?"checked":""}> តែអ្នកជំពាក់</label>
    <button class="btn" id="fExp">ទាញយកបញ្ជីជំពាក់</button><button class="btn" data-go2="fin_debt">មើលតារាងសិស្សជំពាក់ →</button></div>
    <div class="chips" style="margin-bottom:10px"><span class="chip N">ត្រូវប្រមូល ${usd(due)}</span><span class="chip P">ប្រមូលបាន ${usd(col)} (${due?Math.round(col/due*100):0}%)</span><span class="chip A">នៅជំពាក់ ${usd(owe)} · ${toKh(nd)} នាក់</span></div>`;
  if(!fl.length)return head+`<div class="empty" style="padding:24px"><p>មិនទាន់មានសិស្សក្នុងបញ្ជីទេ។ បន្ថែមខាងលើ ឬនាំចូលពី Excel នៅ «ការកំណត់ហិរញ្ញវត្ថុ»។</p></div>`;
  if(S.fin.feeView==="year"){
    return head+`<div class="gridwrap"><table class="ftab"><thead><tr><th class="l">ឈ្មោះសិស្ស</th><th>ថ្នាក់</th><th class="r">ត្រូវបង់/ខែ</th>${ms.map(mm=>`<th class="r">${KH_MONTHS[+mm.slice(5)-1]}</th>`).join("")}<th class="r">សរុប</th></tr></thead><tbody>
      ${shown.map(x=>{const per=ms.map(mm=>feePaid(x.f.name,mm));return `<tr><td class="l"><b>${esc(x.f.name)}</b></td><td>${esc(x.f.cls||"")}</td><td class="r num">${usd(x.due)}</td>${per.map((p,i)=>{const fut=ms[i]>isoOf(new Date()).slice(0,7);const c=p>=x.due-0.005&&x.due>0?"ok":p>0?"part":fut?"":"none";return `<td class="r num pm ${c}">${p?usd(p):fut?"":"–"}</td>`}).join("")}<td class="r num"><b>${usd(sumBy(per,p=>p))}</b></td></tr>`}).join("")}
    </tbody></table></div><p class="hint">បៃតង = បង់គ្រប់ · លឿង = បង់ខ្លះ · ក្រហម = មិនទាន់បង់</p>`;
  }
  return head+`<div class="gridwrap"><table class="ftab"><thead><tr><th>ល.រ</th><th class="l">ឈ្មោះសិស្ស</th><th>ថ្នាក់</th><th>កម្មវិធី</th><th class="r">ថ្លៃ/ខែ</th><th class="r">បញ្ចុះ</th><th class="r">ត្រូវបង់</th><th class="r">បានបង់</th><th class="r">នៅជំពាក់</th><th>ស្ថានភាព</th><th>ទូរស័ព្ទ</th><th></th></tr></thead><tbody>
    ${shown.map((x,i)=>{const s=st(x);return `<tr data-id="${esc(x.f.id)}" class="${x.f.id===ed?"editing":""}"><td>${i+1}</td><td class="l"><b>${esc(x.f.name)}</b></td><td>${esc(x.f.cls||"")}</td><td class="muted">${esc(x.f.program||"")}</td><td class="r num">${usd(n2(x.f.fee))}</td><td class="r num">${n2(x.f.discount)?usd(n2(x.f.discount)):"–"}</td><td class="r num">${usd(x.due)}</td><td class="r num">${x.paid?usd(x.paid):"–"}</td><td class="r num" style="${x.owe>0.005?"color:var(--gE);font-weight:700":""}">${x.owe>0.005?usd(x.owe):"–"}</td><td><span class="chip ${s[0]}">${s[1]}</span></td><td class="num">${esc(x.f.phone||"")}</td>
      <td class="acts"><button class="btn sm" data-a="pay" ${finDis()} ${x.owe>0.005?"":"disabled"} title="កត់ត្រាការបង់">បង់</button><button class="btn sm" data-a="edit" ${finDis()}>កែ</button><button class="btn sm danger" data-a="del" ${finDis()}>លុប</button></td></tr>`}).join("")}
  </tbody></table></div>`;
}
function bindFees(){
  const c=$("#fCancel");if(c)c.onclick=()=>{S.fin.edit=null;render()};
  $("#fFee").addEventListener("submit",e=>{e.preventDefault();
    const fee=parseScore10($("#fFeeAmt").value),disc=parseScore10($("#fDisc").value)||0;if(fee==null){toast("ថ្លៃសិក្សាមិនត្រឹមត្រូវ");return}
    const old=S.fin.edit&&S.fin.edit.kind==="fee"?S.fin.edit.row:null;const id=old?old.id:"f"+uid();
    const row={name:$("#fName").value.trim(),cls:$("#fCls").value,program:$("#fProg").value,fee,discount:disc,phone:$("#fPhone").value.trim(),order:old?old.order??0:fees().length};
    if(!row.name)return;finPatch("fin/fees",{rows:{[id]:row}});toast((old?"បានកែ ":"បានបន្ថែម ")+row.name);S.fin.edit=null;render()});
  bindFeesBody();
}
function bindFeesBody(){
  document.querySelectorAll("[data-fv]").forEach(b=>b.onclick=()=>{S.fin.feeView=b.dataset.fv;$("#finBody").innerHTML=feesBody();bindFeesBody()});
  const o=$("#fOnly");if(o)o.onchange=()=>{S.fin.onlyDebt=o.checked;$("#finBody").innerHTML=feesBody();bindFeesBody()};
  const ex=$("#fExp");if(ex)ex.onclick=exportDebtors;
  document.querySelectorAll("[data-go2]").forEach(b=>b.onclick=()=>goTab(b.dataset.go2));
  const tb=document.querySelector("#finBody tbody");if(!tb)return;
  tb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const tr=b.closest("tr");if(!tr||!tr.dataset.id)return;const id=tr.dataset.id;const f=fees().find(x=>x.id===id);if(!f)return;
    if(b.dataset.a==="edit"){S.fin.edit={kind:"fee",row:f};render();setTimeout(()=>{const el=$("#finForm");if(el)el.scrollIntoView({block:"start"})},30);return}
    if(b.dataset.a==="pay"){payFor(f);return}
    arm(b,"ប្រាកដ?",()=>{finPatch("fin/fees",{rows:{[id]:null}});$("#finBody").innerHTML=feesBody();bindFeesBody()})});
}
function payFor(f){ // jump to the income form, prefilled for this student
  const due=Math.max(0,n2(f.fee)-n2(f.discount)),owe=Math.max(0,due-feePaid(f.name,curFm()));
  const L=finSettings().lists;const cat=L.inCats.find(c=>isTuition(c)&&f.program&&c.includes(f.program))||L.inCats.find(isTuition)||"";
  const today=isoOf(new Date());S.fin.edit=null;S.tab="fin_in";S.fin.tab="fin_in";saveUI();render();
  $("#lDate").value=today.slice(0,7)===curFm()?today:`${curFm()}-01`;$("#lParty").value=f.name;if($("#lCls"))$("#lCls").innerHTML=opts(L.classes,f.cls,"—");$("#lCat").value=cat;$("#lDesc").value=`ថ្លៃសិក្សា${monthLabel(curFm())}`;$("#lAmt").value=owe;$("#lAmt").focus();
}
/* ---------- debtors (students who have not paid, or paid part) ---------- */
S.fin.dcls="";S.fin.dq="";
function debtorRows(m){
  const ms=fyMonths();const upto=ms.slice(0,ms.indexOf(m)+1);
  return fees().map(f=>{const due=Math.max(0,n2(f.fee)-n2(f.discount)),paid=feePaid(f.name,m);
    const back=upto.slice(0,-1).reduce((a,mm)=>a+Math.max(0,due-feePaid(f.name,mm)),0);
    return {f,due,paid,owe:Math.max(0,due-paid),back}}).filter(x=>x.owe>0.005);
}
function debtorsPage(m,rows){
  const st=finSettings();const tot=sumBy(rows,x=>x.owe),back=sumBy(rows,x=>x.back);
  return pageHTML(`${sheetHeader()}
    <h1 class="ss-title">បញ្ជីសិស្សជំពាក់ថ្លៃសិក្សា</h1>
    <div class="ss-sub">ប្រចាំ${esc(monthLabel(m))}${S.fin.dcls?" · "+esc(S.fin.dcls):""}</div>
    <table class="fr"><thead><tr><th>ល.រ</th><th class="l">ឈ្មោះសិស្ស</th><th class="l">ថ្នាក់</th><th>ត្រូវបង់ ($)</th><th>បានបង់ ($)</th><th>នៅជំពាក់ ($)</th><th>ជំពាក់ខែមុនៗ ($)</th><th class="l">ស្ថានភាព</th><th class="l">ទូរស័ព្ទអាណាព្យាបាល</th></tr></thead><tbody>
      ${rows.map((x,i)=>`<tr><td>${toKh(i+1)}</td><td class="l"><b>${esc(x.f.name)}</b></td><td class="l">${esc(x.f.cls||"")}</td><td>${usd(x.due)}</td><td>${x.paid?usd(x.paid):"–"}</td><td class="neg"><b>${usd(x.owe)}</b></td><td>${x.back?usd(x.back):"–"}</td><td class="l">${x.paid>0?"បង់ខ្លះ":"មិនទាន់បង់"}</td><td class="l">${esc(x.f.phone||"")}</td></tr>`).join("")||`<tr><td colspan="9" class="l">គ្មានសិស្សជំពាក់ទេ</td></tr>`}
      <tr class="tot"><td></td><td class="l">សរុប ${toKh(rows.length)} នាក់</td><td></td><td>${usd(sumBy(rows,x=>x.due))}</td><td>${usd(sumBy(rows,x=>x.paid))}</td><td class="neg">${usd(tot)}</td><td>${usd(back)}</td><td class="l" colspan="2">${riel(tot)}</td></tr>
    </tbody></table>
    <div class="fr-signs"><div><div>រៀបចំដោយ</div><div class="sp"></div><div class="nm">${esc(st.prepared)||"……………………"}</div></div><div></div>
      <div><div>ធ្វើនៅ${esc(todayKh())}</div><div>អនុម័តដោយ</div><div class="sp"></div><div class="nm">${esc(st.approved)||"……………………"}</div></div></div>`,742);
}
function viewDebtors(){
  const m=curFm(),L=finSettings().lists;
  const all=debtorRows(m);
  return `<div class="stats" id="dStats"></div>
   <section class="panel" style="margin-top:20px;padding:14px">
    <div class="row" style="margin-bottom:10px"><div><h2 style="margin:0">សិស្សជំពាក់ ${esc(monthLabel(m))}</h2><div class="hint">គណនាពីបញ្ជី «ថ្លៃសិក្សា» និងការបង់នៅផ្ទាំង «ចំណូល»</div></div><span class="spacer"></span>
      <select class="inp" id="dCls"><option value="">គ្រប់ថ្នាក់</option>${[...new Set(fees().map(f=>f.cls).filter(Boolean))].map(c=>`<option${c===S.fin.dcls?" selected":""}>${esc(c)}</option>`).join("")}</select>
      <input class="inp" id="dQ" placeholder="ស្វែងរកឈ្មោះ…" value="${esc(S.fin.dq)}" style="width:170px">
      <button class="btn" id="dPdf">PDF</button><button class="btn" id="dJpg">JPG</button><button class="btn primary" id="dXls">ទាញយក Excel</button></div>
    <div id="finBody">${debtorsBody()}</div>
   </section>`;
}
function debtorsFiltered(){const m=curFm();return debtorRows(m).filter(x=>(!S.fin.dcls||x.f.cls===S.fin.dcls)&&(!S.fin.dq||x.f.name.includes(S.fin.dq.trim())))}
function debtorsBody(){
  const rows=debtorsFiltered(),fl=fees();
  const tot=sumBy(rows,x=>x.owe);
  const statsEl=$("#dStats");
  const stats=`<div class="stat"><div class="k">សិស្សជំពាក់</div><div class="v num" style="color:${rows.length?"var(--gE)":"inherit"}">${toKh(rows.length)} នាក់</div><div class="s">ក្នុងចំណោម ${toKh(fl.length)} នាក់</div></div>
    <div class="stat"><div class="k">ទឹកប្រាក់ជំពាក់ខែនេះ</div><div class="v num" style="color:var(--gE)">${usd(tot)}</div><div class="s">${riel(tot)}</div></div>
    <div class="stat"><div class="k">មិនទាន់បង់សោះ</div><div class="v num">${toKh(rows.filter(x=>!x.paid).length)} នាក់</div><div class="s">បង់ខ្លះ ${toKh(rows.filter(x=>x.paid>0).length)} នាក់</div></div>
    <div class="stat"><div class="k">ជំពាក់ពីខែមុនៗ</div><div class="v num">${usd(sumBy(rows,x=>x.back))}</div><div class="s">តាំងពីដើមឆ្នាំសិក្សា</div></div>`;
  if(statsEl)statsEl.innerHTML=stats;else setTimeout(()=>{const e=$("#dStats");if(e)e.innerHTML=stats});
  if(!fl.length)return `<div class="empty" style="padding:24px"><p>មិនទាន់មានបញ្ជីសិស្សបង់ថ្លៃសិក្សាទេ។ បន្ថែមនៅផ្ទាំង «ថ្លៃសិក្សា»។</p></div>`;
  if(!rows.length)return `<div class="empty" style="padding:24px"><h2 style="color:var(--gA)">គ្មានសិស្សជំពាក់ទេ</h2><p>សិស្សទាំងអស់បានបង់ថ្លៃសិក្សា${esc(monthLabel(curFm()))}រួចហើយ។</p></div>`;
  return `<div class="gridwrap"><table class="ftab"><thead><tr><th>ល.រ</th><th class="l">ឈ្មោះសិស្ស</th><th>ថ្នាក់</th><th>កម្មវិធី</th><th class="r">ត្រូវបង់</th><th class="r">បានបង់</th><th class="r">នៅជំពាក់</th><th class="r">ជំពាក់ខែមុនៗ</th><th>ស្ថានភាព</th><th>ទូរស័ព្ទអាណាព្យាបាល</th><th></th></tr></thead><tbody>
    ${rows.map((x,i)=>`<tr data-id="${esc(x.f.id)}"><td>${i+1}</td><td class="l"><b>${esc(x.f.name)}</b></td><td>${esc(x.f.cls||"")}</td><td class="muted">${esc(x.f.program||"")}</td><td class="r num">${usd(x.due)}</td><td class="r num">${x.paid?usd(x.paid):"–"}</td><td class="r num" style="color:var(--gE);font-weight:700">${usd(x.owe)}</td><td class="r num">${x.back?usd(x.back):"–"}</td>
      <td><span class="chip ${x.paid>0?"L":"A"}">${x.paid>0?"បង់ខ្លះ":"មិនទាន់បង់"}</span></td><td class="num">${x.f.phone?`<span class="phone">${esc(x.f.phone)}</span> <button class="btn sm" data-a="copy" title="ចម្លងលេខ">ចម្លង</button>`:`<span class="hint">គ្មានលេខ</span>`}</td>
      <td class="acts"><button class="btn sm primary" data-a="pay" ${finDis()}>កត់ត្រាការបង់</button></td></tr>`).join("")}
    </tbody><tfoot><tr><td></td><td class="l">សរុប</td><td></td><td></td><td class="r num">${usd(sumBy(rows,x=>x.due))}</td><td class="r num">${usd(sumBy(rows,x=>x.paid))}</td><td class="r num" style="color:var(--gE)">${usd(tot)}</td><td class="r num">${usd(sumBy(rows,x=>x.back))}</td><td></td><td></td><td></td></tr></tfoot></table></div>`;
}
function bindDebtors(){
  const redraw=()=>{$("#finBody").innerHTML=debtorsBody();bindDebtorsBody()};
  $("#dCls").onchange=e=>{S.fin.dcls=e.target.value;redraw()};
  $("#dQ").oninput=e=>{S.fin.dq=e.target.value;clearTimeout(bindDebtors.t);bindDebtors.t=setTimeout(redraw,200)};
  const go=async k=>{await ensureLogo();exportDoc([()=>debtorsPage(curFm(),debtorsFiltered())],`សិស្សជំពាក់-${monthLabel(curFm())}`,k)};
  $("#dPdf").onclick=()=>go("pdf");$("#dJpg").onclick=()=>go("jpg");$("#dXls").onclick=exportDebtors;
  bindDebtorsBody();
}
function bindDebtorsBody(){
  const tb=document.querySelector("#finBody tbody");if(!tb)return;
  tb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.closest("tr").dataset.id;const f=fees().find(x=>x.id===id);if(!f)return;
    if(b.dataset.a==="pay")payFor(f);
    if(b.dataset.a==="copy"){const t=f.phone;Promise.resolve().then(()=>navigator.clipboard.writeText(t)).then(()=>toast("បានចម្លង "+t)).catch(()=>{const r=document.createRange();r.selectNodeContents(b.previousElementSibling);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);toast("សូមចម្លងលេខដែលបានជ្រើស")})}});
}
async function exportDebtors(){
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  const m=curFm();const rows=S.tab==="fin_debt"?debtorsFiltered():debtorRows(m);
  const aoa=[[`បញ្ជីសិស្សជំពាក់ថ្លៃសិក្សា ${monthLabel(m)}`],[],["ល.រ","ឈ្មោះសិស្ស","ថ្នាក់","កម្មវិធីសិក្សា","ត្រូវបង់ ($)","បានបង់ ($)","នៅជំពាក់ ($)","ជំពាក់ខែមុនៗ ($)","ស្ថានភាព","ទូរស័ព្ទអាណាព្យាបាល"]];
  rows.forEach((x,i)=>aoa.push([i+1,x.f.name,x.f.cls||"",x.f.program||"",x.due,x.paid,x.owe,x.back,x.paid>0?"បង់ខ្លះ":"មិនទាន់បង់",x.f.phone||""]));
  aoa.push([],["","សរុប","","",sumBy(rows,x=>x.due),sumBy(rows,x=>x.paid),sumBy(rows,x=>x.owe),sumBy(rows,x=>x.back)]);
  const ws=X.utils.aoa_to_sheet(aoa);ws["!cols"]=[{wch:5},{wch:26},{wch:16},{wch:16},{wch:12},{wch:12},{wch:12},{wch:14},{wch:12},{wch:18}];
  const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,"សិស្សជំពាក់");
  const fn=`សិស្សជំពាក់-${monthLabel(m)}.xlsx`;if(await saveFile(fn,new Uint8Array(X.write(wb,{type:"array",bookType:"xlsx"}))))toast("បានទាញយក "+fn);
}

/* ---------- year summary ---------- */
function finChart(ys){
  const W=760,H=230,pl=56,pr=12,pt=14,pb=34;const iw=W-pl-pr,ih=H-pt-pb;
  const mx=Math.max(1,...ys.map(s=>Math.max(s.inT,s.totalOut)));
  const step=Math.pow(10,Math.floor(Math.log10(mx)));const top=Math.ceil(mx/step)*step;
  const y=v=>pt+ih-v/top*ih;const bw=iw/12;
  const ticks=[0,.25,.5,.75,1].map(t=>t*top);
  return `<svg viewBox="0 0 ${W} ${H}" class="fchart" role="img" aria-label="ចំណូល និងចំណាយប្រចាំខែ">
    ${ticks.map(t=>`<line x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${pl-6}" y="${y(t)+4}" text-anchor="end" class="ax">$${Math.round(t).toLocaleString("en-US")}</text>`).join("")}
    ${ys.map((s,i)=>{const x0=pl+i*bw+bw*.16,w=bw*.32;return `<rect x="${x0}" y="${y(s.inT)}" width="${w}" height="${Math.max(0,ih-(y(s.inT)-pt))}" class="bin"><title>${monthLabel(s.m)} ចំណូល ${usd(s.inT)}</title></rect>
      <rect x="${x0+w+2}" y="${y(s.totalOut)}" width="${w}" height="${Math.max(0,ih-(y(s.totalOut)-pt))}" class="bout"><title>${monthLabel(s.m)} ចំណាយ ${usd(s.totalOut)}</title></rect>
      <text x="${pl+i*bw+bw/2}" y="${H-12}" text-anchor="middle" class="ax">${KH_MONTHS[+s.m.slice(5)-1]}</text>`}).join("")}
  </svg>`;
}
function viewFinYear(){
  const L=finSettings().lists,ys=yearStats();
  const row=(lab,f,cls="")=>`<tr class="${cls}"><td class="l">${lab}</td>${ys.map(s=>{const v=f(s);return `<td class="r num${v<0?" neg":""}">${v?usd(v):"–"}</td>`}).join("")}<td class="r num"><b>${usd(sumBy(ys,f))}</b></td></tr>`;
  const bal=(lab,f)=>`<tr><td class="l">${lab}</td>${ys.map(s=>`<td class="r num">${usd(f(s))}</td>`).join("")}<td></td></tr>`;
  const tI=sumBy(ys,s=>s.inT),tO=sumBy(ys,s=>s.totalOut);
  return `<div class="stats"><div class="stat"><div class="k">ចំណូលពេញឆ្នាំ</div><div class="v num" style="color:var(--gA)">${usd(tI)}</div><div class="s">${riel(tI)}</div></div>
    <div class="stat"><div class="k">ចំណាយពេញឆ្នាំ</div><div class="v num" style="color:var(--gE)">${usd(tO)}</div><div class="s">${riel(tO)}</div></div>
    <div class="stat"><div class="k">${tI-tO>=0?"ចំណេញ":"ខាត"}ពេញឆ្នាំ</div><div class="v num">${usd(tI-tO)}</div><div class="s">${tI?Math.round((tI-tO)/tI*100)+"% នៃចំណូល":"–"}</div></div>
    <div class="stat"><div class="k">សមតុល្យចុងឆ្នាំ</div><div class="v num">${usd(ys[11].closeCash+ys[11].closeBank)}</div><div class="s">ដៃ ${usd(ys[11].closeCash)} · ធនាគារ ${usd(ys[11].closeBank)}</div></div></div>
  <section class="panel" style="margin-top:20px"><div class="row"><h2 style="margin:0">ចំណូល និងចំណាយប្រចាំខែ</h2><span class="spacer"></span><span class="chip P">■ ចំណូល</span><span class="chip A">■ ចំណាយ</span></div><div class="gridwrap" style="border:0;margin-top:8px">${finChart(ys)}</div></section>
  <section class="panel" style="margin-top:20px;padding:14px"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">សង្ខេបប្រចាំឆ្នាំសិក្សា ${toKh(fy())}-${toKh(fy()+1)}</h2><span class="spacer"></span><button class="btn" id="yExp">ទាញយក Excel</button></div>
  <div class="gridwrap"><table class="ftab ysum"><thead><tr><th class="l"></th>${ys.map(s=>`<th class="r">${KH_MONTHS[+s.m.slice(5)-1]}</th>`).join("")}<th class="r">សរុប</th></tr></thead><tbody>
    <tr class="sec"><td class="l" colspan="14">១. ចំណូល</td></tr>
    ${L.inCats.map(c=>row(esc(c),s=>s.I.o[c]||0)).join("")}${ys.some(s=>s.I.other)?row("មិនទាន់ចាត់ប្រភេទ",s=>s.I.other):""}${row("<b>ចំណូលសរុប</b>",s=>s.inT,"tot")}
    <tr class="sec"><td class="l" colspan="14">២. ចំណាយ</td></tr>
    ${row("ប្រាក់ខែបុគ្គលិក និងគ្រូ",s=>s.payT)}${L.outCats.map(c=>row(esc(c),s=>s.E.o[c]||0)).join("")}${ys.some(s=>s.E.other)?row("មិនទាន់ចាត់ប្រភេទ",s=>s.E.other):""}${row("<b>ចំណាយសរុប</b>",s=>s.totalOut,"tot")}
    <tr class="sec"><td class="l" colspan="14">៣. លទ្ធផល និងសមតុល្យ</td></tr>
    ${row("<b>ចំណេញ / (ខាត)</b>",s=>s.net,"tot")}${bal("សាច់ប្រាក់ក្នុងដៃ ចុងខែ",s=>s.closeCash)}${bal("ធនាគារ ចុងខែ",s=>s.closeBank)}${bal("<b>សមតុល្យសរុប ចុងខែ</b>",s=>s.closeCash+s.closeBank)}
  </tbody></table></div></section>`;
}
function bindFinYear(){$("#yExp").onclick=exportYear}
async function exportYear(){
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  const L=finSettings().lists,ys=yearStats();const hdr=["",...ys.map(s=>monthLabel(s.m)),"សរុប"];
  const R=(lab,f,tot=true)=>[lab,...ys.map(f),tot?sumBy(ys,f):""];
  const aoa=[[`សង្ខេបហិរញ្ញវត្ថុ ឆ្នាំសិក្សា ${fy()}-${fy()+1}`],[],hdr,["១. ចំណូល"],...L.inCats.map(c=>R(c,s=>s.I.o[c]||0)),R("មិនទាន់ចាត់ប្រភេទ",s=>s.I.other),R("ចំណូលសរុប",s=>s.inT),[],
    ["២. ចំណាយ"],R("ប្រាក់ខែបុគ្គលិក និងគ្រូ",s=>s.payT),...L.outCats.map(c=>R(c,s=>s.E.o[c]||0)),R("មិនទាន់ចាត់ប្រភេទ",s=>s.E.other),R("ចំណាយសរុប",s=>s.totalOut),[],
    R("ចំណេញ / (ខាត)",s=>s.net),R("សាច់ប្រាក់ក្នុងដៃ ចុងខែ",s=>s.closeCash,false),R("ធនាគារ ចុងខែ",s=>s.closeBank,false)];
  const ws=X.utils.aoa_to_sheet(aoa);ws["!cols"]=[{wch:30},...Array(13).fill({wch:12})];
  const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,"សង្ខេបប្រចាំឆ្នាំ");
  const fn=`សង្ខេបហិរញ្ញវត្ថុ-${fy()}-${fy()+1}.xlsx`;if(await saveFile(fn,new Uint8Array(X.write(wb,{type:"array",bookType:"xlsx"}))))toast("បានទាញយក "+fn);
}

/* ---------- finance settings and Excel import ---------- */
function viewFinSettings(){
  const st=finSettings(),L=st.lists;const dis=(S.canWrite&&(S.canAdmin||isAcct()))?"":"disabled";
  const ta=(id,lab,arr,hint)=>`<div class="field"><label for="${id}">${lab}</label><textarea class="inp" id="${id}" rows="6" ${dis}>${esc(arr.join("\n"))}</textarea>${hint?`<span class="hint">${hint}</span>`:""}</div>`;
  return `<div class="two">
   <section class="panel"><h2>ការកំណត់ឆ្នាំសិក្សា</h2><p class="sub">បំពេញម្ដងនៅដើមឆ្នាំសិក្សា។</p>
    <form id="fFs" class="fgrid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
      <div class="field"><label for="sMon">ខែចាប់ផ្ដើមឆ្នាំសិក្សា</label><select class="inp" id="sMon" ${dis}>${KH_MONTHS.map((n,i)=>`<option value="${i+1}"${st.startMonth===i+1?" selected":""}>${n}</option>`).join("")}</select></div>
      <div class="field"><label for="sYear">ឆ្នាំនៃខែចាប់ផ្ដើម</label><input class="inp num" id="sYear" inputmode="numeric" value="${st.startYear}" ${dis}></div>
      <div class="field"><label for="sRate">អត្រាប្ដូរប្រាក់ (៛ / $1)</label><input class="inp num" id="sRate" inputmode="numeric" value="${st.rate}" ${dis}></div>
      <div class="field"><label for="sCash">សាច់ប្រាក់ក្នុងដៃ ដើមឆ្នាំ ($)</label><input class="inp num" id="sCash" inputmode="decimal" value="${st.openCash}" ${dis}></div>
      <div class="field"><label for="sBank">សមតុល្យធនាគារ ដើមឆ្នាំ ($)</label><input class="inp num" id="sBank" inputmode="decimal" value="${st.openBank}" ${dis}></div>
      <div class="field"><label for="sPrep">រៀបចំដោយ</label><input class="inp" id="sPrep" value="${esc(st.prepared)}" ${dis}></div>
      <div class="field"><label for="sRev">ពិនិត្យដោយ</label><input class="inp" id="sRev" value="${esc(st.reviewed)}" ${dis}></div>
      <div class="field"><label for="sApp">អនុម័តដោយ</label><input class="inp" id="sApp" value="${esc(st.approved)}" ${dis}></div>
      <div class="fbtns"><button class="btn primary" ${dis}>រក្សាទុក</button><span id="saveStatus" class="status${S.statusErr?" err":""}">${esc(S.status)}</span></div>
    </form>
    <h2 style="margin-top:22px">នាំចូលពី Excel</h2>
    <p class="sub">ជ្រើសឯកសារ Excel ហិរញ្ញវត្ថុរបស់សាលា (សន្លឹក ចំណូល ចំណាយ ប្រាក់ខែ តាមដានថ្លៃសិក្សា បញ្ជី ព័ត៌មានទូទៅ)។ នាំចូលឯកសារដដែលម្ដងទៀត នឹងមិនបង្កើតជួរស្ទួនទេ។</p>
    <button class="btn" id="finImp" ${dis}>ជ្រើសឯកសារ Excel</button><input type="file" id="finFile" accept=".xlsx,.xls" hidden>
   </section>
   <section class="panel"><h2>បញ្ជីជម្រើស</h2><p class="sub">មួយជួរ មួយជម្រើស។ វិធីបង់ប្រាក់មានពីរ៖ ${CASH} និង ${BANK}។</p>
    <form id="fLists" style="display:flex;flex-direction:column;gap:12px">
      ${ta("liIn","ប្រភេទចំណូល",L.inCats,"ប្រភេទដែលចាប់ផ្ដើមដោយ «ថ្លៃសិក្សា» រាប់ជាការបង់ថ្លៃសិក្សា")}
      ${ta("liOut","ប្រភេទចំណាយ",L.outCats)}
      ${ta("liCls","ថ្នាក់",L.classes)}
      <div class="two" style="gap:12px">${ta("liRole","តួនាទីបុគ្គលិក",L.roles)}${ta("liProg","កម្មវិធីសិក្សា",L.programs)}</div>
      <div><button class="btn primary" ${dis}>រក្សាទុកបញ្ជី</button></div>
    </form></section></div>`;
}
function bindFinSettings(){
  const save=patch=>{const d=clone(S.fin.docs.settings||{});Object.assign(d,patch);finSet("fin/settings",d)};
  $("#fFs").addEventListener("submit",e=>{e.preventDefault();
    const y=parseInt($("#sYear").value,10);if(!(y>2000&&y<2100)){toast("ឆ្នាំមិនត្រឹមត្រូវ");return}
    save({startMonth:+$("#sMon").value,startYear:y,rate:parseScore10($("#sRate").value)||4100,openCash:parseScore10($("#sCash").value)||0,openBank:parseScore10($("#sBank").value)||0,
      prepared:$("#sPrep").value.trim(),reviewed:$("#sRev").value.trim(),approved:$("#sApp").value.trim()});S.fin.year=y;toast("បានរក្សាទុក");renderFinPickers()});
  $("#fLists").addEventListener("submit",e=>{e.preventDefault();const lines=id=>[...new Set($("#"+id).value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];
    save({lists:{inCats:lines("liIn"),outCats:lines("liOut"),classes:lines("liCls"),roles:lines("liRole"),programs:lines("liProg")}});toast("បានរក្សាទុកបញ្ជី")});
  $("#finImp").onclick=()=>$("#finFile").click();
  $("#finFile").onchange=e=>{const f=e.target.files[0];e.target.value="";if(f)importFinance(f)};
}
function hashId(prefix,s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return prefix+(h>>>0).toString(36)}
async function importFinance(file){
  let X;try{X=await loadXLSX()}catch(e){toast("មិនអាចផ្ទុកកម្មវិធី Excel បានទេ");return}
  let wb;try{wb=X.read(await file.arrayBuffer(),{type:"array"})}catch(e){toast("អានឯកសារមិនបាន");return}
  const sheet=n=>wb.Sheets[n]?X.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:null}):null;
  const clean=v=>String(v??"").replace(/[​‌‍]/g,"").replace(/\s+/g," ").trim();
  const num=v=>{const x=typeof v==="number"?v:parseFloat(String(v??"").replace(/[^\d.\-]/g,""));return isFinite(x)?Math.round(x*100)/100:0};
  // Excel stores dates as day numbers; read them in UTC so no time zone can shift a day
  const dstr=v=>{if(typeof v==="number"&&v>20000&&v<80000){const d=new Date(Math.round(v)*864e5-25569*864e5);return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`}
    if(v instanceof Date&&!isNaN(v))return `${v.getFullYear()}-${pad2(v.getMonth()+1)}-${pad2(v.getDate())}`;
    const m=String(v||"").match(/(\d{1,4})[\/\-.](\d{1,2})[\/\-.](\d{1,4})/);if(!m)return null;let [a,b,c]=[+m[1],+m[2],+m[3]];return a>31?`${a}-${pad2(b)}-${pad2(c)}`:`${c<100?2000+c:c}-${pad2(b)}-${pad2(a)}`};
  const st=clone(S.fin.docs.settings||{});let found=0;
  const info=sheet("ព័ត៌មានទូទៅ");
  if(info){const get=lab=>{const r=info.find(r=>r&&clean(r[0]).startsWith(lab));return r?r[1]:null};
    const mn=clean(get("ខែចាប់ផ្តើម")||get("ខែចាប់ផ្ដើម"));const mi=KH_MONTHS.indexOf(mn);if(mi>=0)st.startMonth=mi+1;
    const y=num(get("ឆ្នាំនៃខែ"));if(y>2000)st.startYear=y;const r=num(get("អត្រាប្តូរប្រាក់")||get("អត្រាប្ដូរប្រាក់"));if(r)st.rate=r;
    st.openCash=num(get("សាច់ប្រាក់ក្នុងដៃ"));st.openBank=num(get("សមតុល្យធនាគារ"));
    const p=clean(get("រៀបចំដោយ")),rv=clean(get("ពិនិត្យដោយ")),ap=clean(get("អនុម័តដោយ"));if(p)st.prepared=p;if(rv)st.reviewed=rv;if(ap)st.approved=ap;found++}
  const lists=sheet("បញ្ជី");
  if(lists){const col=k=>lists.slice(2).map(r=>r&&clean(r[k])).filter(Boolean);const L=Object.assign(clone(FIN_DEFAULT.lists),st.lists||{});
    const set=(key,k)=>{const v=col(k);if(v.length)L[key]=[...new Set(v)]};set("inCats",0);set("outCats",1);set("classes",2);set("roles",4);set("programs",6);st.lists=L;found++}
  const buckets={};const put=(kind,date,id,row)=>{const k=`${kind}_${date.slice(0,7)}`;(buckets[k]=buckets[k]||{})[id]=row};
  let nIn=0,nOut=0,nPay=0,nFee=0;
  const inc=sheet("ចំណូល");
  if(inc){inc.slice(4).forEach((r,i)=>{if(!r)return;const d=dstr(r[1]);const a=num(r[8]);if(!d||!a)return;
    const row={date:d,ref:clean(r[2]),party:clean(r[3]),cls:clean(r[4]),cat:clean(r[5]),desc:clean(r[6]),method:clean(r[7]),amount:a};
    put("in",d,hashId("i",[d,row.ref,row.party,row.cat,a,i].join("|")),row);nIn++});found++}
  const out=sheet("ចំណាយ");
  if(out){out.slice(4).forEach((r,i)=>{if(!r)return;const d=dstr(r[1]);const a=num(r[7]);if(!d||!a)return;
    const row={date:d,ref:clean(r[2]),party:clean(r[3]),cat:clean(r[4]),desc:clean(r[5]),method:clean(r[6]),amount:a};
    put("out",d,hashId("o",[d,row.ref,row.party,row.cat,a,i].join("|")),row);nOut++});found++}
  const sm=st.startMonth||finSettings().startMonth,sy=st.startYear||finSettings().startYear;
  const monthKey=name=>{const i=KH_MONTHS.indexOf(clean(name));if(i<0)return null;const m=i+1;return `${m>=sm?sy:sy+1}-${pad2(m)}`};
  const pay=sheet("ប្រាក់ខែ");
  if(pay){pay.slice(4).forEach((r,i)=>{if(!r||!clean(r[2]))return;const mk=monthKey(r[1]);if(!mk)return;
    const row={name:clean(r[2]),role:clean(r[3]),base:num(r[4]),allow:num(r[5]),bonus:num(r[6]),tax:num(r[8]),nssf:num(r[9]),deduct:num(r[10]),method:clean(r[12])||BANK,order:i};
    put("pay",mk+"-01",hashId("p",[mk,row.name,i].join("|")),row);nPay++});found++}
  const tu=sheet("តាមដានថ្លៃសិក្សា");const feeRows={};
  if(tu){tu.slice(4).forEach((r,i)=>{if(!r||!clean(r[1]))return;const name=clean(r[1]);
    feeRows[hashId("f",name)]={name,cls:clean(r[2]),program:clean(r[3]),fee:num(r[4]),discount:num(r[5]),phone:clean(r[23]),order:i};nFee++});found++}
  if(!found){toast("ឯកសារនេះមិនមែនជាទម្រង់ហិរញ្ញវត្ថុរបស់សាលាទេ");return}
  setStatus("កំពុងនាំចូល…");
  try{
    finSet("fin/settings",st);await finWrite;
    if(nFee){finPatch("fin/fees",{rows:feeRows});await finWrite}
    for(const k in buckets){finPatch("fin/"+k,{rows:buckets[k]});await finWrite}
    S.fin.year=st.startYear;S.fin.month=null;
    toast(`បាននាំចូល៖ ចំណូល ${nIn} · ចំណាយ ${nOut} · ប្រាក់ខែ ${nPay} · សិស្ស ${nFee}`);S.tab="fdash";saveUI();render();
  }catch(e){toast("នាំចូលមិនបាន")}
}
/* ---------- Banner & Lifecycle Wiring ---------- */
function banner(){
  let h='';
  if(S.backend==='local')h+=`<div class='note' style='margin-bottom:12px;'><i class='fa-solid fa-cloud-check'></i> áž‘áž·áž“áŸ’áž“áž“áŸáž™ážáŸ’ážšáž¼ážœáž”áž¶áž“ážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž€áŸ’áž“áž»áž„ Browser LocalStorage (ážŠáŸ†ážŽáž¾ážšáž€áž¶ážš Offline áž”áž¶áž“ 100%)áŸ” áž–áŸáž› Upload áž›áž¾ Hosting áž‡áž¶áž˜áž½áž™ PHP & SQLite áž”áŸ’ážšáž–áŸáž“áŸ’áž’áž“áž¹áž„áž”áŸ’ážáž¼ážšáž‘áŸ… Database ážŸáŸ’ážœáŸáž™áž”áŸ’ážšážœážáŸ’ážáž·áŸ”</div>`;
  if(!S.canWrite)h+=`<div class='note' style='margin-bottom:12px;'>áž¢áŸ’áž“áž€áž¢áž¶áž…áž˜áž¾áž›áž”áž¶áž“ áž”áŸ‰áž»áž“áŸ’ážáŸ‚áž˜áž·áž“áž˜áž¶áž“ážŸáž·áž‘áŸ’áž’áž·áž€áŸ‚áž”áŸ’ážšáŸ‚áž‘áž·áž“áŸ’áž“áž“áŸáž™áž¡áž¾áž™áŸ”</div>`;
  return h;
}

function watchSheet(){
  const k=sheetKey();if(k===S.sheetKey)return;
  if(S.unSheet)S.unSheet();S.sheet=null;S.sheetKey=k;
  if(!k)return;
  S.unSheet=api.watchSheet(k,d=>{
    if(S.sheetKey!==k)return;S.sheet=d;
    if(S.tab==='scores'&&$('#grid')&&curClass())refreshComputed();
    else if(S.tab==='honor'&&$('#hsWrap'))refreshHonor();
    else render();
  },()=>{});
}

function onClasses(list){
  S.allClasses=list.map(c=>({...c,students:Array.isArray(c.students)?c.students:[]})).sort((a,b)=>String(a.name).localeCompare(String(b.name),'km',{numeric:true}));
  applyBranch();
  S.ready.classes=true;
  watchSheet();
  render();
}

function start(){
  ensureLogo().then(()=>{renderBrand();render()});
  api.watchClasses(onClasses,()=>{});
  api.watchSettings(d=>{S.settings=d;S.ready.settings=true;applyBranch();render()},()=>{S.ready.settings=true;render()});
}

/* ---------- App Entry Point ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  buildNav();
  StorageManager.getItems();
  StorageManager.getUsers();

  $('#menuBtn').onclick=()=>document.body.classList.add('nav-open');
  $('#scrim').onclick=()=>document.body.classList.remove('nav-open');
  document.querySelectorAll('#sideNav .tab').forEach(t=>t.onclick=()=>goTab(t.dataset.tab));

  $('#selClass').onchange=e=>{S.sel.classId=e.target.value||null;saveUI();watchSheet();render()};
  $('#selPeriod').onchange=e=>{S.sel.period=e.target.value;saveUI();watchSheet();render()};
  $('#selBranch').onchange=e=>{S.branch=e.target.value;applyBranch();render()};

  // Form bindings
  const regForm=$('#registerForm');
  if(regForm){
    regForm.onsubmit=e=>{
      e.preventDefault();
      const res=StorageManager.addUser({
        name:regForm.regName.value.trim(),
        username:regForm.regUsername.value.trim(),
        password:regForm.regPassword.value,
        role:regForm.regRole.value,
        grade:regForm.regGrade.value,
        childName:regForm.regChildName?regForm.regChildName.value.trim():''
      });
      if(res.success){
        StorageManager.setCurrentUser(res.user);
        toast('áž”áž¶áž“áž”áž„áŸ’áž€áž¾ážáž‚ážŽáž“áž¸ážŠáŸ„áž™áž‡áŸ„áž‚áž‡áŸáž™!');
        closeAllModals();render();
      }else alert(res.message);
    };
  }

  const itemForm=$('#itemForm');
  if(itemForm){
    itemForm.onsubmit=e=>{
      e.preventDefault();
      StorageManager.addItem({
        type:itemForm.itemType.value,
        subject:itemForm.itemSubject.value,
        grade:itemForm.itemGrade.value,
        title:itemForm.itemTitle.value.trim(),
        teacher:itemForm.itemTeacher.value.trim(),
        videoUrl:itemForm.itemVideoUrl.value.trim(),
        summary:itemForm.itemSummary.value.trim(),
        content:itemForm.itemContent.value.trim(),
        questions:[]
      });
      toast('áž”áž¶áž“áž”áž“áŸ’ážáŸ‚áž˜áž˜áŸážšáŸ€áž“/áž›áŸ†áž áž¶ážáŸ‹ážŠáŸ„áž™áž‡áŸ„áž‚áž‡áŸáž™!');
      closeAllModals();render();
    };
  }

  // Load API (Server or Local)
  if(location.protocol.startsWith('http')){
    req('me').then(me=>{
      api=makeServerApi();S.backend='server';
      if(me.user)S.user=me.user;
      start();
    }).catch(()=>{
      api=makeLocalApi();S.backend='local';start();
    });
  } else {
    api=makeLocalApi();S.backend='local';start();
  }
});

window.goTab=goTab;

})();
