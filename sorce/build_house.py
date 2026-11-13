# يبني index.html الجديد من index.html الأصلي + source/bean-house.js (البيت)
import os, re, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(root, 'index.original.html')
if not os.path.exists(src):
    shutil.copy(os.path.join(root, 'index.html'), src)
s = open(src, encoding='utf-8').read()
lib = open(os.path.join(root, 'source', 'bean-house.js'), encoding='utf-8').read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70])
    s = s.replace(a, b)

# موقع البيت في العالم (الباب يواجه نقطة البداية)
HX, HZ = -3, 13

# 1) CSS + زر الدخول
css = r'''
#enterBtn{position:fixed;left:50%;bottom:calc(var(--m) + var(--sb) + 14px);transform:translateX(-50%) skewX(-8deg);z-index:5;display:none;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 30px;border:0;border-radius:8px;cursor:pointer;background:var(--acc);color:#14181f;font:900 20px/1 Cairo,system-ui,sans-serif;box-shadow:0 5px 0 #c99a14,0 10px 26px rgba(255,210,63,.4);animation:ebob .9s ease-in-out infinite alternate;-webkit-tap-highlight-color:transparent}
body.inworld #enterBtn.on{display:flex}
#enterBtn:active{animation:none;transform:translateX(-50%) skewX(-8deg) translateY(4px);box-shadow:0 1px 0 #c99a14}
@keyframes ebob{to{transform:translateX(-50%) skewX(-8deg) translateY(-4px)}}
'''
rep('</style>', css + '</style>')
btn = '<button id="enterBtn" aria-label="دخول"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4a1 1 0 011-1h9l4 2v16M3 21h18M12 12v.01"/></svg><span id="enterTx">دخول البيت</span></button>'
rep('<div id="err" hidden>', btn + '<div id="err" hidden>')

# 2) موقع البيت + تنظيف المنطقة حوله من الأشجار والصخور والزهور
rep('const blockers = [];', 'const HOUSE = { x: %d, z: %d };\nconst blockers = [];' % (HX, HZ))
rep("if (Math.hypot(x - 15, z + 10) < 8) continue;", "if (Math.hypot(x - 15, z + 10) < 8 || Math.hypot(x - HOUSE.x, z - HOUSE.z) < 9) continue;")
rep("if (Math.hypot(x - 15, z + 10) < 7) continue;", "if (Math.hypot(x - 15, z + 10) < 7 || Math.hypot(x - HOUSE.x, z - HOUSE.z) < 8) continue;")
rep("if (Math.hypot(x - 15, z + 10) < 6.5) continue;", "if (Math.hypot(x - 15, z + 10) < 6.5 || Math.hypot(x - HOUSE.x, z - HOUSE.z) < 7) continue;")

# 3) مكتبة البيت قبل تعريف العالم
rep('const GLB=', lib + '\nconst GLB=')

