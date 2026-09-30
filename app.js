const BISCUITS = [
  { name:"Rich Tea", perk:"+1 teabag" },
  { name:"Digestive", perk:"+2 teabags" },
  { name:"Chocolate Hobnob", perk:"Full box of teabags" },
  { name:"Bourbon", perk:"+1 life" },
  { name:"Shortbread", perk:"+1 life and a full box of teabags" },
  { name:"Jaffa Cake", perk:"+1 life, full teabags, and a place in the hall of fame" }
];
/* A custom top biscuit from friend.js replaces the Jaffa Cake */
const F = window.FRIEND || {};
if (F.topBiscuit && F.topBiscuit.name) BISCUITS[5] = { name: F.topBiscuit.name, perk: F.topBiscuit.perk || BISCUITS[5].perk };
/* House idioms from friend.js join the main library */
if (Array.isArray(F.houseIdioms)) window.IDIOMS.push(...F.houseIdioms.map((h, k) => Object.assign({ id: "house-" + k, status: "house", date: "Recent, and ongoing", year: new Date().getFullYear(), decoys: [["thing","❓"],["stuff","📦"]], emo: "⭐" }, h)));
const IDIOMS = window.IDIOMS;
const STATUS = { attested:"Well attested", likely:"Probable origin", unknown:"Origin unknown", house: F.houseLabel || "House idiom" };
const POT = 6, MAX_BAGS = 3, MAX_LIVES = 3;

const fresh = () => ({ cups:0, bags:MAX_BAGS, lives:MAX_LIVES, poured:0, tier:0, eaten:{}, daily:null, dict:[], best:0, jaffaTotal:0 });
let S = fresh();
try {
  const s = JSON.parse(localStorage.getItem("teacup-state"));
  if (s && typeof s.cups === "number") {
    S = Object.assign(fresh(), s);
    if (Array.isArray(s.tin)) { S.tier = Math.min(BISCUITS.length, s.tin.length); delete S.tin; }
  }
} catch (e) {}
function save(){ try { localStorage.setItem("teacup-state", JSON.stringify(S)); } catch (e) {} }

const $ = id => document.getElementById(id);
const phrase = (i, word) => [i.pre, word ?? i.word, i.post].filter(Boolean).join(" ");
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr, not) => { let x; do { x = arr[Math.floor(Math.random() * arr.length)]; } while (arr.length > 1 && x === not); return x; };
const ordinal = n => n + (["th","st","nd","rd"][(n % 100 - 20) % 10] || ["th","st","nd","rd"][n % 100] || "th");

