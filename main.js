/* ===================== DUELO MATEMÁTICO ONLINE =====================
   - El anfitrión crea una sala y obtiene un código de 4 letras.
   - Los demás escriben el código y se conectan (PeerJS / WebRTC).
   - El anfitrión controla el juego; todos ven la misma pregunta.
   - El más rápido en responder bien gana 1 punto.
=================================================================== */

const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[r(0, a.length - 1)];
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TIME = 60;          // segundos por problema
const PROB_ABC = 0.8;     // 80% con opciones A, B, C y 20% para calcular
const MAX_PLAYERS = 8;    // jugadores máximos por sala
const PREFIX = 'duelo-mate-';
// Personajes para elegir (emoji, nombre)
const AVATARS = [['🐼', 'Panda'], ['🦊', 'Zorro'], ['🐯', 'Tigre'], ['🦁', 'León'], ['🐸', 'Rana'], ['🐵', 'Mono'], ['🐙', 'Pulpo'], ['🦄', 'Unicornio'], ['🐶', 'Perro'], ['🐱', 'Gato'], ['🤖', 'Robot'], ['👽', 'Alien']];

/* ---------------------- Problemas por grado ---------------------- */
const GEN = {
  6: [
    () => { const a = r(10, 60), b = r(10, 40); return { q: `${a} + ${b}`, a: a + b } },
    () => { const a = r(30, 90), b = r(5, 29); return { q: `${a} − ${b}`, a: a - b } },
    () => { const a = r(2, 10), b = r(2, 10); return { q: `${a} × ${b}`, a: a * b } },
    () => { const a = r(2, 10), b = r(2, 10); return { q: `${a * b} ÷ ${b}`, a: a } },
    () => { const a = r(1, 9), b = r(1, 9); return { q: `${a}.5 + ${b}.5`, a: a + b + 1 } },
    () => { const n = 4 * r(2, 10); return { q: `La mitad de ${n}`, a: n / 2 } },
    () => { const n = 4 * r(2, 10); return { q: `¿Cuánto es 1/4 de ${n}?`, a: n / 4 } },
    () => { const a = r(2, 15), b = r(2, 15); return { q: `Perímetro de un rectángulo de ${a} por ${b}`, a: 2 * (a + b) } },
    () => { const a = r(2, 12), b = r(2, 12); return { q: `Área de un rectángulo de ${a} por ${b}`, a: a * b } }
  ],
  7: [
    () => { const a = r(1, 9), b = r(1, 15); return { q: `(−${a}) + ${b}`, a: -a + b } },
    () => { const a = r(1, 9), b = r(1, 9); return { q: `(−${a}) × ${b}`, a: -a * b } },
    () => { const a = r(5, 20), b = r(1, 9); return { q: `${a} − (−${b})`, a: a + b } },
    () => { const x = r(1, 20), a = r(1, 20); return { q: `x + ${a} = ${x + a}. ¿Cuánto vale x?`, a: x } },
    () => { const x = r(2, 12), a = r(2, 9); return { q: `${a}x = ${a * x}. ¿Cuánto vale x?`, a: x } },
    () => { const p = r(2, 9) * 1000, n = r(2, 4), m = r(5, 9); return { q: `${n} cuadernos cuestan $${p * n}. ¿Cuánto cuestan ${m}?`, a: p * m } },
    () => { const n = 10 * r(1, 20); return { q: `El 10% de ${n}`, a: n / 10 } },
    () => { const n = 2 * r(5, 40); return { q: `El 50% de ${n}`, a: n / 2 } },
    () => { const m = r(5, 20), d = r(1, 3); return { q: `Promedio de ${m - d}, ${m} y ${m + d}`, a: m } }
  ],
  8: [
    () => { const b = r(2, 9); return { q: `${b}²`, a: b * b } },
    () => { const b = r(2, 4); return { q: `${b}³`, a: b ** 3 } },
    () => { const n = r(2, 12); return { q: `√${n * n}`, a: n } },
    () => { const x = r(1, 9), a = r(2, 5), b = r(1, 10); return { q: `${a}x + ${b} = ${a * x + b}. ¿Cuánto vale x?`, a: x } },
    () => { const x = r(1, 9), a = r(1, 9); return { q: `x − ${a} = ${x - a}. ¿Cuánto vale x?`, a: x } },
    () => { const a = r(2, 9), b = r(2, 9), c = r(2, 9); return { q: `${a} + ${b} × ${c}`, a: a + b * c } },
    () => { const t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); return { q: `Triángulo rectángulo con catetos ${t[0]} y ${t[1]}. ¿Cuánto mide la hipotenusa?`, a: t[2] } },
    () => { const b = 2 * r(2, 10), h = r(2, 10); return { q: `Área de un triángulo: base ${b}, altura ${h}`, a: b * h / 2 } }
  ],
  9: [
    () => { const a = r(1, 5), b = r(1, 9), k = r(1, 6); return { q: `Si f(x) = ${a}x + ${b}, halla f(${k})`, a: a * k + b } },
    () => { const n = r(2, 10); return { q: `x² = ${n * n}, con x positivo. ¿Cuánto vale x?`, a: n } },
    () => { const x = r(2, 10), y = r(1, x - 1); return { q: `x + y = ${x + y} y x − y = ${x - y}. ¿Cuánto vale x?`, a: x } },
    () => { const m = r(1, 5), b = r(1, 9); return { q: `En la recta y = ${m}x + ${b}, ¿cuál es la pendiente?`, a: m } },
    () => { const m = r(1, 5), b = r(1, 9); return { q: `En la recta y = ${m}x + ${b}, ¿cuánto vale y cuando x = 0?`, a: b } },
    () => { const a = r(1, 9), d = r(2, 5), n = r(3, 8); return { q: `Sucesión: empieza en ${a} y suma ${d} cada vez. ¿Cuál es el término ${n}?`, a: a + (n - 1) * d } },
    () => { const a = r(2, 9), b = r(2, 9); return { q: `(x + ${a})(x + ${b}) cuando x = 1`, a: (1 + a) * (1 + b) } }
  ],
  10: [
    () => { const t = pick([['sen 30°', 0.5], ['cos 60°', 0.5], ['tan 45°', 1], ['sen 90°', 1], ['cos 0°', 1], ['cos 90°', 0]]); return { q: `${t[0]} =`, a: t[1] } },
    () => { const t = pick([[3, 5, 0.6], [4, 5, 0.8], [6, 10, 0.6], [8, 10, 0.8]]); return { q: `Cateto opuesto ${t[0]}, hipotenusa ${t[1]}. ¿Cuánto vale el seno del ángulo?`, a: t[2] } },
    () => { const b = pick([2, 3, 10]), k = r(1, 4); return { q: `log base ${b} de ${b ** k}`, a: k } },
    () => { const a = r(1, 3), k = r(-3, 4); return { q: `Si f(x) = ${a}x² + 1, halla f(${k})`, a: a * k * k + 1 } },
    () => { const a = r(2, 9), k = r(2, 5); return { q: `Si f(x) = ${a}·2^x, halla f(${k})`, a: a * 2 ** k } },
    () => { const n = r(3, 8); return { q: `¿De cuántas formas se pueden elegir 2 personas entre ${n}?`, a: n * (n - 1) / 2 } },
    () => { const t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); return { q: `Catetos ${t[0]} y ${t[1]}. ¿Cuánto mide la hipotenusa?`, a: t[2] } }
  ],
  11: [
    () => { const a = r(1, 5), k = r(1, 5); return { q: `Límite de x + ${a} cuando x → ${k}`, a: k + a } },
    () => { const a = r(2, 9); return { q: `Límite de (x² − ${a * a}) / (x − ${a}) cuando x → ${a}`, a: 2 * a } },
    () => { const a = r(2, 9), b = r(1, 9); return { q: `Derivada de ${a}x + ${b}`, a: a } },
    () => { const k = r(1, 9); return { q: `Derivada de x² evaluada en x = ${k}`, a: 2 * k } },
    () => { const a = r(1, 5), k = r(1, 5); return { q: `Derivada de ${a}x² evaluada en x = ${k}`, a: 2 * a * k } },
    () => { const k = r(1, 4); return { q: `∫ de 0 a ${k} de 2x dx`, a: k * k } },
    () => { const k = r(1, 9); return { q: `ln(e^${k}) =`, a: k } },
    () => { const n = r(3, 6); let f = 1; for (let i = 2; i <= n; i++) f *= i; return { q: `${n}! (factorial de ${n})`, a: f } }
  ]
};

