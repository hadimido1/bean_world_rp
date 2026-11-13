/* bean-face.js — وجه البين (عيون + فم) ولون الجسم يُرسمان بالكود على canvas. بدون صور. */
(function(g){
var K=760,X0=643,Y0=217,LE=870,RE=1177,CX=1023.5,EY=511,B='#0a0a0a',TG='#ff6e7d',HT='#ff2846',R=Math.PI/180,AW=520,AH=496,FACES=[];
function cap(c,x,y,w,h,rot){var r=w/2,q=h/2-r;c.save();c.translate(x,y);c.rotate((rot||0)*R);c.beginPath();
 c.moveTo(-r,-q);c.arc(0,-q,r,Math.PI,0);c.lineTo(r,q);c.arc(0,q,r,0,Math.PI);c.closePath();c.fill();c.restore()}
function line(c,p,w){c.lineWidth=w;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.stroke()}
function arc(x,y,hw,d){var p=[],n=24;for(var i=0;i<=n;i++){var t=2*i/n-1;p.push([x+hw*t,y+d*(1-t*t)])}return p}
function zig(x,y,hw,a,k){var p=[];for(var i=0;i<=k;i++)p.push([x-hw+2*hw*i/k,y+(i%2?a:-a)]);return p}
function ell(c,x,y,w,h,st){c.beginPath();c.ellipse(x,y,w/2,h/2,0,0,7);st?c.stroke():c.fill()}
function heart(c,x,y,s){c.beginPath();for(var i=0;i<=60;i++){var t=Math.PI*2*i/60,px=16*Math.pow(Math.sin(t),3),
 py=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));i?c.lineTo(x+px*s/32,y+py*s/32):c.moveTo(x+px*s/32,y+py*s/32)}c.fill()}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function dm(c,x,y,w,h,tongue){c.beginPath();c.moveTo(x-w/2,y);c.ellipse(x,y,w/2,h,0,Math.PI,0,true);c.closePath();c.fill();
 if(tongue){c.save();c.clip();c.fillStyle=TG;ell(c,x,y+h*.875,w*.6,h*.75);c.restore();c.fillStyle=B}}
var E={
neutral:function(c){cap(c,LE,EY,92,188);cap(c,RE,EY,92,188)},
happy:function(c){cap(c,LE,EY-6,88,170);cap(c,RE,EY-6,88,170);line(c,arc(CX,700,125,80),34)},
laugh:function(c){line(c,arc(LE,EY+20,58,-48),38);line(c,arc(RE,EY+20,58,-48),38);dm(c,CX,690,300,215,1)},
sad:function(c){cap(c,LE,EY+10,84,150,-14);cap(c,RE,EY+10,84,150,14);line(c,arc(CX,790,105,-52),32)},
angry:function(c){[[LE,1],[RE,-1]].forEach(function(e){var x=e[0];c.save();c.beginPath();
  if(e[1]>0){c.moveTo(x-80,EY-100);c.lineTo(x+80,EY-5)}else{c.moveTo(x-80,EY-5);c.lineTo(x+80,EY-100)}
  c.lineTo(x+80,EY+130);c.lineTo(x-80,EY+130);c.closePath();c.clip();cap(c,x,EY+10,92,175);c.restore()});
 var x0=CX-135,y0=690,w=270,h=100;rr(c,x0+11,y0+11,w-22,h-22,24);c.fillStyle='#fff';c.fill();c.lineWidth=22;c.stroke();c.lineWidth=12;
 for(var i=1;i<4;i++)line(c,[[x0+w*i/4,y0],[x0+w*i/4,y0+h]],12);line(c,[[x0,y0+h/2],[x0+w,y0+h/2]],12);c.fillStyle=B},
surprised:function(c){ell(c,LE,EY,108,142);ell(c,RE,EY,108,142);ell(c,CX,740,92,128)},
wink:function(c){cap(c,LE,EY,92,188);line(c,arc(RE,EY+22,56,-46),38);var p=[];for(var i=0;i<=30;i++){var x=i*235/30;p.push([CX-115+x,705+75*Math.sin(Math.PI*i/30)-.28*x])}line(c,p,34)},
silly:function(c){[[LE,1],[RE,-1]].forEach(function(e){line(c,[[e[0]-e[1]*38,EY-62],[e[0]+e[1]*38,EY],[e[0]-e[1]*38,EY+62]],36)});
 rr(c,CX-10,700,105,130,48);c.fillStyle=TG;c.fill();c.strokeStyle='#cd3c50';line(c,[[CX+42,745],[CX+42,805]],8);c.strokeStyle=B;c.fillStyle=B;line(c,arc(CX,690,130,62),34)},
scared:function(c){[LE,RE].forEach(function(x){c.fillStyle='#fff';ell(c,x,EY,102,128);c.lineWidth=22;ell(c,x,EY,102,128,1);c.fillStyle=B;ell(c,x,EY+8,34,42)});line(c,zig(CX,770,125,24,6),28)},
love:function(c){c.fillStyle=HT;heart(c,LE,EY+5,150);heart(c,RE,EY+5,150);c.fillStyle=B;dm(c,CX,705,200,130,0)},
sleepy:function(c){line(c,arc(LE,EY-5,56,38),36);line(c,arc(RE,EY-5,56,38),36);ell(c,CX+8,745,70,92)}
};
var BeanFace={expressions:Object.keys(E),
 /* صور الملامح (3 أعمدة × 4 صفوف، كل خانة 520×496 بخلفية شفافة خارج البيضاوي). الترتيب = ترتيب expressions */
 atlas:null,
 loadAtlas:function(url){var im=new Image();im.onload=function(){BeanFace.atlas=im;FACES.forEach(function(f){f.set(f.color,f.expr)})};im.src=url},
 draw:function(cv,color,expr){var S=cv.width,s=S/K,c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle=color;c.fillRect(0,0,S,S);
  var A=BeanFace.atlas,ix=BeanFace.expressions.indexOf(expr);
  if(A&&A.naturalWidth&&ix>=0){c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(A,(ix%3)*AW,Math.floor(ix/3)*AH,AW,AH,S*.0303,S*.0513,S*.9408,S*.8974);return}
  c.setTransform(s,0,0,s,-X0*s,-Y0*s);c.fillStyle='#fff';c.beginPath();c.ellipse(1023.5,597,357.5,341,0,0,7);c.fill();
  c.fillStyle=B;c.strokeStyle=B;c.lineCap='round';c.lineJoin='round';(E[expr]||E.neutral)(c)},
 /* استخدام: const f=BeanFace.attach(THREE,skinnedMesh.material,512); f.set('#ff1080','happy'); */
 attach:function(T,mat,size){var cv=document.createElement('canvas');cv.width=cv.height=size||512;var t=new T.CanvasTexture(cv);
  t.flipY=false;t.encoding=T.sRGBEncoding;t.anisotropy=4;if(mat.map)mat.map.dispose();mat.map=t;mat.needsUpdate=true;
  var f={canvas:cv,texture:t,color:'#fff',expr:'neutral',set:function(color,expr){f.color=color;f.expr=expr;BeanFace.draw(cv,color,expr);t.needsUpdate=true}};FACES.push(f);return f}};
g.BeanFace=BeanFace})(this);