/* ---- Tally and tin ---- */
function renderTally(){
  $("cups").innerHTML = Array.from({length:POT}, (_, i) => `<span class="cup ${i < S.cups ? "full" : ""}"></span>`).join("");
  $("bags").innerHTML = Array.from({length:MAX_BAGS}, (_, i) => `<span class="bag ${i < S.bags ? "" : "gone"}"></span>`).join("");
  $("lives").innerHTML = Array.from({length:MAX_LIVES}, (_, i) => `<span class="heart ${i < S.lives ? "" : "gone"}">♥</span>`).join("");
  $("score").textContent = S.poured;
  $("best").textContent = Math.max(S.best || 0, S.poured);
  $("cups").setAttribute("aria-label", `${S.cups} of ${POT} cups`);
  $("bags").setAttribute("aria-label", `${S.bags} teabags`);
  $("lives").setAttribute("aria-label", `${S.lives} lives`);
  $("miniTin").innerHTML = S.tier ? BISCUITS[S.tier - 1].name : `<span class="empty">Empty</span>`;
  $("ladder").innerHTML = BISCUITS.map((b, k) => `<div class="rung ${k + 1 === S.tier ? "now" : k + 1 < S.tier ? "got" : ""}"><b>${b.name}</b><span>${b.perk}</span></div>`).join("");
  $("eat").disabled = !S.tier;
  $("eat").textContent = S.tier ? `Eat the ${BISCUITS[S.tier - 1].name}` : "Eat it now";
  const eaten = Object.entries(S.eaten).filter(([, n]) => n);
  $("plate").textContent = eaten.length ? "Eaten so far: " + eaten.map(([k, n]) => `${k} ×${n}`).join(", ") : "Nothing eaten yet.";
  $("honours").hidden = !S.jaffaTotal;
  $("honours").textContent = S.jaffaTotal ? `Hall of fame: you've eaten the top biscuit ${S.jaffaTotal} time${S.jaffaTotal === 1 ? "" : "s"}.` : "";
}
$("eat").onclick = () => {
  if (!S.tier) return;
  const t = S.tier, b = BISCUITS[t - 1];
  if (t === 1) S.bags = Math.min(MAX_BAGS, S.bags + 1);
  if (t === 2) S.bags = Math.min(MAX_BAGS, S.bags + 2);
  if (t === 3 || t >= 5) S.bags = MAX_BAGS;
  if (t >= 4) S.lives = Math.min(MAX_LIVES, S.lives + 1);
  S.eaten[b.name] = (S.eaten[b.name] || 0) + 1;
  S.tier = 0;
  if (t === 6) { S.jaffaTotal = (S.jaffaTotal || 0) + 1; }
  save(); renderTally();
  toast(t === 6 ? `${b.name} eaten. That's ${S.jaffaTotal} in the hall of fame.` : `${b.name} eaten: ${b.perk.toLowerCase()}.`);
};

let toastT;
function toast(msg){ const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600); }

function award(n){
  const cheers = Array.isArray(F.cheers) && F.cheers.length ? F.cheers : null;
  let msg = cheers && Math.random() < 0.3 ? cheers[Math.floor(Math.random() * cheers.length)] : n === 1 ? "Correct. One cup of tea poured." : `Lovely. ${n} cups poured.`;
  for (let k = 0; k < n; k++) {
    S.cups++; S.poured++;
    if (S.cups >= POT) {
      S.cups = 0;
      if (S.tier < BISCUITS.length) { S.tier++; msg = `Teapot full! Your tin now holds a ${BISCUITS[S.tier - 1].name}.`; }
      else msg = "Teapot full, but the tin can't get any better. Eat your Jaffa Cake!";
    }
  }
  toast(msg); save(); renderTally();
}
function penalty(){
  S.bags--;
  let msg = "Wrong. You've lost a teabag.";
  if (S.bags <= 0) {
    S.lives--;
    if (S.lives <= 0) { save(); renderTally(); storm("It blew your last life clean away.", gameOver); return; }
    S.bags = MAX_BAGS;
    msg = "You ran out of teabags and it blew away a life. Here's a fresh box.";
    if (S.tier) {
      const was = BISCUITS[S.tier - 1].name; S.tier--;
      msg += S.tier ? ` It also knocked over the tin: your ${was} is now a ${BISCUITS[S.tier - 1].name}.` : ` It also knocked over the tin and your ${was} is crumbs.`;
    }
    save(); renderTally(); storm(msg); return;
  }
  toast(msg); save(); renderTally();
}
let stormT, stormNext, stormReturn;
function storm(msg, then){
  const el = $("storm");
  stormNext = then || null; stormReturn = document.activeElement;
  $("stormMsg").textContent = msg;
  el.classList.remove("play"); el.hidden = false; void el.offsetWidth; el.classList.add("play");
  $("stormOk").focus();
  clearTimeout(stormT); stormT = setTimeout(endStorm, 4500);
}
function endStorm(){
  const el = $("storm"); if (el.hidden) return;
  clearTimeout(stormT); el.hidden = true; el.classList.remove("play");
  const next = stormNext; stormNext = null;
  if (next) next(); else if (stormReturn && stormReturn.focus) stormReturn.focus();
}
$("stormOk").onclick = endStorm;
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("storm").hidden) endStorm(); });