# 4) الربط مع اللعبة
glue = r'''
/* ===================== البيت: الخارج في العالم + الداخل مشهد منفصل ===================== */
const HI = { x: 1000, z: 1000 }, SUN0 = sun.intensity;
const hExt = BeanHouse.exterior({ THREE, scene, bake, vcMat, x: HOUSE.x, z: HOUSE.z });
hExt.blockers.forEach(b => blockers.push(b));
const hInt = BeanHouse.interior({ THREE, scene, bake, vcMat, ix: HI.x, iz: HI.z });
hInt.group.visible = false; scene.add(hInt.group);
let inHouse = false, enterShown = false, enterLbl = '';
const enterBtn = $('enterBtn'), enterTx = $('enterTx');
function setHouse(on, silent) {
  if (seat) { seat = null; if (act === NAMES.sit || act === NAMES.sleep) act = null; sitHold = false; } pos.y = 0;
  inHouse = on; hInt.group.visible = on; hInt.showAllWalls();
  if (on) { pos.set(HI.x + hInt.spawn.x, 0, HI.z + hInt.spawn.z); face_ = Math.PI; yaw = 0; pitch = .3; dist = 4.6; }
  else { pos.set(hExt.out.x, 0, hExt.out.z); face_ = Math.PI; yaw = Math.PI; pitch = .38; dist = 7.5; }
  intro = 0; snap = true; vy = 0; grounded = true; speed = 0;
  amb.visible = !on && QLV[QL].amb > 0; sun.intensity = on ? .6 : SUN0;
  if (!silent) enterShown = false;
}
let enterKind = '', curSpot = null, seat = null;
function sitDown(s) {
  if (seat || act === NAMES.jump || act === NAMES.sit || act === NAMES.sleep || !grounded) return;
  seat = { spot: s, leaving: false, wantLeave: false }; setEmos(false); startAct(s.kind === 'sleep' ? 'sleep' : 'sit');
}
function leaveSeat() { if (!seat || seat.leaving) return; if (sitHold) { seat.leaving = true; standUp(); } else seat.wantLeave = true; }
function houseGo() {
  if (!enterShown || veilBusy || mode !== 'world') return;
  if (enterKind === 'seat') sitDown(curSpot); else if (enterKind === 'unseat') leaveSeat(); else veil(() => setHouse(!inHouse));
}
enterBtn.addEventListener('click', houseGo);
addEventListener('keydown', e => { if (e.code === 'KeyE' || e.code === 'Enter') houseGo(); });
/* أحرف Z تطفو فوق الرأس أثناء النوم */
const zTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.font = '900 52px Cairo, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = '#2f4a8a'; g.fillStyle = '#ffffff'; g.strokeText('Z', 32, 34); g.fillText('Z', 32, 34); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; })();
const zs = [0, 1, 2].map(() => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); return m; });
function seatTick(dt) {
  if (seat) {
    const s = seat.spot, cur = act ? acts[act] : null, inClip = act === NAMES.sit || act === NAMES.sleep;
    if (!inClip) { seat = null; pos.y = 0; }
    else {
      if (seat.wantLeave && sitHold) { seat.wantLeave = false; seat.leaving = true; standUp(); }
      if (!seat.leaving && !sitHold && cur.time > cur.getClip().duration * .6) seat.leaving = true;
      const k = 1 - Math.exp(-dt * (seat.leaving ? 6 : 9));
      if (!seat.leaving) {
        pos.x += (HI.x + s.x - pos.x) * k; pos.z += (HI.z + s.z - pos.z) * k; pos.y += (s.lift - pos.y) * k;
        let d = s.face - face_; d = Math.atan2(Math.sin(d), Math.cos(d)); face_ += d * Math.min(1, dt * 10);
      } else { pos.x += (HI.x + s.stand.x - pos.x) * k; pos.z += (HI.z + s.stand.z - pos.z) * k; pos.y += (0 - pos.y) * k; }
    }
  }
  const lying = !!seat && seat.spot.kind === 'sleep' && act === NAMES.sleep && sitHold, T = performance.now() / 1000;
  zs.forEach((z, i) => {
    if (!lying) { if (z.visible) { z.visible = false; z.material.opacity = 0; } return; }
    const p = (T * .32 + i / 3) % 1; z.visible = true; z.position.set(pos.x + .2 + p * .4, pos.y + 1.05 + p * .9, pos.z - .75); z.material.opacity = Math.sin(p * Math.PI) * .95; z.scale.setScalar(.22 + .26 * p);
  });
}
function houseTick(dt) {
  let show = false, lbl = '', kind = '', spot = null;
  if (mode === 'world' && !entering && !veilBusy) {
    if (!inHouse) { if (Math.hypot(pos.x - hExt.door.x, pos.z - hExt.door.z) < 2.6) { show = true; lbl = 'دخول البيت'; kind = 'enter'; } }
    else if (seat) { if (!seat.leaving) { show = true; kind = 'unseat'; lbl = seat.spot.kind === 'sleep' ? 'استيقاظ' : 'قيام'; } }
    else if (Math.hypot(pos.x - (HI.x + hInt.exit.x), pos.z - (HI.z + hInt.exit.z)) < hInt.exit.r) { show = true; lbl = 'خروج'; kind = 'exit'; }
    else if (!act || act === NAMES.wave) {
      let best = 1e9;
      for (const s of hInt.spots) { const d = Math.hypot(pos.x - (HI.x + s.x), pos.z - (HI.z + s.z)) - s.r; if (d < 0 && d < best) { best = d; spot = s; } }
      if (spot) { show = true; lbl = spot.label; kind = 'seat'; }
    }
  }
  curSpot = spot; enterKind = kind;
  if (show !== enterShown) { enterShown = show; enterBtn.classList.toggle('on', show); }
  if (show && lbl !== enterLbl) { enterLbl = lbl; enterTx.textContent = lbl; }
  if (inHouse) { seatTick(dt || .016); hInt.updateWalls(cam.position.x, cam.position.z); }
}
if (document.fonts && document.fonts.load) document.fonts.load('900 38px Cairo').then(() => hExt.drawSign()).catch(() => {});
'''

