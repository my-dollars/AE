<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>J.A.R.V.I.S.</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root{
  --cy:#37e2ff; --cy2:#0aa8cc; --bg:#02060a; --panel:rgba(6,16,24,.86);
  --line:rgba(55,226,255,.35); --red:#ff3b5c; --txt:#cfeef7;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--txt);
  font-family:"Segoe UI",Roboto,sans-serif;user-select:none;touch-action:none}
#cam{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;background:#000}
/* scanlines + vignette */
#fx{position:fixed;inset:0;pointer-events:none;z-index:5;
  background:repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0 1px,transparent 1px 3px),
             radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)}
#fx::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,transparent,rgba(55,226,255,.05),transparent);
  animation:sweep 6s linear infinite}
@keyframes sweep{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
/* corners HUD */
.hud{position:fixed;width:34px;height:34px;z-index:6;pointer-events:none;opacity:.8}
.hud::before,.hud::after{content:"";position:absolute;background:var(--cy)}
#hud-tl{top:12px;left:12px}#hud-tr{top:12px;right:12px}
#hud-bl{bottom:12px;left:12px}#hud-br{bottom:12px;right:12px}
#hud-tl::before{width:100%;height:2px}#hud-tl::after{width:2px;height:100%}
#hud-tr::before{width:100%;height:2px}#hud-tr::after{width:2px;height:100%;right:0}
#hud-bl::before{width:100%;height:2px;bottom:0}#hud-bl::after{width:2px;height:100%}
#hud-br::before{width:100%;height:2px;bottom:0}#hud-br::after{width:2px;height:100%;right:0}
#status{position:fixed;top:16px;left:56px;z-index:7;font-size:11px;letter-spacing:3px;
  color:var(--cy);text-shadow:0 0 8px var(--cy);opacity:.9}
#clock{position:fixed;top:16px;right:56px;z-index:7;font-size:11px;letter-spacing:2px;color:var(--cy);opacity:.9}
/* mic button */
#micBtn{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);z-index:20;
  width:74px;height:74px;border-radius:50%;border:2px solid var(--line);cursor:pointer;
  background:radial-gradient(circle at 50% 40%,rgba(55,226,255,.25),rgba(4,14,22,.9));
  display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(55,226,255,.25)}
#micBtn svg{width:30px;height:30px;fill:var(--cy)}
#micBtn.listening{animation:pulse 1.2s ease-in-out infinite;border-color:var(--cy)}
@keyframes pulse{0%,100%{box-shadow:0 0 14px rgba(55,226,255,.3)}50%{box-shadow:0 0 34px rgba(55,226,255,.75)}}
#micHint{position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:20;
  font-size:9px;letter-spacing:2px;color:rgba(207,238,247,.45)}
/* chat overlay */
#chat{position:fixed;left:12px;bottom:110px;width:min(78vw,340px);max-height:42vh;z-index:15;
  display:flex;flex-direction:column;gap:6px;pointer-events:none}
.msg{pointer-events:auto;background:var(--panel);border:1px solid var(--line);border-left:2px solid var(--cy);
  border-radius:0 10px 10px 0;padding:8px 10px;font-size:13px;line-height:1.45;
  backdrop-filter:blur(6px);animation:fadein .3s ease}