function gameOver(){
  const n = Object.values(S.eaten).reduce((a, b) => a + b, 0);
  $("overMsg").textContent = `You poured ${S.poured} cups and ate ${n} biscuit${n === 1 ? "" : "s"}. Whatever was left in the tin went with the storm.`;
  const prev = S.best || 0;
  if (S.poured > prev) { S.best = S.poured; save(); }
  $("overBest").textContent = S.poured > prev ? (prev ? `New personal best! (Previous best: ${prev} cups.)` : "That's your first personal best.") : `Your best game: ${prev} cups.`;
  $("overBest").className = "verdict " + (S.poured > prev ? "ok" : "");
  $("over").hidden = false;
  $("restart").focus();
}
$("restart").onclick = () => { const keep = { daily:S.daily, dict:S.dict, best:S.best, jaffaTotal:S.jaffaTotal }; S = Object.assign(fresh(), keep); save(); renderTally(); $("over").hidden = true; show(current); };

function revealBlock(i, verdict, ok){
  return `<div class="reveal">
    ${verdict ? `<p class="verdict ${ok ? "ok" : "no"}">${verdict}</p>` : ""}
    <p><b>${phrase(i)}</b>: ${i.meaning}</p>
    <p>${i.origin}</p>
    <div class="meta"><span class="chip ${i.status}">${STATUS[i.status]}</span><span>${i.date}</span></div>
  </div>`;
}
const nextBtn = (id, label) => `<div class="actions" style="margin-top:14px"><button class="btn" id="${id}">${label}</button></div>`;

/* Generic multiple choice: opts = [[label, correct]], onDone(ok) */
function wireOpts(opts, onDone){
  document.querySelectorAll(".opt").forEach(btn => btn.onclick = () => {
    const ok = opts[+btn.dataset.k][1];
    document.querySelectorAll(".opt").forEach((b, k) => { b.disabled = true; if (opts[k][1]) b.classList.add("right"); });
    if (!ok) btn.classList.add("wrong");
    onDone(ok);
  });
}
const optsHtml = opts => `<div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${o[0]}</button>`).join("")}</div>`;
const phraseOpts = (i, n = 2) => shuffle([[phrase(i), true], ...shuffle(IDIOMS.filter(x => x !== i)).slice(0, n).map(x => [phrase(x), false])]);

/* ---- Fill the gap ---- */
function fillRound(i, host, onDone){
  const opts = shuffle([[i.word, i.emo, true], ...i.decoys.map(d => [d[0], d[1], false])]);
  const gapHtml = `<span class="gap">&nbsp;?&nbsp;</span>`;
  host.innerHTML = `<p class="kicker">Pick the picture that finishes the idiom</p>
    <h2 class="prompt" id="fillq">${[i.pre, gapHtml, i.post].filter(Boolean).join(" ")}</h2>
    <div class="choices">${opts.map((o, k) => `<button class="pic" data-k="${k}" aria-label="${o[0]}"><span class="emo" aria-hidden="true">${o[1]}</span>${o[0]}</button>`).join("")}</div>
    <div id="roundOut"></div>`;
  host.querySelectorAll(".pic").forEach(btn => btn.onclick = () => {
    const o = opts[+btn.dataset.k];
    host.querySelectorAll(".pic").forEach((b, k) => { b.disabled = true; if (opts[k][2]) b.classList.add("right"); else if (b !== btn) b.classList.add("dim"); });
    if (!o[2]) btn.classList.add("wrong");
    $("fillq").innerHTML = phrase(i).replace(i.word, `<span class="gap">${i.word}</span>`);
    const m = F.mangles && F.mangles[i.id];
    onDone(o[2], o[2] ? "Spot on." : (m && m.pick === o[0] ? m.say : `Not quite. It's ${i.word}.`));
  });
}
let lastFill;
function fillGame(){
  const i = pick(IDIOMS, lastFill); lastFill = i;
  $("main").innerHTML = `<section class="panel" id="host"></section>`;
  fillRound(i, $("host"), (ok, v) => {
    $("roundOut").innerHTML = revealBlock(i, v, ok) + nextBtn("nx", "Next idiom");
    $("nx").onclick = fillGame; $("nx").focus();
    ok ? award(1) : penalty();
  });
}

