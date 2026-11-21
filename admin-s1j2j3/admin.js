/* admin.js: yozish paneli. GitHub token orqali content/posts.json va images/ papkasiga yozadi
   (yaʼni yozuv va rasmlar GitHub'dagi loyihangizga saqlanadi, hosting esa saytni oʻzi yangilaydi).
   Token faqat shu brauzerda (localStorage) saqlanadi. */
const LS="gh-cfg";
let gh=null;try{gh=JSON.parse(localStorage.getItem(LS)||"null")}catch(e){}
let posts=[],site={...DEF},sha={},local={},editing=null,view="list";
const b64e=s=>{let x="";new TextEncoder().encode(s).forEach(c=>x+=String.fromCharCode(c));return btoa(x)};
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g,"")),c=>c.charCodeAt(0)));
async function api(path,opt={}){
  const get=!opt.method||opt.method==="GET";
  const r=await fetch(`https://api.github.com/repos/${gh.repo}/contents/${path}${get?`?ref=${encodeURIComponent(gh.branch)}`:""}`,{...opt,headers:{Authorization:"Bearer "+gh.token,Accept:"application/vnd.github+json"}});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.message||("HTTP "+r.status)),{status:r.status});
  return j;
}
const errText=e=>e.status===401?"Token notoʻgʻri yoki muddati tugagan.":e.status===403?"Token ruxsati yetarli emas (Contents: Read and write kerak).":e.status===404?"Repo yoki fayl topilmadi. Repo nomi va branch toʻgʻriligini tekshiring.":e.status===409||e.status===422?"Maʼlumot boshqa joyda oʻzgargan. Sahifani yangilab, qaytadan urinib koʻring.":(e.message||"Xato");
async function load(){
  const p=await api("content/posts.json");posts=JSON.parse(b64d(p.content));sha.posts=p.sha;
  try{const s=await api("content/site.json");site={...DEF,...JSON.parse(b64d(s.content))};sha.site=s.sha}catch(e){if(e.status!==404)throw e;sha.site=undefined}
}
async function commit(key,path,data,msg){
  const r=await api(path,{method:"PUT",body:JSON.stringify({message:msg,content:b64e(JSON.stringify(data,null,2)+"\n"),sha:sha[key],branch:gh.branch})});
  sha[key]=r.content.sha;
}
async function shrink(f){
  try{const b=await createImageBitmap(f),k=Math.min(1,1600/Math.max(b.width,b.height));if(k===1&&f.size<600e3)return f;
    const c=document.createElement("canvas");c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext("2d").drawImage(b,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(x=>r(x||f),"image/jpeg",.85))}catch(e){return f}
}
async function upload(file){
  const blob=await shrink(file),ext={"image/png":"png","image/webp":"webp","image/gif":"gif"}[blob.type]||"jpg";
  const base=norm(file.name.replace(/\.[^.]+$/,"")).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,20)||"rasm";
  const name=`images/${Date.now().toString(36)}-${base}.${ext}`;
  const b=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(",")[1]);f.readAsDataURL(blob)});
  await api(name,{method:"PUT",body:JSON.stringify({message:"Rasm: "+name,content:b,branch:gh.branch})});
  local[name]=URL.createObjectURL(blob);return name;
}
const slug=t=>(norm(t).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"yozuv")+"-"+Date.now().toString(36).slice(-4);
const say=t=>{const m=$("#msg");if(m)m.textContent=t};
const meta=p=>[TYPES[p.type]?.one,p.category,fmt(p.date),p.draft?"qoralama":""].filter(Boolean).join(", ");
const pv=t=>md(t).replace(/src="(images\/[^"]+)"/g,(m,u)=>`src="${local[u]||"../"+u}"`);
const fld=(k,l,v,t="text")=>`<label>${l}<input name="${k}" type="${t}" value="${esc(v)}"></label>`;