.msg.user{border-left-color:#ffd166}.msg .who{font-size:9px;letter-spacing:2px;color:var(--cy);opacity:.7;display:block;margin-bottom:2px}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
/* floating windows */
.win{position:fixed;z-index:30;min-width:200px;min-height:120px;
  background:var(--panel);border:1px solid var(--line);border-radius:12px;
  box-shadow:0 10px 40px rgba(0,0,0,.6),0 0 18px rgba(55,226,255,.12);
  backdrop-filter:blur(10px);overflow:hidden;display:flex;flex-direction:column;
  animation:winin .25s cubic-bezier(.2,.9,.3,1.2)}
@keyframes winin{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
.win-head{display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:grab;
  background:linear-gradient(90deg,rgba(55,226,255,.14),transparent);
  border-bottom:1px solid var(--line);touch-action:none}
.win-head:active{cursor:grabbing}
.win-dot{width:8px;height:8px;border-radius:50%;background:var(--cy);box-shadow:0 0 8px var(--cy)}
.win-title{flex:1;font-size:11px;letter-spacing:1.5px;color:var(--cy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.win-btn{width:26px;height:26px;border:1px solid var(--line);background:transparent;color:var(--cy);
  border-radius:6px;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
.win-btn:active{background:rgba(55,226,255,.2)}
.win-btn.close{border-color:rgba(255,59,92,.5);color:var(--red)}
.win-body{flex:1;overflow:auto;background:rgba(2,8,12,.6)}
.win-body iframe{width:100%;height:100%;border:0;background:#fff}
.win-body pre{padding:10px;font-size:11px;white-space:pre-wrap;color:#9ef01a;font-family:monospace}
/* minimized docks on right edge */
#dock{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:25;
  display:flex;flex-direction:column;gap:8px}
.dock-item{width:14px;height:52px;border-radius:8px 0 0 8px;cursor:pointer;
  background:linear-gradient(180deg,rgba(55,226,255,.5),rgba(10,168,204,.15));
  border:1px solid var(--line);border-right:none;animation:dockin .3s ease;
  writing-mode:vertical-rl;color:var(--cy);font-size:8px;letter-spacing:1px;
  display:flex;align-items:center;justify-content:center}
@keyframes dockin{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}
/* RAM disintegration particles */
#ram{position:fixed;z-index:60;pointer-events:none;font-size:10px;letter-spacing:2px;color:var(--cy);
  text-shadow:0 0 10px var(--cy);animation:ramtxt 1.6s ease forwards}
@keyframes ramtxt{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(-46px)}}
.pt{position:fixed;width:3px;height:3px;background:var(--cy);z-index:59;pointer-events:none;
  box-shadow:0 0 6px var(--cy);border-radius:1px}
#toast{position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:50;
  background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 14px;
  font-size:11px;letter-spacing:1px;opacity:0;transition:opacity .3s;pointer-events:none}
</style>
</head>
<body>
<video id="cam" autoplay playsinline muted></video>
<div id="fx"></div>
<div class="hud" id="hud-tl"></div><div class="hud" id="hud-tr"></div>
<div class="hud" id="hud-bl"></div><div class="hud" id="hud-br"></div>
<div id="status">J.A.R.V.I.S. // СИСТЕМА АКТИВНА</div>
<div id="clock"></div>
<div id="chat"></div>
<div id="dock"></div>
<button id="micBtn" title="Голос"><svg viewBox="0 0 24 24"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4zm6-4a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.94V22h2v-3.06A8 8 0 0 0 20 11h-2z"/></svg></button>
<div id="micHint">СКАЖИ «ДЖАРВИС»</div>
<div id="toast"></div>
<script>
/* ================== НАСТРОЙКА ================== */
const TUNNEL_URL = "https://your-tunnel.trycloudflare.com"; // <- твой HTTPS-туннель на Termux
const API = TUNNEL_URL.replace(/\/$/, "");
const WAKE_WORD = "джарвис";
/* =============================================== */

try { Telegram.WebApp.ready(); Telegram.WebApp.expand(); } catch(e){}

const video = document.getElementById('cam');
const chat = document.getElementById('chat');
const dock = document.getElementById('dock');
let facing = "environment", stream = null, winSeq = 0;
const windows = new Map(); // id -> {el, title, minimized}

/* ---------- камера + свайп вправо (переворот) ---------- */
async function startCam(){
  if (stream) stream.getTracks().forEach(t => t.stop());
  try {
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:facing}, audio:false});
    video.srcObject = stream;
  } catch(e){ toast("Камера недоступна: " + e.message); }
}
startCam();

let tx0 = null;
document.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, {passive:true});
document.addEventListener('touchend', e => {
  if (tx0 === null) return;
  const dx = e.changedTouches[0].clientX - tx0;
  if (dx > 110) { // свайп вправо
    facing = facing === "environment" ? "user" : "environment";
    startCam(); toast(facing === "environment" ? "КАМЕРА: ЗАДНЯЯ" : "КАМЕРА: ФРОНТАЛЬНАЯ");
  }
  tx0 = null;
}, {passive:true});

/* ---------- утилиты ---------- */
function toast(t){ const el=document.getElementById('toast'); el.textContent=t;
  el.style.opacity=1; clearTimeout(el._t); el._t=setTimeout(()=>el.style.opacity=0, 2200); }