/* ---- Picture puzzles ---- */
let lastRebus;
function rebusGame(){
  const i = pick(IDIOMS.filter(x => x.rebus), lastRebus); lastRebus = i;
  const opts = phraseOpts(i, 3);
  $("main").innerHTML = `<section class="panel">
    <p class="kicker">Read the pictures literally. Which idiom is it?</p>
    <p class="rebus" aria-label="Picture clue">${i.rebus}</p>
    ${optsHtml(opts)}<div id="out"></div></section>`;
  wireOpts(opts, ok => {
    $("out").innerHTML = revealBlock(i, ok ? "Got it." : "Not that one.", ok) + nextBtn("nx", "Next puzzle");
    $("nx").onclick = rebusGame; $("nx").focus();
    ok ? award(1) : penalty();
  });
}

/* ---- Around the world ---- */
let lastWorld;
function worldGame(){
  const pool = IDIOMS.flatMap(i => (i.world || []).map(w => ({ i, w })));
  let r; do { r = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && r === lastWorld); lastWorld = r;
  const { i, w } = r;
  const opts = phraseOpts(i);
  $("main").innerHTML = `<section class="panel">
    <p class="kicker">Which British idiom means the same thing?</p>
    <div class="foreign">
      <span class="lang">${w[0]}</span>
      <h2 class="prompt">“${w[1]}”</h2>
      ${w[2] ? `<span class="lit">Literally: ${w[2]}</span>` : ""}
    </div>
    ${optsHtml(opts)}<div id="out"></div></section>`;
  wireOpts(opts, ok => {
    $("out").innerHTML = revealBlock(i, ok ? "That's the one." : `It's “${phrase(i)}”.`, ok) + nextBtn("nx", "Next phrase");
    $("nx").onclick = worldGame; $("nx").focus();
    ok ? award(1) : penalty();
  });
}

/* ---- Mash-up ---- */
function mashGame(){
  const a = pick(IDIOMS); const b = pick(IDIOMS.filter(x => x.word.toLowerCase() !== a.word.toLowerCase()));
  const w = a.word[0] === a.word[0].toUpperCase() ? b.word[0].toUpperCase() + b.word.slice(1) : b.word;
  const mashed = [a.pre, `<em>${w}</em>`, a.post].filter(Boolean).join(" ");
  $("main").innerHTML = `<section class="panel" aria-labelledby="mashq">
    <p class="kicker">Randomised mash-up</p>
    <h2 class="mash" id="mashq">“${mashed}”</h2>
    <p class="parents">Made from <b>${phrase(a)}</b> and <b>${phrase(b)}</b></p>
    <label for="mashMeaning" class="kicker">What does it mean? Your definition goes in the Brewtionary.</label>
    <textarea id="mashMeaning" placeholder="e.g. To fuss endlessly over a problem that was never yours."></textarea>
    <div class="actions">
      <button class="btn" id="mashSubmit" disabled>Add to the Brewtionary</button>
      <button class="btn ghost" id="mashNew">Randomise again</button>
    </div>
    <p class="hint">Mash-ups are just for fun: no tea poured, no teabags lost.</p>
    <div id="mashOut"></div>
  </section>`;
  const ta = $("mashMeaning"), sub = $("mashSubmit");
  ta.oninput = () => { sub.disabled = ta.value.trim().split(/\s+/).filter(Boolean).length < 3; };
  $("mashNew").onclick = mashGame;
  sub.onclick = () => {
    ta.disabled = true; sub.disabled = true;
    const entry = { term: [a.pre, w, a.post].filter(Boolean).join(" "), def: ta.value.trim().slice(0, 400), from: [phrase(a), phrase(b)], added: new Date().toISOString() };
    addBrew(entry);
    $("mashOut").innerHTML = `<div class="reveal"><p class="kicker">The originals</p>
      <p><b>${phrase(a)}</b>: ${a.meaning}</p><p><b>${phrase(b)}</b>: ${b.meaning}</p></div>
      <div class="actions" style="margin-top:14px"><button class="btn" id="nx">Randomise another</button><button class="btn ghost" id="toDict">Open the Brewtionary</button></div>`;
    $("nx").onclick = mashGame; $("nx").focus();
    $("toDict").onclick = () => show("dict");
  };
}

