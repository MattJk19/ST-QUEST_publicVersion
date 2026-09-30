document.addEventListener("DOMContentLoaded", () => {

// Sin esta etiqueta, el navegador (y el WebView de Capacitor en la app
// nativa) renderiza la página con un ancho de viewport "de escritorio"
// (~980px) y después la escala para que entre en la pantalla. Eso hace
// que CUALQUIER media query basada en max-width (como la que muestra los
// controles táctiles flotantes sobre el canvas) nunca se cumpla, aunque
// estés en un celular real. Si el HTML que carga este script ya trae su
// propio <meta name="viewport">, no se duplica: se corrige el contenido
// para asegurar que sea el correcto.
let viewportMeta = document.querySelector('meta[name="viewport"]');
if(!viewportMeta){
  viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  document.head.appendChild(viewportMeta);
}
viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');

// Compatibilidad con question banks creados mientras los controles aún
// dependían de esta variable global. El estado completo se crea después,
// dentro de __DBQUEST_START__, pero los bancos se cargan antes de eso.
window.stateDefaults = window.stateDefaults || {
  controls: { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' }
};

// CSS
const style = document.createElement("style");
style.textContent = `
:root{
  --bg:#0b1020; --bg2:#070b14; --text:#eef2ff; --muted:#a8b2d5;
  --accent:#7c8cff; --accent2:#64e5c8; --good:#61e38d; --bad:#ff6d8a; --warn:#ffd36b;
  --border:rgba(255,255,255,.09); --panel:rgba(255,255,255,.05); --panel2:rgba(255,255,255,.08);
  --shadow:0 22px 55px rgba(0,0,0,.32); --radius:22px;
  --modalBg: rgba(11,16,32,.7);
}
[data-theme="light"]{
  --bg:#eef3ff; --bg2:#dfe7ff; --text:#0f1630; --muted:#4d5a84;
  --border:rgba(15,22,48,.09); --panel:rgba(15,22,48,.04); --panel2:rgba(15,22,48,.07);
  --shadow:0 16px 32px rgba(15,22,48,.12);
  --modalBg: rgba(238,243,255,.7);
}
*{box-sizing:border-box}
html, body {
  min-height: 100vh; /* Ajustado para que el fondo cubra todo el scroll */
}
body {
  margin: 0; 
  color: var(--text); 
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(124,140,255,.18), transparent 26%),
    radial-gradient(circle at top right, rgba(100,229,200,.14), transparent 24%),
    linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);
  background-attachment: fixed; /* Evita que el degradado se rompa al bajar */
  overflow-x: hidden;
  transition: background .25s ease, color .25s ease;
}
/* En celular, el canvas nunca se dibuja más ancho que la pantalla (ver
   resizeCanvas()), así que overflow-x:hidden de arriba nunca hace falta.
   En escritorio, en cambio, si agrandás mucho el canvas desde Ajustes →
   Interfaz preferimos habilitar el scroll horizontal completo de la
   página antes que recortar/ocultar nada: acá nunca se pierde
   información, simplemente se scrollea para verla. */
@media (min-width:961px){
  html, body{overflow-x:auto;}
}
button{font:inherit}
.wrap{max-width:1280px;margin:0 auto;padding:16px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}
.brand{display:flex;align-items:center;gap:12px}
.logo{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-weight:900;color:#09111b;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:var(--shadow);user-select:none}
.title h1{margin:0;font-size:1.15rem;line-height:1.1}
.title p{margin:4px 0 0;color:var(--muted);font-size:.92rem}
.nav{display:flex;gap:8px;flex-wrap:wrap}
.pill,.btn,.chip,.toggle{
  border:1px solid var(--border);background:var(--panel);color:var(--text);border-radius:999px;
  padding:10px 14px;cursor:pointer;transition:.18s ease;user-select:none;text-decoration:none
}
.pill:hover,.btn:hover,.chip:hover,.toggle:hover{transform:translateY(-1px);background:var(--panel2)}
.pill.active,.chip.active,.toggle.active{background:linear-gradient(135deg, rgba(124,140,255,.24), rgba(100,229,200,.16));border-color:rgba(124,140,255,.35)}
.section{display:none;opacity:0;transform:translateY(6px);transition:opacity .2s ease, transform .2s ease}
.section.active{display:block;opacity:1;transform:translateY(0)}
.card{background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}
.card-hd{padding:16px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.card-hd h2,.card-hd h3{margin:0;font-size:1rem}
.card-bd{padding:16px 18px}
.grid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px}
.game-layout,.study-layout{display:grid;grid-template-columns:1fr 340px;gap:16px}
.game-layout > *, .study-layout > *{min-width:0}
@media (max-width:960px){.grid,.game-layout,.study-layout{grid-template-columns:1fr}}
/* La pantalla de Juego (#gameLayoutRow) NO usa la clase .game-layout de
   arriba a propósito: su ancho de columnas ya no depende del ancho de
   viewport (ese breakpoint fijo es lo que generaba la scrollbar cuando
   el canvas se agrandaba con el zoom de Ajustes → Interfaz, aun en
   pantallas anchas donde el breakpoint no se activaba). Acá el propio
   JS (ver resizeCanvas()) mide el espacio real disponible y agrega la
   clase .hudCollapsed en #game cuando corresponde ocultar el panel, sin
   que aparezca overflow ni scrollbar nunca. */
#gameLayoutRow{display:grid;grid-template-columns:1fr 340px;gap:16px}
#gameLayoutRow > *{min-width:0}
.hero{padding:18px;display:grid;grid-template-columns:1.15fr .85fr;gap:16px;align-items:center}
@media (max-width:960px){.hero{grid-template-columns:1fr}}
.hero-box{padding:22px;border-radius:24px;background:linear-gradient(135deg, rgba(124,140,255,.16), rgba(100,229,200,.09));border:1px solid var(--border)}
.hero-box h2{margin:0 0 10px;font-size:clamp(1.5rem,4vw,2.5rem)}
.hero-box p{margin:0 0 16px;color:var(--muted);line-height:1.6}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media (max-width:720px){.stats{grid-template-columns:1fr}}
.stat{padding:14px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--border)}
.stat b{display:block;font-size:1.2rem;margin-bottom:4px}
.stat span{color:var(--muted);font-size:.9rem}
.muted{color:var(--muted)}
.tiny{font-size:.85rem;color:var(--muted);line-height:1.45}
.good{color:var(--good)}
.bad{color:var(--bad)}
.divider{height:1px;background:var(--border);margin:12px 0}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.spaced{justify-content:space-between}
.split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:720px){.split{grid-template-columns:1fr}}
.mini{padding:12px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--border)}
.instructionsBody{margin-top:8px;width:100%;height:380px;border-radius:14px;border:1px solid var(--border);background:#0b0c10}
.progress{height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid var(--border)}
.progress>div{height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:999px;transition:width .2s ease}
.topic-list,.chip-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.chip{padding:8px 12px;font-size:.92rem}
input[type="search"], select{width:100%;padding:13px 14px;border-radius:16px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);outline:none}
.qtext{font-size:1.06rem;line-height:1.58;margin:0 0 14px}
.options{display:grid;gap:10px}
#diagramContainer, #studyDiagramContainer, #examDiagramContainer{display:none;margin:0 0 16px;padding:12px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--border);text-align:center}
.qitem-diagram{margin:8px 0;padding:10px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--border);text-align:center}
#diagramContainer svg, #studyDiagramContainer svg, #examDiagramContainer svg, .qitem-diagram svg{max-width:100%;height:auto}
#diagramContainer .clickable, #studyDiagramContainer .clickable, #examDiagramContainer .clickable, .qitem-diagram .clickable{cursor:pointer}
#diagramContainer .clickable:hover rect, #studyDiagramContainer .clickable:hover rect, #examDiagramContainer .clickable:hover rect, .qitem-diagram .clickable:hover rect,
#diagramContainer .clickable:hover ellipse, #studyDiagramContainer .clickable:hover ellipse, #examDiagramContainer .clickable:hover ellipse, .qitem-diagram .clickable:hover ellipse,
#diagramContainer .clickable:hover polygon, #studyDiagramContainer .clickable:hover polygon, #examDiagramContainer .clickable:hover polygon, .qitem-diagram .clickable:hover polygon{stroke-width:4;filter:brightness(1.15)}
.diagram-correct rect, .diagram-correct ellipse, .diagram-correct polygon{stroke:#22c55e !important;stroke-width:4 !important}
.diagram-wrong rect, .diagram-wrong ellipse, .diagram-wrong polygon{stroke:#ef4444 !important;stroke-width:4 !important}
.opt{text-align:left;padding:14px 14px;border-radius:16px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);cursor:pointer;transition:.15s ease;font-size:1rem;line-height:1.45}
.studyInput{width:100%;padding:13px 14px;border-radius:16px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);outline:none;font-size:1rem}
#debugMenu{position:fixed;top:0;right:0;height:100vh;width:340px;max-width:92vw;background:rgba(8,10,20,.97);border-left:1px solid rgba(255,255,255,.15);z-index:99999;overflow-y:auto;padding:16px;color:#eef2ff;font-family:system-ui,sans-serif;box-shadow:-10px 0 30px rgba(0,0,0,.5);display:none}
#debugMenu.open{display:block}
#debugMenu h3{margin:0 0 4px;font-size:1rem}
#debugMenu .dbgSection{margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08)}
#debugMenu .dbgRow{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#debugMenu button{font-size:.8rem;padding:7px 9px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#eef2ff;cursor:pointer}
#debugMenu button:hover{background:rgba(255,255,255,.14)}
#debugMenu .dbgTiny{font-size:.75rem;color:#a8b2d5;margin-top:4px;line-height:1.4}
#debugMenu input[type=number]{width:70px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#eef2ff}
#debugMenu table{width:100%;border-collapse:collapse;font-size:.75rem;margin-top:6px}
#debugMenu td{padding:3px 4px;border-bottom:1px solid rgba(255,255,255,.06)}
.opt:hover{background:rgba(255,255,255,.08)}
.opt.correct{border-color:rgba(97,227,141,.58);background:rgba(97,227,141,.12)}
.opt.wrong{border-color:rgba(255,109,138,.58);background:rgba(255,109,138,.12)}
.opt.selected{border-color:rgba(124,140,255,.55);background:rgba(124,140,255,.12)}
.feedback{margin-top:12px;min-height:58px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--border);line-height:1.55}
.conceptNote{margin-top:10px;padding:10px 12px;border-radius:14px;border:1px dashed rgba(124,140,255,.45);background:rgba(124,140,255,.08);font-size:.85rem;line-height:1.5}
.conceptNoteRow{margin-top:4px}
.conceptNoteTip{margin-top:6px;font-style:italic;color:var(--muted)}
.bank{display:grid;gap:10px;max-height:560px;overflow:auto;padding-right:4px}
.qitem{padding:14px;border-radius:16px;border:1px solid var(--border);background:rgba(255,255,255,.03)}
.qitem small{color:var(--muted);display:block;margin-bottom:6px}
.qitem b{display:block;margin-bottom:6px}
.tag{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--border);font-size:.82rem;color:var(--muted)}
.canvas-shell{position:relative;overflow:visible;padding:12px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:22px}
/* La card que envuelve el canvas necesita poder crecer sin recortarlo
   (el .card genérico usa overflow:hidden para redondear esquinas de
   otro contenido, pero acá el propio <canvas> ya tiene su
   border-radius). Ver #gameLayoutRow / resizeCanvas() en el JS: el
   canvas se agranda de verdad (nunca queda recortado ni con scrollbar
   propia), y es JS el que decide, midiendo el espacio real disponible,
   si el panel de la derecha entra al lado o hay que ocultarlo. */
#gameLayoutRow > .card{overflow:visible}
/* Panel lateral del Juego (Estado, Controles, Log, Acciones rápidas).
   Por defecto es una columna normal del grid, al lado del canvas. Pasa a
   ser una tarjeta centrada (como el resto de los modales de la app) SOLO
   en dispositivos móviles y SOLO cuando JS detecta que no entra al lado
   del canvas (ver resizeCanvas(), que es quien agrega/saca la clase
   .hudCollapsed en #game — en escritorio nunca se agrega, ver más abajo
   "Habilitar el scroll completo en escritorio"). Se accede con el botón
   flotante ☰. */
#game.hudCollapsed #gameLayoutRow{grid-template-columns:1fr}
#game.hudCollapsed #gameHud{
  position:fixed; top:50%; left:50%; z-index:70;
  width:90vw; max-width:380px; max-height:80vh;
  margin:0; padding:20px calc(20px + env(safe-area-inset-right)) 20px 20px;
  background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)), var(--modalBg);
  border:1px solid var(--border); border-radius:20px;
  overflow-y:auto;
  opacity:0; pointer-events:none;
  transform:translate(-50%,-50%) scale(.94);
  transition:opacity .2s ease, transform .2s ease;
  box-shadow:var(--shadow);
}
#game.hudCollapsed #gameHud.open{opacity:1; pointer-events:auto; transform:translate(-50%,-50%) scale(1)}
#game.hudCollapsed #gameHudBackdrop.open{opacity:1; pointer-events:auto}
#game.hudCollapsed #btnGameHudToggle{display:flex}
#gameHudBackdrop{
  position:fixed; inset:0; background:rgba(4,6,14,.6); z-index:65;
  opacity:0; pointer-events:none; transition:opacity .2s ease;
}
#btnGameHudToggle{
  display:none; position:fixed; right:18px; top:50%; z-index:66;
  width:54px; height:54px; border-radius:50%; border:none; cursor:pointer;
  align-items:center; justify-content:center; gap:0;
  background:linear-gradient(135deg, var(--accent), var(--accent2)); color:#0b1020;
  box-shadow:0 10px 26px rgba(0,0,0,.4);
  -webkit-tap-highlight-color:transparent;
  transform:translateY(-50%);
}
#btnGameHudToggle span{display:block;width:22px;height:3px;border-radius:3px;background:#0b1020;margin:2.5px 0}

/* Botón flotante "Preguntale a una IA" (Gemini) — solo visible en Inicio.
   Ring degradé + halo pulsante para que se note que es una IA sin
   recurrir a texto ni a un logo propio; el ícono lo trae gemini.png. */
#btnGemini{
  position:fixed; right:18px; bottom:18px; z-index:9990;
  width:58px; height:58px; border-radius:50%;
  border:none; padding:3px; margin:0; font:inherit; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  background:
    radial-gradient(circle at 30% 25%, rgba(255,255,255,.95), rgba(255,255,255,.85) 55%, rgba(255,255,255,.75) 100%);
  box-shadow:0 10px 26px rgba(8,10,20,.35), 0 0 0 1px rgba(124,140,255,.18);
  transition:transform .18s ease, box-shadow .18s ease;
  animation:btnGeminiPulse 2.6s ease-in-out infinite;
}
#btnGemini::before{
  content:"";
  position:absolute; inset:-3px;
  border-radius:50%;
  padding:3px;
  background:conic-gradient(from 0deg, var(--accent), var(--accent2), #ffd36b, var(--accent));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  opacity:.85;
  animation:btnGeminiSpin 5s linear infinite;
}
#btnGemini img{
  width:30px; height:30px; border-radius:50%;
  position:relative; z-index:1;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.15));
}
#btnGemini .btnGeminiSpark{
  position:absolute; top:-3px; right:-3px; z-index:2;
  width:20px; height:20px; border-radius:50%;
  background:linear-gradient(135deg, var(--accent), var(--accent2));
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 3px 8px rgba(8,10,20,.4), 0 0 0 2px var(--bg2, #070b14);
}
#btnGemini .btnGeminiSpark svg{width:11px;height:11px;display:block}
#btnGemini:hover{transform:translateY(-3px) scale(1.05); box-shadow:0 14px 32px rgba(8,10,20,.42), 0 0 0 1px rgba(124,140,255,.28)}
#btnGemini:active{transform:translateY(-1px) scale(.97)}
@keyframes btnGeminiPulse{
  0%,100%{box-shadow:0 10px 26px rgba(8,10,20,.35), 0 0 0 1px rgba(124,140,255,.18), 0 0 0 0 rgba(124,140,255,.35)}
  50%{box-shadow:0 10px 26px rgba(8,10,20,.35), 0 0 0 1px rgba(124,140,255,.18), 0 0 0 9px rgba(124,140,255,0)}
}
@keyframes btnGeminiSpin{ to{ transform:rotate(360deg) } }
@media (prefers-reduced-motion: reduce){
  #btnGemini, #btnGemini::before{ animation:none }
}
/* Botones flotantes sobre el canvas, solo para móvil (ver el media
   query más abajo). En desktop no se muestran: ahí ya están los
   botones normales del panel "Controles"/"Combate" al lado del canvas. */
.mobileCanvasControls{display:none}
@media (max-width:960px) and (pointer:coarse){
  .mobileCanvasControls{display:block}
}
/* Respaldo por JS (ver detectTouchControls() más abajo): además del
   media query de arriba, si detectamos por JS que el dispositivo es
   táctil, forzamos que se muestren igual. Esto cubre WebViews (como el
   de la app Android hecha con Capacitor) donde "pointer:coarse" a veces
   no se reporta como se espera. */
body.forceMobileControls .mobileCanvasControls{display:block}
.mobileInterfaceOption{display:none}
body.mobileDetected .mobileInterfaceOption{display:block}
.virtualJoystick{
  display:none;
  position:absolute;
  right:24px;
  bottom:24px;
  width:120px;
  height:120px;
  border-radius:50%;
  background:rgba(255,255,255,.10);
  border:2px solid rgba(255,255,255,.30);
  z-index:8;
  pointer-events:auto;
  touch-action:none;
  user-select:none;
  -webkit-user-select:none;
  box-shadow:0 8px 24px rgba(0,0,0,.28);
}
.virtualJoystick.visible{display:block}
.virtualJoystickKnob{
  position:absolute;
  left:50%;
  top:50%;
  width:50px;
  height:50px;
  border-radius:50%;
  transform:translate(-50%,-50%);
  background:rgba(255,255,255,.62);
  box-shadow:0 4px 12px rgba(0,0,0,.22);
  pointer-events:none;
}
@media (min-width:961px) and (pointer: fine){
  .mobileInterfaceOption{display:none !important}
  .virtualJoystick{display:none !important}
}

.canvasBtn{
  position:absolute;
  z-index:5;
  border:1px solid rgba(255,255,255,.35);
  border-radius:999px;
  background:rgba(20,24,38,.55);
  backdrop-filter:blur(4px);
  color:#fff;
  font:700 14px system-ui, sans-serif;
  padding:0;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  touch-action:manipulation;
  box-shadow:0 4px 14px rgba(0,0,0,.35);
}
.canvasBtn:active{background:rgba(90,110,255,.55);transform:scale(.94)}
.canvasBtnAction{
  right:5%;
  bottom:8%;
  width:58px;
  height:58px;
  font-size:18px;
}
.canvasEncounterButtons{
  position:absolute;
  left:50%;
  bottom:8%;
  transform:translateX(-50%);
  display:flex;
  gap:10px;
}
.canvasEncounterButtons.hidden{display:none}
.canvasBtnFight,.canvasBtnFlee{
  position:static;
  padding:12px 18px;
  white-space:nowrap;
}
.canvasBtnFight{background:rgba(210,60,60,.55)}
.canvasBtnFlee{background:rgba(70,80,110,.55)}
canvas{display:block;width:100%;height:auto;border-radius:18px;background:linear-gradient(180deg,#11162a 0%, #080b15 100%);touch-action:none}
.hud{display:grid;gap:10px}
.panel{padding:14px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--border)}
.panel b{display:block;margin-bottom:4px}
.worldGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
@media (max-width:720px){.worldGrid{grid-template-columns:repeat(2,1fr)}}
.worldNode{padding:10px 8px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.04);cursor:pointer;text-align:center;font-size:.84rem}
.worldNode.active{outline:2px solid rgba(124,140,255,.35)}
.worldNode.done{background:rgba(97,227,141,.12)}

/* ===== Mapa de zonas expandido (modal, botón "Mapa") ===== */
.worldMapRow{display:flex;align-items:center;overflow-x:auto;padding:14px 4px 10px;-webkit-overflow-scrolling:touch}
.worldMapNode{flex:none;width:104px;text-align:center;padding:12px 8px;border-radius:16px;border:1px solid var(--border);background:rgba(255,255,255,.04);cursor:pointer;transition:.15s ease}
.worldMapNode:hover{background:rgba(255,255,255,.09);transform:translateY(-1px)}
.worldMapNode.locked{opacity:.45;cursor:not-allowed}
.worldMapNode.locked:hover{transform:none;background:rgba(255,255,255,.04)}
.worldMapNode.active{outline:2px solid rgba(124,140,255,.55)}
.worldMapNode.done{border-color:rgba(97,227,141,.5);background:rgba(97,227,141,.1)}
.worldMapNode .wmIcon{font-size:1.5rem;display:block;margin-bottom:4px}
.worldMapNode .wmName{font-size:.78rem;font-weight:700;display:block;line-height:1.2}
.worldMapNode .wmSub{font-size:.68rem;color:var(--muted);display:block;margin-top:3px}
.worldMapBridge{flex:none;width:44px;height:3px;margin:0 -1px;position:relative;align-self:center;background:repeating-linear-gradient(90deg, rgba(255,255,255,.3) 0 6px, transparent 6px 12px);border-radius:2px}
.worldMapBridge.crossed{background:repeating-linear-gradient(90deg, rgba(97,227,141,.65) 0 6px, transparent 6px 12px)}
.worldMapBridge .wmBridgeIcon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.85rem;background:var(--bg2);padding:0 3px;border-radius:6px}
.worldMapShopBranch{display:flex;align-items:center;gap:12px;margin-top:14px;padding-top:14px;border-top:1px dashed var(--border);flex-wrap:wrap}
.log{max-height:220px;overflow:auto;display:grid;gap:8px}
.logItem{padding:10px 12px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.03);font-size:.9rem}
.footer{text-align:center;color:var(--muted);font-size:.85rem;padding:18px 0 8px}
.fadeMsg{animation:fadeIn .24s ease}
@keyframes fadeIn{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.floaty{animation:floaty 3s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--border);font-size:.8rem;color:var(--muted)}
.hidden{display:none !important}
.battleTimer{
    width:100%;
    height:12px;
    background:#222;
    border-radius:8px;
    overflow:hidden;
    margin-top:10px;
}

#battleTimerBar{
    width:100%;
    height:100%;
    background:#37d65b;
    transition:width .2s linear,
               background .2s linear;
}

.battleTimerText{
    text-align:center;
    font-weight:bold;
    margin-top:6px;
    color:white;
}
body.fx-good::after,
body.fx-bad::after,
body.fx-buy::after,
body.fx-level::after{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:9999;
  animation:fxFade .25s ease;
}
body.fx-good::after{background:rgba(97,227,141,.14)}
body.fx-bad::after{background:rgba(255,109,138,.16)}
body.fx-buy::after{background:rgba(124,140,255,.16)}
body.fx-level::after{background:rgba(255,211,107,.15)}
@keyframes fxFade{from{opacity:.32}to{opacity:0}}

.battleLayout,.simpleLayout{display:grid;grid-template-columns:1fr 340px;gap:16px}
@media (max-width:960px){.battleLayout,.simpleLayout{grid-template-columns:1fr}}
.itemGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (max-width:720px){.itemGrid{grid-template-columns:1fr}}
.itemCard,.bossCard,.achCard{
  padding:14px;
  border-radius:16px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.03);
}
.itemCard b,.bossCard b,.achCard b{display:block;margin-bottom:4px}
.itemCard .row,.bossCard .row,.achCard .row{margin-top:8px}
.smallBtn{padding:8px 10px;border-radius:12px}
.locked{opacity:.5}
.battleOptions .opt.hidden{display:none}
.hpLabel{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:.88rem;color:var(--muted)}
.equipSlots{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
@media (max-width:900px){.equipSlots{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.equipSlots{grid-template-columns:1fr}}
.equipSlot{padding:12px;border-radius:16px;border:1px dashed var(--border);background:rgba(255,255,255,.03);text-align:center}
.equipSlot b{display:block;margin-bottom:4px}
.equipSlot.filled{border-style:solid;border-color:rgba(124,140,255,.4);background:rgba(124,140,255,.08)}
.rareCard{border-color:rgba(255,211,107,.5);background:rgba(255,211,107,.08)}

.subjectPicker{position:relative}
.subjectBtn{display:flex;align-items:center;gap:6px}
.subjectMenu{position:absolute;top:calc(100% + 8px);left:0;min-width:250px;max-width:320px;background:var(--bg2);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);padding:8px;z-index:500;display:none}
.subjectMenu.open{display:block}
.subjectList{display:flex;flex-direction:column;gap:4px;max-height:280px;overflow:auto}
.subjectItem{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-radius:12px;cursor:pointer;font-size:.92rem;border:1px solid transparent}
.subjectItem:hover{background:var(--panel2)}
.subjectItem.active{background:linear-gradient(135deg, rgba(124,140,255,.24), rgba(100,229,200,.16));border-color:rgba(124,140,255,.35)}
.subjectItemName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.subjectItemDel{opacity:.55;padding:2px 7px;border-radius:8px;font-size:.85rem;flex:none}
.subjectItemDel:hover{opacity:1;background:rgba(255,109,138,.18);color:var(--bad)}
.subjectMenuDivider{height:1px;background:var(--border);margin:8px 2px}
.subjectAddBtn{width:100%;text-align:left;padding:9px 10px;border-radius:12px;border:1px dashed var(--border);background:transparent;color:var(--accent2);cursor:pointer;font-size:.92rem}
.subjectAddBtn:hover{background:var(--panel2)}
.modalOverlay{position:fixed;inset:0;background:rgba(4,6,14,.6);display:none;align-items:center;justify-content:center;z-index:9998;padding:16px}
.modalOverlay.open{display:flex}
.modalCard{width:100%;max-width:420px;background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)), var(--modalBg);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow);padding:20px}
#btnCustomBattle:disabled{background:rgba(255,109,138,.16);border-color:rgba(255,109,138,.45);color:var(--bad);cursor:not-allowed;opacity:1}
#btnCustomBattle:disabled:hover{transform:none;background:rgba(255,109,138,.16)}
.modalCard h3{margin:0 0 6px}
.modalCard .tiny{margin-bottom:14px}
.modalField{margin-bottom:14px}
.modalField label{display:block;margin-bottom:6px;font-size:.88rem;color:var(--muted)}
.modalField input[type="text"]{width:100%;padding:11px 12px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--text);outline:none}
.modalField input[type="file"]{width:100%;color:var(--text);font-size:.88rem}
.modalActions{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}
.modalError{color:var(--bad);font-size:.85rem;margin-top:8px;min-height:18px}

.heroNameDisplay{
  font-family:'Courier New',monospace;font-size:1.5rem;letter-spacing:4px;
  background:#0b0c10;color:#61e38d;border:2px solid var(--border);border-radius:12px;
  padding:14px 16px;margin:14px 0;min-height:24px;text-align:center;word-break:break-all;
  text-shadow:0 0 6px rgba(97,227,141,.55);
}
.heroNameCursor{animation:heroNameBlink 1s step-end infinite}
@keyframes heroNameBlink{50%{opacity:0}}
.heroKeyboard{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:6px}
.heroKey{padding:11px 0;border-radius:9px;border:1px solid var(--border);background:rgba(255,255,255,.05);color:var(--text);cursor:pointer;font-weight:700;font-size:.95rem;text-align:center;transition:.12s ease}
.heroKey:hover{background:var(--panel2);transform:translateY(-1px)}
.heroKey:active{transform:translateY(0)}
.heroKey.kbdFocus{background:linear-gradient(135deg, rgba(124,140,255,.32), rgba(100,229,200,.2));border-color:var(--accent);box-shadow:0 0 0 2px rgba(124,140,255,.4)}
.keyBadge{display:inline-block;min-width:24px;padding:4px 8px;margin:0 2px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,.06);font-family:'Courier New',monospace;font-weight:700;font-size:.82rem;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,.18)}
.heroKey.wide{grid-column:span 3;font-size:.85rem}
@media (max-width:480px){.heroKeyboard{grid-template-columns:repeat(6,1fr)}.heroKey.wide{grid-column:span 3}}

/* ===== Tour guiado de bienvenida (primera vez que se abre la app) ===== */
.tutorial-overlay{
  position:fixed; inset:0; background:rgba(4,6,14,.72); z-index:99998;
  transition:background .18s ease;
}
.tutorial-overlay.hidden{display:none}
.tutorial-overlay.clickThrough{
  pointer-events:none;
  background:transparent;
}
.tutorial-overlay.clickThrough .tutorial-card{pointer-events:auto}
.tutorial-highlight{
  position:fixed;
  border:3px solid #ff3b30;
  border-radius:14px;
  box-shadow:0 0 0 9999px rgba(4,6,14,.6);
  animation:tutorialPulse 1.1s infinite;
  pointer-events:none;
  transition:left .2s ease, top .2s ease, width .2s ease, height .2s ease, box-shadow .18s ease;
  z-index:99998;
}
.tutorial-overlay.clickThrough .tutorial-highlight{
  box-shadow:none;
}
@keyframes tutorialPulse{
  0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)}
}
.tutorial-card{
  position:fixed; left:50%; bottom:24px; transform:translateX(-50%);
  width:min(560px,92vw); max-height:min(70vh,520px); overflow-y:auto;
  background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)), var(--bg2);
  color:var(--text); border:1px solid var(--border); border-radius:20px;
  padding:22px; box-shadow:var(--shadow); z-index:99999;
}
.tutorial-progress{
  height:6px; background:rgba(255,255,255,.08); border-radius:999px; overflow:hidden; margin-bottom:18px;
}
#tutorialProgressBar{
  height:100%; width:0%; background:linear-gradient(90deg,var(--accent),var(--accent2)); transition:width .3s ease;
}
.tutorial-card h2{margin:0 0 12px; font-size:1.3rem}
.tutorial-card p{margin:10px 0; line-height:1.55; color:var(--text)}
.tutorial-card img{width:100%; border-radius:12px; margin:14px 0; border:1px solid var(--border)}
.tutorial-actions{display:flex; justify-content:space-between; align-items:center; margin-top:18px; gap:10px}
.btn-primary,.btn-secondary{
  padding:10px 18px; border:none; border-radius:12px; cursor:pointer; font-weight:600; font-size:.95rem;
}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#09111b}
.btn-primary:disabled{opacity:.55; cursor:default}
.btn-secondary{background:rgba(255,255,255,.08); color:var(--text)}
.btn-secondary:hover{background:rgba(255,255,255,.14)}
.btn-primary:not(:disabled):hover{filter:brightness(1.08)}
.tutorial-waitclick-hint{
  display:inline-flex; align-items:center; gap:6px; font-size:.85rem; color:var(--muted);
}
.tutorial-launch{
  position:fixed;
  left:18px;
  bottom:18px;
  z-index:100001;
  display:flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--border);
  border-radius:999px;
  padding:10px 14px;
  background:var(--bg2);
  color:var(--text);
  box-shadow:0 10px 26px rgba(0,0,0,.35);
  cursor:pointer;
  font:600 .9rem system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  transition:transform .18s ease, background .18s ease;
}
.tutorial-launch:hover{transform:translateY(-2px);background:var(--panel2)}
.tutorial-launch:active{transform:translateY(0)}
.tutorial-launch.hidden{display:none !important}
.tutorial-card .tutorial-close{
  width:34px;height:34px;padding:0;border-radius:10px;
  border:1px solid var(--border);background:rgba(255,255,255,.06);
  color:var(--text);cursor:pointer;font-size:1.05rem;line-height:1;
}
.tutorial-card .tutorial-close:hover{background:rgba(255,255,255,.12)}

/* Visor amplio del historial de exámenes dentro de Ajustes. */
#examHistoryViewer{
  position:fixed;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  z-index:9996;
  padding:18px;
  background:rgba(4,6,14,.72);
  backdrop-filter:blur(3px);
}
#examHistoryViewer.open{display:flex}
#examHistoryViewer .examHistoryViewerCard{
  width:min(1040px,96vw);
  height:min(88vh,900px);
  display:flex;
  flex-direction:column;
  background:linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)), var(--bg2);
  border:1px solid var(--border);
  border-radius:22px;
  box-shadow:0 24px 70px rgba(0,0,0,.48);
  overflow:hidden;
}
#examHistoryViewer .examHistoryViewerHd{
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:16px 18px;
  border-bottom:1px solid var(--border);
}
#examHistoryViewer .examHistoryViewerBd{
  flex:1;
  min-height:0;
  overflow:auto;
  padding:18px;
}
#examHistoryViewer .examHistoryQuestion{
  padding:14px;
  margin-bottom:12px;
  border-radius:16px;
  border:1px solid var(--border);
  background:rgba(255,255,255,.035);
}
@media (max-width:720px){
  #examHistoryViewer{padding:8px}
  #examHistoryViewer .examHistoryViewerCard{
    width:100%;
    height:94vh;
    border-radius:18px;
  }
  #examHistoryViewer .examHistoryViewerHd{padding:12px 14px}
  #examHistoryViewer .examHistoryViewerBd{padding:12px}
}


`;
document.head.appendChild(style);

const katexCss = document.createElement("link");
katexCss.rel = "stylesheet";
katexCss.href = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css";
document.head.appendChild(katexCss);

// HTML
document.body.innerHTML = `<div class="STQUEST">
<div class="wrap">
  <div class="topbar">
    <div class="brand">
      <div class="logo floaty">STQ</div>
      <div class="title">
        <h1>Study Quest</h1>
        <p>V0.8 Juego - Estudio - Examen</p>
      </div>
    </div>
    <div class="nav">
      <div class="subjectPicker" id="subjectPicker">
        <button class="pill subjectBtn" id="btnSubjectPicker" type="button">📚 <span id="subjectBtnLabel">Materia</span> ▾</button>
        <div class="subjectMenu" id="subjectMenu">
          <div class="subjectList" id="subjectList"></div>
          <div class="subjectMenuDivider"></div>
          <button class="subjectAddBtn" id="btnAddSubject" type="button">+ Añadir materia</button>
        </div>
      </div>
      <button class="pill active" data-nav="home">Inicio</button>
      <button class="pill" data-nav="game">Juego</button>
      <button class="pill" data-nav="study">Estudiar</button>
      <button class="pill" data-nav="exam">Examen</button>
      <button class="pill" data-nav="achievements">Logros</button>
      <button class="pill" data-nav="stats">Stats</button>
      <button class="pill" data-nav="settings">Ajustes</button>
    </div>
  </div>

  <div class="modalOverlay" id="addSubjectOverlay">
    <div class="modalCard">
      <h3>Añadir materia</h3>
      <div class="tiny">Elegí un nombre y el archivo .js con el banco de preguntas de la nueva materia (mismo formato que dbquestions.js). Si la materia tiene preguntas con diagramas, también podés sumar el archivo de diagramas (mismo formato que dbdiagrams.js) — es opcional. Si editaste los archivos, también tenes que editarlos en ajustes y subirlos de nuevo.</div>
      <div class="modalField">
        <label for="addSubjectName">Nombre de la materia</label>
        <input type="text" id="addSubjectName" placeholder="Ej: Redes de Datos" maxlength="60" />
      </div>
      <div class="modalField">
        <label for="addSubjectFile">Archivo .js (preguntas)</label>
        <input type="file" id="addSubjectFile" accept=".js,text/javascript" />
      </div>
      <div class="modalField">
        <label for="addSubjectDiagramsFile">Archivo .js (diagramas — opcional)</label>
        <input type="file" id="addSubjectDiagramsFile" accept=".js,text/javascript" />
      </div>
      <div class="modalError" id="addSubjectError"></div>
      <div class="modalActions">
        <button class="btn" id="btnCancelSubject" type="button">Cancelar</button>
        <button class="btn" id="btnSaveSubject" type="button">Guardar</button>
      </div>
    </div>
  </div>

  <div class="modalOverlay" id="editSubjectOverlay">
    <div class="modalCard">
      <h3>Editar materia</h3>
      <div class="tiny" id="editSubjectHint">Dejá los archivos vacíos para mantener lo que ya tiene esta materia.</div>
      <div class="modalField">
        <label for="editSubjectName">Nombre de la materia</label>
        <input type="text" id="editSubjectName" maxlength="60" />
      </div>
      <div class="modalField">
        <label for="editSubjectFile">Reemplazar banco de preguntas (.js — opcional)</label>
        <input type="file" id="editSubjectFile" accept=".js,text/javascript" />
      </div>
      <div class="modalField">
        <label for="editSubjectDiagramsFile">Agregar o reemplazar diagramas (.js — opcional)</label>
        <input type="file" id="editSubjectDiagramsFile" accept=".js,text/javascript" />
        <div class="tiny" id="editSubjectDiagramsStatus"></div>
      </div>
      <div class="modalError" id="editSubjectError"></div>
      <div class="modalActions">
        <button class="btn" id="btnCancelEditSubject" type="button">Cancelar</button>
        <button class="btn" id="btnSaveEditSubject" type="button">Guardar cambios</button>
      </div>
    </div>
  </div>


  <!-- Combate personalizado: se abre desde el botón "⚔️ Combate
       personalizado" de la pantalla de Combate (al lado de Inventario),
       que queda deshabilitado hasta derrotar a todos los jefes de zona
       (ver renderBattle). pc_castle sigue llevando directo a la
       pantalla de Combate como siempre, sin abrir este modal. Por
       ahora solo deja elegir el jefe y un multiplicador de preguntas
       base; el bloque "Próximamente" queda para futuras opciones
       (equipo fijo, límite de tiempo, etc.) -->
  <div class="modalOverlay" id="customBattleOverlay">
    <div class="modalCard">
      <h3>⚔️ Combate personalizado</h3>
      <div class="tiny">Elegí contra qué jefe pelear y cuántas preguntas de las suyas usar (relativo a su cantidad base).</div>
      <div class="modalField">
        <label>Jefe</label>
        <div class="row" id="customBattleBossList"></div>
      </div>
      <div class="modalField">
        <label>Multiplicador de preguntas</label>
        <div class="row" id="customBattleMultiplier">
          <button class="chip" data-mult="1.25" type="button">×1.25</button>
          <button class="chip" data-mult="1.5" type="button">×1.50</button>
          <button class="chip" data-mult="1.75" type="button">×1.75</button>
          <button class="chip" data-mult="2" type="button">×2.00</button>
        </div>
      </div>
      <div class="modalField">
        <label>Próximamente</label>
        <div class="tiny" style="opacity:.6">Más opciones de personalización (equipo fijo, límite de tiempo, dificultad de las preguntas, etc.) — llegan más adelante.</div>
      </div>
      <div class="modalActions">
        <button class="btn" id="btnCancelCustomBattle" type="button">Cancelar</button>
        <button class="btn" id="btnStartCustomBattle" type="button">Empezar combate</button>
      </div>
    </div>
  </div>

  <!-- Mapa de zonas expandido: se abre desde el botón "Mapa" de la
       pantalla de Juego (antes ese botón solo hacía go('game'), que era
       redundante ya que el nav "Juego" hace lo mismo). Muestra cómo se
       conectan las zonas entre sí (WORLD_ORDER) con "puentes" entre
       nodos, más la Tienda aparte como rama siempre accesible. Reusa
       exactamente la misma lógica de bloqueo/viaje que el panel chico
       "Mapa rápido" (ver renderWorldMapDiagram / travelToWorld). -->
  <div class="modalOverlay" id="worldMapOverlay">
    <div class="modalCard" style="max-width:680px">
      <h3>🗺️ Mapa de zonas</h3>
      <div class="tiny" style="margin-bottom:4px">Recordá recolectar monedas, investigar la tienda y explorar las zonas para subir de nivel.</div>
      <div id="worldMapDiagram"></div>
      <div class="modalActions">
        <button class="btn" id="btnCloseWorldMap" type="button">Cerrar</button>
      </div>
    </div>
  </div>

  <!-- Pantalla de nombre del héroe, estilo teclado retro de videojuego.
       Se abre sola (sin botón Cancelar) la primera vez que se abre el
       juego en este navegador, y se puede volver a abrir en cualquier
       momento (con Cancelar) desde Ajustes para cambiar el nombre. -->
  <div class="modalOverlay" id="heroNameOverlay">
    <div class="modalCard" style="max-width:520px">
      <h3 id="heroNameTitle">¡Bienvenido! ¿Cómo se llama tu héroe?</h3>
      <div class="tiny" id="heroNameSubtitle">Elegí un nombre con el teclado de abajo. Lo vas a poder cambiar después desde Ajustes.</div>
      <div class="heroNameDisplay" id="heroNameDisplay"><span class="heroNameCursor">_</span></div>
      <div class="modalError" id="heroNameError"></div>
      <div class="heroKeyboard" id="heroKeyboard">
        <button type="button" class="heroKey" data-key="A">A</button>
        <button type="button" class="heroKey" data-key="B">B</button>
        <button type="button" class="heroKey" data-key="C">C</button>
        <button type="button" class="heroKey" data-key="D">D</button>
        <button type="button" class="heroKey" data-key="E">E</button>
        <button type="button" class="heroKey" data-key="F">F</button>
        <button type="button" class="heroKey" data-key="G">G</button>
        <button type="button" class="heroKey" data-key="H">H</button>
        <button type="button" class="heroKey" data-key="I">I</button>
        <button type="button" class="heroKey" data-key="J">J</button>
        <button type="button" class="heroKey" data-key="K">K</button>
        <button type="button" class="heroKey" data-key="L">L</button>
        <button type="button" class="heroKey" data-key="M">M</button>
        <button type="button" class="heroKey" data-key="N">N</button>
        <button type="button" class="heroKey" data-key="O">O</button>
        <button type="button" class="heroKey" data-key="P">P</button>
        <button type="button" class="heroKey" data-key="Q">Q</button>
        <button type="button" class="heroKey" data-key="R">R</button>
        <button type="button" class="heroKey" data-key="S">S</button>
        <button type="button" class="heroKey" data-key="T">T</button>
        <button type="button" class="heroKey" data-key="U">U</button>
        <button type="button" class="heroKey" data-key="V">V</button>
        <button type="button" class="heroKey" data-key="W">W</button>
        <button type="button" class="heroKey" data-key="X">X</button>
        <button type="button" class="heroKey" data-key="Y">Y</button>
        <button type="button" class="heroKey" data-key="Z">Z</button>
        <button type="button" class="heroKey" data-key="0">0</button>
        <button type="button" class="heroKey" data-key="1">1</button>
        <button type="button" class="heroKey" data-key="2">2</button>
        <button type="button" class="heroKey" data-key="3">3</button>
        <button type="button" class="heroKey" data-key="4">4</button>
        <button type="button" class="heroKey" data-key="5">5</button>
        <button type="button" class="heroKey" data-key="6">6</button>
        <button type="button" class="heroKey" data-key="7">7</button>
        <button type="button" class="heroKey" data-key="8">8</button>
        <button type="button" class="heroKey" data-key="9">9</button>
        <button type="button" class="heroKey wide" data-key="__space__">␣ Espacio</button>
        <button type="button" class="heroKey wide" data-key="__back__">⌫ Borrar</button>
      </div>
      <div class="modalActions">
        <button class="btn" id="btnCancelHeroName" type="button" style="display:none">Cancelar</button>
        <button class="btn" id="btnConfirmHeroName" type="button" disabled>✔ Confirmar</button>
      </div>
    </div>
  </div>

  <button id="btnGemini" type="button" title="Preguntale a Claude">
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/960px-Claude_AI_symbol.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail" alt="Claude">
    <span class="btnGeminiSpark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="#fff"/>
      </svg>
    </span>
  </button>

  <button id="btnTutorialToggle" class="tutorial-launch hidden" type="button" title="Mostrar u ocultar tutorial">🎓 <span>Tutorial</span></button>

  <div id="tutorialOverlay" class="tutorial-overlay hidden">
    <div id="tutorialHighlight" class="tutorial-highlight" style="display:none"></div>

    <div id="tutorialCard" class="tutorial-card">
      <div class="row spaced" style="margin-bottom:8px">
        <div class="tutorial-progress" style="flex:1;margin:0">
          <div id="tutorialProgressBar"></div>
        </div>
        <button id="tutorialClose" class="tutorial-close" type="button" title="Ocultar tutorial" aria-label="Ocultar tutorial">×</button>
      </div>

      <h2 id="tutorialTitle">Bienvenido a Study Quest</h2>
      <div id="tutorialContent"></div>

      <div class="tutorial-actions">
        <button id="tutorialSkip" class="btn-secondary" type="button">Omitir</button>
        <span id="tutorialWaitHint" class="tutorial-waitclick-hint" style="display:none">👉 Tocá el elemento resaltado para continuar</span>
        <button id="tutorialNext" class="btn-primary" type="button">Siguiente</button>
      </div>
    </div>
  </div>

  <section id="home" class="section active">
    <div class="card hero">
      <div class="hero-box">
        <h2>Una base limpia para la materia que quieras.</h2>
        <p>
          Podés añadir tu propia materia con su banco de preguntas en formato .js, y todo quedará
          adaptado al juego, estudio y examen. También podés usar la materia de ejemplo que viene con la base.
        </p>
        <div class="row">
          <button class="btn" onclick="go('game')">▶ Jugar</button>
          <button class="btn" onclick="go('study')">📚 Repasar</button>
          <button class="btn" onclick="go('exam')">📝 Probar examen</button>
          <button class="btn" id="btnResetAll">♻ Reset progreso</button>
          <button class="btn" id="btnToggleInstructions">📖 Instrucciones</button>
        </div>
        <div class="mini" id="instructionsPanel" style="display:none;margin-top:10px">

          <div id="instructionsStep1">
            <div class="tiny" style="margin-bottom:10px">
              Podés usar los ejemplos de <b>questionsbanks</b> y <b>diagramas</b> que ya vienen por defecto si querés.
            </div>

            <button class="btn" id="btnInstructionsBasic" style="width:100%;text-align:left">📄 Instrucciones</button>
            <iframe id="instructionsBasicBody" class="instructionsBody" style="display:none" src="about:blank"></iframe>

            <button class="btn" id="btnInstructionsDiagrams" style="width:100%;text-align:left;margin-top:8px">📊 Instrucciones con diagramas y gráficos</button>
            <iframe id="instructionsDiagramsBody" class="instructionsBody" style="display:none" src="about:blank"></iframe>

            <div class="row" style="margin-top:12px;justify-content:flex-end">
              <button class="btn" id="btnInstructionsNext">Siguiente ▸</button>
            </div>
          </div>

          <div id="instructionsStep2" style="display:none">
            <div class="tiny" style="margin-bottom:12px">
              Una vez terminado lo anterior, tenés que seleccionar arriba, al lado de <b>Inicio</b>, la materia
              (si descargaste los archivos de ejemplo va a decir <b>"Base de Datos"</b>; si no, va a decir simplemente <b>"Materia"</b>).
              Si solo hiciste el paso sin diagramas, no te preocupes: podés dejar vacía la sección de diagramas.
            </div>
            <div class="row" style="justify-content:space-between">
              <button class="btn" id="btnInstructionsBack">◂ Atrás</button>
              <button class="btn" id="btnInstructionsFinish">✔ Terminar</button>
            </div>
          </div>

        </div>
        <div class="divider"></div>
        <div class="tiny">
          Moverse con <b>WASD</b> o flechas. <b>E</b> interactúa. <b>Esc</b> vuelve al mapa.
          <span class="muted">Todo queda guardado en este navegador. El reset de progreso conserva tu inventario, equipamiento, trofeos y el nombre del héroe salvo que lo cambies en Ajustes.</span>
        </div>
      </div>
      <div class="stats">
        <div class="stat">
          <b id="statAnswered">0</b><span>Respondidas</span>
          <span class="tiny" style="display:block;margin-top:6px">No repetidas: <strong id="statUniqueAnswered">0</strong> · Repetidas: <strong id="statRepeatedAnswered">0</strong></span>
        </div>
        <div class="stat"><b id="statAccuracy">0%</b><span>Precisión</span></div>
        <div class="stat"><b id="statLevel">1</b><span>Nivel</span></div>
      </div>
    </div>
  </section>

  <section id="game" class="section">
    <div id="gameLayoutRow">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Mapa</h2>
          <div class="row">
            <span class="badge" id="sceneName">Bosque</span>
            <button class="btn" id="btnSceneMenu">Menú</button>
            <button class="btn" id="btnSceneMap">Mapa</button>
            <button class="btn" data-nav="shop">🛒 Tienda</button>
            <button class="btn" data-nav="inventory">🎒 Inventario</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="canvas-shell">
            <canvas id="gameCanvas" width="1200" height="720"></canvas>
            <div id="virtualJoystick" class="virtualJoystick" aria-hidden="true">
              <div id="virtualJoystickKnob" class="virtualJoystickKnob"></div>
            </div>
            <div class="mobileCanvasControls">
              <button type="button" class="canvasBtn canvasBtnAction" id="btnActionMobile" aria-label="Interactuar">E</button>
              <div class="canvasEncounterButtons hidden" id="encounterPanelMobile">
                <button type="button" class="canvasBtn canvasBtnFight" id="btnEncounterFightMobile">⚔️ Combate</button>
                <button type="button" class="canvasBtn canvasBtnFlee" id="btnEncounterFleeMobile">🏃 Huir</button>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="tiny">
            Caminá por el mapa y tocá los portales para abrir escenas. Entrá al portales o acercate a enemigos para pelear('E'). Cuidá tu salud y tu XP. Podes ganar monedas y objetos,
            o usá el botón Inventario para revisar y equipar tus objetos en cualquier momento.
          </div>
        </div>
      </div>
      <div class="hud" id="gameHud">
        <div class="panel">
          <b>Estado</b>
          <div class="row spaced"><span>Héroe</span><b id="hudHeroName">-</b></div>
          <div class="row spaced"><span>Escena</span><b id="hudScene">Mapa</b></div>
          <div class="row spaced"><span>Posición</span><b id="hudPos">0,0</b></div>
          <div class="row spaced"><span>Monedas</span><b id="hudCoins">0</b></div>
          <div class="row spaced"><span>XP</span><b id="hudXp">0</b></div>
          <div class="row spaced"><span>Nivel</span><b id="hudLevel">1</b></div>
          <div class="row spaced"><span>Vidas base</span><b id="hudLives">3</b></div>
          <div class="progress" style="margin-top:8px"><div id="hudXpBar"></div></div>
        </div>
        <div class="panel hidden" id="encounterPanel">
          <b id="encounterName">Enemigo</b>
          <div class="tiny" id="encounterDesc">Descripción</div>
          <div class="row" style="margin-top:8px">
            <button class="btn" id="btnEncounterFight" style="flex:1">⚔️ Combate</button>
            <button class="btn" id="btnEncounterFlee" style="flex:1">Huir</button>
          </div>
        </div>
        <div class="panel">
          <b>Movete con WASD/Flechas, en moviles toca en pantalla donde quieras ir</b>
        </div>
        <div class="panel">
          <b>Acciones rápidas</b>
          <div class="row">
            <button class="btn" data-nav="inventory" style="flex:1">🎒 Inventario</button>
          </div>
        </div>
        <div class="panel">
          <b>Mapa rápido</b>
          <div class="tiny" style="margin-bottom:6px"><b> Elimina al jefe de la zona y llega al nivel necesario para avanzar.</div>
          <div class="worldGrid" id="worldGrid"></div>
        </div>
        <div class="panel">
          <b>Log</b>
          <div class="log" id="gameLog"></div>
        </div>
      </div>
    </div>
    <div id="gameHudBackdrop"></div>
    <button type="button" id="btnGameHudToggle" aria-label="Ver estadísticas, log y acciones rápidas">
      <span></span><span></span><span></span>
    </button>
  </section>

  <section id="study" class="section">
    <div class="study-layout">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Modo estudio</h2>
          <div class="row">
            <button class="btn" id="btnPrev">← Anterior</button>
            <button class="btn" id="btnRandom">Aleatoria</button>
            <button class="btn" id="btnNext">Siguiente →</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="topic-list" id="topicChips"></div>
          <div class="filters">
            <button class="chip active" data-view="all">Todas</button>
            <button class="chip" data-view="favorites">Favoritas</button>
            <button class="chip" data-view="wrong">Falladas</button>
            <button class="chip" data-view="due">Repasar hoy</button>
          </div>
          <div class="row spaced" style="margin-bottom:10px">
            <div class="tag" id="questionMeta">0/0</div>
            <button class="btn" id="btnFavorite">☆ Favorita</button>
          </div>
          <p class="qtext" id="studyQuestion"></p>
          <div id="studyDiagramContainer"></div>
          <div class="options" id="studyOptions"></div>
          <div class="feedback" id="studyFeedback">Elegí una respuesta para comenzar.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h3>Banco y búsqueda</h3></div>
        <div class="card-bd">
          <input type="search" id="searchBox" placeholder="Buscar tema, término o palabra clave..." />
          <div class="divider"></div>
          <div class="bank" id="bankList"></div>
        </div>
      </div>
    </div>
  </section>

  <section id="exam" class="section">
    <div id="examConfigView">
      <div class="grid">
        <div class="card">
          <div class="card-hd spaced">
            <h2>Examen base</h2>
            <div class="row">
              <button class="btn" id="btnStartExam">▶ Empezar</button>
            </div>
          </div>
          <div class="card-bd">
            <div class="row" style="margin-bottom:10px">
              <div style="flex:1">
                <label class="tiny">Cantidad</label>
                <select id="examCount">
                  <option>10</option>
                  <option selected>20</option>
                  <option>30</option>
                  <option value="custom">Personalizada...</option>
                </select>
                <input type="number" id="examCountCustom" class="studyInput" min="1" step="1" placeholder="Cantidad de preguntas" style="display:none;margin-top:8px" />
              </div>
              <div style="flex:1">
                <label class="tiny">Tiempo</label>
                <select id="examTime">
                  <option value="0">Sin límite</option>
                  <option value="10">10 min</option>
                  <option value="20">20 min</option>
                  <option value="30" selected>30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>
            <div class="mini" style="margin-bottom:10px">
              <label class="tiny">Tema (elegí uno, varios, o todos)</label>
              <div class="chip-list" id="examTopicChips" style="margin-top:8px"></div>
            </div>
            <div class="mini" style="margin-bottom:10px">
              <label class="tiny">Dificultad (elegí una, varias, o todas)</label>
              <div class="chip-list" id="examDifficultyChips" style="margin-top:8px"></div>
            </div>
            <div class="mini" style="margin-bottom:10px">
              <label class="tiny"><input type="checkbox" id="examAnswerSounds" checked> Sonidos de acierto/fallo al responder</label>
              <div class="tiny" style="margin-top:6px">Si está activo, al guardar o seleccionar una respuesta se escucha un sonido distinto según sea correcta o incorrecta.</div>
            </div>
            <div class="mini" style="margin-bottom:10px">
              <label class="tiny"><input type="checkbox" id="lockBack"> No permitir volver atrás</label>
              <div class="tiny" style="margin-top:6px">Si está activo, no se puede retroceder en el examen.</div>
            </div>
            <div class="row spaced">
              <div class="tag">Listo para iniciar</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-hd"><h2>Último examen</h2></div>
          <div class="card-bd" id="lastExamBox">
            <div class="qitem">Todavía no hay un examen terminado.</div>
          </div>
        </div>
      </div>
    </div>

    <div id="examRunView" class="game-layout" style="display:none">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Examen base</h2>
          <div class="row">
            <button class="btn" id="btnExitExam">← Volver</button>
            <button class="btn" id="btnPrevExam">←</button>
            <button class="btn" id="btnNextExam">→</button>
            <button class="btn" id="btnSubmitExam">✔ Terminar</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="row spaced" style="margin-bottom:10px">
            <div class="tag" id="examMeta">Listo para iniciar</div>
            <div class="tag">Tiempo: <b id="examTimer">00:00</b></div>
          </div>
          <div class="split" style="margin-bottom:10px">
            <div class="mini"><div class="tiny">Respondidas</div><b id="examAnswered">0/0</b></div>
            <div class="mini"><div class="tiny">Pendientes</div><b id="examPending">0</b></div>
          </div>
          <p class="qtext" id="examQuestion">Elegí cantidad y tema, luego tocá Empezar.</p>
          <div id="examDiagramContainer"></div>
          <div class="options" id="examOptions"></div>
          <div class="feedback" id="examFeedback">El examen se corrige al final.</div>
        </div>
      </div>
      <div class="hud">
        <div class="panel">
          <b>Progreso</b>
          <div class="progress"><div id="examProgress"></div></div>
          <div class="tiny" id="examProgressText" style="margin-top:8px">0/0 respondidas</div>
        </div>
        <div class="panel">
          <b>Notas</b>
          <div class="tiny"> Recordá que al ir "atrás ←" no queda guardado el examen. </div>
        </div>
      </div>
    </div>
  </section>

  <section id="stats" class="section">
    <div class="grid">
      <div class="card">
        <div class="card-hd"><h2>Tu progreso</h2></div>
        <div class="card-bd" id="statsBox"></div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Dominio por tema</h2></div>
        <div class="card-bd" id="topicStats"></div>
      </div>
    </div>
  </section>

  <section id="settings" class="section">
    <div class="grid">
      <div class="card">
        <div class="card-hd"><h2>Ajustes</h2></div>
        <div class="card-bd">
          <div class="split">
            <div class="mini">
              <div class="tiny">Tema visual</div>
              <div class="row" style="margin-top:8px">
                <button class="toggle active" data-theme-btn="dark">Oscuro</button>
                <button class="toggle" data-theme-btn="light">Claro</button>
              </div>
            </div>
            <div class="mini">
              <div class="tiny">Sonido</div>
              <div class="row" style="margin-top:8px">
                <button class="toggle active" data-sound="on">ON</button>
                <button class="toggle" data-sound="off">OFF</button>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="tiny">El sonido usa WebAudio y solo se activa en eventos puntuales.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Héroe</h2></div>
        <div class="card-bd">
          <div class="row spaced">
            <div class="tiny">Nombre actual: <b id="settingsHeroNameLabel">-</b></div>
            <button class="btn" id="btnChangeHeroName">✏️ Cambiar nombre</button>
          </div>
          <div class="divider mobileInterfaceOption" id="joystickSettingDivider"></div>
          <div class="mobileInterfaceOption" id="joystickSettingRow">
            <div class="tiny"><b>Joystick virtual</b><br>Solo disponible en dispositivos móviles. Al activarlo, tocar el mapa ya no mueve al personaje: se usa únicamente el joystick.</div>
            <div class="row" style="margin-top:8px">
              <button class="toggle" id="btnJoystickToggle" type="button" aria-pressed="false">🎮 Joystick: Desactivado</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Materias</h2></div>
        <div class="card-bd">
          <div class="tiny">Editá el banco de preguntas o los diagramas de cualquier materia (incluidas las que vienen por defecto), o eliminala. Las materias por defecto que elimines se pueden restaurar acá mismo.</div>
          <div class="divider"></div>
          <div id="settingsSubjectsList"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Progreso</h2></div>
        <div class="card-bd">
          <div class="tiny">El botón "Reset progreso" borra tus respuestas, XP, monedas y exámenes. Por defecto, los objetos comprados en la tienda, el equipamiento, los trofeos (logros) y el nombre de tu héroe <b>no</b> se borran.</div>
          <div class="divider"></div>
          <label class="tiny"><input type="checkbox" id="resetWipesInventory"> Al resetear el progreso, borrar también el inventario, equipamiento, trofeos y el nombre del héroe</label>
          <div class="divider"></div>
          <button class="btn" id="btnResetAllSettings">♻ Reset progreso</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Controles</h2></div>
        <div class="card-bd">
          <div class="tiny">Tocá la tecla a reasignar y después apretá la tecla que quieras usar para esa acción. Las flechas y Escape siempre funcionan además de esto (no se pueden reasignar).</div>
          <div class="divider"></div>
          <div id="controlsList"></div>
          <div class="divider"></div>
          <div class="row spaced"><span>Volver al juego</span><span class="keyBadge">Esc</span></div>
          <div class="divider"></div>
          <button class="btn" id="btnControlsReset">↺ Restaurar controles por defecto</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Interfaz</h2></div>
        <div class="card-bd">
          <div class="tiny">Tamaño del juego (el mapa completo).</div>
          <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px" id="canvasScaleChips">
            <button class="chip" data-canvas-scale="0.25" type="button">×0.25</button>
            <button class="chip" data-canvas-scale="0.5" type="button">×0.50</button>
            <button class="chip" data-canvas-scale="0.75" type="button">×0.75</button>
            <button class="chip" data-canvas-scale="1" type="button">×1.00</button>
            <button class="chip" data-canvas-scale="1.25" type="button">×1.25</button>
            <button class="chip" data-canvas-scale="1.5" type="button">×1.50</button>
            <button class="chip" data-canvas-scale="1.75" type="button">×1.75</button>
            <button class="chip" data-canvas-scale="2" type="button">×2.00</button>
          </div>
          <div class="divider"></div>
          <div class="tiny">Tamaño del minimapa (el recuadro chico arriba a la derecha), independiente del tamaño completo del juego.</div>
          <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:6px" id="minimapScaleChips">
            <button class="chip" data-minimap-scale="0.25" type="button">×0.25</button>
            <button class="chip" data-minimap-scale="0.5" type="button">×0.50</button>
            <button class="chip" data-minimap-scale="0.75" type="button">×0.75</button>
            <button class="chip" data-minimap-scale="1" type="button">×1.00</button>
            <button class="chip" data-minimap-scale="1.25" type="button">×1.25</button>
            <button class="chip" data-minimap-scale="1.5" type="button">×1.50</button>
            <button class="chip" data-minimap-scale="1.75" type="button">×1.75</button>
            <button class="chip" data-minimap-scale="2" type="button">×2.00</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Historial de exámenes</h2></div>
        <div class="card-bd" id="examHistoryBox">
          <div class="qitem">Todavía no hay exámenes terminados.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Lenguaje</h2></div>
        <div class="card-bd">
          <div class="tiny">Cambia solamente el idioma del contenido "GUI" pero no del juego, todavia. Recomendamos dejar la casilla marcada..</div>
          <div class="divider"></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select id="pageTranslateLang" class="mini">
              <option value="en">Inglés</option>
              <option value="es">Español</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
              <option value="it">Italiano</option>
            </select>
            <label class="tiny"><input type="checkbox" id="pageTranslateAuto" checked> Automatico</label>
          </div>
          <div class="divider"></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button class="btn" id="btnTranslateNow">Aplicar lenguaje</button>
            <button class="btn" id="btnTranslateRestore">↺ Restaurar idioma original</button>
          </div>
          <div class="tiny" id="pageTranslateStatus" style="margin-top:6px"></div>
        </div>
      </div>
    </div>
  </section>


  <div id="examHistoryViewer" aria-hidden="true">
    <div class="examHistoryViewerCard" role="dialog" aria-modal="true" aria-labelledby="examHistoryViewerTitle">
      <div class="examHistoryViewerHd">
        <div>
          <h2 id="examHistoryViewerTitle" style="margin:0">Detalle del examen</h2>
          <div id="examHistoryViewerMeta" class="tiny" style="margin-top:4px"></div>
        </div>
        <button class="btn" id="btnCloseExamHistoryViewer" type="button">← Volver al historial</button>
      </div>
      <div class="examHistoryViewerBd" id="examHistoryViewerBody"></div>
    </div>
  </div>


  <section id="battle" class="section">
    <div class="battleLayout">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Combate basado en preguntas</h2>
          <div class="row">
            <button class="btn" id="btnBattleRandom">Inventario</button>
            <button class="btn" id="btnCustomBattle" disabled title="Derrotá a todos los jefes de zona para desbloquearlo">🔒 Combate personalizado</button>
            <button class="btn" id="btnBattleFinal">Jefe final</button>
            <button class="btn" id="btnBattleReset">Salir</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="split">
            <div class="mini">
              <div class="hpLabel"><span>Jugador</span><b id="battlePlayerHp">3/3</b></div>
              <div class="progress"><div id="battlePlayerBar"></div></div>
            </div>
            <div class="mini">
              <div class="hpLabel"><span id="battleEnemyName">Sin enemigo</span><b id="battleEnemyHp">0/0</b></div>
              <div class="progress"><div id="battleEnemyBar"></div></div>
              <div class="battleTimer">
                  <div id="battleTimerBar"></div>
              </div>

              <div id="battleTimerText" class="battleTimerText">
                  ⏳ 0s
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="row spaced">
            <div class="tag" id="battleMeta">Elegí un jefe o un encuentro</div>
            <div class="tag">Racha: <b id="battleStreak">0</b></div>
          </div>
          <p class="qtext" id="battleQuestion">Las respuestas correctas dañan al enemigo. Las incorrectas te dañan a vos.</p>
          <div id="diagramContainer"></div>
          <div class="options battleOptions" id="battleOptions"></div>
          <div class="feedback" id="battleFeedback">Elegí un combate para empezar.</div>
        </div>
      </div>
      <div class="hud">
        <div class="panel">
          <b>Jefes</b>
          <div class="bank" id="bossList"></div>
        </div>
        <div class="panel">
          <b>Registro de respuestas</b>
          <div class="tiny" style="margin-bottom:6px">Definición de cada pregunta respondida en este combate.</div>
          <div class="log" id="battleAnswerLog"></div>
        </div>
        <div class="panel">
          <b>Botín</b>
          <div class="tiny">Las victorias dan XP, monedas y desbloquean logros.</div>
          <div class="divider"></div>
          <div class="row spaced"><span>Victorias</span><b id="battleWins">0</b></div>
          <div class="row spaced"><span>Derrotas</span><b id="battleLosses">0</b></div>
        </div>
      </div>
    </div>
  </section>

  <section id="shop" class="section">
    <div class="simpleLayout">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Tienda</h2>
          <div class="row">
            <button class="btn" id="btnExittoGame">Salir</button>
          </div>
        </div>
        <div class="card-bd">
          <div class="tiny" style="margin-bottom:10px">Consumibles</div>
          <div class="itemGrid" id="shopList"></div>
          <div class="divider"></div>
          <div class="tiny" style="margin-bottom:10px">Equipamiento</div>
          <div class="itemGrid" id="equipShopList"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h3>Inventario rápido</h3></div>
        <div class="card-bd" id="inventoryQuick"></div>
      </div>
    </div>
  </section>

  <section id="inventory" class="section">
    <div class="simpleLayout">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Inventario</h2>
          <div class="row">
            <button class="btn" id="btnExitInventory">Salir</button>
            <span class="badge">Monedas: <b id="invCoins">0</b></span>
            <span class="badge">XP: <b id="invXp">0</b></span>
          </div>
        </div>
        <div class="card-bd">
          <div class="tiny" style="margin-bottom:10px">Equipamiento</div>
          <div class="equipSlots" id="equipSlots"></div>
          <div class="divider"></div>
          <div class="tiny" style="margin-bottom:10px">Consumibles</div>
          <div class="itemGrid" id="inventoryList"></div>
          <div class="divider"></div>
          <div class="tiny" style="margin-bottom:10px">Objetos especiales</div>
          <div class="itemGrid" id="specialItemsList"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h3>Progreso</h3></div>
        <div class="card-bd" id="inventoryProgress"></div>
      </div>
    </div>
  </section>

  <section id="achievements" class="section">
    <div class="grid">
      <div class="card">
        <div class="card-hd spaced">
          <h2>Logros</h2>
          <div class="row">
            <span class="badge">Desbloqueados: <b id="achUnlocked">0</b>/<b id="achTotal">0</b></span>
          </div>
        </div>
        <div class="card-bd">
          <div class="bank" id="achievementList"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hd"><h2>Resumen</h2></div>
        <div class="card-bd" id="achievementSummary"></div>
      </div>
    </div>
  </section>

  <div class="footer">Study Quest v0.8 base — Aprendé jugando.</div>
</div>

</div>`;

// JavaScript
document.body.dataset.theme = 'light'; // antes era el atributo data-theme="dark" en <body>

// Los <script> insertados vía innerHTML nunca se ejecutan (limitación
// del DOM), así que lo que antes eran <script> dentro del HTML de
// arriba se carga/ejecuta acá con createElement.
function __dbquestLoadScript__(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar: ' + src));
    document.head.appendChild(s);
  });
}

__dbquestLoadScript__('https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js')
  .then(() => __dbquestLoadScript__('https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js'))
  .then(() => {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  })
  .catch(err => console.error(err));

// Traducción "de toda la página" (tarjeta "Traducir la app" en Ajustes),
// pero SIN el MutationObserver del widget de Google. En vez de vigilar
// el DOM todo el tiempo, traduce en lotes puntuales: la pantalla activa
// al usar "Traducir esta pantalla", y automáticamente cada pantalla
// nueva al navegar (ver el gancho al final de go()). El canvas del
// juego (drawGameScene, etc.) ni entra acá porque no es texto del DOM.
let pageTranslateLang = 'en';
let pageTranslateEnabled = false; // recién true después de usar "Traducir esta pantalla" por primera vez
const __dbquestTranslatedNodes__ = new Map(); // Text node -> texto original, para poder restaurar

function __dbquestCollectTextNodes__(root){
  if(!root) return [];
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      const t = node.nodeValue;
      if(!t || !t.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if(!parent) return NodeFilter.FILTER_REJECT;
      if(parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
      if(parent.closest('.notranslate')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let n;
  while((n = walker.nextNode())) nodes.push(n);
  return nodes;
}

function __dbquestTranslateBatchLegacy__(texts, targetLang){
  // Un solo pedido soporta varios "q=", pero se trocea en grupos chicos
  // por las dudas de límite de largo de URL en algunos navegadores.
  const CHUNK = 40;
  const chunks = [];
  for(let i = 0; i < texts.length; i += CHUNK) chunks.push(texts.slice(i, i + CHUNK));
  return Promise.all(chunks.map(chunk => {
    const params = chunk.map(t => 'q=' + encodeURIComponent(t)).join('&');
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='
      + encodeURIComponent(targetLang) + '&dt=t&' + params;
    return fetch(url)
      .then(r => { if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => (data[0] || []).map(pair => pair[0]));
  })).then(results => results.flat());
}

function __dbquestTranslateBatch__(texts, targetLang){
  // La API devuelve segmentos, no necesariamente una respuesta por cada
  // parámetro "q". Enviar varios textos juntos podía desalinearlos y mezclar
  // traducciones en distintos elementos. Cada texto se consulta por separado.
  const uniqueTexts = [...new Set(texts)];
  const translatedByText = new Map();
  let nextIndex = 0;
  const CONCURRENCY = 4;

  async function translateOne(text){
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='
      + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    const response = await fetch(url);
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return (data[0] || []).map(part => part[0] || '').join('') || text;
  }

  async function worker(){
    while(nextIndex < uniqueTexts.length){
      const text = uniqueTexts[nextIndex++];
      try {
        translatedByText.set(text, await translateOne(text));
      } catch(err) {
        console.warn('No se pudo traducir un texto:', err);
        translatedByText.set(text, text);
      }
    }
  }

  return Promise.all(Array.from({ length: Math.min(CONCURRENCY, uniqueTexts.length) }, worker))
    .then(() => texts.map(text => translatedByText.get(text) || text));
}

function translateSectionNow(sectionEl, targetLang){
  if(!sectionEl) return Promise.resolve();
  // La barra superior está fuera de las secciones, por eso se agrega como
  // raíz adicional junto con la pantalla que el usuario está viendo.
  const roots = [sectionEl, document.querySelector('.topbar')].filter(Boolean);
  const nodes = roots
    .flatMap(root => __dbquestCollectTextNodes__(root))
    .filter(n => !__dbquestTranslatedNodes__.has(n));
  if(!nodes.length) return Promise.resolve();
  const texts = nodes.map(n => n.nodeValue);
  return __dbquestTranslateBatch__(texts, targetLang).then(translated => {
    nodes.forEach((node, i) => {
      if(translated[i] && translated[i] !== node.nodeValue){
        __dbquestTranslatedNodes__.set(node, node.nodeValue);
        node.nodeValue = translated[i];
      }
    });
  });
}

function restorePageTranslation(){
  __dbquestTranslatedNodes__.forEach((original, node) => { node.nodeValue = original; });
  __dbquestTranslatedNodes__.clear();
}

(function(){
  const status = document.getElementById('pageTranslateStatus');
  const btnNow = document.getElementById('btnTranslateNow');
  const btnRestore = document.getElementById('btnTranslateRestore');
  const langSel = document.getElementById('pageTranslateLang');

  btnNow?.addEventListener('click', () => {
    pageTranslateLang = langSel?.value || 'en';
    if(status) status.textContent = 'Traduciendo esta pantalla...';
    btnNow.disabled = true;
    const activeSection = document.querySelector('.section.active');
    translateSectionNow(activeSection, pageTranslateLang)
      .then(() => { pageTranslateEnabled = true; if(status) status.textContent = 'Listo.'; })
      .catch(err => {
        console.error('Error traduciendo la pantalla:', err);
        if(status) status.textContent = 'No se pudo traducir (¿sin conexión?).';
      })
      .finally(() => { btnNow.disabled = false; });
  });

  btnRestore?.addEventListener('click', () => {
    restorePageTranslation();
    pageTranslateEnabled = false;
    if(status) status.textContent = 'Texto original restaurado.';
  });
})();

// Controles remapeables (tarjeta "Controles" en Ajustes). Solo las
// acciones de state.controls son reasignables; flechas y Escape quedan
// fijas siempre (ver el keydown/keyup más abajo en el archivo).
let controlsListening = null; // acción esperando la próxima tecla, o null

const CONTROL_DEFAULTS = { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' };
const CONTROL_LABELS_UI = { up:'Arriba', down:'Abajo', left:'Izquierda', right:'Derecha', interact:'Interactuar', map:'Mapa', inventory:'Inventario', shop:'Tienda' };

function renderInterfaceScaleChips(){
  const api = window.__DBQUEST_INTERFACE_API__;
  if(!api) return;
  const { canvasScale, minimapScale } = api.get();
  document.querySelectorAll('#canvasScaleChips [data-canvas-scale]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.canvasScale) === canvasScale);
  });
  document.querySelectorAll('#minimapScaleChips [data-minimap-scale]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.minimapScale) === minimapScale);
  });
}

document.getElementById('canvasScaleChips')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-canvas-scale]');
  if(!btn) return;
  window.__DBQUEST_INTERFACE_API__?.setCanvasScale(Number(btn.dataset.canvasScale));
  renderInterfaceScaleChips();
});

document.getElementById('minimapScaleChips')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-minimap-scale]');
  if(!btn) return;
  window.__DBQUEST_INTERFACE_API__?.setMinimapScale(Number(btn.dataset.minimapScale));
  renderInterfaceScaleChips();
});

window.__DBQUEST_TOGGLE_JOYSTICK__ = function(){
  if(typeof state === 'undefined') return false;
  const next = !Boolean(state.joystickEnabled);
  state.joystickEnabled = next;
  resetVirtualJoystick();
  updateJoystickUI();
  saveState();
  return true;
};

// Único listener del botón (antes también tenía un onclick inline en el
// HTML: cada click disparaba los dos, así que el estado se activaba y
// desactivaba en el mismo click y visualmente no cambiaba nada).
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#btnJoystickToggle');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  window.__DBQUEST_TOGGLE_JOYSTICK__?.();
  btn.blur();
}, true);

function renderControlsList(){
  const box = document.getElementById('controlsList');
  if(!box) return;
  const controlsApi = window.__DBQUEST_CONTROLS_API__;
  if(!controlsApi) return;
  const defaults = CONTROL_DEFAULTS;
  const controls = controlsApi.get();
  box.innerHTML = Object.keys(defaults).map(action => {
    const key = controls[action] || defaults[action];
    const listening = controlsListening === action;
    return `
      <div class="row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0">
        <span class="tiny">${CONTROL_LABELS_UI[action]}</span>
        <button type="button" class="chip ${listening ? 'active' : ''}" data-control-action="${action}">
          ${listening ? 'Tocá una tecla...' : key.toUpperCase()}
        </button>
      </div>
    `;
  }).join('');
}

document.getElementById('controlsList')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-control-action]');
  if(!btn) return;
  controlsListening = btn.dataset.controlAction;
  renderControlsList();
});

document.getElementById('btnControlsReset')?.addEventListener('click', () => {
  window.__DBQUEST_CONTROLS_API__?.reset();
  controlsListening = null;
  renderControlsList();
});

// Un solo listener global captura la próxima tecla cuando hay una acción
// esperando reasignación (controlsListening). No interfiere con el
// keydown normal del juego: ese usa isTypingTarget() para ignorar todo
// mientras se escribe en un campo de texto, y acá directamente cortamos
// con return apenas no hay nada esperando reasignación.
window.addEventListener('keydown', e => {
  if(!controlsListening) return;
  e.preventDefault();
  e.stopImmediatePropagation(); // que no le llegue también al keydown del juego (movimiento, etc.)
  if(e.key === 'Escape'){ controlsListening = null; renderControlsList(); return; }
  const key = e.key.toLowerCase();
  if(key.length !== 1) return; // solo letras/números, no F5, Shift, etc.
  // Si esa tecla ya la usaba otra acción, se la sacamos de ahí para
  // evitar que dos acciones queden pegadas a la misma tecla.
  const action = controlsListening;
  const controlsApi = window.__DBQUEST_CONTROLS_API__;
  if(!controlsApi) return;
  const controls = controlsApi.get();
  Object.keys(controls).forEach(other => {
    if(other !== action && controls[other] === key) controls[other] = '';
  });
  controlsApi.set(action, key);
  controlsListening = null;
  renderControlsList();
});

(function(){
  var CUSTOM_KEY = 'dbquest_custom_subjects_v1';
  var CURRENT_KEY = 'dbquest_current_subject_v1';
  var HIDDEN_KEY = 'dbquest_hidden_builtins_v1';
  var OVERRIDES_KEY = 'dbquest_builtin_overrides_v1';

  var BUILTINS = [
    { id: 'bd1',  label: 'Base de Datos', kind: 'src', value: 'dbquestions.js', diagrams: 'dbdiagrams.js' }
  ];

  function readJSON(key, fallback){
    try {
      var v = JSON.parse(localStorage.getItem(key) || 'null');
      return v === null || v === undefined ? fallback : v;
    } catch(e){ return fallback; }
  }
  function writeJSON(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){}
  }
  function escapeHtmlBoot(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  var custom = readJSON(CUSTOM_KEY, []);
  if (!Array.isArray(custom)) custom = [];

  var hidden = readJSON(HIDDEN_KEY, []);
  if (!Array.isArray(hidden)) hidden = [];

  var overrides = readJSON(OVERRIDES_KEY, {});
  if (!overrides || typeof overrides !== 'object') overrides = {};

  window.__DBQUEST_BUILTINS__ = BUILTINS;
  window.__DBQUEST_CUSTOM_KEY__ = CUSTOM_KEY;
  window.__DBQUEST_CURRENT_KEY__ = CURRENT_KEY;
  window.__DBQUEST_HIDDEN_KEY__ = HIDDEN_KEY;
  window.__DBQUEST_OVERRIDES_KEY__ = OVERRIDES_KEY;

  // Materias visibles: los builtins no ocultados + las personalizadas.
  // Los builtins "eliminados" no se borran de verdad (son parte del
  // juego base): simplemente se agregan a HIDDEN_KEY y se filtran acá.
  var visibleBuiltins = BUILTINS.filter(function(b){
    return hidden.indexOf(b.id) === -1;
  });

  var all = visibleBuiltins.concat(custom);
  window.__DBQUEST_SUBJECTS__ = all;

  var currentId = localStorage.getItem(CURRENT_KEY) || 'bd1';

  var subj = null;
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === currentId) { subj = all[i]; break; }
  }

  // Si la materia guardada ya no existe (o está oculta/borrada), caer a
  // la primera materia visible que quede. Si no queda ninguna, subj
  // se deja en null: más abajo se muestra la pantalla de "sin materias".
  if (!subj && all.length) {
    subj = all[0];
    currentId = subj.id;
    localStorage.setItem(CURRENT_KEY, subj.id);
  }

  window.__DBQUEST_CURRENT_SUBJECT__ = subj;

  // ---------------------------------------------------------
  // ACCIONES DE RECUPERACIÓN
  // ---------------------------------------------------------

  window.__DBQUEST_RECOVER__ = function(action){

    var isBuiltinTarget = BUILTINS.some(function(s){ return s.id === action; });

    if (isBuiltinTarget) {
      // Puede estar oculta (borrada); usarla la vuelve a mostrar.
      var h = readJSON(HIDDEN_KEY, []);
      if (!Array.isArray(h)) h = [];
      h = h.filter(function(id){ return id !== action; });
      writeJSON(HIDDEN_KEY, h);
      localStorage.setItem(CURRENT_KEY, action);
      location.reload();
      return;
    }

    if (action === 'delete') {

      var brokenId = (window.__DBQUEST_CURRENT_SUBJECT__ || {}).id;
      var isBuiltin = BUILTINS.some(function(s){ return s.id === brokenId; });

      if (isBuiltin && brokenId) {
        var h2 = readJSON(HIDDEN_KEY, []);
        if (!Array.isArray(h2)) h2 = [];
        if (h2.indexOf(brokenId) === -1) h2.push(brokenId);
        writeJSON(HIDDEN_KEY, h2);
        var ov = readJSON(OVERRIDES_KEY, {});
        if (ov && typeof ov === 'object') { delete ov[brokenId]; writeJSON(OVERRIDES_KEY, ov); }
      } else if (brokenId) {
        var saved = readJSON(CUSTOM_KEY, []);
        if (!Array.isArray(saved)) saved = [];
        saved = saved.filter(function(s){ return s.id !== brokenId; });
        writeJSON(CUSTOM_KEY, saved);
      }

      if (brokenId) {
        try { localStorage.removeItem('dbquest_v3base_state_' + brokenId); } catch(e){}
      }

      localStorage.removeItem(CURRENT_KEY);
      location.reload();
      return;
    }

    if (action === 'restoreDefaults') {
      writeJSON(HIDDEN_KEY, []);
      if (!localStorage.getItem(CURRENT_KEY)) {
        localStorage.setItem(CURRENT_KEY, BUILTINS[0].id);
      }
      location.reload();
    }
  };

  // Carga un archivo .js (banco de preguntas, y opcionalmente uno de
  // diagramas) desde las pantallas de recuperación (sin materias / error
  // de carga), donde el resto del código de la app todavía no existe.
  // Crea una materia personalizada nueva y la deja activa.
  window.__DBQUEST_LOAD_FROM_RECOVERY__ = function(){
    var nameInput = document.getElementById('recoverSubjectName');
    var fileInput = document.getElementById('recoverSubjectFile');
    var diagInput = document.getElementById('recoverSubjectDiagrams');
    var errorBox = document.getElementById('recoverSubjectError');
    var btn = document.getElementById('recoverSubjectSaveBtn');

    var name = ((nameInput && nameInput.value) || '').trim();
    var file = fileInput && fileInput.files && fileInput.files[0];
    var diagramsFile = diagInput && diagInput.files && diagInput.files[0];

    if (errorBox) errorBox.textContent = '';
    if (!name) { if (errorBox) errorBox.textContent = 'Poné un nombre para la materia.'; return; }
    if (!file) { if (errorBox) errorBox.textContent = 'Elegí un archivo .js con el banco de preguntas.'; return; }
    if (btn) btn.disabled = true;

    var reader = new FileReader();
    reader.onerror = function(){
      if (errorBox) errorBox.textContent = 'No se pudo leer el archivo.';
      if (btn) btn.disabled = false;
    };
    reader.onload = function(){
      var content = String(reader.result || '');
      if (!/QUESTION_BANK/.test(content)) {
        if (errorBox) errorBox.textContent = 'El archivo no parece definir QUESTION_BANK. Revisá que sea el archivo correcto.';
        if (btn) btn.disabled = false;
        return;
      }

      function finish(diagramsContent){
        var id = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
        var saved = readJSON(CUSTOM_KEY, []);
        if (!Array.isArray(saved)) saved = [];
        var entry = { id: id, label: name, kind: 'content', value: content };
        if (diagramsContent) entry.diagrams = diagramsContent;
        saved.push(entry);
        writeJSON(CUSTOM_KEY, saved);
        localStorage.setItem(CURRENT_KEY, id);
        location.reload();
      }

      if (!diagramsFile) { finish(null); return; }

      var diagReader = new FileReader();
      diagReader.onerror = function(){
        if (errorBox) errorBox.textContent = 'No se pudo leer el archivo de diagramas.';
        if (btn) btn.disabled = false;
      };
      diagReader.onload = function(){
        var diagramsContent = String(diagReader.result || '');
        if (!/buildDiagramSVG/.test(diagramsContent)) {
          if (errorBox) errorBox.textContent = 'El archivo de diagramas no parece definir buildDiagramSVG.';
          if (btn) btn.disabled = false;
          return;
        }
        finish(diagramsContent);
      };
      diagReader.readAsText(diagramsFile);
    };
    reader.readAsText(file);
  };

  // ---------------------------------------------------------
  // PANTALLAS DE RECUPERACIÓN (error de carga / sin materias)
  // ---------------------------------------------------------

  function builtinButtonsHtml(){
    return BUILTINS.map(function(b){
      return '<button onclick="window.__DBQUEST_RECOVER__(\'' + b.id + '\')" style="padding:11px 16px;border:0;border-radius:10px;cursor:pointer;font-weight:700;">' +
        (b.id === 'bd1' ? '🗄️' : '📘') + ' Usar ' + escapeHtmlBoot(b.label) +
      '</button>';
    }).join('');
  }

  function uploadFormHtml(){
    return '' +
      '<div style="margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)">' +
        '<div style="font-weight:700;margin-bottom:10px">📤 O cargá una materia nueva</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<input id="recoverSubjectName" type="text" placeholder="Nombre de la materia" maxlength="60" style="padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:#0c1122;color:#f4f6ff" />' +
          '<label style="font-size:12px;color:#b8c0d9">Archivo .js con el banco de preguntas' +
            '<input id="recoverSubjectFile" type="file" accept=".js,text/javascript" style="display:block;margin-top:4px;color:#f4f6ff" />' +
          '</label>' +
          '<label style="font-size:12px;color:#b8c0d9">Archivo .js de diagramas (opcional)' +
            '<input id="recoverSubjectDiagrams" type="file" accept=".js,text/javascript" style="display:block;margin-top:4px;color:#f4f6ff" />' +
          '</label>' +
          '<div id="recoverSubjectError" style="color:#ffb4b4;font-size:13px;min-height:16px"></div>' +
          '<button id="recoverSubjectSaveBtn" onclick="window.__DBQUEST_LOAD_FROM_RECOVERY__()" style="padding:11px 16px;border:0;border-radius:10px;cursor:pointer;font-weight:700;background:#4c6fff;color:white;align-self:flex-start">Cargar y usar esta materia</button>' +
        '</div>' +
      '</div>';
  }

  window.__DBQUEST_SHOW_LOAD_ERROR__ = function(error){

    var subject = window.__DBQUEST_CURRENT_SUBJECT__ || {};
    var isCustom = subject.kind !== 'src';

    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1020;color:#f4f6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;box-sizing:border-box;">
        <div style="width:min(620px,100%);background:#151b30;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.35);">
          <div style="font-size:42px;margin-bottom:12px;">⚠️</div>
          <h2 style="margin:0 0 12px;font-size:24px;">No se pudo cargar la materia</h2>
          <p style="color:#b8c0d9;line-height:1.55;">
            La materia <b style="color:white">${escapeHtmlBoot(subject.label || 'seleccionada')}</b>
            contiene un error de sintaxis o no cumple el formato esperado por DB Quest.
          </p>
          <div style="background:#0c1122;border-radius:12px;padding:12px 14px;margin:16px 0;font-family:monospace;font-size:12px;color:#ffb4b4;overflow:auto;max-height:120px;">
            ${escapeHtmlBoot(error && error.message ? error.message : (error || 'Error desconocido'))}
          </div>
          <p style="color:#b8c0d9;font-size:14px;">
            Podés volver a una materia incluida en el juego sin perderla, o eliminar la materia dañada.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">
            ${builtinButtonsHtml()}
            ${isCustom ? `<button onclick="window.__DBQUEST_RECOVER__('delete')" style="padding:11px 16px;border:0;border-radius:10px;cursor:pointer;font-weight:700;background:#c0392b;color:white;">🗑️ Eliminar materia dañada</button>` : ''}
          </div>
          ${uploadFormHtml()}
        </div>
      </div>
    `;
  };

  window.__DBQUEST_SHOW_NO_SUBJECTS__ = function(){
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1020;color:#f4f6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;box-sizing:border-box;">
        <div style="width:min(620px,100%);background:#151b30;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.35);">
          <div style="font-size:42px;margin-bottom:12px;">📭</div>
          <h2 style="margin:0 0 12px;font-size:24px;">No hay ninguna materia cargada</h2>
          <p style="color:#b8c0d9;line-height:1.55;">
            Borraste todas las materias (incluidas las que vienen por defecto). Restaurá las materias
            por defecto o cargá una materia nueva con su banco de preguntas en .js para seguir jugando.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">
            <button onclick="window.__DBQUEST_RECOVER__('restoreDefaults')" style="padding:11px 16px;border:0;border-radius:10px;cursor:pointer;font-weight:700;background:#4c6fff;color:white;">♻ Restaurar materias por defecto</button>
          </div>
          ${uploadFormHtml()}
        </div>
      </div>
    `;
  };

  // ---------------------------------------------------------
  // CARGAR BANCO
  // ---------------------------------------------------------

  if (!subj) {
    // No queda ninguna materia visible (builtins ocultas + sin
    // personalizadas). No hay nada para cargar con document.write: se
    // muestra directamente la pantalla de "sin materias".
    window.__DBQUEST_NO_SUBJECTS__ = true;
    window.__DBQUEST_SHOW_NO_SUBJECTS__();
  } else {

    var scriptsToLoad = [];

    try {

      if (subj.kind === 'src') {

        // Las materias builtin pueden tener un "override" guardado desde
        // Ajustes (cambiar el banco de preguntas y/o agregar o editar un
        // diagrama sin tocar los archivos originales del juego). Si
        // existe, se usa ese contenido guardado en vez del archivo
        // original; si el override solo tocó una de las dos partes
        // (preguntas o diagramas), la otra sigue cargándose del archivo
        // original normalmente.
        var ov = (overrides && overrides[subj.id]) || null;

        if (ov && ov.value) {
          var blobQ = new Blob([ov.value], { type: 'text/javascript' });
          scriptsToLoad.push(URL.createObjectURL(blobQ));
        } else {
          scriptsToLoad.push(subj.value);
        }

        if (ov && ov.diagrams) {
          var blobD = new Blob([ov.diagrams], { type: 'text/javascript' });
          scriptsToLoad.push(URL.createObjectURL(blobD));
        } else if (subj.diagrams) {
          scriptsToLoad.push(String(subj.diagrams));
        }

      } else {

        var blob = new Blob([subj.value], { type: 'text/javascript' });
        var url = URL.createObjectURL(blob);
        scriptsToLoad.push(url);

        // Materias personalizadas: el modal de "agregar/editar materia"
        // permite subir tanto el banco de preguntas como (opcionalmente)
        // el archivo de diagramas; ambos quedan guardados en
        // localStorage como texto plano en subj.value / subj.diagrams y
        // se cargan acá con el mismo patrón de Blob + document.write.
        if (subj.diagrams) {
          var diagBlob = new Blob([subj.diagrams], { type: 'text/javascript' });
          var diagUrl = URL.createObjectURL(diagBlob);
          scriptsToLoad.push(diagUrl);
        }
      }

    } catch(e) {
      window.__DBQUEST_SHOW_LOAD_ERROR__(e);
      return;
    }

    // Cargar los scripts en orden (mismo orden que tenian con document.write)
    // y recien arrancar la app principal cuando todos terminaron.
    (function loadNext(i){
      if (i >= scriptsToLoad.length) { __DBQUEST_START__(); return; }
      __dbquestLoadScript__(scriptsToLoad[i]).then(() => loadNext(i + 1)).catch(function(err){
        window.__DBQUEST_SHOW_LOAD_ERROR__(err);
      });
    })(0);
  }

})();

function __DBQUEST_START__(){

function renderLatex(el){

    if(!window.renderMathInElement || !el) return;

    renderMathInElement(el,{
        delimiters:[
            { left:"$$", right:"$$", display:true },
            { left:"$", right:"$", display:false }
        ],
        throwOnError:false
    });

}  
// Verificar que la materia haya cargado correctamente
if (
  !window.__DBQUEST_NO_SUBJECTS__ &&
  (typeof QUESTION_BANK === 'undefined' ||
  !Array.isArray(QUESTION_BANK))
) {

  window.addEventListener('DOMContentLoaded', function(){

    window.__DBQUEST_SHOW_LOAD_ERROR__(
      new Error(
        'QUESTION_BANK no existe. El archivo puede contener un error de sintaxis o no tiene el formato correcto.'
      )
    );

  });

  throw new Error(
    'DB Quest detuvo la carga porque QUESTION_BANK no está disponible.'
  );
}

if (window.__DBQUEST_NO_SUBJECTS__) {
  throw new Error('DB Quest detuvo la carga: no hay ninguna materia cargada.');
}

const TOPICS = [...new Set(QUESTION_BANK.map(q => q.topic))];
// ===================== TEMAS POR ID NUMÉRICO =====================
// Cada pregunta del banco (algquestions.js) trae, además de "topic" (el
// nombre legible que se muestra en pantalla), un "themeId" numérico fijo
// (1, 2, 3...) que agrupa las preguntas por bloque temático real. Las
// zonas del mapa (WORLD_DEFS) y la rotación de temas de enemigos/jefes
// filtran por ESTE número, no por el nombre — así, si el día de mañana se
// cambia el banco de preguntas por el de otra materia (con otros nombres
// de tema), alcanza con que las preguntas nuevas traigan "themeId" para
// que las zonas sigan funcionando sin tocar un solo string a mano.
const THEME_NAME_CACHE = {};
function themeName(themeId){
  if(themeId == null) return null;
  if(THEME_NAME_CACHE[themeId] !== undefined) return THEME_NAME_CACHE[themeId];
  // El nombre a mostrar se lee de la PRIMERA pregunta del banco que tenga
  // ese themeId: es "automático" en el sentido de que nunca hay que
  // escribirlo a mano en ningún lado, se deduce del contenido real.
  const q = QUESTION_BANK.find(q => q.themeId === themeId);
  const name = q ? q.topic : `Tema ${themeId}`;
  THEME_NAME_CACHE[themeId] = name;
  return name;
}
// Nombre a mostrar para una zona entera: junta los nombres reales de
// todos los themeIds que rotan en esa zona. Las zonas sin contenido de
// preguntas (ej: la Tienda) pueden definir "topicLabel" a mano en su
// lugar, ya que no tienen themeIds de los que derivar nada.
function worldTopicLabel(worldId){

    const assigned = WORLD_TOPIC_ASSIGNMENTS[worldId] || [];

    if(!assigned.length) return "";

    return [...new Set(
        assigned.map(t => t.topic)
    )].join(" · ");

}

function worldDisplayName(worldId){

    const theme = GAME_THEME.worlds[worldId];

    if(!theme) return worldId;

    const assigned = WORLD_TOPIC_ASSIGNMENTS[worldId] || [];

    const firstTopic =
        assigned.length
            ? assigned[0].topic
            : "";

    if(typeof theme.buildTitle === "function"){
        return theme.buildTitle(firstTopic, assigned);
    }

    return `${theme.icon} ${theme.prefix}`;

}
/* ===================== FIN TEMAS POR ID NUMÉRICO ===================== */

// ===================== NOMBRES DE ENEMIGOS POR TEMA =====================
// Igual que worldDisplayName() genera el nombre de una zona, acá se genera
// el nombre de un enemigo: nunca se escribe a mano en la definición del
// NPC (ver MAP.npcs y BOSS_DEFS, que ya no tienen "name"). Un enemigo con
// id fijo siempre muestra el mismo nombre (elegido por hash de su id, no
// al azar en cada render), combinado con el tema real de su zona de
// origen — igual que "Slime · Introducción" o "Autómata · Espacios
// Vectoriales" en el ejemplo.
const ENEMY_THEME = {
  forest: ['Lobo', 'Hongo', 'Araña'],
  sql:    ['Drone', 'Robot', 'Virus'],
  rel:    ['Soldado', 'Gólem', 'Centinela'],
  norm:   ['Ogro', 'Hechicero'],
  boss:   ['Espadachin', 'Paladín', 'Caballero']
};

const BOSS_NAMES = {
  forest: 'Slime',
  sql: 'Autómata',
  rel: 'Guardián',
  norm: 'Caballero Elite',
  boss: 'Dragon'
};

function enemyDisplayName(enemy){
  if(!enemy) return '';

  const worldId =
    enemy.originWorld ||
    enemy.world ||
    (Array.isArray(enemy.worlds) ? enemy.worlds[0] : null);

  const topic = worldId ? worldTopicLabel(worldId) : '';

  if(enemy.isBoss){
    const bossName = BOSS_NAMES[worldId] || 'Jefe';
    return topic ? `👑 ${bossName} · ${topic}` : `👑 ${bossName}`;
  }

  const names = (worldId && ENEMY_THEME[worldId]) || [];
  const baseName =
    names.length
      ? names[hashStr(String(enemy.id ?? '')) % names.length]
      : (enemy.id || 'Enemigo');

  return topic ? `${baseName} · ${topic}` : baseName;
}

// Versión corta del nombre, sin el tema (para la etiqueta flotante
// arriba del enemigo en el mapa; el tema completo se ve en el panel
// de encuentro/combate).
function enemyShortName(enemy){
  return enemyDisplayName(enemy).split(' · ')[0];
}

const CURRENT_SUBJECT_ID = (typeof SUBJECT_INFO !== 'undefined' && SUBJECT_INFO.id)
  || (window.__DBQUEST_CURRENT_SUBJECT__ && window.__DBQUEST_CURRENT_SUBJECT__.id)
  || 'default';
const STORAGE_KEY = 'dbquest_v3base_state_' + CURRENT_SUBJECT_ID;
function normalizeConceptTerm(s){
  return String(s || '').trim().replace(/[.:;]+$/,'');
}
// Detecta de qué término trata una pregunta (para buscarlo en CONCEPT_NOTES).
// No dispara en preguntas "¿Cuál NO pertenece...?": ahí la respuesta correcta
// es justamente el intruso, y mostrarle una nota de "term compartido" sobre
// el intruso confundiría más de lo que aclara.
function extractConceptTerm(q){
  if(!q || /NO pertenece/i.test(q.question || '')) return null;
  const meMatch = (q.question || '').match(/¿Qué describe mejor a (.+?)\?/);
  if(meMatch) return normalizeConceptTerm(meMatch[1]);
  if((q.type === 'choice' || !q.type) && typeof q.correct === 'number'){
    const opt = q.options && q.options[q.correct];
    if(opt && opt.length <= 40 && !/\.$/.test(opt)) return normalizeConceptTerm(opt);
  }
  if(q.type === 'input' && Array.isArray(q.correct) && q.correct.length){
    return normalizeConceptTerm(q.correct[0]);
  }
  return null;
}
function getConceptNote(q){
  const term = extractConceptTerm(q);
  if(!term) return null;
  if(CONCEPT_NOTES[term]) return CONCEPT_NOTES[term];
  // Fallback case-insensitive sin acentos, por si el término viene con
  // capitalización distinta a la de la clave (pero preservamos las claves
  // Join/JOIN y Selección/SELECT como entradas separadas a propósito).
  const norm = normalizeAnswer(term);
  const found = Object.keys(CONCEPT_NOTES).find(k => normalizeAnswer(k) === norm && (k === term || (k !== 'JOIN' && k !== 'SELECT' && term !== 'JOIN' && term !== 'SELECT')));
  return found ? CONCEPT_NOTES[found] : null;
}
function renderConceptNoteHTML(note, currentTopic){
  if(!note) return '';
  const items = note.meanings.map(m => `<div class="conceptNoteRow"><b>${escapeHtml(m.topic)}${m.topic === currentTopic ? ' (acá)' : ''}:</b> ${escapeHtml(m.text)}</div>`).join('');
  const related = note.relatedTerm ? `<div class="conceptNoteRow tiny">Ver también: <b>${escapeHtml(note.relatedTerm)}</b></div>` : '';
  return `<div class="conceptNote"><b>🔀 "${escapeHtml(note.label)}" se repite en más de un tema</b>${items}${related}<div class="conceptNoteTip">${escapeHtml(note.tip)}</div></div>`;
}
/* ===================== FIN NOTAS DE CONCEPTOS COMPARTIDOS ===================== */
const GAME_THEME = {

  worlds:{

    forest:{
      icon:"🌲",
      prefix:"Bosque",
      buildTitle:(topic)=>`🌲 Bosque`
    },

    sql:{
      icon:"💻",
      prefix:"Laboratorio",
      buildTitle:(topic)=>`💻 ${topic} Lab`
    },

    rel:{
      icon:"🏙",
      prefix:"Ciudad",
      buildTitle:(topic)=>`🏙 Ciudad`
    },

    norm:{
      icon:"🏰",
      prefix:"Fortaleza",
      buildTitle:(topic)=>`🏰 Fortaleza `
    },

    boss:{
      icon:"🐉",
      prefix:"Castillo",
      buildTitle:(topic)=>`🐉 Castillo `
    },

    shop:{
      icon:"🛒",
      prefix:"Mercado",
      buildTitle:()=>`🛒 Mercado`
    }

  }

};

const WORLD_DEFS = [
  // Los temas de cada zona (qué themeId rota en cada combate) ya no se
  // definen acá: salen únicamente de WORLD_TOPIC_ASSIGNMENTS (ver
  // nextAssignedThemeId()). Acá solo queda la info propia de la zona en
  // sí: color, nivel mínimo y rango de dificultad. El nombre que se
  // muestra en pantalla tampoco se escribe a mano: se deduce en
  // automático con worldDisplayName(worldId).
  { id:'forest', minLevel:1, color1:'#15203d', color2:'#090c18', diffRange:[1,2] },
  { id:'sql',    minLevel:4, color1:'#1a1330', color2:'#090814', diffRange:[1,3] },
  { id:'rel',    minLevel:8, color1:'#0f2a2a', color2:'#081012', diffRange:[2,4] },
  { id:'norm',   minLevel:12, color1:'#2a1a14', color2:'#120d09', diffRange:[3,5] },
  { id:'boss',   minLevel:16, color1:'#2b1440', color2:'#0b0816', diffRange:[3,5] },
  { id:'shop',   topicLabel:'Tienda', minLevel:1, color1:'#1b2032', color2:'#0c0f19', diffRange:[1,5] }
];

// Orden lineal de progresión del juego: el "mundo siguiente" de cualquier
// zona es simplemente el próximo id de esta lista (WORLD_ORDER[index+1]).
// 'shop' queda afuera a propósito: no es una etapa de progresión, es un
// destino aparte al que se puede volver desde cualquier zona.
// El día de mañana, para cambiar la cantidad o el orden de las zonas de
// otra materia, alcanza con editar esta lista — no hace falta tocar
// getVisiblePortals() ni ningún switch/case.
const WORLD_ORDER = ['forest', 'sql', 'rel', 'norm', 'boss'];

// Geometría del portal de salida de cada zona (posición en el mapa) y el
// jefe que hay que derrotar para poder cruzarlo. Esto SÍ depende del
// diseño de nivel de cada mapa individual (dónde está dibujada la puerta),
// así que no se puede derivar automáticamente de WORLD_ORDER: solo el
// "a qué mundo lleva" se calcula solo, la posición se sigue definiendo acá
// a mano, una vez por zona.
const WORLD_EXIT_PORTALS = {
  forest: { x:17, y:15, w:3, h:3, boss:'intro' },
  sql:    { x:29, y:15, w:3, h:3, boss:'sqlboss' },
  rel:    { x:20, y:24, w:3, h:3, boss:'relboss' },
  norm:   { x:43, y:24, w:3, h:3, boss:'normboss' }
  // 'boss' no tiene entrada acá: es la última zona, no tiene portal de salida.
};
const SHOP_PORTAL = { x:44, y:11, w:3, h:3 };
const WORLD_SPAWNS = {
  forest: { x:5, y:9 },
  sql: { x:18, y:8 },
  rel: { x:30, y:8 },
  norm: { x:12, y:20 },
  boss: { x:6, y:14 },
  shop: { x:44, y:11 }
};
const XP_MULTIPLIER = {
      forest: 1.8,
      sql: 6.8,
      rel: 8.7,
      norm: 10.7,
      boss: 15.6
  };

  const COIN_MULTIPLIER = {
      forest: 1.2,
      sql: 1.3,
      rel: 1.6,
      norm: 2.2,
      boss: 3.2
  };

const TIME_BY_DIFFICULTY = {
    1: 40,
    2: 34,
    3: 27,
    4: 20,
    5: 16
};

const BOSS_DEFS = [
  {
    id:'intro',
    world:'forest',
    npcId:'intro',
    nextWorld:'sql',
    unlock:s=>true
  },
  {
    id:'sql',
    world:'sql',
    npcId:'sqlboss',
    nextWorld:'rel',
    unlock:s=>s.bossesDefeated.includes('intro')
  },
  {
    id:'rel',
    world:'rel',
    npcId:'relboss',
    nextWorld:'norm',
    unlock:s=>s.bossesDefeated.includes('sql')
  },
  {
    id:'alg',
    world:'rel',
    npcId:'algboss',
    nextWorld:'norm',
    unlock:s=>s.bossesDefeated.includes('rel')
  },
  {
    id:'norm',
    world:'norm',
    npcId:'normboss',
    nextWorld:'boss',
    unlock:s=>s.bossesDefeated.includes('alg')
  },
  {
    id:'final',
    world:'boss',
    npcId:'dragon',
    nextWorld:null,
    unlock:s=>s.bossesDefeated.includes('norm')
  }
];

const SHOP_ITEMS = [
  { id:'potion', name:'Poción', emoji:'🧪', price:8, desc:'Recupera 1 vida en combate.' },
  { id:'hint', name:'Pista', emoji:'💡', price:6, desc:'Elimina una opción incorrecta.' },
  { id:'shield', name:'Escudo', emoji:'🛡️', price:10, desc:'Bloquea el próximo error.' },
  { id:'reroll', name:'Cambio', emoji:'🔁', price:7, desc:'Salta la pregunta actual.' },
  { id:'elixir', name:'Elixir', emoji:'✨', price:15, desc:'Da XP extra al usarlo.' },
  { id:'megapotion', name:'Poción Mayor', emoji:'🧴', price:16, desc:'Cura toda tu vida en combate.' },
  { id:'luckycoin', name:'Moneda Dorada', emoji:'🪙', price:12, desc:'Duplica las monedas de tu próxima victoria.' },
  { id:'timeextend', name:'Arena del Tiempo', emoji:'⏳', price:9, desc:'Suma 10s al reloj de la pregunta actual.' }
];

const EQUIPMENT_ITEMS = [
  { id:'sword_iron', slot:'weapon', name:'Espada de Hierro', emoji:'⚔️', price:25, desc:'+10% XP ganada en combate.', bonus:{ xpMult:0.10 } },
  { id:'sword_query', slot:'weapon', name:'Espada Query', emoji:'🗡️', price:65, desc:'+20% XP ganada en combate.', bonus:{ xpMult:0.20 } },
  { id:'armor_leather', slot:'armor', name:'Armadura de Cuero', emoji:'🥋', price:30, desc:'+1 vida máxima en combate.', bonus:{ hpBonus:1 } },
  { id:'armor_plate', slot:'armor', name:'Armadura de Placas', emoji:'🛡️', price:75, desc:'+2 vidas máximas en combate.', bonus:{ hpBonus:2 } },
  { id:'amulet_luck', slot:'accessory', name:'Amuleto de la Suerte', emoji:'🍀', price:35, desc:'+20% monedas ganadas en combate.', bonus:{ coinMult:0.20 } },
  { id:'amulet_time', slot:'accessory', name:'Reloj Arcano', emoji:'⏱️', price:40, desc:'+5s de tiempo en cada pregunta.', bonus:{ timeBonus:5 } },
  // 👇 NUEVO ÍTEM AGREGADO 👇
  { id:'boots_speed', slot:'boots', shopEquip:false, name:'Botas Velocista', emoji:'⚡', price:150, minLevel: 16, desc:'Aumenta la velocidad de desplazamiento un 25%. (Req. Nivel 16)', bonus:{ speedMult:0.25 } }
];
const EQUIPMENT_SLOTS = ['weapon','armor','accessory','boots'];
const CORE_EQUIPMENT_SLOTS = ['weapon','armor','accessory'];

const SPECIAL_ITEM_DEFS = {
  dragon_scale: { name:'Escama de Dragón', emoji:'🐲', desc:'Recuerdo de haber vencido al Dragón Final. Trofeo de honor.' },
  monk_seal: { name:'Sello del Monje 3FN', emoji:'📜', desc:'Otorgado al dominar la normalización.' },
  relic_key: { name:'Llave Relacional', emoji:'🗝️', desc:'Reliquia del Caballero Relacional.' }
};

const ACHIEVEMENT_DEFS = [
  { id:'first_answer', name:'Primer paso', desc:'Responder 1 pregunta.', check: s => s.answered >= 1, reward:{ xp:5, coins:1 } },
  { id:'ten_correct', name:'Diez correctas', desc:'Llegar a 10 respuestas correctas.', check: s => s.correct >= 10, reward:{ xp:10, coins:3 } },
  { id:'study_25', name:'Constancia', desc:'Responder 25 preguntas.', check: s => s.answered >= 25, reward:{ xp:12, coins:4 } },
  { id:'first_battle', name:'Primer combate', desc:'Ganar un combate.', check: s => s.battleWins >= 1, reward:{ xp:12, coins:4 } },
  { id:'first_boss', name:'Primer jefe', desc:'Derrotar un jefe.', check: s => s.bossesDefeated.length >= 1, reward:{ xp:15, coins:5 } },
  { id:'three_bosses', name:'Cazajefes', desc:'Derrotar 3 jefes.', check: s => s.bossesDefeated.length >= 3, reward:{ xp:20, coins:8 } },
  { id:'shopper', name:'Comprador', desc:'Gastar 20 monedas.', check: s => s.coinsSpent >= 20, reward:{ xp:8, coins:2 } },
  { id:'coin_hoard', name:'Ahorrista', desc:'Llegar a 50 monedas.', check: s => s.hero.coins >= 50, reward:{ xp:10, coins:5 } },
  { id:'equipped', name:'Bien equipado', desc:'Equipar tu primer objeto.', check: s => EQUIPMENT_SLOTS.some(slot => s.equipment && s.equipment[slot]), reward:{ xp:8, coins:3 } },
  { id:'full_gear', name:'Armado hasta los dientes', desc:'Equipar las 3 ranuras de equipamiento.', check: s => s.equipment && CORE_EQUIPMENT_SLOTS.every(slot => s.equipment[slot]), reward:{ xp:18, coins:8 } }
];


const stateDefaults = {
  answered:0, correct:0, wrong:0, points:0,
  bestExam:0, bookmarks:[], wrongIds:[], seenIds:[], statsByTopic:{},
  zoneTopicRotation:{},
  theme:'dark', sound:'on', lastExam:null, examHistory:[], reviews:{},
  resetWipesInventory:false,
  hero:{ name:null, level:1, xp:0, coins:0, maxCoins:0 },
  inventory:{ potion:1, hint:2, shield:1, reroll:0, elixir:0, megapotion:0, luckycoin:0, timeextend:0 },
  equipment:{ weapon:null, armor:null, accessory:null, boots:null },
  specialItems:[],
  luckyCoinActive:false,
  achievements:{},
  bossesDefeated:[],
  defeatedNpcs: [],
  defeatedGuestNpcs: [],
  battleWins:0,
  battleLosses:0,
  coinsSpent:0,
  battle:{
    active:false,
    bossId:null,
    bossName:'',
    bossThemeId:null,
    bossTopic:'',
    bossHp:0,
    bossMaxHp:0,
    playerHp:3,
    playerMaxHp:3,
    deck:[],
    index:0,
    question:null,
    streak:0,
    hiddenWrongIndex:null,
    shield:false,
    mode:'idle',
    timeLeft:0,
    timeMax:0,
    timer:null
  },
  game:{ world:'forest', x:120, y:120, scene:'map', log:[], visited:['forest'] },
  leaderboard:[],
  questionHistory:{},
  // Nuevo sistema de "frescura": en vez de excluir preguntas ya vistas
  // hasta agotar todo el pool (binario), cada pregunta guarda en qué
  // número de combate se contestó por última vez. Cuanto más reciente,
  // menos probable que reaparezca en el próximo combate — y esa
  // probabilidad se va recuperando de a poco con cada combate que pasa.
  // Ver questionFreshness() / weightedShuffle().
  questionLastSeenBattle:{},
  battleCounter:0,
  // Mismo mecanismo que questionLastSeenBattle/battleCounter, pero para
  // Exámenes: cada pregunta guarda en qué número de EXAMEN se contestó
  // por última vez, sin importar qué temas se eligieron en ese examen ni
  // en el siguiente (el contador es global). Ver questionFreshnessExam().
  questionLastSeenExam:{},
  examCounter:0,
  // Teclas remapeables desde Ajustes → Controles (ver renderControlsList()).
  // Las flechas y Escape quedan fijas aparte de esto, no entran acá.
  controls: { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' },
  // Ajustes → Interfaz: escala del canvas del juego y del minimapa
  // dibujado dentro de él, cada uno independiente (ver resizeCanvas()
  // y el bloque de miniW/miniH en drawGameScene()).
  canvasScale: 1,
  minimapScale: 1,
  joystickEnabled: false,
  enemySeed:0
};

const CONTROL_LABELS = { up:'Arriba', down:'Abajo', left:'Izquierda', right:'Derecha', interact:'Interactuar', map:'Mapa', inventory:'Inventario', shop:'Tienda' };

// Se calcula ANTES de loadState() porque loadState() solo lee (nunca
// escribe) el localStorage: en este punto, si no había nada guardado
// todavía, es 100% la primera vez que se abre el juego en este navegador
// (instalación nueva). Lo usamos para decidir si forzamos la pantalla de
// "elegir nombre del héroe" al arrancar, o si el héroe ya existía antes
// de que este feature existiera (en cuyo caso no lo forzamos: se puede
// poner nombre cuando quiera desde Ajustes).
const isBrandNewSave = !localStorage.getItem(STORAGE_KEY);
// Marca transitoria (no vive dentro del state) para forzar que vuelva a
// aparecer la pantalla de nombre tras un "Reset progreso" con la opción
// de borrar también inventario/equipamiento/trofeos tildada: en ese caso
// el nombre del héroe se borra igual que el resto, así que al recargar
// hay que volver a pedirlo como si fuera la primera vez.
const FORCE_HERO_NAME_KEY = STORAGE_KEY + '__forceHeroName';
const forceHeroNamePrompt = isBrandNewSave || localStorage.getItem(FORCE_HERO_NAME_KEY) === '1';
let state = loadState();
// Puente entre la interfaz de controles (creada antes de cargar la materia)
// y el estado del juego (creado dentro de __DBQUEST_START__).
window.__DBQUEST_CONTROLS_API__ = {
  get(){
    state.controls = Object.assign(
      { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' },
      state.controls || {}
    );
    return state.controls;
  },
  set(action, key){
    this.get()[action] = key;
    saveState();
  },
  reset(){
    state.controls = { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' };
    saveState();
  }
};
// Mismo puente que arriba, pero para Ajustes → Interfaz (escala del
// canvas y del minimapa): la UI de los chips vive afuera de
// __DBQUEST_START__ y no puede tocar `state`/resizeCanvas/drawGameScene
// directamente (son locales de acá adentro), así que pasa por esto.
window.__DBQUEST_INTERFACE_API__ = {
  get(){
    return { canvasScale: state.canvasScale || 1, minimapScale: state.minimapScale || 1 };
  },
  setCanvasScale(v){
    state.canvasScale = v;
    resizeCanvas();
    drawGameScene();
    saveState();
  },
  setMinimapScale(v){
    state.minimapScale = v;
    drawGameScene();
    saveState();
  }
};
let els = {};
let currentTopic = 'Todos';
let currentView = 'all';
let studyIndex = 0;
let studyAnswered = false;
// Selección en curso para preguntas de estudio de tipo multi-respuesta.
// Se resetea cuando cambia la pregunta (ver studySelectedMultiQid).
let studySelectedMulti = new Set();
let studySelectedMultiQid = null;
let exam = null;
let examTimer = null;
let gameTimer = null;
let audioCtx = null;
let musicTimer = null;
let gamePaused = false;
let keys = { left:false, right:false, up:false, down:false };
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));

function clone(o){ return JSON.parse(JSON.stringify(o)); }
// Mismo criterio que detectTouchControls() más abajo (pantalla chica +
// soporte táctil), pero como función reutilizable: se necesita ACÁ
// también, antes de que exista el state, para decidir el tamaño por
// defecto del canvas/minimapa la primera vez que se abre el juego en un
// celular (ver loadState()).
let joystickPointerId = null;
let joystickMoveX = 0;
let joystickMoveY = 0;
const JOYSTICK_MAX_RADIUS = 50;

function updateJoystickUI(){
  const toggle = document.getElementById('btnJoystickToggle');
  const joystick = document.getElementById('virtualJoystick');
  if(!toggle || !joystick) return;
  // Antes acá se volvía a chequear isLikelyMobileDevice() y el botón
  // podía quedar trabado en "Desactivado" para siempre si esa detección
  // no coincidía con el emulador/dispositivo real (aunque el click sí
  // hubiera cambiado state.joystickEnabled por dentro). Si el usuario ya
  // activó el toggle a propósito, confiamos en eso directamente.
  const enabled = !!state?.joystickEnabled;
  toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  toggle.textContent = enabled ? '🎮 Joystick: Activado' : '🎮 Joystick: Desactivado';
  joystick.classList.toggle('visible', enabled && document.getElementById('game')?.classList.contains('active'));
  joystick.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  if(!enabled) resetVirtualJoystick();
}

function resetVirtualJoystick(){
  joystickPointerId = null;
  joystickMoveX = 0;
  joystickMoveY = 0;
  const knob = document.getElementById('virtualJoystickKnob');
  if(knob){ knob.style.left='50%'; knob.style.top='50%'; }
}

function setJoystickEnabled(enabled){
  state.joystickEnabled = !!enabled;
  resetVirtualJoystick();
  updateJoystickUI();
  saveState();
}

function isLikelyMobileDevice(){
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const uaDataMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
  const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  const coarsePointer = !!window.matchMedia?.('(pointer: coarse)').matches;
  const noHover = !!window.matchMedia?.('(hover: none)').matches;
  // Tablets pueden usar un viewport > 960px, especialmente en horizontal
  // o con iPadOS en modo de agente de escritorio. Touch + coarse/no-hover
  // identifica el dispositivo táctil sin depender del ancho de la ventana.
  const touchDevice = touch && (coarsePointer || noHover);
  const ipadDesktopUA = /Macintosh/i.test(ua) && touch;
  return !!(uaDataMobile || mobileUA || touchDevice || ipadDesktopUA);
}
function syncMobileDetection(){
  const mobile = isLikelyMobileDevice();
  document.body.classList.toggle('mobileDetected', mobile);
  const row = document.getElementById('joystickSettingRow');
  if(row) row.hidden = !mobile;
  const divider = document.getElementById('joystickSettingDivider');
  if(divider) divider.hidden = !mobile;
  updateJoystickUI();
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      // Instalación nueva: en celular arranca con el canvas más grande
      // (×1.75) y el minimapa más chico (×0.75), que se ve mejor en
      // pantallas angostas. En escritorio, ×1 normal como siempre. El
      // jugador puede cambiarlo cuando quiera desde Ajustes → Interfaz.
      const fresh = clone(stateDefaults);
      if(isLikelyMobileDevice()){ fresh.canvasScale = 1.75; fresh.minimapScale = 0.75; }
      return fresh;
    }
    const parsed = JSON.parse(raw);
    const merged = Object.assign(clone(stateDefaults), parsed);
    merged.hero = Object.assign(clone(stateDefaults.hero), parsed.hero || {});
    merged.inventory = Object.assign(clone(stateDefaults.inventory), parsed.inventory || {});
    merged.equipment = Object.assign(clone(stateDefaults.equipment), parsed.equipment || {});
    merged.specialItems = parsed.specialItems || [];
    merged.achievements = parsed.achievements || {};
    merged.battle = Object.assign(clone(stateDefaults.battle), parsed.battle || {});
    merged.game = Object.assign(clone(stateDefaults.game), parsed.game || {});
    merged.statsByTopic = parsed.statsByTopic || {};
    merged.zoneTopicRotation = parsed.zoneTopicRotation || {};
    merged.reviews = parsed.reviews || {};
    merged.bookmarks = parsed.bookmarks || [];
    merged.wrongIds = parsed.wrongIds || [];
    merged.seenIds = parsed.seenIds || [];
    merged.bossesDefeated = parsed.bossesDefeated || [];
    merged.defeatedNpcs = parsed.defeatedNpcs || [];
    merged.defeatedGuestNpcs = parsed.defeatedGuestNpcs || [];
    merged.battleWins = parsed.battleWins || 0;
    merged.battleLosses = parsed.battleLosses || 0;
    merged.coinsSpent = parsed.coinsSpent || 0;
    merged.leaderboard = parsed.leaderboard || [];
    merged.questionHistory = parsed.questionHistory || {};
    merged.questionLastSeenBattle = parsed.questionLastSeenBattle || {};
    merged.battleCounter = parsed.battleCounter || 0;
    merged.questionLastSeenExam = parsed.questionLastSeenExam || {};
    merged.examCounter = parsed.examCounter || 0;
    // Los guardados creados antes de los controles remapeables no poseen
    // `controls`; se completan automáticamente sin modificar QUESTION_BANK.
    merged.controls = Object.assign(
      { up:'w', down:'s', left:'a', right:'d', interact:'e', map:'m', inventory:'i', shop:'b' },
      parsed.controls || {}
    );
    merged.canvasScale = parsed.canvasScale != null ? parsed.canvasScale : (isLikelyMobileDevice() ? 1.75 : 1);
    merged.minimapScale = parsed.minimapScale != null ? parsed.minimapScale : (isLikelyMobileDevice() ? 0.75 : 1);
    merged.joystickEnabled = !!parsed.joystickEnabled;
    merged.luckyCoinActive = !!parsed.luckyCoinActive;
    merged.enemySeed = parsed.enemySeed || 0;
    merged.ownedEquipment = parsed.ownedEquipment || [];
    return merged;
  } catch {
    const fresh = clone(stateDefaults);
    if(isLikelyMobileDevice()){ fresh.canvasScale = 1.75; fresh.minimapScale = 0.75; }
    return fresh;
  }
}
function escapeHtml(str){
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function now(){ return Date.now(); }

/* =========================================================
   BIBLIOTECA SVG — ahora es EXTERNA y específica de materia
   -----------------------------------------------------------
   El motor (este HTML) ya no dibuja diagramas él mismo: sólo
   conoce la función global buildDiagramSVG(spec), que debe
   venir cargada desde el archivo "*diagrams.js" que declare la
   materia activa en BUILTINS (ver bootstrap al principio del
   <body>, junto a "diagrams: '...'"). Así, cambiar de materia
   cambia tanto las preguntas (QUESTION_BANK) como la forma en
   que se dibujan sus diagramas, sin tocar este archivo.

   Si la materia activa no declaró un archivo de diagramas (o
   no lo necesita porque no tiene preguntas tipo "diagram" /
   "diagram-click"), se usa este stub de emergencia para que
   buildDiagramSVG nunca quede indefinida.
   ========================================================= */
if (typeof buildDiagramSVG !== 'function') {
  window.buildDiagramSVG = function(){
    return '<p>Esta materia no tiene una biblioteca de diagramas cargada.</p>';
  };
}
/* ===================== FIN Biblioteca SVG ===================== */
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function dist(ax,ay,bx,by){ return Math.hypot(ax-bx, ay-by); }

// ===================== RESPUESTAS (choice + input) =====================
function normalizeAnswer(s){
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .trim()
    .replace(/\s+/g,' ')
    .replace(/[.;]+$/,'');
}
// ===================== SOPORTE MULTI-RESPUESTA (choice) =====================
// Una pregunta "choice" pasa a ser de selección múltiple cuando q.correct
// es un array de índices (en vez de un solo número) — mismo formato que ya
// usan 'input' (array de strings válidas) y 'diagram-click' (array de ids
// válidos). Los bancos de preguntas viejos, donde q.correct siempre es un
// número, siguen funcionando exactamente igual que antes: no hace falta
// tocarlos ni marcarlos de ninguna forma especial.
function isMultiChoice(q){
  return q.type === 'choice' && Array.isArray(q.correct);
}
function sameIndexSet(a, b){
  if(!Array.isArray(a) || !Array.isArray(b)) return false;
  if(a.length !== b.length) return false;
  const sa = [...a].map(Number).sort((x,y)=>x-y);
  const sb = [...b].map(Number).sort((x,y)=>x-y);
  return sa.every((v,i) => v === sb[i]);
}
function isAnswerCorrect(q, userAnswer){
  if(q.type === 'input'){
    if(userAnswer === null || userAnswer === undefined) return false;
    const norm = normalizeAnswer(userAnswer);
    if(!norm) return false;
    return (q.correct || []).some(c => normalizeAnswer(c) === norm);
  }
  // Preguntas "diagram-click" donde más de un elemento del SVG es válido
  // (ej: cualquiera de tres columnas repetidas rompe la 1FN por igual).
  if(q.type === 'diagram-click' && Array.isArray(q.correct)){
    return q.correct.includes(userAnswer);
  }
  // Preguntas "choice" de selección múltiple: hay que haber marcado
  // exactamente el conjunto de índices correctos, ni de más ni de menos.
  if(isMultiChoice(q)){
    return sameIndexSet(userAnswer, q.correct);
  }
  return userAnswer === q.correct;
}
// Busca, dentro del "spec" de q.diagram, el elemento cuyo clickId coincide
// con targetId y devuelve su nombre legible (el mismo texto que se ve
// dibujado dentro del SVG). Cubre las 5 formas de spec que arma
// buildDiagramSVG: entity/attribute/relationship (un solo elemento),
// erdiagram (arrays de entities/relationships/attributes) y
// table/tablediagram (columns, sueltas o dentro de tables[]).
function diagramLabelForClick(spec, targetId){
  if(!spec || targetId == null) return null;
  const data = spec.data || {};
  const target = String(targetId);
  const sameId = id => id != null && String(id) === target;
  if(sameId(data.clickId)) return data.name || null;
  const pools = [
    ...(data.entities || []),
    ...(data.relationships || []),
    ...(data.attributes || []),
    ...(data.columns || [])
  ];
  for(const item of pools){
    if(sameId(item.clickId)) return item.name || null;
  }
  for(const table of (data.tables || [])){
    for(const col of (table.columns || [])){
      if(sameId(col.clickId)) return col.name ? `${table.name || ''} · ${col.name}`.replace(/^ · /,'') : null;
    }
  }
  return null;
}
function correctAnswerText(q){
  if(q.type === 'input') return (q.correct && q.correct[0]) || '';
  if(q.type === 'diagram-click'){
    const targetId = Array.isArray(q.correct) ? q.correct[0] : q.correct;
    return diagramLabelForClick(q.diagram, targetId) || String(targetId ?? '');
  }
  if(isMultiChoice(q)){
    return q.correct.map(i => q.options[i]).join(' / ');
  }
  return q.options[q.correct];
}
// Igual que correctAnswerText(), pero para la respuesta que efectivamente
// dio el usuario. Se usa para guardar el detalle de cada examen en el
// historial (pregunta, respuesta dada, respuesta correcta).
function givenAnswerText(q, userAnswer){
  if(userAnswer === null || userAnswer === undefined || userAnswer === ''){
    return '';
  }
  if(q.type === 'input') return String(userAnswer);
  if(q.type === 'diagram-click'){
    return diagramLabelForClick(q.diagram, userAnswer) || String(userAnswer);
  }
  if(isMultiChoice(q)){
    if(!Array.isArray(userAnswer) || !userAnswer.length) return '';
    return userAnswer.map(i => q.options[i] !== undefined ? q.options[i] : String(i)).join(' / ');
  }
  return q.options[userAnswer] !== undefined ? q.options[userAnswer] : String(userAnswer);
}
function go(id){
  const previousActive = document.querySelector('.section.active')?.id;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(id);
  sec.classList.add('active');
  sec.classList.add('fadeMsg');
  setTimeout(() => sec.classList.remove('fadeMsg'), 220);
  document.querySelectorAll('[data-nav]').forEach(btn => btn.classList.toggle('active', btn.dataset.nav === id));
  // El botón flotante de Gemini solo tiene sentido en Inicio: en el
  // resto de las pantallas (juego, estudio, examen, etc.) taparía
  // contenido o controles propios de esa sección.
  const btnGemini = document.getElementById('btnGemini');
  if(btnGemini) btnGemini.style.display = (id === 'home') ? 'flex' : 'none';
  updateJoystickUI();
  if(id !== 'game' && els.encounterPanel) hideEncounterPrompt();
  if(previousActive === 'game' && id !== 'game'){ saveState(); closeGameHudDrawer(); }
  if(['game','battle','shop','inventory','achievements'].includes(id)){
    if(id === 'game') initGameScene();
    if(id === 'battle') renderBattle();
    if(id === 'shop') renderShop();
    if(id === 'inventory') renderInventory();
    if(id === 'achievements') renderAchievements();
    startMusic(id === 'battle' ? 'battle' : 'zone');
  } else {
    stopMusic();
  }
  // La pantalla de elegir nombre del héroe solo se muestra al entrar a
  // Juego (no al abrir la app ni en cualquier otra sección), y solo si
  // todavía no tiene nombre y corresponde pedirlo (ver forceHeroNamePrompt).
  if(id === 'game' && forceHeroNamePrompt && !state.hero.name) openHeroNameModal(true);

  // Traducción automática de la pantalla nueva (ver más abajo en el
  // archivo). Solo dispara si el usuario ya usó "Traducir esta pantalla"
  // al menos una vez (pageTranslateEnabled) y dejó la casilla "Auto al
  // cambiar de pantalla" tildada — así una partida normal, sin usar la
  // traducción, no paga ningún costo extra acá.
  if(pageTranslateEnabled && document.getElementById('pageTranslateAuto')?.checked){
    translateSectionNow(sec, pageTranslateLang).catch(err => console.error('Error traduciendo pantalla nueva:', err));
  }
}
window.go = go; // los 3 botones del hero usan onclick="go(...)" inline y necesitan que sea global
function randomTopic(){ return TOPICS[Math.floor(Math.random()*TOPICS.length)]; }

// Examen ya dibuja SVGs igual que Estudio y Combate (ver renderExam /
// #examDiagramContainer), así que no hace falta filtrar ningún tipo del
// pool. Se deja la lista vacía por si en el futuro aparece un tipo que
// el motor de examen todavía no sepa renderizar.
const EXAM_UNSUPPORTED_TYPES = [];

function getFilteredStudyQuestions(){
  let list = QUESTION_BANK.slice();
  if(currentTopic !== 'Todos') list = list.filter(q => q.topic === currentTopic);
  if(currentView === 'favorites') list = list.filter(q => state.bookmarks.includes(q.id));
  if(currentView === 'wrong') list = list.filter(q => state.wrongIds.includes(q.id));
  if(currentView === 'due') list = list.filter(q => (state.reviews[q.id] || 0) <= now());
  const term = (els.searchBox.value || '').trim().toLowerCase();
  if(term) list = list.filter(q => `${q.topic} ${q.question} ${q.options.join(' ')} ${q.explanation}`.toLowerCase().includes(term));
  return list;
}
function nextReviewDelay(ok){ return ok ? 1000*60*60*24*2 : 1000*60*20; }
function scheduleReview(qid, ok){ state.reviews[qid] = now() + nextReviewDelay(ok); }

function trackAnswer(q, ok){
  state.answered += 1;
  if(ok){
    state.correct += 1;
    state.points += 10 + q.difficulty * 2;
  } else {
    state.wrong += 1;
    if(!state.wrongIds.includes(q.id)) state.wrongIds.push(q.id);
    state.points = Math.max(0, state.points - 1);
  }
  if(!state.seenIds.includes(q.id)) state.seenIds.push(q.id);
  state.statsByTopic[q.topic] = state.statsByTopic[q.topic] || { answered:0, correct:0, wrong:0 };
  state.statsByTopic[q.topic].answered += 1;
  state.statsByTopic[q.topic][ok ? 'correct' : 'wrong'] += 1;
  scheduleReview(q.id, ok);
  updateAchievements();
}

function renderTopicChips(){
  els.topicChips.innerHTML = ['Todos', ...TOPICS].map(t => `
    <button class="chip ${t===currentTopic ? 'active' : ''}" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>
  `).join('');
  els.topicChips.querySelectorAll('[data-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTopic = btn.dataset.topic;
      studyIndex = 0;
      studyAnswered = false;
      renderTopicChips();
      renderStudy();
      renderBank();
      renderExamTopicSelect();
    });
  });
}
function renderFilters(){
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      studyIndex = 0;
      studyAnswered = false;
      document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === currentView));
      renderStudy();
      renderBank();
    });
  });
}
let examSelectedTopics = new Set(); // vacío = Todos
// Mismo patrón que examSelectedTopics, pero por dificultad (1 a 5, igual
// que q.difficulty en el banco de preguntas). Las 5 etiquetas son fijas,
// no dependen de la materia, así que a diferencia de renderExamTopicSelect()
// esta no necesita recalcularse cuando cambian los temas.
let examSelectedDifficulties = new Set(); // vacío = Todas
const EXAM_DIFFICULTY_LABELS = { 1:'Baja', 2:'Media-baja', 3:'Media', 4:'Media-alta', 5:'Alta' };
function renderExamDifficultySelect(){
  const container = document.getElementById('examDifficultyChips');
  if(!container) return;
  const allActive = examSelectedDifficulties.size === 0;
  container.innerHTML = [
    `<button type="button" class="chip ${allActive ? 'active' : ''}" data-exam-difficulty="__all__">Todas</button>`,
    ...[1,2,3,4,5].map(d => `<button type="button" class="chip ${examSelectedDifficulties.has(d) ? 'active' : ''}" data-exam-difficulty="${d}">${EXAM_DIFFICULTY_LABELS[d]}</button>`)
  ].join('');
}
function renderExamTopicSelect(){
  const container = document.getElementById('examTopicChips');
  if(!container) return;
  // Si quedó seleccionado un tema que ya no existe (p.ej. cambió la materia), lo sacamos.
  [...examSelectedTopics].forEach(t => { if(!TOPICS.includes(t)) examSelectedTopics.delete(t); });
  const allActive = examSelectedTopics.size === 0;
  container.innerHTML = [
    `<button type="button" class="chip ${allActive ? 'active' : ''}" data-exam-topic="__all__">Todos</button>`,
    ...TOPICS.map(t => `<button type="button" class="chip ${examSelectedTopics.has(t) ? 'active' : ''}" data-exam-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
  ].join('');
}
function renderStudy(){
  const list = getFilteredStudyQuestions();
  const studyDiagramEl = document.getElementById('studyDiagramContainer');
  if(!list.length){
    els.questionMeta.textContent = '0/0';
    els.studyQuestion.textContent = 'No hay preguntas para este filtro.';
    els.studyOptions.innerHTML = '';
    renderLatex(els.studyOptions);
    els.studyFeedback.textContent = 'Probá otro tema, búsqueda o vista.';
    els.btnFavorite.textContent = '☆ Favorita';
    if(studyDiagramEl){ studyDiagramEl.style.display = 'none'; studyDiagramEl.innerHTML = ''; }
    return;
  }
  const q = list[studyIndex % list.length];
  const due = state.reviews[q.id] || 0;
  const dueText = due && due <= now() ? ' · Repasar ahora' : '';
  els.questionMeta.textContent = `${studyIndex+1}/${list.length} · #${q.id} · ${q.topic} · ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}${dueText}`;
  els.studyQuestion.innerHTML = `<span class="tag">${escapeHtml(q.topic)}</span> ${q.type==='input' ? '<span class="tag">✏️ Respuesta escrita</span>' : (isMultiChoice(q) ? '<span class="tag">🔲 Selección múltiple</span>' : '')} <b>${escapeHtml(q.question)}</b>`;
  renderLatex(els.studyQuestion);
  els.btnFavorite.textContent = state.bookmarks.includes(q.id) ? '★ Favorita' : '☆ Favorita';
  if(!studyAnswered) els.studyFeedback.textContent = q.type==='input' ? 'Escribí tu respuesta y confirmá.' : (isMultiChoice(q) ? 'Marcá todas las opciones correctas y confirmá.' : 'Elegí una respuesta para ver la explicación.');

  // Preguntas "diagram" y "diagram-click" traen q.diagram: lo dibujamos acá
  // arriba de las opciones, igual que en Combate.
  if(studyDiagramEl){
    if(q.diagram){
      studyDiagramEl.style.display = 'block';
      studyDiagramEl.innerHTML = buildDiagramSVG(q.diagram);
    } else {
      studyDiagramEl.style.display = 'none';
      studyDiagramEl.innerHTML = '';
    }
  }

  if(q.type === 'input'){
    els.studyOptions.innerHTML = `
      <input type="text" class="studyInput" id="studyTextInput" placeholder="Escribí tu respuesta..." autocomplete="off" />
      <button class="btn" id="studyTextSubmit" style="margin-top:8px">Responder</button>
    `;
    const submit = () => {
      if(studyAnswered) return;
      studyAnswered = true;
      const input = document.getElementById('studyTextInput');
      const val = input ? input.value : '';
      if(input) input.disabled = true;
      document.getElementById('studyTextSubmit').disabled = true;
      const ok = isAnswerCorrect(q, val);
      trackAnswer(q, ok);
      els.studyFeedback.innerHTML = (ok
        ? `<span class="good">Correcto.</span> ${escapeHtml(q.explanation)}`
        : `<span class="bad">Incorrecto.</span> Respuesta esperada: <b>${escapeHtml(correctAnswerText(q))}</b>. ${escapeHtml(q.explanation)}`)
        + renderConceptNoteHTML(getConceptNote(q), q.topic);
      renderLatex(els.studyFeedback);
      saveState();
      refreshStats();
      renderStudy();
    };
    document.getElementById('studyTextSubmit').addEventListener('click', submit);
    const inputEl = document.getElementById('studyTextInput');
    inputEl.addEventListener('keydown', e => { if(e.key === 'Enter') submit(); });
    if(!studyAnswered) setTimeout(() => inputEl.focus(), 0);
    return;
  }

  if(q.type === 'diagram-click'){
    els.studyOptions.innerHTML = `<p class="tag">👆 Tocá el elemento correcto en el diagrama de arriba.</p>`;
    if(studyDiagramEl){
      studyDiagramEl.addEventListener('click', function handler(e){
        if(studyAnswered) return;
        const target = e.target.closest('[data-click-answer]');
        if(!target) return;
        studyAnswered = true;
        const chosen = target.dataset.clickAnswer;
        const ok = isAnswerCorrect(q, chosen);
        const corrects = Array.isArray(q.correct) ? q.correct : [q.correct];
        studyDiagramEl.querySelectorAll('[data-click-answer]').forEach(el => {
          const val = el.dataset.clickAnswer;
          if(corrects.includes(val)) el.classList.add('diagram-correct');
          if(val === chosen && !ok) el.classList.add('diagram-wrong');
        });
        trackAnswer(q, ok);
        els.studyFeedback.innerHTML = (ok ? `<span class="good">Correcto.</span> ${escapeHtml(q.explanation)}` : `<span class="bad">Incorrecto.</span> ${escapeHtml(q.explanation)}`) + renderConceptNoteHTML(getConceptNote(q), q.topic);
        renderLatex(els.studyFeedback);
        saveState();
        refreshStats();
        renderStudy();
      });
    }
    return;
  }

  if(isMultiChoice(q)){
    if(studySelectedMultiQid !== q.id){
      studySelectedMulti = new Set();
      studySelectedMultiQid = q.id;
    }
    els.studyOptions.innerHTML = q.options.map((opt,i)=>`<button class="opt multi ${studySelectedMulti.has(i)?'selected':''}" data-idx="${i}" ${studyAnswered?'disabled':''}>${escapeHtml(opt)}</button>`).join('')
      + `<button class="btn" id="studyMultiSubmit" style="margin-top:8px" ${studyAnswered?'disabled':''}>Confirmar respuesta</button>`;
    renderLatex(els.studyOptions);
    if(!studyAnswered){
      els.studyOptions.querySelectorAll('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if(studyAnswered) return;
          const i = Number(btn.dataset.idx);
          if(studySelectedMulti.has(i)) studySelectedMulti.delete(i); else studySelectedMulti.add(i);
          btn.classList.toggle('selected');
        });
      });
      document.getElementById('studyMultiSubmit')?.addEventListener('click', () => {
        if(studyAnswered) return;
        if(!studySelectedMulti.size){
          els.studyFeedback.textContent = 'Elegí al menos una opción antes de confirmar.';
          return;
        }
        studyAnswered = true;
        const chosen = [...studySelectedMulti];
        const all = [...els.studyOptions.querySelectorAll('.opt')];
        all.forEach((b,i) => {
          if(q.correct.includes(i)) b.classList.add('correct');
          if(chosen.includes(i) && !q.correct.includes(i)) b.classList.add('wrong');
          b.disabled = true;
        });
        const submitBtn = document.getElementById('studyMultiSubmit');
        if(submitBtn) submitBtn.disabled = true;
        const ok = isAnswerCorrect(q, chosen);
        trackAnswer(q, ok);
        els.studyFeedback.innerHTML = (ok ? `<span class="good">Correcto.</span> ${escapeHtml(q.explanation)}` : `<span class="bad">Incorrecto.</span> Correctas: <b>${escapeHtml(correctAnswerText(q))}</b>. ${escapeHtml(q.explanation)}`) + renderConceptNoteHTML(getConceptNote(q), q.topic);
        renderLatex(els.studyFeedback);
        saveState();
        refreshStats();
        renderStudy();
      });
    }
    return;
  }

  els.studyOptions.innerHTML = q.options.map((opt,i)=>`<button class="opt" data-idx="${i}">${escapeHtml(opt)}</button>`).join('');
  renderLatex(els.studyOptions);
  els.studyOptions.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      if(studyAnswered) return;
      studyAnswered = true;
      const chosen = Number(btn.dataset.idx);
      const all = [...els.studyOptions.querySelectorAll('.opt')];
      all.forEach((b,i) => {
        if(i === q.correct) b.classList.add('correct');
        if(i === chosen && chosen !== q.correct) b.classList.add('wrong');
        b.disabled = true;
      });
      const ok = isAnswerCorrect(q, chosen);
      trackAnswer(q, ok);
      els.studyFeedback.innerHTML = (ok ? `<span class="good">Correcto.</span> ${escapeHtml(q.explanation)}` : `<span class="bad">Incorrecto.</span> ${escapeHtml(q.explanation)}`) + renderConceptNoteHTML(getConceptNote(q), q.topic);
      renderLatex(els.studyFeedback);
      saveState();
      refreshStats();
      renderStudy();
    });
  });
}
function renderBank(){
  const list = getFilteredStudyQuestions();
  els.bankList.innerHTML = list.slice(0, 220).map(q => `
    <div class="qitem">
      <small>#${q.id} · ${escapeHtml(q.topic)} · ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</small>
      <b>${escapeHtml(q.question)}</b>
      ${q.diagram ? `<div class="qitem-diagram">${buildDiagramSVG(q.diagram)}</div>` : ''}
      <div class="tiny">${escapeHtml(q.explanation)}</div>
    </div>
  `).join('') || '<div class="qitem">No hay resultados con ese filtro.</div>';
}
function toggleFavoriteCurrent(){
  const list = getFilteredStudyQuestions();
  if(!list.length) return;
  const q = list[studyIndex % list.length];
  const idx = state.bookmarks.indexOf(q.id);
  if(idx >= 0) state.bookmarks.splice(idx,1); else state.bookmarks.push(q.id);
  saveState();
  renderStudy();
  refreshStats();
}
function nextStudy(step){
  const list = getFilteredStudyQuestions();
  if(!list.length) return;
  studyIndex = (studyIndex + step + list.length) % list.length;
  studyAnswered = false;
  renderStudy();
}
function randomStudy(){
  const list = getFilteredStudyQuestions();
  if(!list.length) return;
  studyIndex = Math.floor(Math.random()*list.length);
  studyAnswered = false;
  renderStudy();
}

function refreshStats(){
  const acc = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
  const uniqueAnswered = new Set(state.seenIds || []).size;
  const repeatedAnswered = Math.max(0, state.answered - uniqueAnswered);
  els.statAnswered.textContent = state.answered;
  els.statUniqueAnswered.textContent = uniqueAnswered;
  els.statRepeatedAnswered.textContent = repeatedAnswered;
  els.statAccuracy.textContent = `${acc}%`;
  els.statLevel.textContent = state.hero.level;

  els.statsBox.innerHTML = `
    <div class="qitem">
      <small>Global</small>
      <b>${state.answered} respuestas</b>
      <div class="tiny">Correctas: ${state.correct} · Incorrectas: ${state.wrong} · Puntos: ${state.points}</div>
    </div>
    <div class="qitem" style="margin-top:10px">
      <small>Progreso</small>
      <b>Nivel ${state.hero.level}</b>
      <div class="tiny">XP: ${state.hero.xp} · Monedas: ${state.hero.coins}</div>
    </div>
    <div class="qitem" style="margin-top:10px">
      <small>Combate</small>
      <b>${state.battleWins} victorias</b>
      <div class="tiny">${state.battleLosses} derrotas · ${state.bossesDefeated.length} jefes vencidos</div>
    </div>
    <div class="qitem" style="margin-top:10px">
      <small>Logros</small>
      <b>${Object.keys(state.achievements || {}).length}/${ACHIEVEMENT_DEFS.length}</b>
      <div class="tiny">Favoritas: ${state.bookmarks.length} · Falladas: ${state.wrongIds.length}</div>
    </div>
  `;

  els.topicStats.innerHTML = TOPICS.map(topic => {
    const st = state.statsByTopic[topic] || { answered:0, correct:0, wrong:0 };
    const pct = st.answered ? Math.round((st.correct / st.answered) * 100) : 0;
    return `
      <div class="qitem" style="margin-bottom:10px">
        <small>${escapeHtml(topic)}</small>
        <div class="progress"><div style="width:${pct}%"></div></div>
        <div class="tiny" style="margin-top:6px">${pct}% · ${st.correct} correctas / ${st.answered} respondidas</div>
      </div>
    `;
  }).join('');
  if(els.achievementSummary) { renderAchievements(); }
}
// Un tema se considera "agotado" cuando ya se contestó una porción muy
// alta de sus preguntas (ver questionLastSeenBattle). Si eso pasa en el
// 90% (o más) de los temas del banco actual, tiene sentido arrancar de
// cero el historial de frescura junto con el resto del progreso — si
// no, casi no quedarían preguntas "frescas" para elegir. Si todavía no
// se llegó a ese punto, conviene preservarlo: así un reset de progreso
// no hace que vuelvan a aparecer las mismas preguntas que acabás de ver.
const EXHAUSTED_SEEN_RATIO = 0.9;    // 90% de las preguntas de un tema ya vistas
const EXHAUSTED_THEME_MAJORITY = 0.9; // 90% de los temas del banco así

function questionFreshnessIsMostlyExhausted(){
  const seen = state.questionLastSeenBattle || {};
  const byTheme = {};
  QUESTION_BANK.forEach(q => {
    const key = String(q.themeId);
    byTheme[key] ??= { total: 0, seenCount: 0 };
    byTheme[key].total++;
    if(seen[q.id] != null) byTheme[key].seenCount++;
  });
  const themeIds = Object.keys(byTheme);
  if(themeIds.length === 0) return false;
  const exhaustedThemes = themeIds.filter(t => {
    const { total, seenCount } = byTheme[t];
    return total > 0 && (seenCount / total) >= EXHAUSTED_SEEN_RATIO;
  });
  return (exhaustedThemes.length / themeIds.length) >= EXHAUSTED_THEME_MAJORITY;
}

function resetAll(){
  const wipeInventory = !!state.resetWipesInventory;
  const confirmMsg = wipeInventory
    ? '¿Borrar todo el progreso guardado, incluyendo inventario, equipamiento, trofeos y el nombre de tu héroe?'
    : '¿Borrar todo el progreso guardado? (el inventario, el equipamiento, los trofeos y el nombre del héroe se conservan)';
  if(!confirm(confirmMsg)) return;

  const keepFreshness = !questionFreshnessIsMostlyExhausted();
  const preservedLastSeen = keepFreshness ? (state.questionLastSeenBattle || {}) : {};
  const preservedBattleCounter = keepFreshness ? (state.battleCounter || 0) : 0;

  // Por defecto, los objetos comprados en la tienda, el equipamiento
  // puesto, los trofeos (logros) y el nombre del héroe sobreviven a un
  // reset de progreso. Solo se borran si el usuario tildó la opción
  // correspondiente en Ajustes.
  const preservedInventory = wipeInventory ? null : clone(state.inventory || stateDefaults.inventory);
  const preservedEquipment = wipeInventory ? null : clone(state.equipment || stateDefaults.equipment);
  const preservedOwnedEquipment = wipeInventory ? null : clone(state.ownedEquipment || []);
  const preservedAchievements = wipeInventory ? null : clone(state.achievements || {});
  const preservedSpecialItems = wipeInventory ? null : clone(state.specialItems || []);
  const preservedHeroName = wipeInventory ? null : (state.hero?.name || null);

  localStorage.removeItem(STORAGE_KEY);

  const fresh = clone(stateDefaults);
  // Al resetear, los valores por defecto de interfaz vuelven a adaptarse al
  // dispositivo: móvil = canvas 1.75 y minimapa 0.75; escritorio = 1 y 1.
  if(isLikelyMobileDevice()){ fresh.canvasScale = 1.75; fresh.minimapScale = 0.75; }
  fresh.questionLastSeenBattle = preservedLastSeen;
  fresh.battleCounter = preservedBattleCounter;
  fresh.questionLastSeenExam = keepFreshness ? (state.questionLastSeenExam || {}) : {};
  fresh.examCounter = keepFreshness ? (state.examCounter || 0) : 0;
  fresh.resetWipesInventory = wipeInventory;
  if(!wipeInventory){
    fresh.inventory = preservedInventory;
    fresh.equipment = preservedEquipment;
    fresh.ownedEquipment = preservedOwnedEquipment;
    fresh.achievements = preservedAchievements;
    fresh.specialItems = preservedSpecialItems;
    fresh.hero.name = preservedHeroName;
  }
  // IMPORTANTE: reemplazar también el estado EN MEMORIA antes de recargar.
  // Hay un beforeunload que llama a saveState(); si dejáramos `state`
  // apuntando al progreso viejo, ese evento volvería a escribirlo encima
  // del estado limpio justo durante location.reload().
  state = fresh;
  saveState();

  if(wipeInventory) localStorage.setItem(FORCE_HERO_NAME_KEY, '1');
  else localStorage.removeItem(FORCE_HERO_NAME_KEY);

  location.reload();
}

function loadExamDeck(){
  let list = QUESTION_BANK.slice().filter(q => !EXAM_UNSUPPORTED_TYPES.includes(q.type));
  if(examSelectedTopics.size > 0) list = list.filter(q => examSelectedTopics.has(q.topic));
  if(examSelectedDifficulties.size > 0) list = list.filter(q => examSelectedDifficulties.has(q.difficulty));
  // weightedShuffle en vez de shuffle plano: las preguntas que salieron
  // en un examen reciente quedan con muy poca chance (10%) de volver a
  // salir en el próximo, sin importar qué temas se elijan — esa chance
  // se va recuperando con cada examen que rindas después. Ver
  // questionFreshnessExam() más abajo en el archivo.
  list = weightedShuffle(list, q => questionFreshnessExam(q));
  const count = Math.min(Math.max(1, examSelectedCount()), list.length);
  return list.slice(0, count);
}
// Cantidad de preguntas elegida en la config del examen: si el select
// está en "Personalizada...", usamos el número que el usuario escribió
// en #examCountCustom en vez de una de las opciones predeterminadas.
function examSelectedCount(){
  if(els.examCount.value === 'custom'){
    return Number(els.examCountCustom?.value || 0) || 20;
  }
  return Number(els.examCount.value || 20);
}
function examTotalSeconds(){
  const minutes = Number(els.examTime.value || 0);
  return minutes > 0 ? minutes * 60 : 0;
}
function startExam(){
  if(els.examCount.value === 'custom'){
    const custom = Number(els.examCountCustom?.value || 0);
    if(!custom || custom < 1){
      alert('Escribí una cantidad de preguntas válida (mayor a 0).');
      els.examCountCustom?.focus();
      return;
    }
  }
  // Ver questionFreshnessExam(): el contador avanza ACÁ, antes de armar
  // el deck, para que este mismo examen ya cuente como "el más reciente"
  // al calcular qué tan fresca está cada pregunta.
  state.examCounter = (state.examCounter || 0) + 1;
  const deck = loadExamDeck();
  if(!deck.length){ alert('No hay preguntas suficientes con ese filtro.'); return; }
  clearInterval(examTimer);
  exam = {
    deck,
    index:0,
    answers:new Array(deck.length).fill(null),
    correct:0,
    wrong:0,
    ended:false,
    answerSounds: !!els.examAnswerSounds?.checked,
    secondsLeft: examTotalSeconds(),
    totalSeconds: examTotalSeconds()
  };
  if(exam.secondsLeft > 0){
    examTimer = setInterval(() => {
      if(!exam || exam.ended) return;
      exam.secondsLeft -= 1;
      updateExamClock();
      if(exam.secondsLeft <= 0) finishExam();
    }, 1000);
  }
  showExamRunView();
  renderExam();
  updateExamClock();
}
function showExamRunView(){
  if(els.examConfigView) els.examConfigView.style.display = 'none';
  if(els.examRunView) els.examRunView.style.display = '';
}
function showExamConfigView(){
  if(els.examRunView) els.examRunView.style.display = 'none';
  if(els.examConfigView) els.examConfigView.style.display = '';
}
function exitExam(){
  if(exam && !exam.ended){
    if(!confirm('¿Salir del examen? Se perderá el progreso de este intento.')) return;
    clearInterval(examTimer);
  }
  exam = null;
  showExamConfigView();
  renderExam();
}
function updateExamClock(){
  if(!exam){ els.examTimer.textContent = '00:00'; return; }
  if(exam.totalSeconds === 0){ els.examTimer.textContent = '∞'; return; }
  const m = String(Math.floor(Math.max(0, exam.secondsLeft) / 60)).padStart(2,'0');
  const s = String(Math.max(0, exam.secondsLeft) % 60).padStart(2,'0');
  els.examTimer.textContent = `${m}:${s}`;
}
function renderExam(){
  if(!exam){
    els.examQuestion.textContent = 'Elegí cantidad y tema, luego tocá Empezar.';
    els.examOptions.innerHTML = '';
    renderLatex(els.examOptions);
    els.examFeedback.textContent = 'El examen se corrige al final.';
    els.examMeta.textContent = 'Listo para iniciar';
    els.examProgress.style.width = '0%';
    els.examProgressText.textContent = '0/0 respondidas';
    els.examAnswered.textContent = '0/0';
    els.examPending.textContent = '0';
    els.examTimer.textContent = '00:00';
    return;
  }
  const q = exam.deck[exam.index];
  const answered = exam.answers.filter(x => x !== null).length;
  const pending = exam.deck.length - answered;
  const pct = Math.round((answered / exam.deck.length) * 100);
  els.examMeta.textContent = `Pregunta ${exam.index+1} de ${exam.deck.length} · #${q.id} · ${q.topic}${exam.ended ? ' · Revisión' : ''}`;
  els.examQuestion.innerHTML = `<span class="tag">${escapeHtml(q.topic)} · ${'★'.repeat(q.difficulty)}${'☆'.repeat(5-q.difficulty)}</span>${q.type==='input' ? ' <span class="tag">✏️ Respuesta escrita</span>' : (isMultiChoice(q) ? ' <span class="tag">🔲 Selección múltiple</span>' : '')}<br><b>${escapeHtml(q.question)}</b>`;

  renderLatex(els.examQuestion);
  // Preguntas "diagram" y "diagram-click" traen q.diagram: lo dibujamos
  // arriba de las opciones, igual patrón que Estudio (#studyDiagramContainer)
  // y Combate (#diagramContainer).
  if(els.examDiagram){
    if(q.diagram){
      els.examDiagram.style.display = 'block';
      els.examDiagram.innerHTML = buildDiagramSVG(q.diagram);
    } else {
      els.examDiagram.style.display = 'none';
      els.examDiagram.innerHTML = '';
    }
  }

  if(q.type === 'diagram-click'){
    els.examOptions.innerHTML = `<p class="tag">👆 Tocá el elemento correcto en el diagrama de arriba.</p>`;
  } else if(q.type === 'input'){
    const current = exam.answers[exam.index];
    els.examOptions.innerHTML = `
      <input type="text" class="studyInput" id="examTextInput" placeholder="Escribí tu respuesta..." autocomplete="off" value="${escapeHtml(current || '')}" />
      <button class="btn" id="examTextSubmit" style="margin-top:8px">Guardar respuesta</button>
    `;
    const submit = () => {
      const val = document.getElementById('examTextInput').value;
      answerExam(val);
    };
    document.getElementById('examTextSubmit').addEventListener('click', submit);
    document.getElementById('examTextInput').addEventListener('keydown', e => { if(e.key === 'Enter') submit(); });
  } else {
    const currentAns = exam.answers[exam.index];
    els.examOptions.innerHTML = q.options.map((opt,i)=>{
      const isSelected = isMultiChoice(q) ? (Array.isArray(currentAns) && currentAns.includes(i)) : currentAns === i;
      return `<button class="opt ${isSelected ? 'selected' : ''}" data-idx="${i}">${escapeHtml(opt)}</button>`;
    }).join('');
  }
  renderLatex(els.examOptions);

  if(exam.answers[exam.index] === null){
    els.examFeedback.innerHTML = isMultiChoice(q) ? 'Marcá todas las opciones que correspondan y podés avanzar.' : 'Respondé y podés avanzar.';
  } else if(!exam.ended){
    els.examFeedback.innerHTML = 'Respuesta guardada. El examen se corrige al final.';
  } else {
    const prevAns = exam.answers[exam.index];
    const prevOk = isAnswerCorrect(q, prevAns);
    els.examFeedback.innerHTML = (prevOk ? `<span class="good">Correcto.</span> ${escapeHtml(q.explanation)}` : (q.type==='input' ? `<span class="bad">Incorrecto.</span> Respuesta esperada: <b>${escapeHtml(correctAnswerText(q))}</b>.` : `<span class="bad">Incorrecto.</span> ${escapeHtml(q.explanation)}`)) + renderConceptNoteHTML(getConceptNote(q), q.topic);
  }
  renderLatex(els.examFeedback);
  els.examProgress.style.width = `${pct}%`;
  els.examProgressText.textContent = `${answered}/${exam.deck.length} respondidas`;
  els.examAnswered.textContent = `${answered}/${exam.deck.length}`;
  els.examPending.textContent = String(pending);
  updateExamHud();
  updateExamClock();
  if(exam.answers[exam.index] !== null){
    const chosen = exam.answers[exam.index];
    if(q.type === 'diagram-click'){
      const corrects = Array.isArray(q.correct) ? q.correct : [q.correct];
      els.examDiagram?.querySelectorAll('[data-click-answer]').forEach(el => {
        const val = el.dataset.clickAnswer;
        if(exam.ended){
          if(corrects.includes(val)) el.classList.add('diagram-correct');
          if(val === chosen && !corrects.includes(val)) el.classList.add('diagram-wrong');
        } else if(val === chosen){
          el.classList.add('diagram-selected');
        }
      });
    } else if(q.type !== 'input'){
      const chosenArr = isMultiChoice(q) ? (Array.isArray(chosen) ? chosen : []) : null;
      [...els.examOptions.querySelectorAll('.opt')].forEach((b,i) => {
        if(exam.ended){
          if(isMultiChoice(q)){
            if(q.correct.includes(i)) b.classList.add('correct');
            if(chosenArr.includes(i) && !q.correct.includes(i)) b.classList.add('wrong');
          } else {
            if(i === q.correct) b.classList.add('correct');
            if(i === chosen && chosen !== q.correct) b.classList.add('wrong');
          }
        }
      });
    }
  }
}
function updateExamHud(){
  if(!exam) return;
  exam.correct = 0;
  exam.wrong = 0;
  exam.answers.forEach((a,i) => {
    if(a === null) return;
    if(isAnswerCorrect(exam.deck[i], a)) exam.correct++; else exam.wrong++;
  });
  const answered = exam.answers.filter(x => x !== null).length;
  els.examProgress.style.width = `${Math.round((answered / exam.deck.length) * 100)}%`;
  els.examProgressText.textContent = `${answered}/${exam.deck.length} respondidas`;
  els.examAnswered.textContent = `${answered}/${exam.deck.length}`;
  els.examPending.textContent = String(exam.deck.length - answered);
}
function nextExam(){
  if(!exam) return;
  if(exam.index < exam.deck.length - 1){ exam.index++; renderExam(); }
  else if(!exam.ended) finishExam();
}
function prevExam(){
  if(!exam) return;
  if(!exam.ended && els.lockBack.checked) return;
  if(exam.index > 0){ exam.index--; renderExam(); }
}
function answerExam(value){
  if(!exam || exam.ended) return;
  const q = exam.deck[exam.index];
  exam.answers[exam.index] = value;
  updateExamHud();
  const ok = isAnswerCorrect(q, value);

  // A diferencia de Combate y Estudiar, el Examen NO se corrige
  // pregunta por pregunta: no hay que revelar si la respuesta es
  // correcta ni cuál era la correcta hasta terminarlo (ahí es cuando
  // renderExam() con exam.ended=true, y la Revisión, muestran todo).
  // Antes acá se pintaban las opciones de verde/rojo y se mostraba el
  // texto "Respuesta correcta: ..." apenas contestabas, filtrando la
  // respuesta antes de tiempo. Ahora solo marcamos qué opción quedó
  // seleccionada, sin ninguna pista visual de si es correcta o no
  // (el beep sí se mantiene distinto, eso no cuenta como revelar la
  // respuesta en pantalla).
  if(q.type === 'diagram-click'){
    els.examDiagram?.querySelectorAll('[data-click-answer]').forEach(el => {
      const val = el.dataset.clickAnswer;
      el.classList.remove('diagram-correct','diagram-wrong','diagram-selected');
      if(val === value) el.classList.add('diagram-selected');
    });
  } else if(q.type !== 'input'){
    const buttons = [...els.examOptions.querySelectorAll('.opt')];
    const selectedSet = isMultiChoice(q) ? (Array.isArray(value) ? value : []) : null;
    buttons.forEach((b,i) => {
      b.classList.remove('correct','wrong');
      b.classList.toggle('selected', selectedSet ? selectedSet.includes(i) : i === value);
    });
  }
  els.examFeedback.innerHTML = 'Respuesta guardada. El examen se corrige al final.';
  renderLatex(els.examFeedback);

  if(exam.answerSounds){
    if(ok) beep(680,.07,'sine',.03); else beep(170,.09,'square',.02);
  }
  saveState();
}
// Preguntas "choice" de selección múltiple en el Examen: a diferencia de
// Estudio y Combate, acá no hay "confirmar": cada click togglea esa opción
// dentro del conjunto marcado, y podés seguir cambiando tu selección
// libremente hasta terminar el examen (mismo criterio que ya vale para las
// preguntas de una sola opción).
function answerExamMulti(idx){
  if(!exam || exam.ended) return;
  const current = Array.isArray(exam.answers[exam.index]) ? [...exam.answers[exam.index]] : [];
  const pos = current.indexOf(idx);
  if(pos >= 0) current.splice(pos, 1); else current.push(idx);
  answerExam(current);
}
function finishExam(){
  if(!exam || exam.ended) return;
  exam.ended = true;
  clearInterval(examTimer);
  updateExamHud();
  const total = exam.deck.length;
  const correct = exam.correct;
  const grade = Math.round((correct / total) * 100) / 10;
  state.bestExam = Math.max(state.bestExam, grade);
  const wrongTopics = {};
  state.questionLastSeenExam ??= {};
  exam.answers.forEach((ans, i) => {
    const q = exam.deck[i];
    const ok = isAnswerCorrect(q, ans);
    trackAnswer(q, ok);
    state.questionLastSeenExam[q.id] = state.examCounter || 0;
    if(!ok) wrongTopics[q.topic] = (wrongTopics[q.topic] || 0) + 1;
  });
  state.lastExam = {
    date: new Date().toISOString(),
    total, correct, wrong: exam.wrong, grade,
    wrongTopics,
    deck: exam.deck.map((q, i) => ({
      id: q.id,
      topic: q.topic,
      question: q.question,
      given: givenAnswerText(q, exam.answers[i]),
      correct: correctAnswerText(q),
      ok: isAnswerCorrect(q, exam.answers[i]),
      explanation: q.explanation || ''
    }))
  };
  state.examHistory ??= [];
  state.examHistory.unshift({
    date: state.lastExam.date,
    total, correct, wrong: exam.wrong, grade,
    deck: exam.deck.map((q, i) => ({
      id: q.id,
      topic: q.topic,
      question: q.question,
      given: givenAnswerText(q, exam.answers[i]),
      correct: correctAnswerText(q),
      ok: isAnswerCorrect(q, exam.answers[i]),
      explanation: q.explanation || ''
    }))
  });
  // Guarda como máximo los últimos 50 exámenes para no inflar el
  // localStorage indefinidamente.
  if(state.examHistory.length > 50){
    state.examHistory.length = 50;
  }
  saveState();
  refreshStats();
  renderLastExam();
  renderExamHistory();
  const worst = Object.entries(wrongTopics).sort((a,b) => b[1]-a[1])[0];
  els.examFeedback.innerHTML = `<span class="warn">Examen terminado.</span> Aciertos: <b>${correct}</b> de <b>${total}</b>. Nota estimada: <b>${grade.toFixed(1)}/10</b>. ${worst ? `Tema a reforzar: <b>${escapeHtml(worst[0])}</b>.` : 'Sin temas débiles claros.'}`;
  els.examAdvice ? els.examAdvice.textContent = worst ? `Repasá ${worst[0]} primero.` : `Buen resultado.` : null;
  els.examMeta.textContent = 'Examen finalizado';
  els.examProgress.style.width = '100%';
  els.examProgressText.textContent = `${total}/${total} respondidas`;
  els.examAnswered.textContent = `${total}/${total}`;
  els.examPending.textContent = '0';
}
const MAP = {
  worldWidth: 52,
  worldHeight: 36,
  tileSize: 48,
 npcs: [

    // ================= NPC =================
    {
      id:'guide',
      x:11,y:9,
      hostile:false,
      text:'Usa E cerca de un enemigo o portal para interactuar.'
    },

    // ================= BOSQUE =================
    {id:'rat',x:8,y:13,originWorld:'forest',hostile:true,hp:2,rewardXp:6,rewardCoins:2},
    {id:'slime',x:10,y:17,originWorld:'forest',hostile:true,hp:2,rewardXp:6,rewardCoins:2},
    {id:'cursor',x:13,y:11,originWorld:'forest',hostile:true,hp:2,rewardXp:7,rewardCoins:3},
    {id:'bat',x:6,y:20,originWorld:'forest',hostile:true,hp:3,rewardXp:8,rewardCoins:3},
    {id:'spider',x:16,y:18,originWorld:'forest',hostile:true,hp:3,rewardXp:8,rewardCoins:4},
    {id:'worm',x:19,y:10,originWorld:'forest',hostile:true,hp:3,rewardXp:9,rewardCoins:4},
    {id:'mimic',x:20,y:20,originWorld:'forest',hostile:true,hp:4,rewardXp:12,rewardCoins:6},
    {id:'owl',x:22,y:15,originWorld:'forest',hostile:true,hp:4,rewardXp:12,rewardCoins:6},

    {id:'intro',x:16,y:15,worlds:['forest'],hostile:true,isBoss:true,hp:6,rewardXp:35,rewardCoins:20},

    // ================= SQL =================
    {id:'bug',x:21,y:9,originWorld:'sql',hostile:true,hp:3,rewardXp:10,rewardCoins:4},
    {id:'query_ghost',x:24,y:13,originWorld:'sql',hostile:true,hp:3,rewardXp:10,rewardCoins:4},
    {id:'select',x:26,y:8,originWorld:'sql',hostile:true,hp:3,rewardXp:11,rewardCoins:5},
    {id:'parser',x:29,y:10,originWorld:'sql',hostile:true,hp:4,rewardXp:13,rewardCoins:6},
    {id:'virus',x:32,y:12,originWorld:'sql',hostile:true,hp:4,rewardXp:13,rewardCoins:6},
    {id:'injector',x:34,y:8,originWorld:'sql',hostile:true,hp:4,rewardXp:14,rewardCoins:7},
    {id:'hacker',x:37,y:13,originWorld:'sql',hostile:true,hp:5,rewardXp:16,rewardCoins:8},
    {id:'daemon',x:40,y:10,originWorld:'sql',hostile:true,hp:5,rewardXp:18,rewardCoins:9},

    {id:'sqlboss',x:28,y:15,worlds:['sql'],hostile:true,isBoss:true,hp:8,rewardXp:55,rewardCoins:35},

    // ================= RELACIONAL =================
    // Nota histórica: esta zona tenía 8 enemigos con "topic" fijo por NPC
    // (Modelo Relacional / Álgebra Relacional), lo que dejaba afuera otras
    // preguntas relacionadas (ER, Tablas). Ahora el tema real de cada
    // combate lo decide la rotación de la zona (WORLD_TOPIC_ASSIGNMENTS),
    // no un campo por NPC — ver nextAssignedThemeId().
    {id:'spy',x:32,y:11,originWorld:'rel',hostile:true,hp:4,rewardXp:15,rewardCoins:7},
    {id:'tuple',x:36,y:10,originWorld:'rel',hostile:true,hp:4,rewardXp:15,rewardCoins:7},
    {id:'golem',x:39,y:14,originWorld:'rel',hostile:true,hp:5,rewardXp:18,rewardCoins:8},
    {id:'entity',x:33,y:18,originWorld:'rel',hostile:true,hp:5,rewardXp:18,rewardCoins:8},
    {id:'domain',x:28,y:19,originWorld:'rel',hostile:true,hp:5,rewardXp:19,rewardCoins:9},
    {id:'relation',x:25,y:16,originWorld:'rel',hostile:true,hp:6,rewardXp:22,rewardCoins:10},
    {id:'algo',x:30,y:22,originWorld:'rel',hostile:true,hp:6,rewardXp:22,rewardCoins:10},
    {id:'joiner',x:38,y:22,originWorld:'rel',hostile:true,hp:6,rewardXp:24,rewardCoins:12},

    {id:'relboss',x:38,y:15,worlds:['rel'],hostile:true,isBoss:true,hp:10,rewardXp:80,rewardCoins:45},

    // ================= NORMALIZACIÓN =================
    {id:'guardian',x:14,y:24,originWorld:'norm',hostile:true,hp:6,rewardXp:25,rewardCoins:12},
    {id:'dependency',x:18,y:23,originWorld:'norm',hostile:true,hp:6,rewardXp:25,rewardCoins:12},
    {id:'redundancy',x:22,y:20,originWorld:'norm',hostile:true,hp:7,rewardXp:28,rewardCoins:14},
    {id:'duplicate',x:27,y:24,originWorld:'norm',hostile:true,hp:7,rewardXp:28,rewardCoins:14},
    {id:'anomaly',x:31,y:20,originWorld:'norm',hostile:true,hp:8,rewardXp:30,rewardCoins:15},
    {id:'ghostfn',x:35,y:22,originWorld:'norm',hostile:true,hp:8,rewardXp:30,rewardCoins:16},
    {id:'clone',x:39,y:24,originWorld:'norm',hostile:true,hp:8,rewardXp:32,rewardCoins:16},
    {id:'oracle',x:42,y:19,originWorld:'norm',hostile:true,hp:9,rewardXp:35,rewardCoins:18},

    {id:'normboss',x:22,y:25,worlds:['norm'],hostile:true,isBoss:true,hp:12,rewardXp:110,rewardCoins:60},

    // ================= CASTILLO =================
    {id:'sentinel',x:39,y:22,originWorld:'boss',hostile:true,hp:8,rewardXp:35,rewardCoins:18},
    {id:'lich',x:34,y:19,originWorld:'boss',hostile:true,hp:8,rewardXp:35,rewardCoins:18},
    {id:'trigger',x:29,y:21,originWorld:'boss',hostile:true,hp:9,rewardXp:38,rewardCoins:20},
    {id:'view',x:24,y:18,originWorld:'boss',hostile:true,hp:9,rewardXp:38,rewardCoins:20},
    {id:'procedure',x:19,y:20,originWorld:'boss',hostile:true,hp:10,rewardXp:40,rewardCoins:22},
    {id:'backup',x:14,y:18,originWorld:'boss',hostile:true,hp:10,rewardXp:42,rewardCoins:24},
    {id:'matrix',x:10,y:22,originWorld:'boss',hostile:true,hp:11,rewardXp:45,rewardCoins:25},
    {id:'core',x:6,y:18,originWorld:'boss',hostile:true,hp:11,rewardXp:48,rewardCoins:28},

    // Terminal/PC del núcleo del Castillo: no es hostil, se interactúa
    // con E. Antes de derrotar a todos los jefes de las zonas
    // anteriores está bloqueada (solo da un diálogo). Una vez
    // derrotados todos, se "habilita": al interactuar da otro diálogo
    // y abre directamente la interfaz de combate contra el Dragón
    // Final (ver handleCastlePcInteraction()).
    {
      id:'castle_pc',
      x:44,y:20,
      worlds:['boss'],
      hostile:false,
      textLocked:'Terminal bloqueada. Derrotá a todos los jefes de las zonas(incluido este) para activarme.',
      textUnlocked:'Núcleo activado. Ahora podes pelear con cualquier Jefe cuando quieras'
    },

    {id:'dragon',x:44,y:24,worlds:['boss'],hostile:true,isBoss:true,hp:18,rewardXp:250,rewardCoins:150},

    // NPC escondido en un rincón del Castillo. No es hostil y su diálogo
    // depende de si ya completaste el juego entero (ver
    // isGameFullyCompleted() y npcDialogueText()): mientras falten
    // enemigos o jefes por derrotar te manda de vuelta, y una vez que
    // está todo derrotado te da la pista del atajo del debug menu.
    {
      id:'secret_helper',
      x:49,y:32,
      worlds:['boss'],
      hostile:false
    },

    // ================= MERCADER =================
    {
      id:'merchant',
      x:45,
      y:13,
      worlds:['shop'],
      hostile:false,
      text:'Bienvenido al Mercado.'
    }

  ],  
  coins:{
      forest:[
          {x:8,y:8,taken:false},
          {x:17,y:17,taken:false}
      ],

      sql:[
          {x:20,y:6,taken:false},
          {x:26,y:11,taken:false},
          {x:33,y:15,taken:false},
          {x:39,y:9,taken:false}
      ],

      rel:[
          {x:30,y:10,taken:false},
          {x:36,y:18,taken:false},
          {x:25,y:21,taken:false},
          {x:40,y:14,taken:false},
          {x:43,y:22,taken:false},
          {x:32,y:25,taken:false}
      ],

      norm:[
          {x:14,y:22,taken:false},
          {x:18,y:19,taken:false},
          {x:24,y:25,taken:false},
          {x:31,y:20,taken:false},
          {x:36,y:23,taken:false},
          {x:42,y:18,taken:false},
          {x:45,y:24,taken:false},
          {x:28,y:16,taken:false}
      ],

      boss:[
          {x:9,y:18,taken:false},
          {x:13,y:21,taken:false},
          {x:18,y:16,taken:false},
          {x:24,y:19,taken:false},
          {x:29,y:22,taken:false},
          {x:34,y:18,taken:false},
          {x:38,y:23,taken:false},
          {x:42,y:19,taken:false},
          {x:46,y:16,taken:false},
          {x:44,y:10,taken:false}
      ]
  }
};

// ===================== CASCADA DE ENEMIGOS ENTRE ZONAS =====================
// Los enemigos "propios" de una zona siempre aparecen ahí. Además, con cierta
// probabilidad (que decae con la distancia), enemigos de zonas ANTERIORES
// también pueden aparecer en zonas posteriores (nunca al revés), con un
// máximo de ENEMY_RULES.cap enemigos regulares (sin contar jefes) por zona.
// ===================== CONFIGURACIÓN UNIVERSAL DE MATERIA =====================
// Detecta automáticamente los temas disponibles en QUESTION_BANK.
// Esto permite que el juego pueda adaptarse a cualquier materia importada
// sin necesitar una configuración GAME_THEME escrita manualmente.

function buildSubjectGameConfig(){

  const questions = Array.isArray(QUESTION_BANK)
    ? QUESTION_BANK
    : [];

  const topicMap = new Map();

  questions.forEach(q => {

    if(!q || !q.topic) return;

    const topicName = String(q.topic).trim();

    // Si el banco ya trae themeId, lo usamos.
    // Si no, después se genera automáticamente.
    const existingThemeId =
      q.themeId !== undefined &&
      q.themeId !== null &&
      q.themeId !== ''
        ? String(q.themeId)
        : null;

    if(!topicMap.has(topicName)){

      topicMap.set(topicName,{
        topic: topicName,
        themeId: existingThemeId,
        questionCount: 0
      });

    }

    const entry = topicMap.get(topicName);

    entry.questionCount++;

    // Si la primera pregunta no tenía themeId pero otra sí,
    // aprovechamos el que encontremos.
    if(!entry.themeId && existingThemeId){
      entry.themeId = existingThemeId;
    }

  });

  const topics = Array.from(topicMap.values());

  // Asigna themeId automático solamente cuando falta.
  topics.forEach((topic,index)=>{

    if(!topic.themeId){
      topic.themeId = String(index + 1);
    }

  });

  // Sincroniza el themeId auto-generado con las preguntas reales del
  // banco. Sin esto, una materia nueva que no trae "themeId" propio en
  // su archivo de preguntas queda con temas asignados a los mundos
  // (WORLD_TOPIC_ASSIGNMENTS) que no matchean ninguna pregunta real:
  // getBattlePool() siempre devuelve un pool vacío y beginEncounter()
  // aborta en silencio (no aparece la pantalla de combate).
  questions.forEach(q => {

    if(!q || !q.topic) return;

    if(q.themeId !== undefined && q.themeId !== null && q.themeId !== ''){
      return;
    }

    const entry = topicMap.get(String(q.topic).trim());

    if(entry){
      q.themeId = entry.themeId;
    }

  });

  return {

    subjectId:
      (window.__DBQUEST_CURRENT_SUBJECT__ &&
       window.__DBQUEST_CURRENT_SUBJECT__.id)
        || 'default',

    subjectName:
      (window.__DBQUEST_CURRENT_SUBJECT__ &&
       (window.__DBQUEST_CURRENT_SUBJECT__.label ||
        window.__DBQUEST_CURRENT_SUBJECT__.name))
        || 'Materia',

    topics

  };

}

const SUBJECT_GAME_CONFIG = buildSubjectGameConfig();

console.log(
  '🎮 Configuración automática de materia:',
  SUBJECT_GAME_CONFIG
);

// ===================== PROGRESIÓN UNIVERSAL DE MUNDOS =====================
// El orden de las zonas ya no se define acá: se reutiliza WORLD_ORDER
// (definida junto a WORLD_DEFS), que es la única fuente de verdad para
// "cuál es el mundo siguiente/anterior" en todo el juego.

function getPlayableWorldIds(){
  return WORLD_ORDER.slice();
}

// ===================== TEMAS DE LA MATERIA → MUNDOS =====================

function buildWorldTopicAssignments(){

  const worlds = getPlayableWorldIds();

  const topics =
    SUBJECT_GAME_CONFIG &&
    Array.isArray(SUBJECT_GAME_CONFIG.topics)
      ? SUBJECT_GAME_CONFIG.topics
      : [];

  const assignments = {};

  worlds.forEach(worldId => {
    assignments[worldId] = [];
  });

  if(!topics.length || !worlds.length){
    return assignments;
  }

  function assignTopic(worldId, topic){
    if(!worldId || !topic) return;

    assignments[worldId].push({
      topic: topic.topic,
      themeId: topic.themeId,
      questionCount: topic.questionCount
    });
  }

  // El último mundo (Castillo / jefe final) SIEMPRE agrega Mixto a sus
  // temas propios, sea cual sea la materia: tanto el jefe final como
  // cualquier otro enemigo que rote ahí toman preguntas de TODOS los
  // temas mezclados en combate (ver el forzado de Mixto en
  // beginEncounter(), que ignora lo que digamos acá para elegir
  // preguntas). Esta función solo AGREGA la entrada "Mixto" al final de
  // lo que Castillo ya tenga asignado como tema propio —no lo
  // reemplaza—, para que el nombre de la zona muestre ambos (ej.
  // "ER · Mixto").
  const bossWorld = worlds[worlds.length - 1];

  function markBossAsMixed(){
    if(!bossWorld) return;
    const totalQuestions = topics.reduce((sum, t) => sum + (t.questionCount || 0), 0);
    assignments[bossWorld].push({
      topic: 'Mixto',
      themeId: 'mixed',
      questionCount: totalQuestions
    });
  }

  const intermediateWorlds = worlds.slice(0, -1);

  // =====================================================
  // CASO ESPECIAL: MATERIAS DE 7 U 8 TEMAS
  //
  // IMPORTANTE: la distribución debe respetar el ORDEN REAL de los
  // temas tal como aparecen en QUESTION_BANK / Estudio. La versión
  // anterior conservaba un mapeo histórico de Base de Datos/Álgebra
  // ([0], [3], [1,2], [4,5]), por lo que con 8 temas el Laboratorio
  // saltaba directamente al TEMA 4. Eso rompe la progresión natural
  // de materias como Análisis Matemático II.
  //
  // 7 temas: 1 - 1 - 2 - 2 - 1
  // 8 temas: 1 - 2 - 2 - 2 - 1
  //
  // El Castillo además agrega "Mixto", como siempre.
  // =====================================================

  if(topics.length === 7 || topics.length === 8){

    const distribution = topics.length === 8
      ? [
          [0],       // forest → Tema 1
          [1, 2],    // sql    → Temas 2 y 3
          [3, 4],    // rel    → Temas 4 y 5
          [5, 6]     // norm   → Temas 6 y 7
        ]
      : [
          [0],       // forest → Tema 1
          [1],       // sql    → Tema 2
          [2, 3],    // rel    → Temas 3 y 4
          [4, 5]     // norm   → Temas 5 y 6
        ];

    distribution.forEach((topicIndexes, worldIndex) => {

      const worldId = intermediateWorlds[worldIndex];

      if(!worldId) return;

      topicIndexes.forEach(topicIndex => {
        assignTopic(worldId, topics[topicIndex]);
      });

    });

    // Todo tema no usado por las cuatro primeras zonas queda como tema
    // propio del Castillo. Con 7 u 8 temas, en ambos casos queda uno.
    const usedIndexes = new Set(distribution.flat());

    topics.forEach((topic, index) => {
      if(!usedIndexes.has(index)){
        assignTopic(bossWorld, topic);
      }
    });

    markBossAsMixed();

    return assignments;
  }

  // =====================================================
  // DISTRIBUCIÓN UNIVERSAL (caso general)
  // Para materias con cualquier otra cantidad de temas (menos de 7 o
  // más de 8). Reparte los temas entre las 5 zonas (Bosque, Lab,
  // Ciudad, Fortaleza y Castillo) de la forma más equilibrada posible,
  // sin dejar ninguna zona vacía y sin concentrar casi todo en el
  // Castillo.
  //
  // Hay dos regímenes:
  //
  // A) MENOS TEMAS QUE ZONAS INTERMEDIAS + 1 (T < 5):
  //    no alcanzan los temas para que cada una de las 5 zonas tenga
  //    uno propio sin repetir, así que cada zona intermedia recibe un
  //    tema por rotación simple (tema = índice % T, permitiendo que se
  //    repita), y Castillo recibe además los temas que "seguirían" en
  //    esa misma rotación un tramo más (tantos como hagan falta para
  //    completar el ciclo), de forma que nunca se quede con menos de
  //    un tema propio.
  //
  //    Ejemplos: 1 tema → todas las zonas usan el único tema.
  //              2 temas → forest=1, sql=2, rel=1, norm=2, boss=1,2.
  //              3 temas → forest=1, sql=2, rel=3, norm=1, boss=2,3.
  //              4 temas → forest=1, sql=2, rel=3, norm=4, boss=1,2,3,4.
  //
  // B) 5 TEMAS O MÁS (T >= 5):
  //    se reparten en bloques contiguos: cada zona recibe
  //    floor(T/5) temas, y el resto (T mod 5) se reparte de a uno
  //    extra, dando prioridad primero a Castillo, después a Bosque,
  //    Lab y Ciudad — Fortaleza es la última en recibir el extra, así
  //    que si no alcanza para todas es la que se queda con el bloque
  //    más chico.
  //
  //    Ejemplos: 5 temas  → forest=1, sql=2, rel=3, norm=4, boss=5.
  //              6 temas  → forest=1, sql=2, rel=3, norm=4, boss=5,6.
  //              9 temas  → forest=1,2 · sql=3,4 · rel=5,6 · norm=7 · boss=8,9.
  //              10 temas → forest=1,2 · sql=3,4 · rel=5,6 · norm=7,8 · boss=9,10.
  //
  // En ambos casos, Castillo suma "Mixto" encima de lo que le toque
  // como tema propio (markBossAsMixed(), al final).
  // =====================================================

  const totalTopics = topics.length;

  if(totalTopics < intermediateWorlds.length + 1){

    // ---- Régimen A: menos temas que zonas (rotación + cierre de ciclo) ----

    intermediateWorlds.forEach((worldId, index) => {
      assignTopic(worldId, topics[index % totalTopics]);
    });

    const extra =
      totalTopics - (intermediateWorlds.length % totalTopics);

    for(let step = 0; step < extra; step++){
      const idx = (intermediateWorlds.length + step) % totalTopics;
      assignTopic(bossWorld, topics[idx]);
    }

  } else {

    // ---- Régimen B: 5 temas o más (bloques parejos, resto priorizado) ----

    const zones = [...intermediateWorlds, bossWorld];
    const base = Math.floor(totalTopics / zones.length);
    const remainder = totalTopics % zones.length;

    // Orden de prioridad para el "resto": Castillo primero, después
    // Bosque, Lab y Ciudad; Fortaleza queda última.
    const priority = [bossWorld, ...intermediateWorlds];
    const extraZones = new Set(priority.slice(0, remainder));

    let cursor = 0;

    zones.forEach(zoneId => {
      const size = base + (extraZones.has(zoneId) ? 1 : 0);
      for(let i = 0; i < size; i++){
        assignTopic(zoneId, topics[cursor]);
        cursor++;
      }
    });

  }

  markBossAsMixed();

  return assignments;
}

const WORLD_TOPIC_ASSIGNMENTS = buildWorldTopicAssignments();

console.log(
  '🌍 Asignación automática de temas a mundos:',
  WORLD_TOPIC_ASSIGNMENTS
);
// Toda la "cascada de enemigos" (Paso 4 anterior) se rige por esta
// configuración. Antes estos números vivían como literales sueltos
// adentro de getZoneEnemies(); ahora están centralizados acá para que
// ajustar la dificultad/variedad no implique tocar la lógica.
const ENEMY_RULES = {
  cap: 14,                 // máximo de enemigos regulares (sin jefes) por zona
  guestBaseChance: 0.65,   // probabilidad de que un invitado de la zona INMEDIATA anterior aparezca
  guestChanceFloor: 0.15,  // probabilidad mínima, sin importar qué tan lejos esté la zona de origen
  guestChanceDecay: 0.15,  // cuánto baja la probabilidad por cada zona extra de distancia
  guestTargetMinRatio: 0.4,// mínimo % del cupo restante (tras los propios) reservado a invitados
  guestTargetMaxRatio: 1.0 // máximo % del cupo restante reservado a invitados
};
function zoneOrderIndex(id){ return WORLD_ORDER.indexOf(id); }
function hashStr(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
function seededChance(seedStr){
  return (hashStr(seedStr) % 100000) / 100000;
}
let zoneEnemyCache = {};
function getZoneEnemies(world){
  const cacheKey = `${world}:${state.enemySeed || 0}`;
  if(zoneEnemyCache[cacheKey]) return zoneEnemyCache[cacheKey];
  const order = zoneOrderIndex(world);
  const own = MAP.npcs.filter(n => n.hostile && !n.isBoss && n.originWorld === world);
  const earlier = MAP.npcs.filter(n => n.hostile && !n.isBoss && zoneOrderIndex(n.originWorld) >= 0 && zoneOrderIndex(n.originWorld) < order);
  const candidates = earlier.map(n => {
    const distance = order - zoneOrderIndex(n.originWorld);
    const prob = Math.max(
      ENEMY_RULES.guestChanceFloor,
      ENEMY_RULES.guestBaseChance - (distance - 1) * ENEMY_RULES.guestChanceDecay
    );
    const roll = seededChance(`${n.id}->${world}#${state.enemySeed || 0}`);
    return { n, roll, prob };
  }).filter(c => c.roll < c.prob);

  let carry = candidates.map(c => c.n);
  const capRemaining = Math.max(0, ENEMY_RULES.cap - own.length);

  // Antes se recortaba siempre hasta capRemaining, y como casi siempre había
  // más candidatos que cupo, terminaba llenándolo entero: Ciudad, Fortaleza
  // y Castillo (con 2+ zonas anteriores) daban exactamente ENEMY_RULES.cap
  // invitados en casi todas las partidas. Ahora el cupo real de invitados
  // varía por zona y por seed (entre guestTargetMinRatio y guestTargetMaxRatio
  // de capRemaining), así que la cantidad total de enemigos también varía,
  // no solo cuáles son.
  const varietyRoll = seededChance(`${world}:guestTarget#${state.enemySeed || 0}`);
  const guestRatioRange = ENEMY_RULES.guestTargetMaxRatio - ENEMY_RULES.guestTargetMinRatio;
  const guestTarget = Math.round(capRemaining * (ENEMY_RULES.guestTargetMinRatio + varietyRoll * guestRatioRange));

  if(guestTarget <= 0){
    carry = [];
  } else if(carry.length > guestTarget){
    carry = candidates.sort((a,b) => a.roll - b.roll).slice(0, guestTarget).map(c => c.n);
  }
  const list = [...own, ...carry];
  zoneEnemyCache[cacheKey] = list;
  return list;
}
function rerollZoneEnemies(){
  state.enemySeed = (state.enemySeed || 0) + 1;
  zoneEnemyCache = {};
  saveState();
}
function npcActiveInWorld(n, world){
  if(!n.hostile) return true; // NPCs amigables usan su propio campo `worlds` (o ninguno = siempre visibles)
  if(n.isBoss) return !!(n.worlds && n.worlds.includes(world));
  return getZoneEnemies(world).some(x => x.id === n.id);
}
function getRegularEnemyList(world){
  return getZoneEnemies(world);
}

function getVisiblePortals(){

    const world = state.game.world;
    const worldIndex = WORLD_ORDER.indexOf(world);

    // Si el mundo actual no está en la progresión lineal (ej: 'shop'),
    // no hay portales que mostrar — mismo comportamiento que el default
    // del switch/case anterior.
    if(worldIndex === -1) return [];

    const portals = [];

    const nextWorldId = WORLD_ORDER[worldIndex + 1];
    if(nextWorldId){
        const exit = WORLD_EXIT_PORTALS[world];
        if(exit){
            portals.push({
                id: nextWorldId,
                x: exit.x, y: exit.y, w: exit.w, h: exit.h,
                label: worldDisplayName(nextWorldId),
                topic: worldTopicLabel(nextWorldId),
                kind: 'portal',
                boss: exit.boss
            });
        }
    }

    portals.push({
        id: 'shop',
        x: SHOP_PORTAL.x, y: SHOP_PORTAL.y, w: SHOP_PORTAL.w, h: SHOP_PORTAL.h,
        label: worldDisplayName('shop'),
        topic: worldTopicLabel('shop'),
        kind: 'shop'
    });

    return portals;
}
function currentWorldDef(){ return WORLD_DEFS.find(w => w.id === state.game.world) || WORLD_DEFS[0]; }

// Reemplaza la vieja cadena de comparaciones hardcodeadas ("sql" necesita
// "intro" derrotado, "rel" necesita "sqlboss", etc). Ahora se deduce solo:
// una zona está bloqueada por progreso si el jefe de salida de la zona
// ANTERIOR en WORLD_ORDER todavía no fue derrotado. El primer mundo
// (índice 0) nunca está bloqueado por progreso, y cualquier id que no
// forme parte de la progresión lineal (ej: 'shop') tampoco lo está.
function isWorldProgressLocked(worldId){
  const index = WORLD_ORDER.indexOf(worldId);
  if(index <= 0) return false;

  const previousWorld = WORLD_ORDER[index - 1];
  const requiredBoss = WORLD_EXIT_PORTALS[previousWorld] && WORLD_EXIT_PORTALS[previousWorld].boss;
  if(!requiredBoss) return false;

  return !state.bossesDefeated.includes(requiredBoss);
}

// El jefe "propio" de una zona es el único NPC boss cuyo array `worlds`
// incluye esa zona (ver MAP.npcs). Sirve tanto para el Castillo (dragon),
// que no tiene entrada en WORLD_EXIT_PORTALS por ser la última zona, como
// para el resto. 'shop' no tiene jefe propio: devuelve null.
function worldOwnBossId(worldId){
  const bossNpc = MAP.npcs.find(n => n.isBoss && Array.isArray(n.worlds) && n.worlds.includes(worldId));
  return bossNpc ? bossNpc.id : null;
}
function isWorldBossDefeated(worldId){
  const bossId = worldOwnBossId(worldId);
  return !!bossId && (state.bossesDefeated || []).includes(bossId);
}

// Viaje rápido a una zona ya desbloqueada: lo usan tanto los botones
// chicos de "Mapa rápido" (worldGrid) como los nodos del mapa expandido
// (worldMapDiagram). Antes esta lógica estaba duplicada adentro del
// listener de worldGrid, y llamaba a generateZoneSpawns(id), una función
// que no existe en ningún lado del archivo: tiraba un ReferenceError no
// capturado que cortaba la ejecución ahí mismo, así que el reset de
// posición, refreshGameHud() y syncWorldButtons() de más abajo nunca
// llegaban a correr. Se saca esa llamada rota.
function travelToWorld(id){
  state.game.world = id;
  state.game.x = 120;
  state.game.y = 120;
  state.game.scene = "map";
  addGameLog(`📍 Mundo: ${worldDisplayName(id)}`);

  // El Mercado ('shop') es una zona chica/placeholder: no tiene monedas
  // (ver MAP.coins, sin entrada 'shop') ni enemigos propios, solo al
  // mercader. Se avisa al entrar para que no parezca un bug que esté
  // casi vacía.
  if(id === 'shop'){
    showMapBanner('🚧 Zona en progreso: todavía se está construyendo el resto del Mercado.', 5000);
  }

  refreshGameHud();
  syncWorldButtons();
  saveState();
}

// ===================== MAPA DE ZONAS EXPANDIDO (modal) =====================
// Versión expandida del panel chico "Mapa rápido": dibuja las zonas de
// WORLD_ORDER conectadas por "puentes" (uno por cada portal de salida
// real, ver WORLD_EXIT_PORTALS), más la Tienda aparte como rama sin
// bloqueos. Reusa isWorldProgressLocked / isWorldBossDefeated /
// travelToWorld, así que el estado (bloqueado / actual / vencido) es
// siempre el mismo que el panel chico y que el mapa en sí.
function worldMapNodeHtml(worldId){
  const worldDef = WORLD_DEFS.find(d => d.id === worldId) || {};
  const levelLocked = state.hero.level < (worldDef.minLevel || 1);
  const progressLocked = isWorldProgressLocked(worldId);
  const locked = levelLocked || progressLocked;
  const active = state.game.world === worldId;
  const done = isWorldBossDefeated(worldId);
  const theme = (GAME_THEME.worlds && GAME_THEME.worlds[worldId]) || {};
  const worldName = worldDisplayName(worldId).replace(/^\S+\s/, ''); // saca el emoji del título, ya ponemos el propio acá

  let sub;
  if(locked) sub = `🔒 Nivel ${worldDef.minLevel || 1}`;
  else if(active) sub = 'Estás acá';
  else if(done) sub = 'Jefe vencido';
  else sub = 'Disponible';

  return `<div class="worldMapNode ${active ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}" data-world="${worldId}">
    <span class="wmIcon">${done ? '✅' : (theme.icon || '📍')}</span>
    <span class="wmName">${escapeHtml(worldName)}</span>
    <span class="wmSub">${escapeHtml(sub)}</span>
  </div>`;
}
function worldMapBridgeHtml(toWorldId){
  // El puente queda "cruzado" (verde) una vez que la zona a la que lleva
  // ya no está bloqueada por progreso, o sea, cuando ya derrotaste al
  // jefe que lo custodia.
  const crossed = !isWorldProgressLocked(toWorldId);
  return `<div class="worldMapBridge ${crossed ? 'crossed' : ''}"><span class="wmBridgeIcon">${crossed ? '🌉' : '🔒'}</span></div>`;
}
function renderWorldMapDiagram(){
  const container = document.getElementById('worldMapDiagram');
  if(!container) return;

  let html = '<div class="worldMapRow">';
  WORLD_ORDER.forEach((w, i) => {
    html += worldMapNodeHtml(w);
    if(i < WORLD_ORDER.length - 1) html += worldMapBridgeHtml(WORLD_ORDER[i+1]);
  });
  html += '</div>';

  html += `<div class="worldMapShopBranch">
    <span class="tiny">🛒 La Tienda no forma parte del camino principal: se puede visitar desde cualquier zona, sin bloqueos.</span>
    ${worldMapNodeHtml('shop')}
  </div>`;

  container.innerHTML = html;

  container.querySelectorAll('[data-world]').forEach(node => {
    node.addEventListener('click', () => {
      if(node.classList.contains('locked')) return;
      travelToWorld(node.dataset.world);
      closeWorldMapModal();
    });
  });
}
function openWorldMapModal(){
  renderWorldMapDiagram();
  document.getElementById('worldMapOverlay')?.classList.add('open');
}
function closeWorldMapModal(){
  document.getElementById('worldMapOverlay')?.classList.remove('open');
}

function syncWorldButtons(){
  els.worldGrid.innerHTML = WORLD_DEFS.map((w, idx) => {
    // Antes esto marcaba ✅ con solo haber PISADO la zona
    // (state.game.visited), aunque no hubieras vencido a su jefe. Ahora
    // el check solo aparece cuando el jefe propio de la zona ya está
    // derrotado (ver isWorldBossDefeated). 'shop' no tiene jefe propio,
    // así que nunca muestra ✅ (tiene sentido: no hay nada que "vencer" ahí).
    const done = isWorldBossDefeated(w.id);
    const active = state.game.world === w.id;
    const levelLocked = state.hero.level < (w.minLevel || 1);

    const progressLocked = isWorldProgressLocked(w.id);

    const locked = levelLocked || progressLocked;

    const worldName = worldDisplayName(w.id);

    const label = locked
        ? `${worldName} 🔒`
        : done
            ? `✅ ${worldName}`
            : worldName;
    return `<button class="worldNode ${active ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}" data-world="${w.id}" ${locked ? 'disabled' : ''}>${escapeHtml(label)}</button>`;
  }).join('');
  els.worldGrid.querySelectorAll('[data-world]').forEach(btn => {
    btn.addEventListener('click', () => {
        if(btn.disabled) return;
        travelToWorld(btn.dataset.world);
    });
  });
}

function checkLevelUp(){
  let leveled = false;
  let need = 100 + (state.hero.level-1)*60;
  while(state.hero.xp >= need){
    state.hero.xp -= need;
    state.hero.level += 1;
    addGameLog(`⬆ Subiste a nivel ${state.hero.level}`);
    beep(900,.08,'triangle',.03);
    pulseFx('level');
    leveled = true;
    need = 100 + (state.hero.level-1)*60;
  }
  if(leveled){
    showMapBanner(`⬆ ¡Subiste a nivel ${state.hero.level}!`);
    syncWorldButtons();
  }
  if(els.hudXp) refreshGameHud();
  return leveled;
}

// ===================== EMBOSCADAS =====================
// Probabilidad, por cada "decisión" de movimiento de un enemigo (cada
// ~35-75 frames), de que emboscada al héroe si lo tiene cerca. Baja a
// propósito: es un evento ocasional, no algo que interrumpa
// constantemente la exploración.
const AMBUSH_CHANCE = 0.035;
// Radio (en píxeles) dentro del cual un enemigo puede notar al héroe
// y emboscarlo. MAP.tileSize suele ser 48, así que esto son ~4 casilleros.
const AMBUSH_RADIUS = 190;

// Radio a partir del cual se cancela automáticamente un encuentro
// pendiente que el propio jugador disparó acercándose a un enemigo
// (con "E"), si después se aleja lo suficiente sin elegir Combate ni
// Huir. Es más grande que el radio de activación (36px en
// interactAtPosition) para no cancelar por un movimiento mínimo, pero
// lo bastante chico como para que "irte" realmente signifique irte.
// Las emboscadas (pendingEncounterIsAmbush === true) NO se cancelan
// así: ese enemigo ya te "vio", alejarte no debería borrar el aviso.
const ENCOUNTER_CANCEL_DISTANCE = 140;

function updateGameScene(){
  if(!state.game) return;

  // Si hay un encuentro pendiente que el jugador mismo activó (no una
  // emboscada) y ahora está lejos del enemigo que lo originó, se
  // desactiva el gatillo: se ocultan tanto los botones de Combate/Huir
  // del panel lateral como los táctiles flotantes sobre el canvas.
  if(pendingEncounter && !pendingEncounterIsAmbush){
    const enemyDist = dist(
      state.game.x, state.game.y,
      pendingEncounter.x * MAP.tileSize, pendingEncounter.y * MAP.tileSize
    );
    if(enemyDist > ENCOUNTER_CANCEL_DISTANCE){
      addGameLog(`🚶 Te alejaste de ${enemyDisplayName(pendingEncounter)}, el encuentro se canceló.`);
      hideEncounterPrompt();
    }
  }
  
  // 1. Calculamos la velocidad base original (escala con tu nivel)
  let baseSpeed = 2.5 + (state.hero.level * 0.03);

  // 2. Revisamos si hay botas equipadas que den bonus de velocidad.
  // Se revisa el slot 'boots' (no 'accessory'): ahí es donde se
  // equipan las Botas Velocista. El requisito de nivel 16 solo se
  // exige al COMPRARLAS (ver renderShop/hasLevel); una vez compradas
  // y equipadas, el bonus se aplica siempre que sigan en
  // state.equipment.boots, sin importar el nivel actual — así, si
  // reseteás el progreso (bajando de nivel) pero NO tildaste "borrar
  // también el inventario, equipamiento y trofeos", las botas siguen
  // equipadas (resetAll() preserva equipment/ownedEquipment por
  // defecto) y el bonus sigue funcionando igual.
  let speedBonus = 0;
  if (state.equipment && state.equipment.boots) {
      const bootsItem = EQUIPMENT_ITEMS.find(i => i.id === state.equipment.boots);
      if (bootsItem && bootsItem.bonus && bootsItem.bonus.speedMult) {
          speedBonus = bootsItem.bonus.speedMult; // Sumará 0.25 con las Botas Velocista
      }
  }

  // 3. Multiplicamos la base por el bonus
  const speed = baseSpeed * (1 + speedBonus);

  // 4. Movemos al personaje con la velocidad final
  if(keys.left) state.game.x -= speed;
  if(keys.right) state.game.x += speed;
  if(keys.up) state.game.y -= speed;
  if(keys.down) state.game.y += speed;
  // No re-chequeamos isLikelyMobileDevice() acá: si state.joystickEnabled
  // es true es porque el usuario lo activó a propósito (ver
  // __DBQUEST_TOGGLE_JOYSTICK__), y basta con eso — total la fila del
  // toggle ya está oculta en desktop real por CSS/syncMobileDetection.
  if(state.joystickEnabled && (joystickMoveX || joystickMoveY)){
    state.game.x += joystickMoveX * speed;
    state.game.y += joystickMoveY * speed;
  }
  
  state.game.x = clamp(state.game.x, 24, MAP.worldWidth * MAP.tileSize - 24);
  state.game.y = clamp(state.game.y, 24, MAP.worldHeight * MAP.tileSize - 24);

  const worldCoins = MAP.coins[state.game.world] || [];

  let progressChanged = false;
  for(const c of worldCoins){
    if(!c.taken){
      const cx = c.x * MAP.tileSize + 20;
      const cy = c.y * MAP.tileSize + 20;
      if(dist(state.game.x, state.game.y, cx, cy) < 28){
        c.taken = true;
        state.hero.coins += 5;
        state.hero.maxCoins = Math.max(state.hero.maxCoins, state.hero.coins);
        addGameLog('🪙 Moneda recolectada');
        beep(760, .05, 'sine', .02);
        progressChanged = true;
      }
    }
  }
  // Movimiento simple de enemigos
  for(const n of MAP.npcs){

      if(!n.hostile) continue;
      if(n.isBoss) continue;
      if(!npcActiveInWorld(n, state.game.world)) continue;
      if(state.defeatedNpcs.includes(n.id)) continue;

      // Inicializar posición original
      if(n.spawnX === undefined){
          n.spawnX = n.x;
          n.spawnY = n.y;
      }

      // Cooldown
      if(n.moveCooldown === undefined)
          n.moveCooldown = 0;

      if(n.moveCooldown > 0){
          n.moveCooldown--;
          continue;
      }

      // Esperar entre movimientos
      n.moveCooldown = 35 + Math.floor(Math.random()*40);

      // ---- Emboscada ----
      // Cada vez que a un enemigo le toca "decidir" (cooldown en 0),
      // si el héroe está cerca hay una probabilidad baja de que note
      // su presencia y lo emboscada directamente, sin esperar a que
      // el jugador presione E. No se acumulan dos emboscadas a la vez
      // ni se emboscada a un enemigo con el que ya hay un encuentro
      // pendiente.
      if(
          !pendingEncounter &&
          dist(state.game.x, state.game.y, n.x*MAP.tileSize, n.y*MAP.tileSize) < AMBUSH_RADIUS &&
          Math.random() < AMBUSH_CHANCE
      ){
          showEncounterPrompt(n, true);
          continue;
      }

      // Movimiento aleatorio
      const dx = Math.floor(Math.random()*3) - 1;
      const dy = Math.floor(Math.random()*3) - 1;

      const nx = n.x + dx;
      const ny = n.y + dy;

      // No alejarse demasiado del spawn
      if(
          Math.abs(nx - n.spawnX) <= 2 &&
          Math.abs(ny - n.spawnY) <= 2
      ){
          n.x = clamp(nx,1,MAP.worldWidth-2);
          n.y = clamp(ny,1,MAP.worldHeight-2);
      }
  }
  state.hero.xp += Math.random() < 0.01 ? 1 : 0;
  const leveled = checkLevelUp();
  refreshGameHud();
  // Guardado puntual (no cada frame): solo cuando pasó algo que de verdad
  // hay que persistir. El resto del progreso queda cubierto por el
  // autoguardado periódico de más abajo (ver initGameAutosave).
  if(progressChanged || leveled) saveState();
}
// ===================== BANNERS TEMPORALES DEL MAPA =====================
// El panel de ayuda de controles (WASD/E/Esc) y los avisos de "subiste
// de nivel" / "venciste al jefe" comparten el mismo cartel, abajo del
// mapa: solo uno se muestra a la vez, con esta prioridad:
//   1) Si hay banners activos (nivel/jefe recién ganado) → se muestran
//      ellos, hasta 2 líneas, y desaparecen solos pasados unos segundos.
//   2) Si no, y todavía no pasó el primer minuto desde que se vio el
//      mapa por primera vez en esta sesión → se muestra la ayuda de
//      controles.
//   3) Pasado ese minuto y sin banners activos, no se dibuja nada ahí.
let controlsHintUntil = null;
let mapBanners = [];

function showMapBanner(text, durationMs = 3200){
  mapBanners.push({ text, until: Date.now() + durationMs });
  // Como mucho 2 líneas visibles a la vez (mismo alto que el cartel de controles).
  if(mapBanners.length > 2) mapBanners.shift();
}

function drawGameScene(){

  const world = currentWorldDef();
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, world.color1);
  grad.addColorStop(1, world.color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);

  const tile = 48;
  const mapW = MAP.worldWidth * tile;
  const mapH = MAP.worldHeight * tile;
  const camX = clamp(state.game.x - w/2, 0, mapW - w);
  const camY = clamp(state.game.y - h/2, 0, mapH - h);

  ctx.globalAlpha = .14;
  for(let i=0;i<42;i++){
    const sx = (i*157 + camX*0.25) % w;
    const sy = (i*97 + camY*0.18) % h;
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;

  const startCol = Math.floor(camX / tile);
  const endCol = Math.ceil((camX + w) / tile);
  const startRow = Math.floor(camY / tile);
  const endRow = Math.ceil((camY + h) / tile);
  for(let y=startRow; y<=endRow; y++){
    for(let x=startCol; x<=endCol; x++){
      const screenX = x * tile - camX;
      const screenY = y * tile - camY;
      const alt = ((x+y) % 7 === 0);
      ctx.fillStyle = alt ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.015)';
      ctx.fillRect(screenX, screenY, tile, tile);
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.strokeRect(screenX, screenY, tile, tile);
    }
  }

for(const p of getVisiblePortals()){
    const px = p.x * tile - camX;
    const py = p.y * tile - camY;
    const pw = p.w * tile;
    const ph = p.h * tile;
    ctx.save();
    const locked = p.boss && !state.bossesDefeated.includes(p.boss);
    ctx.fillStyle =
        locked
            ? "rgba(255,70,70,.12)"
            : p.kind==="shop"
                ? "rgba(100,229,200,.12)"
                : "rgba(124,140,255,.12)";

    ctx.strokeStyle =
        locked
            ? "#ff5555"
            : p.kind==="shop"
                ? "rgba(100,229,200,.55)"
                : "rgba(124,140,255,.55)";
    ctx.lineWidth = 2;
    roundedRect(px, py, pw, ph, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '800 15px system-ui, sans-serif';
    ctx.fillText(locked ? "🔒 " + p.label : p.label, px + 12, py + 24);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillText(p.topic, px + 12, py + 42);
    ctx.restore();
  }

  // 👇 NUEVO CHEQUEO DE ENEMIGOS EN MAPA PRINCIPAL
  state.defeatedGuestNpcs ??= [];
  
  for(const n of MAP.npcs){
    if(n.hostile ? !npcActiveInWorld(n, state.game.world) : (n.worlds && !n.worlds.includes(state.game.world)))
        continue;
        
    if(n.hostile){
        const isGuest = n.world && n.world !== state.game.world;
        const isDefeated = isGuest 
            ? state.defeatedGuestNpcs.includes(`${state.game.world}_${n.id}`)
            : state.defeatedNpcs.includes(n.id);
            
        if(isDefeated) continue;
    }
  // 👆 FIN NUEVO CHEQUEO

    const nx = n.x * tile - camX;
    const ny = n.y * tile - camY;
    if(n.hostile){
      ctx.fillStyle = 'rgba(255,109,138,.16)';
      ctx.strokeStyle = 'rgba(255,109,138,.6)';
    } else {
      ctx.fillStyle = 'rgba(255,211,107,.14)';
      ctx.strokeStyle = 'rgba(255,211,107,.45)';
    }
    roundedRect(nx, ny, 28, 28, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '11px system-ui, sans-serif';
    if(n.isBoss){
        ctx.fillText("👑", nx+5, ny+18);
    }else if(n.id === 'castle_pc'){
        ctx.fillText(allZoneBossesDefeated() ? "💻" : "🔒", nx+5, ny+18);
    }else{
        ctx.fillText(n.hostile ? "⚔️" : "NPC", nx+2, ny+18);
    }

    // Nombre flotante
    if(n.hostile){
      const label = enemyShortName(n);
      ctx.font = '700 10px system-ui, sans-serif';
      const labelWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      roundedRect(nx + 14 - labelWidth/2 - 4, ny - 17, labelWidth + 8, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(label, nx + 14 - labelWidth/2, ny - 6);
      ctx.font = '11px system-ui, sans-serif';
    }
  }

  const worldCoins = MAP.coins[state.game.world] || [];

  for(const c of worldCoins){
    if(c.taken) continue;
    const cx = c.x * tile - camX + 20;
    const cy = c.y * tile - camY + 20;
    ctx.fillStyle = 'rgba(255,211,107,.85)';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.stroke();
  }

  const px = state.game.x - camX;
  const py = state.game.y - camY;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#64e5c8';
  ctx.beginPath();
  ctx.arc(px, py, 12, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '900 24px system-ui, sans-serif';
  ctx.fillText(worldDisplayName(world.id), 24, 36);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.fillText(`${worldTopicLabel(world)} · Escena ${state.game.scene}`, 24, 58);

  const miniScale = state.minimapScale || 1;
  const miniW = 220 * miniScale, miniH = 150 * miniScale, ox = w - miniW - 18, oy = 18;
  ctx.save();
  ctx.globalAlpha = .95;
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  roundedRect(ox, oy, miniW, miniH, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.stroke();
  const scaleX = miniW / mapW;
  const scaleY = miniH / mapH;
for(const p of getVisiblePortals()){
    ctx.fillStyle = p.kind === 'shop' ? 'rgba(100,229,200,.8)' : 'rgba(124,140,255,.8)';
    ctx.fillRect(ox + p.x*tile*scaleX, oy + p.y*tile*scaleY, p.w*tile*scaleX, p.h*tile*scaleY);
  }
  ctx.fillStyle = '#61e38d';
  ctx.beginPath();
  ctx.arc(ox + state.game.x*scaleX, oy + state.game.y*scaleY, 4, 0, Math.PI*2);
  ctx.fill();

  // 👇 NUEVO CHEQUEO DE ENEMIGOS EN EL MINI-MAPA
  for(const n of MAP.npcs){

    if(!n.hostile) continue;
    if(!npcActiveInWorld(n, state.game.world)) continue;

    const isGuest = n.world && n.world !== state.game.world;
    const isDefeated = isGuest 
        ? state.defeatedGuestNpcs.includes(`${state.game.world}_${n.id}`)
        : (state.defeatedNpcs || []).includes(n.id);
        
    if(isDefeated) continue;
  // 👆 FIN NUEVO CHEQUEO EN MINI-MAPA

    const miniX = ox + n.x * tile * scaleX;
    const miniY = oy + n.y * tile * scaleY;

    if(n.isBoss){
        ctx.font = "12px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.fillText("👑", miniX - 5, miniY + 4);
    }else{
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(miniX, miniY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
  ctx.restore();

  if(controlsHintUntil === null){
    controlsHintUntil = Date.now() + 60000;
  }

  const now = Date.now();
  mapBanners = mapBanners.filter(b => now < b.until);

  const showBanners = mapBanners.length > 0;
  const showControlsHint = !showBanners && now < controlsHintUntil;

  if(showBanners || showControlsHint){
    const boxX = 18;
    const boxWidth = 640;
    const textX = boxX + 16;
    const maxTextWidth = boxWidth - 32;
    const lineHeight = 20;
    const paddingTop = 26;
    const paddingBottom = 16;

    const mobileHelp = isLikelyMobileDevice();
    const entries = showBanners
      ? [
          { text: mapBanners[0].text, font: '700 15px system-ui, sans-serif', color: '#fff' },
          ...(mapBanners[1] ? [{ text: mapBanners[1].text, font: '700 13px system-ui, sans-serif', color: 'rgba(255,255,255,.85)' }] : [])
        ]
      : mobileHelp
        ? [
            { text: 'Apretá donde quieras moverte o usá el joystick en pantalla.', font: '700 15px system-ui, sans-serif', color: '#fff' },
            { text: 'Usá "E" para interactuar.', font: '13px system-ui, sans-serif', color: 'rgba(255,255,255,.7)' }
          ]
        : [
            { text: 'WASD / flechas para moverte · E para interactuar · M para ver el mapa', font: '700 15px system-ui, sans-serif', color: '#fff' },
            { text: 'Los portales abren escenas: tienda, jefes (combate) y zonas de estudio.', font: '13px system-ui, sans-serif', color: 'rgba(255,255,255,.7)' }
          ];

    const wrappedLines = [];
    entries.forEach(entry => {
      ctx.font = entry.font;
      wrapCanvasText(entry.text, maxTextWidth).forEach(line => {
        wrappedLines.push({ text: line, font: entry.font, color: entry.color });
      });
    });

    const boxHeight = Math.max(
      72,
      paddingTop + (wrappedLines.length - 1) * lineHeight + paddingBottom + 4
    );
    const boxBottom = h - 32;
    const boxTop = boxBottom - boxHeight;

    ctx.fillStyle = 'rgba(0,0,0,.23)';
    roundedRect(boxX, boxTop, boxWidth, boxHeight, 16);
    ctx.fill();

    let ty = boxTop + paddingTop;
    wrappedLines.forEach(line => {
      ctx.font = line.font;
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, textX, ty);
      ty += lineHeight;
    });
  }
}
// Corta un texto en varias líneas para que entre en maxWidth, usando
// la fuente ya seteada en ctx (el llamador debe setear ctx.font antes).
// Se usa para los carteles del canvas (banners), que antes se
// desbordaban hacia la derecha con textos largos.
function wrapCanvasText(text, maxWidth){
  const words = String(text).split(' ');
  const lines = [];
  let current = '';

  for(const word of words){
    const test = current ? `${current} ${word}` : word;
    if(current && ctx.measureText(test).width > maxWidth){
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if(current) lines.push(current);

  return lines;
}

function roundedRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function startMusic(kind = 'zone'){
  stopMusic();
  if(state.sound !== 'on') return;
  try{ audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); }catch{ return; }

  // Música de combate: patrón más grave y más rápido (sawtooth), para que
  // se sienta más tenso que el tema tranquilo que suena explorando el mapa
  // (triangle). Antes startMusic() se llamaba igual al entrar a Combate,
  // pero el intervalo solo sonaba si la sección "game" (mapa) estaba
  // activa, así que en combate quedaba en silencio.
  const isBattle = kind === 'battle';
  const pattern = isBattle
    ? [220,261,220,196,220,261,294,261]
    : [262,330,392,330,294,330,392,440];
  const activeSectionId = isBattle ? 'battle' : 'game';
  const tempoMs = isBattle ? 150 : 220;
  const waveType = isBattle ? 'sawtooth' : 'triangle';
  const gainLevel = isBattle ? 0.014 : 0.018;

  let idx = 0;
  musicTimer = setInterval(() => {
    if(!document.getElementById(activeSectionId)?.classList.contains('active')) return;
    try{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = waveType;
      o.frequency.value = pattern[idx % pattern.length];
      g.gain.value = gainLevel;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.12);
      idx++;
    }catch{}
  }, tempoMs);
}
function stopMusic(){
  if(musicTimer){ clearInterval(musicTimer); musicTimer = null; }
}

function initGameScene(){
  state.game = state.game || clone(stateDefaults.game);
  state.game.scene = 'map';
  state.game.world = state.game.world || 'forest';
  state.game.visited = state.game.visited || ['forest'];
  if(typeof state.game.x !== 'number') state.game.x = 120;
  if(typeof state.game.y !== 'number') state.game.y = 120;
  syncWorldButtons();
  refreshGameHud();
  renderGameLog();
  resizeCanvas();
}
function initGameLoop(){
  cancelAnimationFrame(gameTimer);
  const tick = () => {
    gameTimer = requestAnimationFrame(tick);
    if(document.getElementById('game').classList.contains('active')){
      if(!gamePaused) updateGameScene();
      drawGameScene();
    }
  };
  gameTimer = requestAnimationFrame(tick);
}
// Autoguardado periódico: además de los saveState() puntuales que ya
// están repartidos por el código (comprar algo, subir de nivel, etc.),
// esto asegura que la posición/exploración también quede guardada aunque
// el jugador esté simplemente caminando por el mapa sin recolectar nada,
// pero sin escribir en localStorage 60 veces por segundo como antes.
let gameAutosaveInterval = null;
function initGameAutosave(){
  clearInterval(gameAutosaveInterval);
  gameAutosaveInterval = setInterval(() => {
    if(document.getElementById('game')?.classList.contains('active')) saveState();
  }, 4000);
}
window.addEventListener('beforeunload', () => { try { saveState(); } catch(e){} });

let pendingEncounter = null;
let pendingEncounterIsAmbush = false;

function showEncounterPrompt(n, isAmbush = false){

  pendingEncounter = n;
  pendingEncounterIsAmbush = isAmbush;

  if(isAmbush){
    // El aviso de la emboscada va al log Y al cartel del canvas, igual
    // que los diálogos de los NPCs amigables (guía, comerciante, PC
    // del Castillo): "💬 ..." en el mismo lugar donde aparecen esos
    // diálogos (el mismo cartel que muestra la ayuda de WASD/E/Esc),
    // no como texto especial dentro del panel de encuentro.
    const ambushMsg = `💬 ¡${enemyDisplayName(n)} te emboscó! Te tomó por sorpresa: si huís vas a perder algo de XP.`;
    addGameLog(ambushMsg);
    showMapBanner(ambushMsg, 7200);
    state.game.scene = 'dialog';
  } else {
    addGameLog(`👀 ${enemyDisplayName(n)} te bloquea el paso.`);
  }

  // El panel de encuentro (con los botones de Combate/Huir) siempre
  // muestra el mismo nombre y descripción, sea emboscada o no.
  els.encounterName.textContent = enemyDisplayName(n);
  els.encounterDesc.textContent = n.desc || 'Un enemigo aparece en tu camino.';
  els.encounterPanel.classList.remove('hidden');
  els.encounterPanelMobile?.classList.remove('hidden');
  refreshGameHud();
}

function hideEncounterPrompt(){
  // Si era una emboscada, el cartel del canvas desaparece apenas el
  // jugador elige una opción (Combate o Huir), en vez de esperar a
  // que se cumpla su duración normal.
  if(pendingEncounterIsAmbush){
    mapBanners = [];
  }
  pendingEncounter = null;
  pendingEncounterIsAmbush = false;
  els.encounterPanel.classList.add('hidden');
  els.encounterPanelMobile?.classList.add('hidden');
}

function interactAtPosition(){
  if(!document.getElementById('game').classList.contains('active')) return;
  // Con un encuentro pendiente (voluntario o emboscada), "E" no hace
  // nada: el jugador tiene que elegir Combate o Huir desde el panel,
  // no puede esquivarlo interactuando con otra cosa.
  if(pendingEncounter) return;
  const tile = 48;
  const px = state.game.x;
  const py = state.game.y;


  // Prioridad 1: enemigo más cercano
  const enemy = MAP.npcs
      .filter(n =>
          n.hostile &&
          npcActiveInWorld(n, state.game.world) &&
          !state.defeatedNpcs.includes(n.id)
      )
      .sort((a, b) =>
          dist(px, py, a.x * tile, a.y * tile) -
          dist(px, py, b.x * tile, b.y * tile)
      )[0];

  if (enemy && dist(px, py, enemy.x * tile, enemy.y * tile) < 36) {
      showEncounterPrompt(enemy);
      return;
  }
  for(const p of getVisiblePortals()){
    const bx = p.x * tile + 18;
    const by = p.y * tile + 18;
    const bw = p.w * tile - 36;
    const bh = p.h * tile - 36;
    if(px >= bx && px <= bx + bw && py >= by && py <= by + bh){
    if(p.kind !== 'shop'){

          const worldDef = WORLD_DEFS.find(w => w.id === p.id);
          const minLevel = worldDef ? (worldDef.minLevel || 1) : 1;

          const needLevel = state.hero.level < minLevel;
          const needBoss = p.boss && !state.bossesDefeated.includes(p.boss);

          if(needLevel || needBoss){

              if(needLevel && needBoss){
                  addGameLog(`🔒 Necesitás nivel ${minLevel} y derrotar al jefe de esta zona.`);
              }else if(needLevel){
                  addGameLog(`🔒 Necesitás nivel ${minLevel}.`);
              }else{
                  addGameLog("👑 Primero derrotá al jefe de esta zona.");
              }

              pulseFx("bad");
              return;
          }
      }
      state.game.scene = 'dialog';
      state.game.visited = Array.from(new Set([...(state.game.visited || []), p.id]));
      if(p.kind === 'shop'){
        addGameLog('🛒 Entraste a la tienda.');
        saveState();
        renderShop();
        go('shop');
        return;
      }
      
      // Eliminamos el if(p.id === 'boss') para que permita cargar el mapa.
      
      if(!state.completedWorlds) state.completedWorlds = [];
      if(!state.completedWorlds.includes(state.game.world)) state.completedWorlds.push(state.game.world);

      state.game.world = p.id;

      // Coordenadas de inicio seguras al entrar a la nueva zona.
      state.game.x = 120;
      state.game.y = 120;

      addGameLog(`📦 Portal: ${p.label}`);

      refreshGameHud();
      syncWorldButtons();

      saveState();

      return;
    }
  }
  // Prioridad 2: NPC amigables
  for (const n of MAP.npcs) {
      if (n.hostile) continue;
      if (n.worlds && !n.worlds.includes(state.game.world)) continue;
      const nx = n.x * tile;
      const ny = n.y * tile;

      if (dist(px, py, nx, ny) >= 36) continue;

      // La PC del Castillo tiene lógica propia (diálogo distinto según
      // si ya derrotaste a todos los jefes, y abre el combate final).
      if (n.id === 'castle_pc') {
          handleCastlePcInteraction();
          return;
      }

      // El mercader, igual que castle_pc con el combate, abre
      // directamente la pantalla de Tienda al interactuar (antes solo
      // mostraba el diálogo "Bienvenido al Mercado." sin hacer nada más,
      // así que la única forma de comprar era caminar hasta el portal
      // de la tienda dentro de otra zona).
      if (n.id === 'merchant') {
          handleMerchantInteraction();
          return;
      }

      const dialogueText = npcDialogueText(n);
      if(!dialogueText) continue;

      addGameLog(`💬 ${dialogueText}`);
      showMapBanner(`💬 ${dialogueText}`, 4200);
      state.game.scene = 'dialog';
      refreshGameHud();
      saveState();
      return;
  }
  addGameLog('Nada cerca para interactuar.');
}

// Todos los jefes "de zona" (no el jefe final del Castillo) derrotados.
// Se basa en los NPCs reales del mapa (MAP.npcs), no en BOSS_DEFS, para
// que quede en sintonía con cómo se registran los combates jugados
// desde el mapa (única forma de combatir hoy en día).
function allZoneBossesDefeated(){
  return MAP.npcs
    .filter(n => n.isBoss)
    .every(n => (state.bossesDefeated || []).includes(n.id));
}

// "Completar el juego" = no queda ni un solo enemigo hostil (comunes o
// jefes) sin derrotar, en ninguna zona. finishBattle() agrega TODOS los
// NPCs vencidos (jefes incluidos) a state.defeatedNpcs, así que alcanza
// con comparar contra eso.
function isGameFullyCompleted(){
  return MAP.npcs
    .filter(n => n.hostile)
    .every(n => (state.defeatedNpcs || []).includes(n.id));
}

// Texto de diálogo de un NPC amigable. La mayoría usa su campo estático
// `text`, pero algunos NPCs especiales cambian su mensaje según el
// estado del juego (zona actual, progreso, etc.).
function npcDialogueText(n){
  if(n.id === 'guide'){
    if(state.game.world === 'boss'){
      return 'Creo que hay un tipo escondido por ahí que te puede ayudar, pero seguramente antes debas hacer algo.';
    }
    return n.text;
  }
  if(n.id === 'secret_helper'){
    return isGameFullyCompleted()
      ? 'Has demostrado ser un oponente digno para ST Quest, usa esto con precaución - CTRL + F11 -.'
      : 'Vuelve, cuando hayas completado el juego.';
  }
  return n.text;
}

// ===================== COMBATE PERSONALIZADO =====================
// Se abre desde el botón "⚔️ Combate personalizado" en la pantalla de
// Combate (al lado de Inventario). Ese botón está deshabilitado por
// HTML (disabled) hasta derrotar a todos los jefes de zona; renderBattle()
// lo habilita/deshabilita en cada render según allZoneBossesDefeated().
// pc_castle sigue llevando directo a la pantalla de Combate como antes
// (handleCastlePcInteraction) — el botón es un acceso aparte, no
// depende de haber interactuado con la Terminal. Por ahora deja elegir
// el jefe y un multiplicador sobre su cantidad base de preguntas (n.hp,
// ya que cada respuesta correcta le resta 1 de vida — o sea, hp ==
// cantidad de preguntas que hacen falta para vencerlo). El bloque
// "Próximamente" del modal queda listo para sumar más opciones después.
let customBattleBossId = null;
let customBattleMultiplier = 1.25;

function openCustomBattleModal(){
  if(!allZoneBossesDefeated()){
    addGameLog('🔒 Derrotá a todos los jefes de zona para desbloquear el combate personalizado.');
    return;
  }
  const bosses = MAP.npcs.filter(n => n.isBoss);
  if(!bosses.length) return;
  if(!customBattleBossId || !bosses.some(b => b.id === customBattleBossId)){
    customBattleBossId = bosses[0].id;
  }
  renderCustomBattleModal(bosses);
  document.getElementById('customBattleOverlay')?.classList.add('open');
}

function closeCustomBattleModal(){
  document.getElementById('customBattleOverlay')?.classList.remove('open');
}

function renderCustomBattleModal(bosses){
  const list = document.getElementById('customBattleBossList');
  if(list){
    list.innerHTML = bosses.map(b => `
      <button class="chip${b.id === customBattleBossId ? ' active' : ''}" data-boss-id="${b.id}" type="button">
        ${escapeHtml(enemyDisplayName(b))}
      </button>
    `).join('');
  }
  document.querySelectorAll('#customBattleMultiplier [data-mult]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.mult) === customBattleMultiplier);
  });
}

function startCustomBattle(){
  const bossDef = MAP.npcs.find(n => n.isBoss && n.id === customBattleBossId);
  if(!bossDef) return;

  const baseHp = bossDef.hp || 1;
  const hp = Math.max(1, Math.round(baseHp * customBattleMultiplier));

  closeCustomBattleModal();

  const started = beginEncounter({
    id: bossDef.id,
    // El jefe se elige desde el Castillo, pero sus preguntas tienen que
    // seguir siendo las de SU zona de origen (no las mezcladas del
    // Castillo) — por eso se fija acá en vez de dejar que beginEncounter
    // use state.game.world (que en este caso sería 'boss').
    originWorld: bossDef.worlds ? bossDef.worlds[0] : undefined,
    hp,
    rewardXp: bossDef.rewardXp,
    rewardCoins: bossDef.rewardCoins,
    desc: bossDef.desc,
    isBoss: true
  });

  if(started){
    addGameLog(`⚔️ Combate personalizado contra ${enemyDisplayName(bossDef)} (×${customBattleMultiplier} preguntas: ${hp}).`);
  }
}

function handleCastlePcInteraction(){
  const pc = MAP.npcs.find(n => n.id === 'castle_pc');

  if(!allZoneBossesDefeated()){
    const lockedText = pc?.textLocked || 'Terminal bloqueada.';
    addGameLog(`💬 ${lockedText}`);
    showMapBanner(`💬 ${lockedText}`, 4200);
    state.game.scene = 'dialog';
    refreshGameHud();
    saveState();
    return;
  }

  const unlockedText = pc?.textUnlocked || 'Núcleo activado.';
  addGameLog(`💬 ${unlockedText}`);
  showMapBanner(`💬 ${unlockedText}`, 4200);
  saveState();
  renderBattle();
  go('battle');
}

// El mercader (npc 'merchant'): muestra su diálogo y abre la Tienda,
// igual que hacer lo mismo caminando hasta SHOP_PORTAL en cualquier
// otra zona (ver 'Prioridad 1... p.kind === "shop"' en
// interactAtPosition), solo que ahora también funciona interactuando
// con él directamente en el mapa del Mercado.
function handleMerchantInteraction(){
  const merchant = MAP.npcs.find(n => n.id === 'merchant');
  const text = merchant?.text || 'Bienvenido al Mercado.';
  addGameLog(`💬 ${text}`);
  showMapBanner(`💬 ${text}`, 4200);
  addGameLog('🛒 Entraste a la tienda.');
  state.game.visited = Array.from(new Set([...(state.game.visited || []), 'shop']));
  saveState();
  renderShop();
  go('shop');
}
// ===================== INSTRUCCIONES (Inicio) =====================
// Botón "📖 Instrucciones" en Inicio: despliega un mini-panel con dos
// botones, cada uno previsualiza un .txt distinto (instrucciones.txt e
// instruccionesdiagrams.txt) dentro de un <iframe>.
//
// OJO: esto NO usa fetch() a propósito. Cuando este HTML se abre con
// doble clic (protocolo file://, sin servidor), fetch()/XHR a otros
// archivos locales queda bloqueado por el navegador (CORS), aunque el
// archivo esté en la misma carpeta — por eso antes tiraba el error
// "No se pudo cargar...". Un <iframe src="archivo.txt"> sí funciona
// con file://, porque es una navegación normal, no una petición fetch.
function toggleInstructionsFile(fileName, iframeEl){
  if(!iframeEl) return;
  const isOpen = iframeEl.style.display !== 'none';
  if(isOpen){
    iframeEl.style.display = 'none';
    return;
  }
  if(iframeEl.dataset.loaded !== '1'){
    iframeEl.src = fileName;
    iframeEl.dataset.loaded = '1';
  }
  iframeEl.style.display = '';
}

// El panel de Instrucciones es un mini "setup" de 2 pasos: paso 1 son
// las dos previsualizaciones de instrucciones, paso 2 la explicación
// de cómo elegir la materia. Cada vez que se vuelve a abrir el panel
// arranca desde el paso 1.
function resetInstructionsWizard(){
  const s1 = document.getElementById('instructionsStep1');
  const s2 = document.getElementById('instructionsStep2');
  if(s1) s1.style.display = '';
  if(s2) s2.style.display = 'none';
}

function bindEvents(){
  document.getElementById('heroKeyboard')?.addEventListener('click', e => {
    const btn = e.target.closest('.heroKey');
    if(!btn) return;
    const buttons = heroKeyboardButtons();
    const idx = buttons.indexOf(btn);
    if(idx !== -1){ heroKeySelected = idx; updateHeroKeySelection(); }
    const key = btn.dataset.key;
    if(key === '__space__'){
      if(heroNameDraft.length < HERO_NAME_MAX) heroNameDraft += ' ';
    } else if(key === '__back__'){
      heroNameDraft = heroNameDraft.slice(0, -1);
    } else if(heroNameDraft.length < HERO_NAME_MAX){
      heroNameDraft += key;
    }
    renderHeroNameDisplay();
  });
  document.getElementById('btnConfirmHeroName')?.addEventListener('click', confirmHeroName);
  document.getElementById('btnCancelHeroName')?.addEventListener('click', closeHeroNameModal);
  document.getElementById('btnChangeHeroName')?.addEventListener('click', () => openHeroNameModal(false));

  document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.nav)));
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      studyIndex = 0;
      studyAnswered = false;
      document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === currentView));
      renderStudy();
      renderBank();
    });
  });

  document.querySelectorAll('[data-theme-btn]').forEach(btn => btn.addEventListener('click', () => {
    state.theme = btn.dataset.themeBtn;
    document.body.dataset.theme = btn.dataset.themeBtn;
    saveState();
    document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.toggle('active', b.dataset.themeBtn === btn.dataset.themeBtn));
  }));
  document.querySelectorAll('[data-sound]').forEach(btn => btn.addEventListener('click', () => {
    state.sound = btn.dataset.sound;
    saveState();
    document.querySelectorAll('[data-sound]').forEach(b => b.classList.toggle('active', b.dataset.sound === btn.dataset.sound));
    if(state.sound !== 'on') stopMusic();
  }));
  if(els.resetWipesInventory){
    els.resetWipesInventory.checked = !!state.resetWipesInventory;
    els.resetWipesInventory.addEventListener('change', () => {
      state.resetWipesInventory = els.resetWipesInventory.checked;
      saveState();
    });
  }

  els.searchBox.addEventListener('input', () => { studyIndex = 0; studyAnswered = false; renderStudy(); renderBank(); });
  els.btnPrev.addEventListener('click', () => nextStudy(-1));
  els.btnNext.addEventListener('click', () => nextStudy(1));
  els.btnRandom.addEventListener('click', randomStudy);
  els.btnFavorite.addEventListener('click', toggleFavoriteCurrent);
  els.btnResetAll.addEventListener('click', resetAll);
  els.btnResetAllSettings?.addEventListener('click', resetAll);

  // Delegado del historial: tocar un examen abre su visor grande dentro de Ajustes.
  els.examHistoryBox?.addEventListener('click', e => {
    const item = e.target.closest('[data-history-index]');
    if(!item) return;
    openExamHistoryViewer(Number(item.dataset.historyIndex));
  });

  document.getElementById('btnCloseExamHistoryViewer')?.addEventListener('click', closeExamHistoryViewer);
  document.getElementById('examHistoryViewer')?.addEventListener('click', e => {
    if(e.target.id === 'examHistoryViewer') closeExamHistoryViewer();
  });

  els.lastExamBox?.addEventListener('click', e => {
    if(!e.target.closest('.lastExamItem')) return;
    lastExamExpanded = !lastExamExpanded;
    renderLastExam();
  });

  els.btnStartExam.addEventListener('click', startExam);
  els.btnExitExam?.addEventListener('click', exitExam);
  document.getElementById('btnToggleInstructions')?.addEventListener('click', () => {
    const panel = document.getElementById('instructionsPanel');
    if(!panel) return;
    const opening = panel.style.display === 'none';
    panel.style.display = opening ? '' : 'none';
    if(opening) resetInstructionsWizard();
  });
  document.getElementById('btnInstructionsBasic')?.addEventListener('click', () => {
    toggleInstructionsFile('instrucciones.txt', document.getElementById('instructionsBasicBody'));
  });
  document.getElementById('btnInstructionsDiagrams')?.addEventListener('click', () => {
    toggleInstructionsFile('instruccionesdiagrams.txt', document.getElementById('instructionsDiagramsBody'));
  });
  document.getElementById('btnInstructionsNext')?.addEventListener('click', () => {
    document.getElementById('instructionsStep1').style.display = 'none';
    document.getElementById('instructionsStep2').style.display = '';
  });
  document.getElementById('btnInstructionsBack')?.addEventListener('click', () => {
    document.getElementById('instructionsStep2').style.display = 'none';
    document.getElementById('instructionsStep1').style.display = '';
  });
  document.getElementById('btnInstructionsFinish')?.addEventListener('click', () => {
    const panel = document.getElementById('instructionsPanel');
    if(panel) panel.style.display = 'none';
    resetInstructionsWizard();
  });
  els.examCount?.addEventListener('change', () => {
    if(!els.examCountCustom) return;
    const isCustom = els.examCount.value === 'custom';
    els.examCountCustom.style.display = isCustom ? '' : 'none';
    if(isCustom) els.examCountCustom.focus();
  });
  document.getElementById('examTopicChips')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-exam-topic]');
    if(!btn) return;
    const val = btn.dataset.examTopic;
    if(val === '__all__'){
      examSelectedTopics.clear();
    } else {
      if(examSelectedTopics.has(val)) examSelectedTopics.delete(val);
      else examSelectedTopics.add(val);
      if(examSelectedTopics.size === TOPICS.length) examSelectedTopics.clear();
    }
    renderExamTopicSelect();
  });
  document.getElementById('examDifficultyChips')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-exam-difficulty]');
    if(!btn) return;
    const val = btn.dataset.examDifficulty;
    if(val === '__all__'){
      examSelectedDifficulties.clear();
    } else {
      const d = Number(val);
      if(examSelectedDifficulties.has(d)) examSelectedDifficulties.delete(d);
      else examSelectedDifficulties.add(d);
      if(examSelectedDifficulties.size === 5) examSelectedDifficulties.clear();
    }
    renderExamDifficultySelect();
  });
  els.btnSubmitExam.addEventListener('click', () => {
    finishExam();
    showExamConfigView();
  });
  els.btnPrevExam.addEventListener('click', prevExam);
  els.btnNextExam.addEventListener('click', nextExam);
  els.examOptions.addEventListener('click', e => {
    const btn = e.target.closest('.opt');
    if(!btn || !exam || exam.ended) return;
    const q = exam.deck[exam.index];
    const idx = Number(btn.dataset.idx);
    if(isMultiChoice(q)) answerExamMulti(idx); else answerExam(idx);
  });
  // Preguntas "diagram-click" en el examen: mismo patrón delegado que
  // Combate (ver bindSpecialPanels / #diagramContainer), un único listener
  // alcanza aunque el contenido de #examDiagramContainer cambie en cada
  // renderExam().
  els.examDiagram?.addEventListener('click', e => {
    if(!exam || exam.ended) return;
    const q = exam.deck[exam.index];
    if(!q || q.type !== 'diagram-click') return;
    const target = e.target.closest('[data-click-answer]');
    if(!target) return;
    answerExam(target.dataset.clickAnswer);
  });
  els.examQuestion.addEventListener('click', () => { if(exam) nextExam(); });

  els.btnSceneMenu.addEventListener('click', () => go('home'));
  els.btnSceneMap.addEventListener('click', openWorldMapModal);
  document.getElementById('btnGameHudToggle')?.addEventListener('click', toggleGameHudDrawer);
  document.getElementById('gameHudBackdrop')?.addEventListener('click', closeGameHudDrawer);
  document.getElementById('btnCloseWorldMap')?.addEventListener('click', closeWorldMapModal);
  document.getElementById('worldMapOverlay')?.addEventListener('click', e => {
    if(e.target.id === 'worldMapOverlay') closeWorldMapModal();
  });

  els.btnEncounterFight.addEventListener('click', () => {
    if(!pendingEncounter) return;
    const n = pendingEncounter;
    hideEncounterPrompt();
    beginEncounter({
      id: n.id,
      themeId: n.themeId,
      originWorld: n.originWorld,
      hp: n.hp,
      rewardXp: n.rewardXp,
      rewardCoins: n.rewardCoins,
      desc: n.desc,
      isBoss: n.isBoss || false
    });
  });
  els.btnEncounterFlee.addEventListener('click', () => {
    if(!pendingEncounter) return;
    const n = pendingEncounter;
    const wasAmbush = pendingEncounterIsAmbush;

    if(wasAmbush){
      // Penalización solo por huir de una EMBOSCADA (el enemigo te
      // atacó primero); rechazar un encuentro normal -iniciado con E-
      // sigue siendo gratis. 10% base + 1.5% extra por cada zona de
      // distancia en WORLD_ORDER (Bosque=0 → 10%, Lab=1 → 11.5%, ...).
      const zoneIndex = Math.max(0, zoneOrderIndex(state.game.world));
      const penaltyPct = 10 + zoneIndex * 1.5;
      const lost = Math.round(state.hero.xp * (penaltyPct / 100));

      state.hero.xp = Math.max(0, state.hero.xp - lost);

      addGameLog(
        `🏃 Escapaste de la emboscada de ${enemyDisplayName(n)}, pero perdiste ${lost} XP (${penaltyPct.toFixed(1)}%).`
      );

      refreshGameHud();
      saveState();
    } else {
      addGameLog(`🏃 Evitaste a ${enemyDisplayName(n)}.`);
    }

    hideEncounterPrompt();
  });
  els.btnEncounterFightMobile?.addEventListener('click', () => els.btnEncounterFight.click());
  els.btnEncounterFleeMobile?.addEventListener('click', () => els.btnEncounterFlee.click());

  bindSpecialPanels();

  window.addEventListener('keydown', e => {
    if(e.ctrlKey && (e.key === 'F11' || e.key === 'F22')){
      e.preventDefault();
      toggleDebugMenu();
      return;
    }
    if(document.getElementById('heroNameOverlay')?.classList.contains('open')){
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].includes(e.key)) e.preventDefault();
      if(e.key === 'ArrowLeft') moveHeroKeySelection(-1, 0);
      if(e.key === 'ArrowRight') moveHeroKeySelection(1, 0);
      if(e.key === 'ArrowUp') moveHeroKeySelection(0, -1);
      if(e.key === 'ArrowDown') moveHeroKeySelection(0, 1);
      if(e.key === 'Enter') pressHeroKeySelected();
      return;
    }
    if(isTypingTarget(document.activeElement)) return;

    const gameActive = document.getElementById('game')?.classList.contains('active');
    const battleActive = document.getElementById('battle')?.classList.contains('active');

    // En combate no se habilitan los atajos de Inventario, Tienda, Mapa,
    // movimiento ni Interactuar. Solamente Escape permite volver al Juego.
    if(battleActive){
      if(e.key === 'Escape'){
        e.preventDefault();
        if(document.getElementById('gameHud')?.classList.contains('open')) closeGameHudDrawer();
        else go('game');
      }
      return;
    }

    // Todos los demás atajos pertenecen exclusivamente a la sección Juego.
    if(!gameActive) return;

    if(e.key === 'ArrowLeft' || e.key.toLowerCase() === state.controls.left) keys.left = true;
    if(e.key === 'ArrowRight' || e.key.toLowerCase() === state.controls.right) keys.right = true;
    if(e.key === 'ArrowUp' || e.key.toLowerCase() === state.controls.up) keys.up = true;
    if(e.key === 'ArrowDown' || e.key.toLowerCase() === state.controls.down) keys.down = true;
    if(e.key.toLowerCase() === state.controls.interact) interactAtPosition();
    if(e.key.toLowerCase() === state.controls.map) openWorldMapModal();
    if(e.key.toLowerCase() === state.controls.inventory) go('inventory');
    if(e.key.toLowerCase() === state.controls.shop) go('shop');
    if(e.key === 'Escape'){
      if(document.getElementById('gameHud')?.classList.contains('open')) closeGameHudDrawer();
      else go('game');
    }
  });
  window.addEventListener('keyup', e => {
    if(document.getElementById('heroNameOverlay')?.classList.contains('open')) return;
    if(isTypingTarget(document.activeElement)) return;
    if(!document.getElementById('game')?.classList.contains('active')) return;
    if(e.key === 'ArrowLeft' || e.key.toLowerCase() === state.controls.left) keys.left = false;
    if(e.key === 'ArrowRight' || e.key.toLowerCase() === state.controls.right) keys.right = false;
    if(e.key === 'ArrowUp' || e.key.toLowerCase() === state.controls.up) keys.up = false;
    if(e.key === 'ArrowDown' || e.key.toLowerCase() === state.controls.down) keys.down = false;
  });

  window.addEventListener('resize', () => {
    syncMobileDetection();
    resizeCanvas();
    if(document.getElementById('game').classList.contains('active')) drawGameScene();
  });
}

// refreshGameHud() se llama en CADA frame del loop del juego (~60
// veces por segundo) mientras estás parado en la pantalla de Juego, así
// que acá dos cosas importan mucho para el rendimiento:
//  1) No tocar el DOM (textContent/style) si el valor no cambió. Cada
//     escritura, aunque sea al mismo valor, dispara una mutación real
//     que cualquier observador de la página (traductores del navegador,
//     extensiones, DevTools, etc.) tiene que volver a procesar.
//  2) No guardar en localStorage acá (ver saveState más abajo): eso se
//     movió a un autoguardado cada pocos segundos + puntos concretos
//     donde cambia algo importante, en vez de 60 veces por segundo.
const hudCache = {};
function setHudText(el, key, value){
  if(!el) return;
  const str = String(value);
  if(hudCache[key] === str) return;
  hudCache[key] = str;
  el.textContent = str;
}
function refreshGameHud(){

    setHudText(els.hudScene, 'scene', state.game.scene === "map" ? "Mapa" : state.game.scene);
    setHudText(els.hudPos, 'pos', `${Math.round(state.game.x)}, ${Math.round(state.game.y)}`);
    setHudText(els.hudCoins, 'coins', state.hero.coins);
    setHudText(els.hudXp, 'xp', state.hero.xp);
    setHudText(els.hudLevel, 'level', state.hero.level);
    if(els.hudLives) setHudText(els.hudLives, 'lives', 3 + Math.floor(state.hero.level / 4));

    const xpPct = `${Math.min(
            100,
            (state.hero.xp/(100+(state.hero.level-1)*60))*100
        )}%`;
    if(els.hudXpBar && hudCache.xpBar !== xpPct){
        hudCache.xpBar = xpPct;
        els.hudXpBar.style.width = xpPct;
    }

    const world = currentWorldDef();

    let title = worldDisplayName(world.id);

    if((state.completedWorlds || []).includes(world.id)){
        title = "✅ " + title;
    }

    setHudText(els.sceneName, 'sceneTitle', title);
}
function addGameLog(msg){
  state.game.log = state.game.log || [];
  state.game.log.unshift({ t:Date.now(), msg });
  state.game.log = state.game.log.slice(0, 8);
  saveState();
  renderGameLog();
}
function renderGameLog(){
  els.gameLog.innerHTML = (state.game.log || []).map(x => `<div class="logItem">${escapeHtml(x.msg)}</div>`).join('') || '<div class="logItem">Sin eventos todavía.</div>';
}

// Ancho fijo del panel lateral y separación entre columnas, tal cual
// están en el CSS de #gameLayoutRow (ver estilos más arriba). Se usan acá
// para calcular, sin dejar nunca que aparezca una scrollbar, si el canvas
// (agrandado por el zoom de Ajustes → Interfaz) todavía entra al lado del
// panel o si hay que ocultarlo.
const GAME_SIDEBAR_WIDTH = 340;
const GAME_LAYOUT_GAP = 16;
// Si al canvas, mostrado al lado del panel, le queda menos que esto de
// ancho, ya no vale la pena mostrarlo así (quedaría inservible aunque
// técnicamente "entre" sin generar scrollbar): directamente se colapsa
// el panel y se le da todo el ancho al canvas. Esto es lo que reemplaza
// al viejo breakpoint fijo por viewport: acá se mide el espacio real.
const GAME_MIN_CANVAS_WIDTH = 280;

function resizeCanvas(){
  const shellEl = canvas.parentElement; // .canvas-shell
  const section = document.getElementById('game');
  const gameRow = document.getElementById('gameLayoutRow');
  const mobile = isLikelyMobileDevice();

  // Importante: antes de medir el canvas, deshacemos cualquier ancho/columna
  // inline aplicado en el ciclo anterior. Así la medición parte siempre del
  // layout base y no del canvas ya expandido, evitando que x1.25/x1.5/x2 se
  // acumulen entre llamadas a resizeCanvas().
  if(gameRow && !mobile){
    gameRow.style.gridTemplateColumns = '';
    gameRow.style.width = '';
    gameRow.style.minWidth = '';
  } else if(gameRow && section?.classList.contains('hudCollapsed')){
    gameRow.style.gridTemplateColumns = '1fr';
    gameRow.style.width = '';
    gameRow.style.minWidth = '';
  }

  const wasCollapsed = section?.classList.contains('hudCollapsed');

  // Se mide siempre sobre el layout base. Cuando el HUD ya está colapsado en
  // móvil, el canvas ocupa toda la columna disponible, por lo que NO hay que
  // restarle nuevamente los 340px del panel.
  let normalShellWidth = shellEl.getBoundingClientRect().width;
  normalShellWidth = Math.max(0, normalShellWidth);

  const scale = state.canvasScale || 1;
  const desired = Math.max(160, Math.floor(normalShellWidth * scale));

  let w, fitsWithSidebar;
  if(mobile){
    // Primero comprobamos si el canvas entra junto al HUD. Si no entra,
    // colapsamos el HUD y volvemos a medir el canvas ya ocupando toda la
    // columna: esto evita que quede atrapado en el ancho reducido anterior.
    fitsWithSidebar = normalShellWidth >= GAME_MIN_CANVAS_WIDTH && desired <= normalShellWidth + 1;
    if(!fitsWithSidebar && gameRow){
      section?.classList.add('hudCollapsed');
      gameRow.style.gridTemplateColumns = '1fr';
      gameRow.style.width = '';
      gameRow.style.minWidth = '';
      const expandedShellWidth = shellEl.getBoundingClientRect().width;
      w = Math.min(desired, Math.max(160, expandedShellWidth));
    } else {
      w = Math.min(desired, Math.max(160, normalShellWidth));
    }
  } else {
    // En escritorio el canvas conserva exactamente la expansión de Pasted:
    // el ancho base se calcula antes de modificar la fila y luego se aplica
    // el multiplicador solo una vez.
    fitsWithSidebar = true;
    w = desired;
  }

  const h = Math.floor(w * 0.60);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.floor(w * DPR);
  canvas.height = Math.floor(h * DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);

  if(mobile){
    section?.classList.toggle('hudCollapsed', !fitsWithSidebar);
    if(fitsWithSidebar) closeGameHudDrawer();
    if(gameRow){
      gameRow.style.gridTemplateColumns = '1fr';
      gameRow.style.width = '';
      gameRow.style.minWidth = '';
    }
  } else {
    section?.classList.remove('hudCollapsed');
    closeGameHudDrawer();

    // HUD dinámico: se mueve junto al canvas y conserva sus 340px.
    // El ancho de la primera columna coincide con la tarjeta del canvas
    // (incluidos los 12px de padding del canvas-shell en cada lateral).
    if(gameRow){
      const cardWidth = Math.ceil(w + 24);
      gameRow.style.gridTemplateColumns = `${cardWidth}px ${GAME_SIDEBAR_WIDTH}px`;
      gameRow.style.width = `${cardWidth + GAME_LAYOUT_GAP + GAME_SIDEBAR_WIDTH}px`;
      gameRow.style.minWidth = `${cardWidth + GAME_LAYOUT_GAP + GAME_SIDEBAR_WIDTH}px`;
    }
  }
}
function beep(freq=440, duration=0.06, type='sine', gain=0.03){
  if(state.sound !== 'on') return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + duration);
  } catch {}
}

function moveTowardCanvasPoint(x, y){
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const worldX = clamp(x + Math.max(0, state.game.x - w/2), 24, MAP.worldWidth * MAP.tileSize - 24);
  const worldY = clamp(y + Math.max(0, state.game.y - h/2), 24, MAP.worldHeight * MAP.tileSize - 24);
  state.game.x = worldX;
  state.game.y = worldY;
  saveState();
  refreshGameHud();
}
function bindGameControls(){
  els.btnActionMobile?.addEventListener('click', interactAtPosition);

  const joystick = document.getElementById('virtualJoystick');
  const knob = document.getElementById('virtualJoystickKnob');

  const updateJoystickFromPointer = (e) => {
    if(joystickPointerId === null || e.pointerId !== joystickPointerId || !joystick) return;
    const rect = joystick.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width/2);
    let dy = e.clientY - (rect.top + rect.height/2);
    const distance = Math.hypot(dx,dy);
    if(distance > JOYSTICK_MAX_RADIUS){
      const angle = Math.atan2(dy,dx);
      dx = Math.cos(angle) * JOYSTICK_MAX_RADIUS;
      dy = Math.sin(angle) * JOYSTICK_MAX_RADIUS;
    }
    joystickMoveX = dx / JOYSTICK_MAX_RADIUS;
    joystickMoveY = dy / JOYSTICK_MAX_RADIUS;
    if(knob){
      knob.style.left = `calc(50% + ${dx}px)`;
      knob.style.top = `calc(50% + ${dy}px)`;
    }
    e.preventDefault();
  };

  joystick?.addEventListener('pointerdown', e => {
    if(!state.joystickEnabled) return;
    joystickPointerId = e.pointerId;
    joystick.setPointerCapture?.(e.pointerId);
    updateJoystickFromPointer(e);
    e.preventDefault();
    e.stopPropagation();
  });
  joystick?.addEventListener('pointermove', updateJoystickFromPointer, {passive:false});
  const stopJoystick = (e) => {
    if(joystickPointerId !== null && (!e.pointerId || e.pointerId === joystickPointerId)){
      resetVirtualJoystick();
    }
  };
  joystick?.addEventListener('pointerup', stopJoystick);
  joystick?.addEventListener('pointercancel', stopJoystick);

  canvas.addEventListener('pointerdown', e => {
    if(!document.getElementById('game').classList.contains('active')) return;
    if(state.joystickEnabled) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    moveTowardCanvasPoint(x, y);
  });
}

// Si el detalle del último examen está desplegado ahora mismo. No se
// persiste: es solo de UI, se resetea al recargar la página (igual que
// examHistoryExpanded, pero acá alcanza con un booleano porque solo hay
// un "último examen").
let lastExamExpanded = false;

function renderLastExam(){
  if(!state.lastExam){
    els.lastExamBox.innerHTML = '<div class="qitem">Todavía no hay un examen terminado.</div>';
    return;
  }
  const last = state.lastExam;
  const wrongTopics = Object.entries(last.wrongTopics || {});
  const deck = last.deck || [];
  // Antes de esta actualización, state.lastExam.deck se guardaba sin los
  // campos "given"/"ok" (solo el historial en Ajustes los tenía). Un
  // examen viejo guardado con ese formato anterior no tiene forma de
  // saber qué respondiste, así que en vez de mostrar todo como "Sin
  // responder" (engañoso), avisamos que ese detalle no está disponible.
  const legacyFormat = deck.length > 0 && deck[0].given === undefined;
  const detailHtml = lastExamExpanded ? `
    <div class="divider"></div>
    ${legacyFormat ? '<div class="tiny">Este resultado se guardó antes de que se pudiera revisar el detalle — no tiene las respuestas registradas. Los próximos exámenes sí van a mostrar el detalle completo acá.</div>' :
      deck.length ? deck.map(d => `
      <div class="tiny" style="margin-bottom:10px">
        <div><span class="tag">${escapeHtml(d.topic || '')}</span></div>
        <div style="margin:4px 0"><b>${escapeHtml(d.question)}</b></div>
        <div class="${d.ok ? 'good' : 'bad'}">Tu respuesta: ${escapeHtml(d.given || 'Sin responder')}</div>
        ${d.ok
          ? `<div class="good">✔ Correcta</div>`
          : `<div class="bad">✘ Incorrecta — Correcta: <b>${escapeHtml(d.correct)}</b></div>`
        }
        ${d.explanation ? `<div style="margin-top:2px">${escapeHtml(d.explanation)}</div>` : ''}
      </div>
    `).join('') : '<div class="tiny">Sin detalle guardado para este examen.</div>'}
  ` : '';
  els.lastExamBox.innerHTML = `
    <div class="qitem lastExamItem" style="cursor:pointer">
      <small>${new Date(last.date).toLocaleString()}</small>
      <b>${last.correct}/${last.total} · ${last.grade.toFixed(1)}/10</b>
      <div class="tiny">Incorrectas: ${last.wrong}</div>
      <div class="divider"></div>
      <div class="tiny">${wrongTopics.length ? 'Temas débiles: ' + wrongTopics.map(([t,n]) => `${t} (${n})`).join(', ') : 'Sin temas débiles claros.'}</div>
      <div class="tiny">${lastExamExpanded ? '▲ Tocá para ocultar el detalle' : '▼ Tocá para ver preguntas y respuestas'}</div>
      ${detailHtml}
    </div>
  `;
  renderLatex(els.lastExamBox);
}

// Historial completo de exámenes: fecha, hora y nota de cada examen
// terminado, del más reciente al más viejo. A diferencia de lastExamBox
// (que solo muestra el último y con detalle de temas débiles), esto es
// una lista pensada para ver la evolución en el tiempo. Cada examen es
// clickeable: al tocarlo, despliega la lista de preguntas con la
// respuesta que diste y la correcta.
function renderExamHistory(){
  if(!els.examHistoryBox) return;
  const history = state.examHistory || [];
  if(!history.length){
    els.examHistoryBox.innerHTML = '<div class="qitem">Todavía no hay exámenes terminados.</div>';
    return;
  }

  els.examHistoryBox.innerHTML = history.map((entry, i) => {
    const when = new Date(entry.date);
    const fecha = when.toLocaleDateString();
    const hora = when.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    return `
      <div class="qitem examHistoryItem" data-history-index="${i}" style="cursor:pointer">
        <div class="row spaced">
          <span>${fecha} · ${hora}</span>
          <b>${entry.correct}/${entry.total} · ${entry.grade.toFixed(1)}/10</b>
        </div>
        <div class="tiny">▶ Tocá para abrir el examen en pantalla completa</div>
      </div>
    `;
  }).join('');
  renderLatex(els.examHistoryBox);
}

function openExamHistoryViewer(index){
  const history = state.examHistory || [];
  const entry = history[index];
  const viewer = document.getElementById('examHistoryViewer');
  const body = document.getElementById('examHistoryViewerBody');
  const meta = document.getElementById('examHistoryViewerMeta');
  if(!entry || !viewer || !body) return;

  const when = new Date(entry.date);
  const fechaHora = when.toLocaleString();
  const deck = entry.deck || [];

  if(meta){
    meta.textContent = `${fechaHora} · ${entry.correct}/${entry.total} correctas · Nota ${entry.grade.toFixed(1)}/10`;
  }

  body.innerHTML = `
    <div class="qitem">
      <div class="row spaced">
        <b>Resultado del examen</b>
        <span class="tag">${entry.correct}/${entry.total} · ${entry.grade.toFixed(1)}/10</span>
      </div>
      <div class="tiny" style="margin-top:6px">${fechaHora}</div>
    </div>
    ${deck.length ? deck.map((d, n) => `
      <div class="examHistoryQuestion">
        <div class="row spaced" style="margin-bottom:8px">
          <span class="tag">${n+1}. ${escapeHtml(d.topic || '')}</span>
          <span class="${d.ok ? 'good' : 'bad'}"><b>${d.ok ? '✔ Correcta' : '✘ Incorrecta'}</b></span>
        </div>
        <div style="margin-bottom:8px"><b>${escapeHtml(d.question)}</b></div>
        <div class="${d.ok ? 'good' : 'bad'}">Tu respuesta: ${escapeHtml(d.given || 'Sin responder')}</div>
        ${d.ok
          ? `<div class="good" style="margin-top:4px">Respuesta correcta.</div>`
          : `<div class="bad" style="margin-top:4px">Respuesta correcta: <b>${escapeHtml(d.correct)}</b></div>`
        }
        ${d.explanation ? `<div class="tiny" style="margin-top:8px">${escapeHtml(d.explanation)}</div>` : ''}
      </div>
    `).join('') : '<div class="tiny">Sin detalle guardado para este examen.</div>'}
  `;

  renderLatex(body);
  viewer.classList.add('open');
  viewer.setAttribute('aria-hidden','false');
}

function closeExamHistoryViewer(){
  const viewer = document.getElementById('examHistoryViewer');
  if(!viewer) return;
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden','true');
}

function pulseFx(kind){
  document.body.classList.remove('fx-good','fx-bad','fx-buy','fx-level');
  void document.body.offsetWidth;
  document.body.classList.add(`fx-${kind}`);
  setTimeout(() => document.body.classList.remove(`fx-${kind}`), 240);
}
function unlockAchievement(id){
  if(state.achievements[id]) return false;
  const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
  if(!def) return false;
  state.achievements[id] = true;
  if(def.reward){
    state.hero.xp += def.reward.xp || 0;
    state.hero.coins += def.reward.coins || 0;
    checkLevelUp();
  }
  state.points += 5;
  addGameLog(`🏅 Logro desbloqueado: ${def.name}`);
  pulseFx('level');
  saveState();
  return true;
}

function updateAchievements(){
  for(const def of ACHIEVEMENT_DEFS){
    if(def.check(state)) unlockAchievement(def.id);
  }
  renderAchievements();
}

function progressValue(def){
  const map = {
    first_answer: Math.min(1, state.answered),
    ten_correct: Math.min(10, state.correct) / 10,
    study_25: Math.min(25, state.answered) / 25,
    first_battle: Math.min(1, state.battleWins),
    first_boss: Math.min(1, state.bossesDefeated.length),
    three_bosses: Math.min(3, state.bossesDefeated.length) / 3,
    shopper: Math.min(20, state.coinsSpent) / 20,
    coin_hoard: Math.min(50, state.hero.coins) / 50,
    equipped: EQUIPMENT_SLOTS.some(slot => state.equipment && state.equipment[slot]) ? 1 : 0,
    full_gear: CORE_EQUIPMENT_SLOTS.filter(slot => state.equipment && state.equipment[slot]).length / CORE_EQUIPMENT_SLOTS.length
  };
  return (map[def.id] || 0) * 100;
}

// ===================== EQUIPMENT SYSTEM =====================
function equipmentBonus(){
  const bonus = { xpMult:0, coinMult:0, hpBonus:0, timeBonus:0 };
  EQUIPMENT_SLOTS.forEach(slot => {
    const id = state.equipment && state.equipment[slot];
    if(!id) return;
    const item = EQUIPMENT_ITEMS.find(e => e.id === id);
    if(!item) return;
    bonus.xpMult += item.bonus.xpMult || 0;
    bonus.coinMult += item.bonus.coinMult || 0;
    bonus.hpBonus += item.bonus.hpBonus || 0;
    bonus.timeBonus += item.bonus.timeBonus || 0;
  });
  return bonus;
}
function buyEquipment(itemId){
  const item = EQUIPMENT_ITEMS.find(x => x.id === itemId);
  if(!item) return;
  const canShopEquip = item.shopEquip !== false;
  state.ownedEquipment = state.ownedEquipment || [];
  if(state.ownedEquipment.includes(itemId)){
    if(canShopEquip){
      equipItem(itemId);
    } else {
      addGameLog(`ℹ️ ${item.name} solo se puede equipar desde el Inventario.`);
    }
    return;
  }
  if(state.hero.coins < item.price){
    addGameLog('No tenés suficientes monedas.');
    pulseFx('bad');
    beep(140,.08,'square',.02);
    return;
  }
  state.hero.coins -= item.price;
  state.coinsSpent += item.price;
  state.ownedEquipment.push(itemId);
  if(canShopEquip){
    equipItem(itemId);
  } else {
    saveState();
    renderInventory();
    renderShop();
    renderAchievements();
    updateAchievements();
  }
  addGameLog(`🛒 Compraste ${item.name}`);
  pulseFx('buy');
  beep(700,.05,'triangle',.02);
}
function equipItem(itemId){
  const item = EQUIPMENT_ITEMS.find(x => x.id === itemId);
  if(!item) return;
  state.ownedEquipment = state.ownedEquipment || [];
  if(!state.ownedEquipment.includes(itemId)) return;
  state.equipment[item.slot] = itemId;
  addGameLog(`✅ Equipaste ${item.name}`);
  saveState();
  refreshStats();
  renderInventory();
  renderShop();
  renderAchievements();
  updateAchievements();
}
function unequipSlot(slot){
  if(!state.equipment[slot]) return;
  state.equipment[slot] = null;
  saveState();
  renderInventory();
  renderShop();
}

function renderInventory(){
  const inv = state.inventory || {};
  els.invCoins.textContent = state.hero.coins;
  els.invXp.textContent = state.hero.xp;

  els.equipSlots.innerHTML = EQUIPMENT_SLOTS.map(slot => {
    const equippedId = state.equipment[slot];
    const equipped = EQUIPMENT_ITEMS.find(x => x.id === equippedId);
    const slotLabel = slot === 'weapon' ? '⚔️ Arma' : slot === 'armor' ? '🛡️ Armadura' : slot === 'boots' ? '👢 Botas' : '🍀 Accesorio';
    if(equipped){
      return `<div class="equipSlot filled">
        <b>${slotLabel}</b>
        <div class="tiny">${equipped.emoji} ${escapeHtml(equipped.name)}</div>
        <div class="tiny">${escapeHtml(equipped.desc)}</div>
        <button class="btn smallBtn" style="margin-top:8px" data-unequip="${slot}">Quitar</button>
      </div>`;
    }
    const owned = (state.ownedEquipment || []).filter(id => EQUIPMENT_ITEMS.find(e=>e.id===id)?.slot === slot);
    return `<div class="equipSlot">
      <b>${slotLabel}</b>
      <div class="tiny">Vacío</div>
      ${owned.length ? owned.map(id => {
        const it = EQUIPMENT_ITEMS.find(e=>e.id===id);
        return `<button class="btn smallBtn" style="margin-top:6px" data-equip="${id}">Equipar ${it.emoji} ${escapeHtml(it.name)}</button>`;
      }).join('') : '<div class="tiny">Comprá uno en la tienda.</div>'}
    </div>`;
  }).join('');

  els.inventoryList.innerHTML = SHOP_ITEMS.map(item => {
    const count = inv[item.id] || 0;
    return `
      <div class="itemCard">
        <b>${item.emoji} ${escapeHtml(item.name)}</b>
        <div class="tiny">${escapeHtml(item.desc)}</div>
        <div class="row spaced">
          <span class="tag">x${count}</span>
          <button class="btn smallBtn" data-use-item="${item.id}">Usar</button>
        </div>
      </div>
    `;
  }).join('');

  const special = state.specialItems || [];
  els.specialItemsList.innerHTML = special.length ? special.map(id => {
    const def = SPECIAL_ITEM_DEFS[id];
    if(!def) return '';
    return `<div class="itemCard rareCard">
      <b>${def.emoji} ${escapeHtml(def.name)}</b>
      <div class="tiny">${escapeHtml(def.desc)}</div>
    </div>`;
  }).join('') : '<div class="tiny">Todavía no tenés objetos especiales. Derrotá jefes para conseguirlos.</div>';

  els.inventoryProgress.innerHTML = `
    <div class="qitem">
      <small>Resumen</small>
      <b>Monedas: ${state.hero.coins}</b>
      <div class="tiny">XP: ${state.hero.xp} · Nivel: ${state.hero.level}</div>
      <div class="divider"></div>
      <div class="tiny">Pociones: ${state.inventory.potion} · Pistas: ${state.inventory.hint} · Escudos: ${state.inventory.shield} · Cambios: ${state.inventory.reroll} · Elixires: ${state.inventory.elixir}</div>
      <div class="tiny">Poción mayor: ${state.inventory.megapotion || 0} · Moneda dorada: ${state.inventory.luckycoin || 0} · Arena del tiempo: ${state.inventory.timeextend || 0}</div>
    </div>
  `;
}


function renderShop(){
  const inv = state.inventory || {};
  els.shopList.innerHTML = SHOP_ITEMS.map(item => `
    <div class="itemCard">
      <b>${item.emoji} ${escapeHtml(item.name)}</b>
      <div class="tiny">${escapeHtml(item.desc)}</div>
      <div class="row spaced">
        <span class="tag">Costo: ${item.price}</span>
        <button class="btn smallBtn" data-buy-item="${item.id}">Comprar</button>
      </div>
    </div>
  `).join('');

  state.ownedEquipment = state.ownedEquipment || [];
  
  els.equipShopList.innerHTML = EQUIPMENT_ITEMS.map(item => {
    const owned = state.ownedEquipment.includes(item.id);
    const equipped = state.equipment[item.slot] === item.id;
    
    // 👇 NUEVA LÓGICA DE NIVEL REQUERIDO
    const reqLevel = item.minLevel || 1;
    const hasLevel = state.hero.level >= reqLevel;
    
    const canShopEquip = item.shopEquip !== false;

    let btnText = 'Comprar';
    let isDisabled = false;

    if (owned) {
        if (equipped) {
            btnText = '✓';
            isDisabled = true; // Ya lo tiene puesto
        } else if (canShopEquip) {
            btnText = 'Equipar';
        } else {
            btnText = 'En inventario';
            isDisabled = true; // Solo se equipa desde el Inventario
        }
    } else if (!hasLevel) {
        btnText = `Req. Nivel ${reqLevel}`;
        isDisabled = true; // Bloqueado por nivel
    }
    // 👆 FIN NUEVA LÓGICA

    return `
      <div class="itemCard">
        <b>${item.emoji} ${escapeHtml(item.name)}</b>
        <div class="tiny">${escapeHtml(item.desc)}</div>
        <div class="row spaced">
          <span class="tag">${owned ? (equipped ? 'Equipado' : 'En inventario') : `Costo: ${item.price}`}</span>
          <button class="btn smallBtn" data-buy-equip="${item.id}" ${isDisabled ? 'disabled' : ''}>${btnText}</button>
        </div>
      </div>
    `;
  }).join('');

  els.inventoryQuick.innerHTML = `
    <div class="qitem">
      <small>Inventario</small>
      <b>${state.hero.coins} monedas</b>
      <div class="tiny">Poción ${inv.potion || 0} · Pista ${inv.hint || 0} · Escudo ${inv.shield || 0} · Cambio ${inv.reroll || 0} · Elixir ${inv.elixir || 0}</div>
      <div class="divider"></div>
      <div class="tiny">Equipo: ${EQUIPMENT_SLOTS.map(slot => state.equipment[slot] ? EQUIPMENT_ITEMS.find(e=>e.id===state.equipment[slot]).emoji : '—').join(' ')}</div>
    </div>
  `;
}

function renderAchievements(){
  const unlocked = Object.keys(state.achievements || {}).length;
  els.achUnlocked.textContent = unlocked;
  els.achTotal.textContent = ACHIEVEMENT_DEFS.length;
  els.achievementList.innerHTML = ACHIEVEMENT_DEFS.map(def => {
    const ok = !!state.achievements[def.id];
    const pct = progressValue(def);
    return `
      <div class="achCard ${ok ? '' : 'locked'}">
        <b>${ok ? '🏅' : '🔒'} ${escapeHtml(def.name)}</b>
        <div class="tiny">${escapeHtml(def.desc)}</div>
        <div class="progress" style="margin-top:8px"><div style="width:${pct}%"></div></div>
        <div class="tiny" style="margin-top:6px">${ok ? 'Desbloqueado' : 'En progreso'} · ${pct.toFixed(0)}%</div>
      </div>
    `;
  }).join('');
  els.achievementSummary.innerHTML = `
    <div class="qitem">
      <small>Resumen</small>
      <b>${unlocked} logros desbloqueados</b>
      <div class="tiny">Jefes vencidos: ${state.bossesDefeated.length} · Victorias: ${state.battleWins} · Derrotas: ${state.battleLosses}</div>
    </div>
  `;
}

function bossUnlocked(boss){
  return boss.unlock(state);
}

// ===================== PREGUNTAS DE COMBATE =====================
// Selecciona preguntas priorizando las que no se repitieron recientemente
// y ajustando la dificultad según el mundo actual (Bosque = fácil, Castillo Final = difícil).
// "themeId" es el ID numérico del tema (ver QUESTION_BANK[].themeId); si
// viene null/undefined se toma como "todos los temas mezclados" (lo que
// antes era el caso especial topic==="Mixto").
// Ya no usamos un historial "duro" por combate (excluir hasta agotar
// todo el pool y recién ahí volver a barajar todo). En cambio, cada
// pregunta guarda en qué número de combate se contestó por última vez
// (state.questionLastSeenBattle) y eso se traduce en un peso de
// "frescura": muy bajo apenas se contesta, que se va recuperando de a
// poco con cada combate que pasa — así la próxima pelea tiene poca
// chance de repetirla, la siguiente un poco más, y así sucesivamente,
// en vez de "no puede salir / ya puede salir" de un momento a otro.
const HARD_COOLDOWN_BATTLES = 1;      // combates de "enfriado" casi total tras contestarla
const FRESHNESS_RECOVERY_BATTLES = 8; // combates para recuperar el peso normal, contados desde que termina el enfriado
const MIN_FRESHNESS = 0.02;           // nunca 0: siempre queda una chance chica

// Mismo mecanismo que arriba, pero para Exámenes. HARD_COOLDOWN_EXAMS=1
// hace que el próximo examen después de ver una pregunta tenga muy poca
// chance de repetirla (MIN_FRESHNESS_EXAM = 10%, como pediste); esa
// chance se va recuperando de a poco con cada examen que rindas después,
// hasta volver al peso normal a los FRESHNESS_RECOVERY_EXAMS exámenes.
const HARD_COOLDOWN_EXAMS = 1;
const FRESHNESS_RECOVERY_EXAMS = 5;
const MIN_FRESHNESS_EXAM = 0.10;

function questionFreshnessExam(q){
    const lastSeen = state.questionLastSeenExam && state.questionLastSeenExam[q.id];
    if(lastSeen == null) return 1; // nunca contestada en un examen: peso máximo
    const examsSince = (state.examCounter || 0) - lastSeen;
    if(examsSince <= HARD_COOLDOWN_EXAMS) return MIN_FRESHNESS_EXAM;
    const recoveryProgress = (examsSince - HARD_COOLDOWN_EXAMS) / FRESHNESS_RECOVERY_EXAMS;
    return Math.min(1, MIN_FRESHNESS_EXAM + (1 - MIN_FRESHNESS_EXAM) * recoveryProgress);
}

function questionFreshness(q){
    const lastSeen = state.questionLastSeenBattle && state.questionLastSeenBattle[q.id];
    if(lastSeen == null) return 1; // nunca contestada: peso máximo
    const battlesSince = (state.battleCounter || 0) - lastSeen;
    if(battlesSince <= HARD_COOLDOWN_BATTLES) return MIN_FRESHNESS;
    const recoveryProgress = (battlesSince - HARD_COOLDOWN_BATTLES) / FRESHNESS_RECOVERY_BATTLES;
    return Math.min(1, MIN_FRESHNESS + (1 - MIN_FRESHNESS) * recoveryProgress);
}

// "Shuffle" ponderado (algoritmo de Efraimidis–Spirakis): ordena el
// array al azar, pero los elementos con más peso (más frescos) tienden
// a quedar más adelante, y los de menos peso (contestados hace poco)
// tienden a quedar más atrás. Sigue siendo aleatorio, no determinístico
// — una pregunta de bajo peso puede igual salir temprano alguna vez,
// sólo que con menos probabilidad, nunca cero.
function weightedShuffle(arr, weightFn){
    return arr
        .map(item => ({ item, key: Math.pow(Math.random(), 1 / Math.max(weightFn(item), 0.0001)) }))
        .sort((a,b) => b.key - a.key)
        .map(x => x.item);
}

// Qué tan "cerca" está la dificultad de una pregunta del rango ideal de
// la zona. 1.0 si cae adentro del rango; se degrada gradualmente cuanto
// más lejos está (nunca a 0), en vez de directamente descartarla del
// mazo — así el pool "vivo" de una zona es TODO el banco del tema, no
// solo el recorte que entra en su diffRange (que en la práctica casi no
// se llegaba a usar, porque quedaba al final del mazo).
function difficultyCloseness(q, diffRange){
    const [lo, hi] = diffRange || [1,5];
    if(q.difficulty >= lo && q.difficulty <= hi) return 1;
    const dist = q.difficulty < lo ? (lo - q.difficulty) : (q.difficulty - hi);
    return Math.max(0.18, 1 - dist * 0.3);
}

function getBattlePool(themeId){

    // Acepta un themeId único, un ARRAY de themeIds (jefes de zona que
    // evalúan todos los temas de su zona a la vez) o null/undefined
    // (todos los temas mezclados).
    const themeIds =
        Array.isArray(themeId) ? themeId.map(String) :
        themeId == null ? null :
        [String(themeId)];

    const all =
        themeIds == null
            ? QUESTION_BANK.slice()
            : QUESTION_BANK.filter(q => themeIds.includes(String(q.themeId)));

    const worldDef = currentWorldDef();
    const diffRange = worldDef.diffRange || [1,5];

    // Un solo shuffle ponderado sobre TODO el pool del tema: freshness
    // (qué tan reciente se contestó) x cercanía de dificultad a la zona.
    // Las preguntas de la dificultad "ideal" siguen apareciendo primero
    // la mayoría de las veces, pero ya no queda un 30-60% del banco del
    // tema prácticamente inalcanzable en combates cortos.
    return weightedShuffle(
        all,
        q => questionFreshness(q) * difficultyCloseness(q, diffRange)
    );

}


// Cada zona tiene una lista de temas por ID (WORLD_TOPIC_ASSIGNMENTS[worldId]).
// En vez de que cada enemigo esté fijado para siempre a un único tema, el
// tema real de cada combate rota: el primer combate en la zona usa el
// primer id asignado, el siguiente el próximo, etc, dando la vuelta al
// llegar al final. La rotación es por zona (compartida entre todos sus
// enemigos), no por enemigo individual, y se guarda en state para
// persistir entre sesiones. Esta función es el fallback de seguridad de
// nextAssignedThemeId() para cuando un mundo no tiene nada asignado.
function nextRotatingThemeId(worldId, fallbackThemeId){
  const assignedIds = getAssignedThemeIds(worldId);
  const ids = assignedIds.length ? assignedIds : [fallbackThemeId ?? 1];
  state.zoneTopicRotation ??= {};
  const idx = state.zoneTopicRotation[worldId] || 0;
  const themeId = ids[idx % ids.length];
  state.zoneTopicRotation[worldId] = (idx + 1) % ids.length;
  return themeId;
}

// ===================== ROTACIÓN UNIVERSAL DE TEMAS POR MUNDO =====================
// Obtiene los themeId asignados automáticamente a cada mundo.
// Ya no depende de que la materia sea Base de Datos.

const WORLD_THEME_ROTATION = {};

function getAssignedThemeIds(worldId){

  const assigned = WORLD_TOPIC_ASSIGNMENTS[worldId];

  if(!Array.isArray(assigned) || !assigned.length){
    return [];
  }

  return assigned
    .map(item => String(item.themeId))
    .filter(Boolean);
}

function nextAssignedThemeId(worldId){

  const ids = getAssignedThemeIds(worldId);

  if(!ids.length){
    return null;
  }

  if(!WORLD_THEME_ROTATION[worldId]){
    WORLD_THEME_ROTATION[worldId] = 0;
  }

  const index =
    WORLD_THEME_ROTATION[worldId] % ids.length;

  const themeId = ids[index];

  WORLD_THEME_ROTATION[worldId] =
    (index + 1) % ids.length;

  return themeId;
}

// (El viejo mecanismo de "tema fijo por jefe" (BOSS_FIXED_THEME) se
// eliminó: repartía los temas de la zona entre sus jefes, así que un
// jefe único terminaba evaluando SOLO uno de los temas de su zona, nunca
// todos juntos. Ahora cada jefe de zona evalúa TODOS los temas asignados
// a su zona a la vez — ver isZoneBoss en beginEncounter().)

function beginEncounter(enemy){
  // Si quedaba un combate anterior sin cerrar bien (ej. se abandonó con
  // resetBattle() en vez de terminar con finishBattle()), su intervalo
  // de tiempo seguía vivo en segundo plano. Acá abajo state.battle se
  // reemplaza por un objeto nuevo, así que hay que limpiar ESE
  // intervalo viejo ahora, mientras todavía tenemos la referencia —
  // si no, startBattleTimer() de este combate nuevo va a llamar
  // clearInterval(state.battle.timer) sobre el objeto recién creado
  // (que todavía no tiene .timer), no sobre el viejo, y el intervalo
  // huérfano queda corriendo en paralelo descontando tiempo también.
  if(state.battle && state.battle.timer) clearInterval(state.battle.timer);

  // Cada combate nuevo suma uno acá. Es la referencia que usa
  // questionFreshness() para saber "hace cuántos combates" se contestó
  // por última vez cada pregunta (ver getBattlePool más abajo).
  state.battleCounter = (state.battleCounter || 0) + 1;

  // Los enemigos "invitados" de otra zona (enemy.originWorld) rotan dentro
  // del tema de SU zona de origen, no de la zona donde el jugador los
  // encuentra; si no tiene originWorld (jefes), rota en la zona actual.
  // El enemigo usa los temas asignados automáticamente
  // al mundo del que proviene.
  //
  // Esto conserva la mecánica de cascada:
  // si un enemigo del Bosque aparece más adelante,
  // sigue preguntando temas del Bosque.

  const rotationWorld =
    enemy.originWorld || state.game.world;

  // El Castillo (jefe final) siempre usa temas mixtos: cualquier
  // enemigo que rote ahí -incluido el jefe final- toma preguntas de
  // TODOS los temas de la materia mezclados, sin importar cuántos
  // temas tenga ni qué diga WORLD_TOPIC_ASSIGNMENTS para esa zona.
  const isMixed = rotationWorld === 'boss';

  // Los jefes de zona (no el jefe final del Castillo) evalúan SIEMPRE
  // TODOS los temas asignados a su zona en el mismo combate, mezclados
  // — no uno solo por rotación como los enemigos regulares, ni un tema
  // fijo por jefe. Ej: en la zona con Álgebra Relacional + Modelo
  // Relacional, el jefe pregunta de ambos temas mezclados en el mismo
  // combate, nunca solo uno.
  const isZoneBoss = !!enemy.isBoss && !isMixed;

  let themeId;

  if(isMixed){
    themeId = null;
  } else if(isZoneBoss){
    const assignedIds = getAssignedThemeIds(rotationWorld);
    themeId = assignedIds.length ? assignedIds : null;
  } else {
    themeId = nextAssignedThemeId(rotationWorld);
  }

  // Fallback de seguridad:
  // si por alguna razón el mundo no recibió temas,
  // usamos la lógica anterior para no romper el combate.

  if(!isMixed && !themeId){
    themeId =
      nextRotatingThemeId(
        rotationWorld,
        enemy.themeId
      );
  }

  const pool = getBattlePool(themeId);

  if(!pool.length){
    addGameLog('No hay preguntas para este enemigo.');
    return false;
  }

  const eq = equipmentBonus();
  const levelLives = Math.floor(state.hero.level / 4);
  const baseMaxHp = 3 + levelLives + eq.hpBonus;

  state.battle = {
    active:true,
    bossId: enemy.id,
    bossName: enemyDisplayName(enemy),
    bossThemeId: themeId,
    bossTopic:
        isMixed ? 'Mixto' :
        Array.isArray(themeId) ? [...new Set(themeId.map(id => themeName(id)))].join(' · ') :
        themeName(themeId),
    bossDesc: enemy.desc || '',
    bossHp: enemy.hp,
    bossMaxHp: enemy.hp,
    rewardXp: Math.round(enemy.rewardXp * XP_MULTIPLIER[state.game.world] * (1 + eq.xpMult)),
    rewardCoins: Math.round(enemy.rewardCoins * COIN_MULTIPLIER[state.game.world] * (1 + eq.coinMult)),
    isBoss: !!enemy.isBoss,
    playerHp: baseMaxHp,
    playerMaxHp: baseMaxHp,
    deck: pool,
    index: 0,
    question: null,
    streak: 0,
    hiddenWrongIndex: null,
    selectedMulti: [],
    shield: false,
    mode:'battle',
    timeBonus: eq.timeBonus,
    answerLog: []
  };
  state.battle.npcId = enemy.id;
  const firstQuestion = currentBattleQuestion();

  const seconds = (TIME_BY_DIFFICULTY[firstQuestion.difficulty] || 20) + (state.battle.timeBonus || 0);

  state.battle.timeLeft = seconds;
  state.battle.timeMax = seconds;

  startBattleTimer();

  addGameLog(`⚔️ Comenzó el combate contra ${enemyDisplayName(enemy)}`);
  pulseFx('good');
  saveState();
  renderBattle();
  go('battle');
  return true;
}

// (Re)inicia el intervalo de 1s que descuenta state.battle.timeLeft.
// Se llama cada vez que arranca un combate Y cada vez que cambia la
// pregunta (nextBattleQuestion / currentBattleQuestion), porque cuando
// el tiempo se agota el propio callback hace clearInterval — si no se
// volviera a crear acá, el cronómetro quedaría congelado a partir de
// la siguiente pregunta.
function startBattleTimer(){

  clearInterval(state.battle.timer);

  state.battle.timer = setInterval(()=>{

      if(!state.battle || !state.battle.active) return;

      state.battle.timeLeft--;

      updateBattleTimerDisplay();

      if(state.battle.timeLeft <= 0){

          clearInterval(state.battle.timer);

          addGameLog("⏰ ¡Se acabó el tiempo!");

          const qNow = state.battle.question;
          answerBattle(qNow && qNow.type === 'input' ? '' : -1);

      }

  },1000);

}

function beginBattle(bossId){
  const boss = BOSS_DEFS.find(b => b.id === bossId) || BOSS_DEFS[0];
  if(!bossUnlocked(boss)){
    addGameLog('🔒 Jefe bloqueado.');
    return;
  }
  beginEncounter({
    id: boss.id,
    world: boss.world,
    themeId: boss.themeId,
    hp: boss.hp,
    rewardXp: boss.rewardXp,
    rewardCoins: boss.rewardCoins,
    desc: boss.desc,
    isBoss: true
  });
}

function currentBattleQuestion(){
  if(!state.battle || !state.battle.deck.length) return null;
  const q = state.battle.deck[state.battle.index % state.battle.deck.length];
  state.battle.question = q;
  
  // NUEVO: Generamos un orden aleatorio la primera vez que se lee la pregunta
  if(!state.battle.currentOrder) {
      state.battle.currentOrder = shuffle(q.options.map((_, i) => i));
      state.battle.selectedMulti = [];
  }

  const seconds = TIME_BY_DIFFICULTY[q.difficulty] || 20;
  state.battle.timeLeft = seconds;
  state.battle.timeMax = seconds;
  startBattleTimer();
  return q;
}

function nextBattleQuestion(){
    if(!state.battle || !state.battle.active) return null;
    
    if(state.battle.index >= state.battle.deck.length - 1){
        state.battle.deck = getBattlePool(state.battle.bossThemeId);
        state.battle.index = -1;
    }

    state.battle.index++;

    if(state.battle.index >= state.battle.deck.length){
        state.battle.index = 0;
    }

    const q = state.battle.deck[state.battle.index];
    state.battle.question = q;
    
    // NUEVO: Volvemos a mezclar al cambiar de pregunta
    state.battle.currentOrder = shuffle(q.options.map((_, i) => i));
    state.battle.selectedMulti = [];

    const seconds = TIME_BY_DIFFICULTY[q.difficulty] || 20;
    state.battle.timeLeft = seconds;
    state.battle.timeMax = seconds;
    startBattleTimer();

    return q;
}
function updateBattleTimerDisplay() {
    if (!state.battle || !state.battle.active) return;
    
    const b = state.battle;
    const percent = (b.timeLeft / b.timeMax) * 100;

    els.battleTimerBar.style.width = percent + "%";
    els.battleTimerText.textContent = `⏳ ${b.timeLeft}s`;
    
    // Mostramos también el tiempo en los metadatos
    els.battleMeta.innerHTML = `${escapeHtml(b.bossTopic)} · ${escapeHtml(b.bossDesc || '')}<br>⏳ Tiempo: ${b.timeLeft}s`;

    if (percent > 60) {
        els.battleTimerBar.style.background = "#2ecc71";
    } else if (percent > 30) {
        els.battleTimerBar.style.background = "#f1c40f";
    } else {
        els.battleTimerBar.style.background = "#e74c3c";
    }
}

function renderBattle(){
  els.battleWins.textContent = state.battleWins || 0;
  els.battleLosses.textContent = state.battleLosses || 0;
  renderBossList();
  renderBattleAnswerLog();

  const customBattleBtn = document.getElementById('btnCustomBattle');
  if(customBattleBtn){
    const unlocked = allZoneBossesDefeated();
    customBattleBtn.disabled = !unlocked;
    customBattleBtn.textContent = unlocked ? '⚔️ Combate personalizado' : '🔒 Combate personalizado';
  }

  if(!state.battle || !state.battle.active){
      renderBattleHUD(null);
      els.battleMeta.textContent = "Explorá el mapa para encontrar enemigos.";
      els.battleQuestion.textContent = "Los combates comienzan automáticamente al interactuar con un enemigo.";
      toggleDiagramContainer(false);
      els.battleOptions.innerHTML = "";
      els.battleFeedback.textContent = "Todavía no hay ningún combate activo.";
      return;
  }

  const b = state.battle;
  const q = b.question || currentBattleQuestion();
  if(!q) return;

  renderBattleHUD(b);
  renderQuestion(q, b);
}

// Panel lateral de batalla: lista de respuestas dadas en el combate
// activo (o el último, hasta que empiece uno nuevo), con la definición o
// explicación de cada pregunta, sea correcta o no la respuesta dada.
function renderBattleAnswerLog(){
  if(!els.battleAnswerLog) return;
  const log = (state.battle && state.battle.answerLog) || [];
  if(!log.length){
    els.battleAnswerLog.innerHTML = '<div class="tiny">Todavía no respondiste ninguna pregunta.</div>';
    return;
  }
  els.battleAnswerLog.innerHTML = log.map(entry => `
    <div class="tiny" style="margin-bottom:10px">
      <div>${entry.ok ? '✅' : '❌'} <b>${escapeHtml(entry.question)}</b></div>
      ${!entry.ok ? `<div>Tu respuesta: ${escapeHtml(entry.given || 'Sin responder')}</div><div>Correcta: <b>${escapeHtml(entry.correct)}</b></div>` : ''}
      ${entry.explanation ? `<div style="margin-top:2px">${escapeHtml(entry.explanation)}</div>` : ''}
    </div>
  `).join('');
  renderLatex(els.battleAnswerLog);
}

// Panel lateral de batalla: todos los jefes de la materia, marcando
// cuáles ya derrotaste. A los derrotados se les puede pedir revancha
// directamente desde acá (ver el listener de data-refight-boss), sin
// tener que volver a caminar hasta ellos en el mapa.
function renderBossList(){
  if(!els.bossList) return;
  const bosses = (typeof MAP !== 'undefined' && Array.isArray(MAP.npcs))
    ? MAP.npcs.filter(n => n.isBoss)
    : [];
  if(!bosses.length){
    els.bossList.innerHTML = '<div class="tiny">No hay jefes en esta materia.</div>';
    return;
  }
  els.bossList.innerHTML = bosses.map(n => {
    const defeated = (state.bossesDefeated || []).includes(n.id);
    return `
      <div class="row spaced" style="margin-bottom:6px">
        <span class="tiny">${defeated ? '✅' : '⬜'} ${enemyDisplayName(n)}</span>
        ${defeated
          ? `<button class="btn smallBtn" data-refight-boss="${n.id}">Revancha</button>`
          : '<span class="tiny">No derrotado</span>'}
      </div>
    `;
  }).join('');
}

// ==== HUD del combate (vida, jefe, timer, racha) ====
// Separado de renderQuestion para que agregar nuevos tipos de pregunta
// (choice / input / diagram / próximamente drag) no tenga que tocar el HUD.
function renderBattleHUD(b){
  if(!b){
      els.battlePlayerHp.textContent = "3/3";
      els.battleEnemyName.textContent = "Sin enemigo";
      els.battleEnemyHp.textContent = "0/0";
      els.battlePlayerBar.style.width = "0%";
      els.battleEnemyBar.style.width = "0%";
      els.battleStreak.textContent = "0";
      return;
  }

  els.battlePlayerHp.textContent = `${b.playerHp}/${b.playerMaxHp}`;
  els.battleEnemyName.textContent = b.bossName;
  els.battleEnemyHp.textContent = `${b.bossHp}/${b.bossMaxHp}`;
  els.battlePlayerBar.style.width = `${Math.max(0, (b.playerHp / b.playerMaxHp) * 100)}%`;
  els.battleEnemyBar.style.width = `${Math.max(0, (b.bossHp / b.bossMaxHp) * 100)}%`;

  // Dibujamos el timer por primera vez al renderizar
  updateBattleTimerDisplay();

  els.battleStreak.textContent = String(b.streak);
}

// ==== Pregunta del combate ====
// Punto único de entrada para pintar el enunciado y la forma de respuesta.
// Agregar un tipo nuevo = agregar un case acá (y su renderXQuestion()).
function renderQuestion(q, b){
  els.battleQuestion.innerHTML = `<span class="tag">${escapeHtml(q.topic)}</span> ${isMultiChoice(q) ? '<span class="tag">🔲 Selección múltiple</span>' : ''} <b>${escapeHtml(q.question)}</b>`;

  renderLatex(els.battleQuestion);
  renderLatex(els.battleOptions);
  // El contenedor de diagramas se muestra para cualquier tipo visual
  toggleDiagramContainer(q.type === "diagram" || q.type === "diagram-click");

  switch(q.type){
      case "input":
          renderInputQuestion(q);
          break;
      case "diagram":
          renderDiagramQuestion(q, b);
          break;
      case "diagram-click":
          renderDiagramClickQuestion(q, b);
          break;
      case "choice":
      default:
          renderChoiceQuestion(q, b);
          break;
  }

  els.battleFeedback.textContent = isMultiChoice(q) ? 'Marcá todas las opciones correctas y confirmá con Atacar.' : 'Elegí la respuesta correcta. Cada acierto le baja la vida al enemigo.';
}

function toggleDiagramContainer(show){
  const el = document.getElementById("diagramContainer");
  if(el) el.style.display = show ? "block" : "none";
}

function renderInputQuestion(q){
  els.battleOptions.innerHTML = `
      <input id="battleInput" class="quest-input-field" type="text" placeholder="Escribí tu respuesta..." autocomplete="off">
      <button class="btn primary" id="battleSend">⚔️ Atacar</button>
  `;

  setTimeout(()=>{
      const input = document.getElementById("battleInput");
      const btn = document.getElementById("battleSend");

      // Le pasamos el texto tal cual a answerBattle: isAnswerCorrect() ya
      // sabe normalizar y comparar contra q.correct para type:"input".
      // (Antes se pre-calculaba "ok" acá y se mandaba 0/-1, pero answerBattle
      // volvía a llamar a isAnswerCorrect con ese 0/-1 como si fuera texto,
      // así que nunca coincidía con la respuesta esperada: siempre daba mal
      // aunque escribieras la opción correcta.)
      const responder = ()=>{
          answerBattle(input.value);
      };

      btn.onclick = responder;
      input.onkeydown=e=>{
          if(e.key==="Enter") responder();
      };
      input.focus();
  },0);
}

function renderChoiceQuestion(q, b){
  const hidden = b ? b.hiddenWrongIndex : null;
  // Tomamos el orden aleatorio. Si no existe, usamos el lineal (0, 1, 2, 3)
  const order = (b && b.currentOrder) || q.options.map((_, i) => i);

  // Preguntas "choice" de selección múltiple: en vez de que cada click
  // resuelva la pregunta al toque (como en single-choice), acá el click
  // solo marca/desmarca esa opción, y hace falta confirmar con "Atacar"
  // (ver bindSpecialPanels) para recién ahí llamar a answerBattle().
  if(isMultiChoice(q)){
    const selected = (b && Array.isArray(b.selectedMulti)) ? b.selectedMulti : [];
    els.battleOptions.innerHTML = order.map(i => {
        const opt = q.options[i];
        const isHidden = hidden === i;
        const isSelected = selected.includes(i);
        return `<button class="opt multi ${isHidden?'hidden':''} ${isSelected?'selected':''}" data-battle-multi="${i}">${escapeHtml(opt)}</button>`;
    }).join("") + `<button class="btn primary" id="battleMultiSubmit" style="margin-top:8px">⚔️ Atacar</button>`;
    renderLatex(els.battleOptions);
    return;
  }

  els.battleOptions.innerHTML = order.map(i => {
      const opt = q.options[i];
      const isHidden = hidden === i;

      // Mantenemos data-battle-answer="${i}" para que tu validador sepa cuál índice original tocaste
      return `<button class="opt ${isHidden?'hidden':''}" data-battle-answer="${i}">${escapeHtml(opt)}</button>`;
  }).join("");
  renderLatex(els.battleOptions);
}

// Fase 2 / 3: preguntas con diagrama.
// Si la pregunta trae "q.diagram", usamos la biblioteca SVG para dibujarlo.
// Si no, mostramos el placeholder de prueba (así verificamos que el motor
// ya soporta el tipo "diagram" aunque todavía no haya SVGs reales).
// Debajo del diagrama, el jugador sigue respondiendo por opciones (choice).
function renderDiagramQuestion(q, b){
  const container = document.getElementById("diagramContainer");
  if(container){
      container.innerHTML = q.diagram
          ? buildDiagramSVG(q.diagram)
          : "<h2>Diagrama de prueba</h2>";
  }
  renderChoiceQuestion(q, b);
}

// Preguntas donde la respuesta se elige haciendo clic directamente sobre
// un elemento del SVG (ej: "hacé clic sobre la entidad débil"), en vez de
// elegir un botón de texto debajo. El SVG debe traer elementos marcados
// con data-click-answer="valor" (ver clickId en entityGroup/attributeGroup/
// relationshipGroup). El clic se resuelve con un único listener delegado
// sobre #diagramContainer (ver bindSpecialPanels).
function renderDiagramClickQuestion(q, b){
  const container = document.getElementById("diagramContainer");
  if(container){
      container.innerHTML = q.diagram
          ? buildDiagramSVG(q.diagram)
          : "<p>Diagrama no disponible.</p>";
  }
  // No hay botones: la pista de respuesta va en el propio diagrama.
  els.battleOptions.innerHTML = `<p class="tag">👆 Tocá el elemento correcto en el diagrama.</p>`;
}

function applyBattleItem(itemId){
  if(!state.inventory[itemId]) return false;
  if(itemId === 'potion'){
    if(!state.battle || !state.battle.active){
      addGameLog('🧪 La poción se guarda para combate.');
      return false;
    }
    if(state.battle.playerHp >= state.battle.playerMaxHp){
      addGameLog('🧪 Vida al máximo.');
      return false;
    }
    state.battle.playerHp = Math.min(
        state.battle.playerHp + 1,
        state.battle.playerMaxHp
    );
    state.inventory[itemId] -= 1;
    addGameLog('🧪 Usaste una poción.');
    pulseFx('buy');
    beep(520,.05,'sine',.02);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'megapotion'){
    if(!state.battle || !state.battle.active){
      addGameLog('🧴 La poción mayor se guarda para combate.');
      return false;
    }
    if(state.battle.playerHp >= state.battle.playerMaxHp){
      addGameLog('🧴 Vida al máximo.');
      return false;
    }
    state.battle.playerHp = state.battle.playerMaxHp;
    state.inventory[itemId] -= 1;
    addGameLog('🧴 Recuperaste toda tu vida.');
    pulseFx('buy');
    beep(560,.07,'sine',.03);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'luckycoin'){
    if(state.luckyCoinActive){
      addGameLog('🪙 Ya tenés una moneda dorada activa.');
      return false;
    }
    state.inventory[itemId] -= 1;
    state.luckyCoinActive = true;
    addGameLog('🪙 Tu próxima victoria dará el doble de monedas.');
    pulseFx('buy');
    beep(700,.06,'triangle',.02);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'timeextend'){
    if(!state.battle || !state.battle.active){
      addGameLog('⏳ La arena del tiempo se usa dentro de combate.');
      return false;
    }
    state.battle.timeLeft += 10;
    state.battle.timeMax += 10;
    state.inventory[itemId] -= 1;
    addGameLog('⏳ Ganaste 10 segundos extra.');
    pulseFx('buy');
    beep(480,.05,'triangle',.02);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'hint'){
    if(!state.battle || !state.battle.active || !state.battle.question){
      addGameLog('💡 La pista se usa dentro de un combate.');
      return false;
    }
    const q = state.battle.question;
    if(q.type === 'input' || q.type === 'diagram-click'){
      addGameLog('💡 La pista no funciona en este tipo de pregunta.');
      return false;
    }
    const corrects = isMultiChoice(q) ? q.correct : [q.correct];
    const wrongs = q.options.map((_,i)=>i).filter(i => !corrects.includes(i));
    state.battle.hiddenWrongIndex = wrongs[Math.floor(Math.random()*wrongs.length)];
    state.inventory[itemId] -= 1;
    addGameLog('💡 Eliminaste una opción incorrecta.');
    pulseFx('buy');
    beep(620,.05,'triangle',.02);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'shield'){
    if(!state.battle || !state.battle.active){
      addGameLog('🛡️ El escudo se guarda para combate.');
      return false;
    }
    if(state.battle.shield){
        addGameLog("🛡️ Ya tenés un escudo activo.");
        return false;
    }
    state.battle.shield = true;
    state.inventory[itemId] -= 1;
    addGameLog('🛡️ Activaste un escudo.');
    pulseFx('buy');
    beep(460,.05,'square',.02);
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'reroll'){
    if(!state.battle || !state.battle.active){
      addGameLog('🔁 El cambio se usa dentro de combate.');
      return false;
    }
    state.inventory[itemId] -= 1;
    state.battle.hiddenWrongIndex = null;
    nextBattleQuestion();
    addGameLog("🔁 Cambiaste la pregunta.");
    pulseFx("buy");
    saveState();
    renderBattle();
    renderInventory();
    renderShop();
    return true;
  }
  if(itemId === 'elixir'){
    state.hero.xp += 10;
    state.inventory[itemId] -= 1;
    checkLevelUp();
    addGameLog('✨ Usaste un elixir de XP.');
    pulseFx('level');
    beep(780,.06,'sine',.03);
    saveState();
    refreshStats();
    renderInventory();
    renderShop();
    renderAchievements();
    return true;
  }
  return false;
}

function buyItem(itemId){
  const item = SHOP_ITEMS.find(x => x.id === itemId);
  if(!item) return;
  if(state.hero.coins < item.price){
    addGameLog('No tenés suficientes monedas.');
    pulseFx('bad');
    beep(140,.08,'square',.02);
    return;
  }
  state.hero.coins -= item.price;
  state.coinsSpent += item.price;
  state.inventory[itemId] = (state.inventory[itemId] || 0) + 1;
  addGameLog(`🛒 Compraste ${item.name}`);
  pulseFx('buy');
  beep(700,.05,'triangle',.02);
  saveState();
  refreshStats();
  renderInventory();
  renderShop();
  renderAchievements();
  updateAchievements();
}
function finishBattle(victory){
    if(!state.battle) return;

    const b = state.battle;
    clearInterval(state.battle.timer);

    state.battle.active = false;

    if(victory){

        state.defeatedNpcs ??= [];
        state.defeatedGuestNpcs ??= []; // 👇 NUEVA LISTA INICIALIZADA
        state.bossesDefeated ??= [];
        state.completedWorlds ??= [];
        state.specialItems ??= [];

        // 👇 NUEVA LÓGICA: Eliminar NPC del mapa (Nativo vs Invitado)
        if(b.npcId){
            // Buscamos al enemigo en la base de datos del mapa para saber de dónde es
            const npcDef = MAP.npcs.find(n => n.id === b.npcId);
            const isGuest = npcDef && npcDef.world && npcDef.world !== state.game.world;

            if (isGuest) {
                // Si es invitado, guardamos: zona_enemigoId
                const guestId = `${state.game.world}_${b.npcId}`;
                if (!state.defeatedGuestNpcs.includes(guestId)) {
                    state.defeatedGuestNpcs.push(guestId);
                }
            } else {
                // Si es nativo, lo guardamos normal
                if (!state.defeatedNpcs.includes(b.npcId)) {
                    state.defeatedNpcs.push(b.npcId);
                }
            }
        }
        // 👆 FIN NUEVA LÓGICA

        // Registrar boss derrotado
        if(b.isBoss && !state.bossesDefeated.includes(b.bossId)){
            state.bossesDefeated.push(b.bossId);

            // Marcar mundo como completado
            if(!state.completedWorlds.includes(state.game.world)){
                state.completedWorlds.push(state.game.world);
            }

            // Objetos especiales por jefe
            const dropMap = { relboss:'relic_key', normboss:'monk_seal', dragon:'dragon_scale' };
            const drop = dropMap[b.bossId];
            if(drop && !state.specialItems.includes(drop)){
                state.specialItems.push(drop);
                addGameLog(`✨ Obtuviste objeto especial: ${SPECIAL_ITEM_DEFS[drop].name}`);
            }
        }

        state.battleWins++;

        let coinsGained = b.rewardCoins || 0;
        if(state.luckyCoinActive){
            coinsGained *= 2;
            state.luckyCoinActive = false;
            addGameLog('🪙 ¡Monedas duplicadas por la moneda dorada!');
        }

        state.hero.xp += b.rewardXp || 0;
        state.hero.coins += coinsGained;

        state.game.log ??= [];
        state.game.log.unshift({
            t: Date.now(),
            msg: `🏆 Venciste a ${b.bossName}`
        });
        state.game.log = state.game.log.slice(0,8);

        addGameLog(`🏆 ${b.bossName} derrotado`);
        showMapBanner(`🏆 ¡Venciste a ${b.bossName}!`);

        // ===== FINAL DEL JUEGO =====
        if(b.bossId === "dragon"){
            addGameLog("🎉 ¡Felicitaciones! Derrotaste al Dragón Final y completaste ST Quest.");
            alert("🎉 ¡Felicidades! Terminaste ST Quest.");
        }

        pulseFx("level");
        beep(920,.12,"triangle",.03);

        checkLevelUp();

    }else{

        state.battleLosses++;

        addGameLog(`💥 Caíste contra ${b.bossName}`);

        pulseFx("bad");
        beep(120,.12,"sawtooth",.03);
    }

    state.battle.question = null;
    state.battle.hiddenWrongIndex = null;

    saveState();

    refreshStats();
    refreshGameHud();

    renderBattle();
    renderInventory();
    renderShop();
    renderAchievements();

    updateAchievements();

    syncWorldButtons();
}

function answerBattle(idx){
  if(!state.battle || !state.battle.active) return;
  const q = state.battle.question || currentBattleQuestion();
  if(!q) return;
  const ok = isAnswerCorrect(q, idx);
  const conceptNote = getConceptNote(q);
  if(conceptNote){
    addGameLog(`🔀 "${conceptNote.label}" se repite entre temas: ${conceptNote.tip}`);
  }

  // Registro de respuestas del combate: se muestra en el panel lateral
  // "Registro de respuestas", con la definición/explicación de la
  // pregunta sea o no correcta la respuesta dada.
  state.battle.answerLog ??= [];
  state.battle.answerLog.unshift({
    question: q.question,
    given: givenAnswerText(q, idx),
    correct: correctAnswerText(q),
    ok,
    explanation: q.explanation || ''
  });
  if(state.battle.answerLog.length > 30){
    state.battle.answerLog.length = 30;
  }

  const difficultyBonus = q.difficulty * 2;
  if(ok){
    state.battle.bossHp = Math.max(0, state.battle.bossHp - 1);
    state.battle.streak += 1;
    state.hero.xp += 4 + difficultyBonus;
    state.hero.coins += 1 + Math.floor(q.difficulty / 2);
    checkLevelUp();
    addGameLog('✅ Golpe crítico por respuesta correcta');
    pulseFx('good');
    beep(820,.05,'sine',.02);
  } else {
    state.battle.streak = 0;
    if(state.battle.shield){
      state.battle.shield = false;
      renderBattle();
        renderInventory();
      addGameLog('🛡️ El escudo absorbió el error');
      pulseFx('buy');
      beep(300,.05,'triangle',.015);
    } else {
      state.battle.playerHp = Math.max(0, state.battle.playerHp - 1);
      addGameLog('❌ Respuesta incorrecta');
      pulseFx('bad');
      beep(180,.09,'square',.02);
    }
  }
  trackAnswer(q, ok);
  state.questionLastSeenBattle ??= {};
  state.questionLastSeenBattle[q.id] = state.battleCounter || 0;
  state.battle.hiddenWrongIndex = null;
  if(state.battle.playerHp <= 0){
    finishBattle(false);
    return;
  }
  if(state.battle.bossHp <= 0){
    finishBattle(true);
    return;
  }
  nextBattleQuestion();
  saveState();
  refreshStats();
  renderBattle();
  renderInventory();
  renderShop();
  renderAchievements();
}

// Revancha contra un jefe ya derrotado, disparada desde el panel
// "Jefes" del combate en vez de tener que volver a caminar hasta él en
// el mapa. Arma el mismo objeto "enemy" que usa el encuentro normal
// (ver el listener de btnEncounterFight), pero fija originWorld
// explícitamente con el mundo del jefe: si no lo hiciéramos,
// beginEncounter() rotaría el tema según state.game.world (el mundo
// donde está parado el jugador ahora), que puede no coincidir con la
// zona del jefe si se pide la revancha desde otro lado.
function refightBoss(npcId){
  const n = MAP.npcs.find(m => m.id === npcId && m.isBoss);
  if(!n) return;
  beginEncounter({
    id: n.id,
    themeId: n.themeId,
    originWorld: Array.isArray(n.worlds) ? n.worlds[0] : n.originWorld,
    hp: n.hp,
    rewardXp: n.rewardXp,
    rewardCoins: n.rewardCoins,
    desc: n.desc,
    isBoss: true
  });
}

function resetBattle(){
  if(state.battle && state.battle.timer) clearInterval(state.battle.timer);
  state.battle.active = false;
  state.battle.question = null;
  state.battle.hiddenWrongIndex = null;
  state.battle.currentOrder = null; // <- Agregá esta línea
  renderBattle();
}

function bindSpecialPanels(){
  const battleOptions = document.getElementById('battleOptions');
  battleOptions?.addEventListener('click', e => {
    // Preguntas de selección múltiple: cada click marca/desmarca esa
    // opción nada más. La pregunta recién se resuelve al tocar "Atacar".
    const multiBtn = e.target.closest('[data-battle-multi]');
    if(multiBtn){
      if(!state.battle) return;
      const i = Number(multiBtn.dataset.battleMulti);
      state.battle.selectedMulti = Array.isArray(state.battle.selectedMulti) ? state.battle.selectedMulti : [];
      const pos = state.battle.selectedMulti.indexOf(i);
      if(pos >= 0) state.battle.selectedMulti.splice(pos, 1); else state.battle.selectedMulti.push(i);
      multiBtn.classList.toggle('selected');
      return;
    }
    const multiSubmit = e.target.closest('#battleMultiSubmit');
    if(multiSubmit){
      const selection = (state.battle && Array.isArray(state.battle.selectedMulti)) ? [...state.battle.selectedMulti] : [];
      if(!selection.length){
        addGameLog('⚔️ Marcá al menos una opción antes de atacar.');
        return;
      }
      answerBattle(selection);
      return;
    }
    const btn = e.target.closest('[data-battle-answer]');
    if(!btn) return;
    answerBattle(Number(btn.dataset.battleAnswer));
  });
  // Panel "Jefes" del combate: un solo listener delegado alcanza aunque
  // el contenido de #bossList se reemplace en cada renderBossList().
  document.getElementById('bossList')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-refight-boss]');
    if(!btn) return;
    refightBoss(btn.dataset.refightBoss);
  });
  // Preguntas "diagram-click": la respuesta se toca sobre el propio SVG,
  // no en #battleOptions. Un solo listener delegado alcanza aunque el
  // contenido de #diagramContainer se reemplace en cada render.
  document.getElementById('diagramContainer')?.addEventListener('click', e => {
    const q = state.battle && state.battle.question;
    if(!q || q.type !== 'diagram-click') return;
    const target = e.target.closest('[data-click-answer]');
    if(!target) return;
    answerBattle(target.dataset.clickAnswer);
  });
  // Los combates ahora se inician únicamente desde el mapa.
  document.getElementById('shopList')?.addEventListener('click', e => {
    const buy = e.target.closest('[data-buy-item]');
    if(!buy) return;
    buyItem(buy.dataset.buyItem);
  });
  document.getElementById('equipShopList')?.addEventListener('click', e => {
    const buy = e.target.closest('[data-buy-equip]');
    if(!buy) return;
    buyEquipment(buy.dataset.buyEquip);
  });
  document.getElementById('inventoryList')?.addEventListener('click', e => {
    const use = e.target.closest('[data-use-item]');
    if(!use) return;
    applyBattleItem(use.dataset.useItem);
  });
  document.getElementById('equipSlots')?.addEventListener('click', e => {
    const equipBtn = e.target.closest('[data-equip]');
    if(equipBtn){ equipItem(equipBtn.dataset.equip); return; }
    const unequipBtn = e.target.closest('[data-unequip]');
    if(unequipBtn){ unequipSlot(unequipBtn.dataset.unequip); return; }
  });
  document.getElementById('btnBattleRandom')?.addEventListener('click', () => {
      go('inventory'); 
  });
  document.getElementById('btnBattleFinal')?.style.setProperty("display","none");
  document.getElementById('btnBattleReset')?.addEventListener('click', () => { resetBattle(); go('game'); });
  document.getElementById('btnExittoGame')?.addEventListener('click', () => {
      saveState(); 

      if (state.battle && state.battle.active) {
          go('battle');
      } else {
          go('game');
      }
  });
  document.getElementById('btnExitInventory')?.addEventListener('click', () => {
      saveState();

      if (state.battle && state.battle.active) {
          go('battle');
      } else {
          go('game');
      }
  });
}

function renderAllPanels(){
  renderInventory();
  renderShop();
  renderAchievements();
  renderBattle();
  updateAchievements();
}


// ===================== DEBUG MENU (Ctrl+F11) =====================
function zoneEnemySummary(){
  return WORLD_ORDER.map(w => {
    const list = getZoneEnemies(w);
    const own = list.filter(n => n.originWorld === w).length;
    const carry = list.length - own;
    return `<tr><td>${escapeHtml(worldDisplayName(w))}</td><td>${own} propios</td><td>${carry} de otras zonas</td><td><b>${list.length}/${ENEMY_RULES.cap}</b></td></tr>`;
  }).join('');
}
function buildDebugMenu(){
  if(document.getElementById('debugMenu')) return;
  const div = document.createElement('div');
  div.id = 'debugMenu';
  div.innerHTML = `
    <div class="row spaced"><h3>🛠 Debug Menu</h3><button id="dbgClose">✕</button></div>
    <div class="dbgTiny">Ctrl+F11 para abrir/cerrar.</div>

    <div class="dbgSection">
      <b>Teletransporte</b>
      <div class="dbgRow" id="dbgTeleport"></div>
    </div>

    <div class="dbgSection">
      <b>⭐ Desbloqueo total</b>
      <div class="dbgTiny">Nivel 16, todos los jefes derrotados, portales y terminal del Castillo (pc_Castle) desbloqueados, y todos los logros conseguidos.</div>
      <div class="dbgRow">
        <button data-dbg="unlockAll" style="background:linear-gradient(135deg,#7c8cff,#64e5c8);color:#0b1020;font-weight:700;border:none">🔓 Desbloquear TODO</button>
      </div>
    </div>

    <div class="dbgSection">
      <b>Recursos</b>
      <div class="dbgRow">
        <button data-dbg="coins50">+50 monedas</button>
        <button data-dbg="xp200">+200 XP</button>
        <button data-dbg="fullheal">Curar en combate</button>
      </div>
      <div class="dbgRow">
        <span class="dbgTiny">Nivel:</span>
        <input type="number" id="dbgLevelInput" min="1" max="99" value="1" />
        <button data-dbg="setlevel">Fijar nivel</button>
      </div>
    </div>

    <div class="dbgSection">
      <b>Progreso</b>
      <div class="dbgRow">
        <button data-dbg="unlockBosses">Desbloquear todos los jefes</button>
        <button data-dbg="winBattle">🏆 Ganar Batalla Actual</button>
        <button data-dbg="killCurrentBoss">💀 Matar jefe de zona</button>
      </div>
      <div class="dbgRow">
        <button data-dbg="resetBosses">Reiniciar jefes</button>
        <button data-dbg="respawnAll">Reaparecer enemigos</button>
      </div>
    </div>

    <div class="dbgSection">
      <b>Cascada de enemigos</b>
      <div class="dbgTiny">Enemigos de zonas anteriores pueden aparecer en zonas posteriores, máx. ${ENEMY_RULES.cap} por zona.</div>
      <div class="dbgRow">
        <button data-dbg="rerollEnemies">🎲 Re-generar distribución</button>
      </div>
      <table id="dbgZoneTable"></table>
    </div>

    <div class="dbgSection">
      <b>Guardado</b>
      <div class="dbgRow">
        <button data-dbg="saveNow">Guardar ahora</button>
        <button data-dbg="hardReset">⚠ Borrar todo</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  div.querySelector('#dbgTeleport').innerHTML = WORLD_DEFS.filter(w=>w.id!=='shop').map(w =>
    `<button data-dbg-tp="${w.id}">${escapeHtml(worldDisplayName(w.id))}</button>`
  ).join('');

  document.getElementById('dbgClose').addEventListener('click', toggleDebugMenu);

  div.addEventListener('click', e => {
    // 1. Manejo de Teletransporte
    const tp = e.target.closest('[data-dbg-tp]');
    if(tp){
      const id = tp.dataset.dbgTp;
      state.game.world = id;
      const spawn = WORLD_SPAWNS[id];
      if(spawn){ state.game.x = spawn.x*48; state.game.y = spawn.y*48; }
      state.game.scene = 'map';
      addGameLog(`🛠 Debug: teletransportado a ${worldDisplayName(id)}`);
      saveState();
      refreshGameHud();
      syncWorldButtons();
      go('game');
      refreshDebugMenu();
      return;
    }

    // 2. Manejo de Botones de Acción
    const btn = e.target.closest('[data-dbg]');
    if(!btn) return;
    const action = btn.dataset.dbg;

    if(action === 'coins50'){ state.hero.coins += 50; addGameLog('🛠 Debug: +50 monedas'); }
    if(action === 'xp200'){ state.hero.xp += 200; checkLevelUp(); addGameLog('🛠 Debug: +200 XP'); }
    if(action === 'fullheal'){
      if(state.battle && state.battle.active){ state.battle.playerHp = state.battle.playerMaxHp; addGameLog('🛠 Debug: vida restaurada'); }
      else addGameLog('🛠 Debug: no hay combate activo.');
    }
    if(action === 'setlevel'){
      const v = Math.max(1, Math.min(99, Number(document.getElementById('dbgLevelInput').value) || 1));
      state.hero.level = v;
      state.hero.xp = 0;
      addGameLog(`🛠 Debug: nivel fijado a ${v}`);
    }
    
    // --- NUEVAS OPCIONES ---
    if(action === 'winBattle'){
      if(state.battle && state.battle.active){
        finishBattle(true);
        addGameLog('🛠 Debug: batalla ganada');
      } else {
        addGameLog('🛠 Debug: no hay batalla activa');
      }
    }
    if(action === 'killCurrentBoss'){
      const boss = MAP.npcs.find(n => n.worlds?.includes(state.game.world) && n.isBoss);
      const bossDef = BOSS_DEFS.find(b => b.npcId === boss?.id);
      if(bossDef && !state.bossesDefeated.includes(bossDef.id)){
        state.bossesDefeated.push(bossDef.id);
        state.defeatedNpcs.push(boss.id);
        addGameLog(`🛠 Debug: jefe ${enemyDisplayName(boss)} eliminado`);
        syncWorldButtons();
      } else {
        addGameLog('🛠 Debug: no hay jefe vivo en esta zona');
      }
    }
    if(action === 'unlockBosses'){
      // OJO: BOSS_DEFS.id (ej. 'sql','rel') NO es lo mismo que el id del
      // NPC (ej. 'sqlboss','relboss'), que es lo que realmente usan
      // WORLD_EXIT_PORTALS / isWorldProgressLocked / allZoneBossesDefeated
      // para decidir si un portal o el terminal del Castillo está
      // desbloqueado. Hay que guardar los ids de NPC, no los de BOSS_DEFS.
      state.bossesDefeated = MAP.npcs.filter(n => n.isBoss).map(n => n.id);
      addGameLog('🛠 Debug: todos los jefes desbloqueados');
      syncWorldButtons();
    }
    if(action === 'unlockAll'){
      // Nivel 16 = minLevel de la zona 'boss' (el Castillo), la más alta
      // del juego, así que también desbloquea el resto de las zonas.
      state.hero.level = 16;
      state.hero.xp = 0;

      // Derrota a TODOS los jefes reales del mapa usando el id de NPC
      // (mismo valor que consultan los portales y castle_pc).
      const allBossNpcIds = MAP.npcs.filter(n => n.isBoss).map(n => n.id);
      state.bossesDefeated = allBossNpcIds.slice();
      state.defeatedNpcs = Array.from(new Set([...(state.defeatedNpcs || []), ...allBossNpcIds]));

      // Desbloquea todos los logros (con sus recompensas de xp/monedas).
      ACHIEVEMENT_DEFS.forEach(def => unlockAchievement(def.id));

      checkLevelUp();
      syncWorldButtons();
      addGameLog('🛠 Debug: TODO desbloqueado — jefes, portales, terminal del Castillo (pc_Castle), logros y nivel 16.');
    }
    // -----------------------

    if(action === 'resetBosses'){ state.bossesDefeated = []; addGameLog('🛠 Debug: jefes reiniciados'); }
    if(action === 'respawnAll'){ state.defeatedNpcs = []; addGameLog('🛠 Debug: enemigos reaparecidos'); }
    if(action === 'rerollEnemies'){ rerollZoneEnemies(); addGameLog('🛠 Debug: distribución de enemigos regenerada'); }
    if(action === 'saveNow'){ saveState(); addGameLog('🛠 Debug: guardado manual'); }
    if(action === 'hardReset'){ if(confirm('¿Borrar todo el progreso?')) resetAll(); }

    saveState();
    refreshStats();
    refreshGameHud();
    syncWorldButtons();
    renderBattle();
    renderInventory();
    renderShop();
    refreshDebugMenu();
  });

  refreshDebugMenu();
}
function refreshDebugMenu(){
  const table = document.getElementById('dbgZoneTable');
  if(table) table.innerHTML = zoneEnemySummary();
  const lvlInput = document.getElementById('dbgLevelInput');
  if(lvlInput && document.activeElement !== lvlInput) lvlInput.value = state.hero.level;
}
function toggleDebugMenu(){
  buildDebugMenu();
  const el = document.getElementById('debugMenu');
  el.classList.toggle('open');
  if(el.classList.contains('open')) refreshDebugMenu();
}

/* ===================== SELECTOR DE MATERIA ===================== */
function readHiddenBuiltins(){
  try {
    const h = JSON.parse(localStorage.getItem(window.__DBQUEST_HIDDEN_KEY__) || '[]');
    return Array.isArray(h) ? h : [];
  } catch(e){ return []; }
}
function writeHiddenBuiltins(h){
  localStorage.setItem(window.__DBQUEST_HIDDEN_KEY__, JSON.stringify(h));
}
function readBuiltinOverrides(){
  try {
    const o = JSON.parse(localStorage.getItem(window.__DBQUEST_OVERRIDES_KEY__) || '{}');
    return (o && typeof o === 'object') ? o : {};
  } catch(e){ return {}; }
}
function writeBuiltinOverrides(o){
  localStorage.setItem(window.__DBQUEST_OVERRIDES_KEY__, JSON.stringify(o));
}
// Materias visibles en el selector: builtins no ocultadas + personalizadas.
function subjectRegistryList(){
  var custom = [];
  try { custom = JSON.parse(localStorage.getItem(window.__DBQUEST_CUSTOM_KEY__) || '[]'); } catch(e){ custom = []; }
  const hidden = readHiddenBuiltins();
  const builtins = (window.__DBQUEST_BUILTINS__ || []).filter(b => !hidden.includes(b.id));
  return builtins.concat(custom);
}
function renderSubjectMenu(){
  const list = document.getElementById('subjectList');
  if(!list) return;
  const subjects = subjectRegistryList();
  const currentId = (window.__DBQUEST_CURRENT_SUBJECT__ || {}).id;
  list.innerHTML = subjects.map(s => {
    return `<div class="subjectItem${s.id===currentId?' active':''}" data-subject-id="${escapeHtml(s.id)}">
      <span class="subjectItemName">${s.id===currentId?'✅':'📘'} ${escapeHtml(s.label)}</span>
      <span class="subjectItemDel" data-subject-del="${escapeHtml(s.id)}" title="Eliminar materia">✕</span>
    </div>`;
  }).join('') || '<div class="tiny" style="padding:8px">No hay materias.</div>';

  const labelEl = document.getElementById('subjectBtnLabel');
  if(labelEl){
    const current = subjects.find(s => s.id === currentId);
    labelEl.textContent = current ? current.label : 'Materia';
  }
}
function toggleSubjectMenu(force){
  const menu = document.getElementById('subjectMenu');
  if(!menu) return;
  const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
  menu.classList.toggle('open', open);
}
function selectSubject(id){
  if(id === (window.__DBQUEST_CURRENT_SUBJECT__ || {}).id){ toggleSubjectMenu(false); return; }
  localStorage.setItem(window.__DBQUEST_CURRENT_KEY__, id);
  location.reload();
}
// Elimina cualquier materia, sea builtin (por defecto) o personalizada.
// Las builtin no se borran de verdad -son parte del juego base-, solo se
// ocultan (quedan disponibles para restaurar desde Ajustes o desde la
// pantalla de "sin materias" si se llega a borrar todo).
function deleteSubject(id){
  const isBuiltin = (window.__DBQUEST_BUILTINS__ || []).some(s => s.id === id);

  if(isBuiltin){
    const hidden = readHiddenBuiltins();
    if(!hidden.includes(id)) hidden.push(id);
    writeHiddenBuiltins(hidden);
    const overrides = readBuiltinOverrides();
    if(overrides[id]){ delete overrides[id]; writeBuiltinOverrides(overrides); }
  } else {
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem(window.__DBQUEST_CUSTOM_KEY__) || '[]'); } catch(e){ custom = []; }
    custom = custom.filter(s => s.id !== id);
    localStorage.setItem(window.__DBQUEST_CUSTOM_KEY__, JSON.stringify(custom));
  }

  try { localStorage.removeItem('dbquest_v3base_state_' + id); } catch(e){}

  if((window.__DBQUEST_CURRENT_SUBJECT__ || {}).id === id){
    localStorage.removeItem(window.__DBQUEST_CURRENT_KEY__);
    location.reload();
    return;
  }
  renderSubjectMenu();
  renderSettingsSubjects();
}
// Vuelve a mostrar una materia builtin que estaba oculta (borrada).
function restoreBuiltinSubject(id){
  const hidden = readHiddenBuiltins().filter(h => h !== id);
  writeHiddenBuiltins(hidden);
  renderSubjectMenu();
  renderSettingsSubjects();
}
function openAddSubjectModal(){
  const overlay = document.getElementById('addSubjectOverlay');
  if(!overlay) return;
  document.getElementById('addSubjectName').value = '';
  document.getElementById('addSubjectFile').value = '';
  document.getElementById('addSubjectDiagramsFile').value = '';
  document.getElementById('addSubjectError').textContent = '';
  const saveBtn = document.getElementById('btnSaveSubject');
  if(saveBtn) saveBtn.disabled = false;
  overlay.classList.add('open');
}
function closeAddSubjectModal(){
  document.getElementById('addSubjectOverlay')?.classList.remove('open');
}
function readFileAsText(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file);
  });
}
function saveNewSubject(){
  const nameInput = document.getElementById('addSubjectName');
  const fileInput = document.getElementById('addSubjectFile');
  const diagramsInput = document.getElementById('addSubjectDiagramsFile');
  const errorEl = document.getElementById('addSubjectError');
  const name = (nameInput.value || '').trim();
  const file = fileInput.files && fileInput.files[0];
  const diagramsFile = diagramsInput.files && diagramsInput.files[0];
  errorEl.textContent = '';
  if(!name){ errorEl.textContent = 'Poné un nombre para la materia.'; return; }
  if(!file){ errorEl.textContent = 'Elegí un archivo .js con el banco de preguntas.'; return; }

  const saveBtn = document.getElementById('btnSaveSubject');
  if(saveBtn) saveBtn.disabled = true;

  Promise.resolve()
    .then(() => readFileAsText(file))
    .then(content => {
      if(!/QUESTION_BANK/.test(content)){
        throw new Error('El archivo de preguntas no parece definir QUESTION_BANK. Revisá que sea el archivo correcto.');
      }
      // El archivo de diagramas es opcional: si no se eligió ninguno,
      // seguimos directo con diagramsContent = null (la materia queda
      // sin diagramas, cubierta por el stub de buildDiagramSVG del motor).
      if(!diagramsFile) return { content, diagramsContent: null };
      return readFileAsText(diagramsFile).then(diagramsContent => {
        if(!/buildDiagramSVG/.test(diagramsContent)){
          throw new Error('El archivo de diagramas no parece definir buildDiagramSVG. Revisá que sea el archivo correcto (ver dbdiagrams.js como referencia).');
        }
        return { content, diagramsContent };
      });
    })
    .then(({ content, diagramsContent }) => {
      const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
      let custom = [];
      try { custom = JSON.parse(localStorage.getItem(window.__DBQUEST_CUSTOM_KEY__) || '[]'); } catch(e){ custom = []; }
      const entry = { id, label: name, kind: 'content', value: content };
      if(diagramsContent) entry.diagrams = diagramsContent;
      custom.push(entry);
      localStorage.setItem(window.__DBQUEST_CUSTOM_KEY__, JSON.stringify(custom));
      localStorage.setItem(window.__DBQUEST_CURRENT_KEY__, id);
      location.reload();
    })
    .catch(err => {
      errorEl.textContent = (err && err.message) || 'No se pudo agregar la materia. Intentá de nuevo.';
      if(saveBtn) saveBtn.disabled = false;
    });
}

// ===================== EDITAR MATERIA (Ajustes) =====================
// Permite, para cualquier materia (builtin o personalizada), reemplazar
// el banco de preguntas y/o agregar o reemplazar el archivo de
// diagramas, sin tener que borrarla y volver a crearla. Para las
// builtin esto se guarda como un "override" aparte (el archivo
// original del juego no se toca); para las personalizadas se edita
// directamente la entrada guardada.
let editSubjectTargetId = null;

function openEditSubjectModal(id){
  const subjects = subjectRegistryList();
  const subject = subjects.find(s => s.id === id);
  if(!subject) return;
  editSubjectTargetId = id;

  const overlay = document.getElementById('editSubjectOverlay');
  if(!overlay) return;
  document.getElementById('editSubjectName').value = subject.label || '';
  document.getElementById('editSubjectFile').value = '';
  document.getElementById('editSubjectDiagramsFile').value = '';
  document.getElementById('editSubjectError').textContent = '';

  const isBuiltin = (window.__DBQUEST_BUILTINS__ || []).some(s => s.id === id);
  const overrides = readBuiltinOverrides();
  const hasDiagrams = isBuiltin
    ? !!(overrides[id]?.diagrams || subject.diagrams)
    : !!subject.diagrams;

  document.getElementById('editSubjectHint').textContent = isBuiltin
    ? 'Esta es una materia incluida en el juego. Si subís un archivo, se guarda como una versión propia tuya (el archivo original no se toca) y se usa en su lugar.'
    : 'Dejá los archivos vacíos para mantener lo que ya tiene esta materia.';
  document.getElementById('editSubjectDiagramsStatus').textContent = hasDiagrams
    ? 'Esta materia ya tiene diagramas cargados. Subí un archivo para reemplazarlos.'
    : 'Esta materia no tiene diagramas cargados todavía.';

  const saveBtn = document.getElementById('btnSaveEditSubject');
  if(saveBtn) saveBtn.disabled = false;
  overlay.classList.add('open');
}
function closeEditSubjectModal(){
  document.getElementById('editSubjectOverlay')?.classList.remove('open');
  editSubjectTargetId = null;
}
function saveEditedSubject(){
  const id = editSubjectTargetId;
  if(!id) return;

  const nameInput = document.getElementById('editSubjectName');
  const fileInput = document.getElementById('editSubjectFile');
  const diagramsInput = document.getElementById('editSubjectDiagramsFile');
  const errorEl = document.getElementById('editSubjectError');
  const name = (nameInput.value || '').trim();
  const file = fileInput.files && fileInput.files[0];
  const diagramsFile = diagramsInput.files && diagramsInput.files[0];
  errorEl.textContent = '';
  if(!name){ errorEl.textContent = 'Poné un nombre para la materia.'; return; }

  const saveBtn = document.getElementById('btnSaveEditSubject');
  if(saveBtn) saveBtn.disabled = true;

  Promise.resolve()
    .then(() => file ? readFileAsText(file) : null)
    .then(content => {
      if(content != null && !/QUESTION_BANK/.test(content)){
        throw new Error('El archivo de preguntas no parece definir QUESTION_BANK. Revisá que sea el archivo correcto.');
      }
      if(!diagramsFile) return { content, diagramsContent: undefined };
      return readFileAsText(diagramsFile).then(diagramsContent => {
        if(!/buildDiagramSVG/.test(diagramsContent)){
          throw new Error('El archivo de diagramas no parece definir buildDiagramSVG. Revisá que sea el archivo correcto (ver dbdiagrams.js como referencia).');
        }
        return { content, diagramsContent };
      });
    })
    .then(({ content, diagramsContent }) => {
      const isBuiltin = (window.__DBQUEST_BUILTINS__ || []).some(s => s.id === id);

      if(isBuiltin){
        const overrides = readBuiltinOverrides();
        const entry = overrides[id] || {};
        if(content != null) entry.value = content;
        if(diagramsContent !== undefined) entry.diagrams = diagramsContent;
        overrides[id] = entry;
        writeBuiltinOverrides(overrides);
        // El nombre de una materia builtin no se renombra (es parte del
        // juego base); solo se guardan los reemplazos de contenido.
      } else {
        let custom = [];
        try { custom = JSON.parse(localStorage.getItem(window.__DBQUEST_CUSTOM_KEY__) || '[]'); } catch(e){ custom = []; }
        const idx = custom.findIndex(s => s.id === id);
        if(idx === -1) throw new Error('No se encontró la materia a editar.');
        custom[idx].label = name;
        if(content != null) custom[idx].value = content;
        if(diagramsContent !== undefined) custom[idx].diagrams = diagramsContent;
        localStorage.setItem(window.__DBQUEST_CUSTOM_KEY__, JSON.stringify(custom));
      }

      location.reload();
    })
    .catch(err => {
      errorEl.textContent = (err && err.message) || 'No se pudo guardar la materia. Intentá de nuevo.';
      if(saveBtn) saveBtn.disabled = false;
    });
}
// Lista de materias en Ajustes: incluye tanto las visibles (con botón
// Editar/Eliminar) como las builtin ocultadas (con botón Restaurar).
function renderSettingsSubjects(){
  const box = document.getElementById('settingsSubjectsList');
  if(!box) return;

  const hidden = readHiddenBuiltins();
  const visible = subjectRegistryList();
  const currentId = (window.__DBQUEST_CURRENT_SUBJECT__ || {}).id;
  const hiddenBuiltins = (window.__DBQUEST_BUILTINS__ || []).filter(b => hidden.includes(b.id));

  const visibleHtml = visible.map(s => `
    <div class="qitem" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span>${s.id===currentId?'✅':'📘'} ${escapeHtml(s.label)}</span>
      <span class="row" style="gap:6px">
        <button class="btn" style="padding:6px 10px" data-settings-edit="${escapeHtml(s.id)}">✏️ Editar</button>
        <button class="btn" style="padding:6px 10px" data-settings-del="${escapeHtml(s.id)}">🗑️ Eliminar</button>
      </span>
    </div>
  `).join('');

  const hiddenHtml = hiddenBuiltins.map(s => `
    <div class="qitem" style="display:flex;align-items:center;justify-content:space-between;gap:8px;opacity:.6">
      <span>🚫 ${escapeHtml(s.label)} <span class="tiny">(eliminada)</span></span>
      <button class="btn" style="padding:6px 10px" data-settings-restore="${escapeHtml(s.id)}">↩️ Restaurar</button>
    </div>
  `).join('');

  box.innerHTML = (visibleHtml + hiddenHtml) || '<div class="qitem">No hay materias.</div>';
}
function initSubjectPicker(){
  renderSubjectMenu();
  renderSettingsSubjects();
  document.getElementById('btnSubjectPicker')?.addEventListener('click', e => { e.stopPropagation(); toggleSubjectMenu(); });
  document.getElementById('subjectList')?.addEventListener('click', e => {
    const del = e.target.closest('[data-subject-del]');
    if(del){
      e.stopPropagation();
      if(confirm('¿Eliminar esta materia y su progreso guardado?')) deleteSubject(del.dataset.subjectDel);
      return;
    }
    const item = e.target.closest('[data-subject-id]');
    if(item) selectSubject(item.dataset.subjectId);
  });
  document.addEventListener('click', e => {
    const picker = document.getElementById('subjectPicker');
    if(picker && !picker.contains(e.target)) toggleSubjectMenu(false);
  });
  document.getElementById('btnAddSubject')?.addEventListener('click', () => { toggleSubjectMenu(false); openAddSubjectModal(); });
  document.getElementById('btnSaveSubject')?.addEventListener('click', saveNewSubject);
  document.getElementById('btnCancelSubject')?.addEventListener('click', closeAddSubjectModal);
  document.getElementById('addSubjectOverlay')?.addEventListener('click', e => {
    if(e.target.id === 'addSubjectOverlay') closeAddSubjectModal();
  });

  document.getElementById('btnSaveEditSubject')?.addEventListener('click', saveEditedSubject);
  document.getElementById('btnCancelEditSubject')?.addEventListener('click', closeEditSubjectModal);
  document.getElementById('editSubjectOverlay')?.addEventListener('click', e => {
    if(e.target.id === 'editSubjectOverlay') closeEditSubjectModal();
  });
  document.getElementById('settingsSubjectsList')?.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-settings-edit]');
    if(editBtn){ openEditSubjectModal(editBtn.dataset.settingsEdit); return; }
    const delBtn = e.target.closest('[data-settings-del]');
    if(delBtn){
      if(confirm('¿Eliminar esta materia y su progreso guardado?')) deleteSubject(delBtn.dataset.settingsDel);
      return;
    }
    const restoreBtn = e.target.closest('[data-settings-restore]');
    if(restoreBtn){ restoreBuiltinSubject(restoreBtn.dataset.settingsRestore); return; }
  });

  document.getElementById('btnCustomBattle')?.addEventListener('click', openCustomBattleModal);
  document.getElementById('btnCancelCustomBattle')?.addEventListener('click', closeCustomBattleModal);
  document.getElementById('btnStartCustomBattle')?.addEventListener('click', startCustomBattle);
  document.getElementById('customBattleOverlay')?.addEventListener('click', e => {
    if(e.target.id === 'customBattleOverlay') closeCustomBattleModal();
  });
  document.getElementById('customBattleBossList')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-boss-id]');
    if(!btn) return;
    customBattleBossId = btn.dataset.bossId;
    renderCustomBattleModal(MAP.npcs.filter(n => n.isBoss));
  });
  document.getElementById('customBattleMultiplier')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-mult]');
    if(!btn) return;
    customBattleMultiplier = Number(btn.dataset.mult);
    renderCustomBattleModal(MAP.npcs.filter(n => n.isBoss));
  });
}
/* =================== FIN SELECTOR DE MATERIA ==================== */

// ===================== NOMBRE DEL HÉROE =====================
// Modal con teclado en pantalla estilo videojuego retro (Pokémon y
// compañía) para elegir el nombre del héroe. Se usa en dos casos:
//  1) Forzado, sin botón Cancelar, la primera vez que se abre el juego
//     en este navegador (ver isBrandNewSave más arriba).
//  2) Opcional, con Cancelar, desde Ajustes > Héroe > "Cambiar nombre",
//     para partidas ya empezadas.
const HERO_NAME_MAX = 12;
let heroNameDraft = '';
let heroNameForced = false;
let heroKeySelected = 0;

function heroKeyboardButtons(){
  return [...document.querySelectorAll('#heroKeyboard .heroKey')];
}
function heroKeyboardColumns(){
  const grid = document.getElementById('heroKeyboard');
  if(!grid) return 7;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  return cols || 7;
}
function updateHeroKeySelection(){
  const buttons = heroKeyboardButtons();
  if(!buttons.length) return;
  if(heroKeySelected < 0) heroKeySelected = 0;
  if(heroKeySelected > buttons.length - 1) heroKeySelected = buttons.length - 1;
  buttons.forEach((b,i) => b.classList.toggle('kbdFocus', i === heroKeySelected));
  buttons[heroKeySelected].scrollIntoView({ block:'nearest' });
}
function moveHeroKeySelection(dx, dy){
  const buttons = heroKeyboardButtons();
  if(!buttons.length) return;
  const cols = heroKeyboardColumns();
  let idx = heroKeySelected;
  if(dx !== 0){
    idx = Math.max(0, Math.min(buttons.length - 1, idx + dx));
  } else if(dy !== 0){
    const next = idx + dy * cols;
    if(next >= 0 && next < buttons.length) idx = next;
  }
  heroKeySelected = idx;
  updateHeroKeySelection();
}
function pressHeroKeySelected(){
  heroKeyboardButtons()[heroKeySelected]?.click();
}
function isTypingTarget(el){
  if(!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function renderHeroNameDisplay(){
  const disp = document.getElementById('heroNameDisplay');
  if(disp) disp.innerHTML = `${escapeHtml(heroNameDraft)}<span class="heroNameCursor">_</span>`;
  const btn = document.getElementById('btnConfirmHeroName');
  if(btn) btn.disabled = heroNameDraft.trim().length === 0;
  const err = document.getElementById('heroNameError');
  if(err) err.textContent = '';
}

function openHeroNameModal(forced){
  heroNameForced = forced;
  heroNameDraft = (!forced && state.hero.name) ? state.hero.name : '';
  const title = document.getElementById('heroNameTitle');
  const subtitle = document.getElementById('heroNameSubtitle');
  const cancelBtn = document.getElementById('btnCancelHeroName');
  if(title) title.textContent = forced ? '¡Bienvenido! ¿Cómo se llama tu héroe?' : 'Cambiar nombre del héroe';
  if(subtitle) subtitle.textContent = forced
    ? 'Elegí un nombre con el teclado de abajo. Lo vas a poder cambiar después desde Ajustes.'
    : 'Elegí el nuevo nombre con el teclado de abajo.';
  if(cancelBtn) cancelBtn.style.display = forced ? 'none' : '';
  renderHeroNameDisplay();
  heroKeySelected = 0;
  updateHeroKeySelection();
  keys.left = keys.right = keys.up = keys.down = false;
  document.getElementById('heroNameOverlay')?.classList.add('open');
}
function closeHeroNameModal(){
  document.getElementById('heroNameOverlay')?.classList.remove('open');
}
function confirmHeroName(){
  const name = heroNameDraft.trim().slice(0, HERO_NAME_MAX);
  if(!name){
    const err = document.getElementById('heroNameError');
    if(err) err.textContent = 'Escribí al menos una letra.';
    return;
  }
  const wasForced = heroNameForced;
  state.hero.name = name;
  saveState();
  refreshHeroNameDisplays();
  closeHeroNameModal();
  if(wasForced){
    localStorage.removeItem(FORCE_HERO_NAME_KEY);
    addGameLog(`👋 ¡Bienvenido, ${name}! Que empiece la aventura.`);
  }
}
function refreshHeroNameDisplays(){
  const label = state.hero.name || '-';
  const hud = document.getElementById('hudHeroName');
  if(hud) hud.textContent = label;
  const settingsLabel = document.getElementById('settingsHeroNameLabel');
  if(settingsLabel) settingsLabel.textContent = label;
}

// Detecta si conviene mostrar los controles táctiles flotantes sobre el
// canvas (botón de Interactuar, Pelear/Huir en encuentros). Se apoya en
// dos señales: que el dispositivo acepte touch, y que la pantalla sea
// chica (para no mostrarlos en una notebook con pantalla táctil grande).
// Corre al arrancar y de nuevo si gira la pantalla o cambia el tamaño de
// ventana (p.ej. al abrir/cerrar el teclado en Android).
function detectTouchControls(){
  document.body.classList.toggle('forceMobileControls', isLikelyMobileDevice());
}
detectTouchControls();
window.addEventListener('resize', detectTouchControls);
window.addEventListener('orientationchange', detectTouchControls);

// Cajón (drawer) del panel lateral del Juego (Estado/Controles/Log/
// Acciones rápidas) en pantallas angostas: ver el botón flotante ☰ y el
// CSS de #gameHud. Se cierra solo si la ventana vuelve a ser lo bastante
// ancha como para que el panel entre al lado del canvas de nuevo.
function openGameHudDrawer(){
  document.getElementById('gameHud')?.classList.add('open');
  document.getElementById('gameHudBackdrop')?.classList.add('open');
}
function closeGameHudDrawer(){
  document.getElementById('gameHud')?.classList.remove('open');
  document.getElementById('gameHudBackdrop')?.classList.remove('open');
}
function toggleGameHudDrawer(){
  document.getElementById('gameHud')?.classList.contains('open') ? closeGameHudDrawer() : openGameHudDrawer();
}
window.addEventListener('resize', () => { if(window.innerWidth > 960) closeGameHudDrawer(); });

function init(){
  els = {
    topicChips: document.getElementById('topicChips'),
    questionMeta: document.getElementById('questionMeta'),
    studyQuestion: document.getElementById('studyQuestion'),
    studyOptions: document.getElementById('studyOptions'),
    studyFeedback: document.getElementById('studyFeedback'),
    bankList: document.getElementById('bankList'),
    searchBox: document.getElementById('searchBox'),
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnRandom: document.getElementById('btnRandom'),
    btnFavorite: document.getElementById('btnFavorite'),
    btnResetAll: document.getElementById('btnResetAll'),
    btnResetAllSettings: document.getElementById('btnResetAllSettings'),
    resetWipesInventory: document.getElementById('resetWipesInventory'),
    statAnswered: document.getElementById('statAnswered'),
    statUniqueAnswered: document.getElementById('statUniqueAnswered'),
    statRepeatedAnswered: document.getElementById('statRepeatedAnswered'),
    statAccuracy: document.getElementById('statAccuracy'),
    statLevel: document.getElementById('statLevel'),
    statsBox: document.getElementById('statsBox'),
    topicStats: document.getElementById('topicStats'),
    examCount: document.getElementById('examCount'),
    examCountCustom: document.getElementById('examCountCustom'),
    examTime: document.getElementById('examTime'),
    examAnswerSounds: document.getElementById('examAnswerSounds'),
    lockBack: document.getElementById('lockBack'),
    btnStartExam: document.getElementById('btnStartExam'),
    btnExitExam: document.getElementById('btnExitExam'),
    examConfigView: document.getElementById('examConfigView'),
    examRunView: document.getElementById('examRunView'),
    btnPrevExam: document.getElementById('btnPrevExam'),
    btnNextExam: document.getElementById('btnNextExam'),
    btnSubmitExam: document.getElementById('btnSubmitExam'),
    examMeta: document.getElementById('examMeta'),
    examTimer: document.getElementById('examTimer'),
    examQuestion: document.getElementById('examQuestion'),
    examDiagram: document.getElementById('examDiagramContainer'),
    examOptions: document.getElementById('examOptions'),
    examFeedback: document.getElementById('examFeedback'),
    examProgress: document.getElementById('examProgress'),
    examProgressText: document.getElementById('examProgressText'),
    examAnswered: document.getElementById('examAnswered'),
    examPending: document.getElementById('examPending'),
    sceneName: document.getElementById('sceneName'),
    hudScene: document.getElementById('hudScene'),
    hudPos: document.getElementById('hudPos'),
    hudCoins: document.getElementById('hudCoins'),
    hudXp: document.getElementById('hudXp'),
    hudLevel: document.getElementById('hudLevel'),
    hudLives: document.getElementById('hudLives'),
    hudXpBar: document.getElementById('hudXpBar'),
    worldGrid: document.getElementById('worldGrid'),
    encounterPanel: document.getElementById('encounterPanel'),
    encounterName: document.getElementById('encounterName'),
    encounterDesc: document.getElementById('encounterDesc'),
    btnEncounterFight: document.getElementById('btnEncounterFight'),
    btnEncounterFlee: document.getElementById('btnEncounterFlee'),
    btnActionMobile: document.getElementById('btnActionMobile'),
    encounterPanelMobile: document.getElementById('encounterPanelMobile'),
    btnEncounterFightMobile: document.getElementById('btnEncounterFightMobile'),
    btnEncounterFleeMobile: document.getElementById('btnEncounterFleeMobile'),
    gameLog: document.getElementById('gameLog'),
    btnSceneMenu: document.getElementById('btnSceneMenu'),
    btnSceneMap: document.getElementById('btnSceneMap'),
    btnBattleRandom: document.getElementById('btnBattleRandom'),
    btnBattleFinal: document.getElementById('btnBattleFinal'),
    btnBattleReset: document.getElementById('btnBattleReset'),
    bossList: document.getElementById('bossList'),
    battleAnswerLog: document.getElementById('battleAnswerLog'),
    battlePlayerHp: document.getElementById('battlePlayerHp'),
    battleEnemyName: document.getElementById('battleEnemyName'),
    battleEnemyHp: document.getElementById('battleEnemyHp'),
    battlePlayerBar: document.getElementById('battlePlayerBar'),
    battleEnemyBar: document.getElementById('battleEnemyBar'),
    battleTimerBar: document.getElementById("battleTimerBar"),
    battleTimerText: document.getElementById("battleTimerText"),
    battleMeta: document.getElementById('battleMeta'),
    battleQuestion: document.getElementById('battleQuestion'),
    battleOptions: document.getElementById('battleOptions'),
    battleFeedback: document.getElementById('battleFeedback'),
    battleStreak: document.getElementById('battleStreak'),
    battleWins: document.getElementById('battleWins'),
    battleLosses: document.getElementById('battleLosses'),
    shopList: document.getElementById('shopList'),
    equipShopList: document.getElementById('equipShopList'),
    inventoryQuick: document.getElementById('inventoryQuick'),
    inventoryList: document.getElementById('inventoryList'),
    equipSlots: document.getElementById('equipSlots'),
    specialItemsList: document.getElementById('specialItemsList'),
    inventoryProgress: document.getElementById('inventoryProgress'),
    invCoins: document.getElementById('invCoins'),
    invXp: document.getElementById('invXp'),
    achievementList: document.getElementById('achievementList'),
    achievementSummary: document.getElementById('achievementSummary'),
    achUnlocked: document.getElementById('achUnlocked'),
    achTotal: document.getElementById('achTotal'),
    lastExamBox: document.getElementById('lastExamBox'),
    examHistoryBox: document.getElementById('examHistoryBox')
  };

  renderTopicChips();
  renderFilters();
  renderExamTopicSelect();
  renderExamDifficultySelect();
  renderControlsList();
  renderInterfaceScaleChips();
  syncMobileDetection();
  window.addEventListener('orientationchange', syncMobileDetection);
  document.addEventListener('visibilitychange', () => { if(!document.hidden) syncMobileDetection(); });
  renderStudy();
  renderBank();
  refreshStats();
  renderLastExam();
  renderExamHistory();
  syncWorldButtons();
  renderGameLog();
  renderAllPanels();
  refreshGameHud();
  bindEvents();
  initSubjectPicker();
  bindGameControls();
  resizeCanvas();
  drawGameScene();
  initGameLoop();
  initGameAutosave();
  refreshHeroNameDisplays();
  go('home');
}

init();

// ===================== BOTÓN FLOTANTE GEMINI =====================
// Abre gemini.google.com/app en una ventana chica reutilizable: si ya
// hay una abierta (y no la cerraron), un segundo clic solo la enfoca en
// vez de abrir una nueva cada vez.
let geminiWindow = null;

function abrirGeminiVentana(){
  const url = 'https://claude.ai/new';

  const width = 420;
  const height = 700;

  const left = window.screenX + window.innerWidth - width - 30;
  const top = window.screenY + 40;

  if(geminiWindow && !geminiWindow.closed){
    geminiWindow.focus();
    return;
  }

  geminiWindow = window.open(
    url,
    'STQUEST_GEMINI',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if(geminiWindow) geminiWindow.focus();
}

document.getElementById('btnGemini')?.addEventListener('click', abrirGeminiVentana);
// ===================== FIN BOTÓN FLOTANTE GEMINI =====================

// ===================== TOUR GUIADO DE BIENVENIDA =====================
// Se muestra una sola vez (primera vez que se abre la app en este
// navegador, ver flag en localStorage al final). Oscurece la pantalla,
// resalta con un borde rojo el elemento real de la interfaz que
// corresponde a cada paso, y en los pasos "waitClick" obliga a hacer
// clic en ese elemento (no alcanza con tocar "Siguiente") para
// asegurarse de que la persona efectivamente lo encontró.
const tutorialSteps = [
  {
    title: 'Bienvenido a Study Quest',
    content: `
      <p>Antes de empezar, te mostramos cómo configurar correctamente la aplicación.</p>
      <p>Este tour dura menos de un minuto y te muestra dónde ver las instrucciones, importar una materia y actualizar tus bancos de preguntas.</p>
    `
  },
  {
    title: 'Entrá en Instrucciones',
    target: '#btnToggleInstructions',
    waitClick: true,
    content: `
      <p>Lo primero que tenés que hacer es tocar <b>📖 Instrucciones</b>.</p>
      <p>Ahí vas a poder elegir cómo querés estudiar y aprender a importar una materia.</p>
    `
  },
  {
    title: 'Elegí tu formato de estudio',
    target: '#instructionsPanel',
    interact: true,
    content: `
      <p><b>🛑RECORDÁ PONER SI TENES: GEMNI EN PRO; CHATGPT EN MODO THINK; CLAUDE EN EFFORT MEDIUM🛑</b></p>
      <p><b>📄 Instrucciones:</b> el prompt para generar un banco de preguntas con soporte de KaTeX, sin diagramas.</p>
      <p><b>📊 Instrucciones con diagramas y gráficos:</b> lo mismo, pero sumando una biblioteca de diagramas propia de la materia.</p>
      <p>Copiá el que corresponda y pegaselo a tu IA favorita (o usá la IA integrada) junto con tu material de estudio para generar los archivos .js.</p>
      <p><b>Tomate tu tiempo para leer y si querés hace ahora todo.</b> Cuando termines, presioná <b>Siguiente</b>.</p>
    `
  },
  {
    title: 'Elegí tu materia',
    target: '#btnSubjectPicker',
    waitClick: true,
    content: `
      <p>Ahora tocá <b>📚 Materia/📚 Base de Datos</b>, arriba de todo.</p>
      <p>Desde ese menú vas a poder elegir entre tus materias o crear una nueva para importar los archivos que generaste.</p>
    `
  },
  {
    title: 'Añadir materia',
    target: '#btnAddSubject',
    waitClick: true,
    content: `
      <p>Tocá <b>+ Añadir materia</b>.</p>
      <p>Ahí vas a poder subir el archivo del banco de preguntas (y, si generaste uno, el de diagramas también).</p>
    `
  },
  {
    title: 'Actualizar una materia',
    target: '[data-nav="settings"]',
    waitClick: true,
    content: `
      <p>Si más adelante actualizás el banco de preguntas o el de diagramas, no hace falta crear la materia de nuevo.</p>
      <p>Entrá en <b>Ajustes</b> y, en la sección Materias, elegí "Editar" sobre la materia correspondiente para reemplazar los archivos.</p>
    `
  },
  {
    title: 'Todo listo',
    content: `
      <p>¡Perfecto! Ya sabés cómo configurar Study Quest, importar una materia y actualizar tus bancos de preguntas.</p>
      <p>Ahora podés empezar a estudiar o explorar el modo juego.</p>
    `
  }
];

let tutorialIndex = 0;
const TUTORIAL_FLAG_KEY = 'stquest_tutorial_v1';
let tutorialClickCleanup = null;
let tutorialWaitTimer = null;

function getTutorialElements(){
  return {
    overlay: document.getElementById('tutorialOverlay'),
    highlight: document.getElementById('tutorialHighlight'),
    nextBtn: document.getElementById('tutorialNext'),
    waitHint: document.getElementById('tutorialWaitHint'),
    launchBtn: document.getElementById('btnTutorialToggle')
  };
}

function clearTutorialStepResources(){
  if(tutorialClickCleanup){
    try { tutorialClickCleanup(); } catch(e){}
    tutorialClickCleanup = null;
  }
  if(tutorialWaitTimer){
    clearTimeout(tutorialWaitTimer);
    tutorialWaitTimer = null;
  }
}

function updateTutorialToggleButton(){
  const { overlay, launchBtn } = getTutorialElements();
  if(!launchBtn || !overlay) return;

  // Si el tutorial ya fue completado/omitido, el botón no debe volver a
  // aparecer. Al ocultarlo conservamos el mismo comportamiento del tutorial
  // durante la sesión actual, pero una vez finalizado queda deshabilitado.
  let tutorialFinished = false;
  try { tutorialFinished = localStorage.getItem(TUTORIAL_FLAG_KEY) === '1'; } catch(e){}

  if(tutorialFinished){
    launchBtn.classList.add('hidden');
    return;
  }

  const isOpen = !overlay.classList.contains('hidden');
  launchBtn.classList.remove('hidden');
  launchBtn.innerHTML = isOpen
    ? '🙈 <span>Ocultar tutorial</span>'
    : '🎓 <span>Mostrar tutorial</span>';
  launchBtn.title = isOpen ? 'Ocultar tutorial' : 'Mostrar tutorial';
  launchBtn.setAttribute('aria-label', isOpen ? 'Ocultar tutorial' : 'Mostrar tutorial');
}

function startTutorial(resetStep = true){
  const { overlay } = getTutorialElements();
  if(!overlay) return;

  if(resetStep) tutorialIndex = 0;
  clearTutorialStepResources();
  overlay.classList.remove('hidden');
  showTutorialStep();
}

function hideTutorial(){
  clearTutorialStepResources();

  const { overlay, highlight } = getTutorialElements();
  overlay?.classList.add('hidden');
  overlay?.classList.remove('clickThrough');
  if(highlight) highlight.style.display = 'none';

  updateTutorialToggleButton();
}

function finishTutorial(){
  clearTutorialStepResources();

  try { localStorage.setItem(TUTORIAL_FLAG_KEY, '1'); } catch(e){}

  const { overlay, highlight } = getTutorialElements();
  overlay?.classList.add('hidden');
  overlay?.classList.remove('clickThrough');
  if(highlight) highlight.style.display = 'none';

  updateTutorialToggleButton();
}

function showTutorialStep(){
  clearTutorialStepResources();

  const step = tutorialSteps[tutorialIndex];
  if(!step){
    finishTutorial();
    return;
  }

  const { overlay, nextBtn, waitHint } = getTutorialElements();

  document.getElementById('tutorialTitle').innerHTML = step.title;
  document.getElementById('tutorialContent').innerHTML = step.content;
  document.getElementById('tutorialProgressBar').style.width =
    ((tutorialIndex + 1) / tutorialSteps.length * 100) + '%';

  // Cuando el usuario debe tocar algo de la página, el overlay pasa a ser
  // completamente transparente y no intercepta ningún clic.
  const allowPageInteraction = !!step.waitClick || !!step.interact;
  overlay.classList.toggle('clickThrough', allowPageInteraction);

  highlightTarget(step.target);

  if(step.waitClick){
    nextBtn.style.display = 'none';
    waitHint.style.display = 'inline-flex';
    enableTargetClick(step.target);
  }else{
    waitHint.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    nextBtn.disabled = false;
    nextBtn.textContent = tutorialIndex === tutorialSteps.length - 1
      ? 'Comenzar'
      : 'Siguiente';
  }

  updateTutorialToggleButton();
}

function nextTutorialStep(){
  tutorialIndex++;
  if(tutorialIndex >= tutorialSteps.length){
    finishTutorial();
    return;
  }
  showTutorialStep();
}

function highlightTarget(selector){
  const { highlight } = getTutorialElements();

  if(!selector){
    highlight.style.display = 'none';
    return;
  }

  const el = document.querySelector(selector);
  if(!el){
    highlight.style.display = 'none';
    return;
  }

  const r = el.getBoundingClientRect();
  const fullyVisible =
    r.top >= 0 &&
    r.left >= 0 &&
    r.bottom <= window.innerHeight &&
    r.right <= window.innerWidth;

  if(!fullyVisible){
    el.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  const rect = el.getBoundingClientRect();

  highlight.style.display = 'block';
  highlight.style.left = (rect.left - 8) + 'px';
  highlight.style.top = (rect.top - 8) + 'px';
  highlight.style.width = (rect.width + 16) + 'px';
  highlight.style.height = (rect.height + 16) + 'px';
}

function enableTargetClick(selector){
  const el = document.querySelector(selector);
  if(!el) return;

  const handler = () => {
    if(tutorialClickCleanup){
      tutorialClickCleanup();
      tutorialClickCleanup = null;
    }
    nextTutorialStep();
  };

  // Capturamos el clic sin impedir la acción normal del elemento.
  el.addEventListener('click', handler, true);

  tutorialClickCleanup = () => {
    el.removeEventListener('click', handler, true);
  };
}

document.getElementById('tutorialNext')?.addEventListener('click', nextTutorialStep);
document.getElementById('tutorialSkip')?.addEventListener('click', finishTutorial);
document.getElementById('tutorialClose')?.addEventListener('click', hideTutorial);
document.getElementById('btnTutorialToggle')?.addEventListener('click', () => {
  const overlay = document.getElementById('tutorialOverlay');
  if(overlay?.classList.contains('hidden')){
    startTutorial(false);
  }else{
    hideTutorial();
  }
});

window.addEventListener('resize', () => {
  const step = tutorialSteps[tutorialIndex];
  const overlay = document.getElementById('tutorialOverlay');

  if(step && overlay && !overlay.classList.contains('hidden')){
    highlightTarget(step.target);
  }
});

// Arranca solo, una vez, en la primera visita.
// El botón flotante queda disponible para mostrarlo/ocultarlo en cualquier
// momento y retoma el paso actual del tutorial.
window.addEventListener('load', () => {
  let alreadySeen = false;
  try { alreadySeen = !!localStorage.getItem(TUTORIAL_FLAG_KEY); } catch(e){}

  updateTutorialToggleButton();

  if(!alreadySeen){
    setTimeout(() => startTutorial(true), 600);
  }
});

window.startTutorial = () => startTutorial(true);
window.hideTutorial = hideTutorial;
window.showTutorial = () => {
  // Si ya fue completado/omitido, no volver a habilitar el tutorial desde
  // llamadas externas accidentales. Solo una sesión nueva/no finalizada
  // puede mostrar el botón y abrirlo nuevamente.
  let tutorialFinished = false;
  try { tutorialFinished = localStorage.getItem(TUTORIAL_FLAG_KEY) === '1'; } catch(e){}
  if(tutorialFinished) return;
  startTutorial(false);
};
// ===================== FIN TOUR GUIADO =====================
}

});

// === FINAL JOYSTICK BINDING FIX ===
// El botón se enlaza directamente al elemento, después de que TODO el script
// ya fue definido. Así no depende de listeners globales ni del orden de carga.
(function bindJoystickToggleDirectly(){
  const bind = () => {
    const btn = document.getElementById('btnJoystickToggle');
    if(!btn || btn.__dbquestJoystickBound) return;
    btn.__dbquestJoystickBound = true;

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopImmediatePropagation();

      try {
        if(typeof state === 'undefined') return;
        state.joystickEnabled = !Boolean(state.joystickEnabled);
        if(typeof resetVirtualJoystick === 'function') resetVirtualJoystick();
        if(typeof updateJoystickUI === 'function') updateJoystickUI();
        if(typeof saveState === 'function') saveState();
      } catch(err) {
        console.error('[ST Quest] Error al cambiar joystick:', err);
      }
    });

    // Estado visual inicial.
    try {
      if(typeof updateJoystickUI === 'function') updateJoystickUI();
    } catch(err) {}
  };

  bind();
  // Por si el bloque de interfaz se reconstruye dinámicamente.
  const observer = new MutationObserver(bind);
  observer.observe(document.body, {childList:true, subtree:true});
})();
