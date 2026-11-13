/* bean-accessories.js — 15 ملحقاً للبين، مبنية بالكود (three.js r128) بدون صور أو ملفات إضافية.
   الاستخدام:
     const acc = BeanAcc.create(THREE, headBone, chestBone);
     acc.toggle('tophat');  acc.clear();  acc.setColor('#ff1080');  // و acc.update(dt) داخل حلقة الرسم
   الإحداثيات أدناه بنظام العالم عند وضعية الراحة (الرأس y=1.85، الصدر y=1.4)، والمجموعات تُزاح تلقائياً. */
(function (g) {
  var PI = Math.PI;
  function create(T, headBone, chestBone) {
    var HY = 1.85, CY = 1.4;
    var gh = new T.Group(), gc = new T.Group();
    gh.position.y = -HY; gc.position.y = -CY;
    headBone.add(gh); chestBone.add(gc);
    var list = [], byId = {}, ticks = [], clock = 0, DS = T.DoubleSide;

    function std(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: 0 }, o || {})); }
    function mesh(geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; }
    function cone(r, h, mat, x, y, z) { return mesh(new T.ConeGeometry(r, h, 28), mat, x, y, z); }
    function cyl(rt, rb, h, mat, x, y, z, open) { return mesh(new T.CylinderGeometry(rt, rb, h, 40, 1, !!open), mat, x, y, z); }
    function pivot(parent, x, y, z, rx, ry, rz) { var p = new T.Group(); p.position.set(x, y, z); p.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(p); return p; }
    function dome(rx, ry, rz, mat, y) { var m = new T.Mesh(new T.SphereGeometry(1, 36, 18, 0, PI * 2, 0, PI / 2), mat); m.scale.set(rx, ry, rz); m.position.y = y; return m; }
    function tex(draw, w, h, rx, ry) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t;
    }
    function add(id, name, emoji, slot, parent, build) {
      var o = new T.Group(); o.visible = false; build(o); parent.add(o);
      var it = { id: id, name: name, emoji: emoji, slot: slot, obj: o, on: false };
      list.push(it); byId[id] = it;
    }

    /* لون الجسم (لأذني القطة) */
    var bodyMat = std('#ff1080');

    /* ───────── الرأس (slot: top) ───────── */
    add('tophat', 'قبعة عالية', '🎩', 'top', gh, function (o) {
      var b = std('#17171c', { roughness: .4 });
      o.add(cyl(.52, .52, .04, b, 0, 2.2, 0));
      o.add(cyl(.31, .32, .46, b, 0, 2.45, 0));
      o.add(cyl(.325, .325, .09, std('#d6203a'), 0, 2.27, 0));
    });

    add('cap', 'كاب', '🧢', 'top', gh, function (o) {
      var m = std('#2f6bff', { side: DS });
      o.add(dome(.53, .36, .51, m, 2.0));
      var br = cyl(.5, .5, .03, m, 0, 2.01, .05); br.geometry = new T.CylinderGeometry(.5, .5, .03, 32, 1, false, -PI / 2, PI); br.rotation.x = .1; o.add(br);
      o.add(mesh(new T.SphereGeometry(.035, 12, 8), std('#ffffff'), 0, 2.36, 0));
    });

    add('crown', 'تاج', '👑', 'top', gh, function (o) {
      var gold = std('#ffc81e', { metalness: .5, roughness: .3, side: DS });
      o.add(cyl(.33, .31, .14, gold, 0, 2.3, 0, true));
      for (var i = 0; i < 6; i++) { var a = i * PI / 3; o.add(cone(.055, .18, gold, Math.sin(a) * .32, 2.46, Math.cos(a) * .32)); }
      [[-.6, '#e0203a'], [0, '#1ec8f0'], [.6, '#22b84c']].forEach(function (j) {
        o.add(mesh(new T.SphereGeometry(.037, 12, 8), std(j[1], { roughness: .2 }), Math.sin(j[0]) * .335, 2.3, Math.cos(j[0]) * .335));
      });
    });

    add('wizard', 'قبعة ساحر', '🧙', 'top', gh, function (o) {
      var p = pivot(o, 0, 2.2, 0, -.1, 0, -.12), pm = std('#6a2bd9');
      p.add(cyl(.55, .55, .035, pm, 0, 0, 0));
      p.add(cone(.33, .85, pm, 0, .425, 0));
      p.add(cyl(.335, .345, .08, std('#ffc81e', { metalness: .4, roughness: .35 }), 0, .06, 0));
      [[.18, .38, .22], [-.2, .55, .12], [.05, .22, .32]].forEach(function (s) { p.add(mesh(new T.SphereGeometry(.03, 10, 8), std('#ffe45c', { emissive: '#8a6a00' }), s[0], s[1], s[2])); });
    });

    add('party', 'قبعة حفلة', '🎉', 'top', gh, function (o) {
      var p = pivot(o, .06, 2.24, 0, 0, 0, -.22);
      var t = tex(function (c, w, h) { c.fillStyle = '#ff3b9a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffe45c'; for (var i = -h; i < w; i += 32) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + 16, h); c.lineTo(i + 16 + h, 0); c.lineTo(i + h, 0); c.fill(); } }, 128, 128, 3, 1);
      p.add(cone(.19, .5, std('#ffffff', { map: t }), 0, .25, 0));
      p.add(mesh(new T.SphereGeometry(.06, 14, 10), std('#1ec8f0'), 0, .52, 0));
    });

    add('propeller', 'قبعة مروحة', '🚁', 'top', gh, function (o) {
      var gm = new T.SphereGeometry(1, 36, 18, 0, PI * 2, 0, PI / 2), pos = gm.attributes.position, col = new Float32Array(pos.count * 3);
      for (var i = 0; i < pos.count; i++) {
        var k = Math.floor((Math.atan2(pos.getZ(i), pos.getX(i)) + PI) / (2 * PI) * 6) % 2, c = k ? [1, .2, .25] : [1, .85, .2];
        col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      }
      gm.setAttribute('color', new T.BufferAttribute(col, 3));
      var d = new T.Mesh(gm, std('#ffffff', { vertexColors: true, side: DS })); d.scale.set(.53, .36, .51); d.position.y = 2.0; o.add(d);
      o.add(cyl(.02, .02, .08, std('#333'), 0, 2.39, 0));
      var pr = pivot(o, 0, 2.44, 0);
      pr.add(mesh(new T.BoxGeometry(.5, .012, .08), std('#2f6bff'), 0, 0, 0));
      var b2 = mesh(new T.BoxGeometry(.5, .012, .08), std('#e8262b'), 0, 0, 0); b2.rotation.y = PI / 2; pr.add(b2);
      pr.add(mesh(new T.SphereGeometry(.035, 10, 8), std('#ffc81e'), 0, .01, 0));
      ticks.push(function (dt) { if (o.visible) pr.rotation.y += dt * 16; });
    });

    add('catears', 'أذنا قطة', '🐱', 'top', gh, function (o) {
      var pink = std('#ff9ab0');
      [-1, 1].forEach(function (s) {
        var p = pivot(o, s * .22, 2.2, -.02, 0, 0, -s * .45);
        p.add(cone(.14, .32, bodyMat, 0, .13, 0));
        p.add(cone(.08, .22, pink, 0, .11, .05));
      });
    });

    add('horns', 'قرون شيطان', '😈', 'top', gh, function (o) {
      var red = std('#d01020', { roughness: .35 });
      [-1, 1].forEach(function (s) {
        var p = pivot(o, s * .2, 2.24, .02, 0, 0, -s * .38);
        p.add(cone(.065, .22, red, 0, .1, 0));
        var q = pivot(p, 0, .2, 0, 0, 0, -s * .5); q.add(cone(.04, .17, red, 0, .08, 0));
      });
    });

    add('halo', 'هالة', '😇', 'top', gh, function (o) {
      var r = mesh(new T.TorusGeometry(.26, .03, 12, 48), new T.MeshBasicMaterial({ color: '#ffe45c' }), 0, 2.7, 0); r.rotation.x = PI / 2; o.add(r);
      var gl = mesh(new T.TorusGeometry(.26, .07, 12, 48), new T.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: .28 }), 0, 2.7, 0); gl.rotation.x = PI / 2; o.add(gl);
      ticks.push(function () { if (o.visible) o.position.y = .035 * Math.sin(clock * 2.4); });
    });

    add('headphones', 'سماعات', '🎧', 'top', gh, function (o) {
      var dark = std('#2a2a33', { roughness: .4 }), cup = std('#ff3b6b', { roughness: .35 });
      var band = mesh(new T.TorusGeometry(.585, .035, 10, 48, PI), dark, 0, 1.9, 0); band.scale.y = .79; o.add(band);
      [-1, 1].forEach(function (s) {
        var c = cyl(.17, .17, .12, cup, s * .61, 1.9, 0); c.rotation.z = PI / 2; o.add(c);
        var p = cyl(.18, .18, .05, dark, s * .545, 1.9, 0); p.rotation.z = PI / 2; o.add(p);
      });
    });

    /* ───────── الوجه: النظارات (slot: eyes) ───────── */
    function glasses(o, rnd) {
      var fr = std(rnd ? '#d9a520' : '#0c0c10', { metalness: rnd ? .7 : .2, roughness: .3 });
      var ln = rnd ? std('#bfe6ff', { transparent: true, opacity: .22, roughness: .1, side: DS }) : std('#12121a', { metalness: .6, roughness: .12 });
      [-1, 1].forEach(function (s) {
        var p = pivot(o, s * .165, 1.8, .47, 0, s * .32, 0);
        if (rnd) {
          p.add(new T.Mesh(new T.CircleGeometry(.125, 32), ln));
          p.add(new T.Mesh(new T.TorusGeometry(.125, .014, 10, 40), fr));
        } else {
          var l = new T.Mesh(new T.SphereGeometry(1, 24, 16), ln); l.scale.set(.145, .12, .025); p.add(l);
          var r = new T.Mesh(new T.TorusGeometry(.14, .022, 10, 40), fr); r.scale.set(1.03, .86, 1); p.add(r);
        }
        var t = mesh(new T.BoxGeometry(.27, .02, .02), fr, s * .385, 1.8, .325); t.rotation.y = Math.atan2(.21, s * .17); o.add(t);
      });
      o.add(mesh(new T.BoxGeometry(.07, .02, .02), fr, 0, 1.83, .515));
    }
    add('sunglasses', 'نظارة شمس', '🕶️', 'eyes', gh, function (o) { glasses(o, false); });
    add('glasses', 'نظارة طبية', '👓', 'eyes', gh, function (o) { glasses(o, true); });

    /* ───────── الوجه: الشنب (slot: mouth) ───────── */
    add('mustache', 'شنب', '🥸', 'mouth', gh, function (o) {
      var m = std('#2a1a10', { roughness: .85 });
      [-1, 1].forEach(function (s) {
        var l = new T.Mesh(new T.SphereGeometry(1, 20, 12), m); l.scale.set(.15, .05, .045);
        l.position.set(s * .12, 1.655, .485); l.rotation.set(0, s * .2, -s * .22); o.add(l);
        o.add(mesh(new T.SphereGeometry(.032, 10, 8), m, s * .255, 1.69, .45));
      });
    });

    /* ───────── الرقبة والصدر (slot: neck) ───────── */
    add('bowtie', 'فيونكة', '🎀', 'neck', gc, function (o) {
      var red = std('#e0203a', { roughness: .45 }), p = pivot(o, 0, 1.2, .5);
      [-1, 1].forEach(function (s) { var w = cone(.1, .2, red, s * .1, 0, 0); w.rotation.z = -s * PI / 2; w.scale.z = .5; p.add(w); });
      var k = mesh(new T.SphereGeometry(.05, 14, 10), std('#a8122a'), 0, 0, .01); k.scale.set(1, 1.1, .9); p.add(k);
    });

    add('scarf', 'وشاح', '🧣', 'neck', gc, function (o) {
      var t = tex(function (c, w, h) { c.fillStyle = '#e8262b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(w / 2, 0, w / 2, h); }, 32, 8, 16, 1);
      var ring = new T.Mesh(new T.TorusGeometry(.52, .075, 14, 48), std('#ffffff', { map: t, roughness: .8 }));
      ring.rotation.x = PI / 2; ring.scale.y = .96; ring.position.y = 1.3; o.add(ring);
      var tail = pivot(o, .2, 1.12, .52, 0, 0, .12), red = std('#e8262b', { roughness: .8 });
      tail.add(mesh(new T.BoxGeometry(.13, .36, .04), red, 0, 0, 0));
      tail.add(mesh(new T.BoxGeometry(.135, .045, .045), std('#ffffff', { roughness: .8 }), 0, -.08, 0));
      tail.add(mesh(new T.BoxGeometry(.135, .045, .045), std('#ffffff', { roughness: .8 }), 0, .06, 0));
    });

    /* ───────── واجهة التحكم ───────── */
    function toggle(id) {
      var it = byId[id]; if (!it) return false;
      var on = !it.on;
      if (on) list.forEach(function (o) { if (o !== it && o.slot === it.slot && o.on) { o.on = false; o.obj.visible = false; } });
      it.on = on; it.obj.visible = on; return on;
    }
    return {
      list: list,
      toggle: toggle,
      isOn: function (id) { return !!(byId[id] && byId[id].on); },
      clear: function () { list.forEach(function (o) { o.on = false; o.obj.visible = false; }); },
      setColor: function (c) { bodyMat.color.set(c); },
      update: function (dt) { clock += dt; ticks.forEach(function (f) { f(dt); }); }
    };
  }
  g.BeanAcc = { create: create };
})(this);