/* ---- Meaning & origins ---- */
function meaningQ(i){
  const wrong = shuffle(IDIOMS.filter(x => x !== i && x.meaning !== i.meaning)).slice(0, 2);
  return { kicker:"What does it mean?", q:`“${phrase(i)}”`, small:false, opts: shuffle([[i.meaning, true], ...wrong.map(x => [x.meaning, false])]),
    verdict: ok => ok ? "Correct." : "Not that one." };
}
function storyQ(i){
  return { kicker:"True story or tall tale?", q:`Popular origin of “${phrase(i)}”: ${i.story}`, small:true,
    opts: [["Well documented", i.storyTrue], ["A tall tale with no evidence", !i.storyTrue]],
    verdict: ok => ok ? "Right. There's no evidence for that story." : "It's a tall tale. Nothing backs it up." };
}
function dateQ(i){
  const cent = y => Math.floor(y / 100);
  const others = []; const seen = new Set([cent(i.year)]);
  for (const x of shuffle(IDIOMS)) { if (!seen.has(cent(x.year))) { seen.add(cent(x.year)); others.push(x); } if (others.length === 2) break; }
  const lab = y => `The ${ordinal(cent(y) + 1)} century`;
  return { kicker:"When was it first recorded?", q:`“${phrase(i)}”`, small:false,
    opts: shuffle([[lab(i.year), true], ...others.map(x => [lab(x.year), false])]),
    verdict: ok => ok ? "Right era." : `It's from the ${ordinal(cent(i.year) + 1)} century.` };
}
let lastQuiz, quizN = 0;
function quizGame(){
  quizN++;
  const kind = quizN % 3;
  const i = pick(kind === 1 ? IDIOMS.filter(x => x.story) : IDIOMS, lastQuiz); lastQuiz = i;
  const Q = kind === 1 ? storyQ(i) : kind === 2 ? dateQ(i) : meaningQ(i);
  $("main").innerHTML = `<section class="panel">
    <p class="kicker">${Q.kicker}</p>
    <h2 class="prompt ${Q.small ? "small" : ""}">${Q.q}</h2>
    ${optsHtml(Q.opts)}<div id="out"></div></section>`;
  wireOpts(Q.opts, ok => {
    $("out").innerHTML = revealBlock(i, Q.verdict(ok), ok) + nextBtn("nx", "Next question");
    $("nx").onclick = quizGame; $("nx").focus();
    ok ? award(1) : penalty();
  });
}