function setup(msg=""){
  return`<h1>Yozish paneliga ulanish</h1><div class="form"><p class="muted">Bir marta ulanasiz, keyin shu brauzerda eslab qolinadi. Token faqat shu qurilmada saqlanadi.</p>
<ol class="steps"><li>GitHub'da <a href="https://github.com/settings/personal-access-tokens/new">yangi token</a> yarating: “Repository access” da faqat sayt repo’sini tanlang, “Permissions” dan <strong>Contents: Read and write</strong> ni belgilang.</li><li>Tokenni pastga qoʻying.</li></ol>
<form class="form" id="f" data-kind="setup">${fld("repo","Repo (foydalanuvchi/repo-nomi)",gh?.repo||"")}${fld("branch","Branch",gh?.branch||"main")}<label>Token<input name="token" type="password" autocomplete="off" value=""></label>
<p class="sb"><button class="btn" type="submit">Ulanish</button></p><p class="warn" id="msg" aria-live="polite">${esc(msg)}</p></form></div>`;
}
function listView(){
  return`<h1>Yozish paneli</h1><p class="sb" style="flex-wrap:wrap"><button class="btn" data-new type="button">Yangi yozuv</button><button class="btn g" data-set type="button">Sayt sozlamalari</button><button class="btn g" data-out type="button">Chiqish</button></p><p class="muted" id="msg" aria-live="polite"></p><h2>Yozuvlar (${posts.length})</h2>`+
  (posts.length?[...posts].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(p=>`<div class="adm"><span><strong>${esc(p.title)}</strong><br><span class="d">${esc(meta(p))}</span></span><button class="btn g" data-edit="${esc(p.id)}" type="button">Tahrirlash</button></div>`).join(""):`<div class="note">Hozircha yozuv yoʻq.</div>`);
}
function settingsView(){const c=site;return`<h1>Sayt sozlamalari</h1><form class="form" id="f" data-kind="settings">${fld("name","Sayt nomi (tepada koʻrinadi)",c.name)}${fld("author","Ism yoki taxallus",c.author)}${fld("tagline","Qisqa shior",c.tagline)}<label>Bosh sahifadagi tanishtiruv<textarea name="intro" style="min-height:5rem">${esc(c.intro)}</textarea></label><label>Qisqa tarjimai hol<textarea name="bio" style="min-height:6rem">${esc(c.bio)}</textarea></label><label>“Men haqimda” sahifasi (## sarlavha, oddiy matn)<textarea name="about">${esc(c.about)}</textarea></label><div class="row">${fld("email","Email",c.email)}${fld("telegram","Telegram havolasi",c.telegram)}</div><p class="sb"><button class="btn" type="submit">Saqlash</button><button class="btn g" type="button" data-back>Bekor qilish</button></p><p class="muted" id="msg" aria-live="polite"></p></form>`}
function editorView(){
  const p=editing&&editing!=="new"?posts.find(x=>x.id===editing):null,v=p||{type:"maqola",date:new Date().toISOString().slice(0,10),tags:[],body:""};
  return`<h1>${p?"Yozuvni tahrirlash":"Yangi yozuv"}</h1><form class="form" id="f" data-kind="post"><div class="row"><label>Turi<select name="type">${Object.entries(TYPES).map(([k,t])=>`<option value="${k}"${v.type===k?" selected":""}>${t.one}</option>`).join("")}</select></label>${fld("date","Sana",v.date,"date")}</div>${fld("title","Sarlavha",v.title||"")}${fld("excerpt","Qisqa tavsif",v.excerpt||"")}<div class="row">${fld("category","Kategoriya",v.category||"")}${fld("tags","Teglar (vergul bilan)",(v.tags||[]).join(", "))}</div><div class="row">${fld("author","Muallif (kitob uchun)",v.author||"")}${fld("status","Holati (kitob uchun)",v.status||"")}</div>
<label>Muqova rasmi<input name="cover" type="text" value="${esc(v.cover||"")}" placeholder="Yuklasangiz oʻzi toʻladi"></label><img class="thumb" id="ct" alt="" ${v.cover?`src="${esc(local[v.cover]||"../"+v.cover)}"`:"hidden"}><p class="sb"><label class="btn g" style="cursor:pointer">Muqova yuklash<input type="file" accept="image/*" data-up="cover" hidden></label></p>
<label>Matn (## sarlavha, **qalin**, *qiya*, - roʻyxat; sheʼrda har satr yangi qatordan)<textarea name="body">${esc(v.body)}</textarea></label><p class="sb"><label class="btn g" style="cursor:pointer">Matnga rasm qoʻshish<input type="file" accept="image/*" data-up="body" hidden></label><button class="btn g" type="button" data-pv>Koʻrish</button></p><div class="pv prose" id="pv" hidden></div>
<label class="chk"><input type="checkbox" name="featured"${v.featured?" checked":""}> Bosh sahifada tanlangan sifatida koʻrsatish</label><label class="chk"><input type="checkbox" name="draft"${v.draft?" checked":""}> Qoralama (saytda koʻrsatilmasin)</label>
<p class="sb" style="flex-wrap:wrap"><button class="btn" type="submit">Saqlash</button><button class="btn g" type="button" data-back>Bekor qilish</button>${p?`<button class="btn g r" type="button" data-del>Oʻchirish</button>`:""}</p><p class="muted" id="msg" aria-live="polite"></p></form>`;
}
function show(){
  $("#app").innerHTML=!gh?setup():view==="settings"?settingsView():view==="edit"?editorView():listView();
  const go=(v,e=null)=>{view=v;editing=e;show();scrollTo(0,0)};
  $$("[data-edit]").forEach(b=>b.onclick=()=>go("edit",b.dataset.edit));
  const q=s=>$(s);
  if(q("[data-new]"))q("[data-new]").onclick=()=>go("edit","new");
  if(q("[data-set]"))q("[data-set]").onclick=()=>go("settings");
  if(q("[data-back]"))q("[data-back]").onclick=()=>go("list");
  if(q("[data-out]"))q("[data-out]").onclick=()=>{localStorage.removeItem(LS);gh=null;show()};
  const f=$("#f");if(f)wireForm(f,go);
}
function wireForm(f,go){
  if(f.dataset.kind==="setup"){f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f);
    gh={repo:String(d.get("repo")).trim().replace(/^https:\/\/github\.com\//,"").replace(/\/$/,""),branch:String(d.get("branch")).trim()||"main",token:String(d.get("token")).trim()};
    $("#msg").textContent="Ulanmoqda…";
    try{await load();localStorage.setItem(LS,JSON.stringify(gh));view="list";show()}catch(err){const m=errText(err);gh={...gh,token:""};$("#app").innerHTML=setup(m);wireForm($("#f"),go)}};return}
  $$("[data-up]",f).forEach(i=>i.onchange=async()=>{const file=i.files[0];if(!file)return;say("Rasm yuklanmoqda…");
    try{const n=await upload(file);
      if(i.dataset.up==="cover"){f.cover.value=n;const t=$("#ct");t.src=local[n];t.hidden=false}
      else{const t=f.body,pos=t.selectionStart??t.value.length;t.value=t.value.slice(0,pos)+`\n\n![](${n})\n\n`+t.value.slice(pos)}
      say("Rasm qoʻshildi. Yozuvni “Saqlash” bilan saqlashni unutmang.")}catch(e){say("Rasmni yuklab boʻlmadi: "+errText(e))}i.value=""});
  const pvb=$("[data-pv]",f);if(pvb)pvb.onclick=()=>{const b=$("#pv");b.hidden=!b.hidden;if(!b.hidden)b.innerHTML=pv(f.body.value)};
  const del=$("[data-del]",f);if(del)del.onclick=async()=>{if(!del.dataset.sure){del.dataset.sure=1;del.textContent="Aniq oʻchiraymi?";return}
    try{posts=posts.filter(p=>p.id!==editing);await commit("posts","content/posts.json",posts,"Yozuv oʻchirildi");go("list")}catch(e){say("Oʻchirib boʻlmadi: "+errText(e));await load().catch(()=>{})}};
  f.onsubmit=async e=>{e.preventDefault();const d=new FormData(f);say("Saqlanmoqda…");
    try{if(f.dataset.kind==="settings"){site=Object.fromEntries(Object.keys(DEF).map(k=>[k,String(d.get(k)||"")]));await commit("site","content/site.json",site,"Sayt sozlamalari");go("list");say("Saqlandi. Sayt 1-2 daqiqada yangilanadi.");return}
      const title=String(d.get("title")||"").trim();if(!title){say("Sarlavha yozing.");return}
      const o={id:editing&&editing!=="new"?editing:slug(title),type:d.get("type"),title,date:d.get("date")||new Date().toISOString().slice(0,10),excerpt:String(d.get("excerpt")||"").trim(),category:String(d.get("category")||"").trim(),
        tags:String(d.get("tags")||"").split(",").map(s=>s.trim()).filter(Boolean),author:String(d.get("author")||"").trim(),status:String(d.get("status")||"").trim(),cover:String(d.get("cover")||"").trim(),
        body:String(d.get("body")||""),featured:!!d.get("featured"),draft:!!d.get("draft")};
      const i=posts.findIndex(p=>p.id===o.id);i<0?posts.unshift(o):posts[i]=o;
      await commit("posts","content/posts.json",posts,"Yozuv: "+o.title);go("list");say("Saqlandi. Sayt 1-2 daqiqada yangilanadi.")}
    catch(err){say("Saqlab boʻlmadi: "+errText(err));await load().catch(()=>{})}};
}
initTheme();
(async()=>{if(gh&&gh.token){try{await load()}catch(e){gh={...gh,token:""};$("#app").innerHTML=setup(errText(e));wireForm($("#f"));return}}else gh=null;show()})();
