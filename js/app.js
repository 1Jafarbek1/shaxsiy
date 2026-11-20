/* app.js: ochiq saytning asosiy kodi. content/site.json va content/posts.json fayllarini oʻqiydi,
   sahifalarni (bosh sahifa, bo'limlar, yozuv, men haqimda, qidiruv) chizadi. Manzil: #maqolalar, #p-<id> va h.k. */
let cfg={...DEF},posts=[],ready=false,failed=false,shown=10,cat="";
const vis=()=>posts.filter(p=>!p.draft).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||b.id.localeCompare(a.id));
const href=p=>`#p-${p.id}`;
const meta=p=>[TYPES[p.type]?.one,p.category,p.author,p.status,fmt(p.date)].filter(Boolean).join(", ");
const item=p=>`<li class="rv" data-c="${esc(p.category||"")}"><a href="${href(p)}"><span class="tx"><span class="t">${esc(p.title)}</span><span class="d">${esc(meta(p))}</span>${p.excerpt?`<span class="s">${esc(p.excerpt)}</span>`:""}</span>${p.cover?`<img src="${esc(p.cover)}" alt="" loading="lazy">`:""}</a></li>`;
const list=a=>`<ul class="list">${a.map(item).join("")}</ul>`;
const card=p=>`<a class="card rv${p.cover?"":" noimg"}" href="${href(p)}">${p.cover?`<img src="${esc(p.cover)}" alt="" loading="lazy">`:""}<span class="in"><span class="d">${esc(meta(p))}</span><span class="t">${esc(p.title)}</span>${p.excerpt?`<span class="s">${esc(p.excerpt)}</span>`:""}</span></a>`;
const empty=`<div class="note">Hozircha yozuv yoʻq.</div>`;
const gate=h=>!ready?`<p class="muted">Yuklanmoqda…</p>`:failed?`<div class="note">Maʼlumotni yuklab boʻlmadi. Sahifani yangilang. Agar faylni kompyuterdan ikki marta bosib ochgan boʻlsangiz, VS Code’dagi “Go Live” orqali yoki hosting orqali oching.</div>`:h;