/* ---- Today's idiom ---- */
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
function dailyIdiom(){
  const d = new Date(); const days = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  return { idiom: IDIOMS[(days * 37) % IDIOMS.length], num: days - Math.floor(Date.UTC(2026, 8, 1) / 864e5) + 1 };
}
function dailyGame(){
  const key = todayKey(); const { idiom:i, num } = dailyIdiom();
  if (!S.daily || S.daily.key !== key) { S.daily = { key, marks: [] }; save(); }
  const marks = S.daily.marks;
  const steps = `<div class="daily-steps">${[0,1,2].map(k => `<span class="step ${k < marks.length ? (marks[k] ? "ok" : "no") : k === marks.length ? "now" : ""}">${k < marks.length ? (marks[k] ? "✓" : "✗") : k + 1}</span>`).join("")}</div>`;
  if (marks.length >= 3) {
    const grid = marks.map(m => m ? "☕" : "❌").join("");
    const text = `Storm in a Teacup #${num}\n${grid}\n${marks.filter(Boolean).length}/3`;
    $("main").innerHTML = `<section class="panel">
      <p class="kicker">Today's idiom · #${num}</p>${steps}
      ${revealBlock(i, `You scored ${marks.filter(Boolean).length} out of 3.`, marks.filter(Boolean).length >= 2)}
      <p class="kicker">Share your result</p>
      <pre class="share" id="shareText">${text}</pre>
      <div class="actions"><button class="btn" id="copy">Copy result</button><span class="hint">A new idiom arrives tomorrow.</span></div>
    </section>`;
    $("copy").onclick = () => {
      navigator.clipboard.writeText(text).then(() => toast("Copied. Paste it wherever you like."), () => {
        const r = document.createRange(); r.selectNodeContents($("shareText")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Selected. Copy it with your keyboard.");
      });
    };
    return;
  }
  $("main").innerHTML = `<section class="panel"><p class="kicker">Today's idiom · #${num} · three questions, one go each</p>${steps}<div id="host" style="display:grid;gap:18px"></div></section>`;
  const host = $("host");
  const finish = (ok, verdict) => {
    marks.push(ok); save();
    ok ? award(1) : penalty();
    $("roundOut").innerHTML = `<p class="verdict ${ok ? "ok" : "no"}">${verdict}</p>` + nextBtn("nx", marks.length >= 3 ? "See today's result" : "Next question");
    $("nx").onclick = dailyGame; $("nx").focus();
  };
  if (marks.length === 0) return fillRound(i, host, finish);
  const Q = marks.length === 1 ? meaningQ(i) : (i.story ? storyQ(i) : dateQ(i));
  host.innerHTML = `<p class="kicker">${Q.kicker}</p><h2 class="prompt ${Q.small ? "small" : ""}">${Q.q}</h2>${optsHtml(Q.opts)}<div id="roundOut"></div>`;
  wireOpts(Q.opts, ok => finish(ok, Q.verdict(ok)));
}

/* ---- Library & timeline ---- */
let libMode = "az";
function library(){
  $("main").innerHTML = `<section class="panel">
    <div class="actions" style="justify-content:space-between">
      <p class="kicker">History and etymology of every idiom in the game</p>
      <div class="seg" role="group" aria-label="View">
        <button id="modeAz" aria-pressed="${libMode === "az"}">A–Z</button>
        <button id="modeTl" aria-pressed="${libMode === "tl"}">Timeline</button>
      </div>
    </div>
    <div id="libBody"></div>
  </section>`;
  $("modeAz").onclick = () => { libMode = "az"; library(); };
  $("modeTl").onclick = () => { libMode = "tl"; library(); };
  libMode === "az" ? libAZ() : libTimeline();
}
function libAZ(){
  $("libBody").innerHTML = `<div style="display:grid;gap:12px"><input type="search" id="libSearch" placeholder="Search idioms, meanings or origins" aria-label="Search idioms"><div class="lib" id="libList"></div></div>`;
  const draw = f => {
    const key = x => phrase(x).replace(/^[^a-z]+/i, "");
    const list = IDIOMS.filter(i => (phrase(i) + i.meaning + i.origin).toLowerCase().includes(f.toLowerCase())).slice().sort((x, y) => key(x).localeCompare(key(y)));
    $("libList").innerHTML = list.length ? list.map(i => `<article class="card">
      <h3>${phrase(i)}</h3>
      <p class="mean">${i.meaning}</p>
      <p>${i.origin}</p>
      ${i.story ? `<p class="myth"><b>Popular myth:</b> ${i.story}</p>` : ""}
      ${i.world ? `<p class="abroad"><b>Elsewhere:</b> ${i.world.map(w => `${w[0]} “${w[1]}”${w[2] ? ` (${w[2]})` : ""}`).join("; ")}</p>` : ""}
      <div class="meta"><span class="chip ${i.status}">${STATUS[i.status]}</span><span>${i.date}</span></div>
    </article>`).join("") : `<p class="hint">No idioms match that search.</p>`;
  };
  $("libSearch").oninput = e => draw(e.target.value);
  draw("");
}
function libTimeline(){
  const groups = {};
  IDIOMS.slice().sort((a, b) => a.year - b.year).forEach(i => { const c = Math.floor(i.year / 100) + 1; (groups[c] = groups[c] || []).push(i); });
  $("libBody").innerHTML = `<p class="hint" style="margin-bottom:10px">Years are approximate first appearances in print.</p><div class="timeline">${Object.keys(groups).map(c => `
    <div class="century"><h3>${ordinal(+c)} century</h3><div class="tl-items">${groups[c].map(i => `
      <div class="tl-item"><span class="tl-year">c.${i.year}</span><div><p class="ph">${phrase(i)}</p><p class="mn">${i.meaning}</p></div></div>`).join("")}
    </div></div>`).join("")}</div>`;
}


/* ---- The Brewtionary (kept on this device) ---- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
function addBrew(entry){ S.dict = S.dict || []; S.dict.push(entry); save(); toast("Added to your Brewtionary."); }
function brewtionary(){
  const entries = (S.dict || []).map((e, k) => ({ ...e, k })).filter(e => e && e.term);
  const groups = {};
  entries.forEach(e => { const key = e.term.toLowerCase(); (groups[key] = groups[key] || { term:e.term, defs:[] }).defs.push(e); });
  const terms = Object.values(groups).sort((x, y) => x.term.replace(/^[^a-z]+/i, "").localeCompare(y.term.replace(/^[^a-z]+/i, "")));
  const date = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }); };
  $("main").innerHTML = `<section class="panel">
    <div class="actions" style="justify-content:space-between">
      <div style="display:grid;gap:4px;min-width:0"><p class="kicker">The Brewtionary</p><h2 class="prompt small" style="margin:0">A dictionary of idioms that didn't exist until you made them up</h2></div>
      <button class="btn sm" id="brewNew">Brew a new one</button>
    </div>
    <p class="hint">Your entries are saved in this browser.</p>
    ${terms.length ? `<div class="lib">${terms.map(g => `<article class="card">
      <h3>${esc(g.term)}</h3>
      ${g.defs.map((e, n) => `<div style="display:grid;gap:4px">
        <p>${g.defs.length > 1 ? `<b>${n + 1}.</b> ` : ""}${esc(e.def)}</p>
        <div class="meta"><span>Brewed from “${esc(e.from && e.from[0])}” and “${esc(e.from && e.from[1])}”</span>
          ${date(e.added) ? `<span>· ${date(e.added)}</span>` : ""}
          <button class="btn ghost sm" data-del="${e.k}" style="margin-left:auto">Remove</button></div>
      </div>`).join("")}
    </article>`).join("")}</div>`
    : `<p class="hint">Nothing brewed yet. Go to the Mash-up tab, randomise an idiom, and write what it means. Your definition lands here.</p>`}
  </section>`;
  $("brewNew").onclick = () => show("mash");
  document.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { S.dict.splice(+b.dataset.del, 1); save(); brewtionary(); toast("Removed from the Brewtionary."); });
}

/* ---- Friend touches ---- */
function applyFriend(){
  if (F.dedication) { const d = $("dedication"); d.textContent = F.dedication; d.hidden = false; }
  if (F.footer) $("friendFooter").textContent = F.footer;
}

const VIEWS = { daily: dailyGame, fill: fillGame, rebus: rebusGame, world: worldGame, mash: mashGame, dict: brewtionary, quiz: quizGame, lib: library };
let current = "daily";
function show(tab){
  current = tab;
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  VIEWS[tab]();
}
document.querySelectorAll("nav.tabs button").forEach(b => b.onclick = () => show(b.dataset.tab));
applyFriend();
renderTally();
show(location.hash && VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : "daily");
if (S.lives <= 0) gameOver();
