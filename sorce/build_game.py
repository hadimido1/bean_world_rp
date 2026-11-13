import os
os.chdir('/home/claude/bean_project')
s=open('bean_world.html',encoding='utf-8').read()
acc=open('bean-accessories.js',encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,a[:50]
    s=s.replace(a,b)

css=r'''
:root{--m:12px;--sl:env(safe-area-inset-left,0px);--sr:env(safe-area-inset-right,0px);--sT:env(safe-area-inset-top,0px);--sb:env(safe-area-inset-bottom,0px);--glass:rgba(12,17,42,.8);--line:rgba(255,255,255,.16);--acc:#ffd23f;--pk:#ff1080;--h:44px}
#rot[hidden]{display:none}button{font-family:inherit}svg{display:block;flex:none}
.scr{display:none}body.inauth #auth{display:grid}body.inlobby #lobby{display:block}body.insplash #splash{display:grid}
body:not(.inworld) #hud,body:not(.inworld) #hint,body:not(.inworld) #joy,body:not(.inworld) #acts,body:not(.inworld) #menuBtn{display:none}
#fs{width:38px;height:34px}
/* شاشة البداية */
#splash{position:fixed;inset:0;z-index:7;place-items:center;align-content:center;gap:8px;text-align:center;direction:rtl;color:#fff;padding:var(--m);background:radial-gradient(circle at 50% 45%,rgba(255,16,128,.28),rgba(5,8,24,.9))}
#splash h1{margin:0;font:900 clamp(34px,12vmin,88px)/1 system-ui,sans-serif;letter-spacing:.06em;text-shadow:0 4px 0 var(--pk),0 0 44px rgba(255,16,128,.6)}
#splash p{margin:0 0 14px;opacity:.75;font-size:14px}
#startBtn,#play{display:flex;align-items:center;justify-content:center;gap:10px;height:56px;box-sizing:border-box;border:0;cursor:pointer;background:var(--acc);color:#14181f;font:900 22px/1 system-ui,sans-serif;padding:0 44px;border-radius:8px;transform:skewX(-8deg);box-shadow:0 6px 0 #c99a14,0 12px 30px rgba(255,210,63,.4)}
#startBtn:active,#play:active{transform:skewX(-8deg) translateY(4px);box-shadow:0 2px 0 #c99a14}
/* تسجيل الدخول */
#auth{position:fixed;inset:0;z-index:6;place-items:center;padding:var(--m) calc(var(--m) + var(--sr)) calc(var(--m) + var(--sb)) calc(var(--m) + var(--sl));pointer-events:none}
.card0{pointer-events:auto;direction:rtl;text-align:right;box-sizing:border-box;width:min(380px,100%);max-height:100%;overflow:auto;background:var(--glass);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid var(--line);border-radius:20px;padding:18px;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.45)}
.brand{margin:0 0 12px;text-align:center;font:900 26px/1 system-ui,sans-serif;letter-spacing:3px;text-shadow:0 2px 0 var(--pk)}
.card0 label{display:block;font-size:12px;font-weight:700;margin:10px 0 4px;opacity:.75}
.card0 input{width:100%;box-sizing:border-box;height:42px;font:inherit;font-size:16px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.08);color:#fff;outline:0;-webkit-user-select:text;user-select:text}
.card0 input:focus{border-color:var(--acc)}
.tabs{display:flex;gap:4px;background:rgba(255,255,255,.08);border-radius:12px;padding:4px}.tabs button{flex:1;height:36px;font-size:14px;font-weight:700;border:0;background:0;border-radius:9px;cursor:pointer;color:#fff;opacity:.7}.tabs button.on{background:var(--acc);color:#14181f;opacity:1}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:46px;font-size:15px;font-weight:800;border:0;border-radius:12px;margin-top:12px;cursor:pointer;background:var(--acc);color:#14181f}.btn:disabled{opacity:.45;cursor:default}
.msg{min-height:18px;margin-top:8px;color:#ff7b8f;font-size:13px}
/* اللوبي */
#lobby{position:fixed;inset:0;z-index:6;color:#fff;pointer-events:none;direction:rtl}#lobby>*{pointer-events:auto}
#lobby::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,8,24,.7),transparent 22%,transparent 72%,rgba(5,8,24,.7))}
#top{position:absolute;top:calc(var(--m) + var(--sT));left:calc(var(--m) + var(--sl));right:calc(var(--m) + var(--sr));display:flex;justify-content:space-between;align-items:center;direction:ltr;pointer-events:none}
#top>*{pointer-events:auto}#topR{display:flex;gap:8px;align-items:center}
.pill{display:flex;align-items:center;gap:8px;height:var(--h);box-sizing:border-box;padding:0 12px;direction:rtl;background:var(--glass);border:1px solid var(--line);border-radius:14px;color:#fff;font:inherit;font-size:14px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
button.pill{cursor:pointer}.ib{width:var(--h);padding:0;justify-content:center}
#av{width:30px;height:30px;border-radius:9px;background:var(--pk);display:grid;place-items:center;font-weight:900}
.pill small{display:block;opacity:.65;font-size:11px;line-height:1.1}.pill b{display:block;line-height:1.2;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#coins{color:var(--acc);font-weight:800}
#nav{position:absolute;right:calc(var(--m) + var(--sr));top:calc(var(--m) + var(--sT) + var(--h) + 10px);display:flex;flex-direction:column;gap:8px}
#nav button{width:54px;height:54px;border-radius:15px;border:1px solid var(--line);background:var(--glass);color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11px;font-weight:700;opacity:.9}
#nav button.on{background:var(--acc);color:#14181f;opacity:1}
#play{position:absolute;left:calc(var(--m) + var(--sl) + 6px);bottom:calc(var(--m) + var(--sb) + 6px)}
#sheet{position:absolute;right:calc(var(--m) + var(--sr) + 64px);top:calc(var(--m) + var(--sT) + var(--h) + 10px);bottom:calc(var(--m) + var(--sb));width:min(320px,calc(100vw - 150px - var(--sl) - var(--sr)));display:none;flex-direction:column;background:var(--glass);border:1px solid var(--line);border-radius:18px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);animation:pop .25s ease}
#sheet.on{display:flex}@keyframes pop{from{opacity:0;transform:translateX(14px)}}
#shh{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--line)}#shh h2{margin:0;font-size:17px}#shh .ib{height:38px;width:38px}
#shb{padding:12px;overflow:auto;flex:1;-webkit-overflow-scrolling:touch}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:9px;margin-top:12px}
.card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:80px;padding:10px 4px;border-radius:14px;background:rgba(255,255,255,.07);border:2px solid transparent;cursor:pointer;font-size:12px;font-weight:700;text-align:center}
.card.sq{min-height:0;aspect-ratio:1;padding:6px}.card.on{border-color:var(--acc);background:rgba(255,210,63,.14)}.card i{width:66%;aspect-ratio:1;border-radius:50%;border:3px solid #fff}.card img{width:100%;border-radius:10px}
.card em{display:flex;align-items:center;gap:3px;font-style:normal;color:var(--acc);font-size:12px}.card em svg{width:14px;height:14px}
.mut{opacity:.6;font-size:13px;grid-column:1/-1;text-align:center}.row{display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px}.row span{opacity:.65}
#big{width:76px;height:76px;border-radius:22px;background:var(--pk);display:grid;place-items:center;font:900 34px system-ui;margin:2px auto 10px}
#toast{position:fixed;left:50%;bottom:calc(var(--m) + var(--sb) + 76px);transform:translateX(-50%);max-width:86vw;background:#fff;color:#14181f;font-weight:700;font-size:14px;padding:10px 18px;border-radius:12px;z-index:30;display:none;text-align:center}
/* داخل العالم */
#menuBtn{position:fixed;top:calc(var(--m) + var(--sT));right:calc(var(--m) + var(--sr));height:38px;display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:#14233f;background:rgba(255,255,255,.88);border:0;border-radius:12px;padding:0 14px;box-shadow:0 2px 10px rgba(20,35,63,.16);cursor:pointer;z-index:4}
body.inworld #hint{top:calc(var(--m) + var(--sT) + 46px)}
/* وضع الطول */
@media (orientation:portrait){
#nav{top:auto;right:50%;transform:translateX(50%);bottom:calc(var(--m) + var(--sb));flex-direction:row}
#play{left:calc(var(--m) + var(--sl));right:calc(var(--m) + var(--sr));bottom:calc(var(--m) + var(--sb) + 66px);transform:none;box-shadow:0 5px 0 #c99a14}#play:active{transform:translateY(4px)}
#sheet{left:calc(var(--m) + var(--sl));right:calc(var(--m) + var(--sr));width:auto;top:auto;bottom:calc(var(--m) + var(--sb) + 132px);height:min(42vh,340px)}
#toast{bottom:calc(var(--m) + var(--sb) + 140px)}}
/* شاشات قصيرة (جوال بالعرض) */
@media (max-height:480px){
.card0{padding:12px 16px;width:min(340px,100%)}.brand{font-size:20px;margin-bottom:8px}.card0 label{margin:6px 0 3px;font-size:11px}.card0 input{height:36px}.tabs button{height:32px}.btn{height:40px;margin-top:8px}.msg{min-height:14px;margin-top:4px;font-size:12px}
:root{--h:40px}#nav button{width:50px;height:50px}#sheet{right:calc(var(--m) + var(--sr) + 60px)}#play{height:50px;font-size:20px;padding:0 36px}.card{min-height:72px}}
'''
rep('</style>',css+'</style>')

html=r'''<button id="menuBtn"></button><div id="toast"></div>
<div id="splash" class="scr"><h1>BEAN WORLD</h1><p>تُفتح اللعبة بملء الشاشة وبالعرض</p><button id="startBtn"><svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg><span>ابدأ</span></button></div>
<div id="auth" class="scr"><div class="card0"><h1 class="brand">BEAN WORLD</h1><div class="tabs"><button id="tL">دخول</button><button id="tR">حساب جديد</button></div>
<label>اسم المستخدم</label><input id="un" dir="auto" maxlength="16" autocomplete="username" placeholder="3 – 16 حرفاً">
<label>كلمة السر</label><input id="pw" type="password" placeholder="6 أحرف على الأقل">
<div id="cf" hidden><label>تأكيد كلمة السر</label><input id="pw2" type="password" autocomplete="new-password"></div>
<div class="msg" id="msg"></div><button class="btn" id="go">متابعة</button></div></div>
<div id="lobby" class="scr">
<div id="top"><button class="pill" id="bProf"><span id="av"></span><span><b id="nm"></b><small id="lv"></small></span></button><div id="topR"><div class="pill" id="coins"><span id="ci"></span><b id="cn"></b></div><button class="pill ib" id="bFs"></button><button class="pill ib" id="bOut"></button></div></div>
<div id="nav"></div>
<div id="sheet"><div id="shh"><h2 id="sht"></h2><button class="pill ib" id="sx"></button></div><div id="shb"></div></div>
<button id="play"></button></div>
'''
rep('<div id="err" hidden>',html+'<div id="err" hidden>')
rep('const GLB=',acc+'\nconst GLB=')

setup=r'''

document.getElementById('startBtn').onclick=()=>{document.body.className='inauth';try{wfs()}catch(e){}try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}};
addEventListener('error',e=>{const t=document.getElementById('toast');if(t){t.textContent='خطأ: '+e.message;t.style.display='block'}});

const sk=mesh.skeleton.bones,acc=BeanAcc.create(THREE,sk.find(b=>b.name==='Head'),sk.find(b=>b.name==='Chest'));
const SV=(p,f)=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="${f||'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC={home:SV('<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>'),locker:SV('<path d="M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 01-8 0z"/>'),shop:SV('<path d="M5 8h14l-1 13H6zM9 8a3 3 0 016 0"/>'),user:SV('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
coin:SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 12h6"/>'),out:SV('<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>'),play:SV('<path d="M7 4l13 8-13 8z"/>','currentColor'),x:SV('<path d="M6 6l12 12M18 6L6 18"/>'),
fs:SV('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'),top:SV('<path d="M4 17h16M6 17l1-8a5 5 0 0110 0l1 8"/>'),eyes:SV('<circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3M3 14l1-5M21 14l-1-5"/>'),
mouth:SV('<path d="M3 13c3-3 6-2 9 0 3-2 6-3 9 0-3 4-6 2-9 0-3 2-6 4-9 0z"/>'),neck:SV('<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="1.6"/>')};
const ITEMS=[...COL.map((c,i)=>({k:'c:'+c,t:'c',v:c,p:i<4?0:80+i*10})),...acc.list.map((a,i)=>({k:'a:'+a.id,t:'a',v:a.id,slot:a.slot,n:a.name,p:100+(i%5)*60}))];
let mode='auth',user=null,look={col:COL[0],expr:'happy',acc:[]},tab='home',sub='c',sheetOn=false,lobShift=0,isReg=false;
const DARK=new THREE.Color('#0b0f24'),fogSky=scene.fog,fogDark=new THREE.Fog(0x0b0f24,10,34);
const stage=new THREE.Group();stage.position.set(500,0,500);scene.add(stage);
(function(){const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{}));
 const d=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.1,64),M('#10162f'));d.position.y=-.05;d.receiveShadow=true;
 const p=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.8,.25,64),M('#1a2147',{roughness:.3}));p.position.y=.125;p.receiveShadow=true;
 [[1.78,'#ffd23f'],[3.2,'#ff1080']].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r[0],.04,8,80),new THREE.MeshBasicMaterial({color:r[1]}));t.rotation.x=Math.PI/2;t.position.y=i?.02:.26;stage.add(t)});
 const l1=new THREE.PointLight(0xff1080,1.1,12);l1.position.set(-3,2.5,2);const l2=new THREE.PointLight(0x3c7bff,1.1,12);l2.position.set(3,2.5,-2);stage.add(d,p,l1,l2)})();
function stageOn(on){stage.visible=on;scene.background=on?DARK:new THREE.Color(SKY);scene.fog=on?fogDark:fogSky}
player.position.set(500,.25,500);stageOn(true);
const tag=(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));sp.scale.set(1.8,.45,1);sp.position.y=2.35;player.add(sp);
 return n=>{const g=c.getContext('2d');g.clearRect(0,0,512,128);if(!n){t.needsUpdate=true;return}g.fillStyle='rgba(20,35,63,.78)';g.beginPath();g.rect(8,24,496,80);g.fill();
  g.fillStyle='#fff';g.font='700 46px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,256,66);t.needsUpdate=true}})();
const mem={},DB={get:()=>{try{return JSON.parse(localStorage.getItem('bw_users')||'{}')}catch(e){return mem}},set:u=>{try{localStorage.setItem('bw_users',JSON.stringify(u))}catch(e){Object.assign(mem,u)}}};
const U=()=>DB.get()[user];function put(f){const D=DB.get();f(D[user]);DB.set(D)}
async function H(x){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x));return[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;for(const c of x)h=(h*33^c.charCodeAt(0))>>>0;return'f'+h}}
function applyLook(){face.set(look.col,look.expr);acc.setColor(look.col);acc.clear();look.acc.forEach(id=>acc.toggle(id))}
function toast(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display='none',2200)}
function fth(e){const c=document.createElement('canvas');c.width=c.height=110;BeanFace.draw(c,look.col,e);return c.toDataURL()}
const setB=(id,ic,tx)=>$(id).innerHTML=ic+(tx?'<span>'+tx+'</span>':'');
$('ci').innerHTML=IC.coin;setB('bFs',IC.fs);setB('bOut',IC.out);setB('sx',IC.x);setB('menuBtn',IC.home,'اللوبي');
$('play').innerHTML=IC.play+'<span>العب</span>';$('play').firstChild.setAttribute('width',30);
$('nav').innerHTML=[['home','اللوبي'],['locker','الخزانة'],['shop','المتجر'],['user','الملف']].map(x=>`<button data-t="${x[0]}">${IC[x[0]]}<span>${x[1]}</span></button>`).join('');
const wfs=()=>{try{if(!fsEl())toggleFs()}catch(e){}};
function refresh(){const u=U();$('nm').textContent=u.name;$('cn').textContent=u.coins;$('lv').textContent='المستوى '+(Math.floor(u.secs/300)+1);$('av').textContent=u.name[0].toUpperCase()}
function openTab(t){tab=t;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));sheetOn=t!=='home';$('sheet').classList.toggle('on',sheetOn);if(sheetOn)render()}
function render(){const u=U(),b=$('shb');
 if(tab==='locker'){$('sht').textContent='الخزانة';
  b.innerHTML='<div class="tabs">'+[['c','الألوان'],['f','الملامح'],['a','الإكسسوارات']].map(x=>`<button data-s="${x[0]}" class="${sub===x[0]?'on':''}">${x[1]}</button>`).join('')+'</div><div class="grid">'+
  (sub==='c'?COL.filter(c=>u.owned.includes('c:'+c)).map(c=>`<div class="card sq ${c===look.col?'on':''}" data-c="${c}"><i style="background:${c}"></i></div>`).join(''):
  sub==='f'?BeanFace.expressions.map(e=>`<div class="card sq ${e===look.expr?'on':''}" data-e="${e}"><img src="${fth(e)}" alt=""></div>`).join(''):
  acc.list.filter(a=>u.owned.includes('a:'+a.id)).map(a=>`<div class="card ${look.acc.includes(a.id)?'on':''}" data-a="${a.id}">${IC[a.slot]}<span>${a.name}</span></div>`).join('')||'<p class="mut">لا تملك إكسسوارات بعد، زر المتجر</p>')+'</div>'}
 else if(tab==='shop'){$('sht').textContent='المتجر';const ok=Date.now()-(u.daily||0)>864e5,L=ITEMS.filter(i=>!u.owned.includes(i.k));
  b.innerHTML=`<button class="btn" style="margin:0" data-d="1" ${ok?'':'disabled'}>${IC.coin}${ok?'مكافأة يومية +150':'المكافأة اليومية مستلمة'}</button><div class="grid">`+
  (L.map(i=>`<div class="card ${i.t==='c'?'sq':''}" data-b="${i.k}">${i.t==='c'?`<i style="background:${i.v}"></i>`:IC[i.slot]+'<span>'+i.n+'</span>'}<em>${IC.coin}${i.p}</em></div>`).join('')||'<p class="mut">امتلكت كل العناصر</p>')+'</div>'}
 else{$('sht').textContent='الملف الشخصي';const m=Math.floor(u.secs/60);
  b.innerHTML='<div id="big"></div>'+[['الاسم',u.name],['المستوى',Math.floor(u.secs/300)+1],['وقت اللعب',m+' دقيقة'],['العملات',u.coins],['العناصر المملوكة',u.owned.length+' / '+ITEMS.length],['تاريخ الانضمام',new Date(u.created).toLocaleDateString('ar')]].map(r=>`<div class="row"><span>${r[0]}</span><b class="v"></b></div>`).join('');
  $('big').textContent=u.name[0].toUpperCase();b.querySelectorAll('.v').forEach((e,i)=>e.textContent=[u.name,Math.floor(u.secs/300)+1,m+' دقيقة',u.coins,u.owned.length+' / '+ITEMS.length,new Date(u.created).toLocaleDateString('ar')][i])}}
$('shb').onclick=e=>{const t=e.target.closest('[data-s],[data-c],[data-e],[data-a],[data-b],[data-d]');if(!t)return;const d=t.dataset;
 if(d.s)sub=d.s;else if(d.c)look.col=d.c;else if(d.e)look.expr=d.e;
 else if(d.a){const it=acc.list.find(a=>a.id===d.a),on=look.acc.includes(d.a);look.acc=look.acc.filter(x=>acc.list.find(a=>a.id===x).slot!==it.slot);if(!on)look.acc.push(d.a)}
 else if(d.d){put(u=>{u.coins+=150;u.daily=Date.now()});toast('تم استلام 150 عملة')}
 else if(d.b){const it=ITEMS.find(i=>i.k===d.b);if(U().coins<it.p)return toast('رصيدك غير كافٍ');put(u=>{u.coins-=it.p;u.owned.push(it.k)});toast('تمت عملية الشراء')}
 applyLook();save();refresh();render()};
function save(){if(user)put(u=>{u.look=look})}
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>openTab(tab===b.dataset.t&&b.dataset.t!=='home'?'home':b.dataset.t));
$('bProf').onclick=()=>openTab('user');$('sx').onclick=()=>openTab('home');$('bFs').onclick=()=>toggleFs();
function goLobby(){mode='lobby';document.body.className='inlobby';stageOn(true);player.position.set(500,.25,500);face_=Math.PI;yaw=Math.PI;applyLook();tag(U().name);refresh();openTab('home')}
$('bOut').onclick=()=>{save();user=null;mode='auth';document.body.className='inauth';look={col:COL[0],expr:'happy',acc:[]};applyLook();tag('');sheetOn=false;authMode(false)};
$('play').onclick=()=>{save();mode='world';document.body.className='inworld';stageOn(false);player.position.set(0,0,0);face_=0;yaw=Math.PI;pitch=.38;dist=7.5;wfs();chkOri()};
$('menuBtn').onclick=()=>{goLobby()};
setInterval(()=>{if(mode==='world'&&user)put(u=>{u.secs+=10;u.coins+=3})},10000);
const msg=$('msg');
function authMode(r){isReg=r;$('cf').hidden=!r;$('tL').classList.toggle('on',!r);$('tR').classList.toggle('on',r);msg.textContent='';$('pw').autocomplete=r?'new-password':'current-password'}
$('tL').onclick=()=>authMode(false);$('tR').onclick=()=>authMode(true);
$('go').onclick=async()=>{const n=$('un').value.trim(),p=$('pw').value,k=n.toLowerCase(),D=DB.get();
 if(n.length<3)return msg.textContent='اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
 if(p.length<6)return msg.textContent='كلمة السر يجب أن تكون 6 أحرف على الأقل';
 if(isReg){if(D[k])return msg.textContent='هذا الاسم مستخدم، اختر اسماً آخر';if(p!==$('pw2').value)return msg.textContent='كلمتا السر غير متطابقتين';
  const salt=Math.random().toString(36).slice(2);D[k]={name:n,salt,hash:await H(salt+p)};DB.set(D)}
 else{const u=D[k];if(!u||u.hash!==await H(u.salt+p))return msg.textContent='اسم المستخدم أو كلمة السر غير صحيحة'}
 user=k;put(u=>{u.coins??=500;u.secs??=0;u.created??=Date.now();u.owned??=ITEMS.filter(i=>!i.p).map(i=>i.k);u.look??={col:COL[0],expr:'happy',acc:[]}});
 look=Object.assign({col:COL[0],expr:'happy',acc:[]},U().look);$('pw').value=$('pw2').value='';msg.textContent='';wfs();goLobby();setTimeout(()=>startAct('wave'),600)};
/* تدوير الشخصية بالسحب */
let lx=null;cv.addEventListener('pointerdown',e=>{lx=e.clientX});addEventListener('pointerup',()=>{lx=null});
cv.addEventListener('pointermove',e=>{if(lx!==null&&mode!=='world'){face_+=(e.clientX-lx)*.012;lx=e.clientX}});
document.body.className='insplash';authMode(false);tag('');applyLook();
'''
rep('BeanFace.loadAtlas(ATLAS);','BeanFace.loadAtlas(ATLAS);'+setup)
rep("addEventListener('keydown', e => { if (e.repeat) return;","addEventListener('keydown', e => { if (e.repeat || mode !== 'world') return;")
rep('const mag = Math.min(1, Math.hypot(ix, iy))',"if (mode !== 'world') { ix = iy = 0; } const mag = Math.min(1, Math.hypot(ix, iy))")
rep('  mixer.update(dt);','  acc.update(dt); mixer.update(dt);')
rep('player.rotation.y = face_;',"if (mode === 'auth' && lx === null) face_ += dt * .5; player.rotation.y = face_;")
rep('const tx = pos.x, ty = 1.35, tz = pos.z;',"const port = innerHeight > innerWidth;\n  if (mode !== 'world') { yaw = Math.PI; pitch = .1; dist = 4.2; const hw = Math.tan(cam.fov * Math.PI / 360) * dist * cam.aspect; const want = sheetOn && !port ? ($('sheet').offsetWidth + 90) / innerWidth * hw : 0; lobShift += (want - lobShift) * Math.min(1, dt * 6); }\n  const tx = pos.x - (mode === 'world' ? 0 : lobShift), ty = mode === 'world' ? 1.35 : (port ? (sheetOn ? .3 : .8) : 1.05), tz = pos.z;")
rep("rotEl.hidden = rotDismissed || !(coarse && innerHeight > innerWidth);","rotEl.hidden = rotDismissed || !(coarse && innerHeight > innerWidth);")
rep("$('rotgo').addEventListener('click', toggleFs);","$('rotgo').addEventListener('click', () => { rotDismissed = true; rotEl.hidden = true; toggleFs(); });")
open('/mnt/user-data/outputs/bean_world_game.html','w',encoding='utf-8').write(s)
j=s.rfind('<script>')+8;open('/home/claude/chk.js','w').write(s[j:s.rfind('</script>')])