function view(h){
  const all=vis();
  if(h===""){const f=all.filter(p=>p.featured).slice(0,3);
    return`<section class="hero"><h1>${esc(cfg.author)}</h1><p class="lead">${esc(cfg.tagline)}</p><p class="intro">${esc(cfg.intro)}</p><p class="acts"><a class="btn" href="#maqolalar">Maqolalarni oʻqish</a><a class="btn g" href="#haqimda">Men haqimda</a></p></section>`+
    gate((f.length?`<h2>Tanlangan yozuvlar</h2><div class="grid">${f.map(card).join("")}</div>`:"")+`<h2>Yangi yozuvlar</h2>${all.length?list(all.slice(0,6)):empty}`+
    `<h2>Mening olamim</h2><div class="ex rv">${Object.values(TYPES).map(t=>`<a href="#${t.sec}"><span class="t">${t.label}</span><span class="s">${t.hint}</span></a>`).join("")}</div>`+
    `<h2>Qisqacha men haqimda</h2><p class="prose rv">${esc(cfg.bio)}</p><p><a href="#haqimda">Toʻliq oʻqish</a></p>`)}
  if(SEC[h]){const t=TYPES[SEC[h]],a=all.filter(p=>p.type===SEC[h]),cs=[...new Set(a.map(p=>p.category).filter(Boolean))];
    return`<h1>${t.label}</h1><p class="muted">${t.hint}</p>`+gate((cs.length>1?`<div class="chips" role="group" aria-label="Kategoriya boʻyicha saralash"><button type="button" data-c="" aria-pressed="true">Hammasi</button>${cs.map(c=>`<button type="button" data-c="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("")}</div>`:"")+(a.length?list(a):empty)+`<p><button class="btn g" id="more" type="button" hidden>Koʻproq koʻrsatish</button></p>`)}
  if(h==="haqimda")return`<h1>Men haqimda</h1><div class="prose">${md(cfg.about)}</div><h2>Aloqa</h2><p>${cfg.telegram?`<a href="${esc(cfg.telegram)}">Telegram</a> `:""}${cfg.email?`<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`:""}${cfg.telegram||cfg.email?"":`<span class="muted">Aloqa maʼlumoti hali qoʻshilmagan.</span>`}</p>`;
  if(h==="qidiruv")return`<h1>Qidirish</h1><div class="sb"><label class="sr" for="q">Qidiruv soʻzi</label><input id="q" type="search" placeholder="Sarlavha, matn yoki teg boʻyicha" autocomplete="off"><button class="btn g" id="qc" type="button" hidden>Tozalash</button></div><p class="muted" id="qs" aria-live="polite">Qidirish uchun soʻz yozing.</p><div id="qr"></div>`;
  if(h.startsWith("p-")){const i=all.findIndex(p=>"p-"+p.id===h);
    if(!ready)return gate("");
    if(i<0)return`<h1>Yozuv topilmadi</h1><p><a href="#">Bosh sahifaga qaytish</a></p>`;
    const p=all[i],same=all.filter(x=>x.type===p.type),j=same.indexOf(p),older=same[j+1],newer=same[j-1];
    const sc=o=>(o.category&&o.category===p.category?1:0)+(o.tags||[]).filter(t=>(p.tags||[]).includes(t)).length;
    const rel=same.filter(o=>o!==p&&sc(o)>0).sort((a,b)=>sc(b)-sc(a)).slice(0,3);
    return`<article class="${p.type}"><p class="muted">${esc(meta(p))}${p.type==="maqola"?`, ${rtime(p.body)} oʻqiladi`:""}</p><h1>${esc(p.title)}</h1>${p.cover?`<img class="cover" src="${esc(p.cover)}" alt="">`:""}<div class="prose">${md(p.body)}</div>${(p.tags||[]).length?`<ul class="tags">${p.tags.map(t=>`<li><a href="#qidiruv" data-q="${esc(t)}">#${esc(t)}</a></li>`).join("")}</ul>`:""}</article>`+
    (older||newer?`<nav class="pager" aria-label="Boshqa yozuvlar">${older?`<a href="${href(older)}"><span class="d">Oldingisi</span><span class="t">${esc(older.title)}</span></a>`:"<span></span>"}${newer?`<a class="r" href="${href(newer)}"><span class="d">Keyingisi</span><span class="t">${esc(newer.title)}</span></a>`:"<span></span>"}</nav>`:"")+
    (rel.length?`<h2>Oʻxshash yozuvlar</h2>${list(rel)}`:"")+`<p><a href="#${TYPES[p.type].sec}">Barcha ${TYPES[p.type].label.toLowerCase()}</a></p>`}
  return`<h1>Sahifa topilmadi</h1><p><a href="#">Bosh sahifaga qaytish</a></p>`;
}

function wire(h){
  const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$(".rv").forEach(e=>e.classList.add("in"));
  if("IntersectionObserver"in window&&!calm){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
    $$(".rv").forEach(e=>{e.classList.remove("in");io.observe(e)})}
  $("#bar").style.transform="scaleX(0)";
  if(h.startsWith("p-")&&!calm){let n=0;
    $$(".sher .prose p").forEach(p=>{if(p.children.length)return;const L=p.textContent.split("\n");p.textContent="";L.forEach(l=>{const s=document.createElement("span");s.className="ln";s.style.setProperty("--i",Math.min(n++,40));s.textContent=l;p.append(s)})})}
  const items=$$(".list li"),more=$("#more");
  if(SEC[h]){const ap=()=>{let n=0;items.forEach(li=>{const ok=!cat||li.dataset.c===cat;if(ok)n++;li.hidden=!ok||n>shown});if(more)more.hidden=items.filter(li=>!cat||li.dataset.c===cat).length<=shown};
    $$(".chips button").forEach(b=>b.onclick=()=>{cat=b.dataset.c;shown=10;$$(".chips button").forEach(x=>x.setAttribute("aria-pressed",x===b));ap()});
    if(more)more.onclick=()=>{shown+=10;ap()};ap()}
  if(h==="qidiruv"){const q=$("#q"),qc=$("#qc"),qr=$("#qr"),qs=$("#qs"),idx=vis().map(p=>({p,h:norm([p.title,p.excerpt,p.category,p.author,(p.tags||[]).join(" "),p.body].join(" "))}));
    const run=()=>{const T=norm(q.value.trim()).split(/\s+/).filter(Boolean);qc.hidden=!q.value;if(!T.length){qr.innerHTML="";qs.textContent="Qidirish uchun soʻz yozing.";return}
      const r=idx.filter(i=>T.every(t=>i.h.includes(t))).map(i=>i.p);qs.textContent=r.length?`${r.length} ta natija`:"Hech narsa topilmadi. Boshqa soʻz bilan urinib koʻring.";qr.innerHTML=r.length?list(r.slice(0,50)):"";$$(".rv",qr).forEach(e=>e.classList.add("in"))};
    q.oninput=run;qc.onclick=()=>{q.value="";run();q.focus()};q.value=window.__q||"";window.__q="";run();q.focus()}
  $$("[data-q]").forEach(a=>a.onclick=()=>{window.__q=a.dataset.q});
}

function render(){
  const h=location.hash.slice(1);
  document.body.dataset.r=h===""?"home":"x";
  $("#app").innerHTML=view(h);
  const t=SEC[h]?TYPES[SEC[h]].label:h==="haqimda"?"Men haqimda":h==="qidiruv"?"Qidirish":h.startsWith("p-")?(posts.find(p=>"p-"+p.id===h)||{}).title||"":"";
  document.title=(t?t+" | ":"")+cfg.name;$("#brand").textContent=cfg.name;
  const md_=document.querySelector('meta[name=description]');if(md_)md_.content=cfg.tagline;
  $("#nv").innerHTML=Object.values(TYPES).map(t=>`<a href="#${t.sec}"${h===t.sec?' aria-current="page"':""}>${t.label}</a>`).join("")+`<a href="#haqimda"${h==="haqimda"?' aria-current="page"':""}>Men haqimda</a><a href="#qidiruv"${h==="qidiruv"?' aria-current="page"':""}>Qidirish</a>`;
  $("#fl").textContent=`© ${new Date().getFullYear()} ${cfg.author}`;
  $("#fr").innerHTML=(cfg.telegram?`<a href="${esc(cfg.telegram)}">Telegram</a> `:"")+(cfg.email?`<a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>`:"");
  wire(h);
}
addEventListener("hashchange",()=>{shown=10;cat="";$("#hd").removeAttribute("data-open");$("#mb").setAttribute("aria-expanded","false");render();scrollTo(0,0)});
$("#mb").onclick=()=>{const o=$("#hd").toggleAttribute("data-open");$("#mb").setAttribute("aria-expanded",String(o));$("#mb").setAttribute("aria-label",o?"Menyuni yopish":"Menyuni ochish")};
addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#hd").hasAttribute("data-open")){$("#hd").removeAttribute("data-open");$("#mb").setAttribute("aria-expanded","false");$("#mb").focus()}});
addEventListener("scroll",()=>{const h=document.documentElement,m=h.scrollHeight-h.clientHeight;$("#bar").style.transform=`scaleX(${location.hash.startsWith("#p-")&&m>0?h.scrollTop/m:0})`},{passive:true});
initTheme();
(async()=>{
  render();
  try{const[s,p]=await Promise.all([fetch("content/site.json",{cache:"no-cache"}),fetch("content/posts.json",{cache:"no-cache"})]);
    if(!p.ok)throw 0;cfg={...DEF,...(s.ok?await s.json():{})};posts=await p.json();if(!Array.isArray(posts))throw 0}
  catch(e){failed=true}
  ready=true;render();
})();