function addMsg(who, text){
  const d = document.createElement('div'); d.className = 'msg ' + (who==='user'?'user':'');
  d.innerHTML = `<span class="who">${who==='user'?'ВЫ':'J.A.R.V.I.S.'}</span>`;
  const span = document.createElement('span'); span.textContent = text;
  d.appendChild(span); chat.appendChild(d);
  while (chat.children.length > 6) chat.firstChild.remove();
  setTimeout(()=>{ if(d.parentNode) d.remove(); }, 25000);
  return span;
}
function speak(text){
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, "код выведен на экран"));
    u.lang = 'ru-RU'; u.rate = 1.02; speechSynthesis.speak(u);
  } catch(e){}
}
setInterval(()=>{ const d=new Date();
  document.getElementById('clock').textContent =
    d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }, 500);

/* ---------- окна (window manager) ---------- */
function openWindow(title, contentNode){
  const id = ++winSeq;
  const el = document.createElement('div'); el.className = 'win';
  el.style.left = (20 + (id*18) % 120) + 'px';
  el.style.top = (60 + (id*22) % 140) + 'px';
  el.style.width = '88vw'; el.style.height = '55vh'; el.style.zIndex = 30 + id;
  const head = document.createElement('div'); head.className = 'win-head';
  head.innerHTML = `<span class="win-dot"></span><span class="win-title"></span>`;
  head.querySelector('.win-title').textContent = title;
  const bMin = document.createElement('button'); bMin.className = 'win-btn'; bMin.textContent = '_';
  const bClose = document.createElement('button'); bClose.className = 'win-btn close'; bClose.textContent = '✕';
  head.append(bMin, bClose);
  const body = document.createElement('div'); body.className = 'win-body';
  body.appendChild(contentNode);
  el.append(head, body); document.body.appendChild(el);
  windows.set(id, {el, title, body, minimized:false, dockItem:null});

  /* drag */
  let sx, sy, ox, oy, drag = false;
  head.addEventListener('touchstart', e => { drag = true;
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY;
    ox = el.offsetLeft; oy = el.offsetTop; e.preventDefault(); });
  head.addEventListener('touchmove', e => { if(!drag) return;
    const t = e.touches[0];
    el.style.left = Math.max(0, Math.min(innerWidth - 60, ox + t.clientX - sx)) + 'px';
    el.style.top = Math.max(0, Math.min(innerHeight - 60, oy + t.clientY - sy)) + 'px'; });
  head.addEventListener('touchend', () => drag = false);

  bMin.onclick = () => minimizeWindow(id);
  bClose.onclick = () => closeWindow(id);
  return id;
}
function minimizeWindow(id){
  const w = windows.get(id); if(!w || w.minimized) return;
  w.minimized = true; w.el.style.display = 'none';
  const item = document.createElement('div'); item.className = 'dock-item';
  item.textContent = w.title.slice(0, 12).toUpperCase();
  item.onclick = () => restoreWindow(id);
  dock.appendChild(item); w.dockItem = item;
}
function restoreWindow(id){
  const w = windows.get(id); if(!w) return;
  w.minimized = false; w.el.style.display = 'flex';
  if (w.dockItem) { w.dockItem.remove(); w.dockItem = null; }
}
function closeWindow(id){ // "рассыпание в RAM"
  const w = windows.get(id); if(!w) return;
  const r = w.el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
  for (let i = 0; i < 70; i++){
    const p = document.createElement('div'); p.className = 'pt';
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 6;
    let vx = Math.cos(a) * v, vy = Math.sin(a) * v - 2, px = 0, py = 0, life = 0;
    const tick = () => { if (life++ > 40) { p.remove(); return; }
      vy += .12; px += vx; py += vy; p.style.transform = `translate(${px}px,${py}px)`;
      p.style.opacity = 1 - life / 40; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  const ram = document.createElement('div'); ram.id = 'ram';
  ram.textContent = `RAM +${(Math.random()*180+40|0)} МБ ПОГЛОЩЕНО`; // прикол в стиле Сэма
  ram.style.left = (cx - 70) + 'px'; ram.style.top = (cy - 10) + 'px';
  document.body.appendChild(ram); setTimeout(() => ram.remove(), 1700);
  w.el.style.transition = 'transform .45s ease-in, opacity .45s';
  w.el.style.transform = 'scale(.1) rotate(12deg)'; w.el.style.opacity = 0;
  setTimeout(() => { w.el.remove(); if (w.dockItem) w.dockItem.remove(); windows.delete(id); }, 460);
}

/* ---------- контент окон ---------- */
function siteFrame(url){
  const f = document.createElement('iframe');
  f.src = url; f.setAttribute('allow', 'camera; microphone; autoplay');
  return f;
}
function codeView(code, lang){
  const pre = document.createElement('pre');
  pre.textContent = `// ${lang || 'code'} — J.A.R.V.I.S.\n\n` + code;
  return pre;
}

/* ---------- память (local + backend) ---------- */
const mem = JSON.parse(localStorage.getItem('jarvis_mem') || '[]');
function remember(text){ mem.push(text); localStorage.setItem('jarvis_mem', JSON.stringify(mem.slice(-300))); }

/* ---------- кадр с камеры ---------- */
function grabFrame(){
  const c = document.createElement('canvas');
  const vw = video.videoWidth || 640, vh = video.videoHeight || 480;
  const s = Math.min(1, 1280 / vw);
  c.width = vw * s; c.height = vh * s;
  c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .72);
}

/* ---------- диалог с ядром ---------- */
async function ask(text, withImage){
  const span = addMsg('jarvis', '…');
  try {
    const body = { text };
    if (withImage) body.image = grabFrame();
    const r = await fetch(API + '/api/chat', {method:'POST',
      headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    const d = await r.json();
    span.textContent = d.answer || d.error || 'Нет ответа';
    speak(d.answer || '');
    if (d.open) openWindow(new URL(d.open).hostname, siteFrame(d.open));
    const cm = (d.answer || '').match(/```(\w+)?\n([\s\S]*?)```/);
    if (cm) openWindow('editor: ' + (cm[1] || 'code'), codeView(cm[2].trim(), cm[1]));
    remember('Я: ' + text); remember('J: ' + (d.answer || ''));
  } catch(e){ span.textContent = 'Связь с ядром потеряна: ' + e.message; }
}

/* ---------- голос ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false, armed = false;
const micBtn = document.getElementById('micBtn');

function startRec(){
  if (!SR) { toast('Распознавание не поддерживается браузером'); return; }
  rec = new SR(); rec.lang = 'ru-RU'; rec.continuous = true; rec.interimResults = false;
  rec.onresult = e => {
    const text = e.results[e.results.length-1][0].transcript.trim().toLowerCase();
    if (!armed){
      if (text.includes(WAKE_WORD)){ armed = true; micBtn.classList.add('listening');
        toast('СЛУШАЮ, СЭР'); speak('Слушаю, сэр'); }
      return; // чужой разговор рядом игнорируем
    }
    if (text.includes('стоп') || text.includes('хватит')){ armed = false;
      micBtn.classList.remove('listening'); speak('Как скажете'); return; }
    addMsg('user', text);
    const openM = text.match(/(?:открой|зайди на|открой сайт)\s+([a-zа-я0-9.-]+\.[a-z]{2,}|vk\.com|youtube\.com)/i);
    if (openM){
      let u = openM[1]; if (!/^https?:/.test(u)) u = 'https://' + u;
      openWindow(new URL(u).hostname, siteFrame(u));
      speak('Открываю ' + u); addMsg('jarvis', 'Открываю: ' + u); return;
    }
    const seeM = text.match(/что ты видишь|что видишь|смотри|посмотри|какой это|кто это/);
    ask(text, !!seeM);
  };
  rec.onend = () => { if (listening) try { rec.start(); } catch(e){} };
  rec.onerror = () => {};
  try { rec.start(); } catch(e){}
}
micBtn.onclick = () => {
  listening = !listening; armed = false;
  micBtn.classList.toggle('listening', listening);
  if (listening){ startRec(); toast('МИКРОФОН: АКТИВЕН. КЛЮЧЕВОЕ СЛОВО — «ДЖАРВИС»'); }
  else { if (rec) rec.stop(); toast('МИКРОФОН: ВЫКЛ'); }
};
</script>
</body>
</html>
