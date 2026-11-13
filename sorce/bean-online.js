/* ===================== أونلاين: لاعبون آخرون في نفس العالم =====================
   - النقل: Supabase Realtime (Broadcast فقط، بدون جداول ولا سيرفر خاص) عند ضبط BW_ONLINE.url/key.
     بدون ضبط: وضع تجريبي عبر BroadcastChannel (تبويبات نفس المتصفح فقط) لاختبار سريع.
   - كل لاعب يرسل حالته (موقع/اتجاه/حركة/شكل) ~10 مرات بالثانية فقط أثناء الحركة، ونبضة كل ثانيتين وهو ساكن.
   - كل لاعب آخر يُرسم بنسخة كاملة من البين (جسم + وجه + إكسسوارات + أنميشن) مع اسمه فوق رأسه.
   - يعتمد على متغيرات اللعبة العامة: mode, look, act, speed, face_, pos, inHouse, NAMES, keyOf ... */
const Online = (() => {
  const CFG = Object.assign({ url: '', key: '', room: 'bean-world' }, window.BW_ONLINE || {});
  let qr = null; try { qr = new URLSearchParams(location.search).get('room'); } catch (e) {}
  const ROOM = String(qr || CFG.room || 'bean-world').replace(/[^\w-]/g, '').slice(0, 40) || 'bean-world';
  const REAL = !!(CFG.url && CFG.key);
  const SB_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0/dist/umd/supabase.js';
  const MAX = 12, TIMEOUT = 7000, SEND_DT = .1, BEAT = 2;
  const sid = Math.random().toString(36).slice(2, 10);
  const chip = $('onl'), remotes = new Map(), pool = [], validAcc = new Set(acc.list.map(a => a.id));
  const num = (v, d) => Number.isFinite(v) ? v : (d || 0), pos2 = v => Math.max(-3000, Math.min(3000, num(v)));
  const r2 = v => Math.round(v * 100) / 100, r1 = v => Math.round(v * 10) / 10;
  let tp = null, on = false, up = false, everUp = false, chk = 0, beat = 0, lastSig = '';

  /* ───────── الحالة في الشريط الصغير ───────── */
  function setChip(s) {
    if (!chip) return;
    if (!s) { chip.classList.remove('on'); return; }
    chip.textContent = s; chip.classList.add('on');
  }
  function status() {
    if (!on) return setChip('');
    if (!up) return setChip(everUp ? 'انقطع الاتصال… يعيد المحاولة' : (tp && tp.failed ? 'تعذر الاتصال' : 'يتصل…'));
    const n = remotes.size;
    if (tp && tp.kind === 'local') return setChip('تجريبي (نفس المتصفح) · ' + (n ? n + ' معك' : 'بمفردك'));
    setChip(!n ? 'أونلاين · بمفردك' : n === 1 ? 'أونلاين · لاعب معك' : n === 2 ? 'أونلاين · لاعبان معك' : n <= 10 ? 'أونلاين · ' + n + ' لاعبين معك' : 'أونلاين · ' + n + ' لاعباً معك');
  }

  /* ───────── النقل ───────── */
  function loadScript() {
    return new Promise((res, rej) => {
      if (window.supabase && window.supabase.createClient) return res();
      const s = document.createElement('script'); s.src = SB_JS; s.onload = () => res(); s.onerror = () => rej(new Error('supabase-js load failed'));
      document.head.appendChild(s);
    });
  }
  function mkTransport(onMsg, onUp) {
    let closed = false, ready = false;
    const set = (v, why) => { if (closed) return; if (ready !== v || !v) { ready = v; onUp(v, why); } };
    if (REAL) {
      let sb = null, ch = null;
      return {
        kind: 'net',
        async open() {
          await loadScript();
          if (closed) return;
          sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, realtime: { params: { eventsPerSecond: 20 } } });
          ch = sb.channel('bw-' + ROOM, { config: { broadcast: { self: false, ack: false } } });
          ch.on('broadcast', { event: 'm' }, e => { if (!closed && e && e.payload) onMsg(e.payload); });
          ch.subscribe(s => { if (s === 'SUBSCRIBED') set(true); else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') set(false, s); });
        },
        send(p) { if (ready && ch) { try { ch.send({ type: 'broadcast', event: 'm', payload: p }); } catch (e) {} } },
        close() { closed = true; ready = false; try { if (sb && ch) sb.removeChannel(ch); } catch (e) {} }
      };
    }
    if (typeof BroadcastChannel === 'undefined') return null;
    let bc = null;
    return {
      kind: 'local',
      async open() { bc = new BroadcastChannel('bw-' + ROOM); bc.onmessage = e => { if (!closed && e.data) onMsg(e.data); }; set(true); },
      send(p) { if (ready && bc) { try { bc.postMessage(p); } catch (e) {} } },
      close() { closed = true; ready = false; try { if (bc) bc.close(); } catch (e) {} }
    };
  }

  /* ───────── نسخة بين للاعب آخر (تُعاد تدويرها عند الخروج لتفادي التسريب) ───────── */
  function mkRig() {
    const L = loadGLB(Uint8Array.from(atob(GLB), c => c.charCodeAt(0)).buffer), rm = L.mesh, cl = L.clips.concat(BeanDance.make(THREE));
    cl.forEach(c => { c.tracks = c.tracks.filter(t => !t.name.startsWith('Head.')); });
    const g = new THREE.Group(); rm.scale.setScalar(.75); rm.castShadow = true; g.add(rm);
    const fc = BeanFace.attach(THREE, rm.material, 256), bn = rm.skeleton.bones;
    const ac = BeanAcc.create(THREE, bn.find(b => b.name === 'Head'), bn.find(b => b.name === 'Chest'));
    const mx = new THREE.AnimationMixer(rm), acts = {}, W = {}, TW = {};
    cl.forEach(c => { const a = mx.clipAction(c); acts[c.name] = a; W[c.name] = 0; TW[c.name] = 0; a.setEffectiveWeight(0); a.play(); });
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true })); sp.scale.set(1.8, .45, 1); sp.position.y = 2.35; g.add(sp);
    const bl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), blob.material.clone()); bl.rotation.x = -Math.PI / 2; bl.renderOrder = 1; bl.visible = false;
    const R = { g, rm, fc, ac, mx, acts, W, TW, cv, tx, bl, id: '', name: '', lookSig: '', act: null, tail: null, hold: false, key: '', sp: 0, tsp: 0, seen: false, t: 0, tx_: 0, ty: 0, tz: 0, tr: 0, h: 0 };
    mx.addEventListener('finished', e => {
      if (R.act && R.acts[R.act] === e.action) { R.act = null; R.hold = false; }
      if (R.tail && R.acts[R.tail] === e.action) R.tail = null;
    });
    return R;
  }
  function drawTag(R) {
    const c = R.cv.getContext('2d'); c.clearRect(0, 0, 512, 128);
    if (R.name) {
      c.fillStyle = 'rgba(20,35,63,.78)'; c.beginPath(); c.rect(8, 24, 496, 80); c.fill();
      c.fillStyle = '#fff'; c.font = '700 46px Cairo,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(R.name, 256, 66);
    }
    R.tx.needsUpdate = true;
  }
  function spawn(id) {
    const R = pool.pop() || mkRig();
    R.id = id; R.name = ''; R.lookSig = ''; R.act = null; R.tail = null; R.hold = false; R.key = ''; R.sp = R.tsp = 0; R.seen = false; R.t = performance.now(); R.h = 0;
    for (const n in R.acts) { const a = R.acts[n]; R.W[n] = 0; R.TW[n] = 0; a.paused = false; a.reset(); a.setEffectiveTimeScale(1); a.setEffectiveWeight(0); a.play(); }
    R.g.visible = false; R.bl.visible = false; drawTag(R);
    scene.add(R.g, R.bl);
    return R;
  }
  function drop(id) {
    const R = remotes.get(id); if (!R) return;
    remotes.delete(id); scene.remove(R.g, R.bl); R.g.visible = false; pool.push(R);
    if (R.name && mode === 'world') toast(R.name + ' خرج من العالم');
    status();
  }

  /* ───────── استقبال حالة لاعب ───────── */
  function setLook(R, l) {
    if (!l || typeof l !== 'object') return;
    const col = typeof l.c === 'string' && /^#[0-9a-fA-F]{6}$/.test(l.c) ? l.c : COL[0];
    const ex = BeanFace.expressions.includes(l.e) ? l.e : 'happy';
    const ids = (Array.isArray(l.a) ? l.a : []).filter(x => validAcc.has(x)).slice(0, 8);
    const sig = col + '|' + ex + '|' + ids.join(',');
    if (sig === R.lookSig) return;
    R.lookSig = sig; R.fc.set(col, ex); R.ac.setColor(col); R.ac.clear(); ids.forEach(id => R.ac.toggle(id));
  }
  function setAct(R, key) {
    const n = NAMES[key] || null, prev = R.act;
    if ((prev === NAMES.sit || prev === NAMES.sleep) && R.hold) {                     // قيام من الجلوس/النوم: نكمل بقية الأنميشن
      const a = R.acts[prev]; a.paused = false; a.setEffectiveTimeScale(1); a.time = a.getClip().duration * .86; R.hold = false; R.tail = prev;
    }
    R.act = n; if (!n) return;
    if (R.tail === n) R.tail = null;
    const a = R.acts[n]; a.reset(); R.hold = false;
    if (key === 'jump') a.setLoop(THREE.LoopOnce, 1); else if (key === 'wave') a.setLoop(THREE.LoopRepeat, 3); else if (key === 'sit' || key === 'sleep') a.setLoop(THREE.LoopOnce, 1); else a.setLoop(THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = false; a.setEffectiveTimeScale(key === 'jump' ? .8 : 1); a.play();
    if (key === 'jump') a.time = a.getClip().duration * .30;
  }
  function onMsg(m) {
    if (!on || !m || typeof m !== 'object' || typeof m.i !== 'string' || m.i === sid) return;
    if (m.t === 'b') { drop(m.i); return; }
    if (m.t === 'j') { beat = BEAT; chk = SEND_DT; return; }                     // لاعب جديد دخل ← نرسل حالتنا فوراً
    if (m.t !== 's' || !Array.isArray(m.p)) return;
    let R = remotes.get(m.i);
    if (!R) { if (remotes.size >= MAX) return; R = spawn(m.i); remotes.set(m.i, R); status(); }
    R.t = performance.now();
    R.tx_ = pos2(m.p[0]); R.ty = Math.max(-1, Math.min(20, num(m.p[1]))); R.tz = pos2(m.p[2]); R.tr = num(m.r); R.tsp = Math.max(0, Math.min(8, num(m.v))); R.h = m.h ? 1 : 0;
    if (!R.seen) {
      R.seen = true; R.g.position.set(R.tx_, R.ty, R.tz); R.g.rotation.y = R.tr;
      const nm = typeof m.n === 'string' ? m.n.slice(0, 16) : '';
      if (nm && mode === 'world') toast(nm + ' دخل العالم');
    }
    if (typeof m.n === 'string') { const nm = m.n.slice(0, 16); if (nm !== R.name) { R.name = nm; drawTag(R); } }
    setLook(R, m.l);
    const k = typeof m.k === 'string' ? m.k : '';
    if (k !== R.key) { R.key = k; setAct(R, k); }
  }

  /* ───────── إرسال حالتنا ───────── */
  function snap() {
    let nm = 'bean'; try { nm = U().name; } catch (e) {}
    return { t: 's', i: sid, n: nm, l: { c: look.col, e: look.expr, a: look.acc.slice() }, p: [r2(pos.x), r2(pos.y), r2(pos.z)], r: r2(face_), k: act ? keyOf(act) || '' : '', v: r1(speed), h: inHouse ? 1 : 0 };
  }

  /* ───────── تحديث اللاعبين الآخرين كل إطار ───────── */
  function tickRemote(R, dt, now) {
    const g = R.g, p = g.position, stale = now - R.t;
    const k = 1 - Math.exp(-dt * 12), dx = R.tx_ - p.x, dz = R.tz - p.z;
    if (dx * dx + dz * dz > 64) p.set(R.tx_, R.ty, R.tz); else { p.x += dx * k; p.z += dz * k; p.y += (R.ty - p.y) * Math.min(1, dt * 16); }
    let d = R.tr - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 12);
    R.sp += ((stale > 600 ? 0 : R.tsp) - R.sp) * Math.min(1, dt * 9);
    const sp = R.sp, runW = cl01((sp - WALK_V * .9) / (RUN_V * .55 - WALK_V * .9)), walkW = cl01(sp / 1.1) * (1 - runW), idleW = Math.max(0, 1 - cl01(sp / 1.1));
    for (const n in R.TW) R.TW[n] = 0;
    const cur = R.act || R.tail;
    if (cur) R.TW[cur] = 1; else { R.TW.Idle = idleW; R.TW.Walk = walkW; R.TW.Run = runW; }
    if (R.act && (R.act === NAMES.sit || R.act === NAMES.sleep) && !R.hold) { const a = R.acts[R.act]; if (a.time >= a.getClip().duration * .5 && a.time < a.getClip().duration * .6) { R.hold = true; a.paused = true; } }
    for (const n in R.W) { const kk = Math.min(1, dt * (cur && n === cur ? 14 : 10)); R.W[n] += (R.TW[n] - R.W[n]) * kk; R.acts[n].setEffectiveWeight(R.W[n] < .002 ? 0 : R.W[n]); }
    R.acts.Walk.setEffectiveTimeScale(Math.max(.6, Math.min(1.5, sp / 2.2)));
    R.acts.Run.setEffectiveTimeScale(Math.max(.8, Math.min(1.25, sp / 5.4)));
    R.ac.update(dt); R.mx.update(dt);
    const vis = mode === 'world' && R.seen && R.h === (inHouse ? 1 : 0);          // من في البيت لا يُرى من الخارج والعكس
    g.visible = vis;
    const bv = vis && !renderer.shadowMap.enabled; R.bl.visible = bv;
    if (bv) { const s = 1 - Math.min(p.y * .1, .5); R.bl.position.set(p.x, .03, p.z); R.bl.scale.set(s, s, s); R.bl.material.opacity = s; }
  }
  function tick(dt) {
    if (!on) return;
    const now = performance.now();
    if (up && mode === 'world') {
      chk += dt; beat += dt;
      if (chk >= SEND_DT) {
        chk = 0; const m = snap(), sig = m.p.join() + '|' + m.r + '|' + m.k + '|' + m.v + '|' + m.h;
        if (sig !== lastSig || beat >= BEAT) { tp.send(m); lastSig = sig; beat = 0; }
      }
    }
    let gone = null;
    remotes.forEach(R => { if (now - R.t > TIMEOUT) (gone || (gone = [])).push(R.id); else tickRemote(R, dt, now); });
    if (gone) gone.forEach(drop);
  }

  /* ───────── بدء/إيقاف (يُستدعى عند دخول/خروج العالم) ───────── */
  async function start() {
    if (on) return;
    on = true; up = false; everUp = false; chk = beat = 0; lastSig = '';
    const t = tp = mkTransport(onMsg, (v) => {
      if (tp !== t) return; up = v; if (v) { everUp = true; t.send({ t: 'j', i: sid }); beat = BEAT; chk = SEND_DT; } status();
    });
    if (!t) { on = false; return; }
    status();
    try { await t.open(); } catch (e) { if (tp === t) { t.failed = true; status(); } }
  }
  function stop() {
    if (!on) return;
    const t = tp; on = false; up = false; tp = null;
    if (t) { try { t.send({ t: 'b', i: sid }); } catch (e) {} setTimeout(() => { try { t.close(); } catch (e) {} }, 200); }
    [...remotes.keys()].forEach(id => { const R = remotes.get(id); remotes.delete(id); scene.remove(R.g, R.bl); R.g.visible = false; pool.push(R); });
    setChip('');
  }
  addEventListener('pagehide', () => { try { if (on && up && tp) tp.send({ t: 'b', i: sid }); } catch (e) {} });
  let errd = false;
  const safe = f => (...a) => { try { return f(...a); } catch (e) { if (!errd) { errd = true; console.error('[online]', e); } } };
  return { mode: safe(m => { if (m === 'world') start(); else stop(); }), tick: safe(tick), _sid: sid, _remotes: remotes };
})();