/* ---------------------- Frases y pistas del pandita ---------------------- */
const MOTI = ['¡Tú puedes, confía en ti! 💪', '¡Equivocarse es aprender! 🌱', '¡Respira y piensa con calma! 🧘', '¡Cada problema te hace más fuerte! 🦾', '¡Los pandas nunca se rinden! 🐼', '¡Vas muy bien, sigue así! 🚀', '¡Eres más inteligente de lo que crees! 🧠', '¡Un paso a la vez! 👣'];
const START = ['¡Tú puedes! 💪', '¡Piensa rápido! ⚡', '¡Concéntrate! 🎯', '¡Vamos, vamos! 🎋', '¡Esta está fácil! 😄', '¡Confío en ustedes! 🌟'];

const HINTS = [
  [/hipotenusa/, 'Usa Pitágoras: hipotenusa² = cateto² + cateto². Suma los cuadrados y saca la raíz 📐'],
  [/seno del/, 'Seno = cateto opuesto ÷ hipotenusa'],
  [/sen |cos |tan /, 'Recuerda: sen 30° = 0.5, cos 60° = 0.5, tan 45° = 1, sen 90° = 1, cos 0° = 1, cos 90° = 0'],
  [/^log/, 'Pregúntate: ¿a qué número elevo la base para obtener ese resultado?'],
  [/formas se pueden/, 'Usa n × (n − 1) ÷ 2, donde n es el total de personas'],
  [/^Límite de \(/, 'Factoriza: x² − a² = (x − a)(x + a) y simplifica el (x − a)'],
  [/^Límite/, 'Solo reemplaza x por el número al que se acerca'],
  [/^Derivada de x²/, 'La derivada de x² es 2x'],
  [/^Derivada de \d+x²/, 'La derivada de ax² es 2ax'],
  [/^Derivada/, 'La derivada de ax + b es solo a'],
  [/^∫/, 'La integral de 2x es x². Reemplázalo por el límite de arriba (el de abajo da 0)'],
  [/^ln/, 'ln y e son opuestos: se cancelan y queda el exponente'],
  [/factorial/, 'Multiplica todos los números desde el que te dan hasta 1'],
  [/^Perímetro/, 'Perímetro = suma de todos los lados: 2 × (largo + ancho)'],
  [/^Área de un rectángulo/, 'Área = largo × ancho'],
  [/^Área de un triángulo/, 'Área = base × altura ÷ 2'],
  [/cuadernos/, 'Halla primero cuánto cuesta 1 cuaderno y luego multiplícalo'],
  [/^Promedio/, 'Suma todos los números y divide entre cuántos son'],
  [/^El 10%/, 'El 10% es dividir entre 10'],
  [/^El 50%/, 'El 50% es la mitad'],
  [/^La mitad/, 'La mitad es dividir entre 2'],
  [/1\/4/, 'Un cuarto es dividir entre 4'],
  [/^Sucesión/, 'Término n = primero + (n − 1) × lo que suma cada vez'],
  [/pendiente/, 'En y = mx + b, la pendiente es el número que acompaña a x'],
  [/x = 0/, 'Reemplaza x por 0 y calcula'],
  [/^\(x \+/, 'Reemplaza x por 1 y multiplica los dos paréntesis'],
  [/2\^x/, 'Reemplaza x y calcula primero la potencia de 2'],
  [/^Si f\(x\)/, 'Reemplaza x por el número que te dan y calcula'],
  [/^x² =/, '¿Qué número multiplicado por sí mismo da ese resultado?'],
  [/^x \+ y/, 'Suma las dos ecuaciones: queda 2x = la suma de los dos resultados'],
  [/^\(−\d+\) \+/, 'Empieza en el número negativo y avanza hacia la derecha en la recta numérica'],
  [/^\(−\d+\) ×/, 'Negativo por positivo da negativo'],
  [/− \(−/, 'Menos por menos es más: se vuelve una suma'],
  [/^x \+ \d+ =/, 'Resta ese número en los dos lados'],
  [/^x − \d+ =/, 'Suma ese número en los dos lados'],
  [/^\d+x \+ \d+ =/, 'Primero resta el número suelto y luego divide entre el que acompaña a x'],
  [/^\d+x =/, 'Divide el resultado entre el número que acompaña a x'],
  [/^\d+ \+ \d+ × \d+$/, '¡Primero la multiplicación y después la suma!'],
  [/^\d+\.5/, 'Suma primero los enteros y luego junta los dos .5 (dan 1)'],
  [/^\d+ \+ \d+$/, 'Suma primero las decenas y luego las unidades'],
  [/^\d+ − \d+$/, 'Resta con calma: quita primero las decenas y luego las unidades'],
  [/^\d+ × \d+$/, 'Piensa en la tabla de multiplicar o descompón un número en decenas y unidades'],
  [/^\d+ ÷ \d+$/, 'Pregunta: ¿qué número multiplicado por el de la derecha da el de la izquierda?'],
  [/²$/, 'Multiplica el número por sí mismo'],
  [/³$/, 'Multiplica el número tres veces por sí mismo'],
  [/^√/, '¿Qué número multiplicado por sí mismo da ese número?']
];
function hintFor(q) {
  for (const [re, t] of HINTS) if (re.test(q)) return t;
  return 'Lee con calma y resuelve paso a paso';
}

/* Crea 3 opciones: la correcta y 2 incorrectas, en orden aleatorio */
function mkOpts(a) {
  const step = Number.isInteger(a) ? 1 : 0.1, set = new Set([a]);
  while (set.size < 3) {
    let v = a + pick([-1, 1]) * step * r(1, 5);
    v = Math.round(v * 100) / 100;
    if (a >= 0 && v < 0) continue;
    set.add(v);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

/* ---------------------- Estado ---------------------- */
// L = estado de ESTE dispositivo (lo que ve y hace el jugador)
const L = { name: '', myId: null, isHost: false, peer: null, conn: null, code: '', avatar: '🐼', grade: 6, total: 10, q: '', type: 'abc', opts: [], active: false, locked: false, t: 0, iv: null, m1: false, h1: false, disp: '' };
// H = estado del ANFITRIÓN (solo se usa en el dispositivo que creó la sala)
const H = { players: [], round: 0, total: 10, grade: 6, cur: null, open: false, locked: {}, timer: null, playing: false };

function screen(id) {
  ['home', 'lobby', 'game', 'end'].forEach(x => $(x).classList.toggle('hide', x !== id));
}
const setHomeMsg = t => { $('homeMsg').textContent = t; };
const getName = () => $('name').value.trim().slice(0, 14) || 'Jugador';

/* ---------------------- Red (PeerJS) ---------------------- */
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const mkCode = () => Array.from({ length: 4 }, () => CODE_CHARS[r(0, CODE_CHARS.length - 1)]).join('');
const scoreList = () => H.players.map(p => ({ id: p.id, name: p.name, av: p.av, score: p.score }));

// El anfitrión envía a todos (y a sí mismo)
function bcast(m) {
  H.players.forEach(p => { if (p.conn && p.conn.open) p.conn.send(m); });
  onMsg(m);
}
function sendTo(id, m) {
  if (id === 'host') return onMsg(m);
  const p = H.players.find(x => x.id === id);
  if (p && p.conn && p.conn.open) p.conn.send(m);
}
// Enviar mi respuesta
function sendAns(v) {
  if (L.isHost) hostAnswer('host', v);
  else if (L.conn && L.conn.open) L.conn.send({ t: 'ans', v });
}

/* ----- Crear sala (anfitrión) ----- */
function createRoom() {
  L.name = getName();
  L.isHost = true;
  L.myId = 'host';
  setHomeMsg('Creando sala…');
  tryHost(0);
}
function tryHost(n) {
  const code = mkCode();
  const peer = new Peer(PREFIX + code);
  peer.on('open', () => {
    L.peer = peer;
    L.code = code;
    H.players = [{ id: 'host', name: L.name, av: L.avatar, score: 0, conn: null }];
    peer.on('connection', onGuest);
    sendLobby();
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch (_) { } });
  peer.on('error', e => {
    if (e.type === 'unavailable-id' && n < 5) { peer.destroy(); tryHost(n + 1); }
    else if (!L.code) setHomeMsg('No se pudo crear la sala. Revisa tu internet e inténtalo de nuevo.');
  });
}
function sendLobby() {
  bcast({ t: 'lobby', code: L.code, players: H.players.map(p => ({ id: p.id, name: p.name, av: p.av })) });
}

/* ----- Personajes ----- */
const validAv = v => AVATARS.some(a => a[0] === v);
// Si el personaje pedido ya está ocupado, se da el primero libre
function freeAv(pref) {
  const used = H.players.map(p => p.av);
  if (validAv(pref) && !used.includes(pref)) return pref;
  return (AVATARS.find(a => !used.includes(a[0])) || AVATARS[0])[0];
}
function setAvatar(id, v) {
  if (H.playing) return;
  const p = H.players.find(x => x.id === id);
  if (!p || !validAv(v) || H.players.some(x => x.av === v && x.id !== id)) return;
  p.av = v;
  sendLobby();
}
function chooseAvatar(v) {
  if (L.isHost) setAvatar('host', v);
  else if (L.conn && L.conn.open) L.conn.send({ t: 'av', v });
}
function onGuest(conn) {
  conn.on('data', d => {
    if (!d || typeof d !== 'object') return;
    if (d.t === 'join') {
      if (H.playing || H.players.length >= MAX_PLAYERS) {
        conn.send({ t: 'full' });
        setTimeout(() => conn.close(), 400);
        return;
      }
      H.players.push({ id: conn.peer, name: String(d.name || 'Jugador').slice(0, 14), av: freeAv(d.av), score: 0, conn });
      sendLobby();
    } else if (d.t === 'av') {
      setAvatar(conn.peer, d.v);
    } else if (d.t === 'ans') {
      hostAnswer(conn.peer, d.v);
    }
  });
  conn.on('close', () => {
    H.players = H.players.filter(p => p.id !== conn.peer);
    if (!H.playing) sendLobby();
    else bcast({ t: 'board', scores: scoreList() });
  });
}

/* ----- Unirse a una sala (invitado) ----- */
function joinRoom() {
  const code = $('code').value.trim().toUpperCase();
  if (code.length < 4) { setHomeMsg('Escribe el código de 4 letras'); return; }
  L.name = getName();
  L.isHost = false;
  L.code = code;
  setHomeMsg('Conectando…');
  let failT = null;
  const peer = new Peer();
  L.peer = peer;
  peer.on('open', id => {
    L.myId = id;
    const conn = peer.connect(PREFIX + code, { reliable: true });
    L.conn = conn;
    failT = setTimeout(() => { setHomeMsg('No se pudo conectar. Revisa el código y tu internet.'); peer.destroy(); }, 12000);
    conn.on('open', () => { clearTimeout(failT); conn.send({ t: 'join', name: L.name, av: L.avatar }); });
    conn.on('data', onMsg);
    conn.on('close', () => { clearInterval(L.iv); setHomeMsg('La sala se cerró'); screen('home'); });
  });
  peer.on('error', e => {
    clearTimeout(failT);
    setHomeMsg(e.type === 'peer-unavailable' ? 'No existe una sala con ese código' : 'Error de conexión (' + e.type + ')');
  });
}

/* ---------------------- Lógica del anfitrión ---------------------- */
function hostStart() {
  H.playing = true;
  H.round = 0;
  H.grade = L.grade;
  H.total = L.total;
  H.players.forEach(p => p.score = 0);
  hostNext();
}
function hostNext() {
  clearTimeout(H.timer);
  if (H.round >= H.total) return hostEnd();
  H.round++;
  H.cur = pick(GEN[H.grade])();
  const type = Math.random() < PROB_ABC ? 'abc' : 'calc';
  H.locked = {};
  H.open = true;
  bcast({ t: 'q', round: H.round, total: H.total, grade: H.grade, q: H.cur.q, type, opts: type === 'abc' ? mkOpts(H.cur.a) : [], time: TIME, scores: scoreList() });
  H.timer = setTimeout(() => {
    if (!H.open) return;
    H.open = false;
    bcast({ t: 'timeout', answer: H.cur.a });
    setTimeout(hostNext, 2200);
  }, TIME * 1000);
}
function hostAnswer(id, v) {
  if (!H.open || H.locked[id] || typeof v !== 'number' || !isFinite(v)) return;
  const p = H.players.find(x => x.id === id);
  if (!p) return;
  if (Math.abs(v - H.cur.a) < 0.01) {
    H.open = false;
    clearTimeout(H.timer);
    p.score++;
    bcast({ t: 'right', who: id, name: p.name, answer: H.cur.a, scores: scoreList() });
    setTimeout(hostNext, 2200);
  } else {
    H.locked[id] = true;
    setTimeout(() => { delete H.locked[id]; }, 3000);
    bcast({ t: 'wrong', who: id, name: p.name });
  }
}
function hostEnd() {
  H.playing = false;
  bcast({ t: 'end', scores: scoreList().sort((a, b) => b.score - a.score) });
}

/* ---------------------- Mensajes que recibe cada dispositivo ---------------------- */
function onMsg(m) {
  if (!m || typeof m !== 'object') return;
  switch (m.t) {
    case 'full': setHomeMsg('La sala está llena o el juego ya empezó'); screen('home'); break;
    case 'lobby': showLobby(m); break;
    case 'q': showQ(m); break;
    case 'right': onRight(m); break;
    case 'wrong': onWrong(m); break;
    case 'timeout': onTimeout(m); break;
    case 'board': renderBoard(m.scores); break;
    case 'end': showEnd(m); break;
  }
}

function showLobby(m) {
  screen('lobby');
  $('roomCode').textContent = m.code;
  $('plist').innerHTML = m.players.map(p => `<span class="${p.id === L.myId ? 'me' : ''}"><i>${esc(p.av || '')}</i>${esc(p.name)}</span>`).join('');
  const me = m.players.find(p => p.id === L.myId);
  if (me && me.av) L.avatar = me.av;
  $('lobbyChars').innerHTML = AVATARS.map(([e, n]) => {
    const owner = m.players.find(p => p.av === e), mine = owner && owner.id === L.myId;
    return `<button class="${mine ? 'sel' : ''}" ${owner && !mine ? 'disabled' : ''} data-av="${e}" title="${n}">${e}</button>`;
  }).join('');
  $('hostOpts').classList.toggle('hide', !L.isHost);
  $('waitMsg').classList.toggle('hide', L.isHost);
}

function renderBoard(scores) {
  $('board').innerHTML = scores.map(s => `<div class="chip${s.id === L.myId ? ' me' : ''}"><b>${esc(s.av || '')} ${esc(s.name)}</b><span>${s.score}</span></div>`).join('');
}

function showQ(m) {
  screen('game');
  clearInterval(L.iv);
  L.q = m.q; L.type = m.type; L.opts = m.opts;
  L.active = true; L.locked = false; L.disp = '';
  L.m1 = false; L.h1 = false;
  showDisp();
  $('calc').classList.remove('lock');
  $('q').textContent = m.q;
  $('gInfo').textContent = `Grado ${m.grade}° · Problema ${m.round}/${m.total}`;
  renderBoard(m.scores);
  const abc = $('abc'), send = $('send');
  if (m.type === 'abc') {
    abc.classList.remove('hide');
    send.classList.add('hide');
    [...abc.children].forEach((b, k) => b.textContent = ['A', 'B', 'C'][k] + ') ' + m.opts[k]);
  } else {
    abc.classList.add('hide');
    send.classList.remove('hide');
  }
  setMsg(m.type === 'abc' ? 'Elige A, B o C (puedes usar tu calculadora)' : 'Calcula y envía tu respuesta con la calculadora');
  panda(m.round === 1 ? '¡Hola! Soy Panda 🐼 ¡Que gane el mejor! Si necesitas ayuda toca 💡 Pista' : pick(START), 'idle');
  L.t = m.time;
  $('tb').style.width = '100%';
  L.iv = setInterval(() => {
    L.t -= 0.1;
    $('tb').style.width = Math.max(0, L.t / m.time * 100) + '%';
    if (L.t <= 40 && !L.m1) { L.m1 = true; panda(pick(MOTI), 'idle'); }
    if (L.t <= 25 && !L.h1) { L.h1 = true; giveHint(); }
    if (L.t <= 0) clearInterval(L.iv);
  }, 100);
}

function onRight(m) {
  L.active = false;
  clearInterval(L.iv);
  renderBoard(m.scores);
  if (m.who === L.myId) {
    celebrate();
    panda(pick([`¡Bravo ${m.name}! 🎉`, `¡Eres un genio, ${m.name}! 🌟`, `¡Excelente, ${m.name}! 👏`, `¡Lo lograste, ${m.name}! 💪`, `¡Sigue así, campeón! 🏅`]), 'happy');
    setMsg(`🎉 ¡Muy bien! +1 punto. Respuesta: ${m.answer}`, '#4ade80');
  } else {
    panda(`¡${m.name} fue más rápido! ¡La próxima eres tú! 💪`, 'idle');
    setMsg(`✅ ${m.name} acertó. Respuesta: ${m.answer}`, '#fbbf24');
  }
}

function onWrong(m) {
  if (m.who === L.myId) {
    L.locked = true;
    $('calc').classList.add('lock');
    setMsg('❌ Fallaste y pierdes 3 segundos', '#f87171');
    panda(pick(['¡Ánimo, tú puedes! 💪', '¡No pasa nada, equivocarse es aprender! 🌱', '¡Piensa con calma! Toca 💡 Pista si quieres ayuda', '¡Casi! Inténtalo otra vez 😉']), 'sad');
    setTimeout(() => { L.locked = false; $('calc').classList.remove('lock'); }, 3000);
  } else if (L.active) {
    setMsg(`❌ ${m.name} falló`, '#fbbf24');
  }
}

function onTimeout(m) {
  L.active = false;
  clearInterval(L.iv);
  setMsg(`⏰ Se acabó el tiempo. Respuesta: ${m.answer}`, '#fbbf24');
  panda('¡Uy! Se acabó el tiempo. ¡La próxima sí! 🎋', 'sad');
}

function showEnd(m) {
  screen('end');
  clearInterval(L.iv);
  L.active = false;
  const top = m.scores.length ? m.scores[0].score : 0;
  const win = m.scores.filter(s => s.score === top);
  const tie = win.length > 1;
  $('trophy').textContent = tie ? '🤝' : '🏆';
  $('winner').textContent = tie ? `¡Empate entre ${win.map(w => w.name).join(' y ')}!` : `¡Felicidades ${win[0].name}! Eres el campeón`;
  $('final').innerHTML = m.scores.map((s, i) => `<div class="rank${s.id === L.myId ? ' me' : ''}"><span>${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'}</span><b>${esc(s.av || '')} ${esc(s.name)}</b><span>${s.score} pts</span></div>`).join('');
  $('pandaEnd').textContent = '🐼 ¡Qué partida tan divertida! ¡Bravo a todos!';
  $('again').classList.toggle('hide', !L.isHost);
  $('endWait').classList.toggle('hide', L.isHost);
  celebrate();
  setTimeout(celebrate, 800);
}

/* ---------------------- Calculadora, pandita y efectos ---------------------- */
const KEYS = ['C', '⌫', '(', ')', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
KEYS.forEach(k => {
  const b = document.createElement('button');
  b.textContent = k;
  b.onclick = () => press(k);
  $('keys').appendChild(b);
});
for (let k = 0; k < 3; k++) {
  const b = document.createElement('button');
  b.onclick = () => pickOpt(k);
  $('abc').appendChild(b);
}

function showDisp() { $('disp').textContent = L.disp || '0'; }

function calc(expr) {
  const e = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!/^[0-9+\-*/().\s]+$/.test(e)) return NaN;
  try {
    const v = Function('"use strict";return (' + e + ')')();
    return typeof v === 'number' && isFinite(v) ? v : NaN;
  } catch (_) { return NaN; }
}

function press(k) {
  if (!L.active || L.locked) return;
  if (k === 'C') L.disp = '';
  else if (k === '⌫') L.disp = L.disp.slice(0, -1);
  else if (k === '=') {
    const v = calc(L.disp);
    L.disp = isNaN(v) ? '' : String(Math.round(v * 1e6) / 1e6);
  } else L.disp += k;
  showDisp();
}

function pickOpt(k) {
  if (!L.active || L.locked) return;
  sendAns(L.opts[k]);
}

function submit() {
  if (!L.active || L.locked) return;
  const v = calc(L.disp);
  if (isNaN(v)) { setMsg('Escribe un número u operación válida', '#fbbf24'); return; }
  sendAns(v);
}

function setMsg(t, c) { $('msg').textContent = t; $('msg').style.color = c || '#f1f5f9'; }

// El pandita dice un mensaje y se mueve: 'idle' (suave), 'happy' (salta), 'sad' (se sacude)
function panda(t, m) {
  $('bubble').textContent = t;
  const p = $('panda');
  p.className = '';
  void p.offsetWidth;
  p.className = m || 'idle';
}

function giveHint() {
  if (!L.active) return;
  panda('💡 Pista: ' + hintFor(L.q), 'idle');
}

// Emojis que caen cuando alguien acierta o al final del juego
function celebrate() {
  const fx = $('fx'), E = ['🎉', '🎊', '⭐', '👏', '🥳', '✨', '🏅', '😄'];
  for (let k = 0; k < 26; k++) {
    const s = document.createElement('span');
    s.textContent = pick(E);
    s.style.cssText = `position:fixed;top:-50px;left:${r(0, 95)}vw;font-size:${r(22, 40)}px;pointer-events:none;z-index:99;transition:transform ${r(15, 25) / 10}s ease-in,opacity 2s`;
    fx.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translateY(${innerHeight + 100}px) rotate(${r(-360, 360)}deg)`;
      s.style.opacity = '0.2';
    });
    setTimeout(() => s.remove(), 2700);
  }
}

/* ---------------------- Botones y arranque ---------------------- */
function mkBtns(box, vals, key) {
  vals.forEach(v => {
    const b = document.createElement('button');
    b.textContent = key === 'grade' ? v + '°' : v;
    b.onclick = () => {
      L[key] = v;
      [...box.children].forEach(c => c.classList.remove('sel'));
      b.classList.add('sel');
    };
    if (L[key] === v) b.classList.add('sel');
    box.appendChild(b);
  });
}
mkBtns($('grades'), [6, 7, 8, 9, 10, 11], 'grade');
mkBtns($('rounds'), [5, 10, 15], 'total');

$('create').onclick = createRoom;
$('join').onclick = joinRoom;
$('start').onclick = hostStart;
$('send').onclick = submit;
$('hintBtn').onclick = giveHint;
$('again').onclick = () => { if (L.isHost) sendLobby(); };
$('code').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
$('copyLink').onclick = () => {
  const url = roomUrl();
  const done = () => { $('copyLink').textContent = '¡Enlace copiado! ✅'; setTimeout(() => { $('copyLink').textContent = '🔗 Copiar enlace para invitar'; }, 2500); };
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => prompt('Copia este enlace:', url));
  else prompt('Copia este enlace:', url);
};

/* ---------------------- Enlaces, códigos y personajes (inicio) ---------------------- */
const roomUrl = () => location.origin + location.pathname + '?sala=' + L.code;

// Saca el código de una sala desde un enlace pegado o desde el código solo
function parseCode(txt) {
  txt = String(txt || '').trim();
  const m = txt.match(/sala=([A-Za-z0-9]{4})/i) || txt.match(/#([A-Za-z0-9]{4})$/);
  if (m) return m[1].toUpperCase();
  return /[:/.]/.test(txt) ? '' : txt.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
}
// Pegar un enlace completo en el campo del código también funciona
$('code').addEventListener('paste', e => {
  e.preventDefault();
  $('code').value = parseCode((e.clipboardData || window.clipboardData).getData('text'));
});

// Elegir personaje antes de entrar o crear
AVATARS.forEach(([e, n]) => {
  const b = document.createElement('button');
  b.textContent = e;
  b.title = n;
  b.onclick = () => {
    L.avatar = e;
    [...$('homeChars').children].forEach(c => c.classList.toggle('sel', c === b));
  };
  if (e === L.avatar) b.classList.add('sel');
  $('homeChars').appendChild(b);
});
// Elegir o cambiar personaje dentro de la sala
$('lobbyChars').onclick = e => {
  const b = e.target.closest('button');
  if (b && !b.disabled) chooseAvatar(b.dataset.av);
};

// Compartir con las apps del celular (WhatsApp, etc.) si el navegador lo permite
if (navigator.share) {
  $('shareLink').classList.remove('hide');
  $('shareLink').onclick = () => navigator.share({ title: 'Duelo Matemático', text: 'Únete a mi sala con el código ' + L.code, url: roomUrl() }).catch(() => { });
}

// Si entran con un enlace como ...?sala=ABCD (o ...#ABCD), van directo a esa sala
function inviteMode(on, code) {
  $('invite').classList.toggle('hide', !on);
  $('create').classList.toggle('hide', on);
  $('orSep').classList.toggle('hide', on);
  $('code').classList.toggle('hide', on);
  $('ownRoom').classList.toggle('hide', !on);
  if (on) {
    $('code').value = code;
    $('invite').textContent = `🎟️ ¡Te invitaron a la sala ${code}! Escribe tu nombre, elige tu personaje y toca Unirme.`;
    $('join').textContent = '🚀 Unirme a la sala ' + code;
  } else {
    $('code').value = '';
    $('join').textContent = '🚀 Unirme';
  }
}
$('ownRoom').onclick = () => {
  inviteMode(false);
  try { history.replaceState(null, '', location.pathname); } catch (_) { }
};
const inv = (location.search + location.hash).match(/sala=([A-Za-z0-9]{4})|#([A-Za-z0-9]{4})$/i);
if (inv) inviteMode(true, (inv[1] || inv[2]).toUpperCase());