/* bean-house.js — بيت صغير للبين.
   exterior(ctx)  : الشكل الخارجي فقط (ديكور + تصادم) — يوضع في العالم.
   interior(ctx)  : مشهد داخلي منفصل تماماً (غرفة نوم · صالة · مطبخ) يُبنى بعيداً عن العالم، ويُنقل اللاعب إليه عند الدخول.
   collide(pos,I) : تصادم اللاعب مع أثاث وجدران الداخل.
   كل شيء يُبنى بالكود ويُدمج في شبكات قليلة بألوان رؤوس (أداء عالٍ). */
const BeanHouse = (function () {
  'use strict';
  let G = null;
  function geos(THREE) {
    if (G) return G;
    G = { box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(.5, .5, 1, 14), sph: new THREE.SphereGeometry(.5, 12, 9), cone: new THREE.ConeGeometry(.5, 1, 9), roof: new THREE.ConeGeometry(1, 1, 4, 1) };
    G.roof.rotateY(Math.PI / 4);               // هرم محاذٍ للمحاور (ضلعه √2)
    return G;
  }
  /* جامع أجزاء: إحداثيات محلية حول (ox,oz). flip = تدوير 180° ليكون الباب نحو -z */
  function Parts(THREE, ox, oz, flip) {
    const g = geos(THREE), list = [];
    const add = (geo, x, y, z, w, h, d, c, ry) => {
      list.push({ g: geo, x: flip ? ox - x : ox + x, y, z: flip ? oz - z : oz + z, sx: w, sy: h, sz: d, ry: (ry || 0) + (flip ? Math.PI : 0), c });
    };
    const P = { list,
      box: (x, y, z, w, h, d, c) => add(g.box, x, y, z, w, h, d, c),
      cyl: (x, y, z, w, h, d, c) => add(g.cyl, x, y, z, w, h, d, c),
      sph: (x, y, z, w, h, d, c) => add(g.sph, x, y, z, w, h, d, c),
      cone: (x, y, z, w, h, d, c) => add(g.cone, x, y, z, w, h, d, c),
      roof: (x, y, z, w, h, d, c) => add(g.roof, x, y, z, w / 1.4142, h, d / 1.4142, c),
      seg: (x0, x1, z0, z1, y0, y1, c) => add(g.box, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, c) };
    return P;
  }
  /* يحلّ تشويش التداخل: وجهان متطابقان في نفس المستوى ونفس الاتجاه => الأصغر مساحةً يُدفع للخارج قليلاً */
  function fixZ(list, box) {
    const E = [];
    list.forEach(o => { if (o.g === box) { const hx = o.sx / 2, hy = o.sy / 2, hz = o.sz / 2; E.push({ o, e: [o.x - hx, o.x + hx, o.y - hy, o.y + hy, o.z - hz, o.z + hz] }); } });
    const EPS = 1e-4, MINOV = .012, PUSH = .006, ov = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);   // MINOV: شرائح أصغر من 1.2سم لا تُرى
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
        const A = E[i].e, B = E[j].e;
        for (let a = 0; a < 3; a++) {
          const b1 = (a + 1) % 3, b2 = (a + 2) % 3;
          if (ov(A[b1 * 2], A[b1 * 2 + 1], B[b1 * 2], B[b1 * 2 + 1]) < MINOV || ov(A[b2 * 2], A[b2 * 2 + 1], B[b2 * 2], B[b2 * 2 + 1]) < MINOV) continue;
          for (let sd = 0; sd < 2; sd++) {
            if (Math.abs(A[a * 2 + sd] - B[a * 2 + sd]) > EPS) continue;
            if (a === 1 && sd === 0 && A[2] < .05) continue;                  // وجوه سفلية ملاصقة للأرض لا تُرى
            const areaA = (A[b1 * 2 + 1] - A[b1 * 2]) * (A[b2 * 2 + 1] - A[b2 * 2]), areaB = (B[b1 * 2 + 1] - B[b1 * 2]) * (B[b2 * 2 + 1] - B[b2 * 2]);
            const mv = areaA < areaB - 1e-9 ? A : B;
            mv[a * 2 + sd] += sd ? PUSH : -PUSH; moved = true;
          }
        }
      }
      if (!moved) break;
    }
    E.forEach(({ o, e }) => { o.x = (e[0] + e[1]) / 2; o.sx = e[1] - e[0]; o.y = (e[2] + e[3]) / 2; o.sy = e[3] - e[2]; o.z = (e[4] + e[5]) / 2; o.sz = e[5] - e[4]; });
  }
  const FL = ['#ff5d8f', '#ffd23f', '#ffffff', '#b583ff', '#ff9248'];

  /* ============================ الخارج ============================ */
  function exterior(ctx) {
    const { THREE, bake, vcMat, x: HX, z: HZ } = ctx;
    const p = Parts(THREE, HX, HZ, true), gl = Parts(THREE, HX, HZ, true);   // الواجهة نحو -z
    const W = 7, D = 5, fz = D / 2;
    p.box(0, .125, 0, 7.5, .25, 5.5, '#b8b2a7');                  // أساس
    p.box(0, 1.625, 0, W, 2.75, D, '#fff0d4');                    // الجسم
    p.box(0, .38, 0, W + .06, .26, D + .06, '#f0d9aa');           // شريط سفلي
    p.roof(0, 4.2, 0, 8.2, 2.4, 6.2, '#e8262b');                  // السقف
    p.box(0, 3.02, 0, 8.2, .1, 6.2, '#b81d22');                   // حافة السقف
    p.box(2.3, 4.3, -.9, .8, 1.6, .8, '#b5523b'); p.box(2.3, 5.15, -.9, 1.0, .15, 1.0, '#7a3a2a');   // مدخنة
    /* الباب */
    p.box(0, 1.4, fz + .03, 1.5, 2.3, .1, '#ffffff');
    p.box(0, 1.35, fz + .08, 1.2, 2.2, .1, '#8b5a2b');
    [-.28, .28].forEach(s => { p.box(s, 1.0, fz + .14, .4, .7, .03, '#7a4c22'); p.box(s, 1.85, fz + .14, .4, .5, .03, '#7a4c22'); });
    p.sph(.4, 1.3, fz + .17, .16, .16, .16, '#ffc81e');
    p.box(0, .075, fz + .5, 2.0, .15, .8, '#9aa0a8');             // عتبة
    p.box(1.15, 2.1, fz + .12, .2, .32, .2, '#3a2a1a'); gl.box(1.15, 2.1, fz + .16, .14, .24, .14, '#ffe08a');   // فانوس
    /* نوافذ أمامية */
    [-2.2, 2.2].forEach(s => {
      p.box(s, 1.75, fz + .03, 1.5, 1.3, .1, '#ffffff');
      gl.box(s, 1.75, fz + .08, 1.2, 1.0, .1, '#9fdcff');
      p.box(s, 1.75, fz + .14, .06, 1.0, .04, '#ffffff'); p.box(s, 1.75, fz + .14, 1.2, .06, .04, '#ffffff');
      p.box(s - .95, 1.75, fz + .05, .35, 1.3, .06, '#2f8fe0'); p.box(s + .95, 1.75, fz + .05, .35, 1.3, .06, '#2f8fe0');
      p.box(s, .98, fz + .2, 1.4, .22, .32, '#8b5a2b');
      [-.5, -.17, .17, .5].forEach((o, i) => p.sph(s + o, 1.16, fz + .22, .24, .24, .24, FL[(i + (s > 0 ? 2 : 0)) % 5]));
    });
    /* نوافذ جانبية */
    [-1, 1].forEach(sd => {
      p.box(sd * (W / 2), 1.75, 0, .1, 1.3, 1.5, '#ffffff');
      gl.box(sd * (W / 2 + .04), 1.75, 0, .1, 1.0, 1.2, '#9fdcff');
      p.box(sd * (W / 2 + .08), 1.75, 0, .04, 1.0, .06, '#ffffff'); p.box(sd * (W / 2 + .08), 1.75, 0, .04, .06, 1.2, '#ffffff');
    });
    /* حديقة صغيرة: ممر + شجيرات + صندوق بريد */
    for (let i = 0; i < 6; i++) p.cyl(Math.sin(i * 1.1) * .25, .03, fz + 1.5 + i * .85, .9, .06, .7, '#d9c9a8');
    [[-3.4, fz - .2, 1.3, '#2f8f4e'], [3.4, fz - .2, 1.2, '#37a056'], [-4.1, 0, 1.0, '#3aa35a'], [4.1, 1.0, 1.0, '#2f8f4e'], [-3.7, -2.4, 1.1, '#37a056']].forEach(b => p.sph(b[0], b[3] ? .42 : .4, b[1], b[2], b[2] * .75, b[2], b[3]));
    [[-3.45, fz - .2], [3.35, fz - .2], [-4.1, 0]].forEach((b, i) => p.sph(b[0] + .3, .78, b[1] + .45, .2, .2, .2, FL[i]));
    p.box(2.6, .5, fz + 3.3, .12, 1, .12, '#8b5a2b'); p.box(2.6, 1.1, fz + 3.3, .4, .32, .55, '#e8262b'); p.box(2.78, 1.2, fz + 3.2, .04, .25, .04, '#ffd23f');
    for (let i = 0; i < 7; i++) { const a = i * .9, rx = -3.9 + (i % 4) * .35, rz = fz + 1.2 + (i >> 1) * .5; p.sph(rx, .12, rz, .2, .2, .2, FL[i % 5]); }
    /* لافتة فوق الباب */
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    function drawSign() {
      const g = cv.getContext('2d'); g.clearRect(0, 0, 256, 64);
      g.fillStyle = '#5b3a1e'; g.beginPath(); g.moveTo(10, 4); g.arcTo(252, 4, 252, 60, 14); g.arcTo(252, 60, 4, 60, 14); g.arcTo(4, 60, 4, 4, 14); g.arcTo(4, 4, 252, 4, 14); g.fill();
      g.strokeStyle = '#ffc81e'; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#ffe9b0'; g.font = '900 38px Cairo, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('بيتي', 128, 35);
      tex.needsUpdate = true;
    }
    drawSign();
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .38), new THREE.MeshBasicMaterial({ map: tex }));
    sign.position.set(HX, 2.78, HZ - (fz + .15)); sign.rotation.y = Math.PI;

    fixZ(p.list.concat(gl.list), geos(THREE).box);
    const mat = vcMat(), glMat = new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true });
    const mesh = bake(p.list, mat, true, true), glow = bake(gl.list, glMat, false, false);
    ctx.scene.add(sign);
    /* تصادم: حلقة دوائر حول البيت */
    const bl = [];
    for (let a = -W / 2 - .1; a <= W / 2 + .11; a += .7) { bl.push([HX + a, HZ - 2.8, .42], [HX + a, HZ + 2.8, .42]); }
    for (let a = -2.1; a <= 2.1; a += .7) { bl.push([HX - 3.65, HZ + a, .42], [HX + 3.65, HZ + a, .42]); }
    bl.push([HX - 2.6, HZ - (fz + 3.3), .3]);
    return { mesh, glow, sign, drawSign, blockers: bl, door: { x: HX, z: HZ - fz }, out: { x: HX, z: HZ - fz - 3.3 } };
  }

  /* ============================ الداخل ============================ */
  function interior(ctx) {
    const { THREE, bake, vcMat, ix, iz } = ctx;
    const grp = new THREE.Group();
    const F = Parts(THREE, ix, iz), GL = Parts(THREE, ix, iz);   // أرضيات + أثاث ثابت  |  أسطح مضيئة (شاشة، أباجورة)
    const boxes = [];                                              // تصادم [x0,z0,x1,z1] محلي
    const solid = (x0, z0, x1, z1) => boxes.push([x0, z0, x1, z1]);
    const H = 2.8, S = 1.5;                                        // S = معامل توسيع البيت من الداخل

    /* ---- الجزيرة + الأرضيات ---- */
    F.cyl(0, -1.1, 0, 36.6, 2, 36.6, '#a0693a');
    F.cyl(0, -.13, 0, 36, .12, 36, '#8ccf6e');
    [[-9.5, 7, 1.2], [-13, -3, 1.4], [10, 7.5, 1.3], [11.5, -6, 1.5], [-8, -8.5, 1.1], [2, -10.5, 1.3], [14, 1, 1.1], [-3, 11, 1.2]].forEach(t => {
      const s = t[2]; F.cyl(t[0], .9 * s, t[1], .6 * s, 1.8 * s, .6 * s, '#8a5a36'); F.cone(t[0], 3 * s, t[1], 3.4 * s, 2.6 * s, 3.4 * s, '#2f8f4e'); F.cone(t[0], 4.4 * s, t[1], 2.6 * s, 2.2 * s, 2.6 * s, '#3aa35a');
    });
    F.box(0, -.2, 0, 12.8, .3, 8.8, '#e8e0d0');                   // قاعدة البيت
    F.box(-3.75, -.05, 0, 4.5, .1, 8, '#d9a86a');                 // أرضية غرفة النوم
    F.box(2.25, -.05, 2, 7.5, .1, 4, '#ecd9b6');                  // أرضية الصالة
    for (let k = 0; k < 9; k++) F.box(-5.75 + k * .5, .003, 0, .02, .006, 8, '#b98a52');
    for (let k = 0; k < 15; k++) F.box(-1.25 + k * .5, .003, 2, .02, .006, 4, '#cfb78c');
    for (let i = 0; i < 10; i++) for (let j = 0; j < 5; j++) F.box(-1.5 + .75 * (i + .5), -.05, -4 + .8 * (j + .5), .75, .1, .8, (i + j) % 2 ? '#f4f1ea' : '#bfdbe6');   // مطبخ بلاط

    /* ---- الجدران الخارجية (كل جدار شبكة مستقلة لإخفائه حين تكون الكاميرا خلفه) ---- */
    const WB = Parts(THREE, ix, iz), WF = Parts(THREE, ix, iz), WL = Parts(THREE, ix, iz), WR = Parts(THREE, ix, iz);
    const PK = '#ffd9e6', YL = '#fff0b8', BL = '#d6ebff', WH = '#ffffff';
    /* خلفي (z=-4): نوم | مطبخ */
    WB.seg(-6.3, -1.5, -4.3, -4.0, 0, H, PK); WB.seg(-1.5, 6.3, -4.3, -4.0, 0, H, YL); WB.seg(-6.3, 6.3, -4.34, -3.96, H, H + .06, WH); WB.seg(-6, 6, -4.0, -3.96, 0, .14, WH);
    WB.seg(-5.0, -3.4, -3.98, -3.94, 1.5, 2.3, '#ffd23f'); WB.seg(-4.9, -3.5, -3.94, -3.9, 1.6, 2.2, '#ff7a9e');          // لوحة فوق السرير
    [[-1.2, .6], [.6, 2.4]].forEach((c, i) => { WB.seg(c[0], c[1] - .03, -4.0, -3.55, 1.55, 2.4, WH); WB.seg(c[1] - .04, c[1], -4.0, -3.53, 1.55, 2.4, '#d0d0d0'); WB.box((c[0] + c[1]) / 2, 1.7, -3.52, .06, .26, .04, '#ffc81e'); });   // خزائن علوية
    WB.seg(2.6, 3.8, -3.98, -3.94, 1.4, 2.4, '#bfe6ff'); WB.seg(2.55, 3.85, -3.96, -3.92, 1.35, 1.45, WH); WB.seg(2.55, 3.85, -3.96, -3.92, 2.35, 2.45, WH); WB.seg(3.17, 3.23, -3.96, -3.92, 1.35, 2.45, WH);   // نافذة مطبخ
    /* أمامي (z=+4) مع فتحة الباب x∈[3.9,5.1] */
    WF.seg(-6.3, -1.5, 4.0, 4.3, 0, H, PK); WF.seg(-1.5, 3.9, 4.0, 4.3, 0, H, BL); WF.seg(5.1, 6.3, 4.0, 4.3, 0, H, BL); WF.seg(3.9, 5.1, 4.0, 4.3, 2.3, H, BL); WF.seg(-6.3, 6.3, 3.96, 4.34, H, H + .06, WH); WF.seg(-6, 6, 3.96, 4.0, 0, .14, WH);
    /* أيسر (x=-6): غرفة النوم */
    WL.seg(-6.3, -6.0, -4, 4, 0, H, PK); WL.seg(-6.34, -5.96, -4, 4, H, H + .06, WH); WL.seg(-6.0, -5.96, -4, 4, 0, .14, WH);
    WL.seg(-6.0, -5.95, -2.3, -.7, 1.1, 2.3, '#bfe6ff'); WL.seg(-6.0, -5.93, -2.4, -.6, 1.05, 1.12, WH); WL.seg(-6.0, -5.93, -2.4, -.6, 2.28, 2.35, WH); WL.seg(-6.0, -5.93, -1.53, -1.47, 1.05, 2.35, WH);
    WL.seg(-6.0, -5.85, -2.6, -2.3, 1.0, 2.4, '#ff7fb0'); WL.seg(-6.0, -5.85, -.7, -.4, 1.0, 2.4, '#ff7fb0');            // ستائر
    /* أيمن (x=+6): مطبخ ثم صالة */
    WR.seg(6.0, 6.3, -4, 0, 0, H, YL); WR.seg(6.0, 6.3, 0, 4, 0, H, BL); WR.seg(5.96, 6.34, -4, 4, H, H + .06, WH); WR.seg(5.96, 6.0, -4, 4, 0, .14, WH);
    WR.seg(5.95, 6.0, -2.4, -1.0, 1.1, 2.3, '#bfe6ff'); WR.seg(5.93, 6.0, -2.5, -.9, 1.05, 1.12, WH); WR.seg(5.93, 6.0, -2.5, -.9, 2.28, 2.35, WH);
    WR.seg(5.95, 6.0, 1.5, 2.9, 1.65, 2.45, '#ffc81e'); WR.seg(5.92, 5.96, 1.62, 2.78, 1.75, 2.35, '#ff7a9e'); WR.seg(5.92, 5.96, 1.62, 2.2, 1.75, 2.05, '#2f6bff');   // لوحة فوق التلفاز

    /* ---- حاجز غرفة النوم (منخفض) + إطار باب الخروج ---- */
    F.seg(-1.6, -1.4, -4, 1.0, 0, 1.3, '#f4ede1'); F.seg(-1.6, -1.4, 2.4, 4, 0, 1.3, '#f4ede1');
    F.seg(-1.63, -1.37, -4, 1.0, 1.3, 1.36, '#ff8fb8'); F.seg(-1.63, -1.37, 2.4, 4, 1.3, 1.36, '#ff8fb8');
    F.seg(-1.63, -1.37, .94, 1.0, 0, 1.36, '#ff8fb8'); F.seg(-1.63, -1.37, 2.4, 2.46, 0, 1.36, '#ff8fb8');
    solid(-1.6, -4, -1.4, 1.0); solid(-1.6, 2.4, -1.4, 4);
    F.box(3.9, 1.15, 4.15, .18, 2.3, .34, '#8b5a2b'); F.box(5.1, 1.15, 4.15, .18, 2.3, .34, '#8b5a2b'); F.box(4.5, 2.35, 4.15, 1.4, .16, .34, '#8b5a2b');
    F.box(4.5, .012, 3.5, 1.1, .024, .75, '#ffd23f'); F.box(4.5, .024, 3.5, .9, .008, .55, '#ff9248');        // دعسة الباب

    /* ---- غرفة النوم ---- */
    F.box(-3.8, .012, 1.3, 2.8, .024, 2.2, '#ff8fb8'); F.box(-3.8, .024, 1.3, 2.4, .008, 1.8, '#ffc2d8');
    F.box(-4.2, .27, -2.4, 2.2, .44, 3.0, '#8b5a2b');            // السرير
    F.box(-4.2, .62, -2.3, 2.0, .28, 2.7, '#ffffff');
    F.box(-4.2, .67, -1.8, 2.06, .26, 1.8, '#2f6bff'); F.box(-4.2, .81, -1.1, 2.1, .1, .35, '#6f95ff');
    F.box(-4.2, .83, -3.5, 1.5, .16, .55, '#ffffff'); F.box(-4.2, .845, -3.5, 1.3, .03, .4, '#ffe9f1');   // وسادة عريضة
    F.box(-4.2, .95, -3.95, 2.3, 1.05, .12, '#6b4423');
    solid(-5.35, -3.98, -3.05, -.9);
    F.box(-2.5, .3, -3.5, .7, .6, .6, '#8b5a2b'); F.box(-2.5, .64, -3.5, .74, .06, .64, '#6b4423');   // كومودينو + أباجورة
    F.cyl(-2.5, .73, -3.5, .2, .12, .2, '#ffffff'); F.cyl(-2.5, .9, -3.5, .06, .26, .06, '#cccccc'); GL.cyl(-2.5, 1.1, -3.5, .42, .3, .42, '#ffe08a');
    solid(-2.85, -3.8, -2.15, -3.2);
    F.box(-5.6, 1.1, 1.5, .8, 2.2, 1.9, '#a8743f');              // خزانة ملابس
    F.box(-5.19, 1.1, 1.5, .03, 2.0, .03, '#6b4423'); F.box(-5.19, 1.1, .95, .03, 2.0, .03, '#6b4423'); F.box(-5.19, 1.1, 2.05, .03, 2.0, .03, '#6b4423');
    F.box(-5.18, 1.1, 1.38, .04, .3, .05, '#ffc81e'); F.box(-5.18, 1.1, 1.62, .04, .3, .05, '#ffc81e');
    solid(-6, .55, -5.2, 2.45);
    F.sph(-3.7, .38, 2.9, 1.1, .75, 1.1, '#ff9248'); F.sph(-3.7, .62, 2.9, .7, .35, .7, '#ffb36b');       // بين باق
    solid(-4.25, 2.35, -3.15, 3.45);

    /* ---- الصالة ---- */
    F.box(2.7, .012, 2.0, 3.4, .024, 3.0, '#7aa8ff'); F.box(2.7, .024, 2.0, 3.0, .008, 2.6, '#a8c7ff');
    F.box(.95, .3, 2.2, .95, .38, 2.8, '#14b8a6'); F.box(.45, .78, 2.2, .28, .95, 2.8, '#0f9c8c');       // كنبة
    F.box(.95, .5, .8, .95, .62, .3, '#0f9c8c'); F.box(.95, .5, 3.6, .95, .62, .3, '#0f9c8c');
    F.box(.7, .74, 1.3, .25, .3, .5, '#ffd23f'); F.box(.7, .74, 3.1, .25, .3, .5, '#ff7a1a');
    solid(.25, .6, 1.45, 3.8);
    F.box(2.7, .4, 2.0, 1.0, .08, 1.4, '#8b5a2b'); [[2.25, 1.4], [3.15, 1.4], [2.25, 2.6], [3.15, 2.6]].forEach(l => F.box(l[0], .2, l[1], .08, .4, .08, '#6b4423'));
    F.box(2.6, .47, 1.7, .4, .06, .55, '#e8262b'); F.cyl(2.9, .5, 2.4, .16, .12, .16, '#ffffff');
    solid(2.2, 1.3, 3.2, 2.7);
    F.box(5.65, .3, 2.2, .6, .6, 2.2, '#6b4423'); F.box(5.65, .62, 2.2, .62, .04, 2.24, '#8b5a2b');         // تلفاز
    F.box(5.8, 1.05, 2.2, .1, .85, 1.55, '#111827'); GL.box(5.74, 1.05, 2.2, .02, .72, 1.4, '#5bc0ff'); GL.box(5.73, 1.15, 2.0, .02, .25, .5, '#ffffff');
    F.box(5.65, .72, 1.4, .2, .12, .3, '#333'); F.box(5.65, .72, 3.0, .2, .12, .3, '#333');
    solid(5.3, 1.1, 6, 3.3);
    F.cyl(-.8, .22, 3.5, .5, .44, .5, '#c75b3a'); F.sph(-.8, .75, 3.5, .7, .7, .7, '#2f8f4e'); F.sph(-.65, 1.1, 3.55, .5, .5, .5, '#37a056'); F.sph(-.95, 1.0, 3.4, .45, .45, .45, '#3aa35a');   // نبتة
    solid(-1.1, 3.2, -.5, 3.8);

    /* ---- المطبخ ---- */
    F.seg(-1.2, 3.8, -3.95, -3.25, 0, .86, '#ffffff'); F.seg(-1.25, 3.85, -4.0, -3.2, .86, .92, '#5b6270');   // الخزائن والرخامة
    [0.2, 1.6, 2.6].forEach(x => F.seg(x - .015, x + .015, -3.26, -3.24, .08, .84, '#d0d0d0'));
    F.box(-.5, .6, -3.23, .06, .22, .04, '#ffc81e'); F.box(.9, .6, -3.23, .06, .22, .04, '#ffc81e'); F.box(2.1, .6, -3.23, .06, .22, .04, '#ffc81e');
    F.box(.9, .94, -3.6, 1.0, .03, .5, '#a9c3d3'); F.cyl(.9, 1.12, -3.85, .06, .34, .06, '#c0c6cc'); F.box(.9, 1.28, -3.75, .06, .05, .22, '#c0c6cc');   // مغسلة
    F.seg(2.6, 3.8, -3.95, -3.25, 0, .86, '#d9dde3'); [[2.95, -3.45], [3.45, -3.45], [2.95, -3.8], [3.45, -3.8]].forEach(b => F.cyl(b[0], .95, b[1], .3, .04, .3, '#2b2b33'));
    F.box(3.2, .55, -3.23, 1.0, .05, .05, '#9aa0a8'); F.box(3.2, .38, -3.26, 1.1, .5, .02, '#2b2b33');          // فرن
    solid(-1.2, -4, 3.8, -3.2);
    F.box(5.45, 1.02, -3.45, .98, 2.04, .98, '#e7eef5'); F.box(5.45, 1.35, -2.95, .94, .03, .03, '#b5bec7'); F.box(4.98, 1.2, -3.1, .04, .5, .05, '#9aa0a8'); F.box(4.98, 1.7, -3.1, .04, .35, .05, '#9aa0a8');   // ثلاجة
    solid(4.95, -4, 5.95, -2.95);
    F.box(2.8, .78, -1.3, 1.7, .08, 1.0, '#a8743f'); [[2.05, -1.7], [3.55, -1.7], [2.05, -.9], [3.55, -.9]].forEach(l => F.box(l[0], .37, l[1], .08, .74, .08, '#6b4423'));   // طاولة طعام
    F.cyl(2.5, .85, -1.3, .5, .03, .5, '#ffffff'); F.cyl(3.2, .85, -1.3, .5, .03, .5, '#ffffff'); F.sph(2.5, .9, -1.3, .16, .16, .16, '#e8262b'); F.sph(3.2, .9, -1.3, .16, .16, .16, '#9be22b');
    solid(1.95, -1.8, 3.65, -.8);
    [[-.35, 1], [-2.25, -1]].forEach(c => { const z = c[0], d = c[1]; F.box(2.8, .45, z, .5, .08, .5, '#ff7a1a'); F.box(2.8, .8, z + d * .24, .5, .6, .06, '#ff7a1a'); [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(l => F.box(2.8 + l[0], .21, z + l[1], .05, .42, .05, '#6b4423')); solid(2.5, z - .3, 3.1, z + .3); });

    GL.cyl(-3.8, H - .05, 0, 1.1, .1, 1.1, '#fff3c4'); GL.cyl(2.6, H - .05, 2.0, 1.1, .1, 1.1, '#fff3c4'); GL.cyl(2.2, H - .05, -2.0, 1.1, .1, 1.1, '#fff3c4');   // مصابيح السقف
    F.cyl(-3.8, H - .02, 0, 1.4, .04, 1.4, '#e8dcc4'); F.cyl(2.6, H - .02, 2.0, 1.4, .04, 1.4, '#e8dcc4'); F.cyl(2.2, H - .02, -2.0, 1.4, .04, 1.4, '#e8dcc4');

    /* ---- بناء الشبكات ---- */
    fixZ([].concat(F.list, GL.list, WB.list, WF.list, WL.list, WR.list), geos(THREE).box);
    const mat = vcMat(), glMat = new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true });
    const walls = [
      { m: bake(WB.list, mat, false, true), hide: (x, z) => z < -4.15 },
      { m: bake(WF.list, mat, false, true), hide: (x, z) => z > 4.15 },
      { m: bake(WL.list, mat, false, true), hide: (x, z) => x < -6.15 },
      { m: bake(WR.list, mat, false, true), hide: (x, z) => x > 6.15 }];
    const furn = bake(F.list, mat, true, true), glow = bake(GL.list, glMat, false, false);
    [furn, glow].concat(walls.map(w => w.m)).forEach(m => grp.add(m));
    /* إضاءة دافئة داخلية */
    const l1 = new THREE.PointLight(0xffe2b0, .5, 18, 1); l1.position.set(ix + 2.5, 3.4, iz + .5);
    const l2 = new THREE.PointLight(0xffd6e8, .42, 14, 1); l2.position.set(ix - 3.6, 3.0, iz - .5);
    /* السقف: وجهه للأسفل فقط (لا يظهر من فوق) */
    const cg = new THREE.PlaneGeometry(12.6, 8.6); cg.rotateX(Math.PI / 2);
    const ceil = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ color: '#fff6e6' })); ceil.position.set(ix, H, iz); ceil.castShadow = false; ceil.receiveShadow = false;
    grp.add(ceil);
    l1.distance = 18 * S; l2.distance = 14 * S;
    grp.add(l1, l2);
    grp.scale.setScalar(S); grp.position.set(ix * (1 - S), 0, iz * (1 - S));   // تكبير حول مركز الداخل
    /* أماكن التفاعل (إحداثيات محلية قبل التكبير): جلوس/نوم. y = ارتفاع سطح الجلوس، drop = غوص الورك، stand = مكان القيام */
    const PI = Math.PI;
    const spots = [
      { kind: 'sit', label: 'جلوس على الأريكة', x: .82, z: 1.7, face: PI / 2, y: .49, drop: .13, sx: 1.8, sz: 1.7, r: 1.4 },
      { kind: 'sit', label: 'جلوس على الأريكة', x: .82, z: 2.75, face: PI / 2, y: .49, drop: .13, sx: 1.8, sz: 2.75, r: 1.4 },
      { kind: 'sit', label: 'جلوس على الكرسي', x: 2.8, z: -.3, face: PI, y: .49, drop: .13, sx: 3.6, sz: -.3, r: 1.3 },
      { kind: 'sit', label: 'جلوس على الكرسي', x: 2.8, z: -2.3, face: 0, y: .49, drop: .13, sx: 3.6, sz: -2.3, r: 1.3 },
      { kind: 'sit', label: 'جلوس على البين باق', x: -3.7, z: 2.9, face: PI / 2, y: .75, drop: .42, sx: -2.65, sz: 2.9, r: 1.4 },
      { kind: 'sleep', label: 'نوم على السرير', x: -4.2, z: -3.05, face: 0, y: .76, drop: 0, sx: -2.6, sz: -1.6, r: 1.9 }
    ].map(o => ({ kind: o.kind, label: o.label, x: o.x * S, z: o.z * S, face: o.face, lift: o.y * S - o.drop, stand: { x: o.sx * S, z: o.sz * S }, r: o.r * S }));
    const sc = a => a.map(v => v * S), cm = .45;
    return { group: grp, walls, boxes: boxes.map(sc), spots, ix, iz, S, ceilH: H * S, bounds: { x0: -5.65 * S, x1: 5.65 * S, z0: -3.65 * S, z1: 3.65 * S },
      cam: { x0: -6 * S + cm, x1: 6 * S - cm, z0: -4 * S + cm, z1: 4 * S - cm },
      spawn: { x: 4.5 * S, z: 2.2 * S }, exit: { x: 4.5 * S, z: 3.95 * S, r: 1.7 * S },
      /* يُبقي الكاميرا داخل الغرفة: يقرّبها من اللاعب بدل أن تخرج من الجدار أو السقف */
      clampCam(p, tx, ty, tz) {
        const c = this.cam, X0 = ix + c.x0, X1 = ix + c.x1, Z0 = iz + c.z0, Z1 = iz + c.z1, Y1 = this.ceilH - .3, dx = p.x - tx, dy = p.y - ty, dz = p.z - tz;
        for (let k = 1; k >= .12; k -= .04) { const x = tx + dx * k, y = ty + dy * k, z = tz + dz * k; if (x >= X0 && x <= X1 && z >= Z0 && z <= Z1 && y <= Y1) { p.set(x, y, z); return; } }
        p.set(Math.max(X0, Math.min(X1, tx + dx * .12)), Math.min(Y1, ty + dy * .12), Math.max(Z0, Math.min(Z1, tz + dz * .12)));
      },
      updateWalls(cx, cz) { const lx = (cx - ix) / S, lz = (cz - iz) / S; for (const w of walls) { const h = w.hide(lx, lz); if (w.m.visible === h) w.m.visible = !h; } },
      showAllWalls() { walls.forEach(w => { w.m.visible = true; }); } };
  }

  /* تصادم اللاعب (دائرة نصف قطرها r) مع صناديق الأثاث وحدود الغرف */
  function collide(pos, I, r) {
    r = r || .36;
    let x = pos.x - I.ix, z = pos.z - I.iz;
    for (let it = 0; it < 2; it++) {
      for (const a of I.boxes) {
        const x0 = a[0] - r, z0 = a[1] - r, x1 = a[2] + r, z1 = a[3] + r;
        if (x > x0 && x < x1 && z > z0 && z < z1) {
          const dl = x - x0, dr = x1 - x, dt = z - z0, db = z1 - z, m = Math.min(dl, dr, dt, db);
          if (m === dl) x = x0; else if (m === dr) x = x1; else if (m === dt) z = z0; else z = z1;
        }
      }
      const b = I.bounds; x = Math.max(b.x0, Math.min(b.x1, x)); z = Math.max(b.z0, Math.min(b.z1, z));
    }
    pos.x = I.ix + x; pos.z = I.iz + z;
  }
  return { exterior, interior, collide };
})();
