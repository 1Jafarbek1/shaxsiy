/* common.js: sayt va yozish paneli uchun umumiy yordamchi kodlar:
   matnni xavfsiz chiqarish, sana, bo'lim turlari va oddiy Markdown -> HTML. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* Bo'lim turlari. Yangi bo'lim qo'shmoqchi bo'lsangiz shu yerga qator qo'shing. */
const TYPES={maqola:{sec:"maqolalar",label:"Maqolalar",one:"Maqola",hint:"Fikrlar, esselar va mulohazalar"},sher:{sec:"sherlar",label:"Sheʼrlar",one:"Sheʼr",hint:"Original sheʼrlar va ijodiy yozuvlar"},arxiv:{sec:"arxiv",label:"Arxiv",one:"Xotira",hint:"Xotiralar va hayotimdagi muhim lahzalar"},kitob:{sec:"kitoblar",label:"Kitoblar",one:"Kitob",hint:"Oʻqigan kitoblarim va fikrlarim"}};
const SEC=Object.fromEntries(Object.entries(TYPES).map(([k,v])=>[v.sec,k]));
const DEF={name:"Sayt nomi",author:"Ism Familiya",tagline:"Qisqa shior yoki tavsifni shu yerga yozing.",intro:"Oʻzingiz haqingizda bir-ikki gap yozing.",bio:"Qisqa tarjimai holingiz.",about:"## Kirish\n\nOʻzingiz haqingizda yozing.",email:"",telegram:""};
const MON=["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentyabr","oktyabr","noyabr","dekabr"];
const fmt=s=>{const d=new Date(s+"T00:00:00Z");return isNaN(d)?"":`${d.getUTCDate()}-${MON[d.getUTCMonth()]}, ${d.getUTCFullYear()}`};
const norm=s=>String(s||"").toLowerCase().replace(/[ʻʼ’‘`']/g,"");
const rtime=b=>Math.max(1,Math.round(String(b||"").split(/\s+/).filter(Boolean).length/200))+" daqiqa";
/* Oddiy Markdown: ## sarlavha, **qalin**, *qiya*, [havola](https://...), ![rasm](images/x.jpg), - roʻyxat, > iqtibos */
function md(src){
  const ok=u=>/^(https:\/\/|images\/|\/images\/|#)/.test(u);
  const inl=s=>s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(m,a,u)=>ok(u)?`<img src="${u}" alt="${a}" loading="lazy">`:m)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,t,u)=>ok(u)?`<a href="${u}" rel="noopener">${t}</a>`:m)
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*\n]+)\*/g,"<em>$1</em>");
  return esc(src).split(/\n{2,}/).map(b=>{b=b.trim();if(!b)return"";
    if(/^#{2,3} /.test(b)){const n=b.startsWith("### ")?3:2;return`<h${n}>${inl(b.slice(n+1))}</h${n}>`}
    if(/^!\[[^\]]*\]\([^)\s]+\)$/.test(b))return`<figure>${inl(b)}</figure>`;
    const L=b.split("\n");
    if(L.every(l=>/^[-*] /.test(l)))return`<ul>${L.map(l=>`<li>${inl(l.slice(2))}</li>`).join("")}</ul>`;
    if(L.every(l=>/^&gt; ?/.test(l)))return`<blockquote>${inl(L.map(l=>l.replace(/^&gt; ?/,"")).join("\n"))}</blockquote>`;
    return`<p>${inl(b)}</p>`}).join("");
}
/* Kun/tun tugmasi (sayt va panel uchun) */
function initTheme(){const b=$("#th");if(!b)return;b.onclick=()=>{const d=document.documentElement,dark=d.dataset.theme?d.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches,n=dark?"light":"dark";d.dataset.theme=n;try{localStorage.setItem("th",n)}catch(e){}}}
