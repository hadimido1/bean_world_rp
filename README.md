# Bean World 🫘

لعبة ثلاثية الأبعاد في المتصفح (three.js): لوبي، حسابات، خزانة، متجر، عالم مفتوح، وبيت بداخله تفاعل (جلوس ونوم).

## التشغيل
افتح `index.html` في المتصفح مباشرة، أو انشره كموقع (Vercel / GitHub Pages). يحتاج إنترنت لتحميل three.js وخط Cairo.
لعرض FPS: أضف `?fps` للرابط.

## النشر
- **Vercel:** Add New → Project → اختر المستودع → Framework Preset: `Other` → Deploy (بدون Build Command).
- **GitHub Pages:** Settings → Pages → Branch: `main` / root.

## الهيكل
- `index.html` — اللعبة كاملة (الصفحة الرئيسية للموقع).
- `source/` — الملفات الأصلية (الشخصية، الوجوه، الإكسسوارات، الحركات، البيت).
- `index.original.html` — النسخة قبل إضافة البيت (يحتاجها `source/build_house.py`).

## إعادة بناء البيت
بعد تعديل `source/bean-house.js` أو `source/bean-dances.js`: `python3 source/build_house.py`

الحسابات والعملات تُحفظ في `localStorage` على نفس الجهاز والمتصفح فقط.