# ===== تفاعل البيت: حركة النوم + جلوس/نوم على الأثاث =====
SLEEP = "    /* نوم: يجلس ثم يستلقي على ظهره ويتنفس ببطء ثم يقوم (حلقة 7 ثوانٍ، تتوقف عند u≈.5 مثل الجلوس) */\n    { name: 'نوم', dur: 7, fn: function (t) {\n      var u = t / (2 * PI), up = u < .5 ? sm(u / .08) : 1 - sm((u - .94) / .06), dn = u < .5 ? sm((u - .08) / .1) : 1 - sm((u - .86) / .1);\n      var sit = up * (1 - dn), phi = 1.5 * sit, br = S(3 * t) * dn;\n      return { hp: [0, mixv(mixv(.5, .25, up), .2, dn) + .008 * br, 0], Hips: [-1.5708 * dn + .1 * sit, 0, 0], Spine: [.03 * br, 0, 0],\n        Shoulder_L: [-.45 * sit, 0, .3 * up + .02 * br], Shoulder_R: [-.45 * sit, 0, -.3 * up - .02 * br], Elbow_L: [0, 0, .15 * up], Elbow_R: [0, 0, -.15 * up],\n        Thigh_L: [-phi, 0, .12 * up], Thigh_R: [-phi, 0, -.12 * up], Foot_L: [.2 * sit, 0, 0], Foot_R: [.2 * sit, 0, 0] };\n    } },\n\n"
rep("    /* قفز: انحناء", SLEEP + "    /* قفز: انحناء")
rep("const NAMES = { jump: 'قفز', wave: 'تلويح', sit: 'جلوس', d1: 'ديسكو', d2: 'حفلة' };", "const NAMES = { jump: 'قفز', wave: 'تلويح', sit: 'جلوس', sleep: 'نوم', d1: 'ديسكو', d2: 'حفلة' };")
rep("function startAct(key) {\n  const n = NAMES[key]; if (!n) return;", "function startAct(key) {\n  const n = NAMES[key]; if (!n) return;\n  if (seat && key === 'jump') { leaveSeat(); return; }")
rep("else if (key === 'sit') a.setLoop(THREE.LoopOnce, 1);", "else if (key === 'sit' || key === 'sleep') a.setLoop(THREE.LoopOnce, 1);")
rep("function standUp() { if (act === NAMES.sit && sitHold) {", "function standUp() { if ((act === NAMES.sit || act === NAMES.sleep) && sitHold) {")
rep("if (moving && act && act !== NAMES.jump) { if (act === NAMES.sit) { if (sitHold) standUp(); } else act = null; }", "if (moving && act && act !== NAMES.jump) { if (seat) leaveSeat(); else if (act === NAMES.sit || act === NAMES.sleep) { if (sitHold) standUp(); } else act = null; }")
rep("const sitting = act === NAMES.sit;", "const sitting = act === NAMES.sit || act === NAMES.sleep;")
rep("if (act === NAMES.sit && !sitHold && a.time >= a.getClip().duration * .5", "if ((act === NAMES.sit || act === NAMES.sleep) && !sitHold && a.time >= a.getClip().duration * .5")

rep('applyLevel(); rs(); chkOri();\n', glue + 'applyLevel(); rs(); chkOri();\n')
# تجميع شيدرز الداخل مسبقاً
rep('stageOn(false); renderer.compile(scene, cam);', 'stageOn(false); renderer.compile(scene, cam); hInt.group.visible = true; renderer.compile(scene, cam); hInt.group.visible = false;')

# 5) تعديلات الحلقة الرئيسية
rep('const R = Math.hypot(pos.x, pos.z); if (R > 66)', 'const R = inHouse ? 0 : Math.hypot(pos.x, pos.z); if (R > 66)')
rep('for (const b of blockers) {', 'if (inHouse) BeanHouse.collide(pos, hInt); else for (const b of blockers) {')
rep('cam.lookAt(sx, sy, sz);\n  sun.position.set', 'if (inHouse) hInt.clampCam(cam.position, sx, sy, sz); cam.lookAt(sx, sy, sz);\n  sun.position.set')
rep('const port = innerHeight > innerWidth;', 'if (inHouse) { pitch = Math.max(.12, Math.min(.8, pitch)); dist = Math.max(2.4, Math.min(5.5, dist)); }\n  const port = innerHeight > innerWidth;')
rep('  fxUpdate(dt);\n  renderer.render(scene, cam);', '  houseTick(dt); fxUpdate(dt);\n  renderer.render(scene, cam);')
# الخروج للّوبي أثناء وجودك داخل البيت
rep("function goLobby(){mode='lobby';", "function goLobby(){if(inHouse)setHouse(false,true);mode='lobby';")

open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(s)
j = s.rfind('<script>') + 8
open('/home/claude/chk2.js', 'w').write(s[j:s.rfind('</script>')])
print('ok', len(s))
