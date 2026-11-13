/* ملاحظة: لا يوجد دوران للرأس عمداً — نصف الوجه على عظم الصدر ونصفه على عظم الرأس، فأي دوران للرأس يمزّق الوجه.
   bean-dances.js — 5 حركات للبين تُبنى بالكود على عظام الهيكل (بدون ملفات):
   تلويح · ديسكو · حفلة (رقصتان) · جلوس · نوم · قفز
   const clips = BeanDance.make(THREE);  // مصفوفة AnimationClip تُضاف مع Idle/Walk/Run
   محاور الدوران: الذراع اليسرى (+x) ترتفع بـ z موجب، واليمنى بـ z سالب، والساق ترتفع للأمام بـ x سالب.
   ارتفاع الورك عند الوقوف 0.5 والقدم تلامس الأرض؛ الدالة gh(φ) تعطي ارتفاع الورك الذي تبقى معه القدمان على الأرض
   عندما تُثنى الفخذان بزاوية φ. */
(function (g) {
  var PI = Math.PI, S = Math.sin, C = Math.cos;
  function eq(x, y, z) {
    var c1 = C(x / 2), c2 = C(y / 2), c3 = C(z / 2), s1 = S(x / 2), s2 = S(y / 2), s3 = S(z / 2);
    return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
  }
  function mx(v) { return v > 0 ? v : 0; }
  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sm(e) { e = cl(e); return e * e * (3 - 2 * e); }
  function mixv(a, b, e) { return a + (b - a) * e; }
  function gh(phi) { return .18 + .32 * C(phi); }          // ارتفاع الورك مع بقاء القدمين على الأرض
  /* استيفاء بين مفاتيح [[u, قيمة], ...] بتنعيم smoothstep */
  function K(u, keys) {
    if (u <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) if (u <= keys[i][0]) {
      var a = keys[i - 1], b = keys[i]; return mixv(a[1], b[1], sm((u - a[0]) / (b[0] - a[0])));
    }
    return keys[keys.length - 1][1];
  }
  var ROT = ['Spine', 'Chest', 'Shoulder_L', 'Shoulder_R', 'Elbow_L', 'Elbow_R', 'Thigh_L', 'Thigh_R', 'Foot_L', 'Foot_R'];

  /* كل حركة: دالة (θ من 0 إلى 2π) ترجع { Bone: [x,y,z] دوران, Hips: [x,y,z] دوران, hp: [x,y,z] موضع الورك }
     وكلها دورية (أول إطار = آخر إطار) فتتكرر بسلاسة. */
  var DANCES = [

    /* تلويح: الذراع اليمنى مرفوعة والساعد يتمايل 3 مرات، والجسم يميل برفق */
    { name: 'تلويح', dur: 1.8, fn: function (t) {
      var w = S(3 * t), sway = S(t);
      return { hp: [.02 * sway, .5 + .012 * (1 - C(3 * t)) / 2, 0], Hips: [0, .05, .03 * sway],
        Shoulder_R: [-.15, 0, -(2.4 + .26 * w)], Elbow_R: [0, 0, -(.12 + .3 * w)],
        Shoulder_L: [0, 0, .12 + .02 * sway], Elbow_L: [0, 0, .1],
        Thigh_L: [0, 0, .03], Thigh_R: [0, 0, -.03] };
    } },

    /* ديسكو: إشارة بالإصبع للأعلى يميناً ويساراً مع انحناء ركبتين على الإيقاع */
    { name: 'ديسكو', dur: 2, fn: function (t) {
      var s = S(t), L = sm(.5 + .8 * s), R = sm(.5 - .8 * s), bd = (1 - C(2 * t)) / 2, phi = .4 * bd;
      return { hp: [.07 * s, gh(phi), 0], Hips: [0, .18 * s, .1 * s],
        Shoulder_L: [-.2 * L, 0, mixv(.55, 2.45, L)], Elbow_L: [0, 0, mixv(-.45, .1, L)],
        Shoulder_R: [-.2 * R, 0, -mixv(.55, 2.45, R)], Elbow_R: [0, 0, -mixv(-.45, .1, R)],
        Thigh_L: [-phi, 0, .08 * mx(s)], Thigh_R: [-phi, 0, -.08 * mx(-s)], Foot_L: [phi, 0, 0], Foot_R: [phi, 0, 0] };
    } },

    /* حفلة: قفزات خفيفة مع رفع الركبة بالتناوب والذراعان تضخّان للأعلى بالتناوب */
    { name: 'حفلة', dur: 1.6, fn: function (t) {
      var s = S(t), kl = mx(s), kr = mx(-s), up = s * s;
      var al = .5 + .5 * S(t - .6), ar = .5 + .5 * S(t + PI - .6);
      return { hp: [.03 * s, .5 + .05 * up, 0], Hips: [0, .25 * s, .06 * s],
        Shoulder_L: [-.4 * al, 0, mixv(.7, 2.35, al)], Elbow_L: [0, 0, mixv(.5, .25, al)],
        Shoulder_R: [-.4 * ar, 0, -mixv(.7, 2.35, ar)], Elbow_R: [0, 0, -mixv(.5, .25, ar)],
        Thigh_L: [-.6 * kl, 0, 0], Thigh_R: [-.6 * kr, 0, 0], Foot_L: [.4 * kl, 0, 0], Foot_R: [.4 * kr, 0, 0] };
    } },

    /* جلوس: ينزل على الأرض، يبقى جالساً يتنفس، ثم يقوم (حلقة 4.5 ثانية) */
    { name: 'جلوس', dur: 4.5, fn: function (t) {
      var u = t / (2 * PI), p = u < .5 ? sm(u / .13) : 1 - sm((u - .87) / .13), br = S(4 * t) * p, phi = 1.5 * p;
      return { hp: [0, Math.max(gh(phi), mixv(.5, .25, p)) + .008 * br, 0], Hips: [.1 * p, 0, 0],
        Shoulder_L: [-.45 * p, 0, .3 * p + .02 * br], Shoulder_R: [-.45 * p, 0, -.3 * p - .02 * br], Elbow_L: [0, 0, .15 * p], Elbow_R: [0, 0, -.15 * p],
        Thigh_L: [-phi, 0, .12 * p], Thigh_R: [-phi, 0, -.12 * p], Foot_L: [.2 * p, 0, 0], Foot_R: [.2 * p, 0, 0] };
    } },

    /* نوم: يجلس ثم يستلقي على ظهره ويتنفس ببطء ثم يقوم (حلقة 7 ثوانٍ، تتوقف عند u≈.5 مثل الجلوس) */
    { name: 'نوم', dur: 7, fn: function (t) {
      var u = t / (2 * PI), up = u < .5 ? sm(u / .08) : 1 - sm((u - .94) / .06), dn = u < .5 ? sm((u - .08) / .1) : 1 - sm((u - .86) / .1);
      var sit = up * (1 - dn), phi = 1.5 * sit, br = S(3 * t) * dn;
      return { hp: [0, mixv(mixv(.5, .25, up), .2, dn) + .008 * br, 0], Hips: [-1.5708 * dn + .1 * sit, 0, 0], Spine: [.03 * br, 0, 0],
        Shoulder_L: [-.45 * sit, 0, .3 * up + .02 * br], Shoulder_R: [-.45 * sit, 0, -.3 * up - .02 * br], Elbow_L: [0, 0, .15 * up], Elbow_R: [0, 0, -.15 * up],
        Thigh_L: [-phi, 0, .12 * up], Thigh_R: [-phi, 0, -.12 * up], Foot_L: [.2 * sit, 0, 0], Foot_R: [.2 * sit, 0, 0] };
    } },

    /* قفز: انحناء ← انطلاق بالذراعين للأعلى ← هواء مع ثني الساقين ← هبوط ← وقوف (حلقة 1.4 ثانية) */
    { name: 'قفز', dur: 1.4, fn: function (t) {
      var u = t / (2 * PI), x = cl((u - .30) / .38), lift = (u > .30 && u < .68) ? .62 * 4 * x * (1 - x) : 0;
      var phi = K(u, [[0, 0], [.16, .6], [.30, 0], [.40, .4], [.50, .5], [.60, .4], [.68, .05], [.78, .65], [1, 0]]);
      var az = K(u, [[0, .15], [.16, .35], [.30, 2.4], [.40, 2.8], [.55, 2.65], [.68, 1.3], [.78, .4], [1, .15]]);
      var ax = K(u, [[0, 0], [.16, .9], [.30, -.4], [.40, -.2], [.55, -.2], [.68, 0], [.78, .6], [1, 0]]);
      var sp = K(u, [[0, 0], [.16, .12], [.30, -.03], [.40, -.06], [.55, -.03], [.68, .06], [.78, .14], [1, 0]]);
      return { hp: [0, gh(phi) + lift, 0], Hips: [sp, 0, 0],
        Shoulder_L: [ax, 0, az], Shoulder_R: [ax, 0, -az], Elbow_L: [0, 0, .12], Elbow_R: [0, 0, -.12],
        Thigh_L: [-phi, 0, .04], Thigh_R: [-phi, 0, -.04], Foot_L: [phi, 0, 0], Foot_R: [phi, 0, 0] };
    } }
  ];

  function make(T) {
    return DANCES.map(function (d) {
      var N = 36, times = [], pos = [], rot = {}, ALL = ROT.concat(['Hips']);
      ALL.forEach(function (b) { rot[b] = []; });
      for (var i = 0; i <= N; i++) {
        var ph = i / N * 2 * PI, f = d.fn(ph);
        times.push(i / N * d.dur);
        pos.push.apply(pos, f.hp);
        ALL.forEach(function (b) { var v = f[b] || [0, 0, 0]; rot[b].push.apply(rot[b], eq(v[0], v[1], v[2])); });
      }
      var tracks = [new T.VectorKeyframeTrack('Hips.position', times, pos)];
      for (var b in rot) tracks.push(new T.QuaternionKeyframeTrack(b + '.quaternion', times, rot[b]));
      return new T.AnimationClip(d.name, -1, tracks);
    });
  }
  g.BeanDance = { make: make, names: DANCES.map(function (d) { return d.name; }), _dances: DANCES, _eq: eq };
})(this);
