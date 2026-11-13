/* =========================================================
 * កិច្ចការអន្តរកម្ម (Interactive Worksheets) — ដូច Liveworksheets
 * គ្រូ៖ Upload រូប/PDF → គូសប្រអប់ (វាយចម្លើយ, ជ្រើសចម្លើយ, ធីក, អូសពាក្យ, ចន្លោះទម្លាក់)
 * សិស្ស៖ ធ្វើលើរូបផ្ទាល់ → «បញ្ចប់» → ពិន្ទុភ្លាមៗ (កែដោយ Database — ចម្លើយលាក់ពីសិស្ស)
 * ========================================================= */
(function () {
  'use strict';
  const A = () => window.App;               // app helpers (set by app.js)
  const esc = (v) => A().esc(v);

  const TYPES = {
    text:   { label: 'វាយចម្លើយ',   icon: 'fa-i-cursor',        color: '#2563eb' },
    select: { label: 'ជ្រើសចម្លើយ',  icon: 'fa-square-caret-down', color: '#7c3aed' },
    tick:   { label: 'ធីក ✓',       icon: 'fa-square-check',     color: '#059669' },
    drag:   { label: 'ពាក្យសម្រាប់អូស', icon: 'fa-hand-pointer',  color: '#d97706' },
    drop:   { label: 'ចន្លោះទម្លាក់',  icon: 'fa-inbox',           color: '#dc2626' },
    name:   { label: 'ឈ្មោះសិស្ស',    icon: 'fa-id-badge',        color: '#0891b2', auto: true },
    date:   { label: 'កាលបរិច្ឆេទ',   icon: 'fa-calendar-day',    color: '#0891b2', auto: true },
    mleft:  { label: 'ចំណុចផ្គូផ្គង (សំណួរ)', icon: 'fa-circle-dot', color: '#db2777' },
    mright: { label: 'ចំណុចផ្គូផ្គង (ចម្លើយ)', icon: 'fa-bullseye',  color: '#9333ea' },
    audio:  { label: 'សំឡេង 🔊',      icon: 'fa-volume-high',     color: '#0d9488' }
  };
  // fields that are scored (not drag words, answer dots, audio or auto-filled name/date)
  const isQ = (f) => !['drag', 'name', 'date', 'mright', 'audio'].includes(f.type);
  // number of questions: a row of grouped tick boxes counts once
  const qCount = (fields) => { const fl = (fields || []).filter(isQ); return fl.filter(f => !f.group).length + new Set(fl.filter(f => f.group).map(f => f.group)).size; };
  const MATCH_LABELS = ['ក', 'ខ', 'គ', 'ឃ', 'ង', 'ច', 'ឆ', 'ជ', 'ឈ', 'ញ', 'ដ', 'ឋ', 'ឌ', 'ឍ', 'ណ', 'ត', 'ថ', 'ទ', 'ធ', 'ន'];
  // Google Drive share link → direct stream link
  const audioUrl = (src) => { const m = String(src || '').match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([A-Za-z0-9_-]+)/); return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : src; };
  let currentAudio = null;
  const stopAudio = () => { if (currentAudio) { currentAudio.a.pause(); currentAudio.el.classList.remove('playing'); currentAudio = null; } try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
  // "say:apple" → the device reads the text aloud (text-to-speech); language from "say:zh:你好" / "say:km:..." (default English)
  function playSource(src, el, onEnd) {
    const m = String(src || '').match(/^say:(?:(en|zh|km):)?([\s\S]+)$/);
    if (m) {
      if (!window.speechSynthesis) return Promise.reject(new Error('no tts'));
      const lang = { en: 'en-US', zh: 'zh-CN', km: 'km-KH' }[m[1] || 'en'];
      const u = new SpeechSynthesisUtterance(m[2]);
      u.lang = lang; u.rate = 0.8;
      const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2)) && /female|samantha|google|zira|aria|jenny/i.test(x.name))
        || speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      let ended = false; const fin = () => { if (!ended) { ended = true; clearTimeout(guard); onEnd(); } };
      const guard = setTimeout(fin, 2500 + m[2].length * 180);   // some devices never fire onend
      u.onend = fin; u.onerror = fin;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
      currentAudio = { a: { pause: () => speechSynthesis.cancel() }, el };
      return Promise.resolve();
    }
    const a = new Audio(audioUrl(src));
    currentAudio = { a, el };
    a.addEventListener('ended', onEnd);
    return a.play();
  }
  try { window.speechSynthesis && speechSynthesis.getVoices(); } catch (e) { /* warm up voice list */ }
  function setupAudio(root) {
    root.querySelectorAll('.ws-audio').forEach(el => el.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (currentAudio && currentAudio.el === el) { stopAudio(); return; }
      stopAudio();
      el.classList.add('playing');
      const done = () => { el.classList.remove('playing'); if (currentAudio && currentAudio.el === el) currentAudio = null; };
      playSource(el.dataset.src, el, done).catch(() => { done(); A().toast('មិនអាចចាក់សំឡេងបានទេ — សូមពិនិត្យ Internet ឬ Link សំឡេង', 'error'); });
    }));
  }
  // left dot id → right dot id, derived from answers (answer = label of the right dot)
  function pairsFromAnswers(w, answers) {
    const fields = w.fields || [], out = {};
    for (const f of fields) {
      if (f.type !== 'mleft' || !answers || !answers[f.id]) continue;
      // if a label were ever repeated on a page, use the dot nearest to this question (same exercise)
      const cs = fields.filter(x => x.type === 'mright' && x.page === f.page && x.label === answers[f.id]);
      const fy = f.y + f.h / 2, r = cs.sort((a, b) => Math.abs(a.y + a.h / 2 - fy) - Math.abs(b.y + b.h / 2 - fy))[0];
      if (r) out[f.id] = r.id;
    }
    return out;
  }
  const centre = (f) => [(f.x + f.w / 2) * 100, (f.y + f.h / 2) * 100];
  function drawMatchLines(root, w, pairs, results, correct = {}) {
    const byId = Object.fromEntries((w.fields || []).map(f => [f.id, f]));
    root.querySelectorAll('svg.ws-lines').forEach(svg => {
      const pi = +svg.dataset.page;
      svg.innerHTML = Object.entries(pairs).filter(([l]) => byId[l] && byId[l].page === pi).map(([l, r]) => {
        const [x1, y1] = centre(byId[l]), [x2, y2] = centre(byId[r]);
        const cls = results && l in results ? (results[l] ? 'ok' : 'bad') : '';
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
      }).join('') + Object.entries(correct).filter(([l]) => byId[l] && byId[l].page === pi).map(([l, r]) => {
        const [x1, y1] = centre(byId[l]), [x2, y2] = centre(byId[r]);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="answer"/>`;
      }).join('');
    });
    const linked = new Set([...Object.keys(pairs), ...Object.values(pairs)]);
    root.querySelectorAll('.ws-mdot').forEach(d => d.classList.toggle('linked', linked.has(d.dataset.fid || d.dataset.mr)));
  }
  // interactive line drawing: drag from one dot to a dot on the other side, or tap one then the other
  function setupMatch(root, w, state) {
    const dots = [...root.querySelectorAll('.ws-mdot')];
    if (!dots.length) return;
    const byId = Object.fromEntries((w.fields || []).map(f => [f.id, f]));
    const idOf = (el) => el.dataset.fid || el.dataset.mr;
    const redraw = () => drawMatchLines(root, w, pairsFromAnswers(w, state.answers), null);
    const connect = (a, b) => {
      const fa = byId[idOf(a)], fb = byId[idOf(b)];
      if (!fa || !fb || fa.type === fb.type || fa.page !== fb.page) return;
      const left = fa.type === 'mleft' ? fa : fb, right = fa.type === 'mleft' ? fb : fa;
      state.answers[left.id] = right.label;
      redraw();
    };
    const clearLeft = (el) => { const f = byId[idOf(el)]; if (f && f.type === 'mleft') { delete state.answers[f.id]; redraw(); } };
    const select = (el) => { dots.forEach(d => d.classList.toggle('active', d === el)); state.selDot = el; };
    const hit = (x, y, from) => dots.find(d => {
      if (d === from) return false;
      const r = d.getBoundingClientRect(), pad = Math.max(10, r.width * 0.3);
      return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    });
    dots.forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        if (state.done || e.button > 0) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const pageEl = el.closest('.ws-page'), svg = pageEl.querySelector('svg.ws-lines');
        const f = byId[idOf(el)], [cx, cy] = centre(f);
        const st = { x: e.clientX, y: e.clientY, moved: false, line: null };
        const move = (ev) => {
          if (!st.moved && Math.hypot(ev.clientX - st.x, ev.clientY - st.y) < 6) return;
          st.moved = true;
          if (!st.line) { st.line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); st.line.setAttribute('class', 'temp'); st.line.setAttribute('x1', cx); st.line.setAttribute('y1', cy); svg.appendChild(st.line); }
          const r = pageEl.getBoundingClientRect();
          st.line.setAttribute('x2', (ev.clientX - r.left) / r.width * 100); st.line.setAttribute('y2', (ev.clientY - r.top) / r.height * 100);
        };
        const up = (ev) => {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          if (st.line) st.line.remove();
          if (st.moved) {
            const t = hit(ev.clientX, ev.clientY, el);
            if (t) connect(el, t); else clearLeft(el);
            select(null);
          } else if (state.selDot && state.selDot !== el && byId[idOf(state.selDot)].type !== f.type) {
            connect(state.selDot, el); select(null);
          } else select(state.selDot === el ? null : el);
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    });
  }
  const KM_DIGITS = '០១២៣៤៥៦៧៨៩';
  const KM_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const kmNum = (n) => String(n).replace(/\d/g, d => KM_DIGITS[d]);
  const kmDate = (d) => { d = d ? new Date(d) : new Date(); return `${kmNum(d.getDate())} ${KM_MONTHS[d.getMonth()]} ${kmNum(d.getFullYear())}`; };
  // the date follows the worksheet's language: English → "12 November 2026", Chinese → "2026年11月12日", otherwise Khmer
  const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function sheetDate(date, subject) {
    const d = date ? new Date(date) : new Date();
    if (subject === 'english') return `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (subject === 'chinese') return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return kmDate(d);
  }
  // shrink a name/date so the whole text fits inside its box
  function fitAuto(el) {
    const s = el.firstElementChild; if (!s || !el.clientWidth) return;
    el.style.setProperty('--fit', 1);
    const room = el.clientWidth - 6, need = s.scrollWidth;
    if (need > room) el.style.setProperty('--fit', Math.max(0.45, room / need).toFixed(3));
  }
  function fillAuto(root, name, date, subject) {
    const put = (el, txt) => { el.innerHTML = txt ? `<span>${esc(txt)}</span>` : ''; fitAuto(el); };
    root.querySelectorAll('.ws-auto[data-auto=name]').forEach(el => put(el, name || ''));
    root.querySelectorAll('.ws-auto[data-auto=date]').forEach(el => put(el, sheetDate(date, subject)));
  }
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round4 = (v) => Math.round(v * 10000) / 10000;

  let cache = { sheets: [], subs: [] };

  // ---------------------------------------------------------
  //  Data
  // ---------------------------------------------------------
  let sheetsInFlight = null;
  function loadSheets() {
    if (sheetsInFlight) return sheetsInFlight;               // share one request between callers
    const vg = A().viewGrades();
    let q = A().sb.from('worksheets').select('*').order('created_at', { ascending: false });
    if (vg) q = q.in('grade', vg.length ? vg : ['-']);       // only the grades this person may see
    sheetsInFlight = q.then(({ data, error }) => { if (error) throw error; cache.sheets = data || []; return cache.sheets; })
      .finally(() => { sheetsInFlight = null; });
    return sheetsInFlight;
  }
  async function fetchSubmissions(studentIds) {
    if (!studentIds || !studentIds.length) return [];
    const sheetsReady = cache.sheets.length && !sheetsInFlight ? null : loadSheets().catch(() => null); // titles for reports
    const { data, error } = await A().sb.from('worksheet_submissions').select('*').in('student_id', studentIds).order('submitted_at', { ascending: false });
    if (sheetsReady) await sheetsReady;
    if (error) throw error;
    return data || [];
  }
  // best attempt per worksheet (subs ordered newest first)
  function bestBySheet(subs) {
    const m = {};
    for (const s of subs) {
      const cur = m[s.worksheet_id];
      if (!cur || (s.total ? s.score / s.total : 0) > (cur.total ? cur.score / cur.total : 0)) m[s.worksheet_id] = s;
    }
    return Object.values(m);
  }
  const pct = (s) => s.total ? Math.round(s.score / s.total * 100) : 0;
  const scoreClass = (p) => p >= 80 ? 'bg-emerald-50 text-emerald-700' : p >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';

  // ---------------------------------------------------------
  //  List view (tab «កិច្ចការ»)
  // ---------------------------------------------------------
  const filter = { grade: '', subject: '', q: '' };

  async function renderView() {
    const app = A(), me = app.state.me, v = app.$('#view');
    v.innerHTML = app.loading();
    let subs = [];
    try {
      const sheetsP = loadSheets();
      if (me.role === 'student') subs = await fetchSubmissions([me.id]);
      if (me.role === 'parent') subs = await fetchSubmissions(app.state.children.map(c => c.id));
      await sheetsP;
    } catch (e) { v.innerHTML = app.emptyBox('fa-wifi', 'មិនអាចទាញយកកិច្ចការបាន', esc(app.errMsg(e))); return; }
    cache.subs = subs;
    if (me.role === 'student') filter.grade = me.grade || '';
    if (me.role === 'parent' && !filter.grade && app.state.children[0]) filter.grade = app.state.children[0].grade || '';
    app.fixGradeFilter(filter);
    const vg = app.viewGrades();

    v.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-blue-950">កិច្ចការ & លំហាត់</h1>
          <p class="text-sm text-slate-500 mt-0.5">${me.role === 'student' ? 'ធ្វើកិច្ចការលើសន្លឹក ហើយចុច «បញ្ចប់» ដើម្បីមើលពិន្ទុ' : app.isStaff() ? 'បង្កើតសន្លឹកកិច្ចការអន្តរកម្មពីរូប ឬ PDF' : 'កិច្ចការ និងពិន្ទុរបស់កូន'}</p>
        </div>
        ${app.isStaff() ? `<button type="button" id="newSheetBtn" class="btn-red self-start sm:self-auto"><i class="fa-solid fa-plus"></i> បង្កើតកិច្ចការថ្មី</button>` : ''}
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input id="wsQ" type="search" value="${esc(filter.q)}" placeholder="ស្វែងរកកិច្ចការ..." class="field pl-9">
        </div>
        ${me.role === 'student' ? '' : `<select id="wsGrade" class="field sm:w-56">${app.gradeOptions(filter.grade, vg ? { includeAll: vg.length > 1, allLabel: app.viewAllLabel(), only: vg } : { includeAll: true })}</select>`}
        <select id="wsSubject" class="field sm:w-48"><option value="">គ្រប់មុខវិជ្ជា</option>${app.CFG.SUBJECTS.map(s => `<option value="${s.id}" ${filter.subject === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
      </div>
      <div id="wsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>`;

    app.$('#wsQ').addEventListener('input', (e) => { filter.q = e.target.value; drawGrid(); });
    app.$('#wsSubject').addEventListener('change', (e) => { filter.subject = e.target.value; drawGrid(); });
    if (app.$('#wsGrade')) app.$('#wsGrade').addEventListener('change', (e) => { filter.grade = e.target.value; drawGrid(); });
    if (app.$('#newSheetBtn')) app.$('#newSheetBtn').addEventListener('click', () => openBuilder());
    drawGrid();
  }

  function drawGrid() {
    const app = A(), me = app.state.me;
    const qq = filter.q.trim().toLowerCase();
    const list = cache.sheets.filter(w => (!filter.grade || w.grade === filter.grade) && (!filter.subject || w.subject === filter.subject) &&
      (!qq || (w.title + ' ' + w.teacher_name).toLowerCase().includes(qq)));
    const grid = app.$('#wsGrid');
    if (!list.length) {
      grid.innerHTML = `<div class="col-span-full">${app.emptyBox('fa-file-pen', 'មិនទាន់មានកិច្ចការ', app.isStaff() ? 'ចុច «បង្កើតកិច្ចការថ្មី» ហើយ Upload រូប ឬ PDF សន្លឹកកិច្ចការ' : 'គ្រូនឹងដាក់កិច្ចការឆាប់ៗនេះ')}</div>`;
      return;
    }
    const best = Object.fromEntries(bestBySheet(cache.subs).map(s => [s.worksheet_id + (me.role === 'parent' ? '' : ''), s]));
    grid.innerHTML = list.map(w => {
      const s = app.subjectOf(w.subject);
      const b = best[w.id];
      const nQ = qCount(w.fields);
      const canEdit = w.created_by === me.id || app.canManageGrade(w.grade);
      return `<article class="lesson-card" data-play="${w.id}" tabindex="0" role="button" aria-label="${esc(w.title)}">
        <div class="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
          ${w.pages && w.pages[0] ? `<img src="${esc(w.pages[0].url)}" alt="" loading="lazy" class="w-full h-full object-cover object-top">` : `<span class="absolute inset-0 flex items-center justify-center text-slate-300 text-4xl"><i class="fa-solid fa-file-pen"></i></span>`}
          ${b ? `<span class="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold shadow ${scoreClass(pct(b))}">${b.score}/${b.total}</span>` : ''}
        </div>
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="badge ${app.SUBJECT_COLORS[s.color]}"><i class="fa-solid ${s.icon}"></i> ${esc(s.name)}</span>
            <span class="badge bg-slate-100 text-slate-600">${esc(w.grade)}</span>
            <span class="badge bg-blue-50 text-blue-800">${nQ} សំណួរ</span>
          </div>
          <h3 class="font-bold text-slate-900 leading-snug line-clamp-2">${esc(w.title)}</h3>
          <p class="mt-auto text-xs text-slate-500 truncate"><i class="fa-solid fa-user-pen mr-1"></i>${esc(w.teacher_name || '—')}</p>
          <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            ${me.role === 'student' ? `<span class="btn-ghost-sm ${b ? 'text-emerald-700' : 'text-blue-900'}"><i class="fa-solid ${b ? 'fa-rotate-right' : 'fa-pen'}"></i> ${b ? (w.allow_retry ? 'ធ្វើម្តងទៀត' : 'មើលលទ្ធផល') : 'ចាប់ផ្តើមធ្វើ'}</span>` : ''}
            ${me.role === 'parent' ? `<span class="btn-ghost-sm"><i class="fa-solid fa-eye"></i> ${b ? 'មើលចម្លើយកូន' : 'មើលកិច្ចការ'}</span>` : ''}
            ${app.isStaff() ? `<button type="button" data-results="${w.id}" class="btn-ghost-sm text-indigo-700"><i class="fa-solid fa-square-poll-vertical"></i> លទ្ធផល</button>` : ''}
            ${canEdit ? `<button type="button" data-edit-ws="${w.id}" class="btn-ghost-sm"><i class="fa-solid fa-pen"></i> កែ</button>
                         <button type="button" data-del-ws="${w.id}" class="btn-ghost-sm text-red-600"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        </div>
      </article>`;
    }).join('');
    grid.onclick = (e) => {
      const r = e.target.closest('[data-results]'); if (r) { e.stopPropagation(); return openResults(r.dataset.results); }
      const ed = e.target.closest('[data-edit-ws]'); if (ed) { e.stopPropagation(); return openBuilder(cache.sheets.find(x => x.id === ed.dataset.editWs)); }
      const de = e.target.closest('[data-del-ws]'); if (de) { e.stopPropagation(); return deleteSheet(de.dataset.delWs); }
      const pl = e.target.closest('[data-play]'); if (pl) openSheetFor(pl.dataset.play);
    };
    grid.onkeydown = (e) => { const pl = e.target.closest('[data-play]'); if (pl && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openSheetFor(pl.dataset.play); } };
  }

  // what happens when someone opens a worksheet depends on the role
  async function openSheetFor(id) {
    const app = A(), me = app.state.me;
    let w = cache.sheets.find(x => x.id === id);
    if (!w) { await loadSheets(); w = cache.sheets.find(x => x.id === id); }
    if (!w) return app.toast('រកមិនឃើញកិច្ចការ', 'error');
    if (me.role === 'student') {
      const mine = (cache.subs.length ? cache.subs : await fetchSubmissions([me.id])).filter(s => s.worksheet_id === id && s.student_id === me.id);
      if (mine.length && !w.allow_retry) return openReview(w, mine[0], me);
      return openPlayer(w, { mode: 'student', previous: mine[0] });
    }
    if (me.role === 'parent') {
      const kidSubs = cache.subs.filter(s => s.worksheet_id === id);
      if (kidSubs.length) { const kid = app.state.children.find(c => c.id === kidSubs[0].student_id) || {}; return openReview(w, kidSubs[0], kid); }
      return openPlayer(w, { mode: 'view' });
    }
    return openPlayer(w, { mode: 'preview' });
  }

  async function deleteSheet(id) {
    const app = A(), w = cache.sheets.find(x => x.id === id); if (!w) return;
    app.openModal(app.modalHeader('លុបកិច្ចការ?', 'fa-trash') + `
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600">លុប <b>«${esc(w.title)}»</b>? ពិន្ទុរបស់សិស្សសម្រាប់កិច្ចការនេះក៏នឹងត្រូវលុបដែរ។</p>
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button><button type="button" id="cDelWs" class="btn-red">លុប</button></div>
      </div>`);
    app.$('#cDelWs').addEventListener('click', async () => {
      const { error } = await app.sb.from('worksheets').delete().eq('id', id);
      if (error) return app.toast(app.errMsg(error), 'error');
      // remove page images (best effort)
      const paths = (w.pages || []).map(p => storagePath(p.url)).filter(Boolean);
      if (paths.length) app.sb.storage.from('worksheets').remove(paths);
      app.closeModal(true); app.toast('បានលុបកិច្ចការ'); renderView();
    });
  }
  function storagePath(url) { const m = String(url || '').match(/\/object\/public\/worksheets\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; }

  // ---------------------------------------------------------
  //  Rendering a worksheet page with its fields
  // ---------------------------------------------------------
  // Each page keeps a CSS variable --pw (page width in px) so text scales with the page.
  const pageObservers = new WeakMap();
  function watchPageWidth(el) {
    if (pageObservers.has(el)) return;
    const ro = new ResizeObserver(() => { el.style.setProperty('--pw', el.clientWidth + 'px'); el.querySelectorAll('.ws-auto').forEach(fitAuto); });
    ro.observe(el); pageObservers.set(el, ro);
    el.style.setProperty('--pw', el.clientWidth + 'px');
  }
  function boxStyle(f, page) {
    const ratio = page.h / page.w; // height in units of page width
    const fs = clamp(f.h * ratio * 0.62, 0.008, 0.06);
    return `left:${f.x * 100}%;top:${f.y * 100}%;width:${f.w * 100}%;height:${f.h * 100}%;font-size:calc(var(--pw) * ${fs.toFixed(4)} * var(--fit, 1));`;
  }
  // background crop that shows exactly the part of the page under a drag item
  function cropStyle(f, page) {
    const bx = f.w >= 1 ? 0 : (f.x / (1 - f.w)) * 100, by = f.h >= 1 ? 0 : (f.y / (1 - f.h)) * 100;
    return `background-image:url('${page.url.replace(/'/g, '%27')}');background-size:${100 / f.w}% ${100 / f.h}%;background-position:${bx}% ${by}%;`;
  }

  // ---------------------------------------------------------
  //  PLAYER (student does the worksheet / staff preview / parent view)
  // ---------------------------------------------------------
  function openPlayer(w, { mode = 'student', previous = null } = {}) {
    const app = A();
    const fields = w.fields || [];
    const nQ = qCount(fields);
    const state = { answers: {}, placed: {}, seconds: 0, done: false, timer: null, selectedDrag: null };

    const pagesHtml = (w.pages || []).map((p, pi) => `
      <div class="ws-page relative mx-auto mb-4 shadow-md rounded-lg overflow-hidden bg-white select-none" data-page="${pi}" style="max-width:${Math.min(p.w, 1200)}px">
        <img src="${esc(p.url)}" alt="ទំព័រ ${pi + 1}" class="block w-full pointer-events-none" draggable="false">
        ${fields.some(f => f.page === pi && f.type === 'mleft') ? `<svg class="ws-lines" data-page="${pi}" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>` : ''}
        ${fields.filter(f => f.page === pi).map(f => playerFieldHtml(f, p)).join('')}
      </div>`).join('');

    app.openModal(`
      <div class="sticky top-0 bg-white z-20 border-b border-slate-100">
        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
          <div class="min-w-0">
            <h3 class="font-bold text-blue-950 leading-snug truncate">${esc(w.title)}</h3>
            <p class="text-xs text-slate-500">${esc(w.grade)} • ${nQ} សំណួរ${mode === 'preview' ? ' • <span class="text-amber-600 font-semibold">មើលសាកល្បង (គ្រូ)</span>' : ''}${previous ? ` • ពិន្ទុមុន ${previous.score}/${previous.total}` : ''}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            ${mode !== 'view' ? `<button type="button" id="wsFinish" class="btn-green"><i class="fa-solid fa-flag-checkered"></i> <span>បញ្ចប់</span></button>` : ''}
            <button type="button" data-close class="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="បិទ"><i class="fa-solid fa-xmark text-lg"></i></button>
          </div>
        </div>
        <div id="wsResultBar" class="hidden"></div>
      </div>
      <div class="p-2 sm:p-5 bg-slate-100 min-h-[calc(100dvh-64px)]">
        ${w.instructions ? `<div class="max-w-3xl mx-auto mb-4 text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-200"><i class="fa-solid fa-circle-info text-blue-700 mr-1"></i>${app.linkify(w.instructions)}</div>` : ''}
        <div id="wsPages">${pagesHtml || app.emptyBox('fa-image', 'កិច្ចការនេះមិនទាន់មានទំព័រ')}</div>
        ${mode !== 'view' && fields.some(f => f.type === 'drag') ? `<p class="text-center text-xs text-slate-500 mt-1"><i class="fa-solid fa-hand-pointer"></i> អូសពាក្យទៅដាក់ក្នុងចន្លោះ (ឬចុចពាក្យ រួចចុចចន្លោះ)</p>` : ''}
        ${mode !== 'view' && fields.some(f => f.type === 'mleft') ? `<p class="text-center text-xs text-slate-500 mt-1"><i class="fa-solid fa-circle-dot text-pink-600"></i> គូសបន្ទាត់៖ អូសពីចំណុចមួយទៅចំណុចម្ខាងទៀត (ឬចុចចំណុចមួយ រួចចុចចំណុចម្ខាងទៀត)។ អូសចេញទៅកន្លែងទំនេរ ដើម្បីលុបបន្ទាត់។</p>` : ''}
        ${fields.some(f => f.type === 'audio') ? `<p class="text-center text-xs text-slate-500 mt-1"><i class="fa-solid fa-volume-high text-teal-600"></i> ចុចប៊ូតុង 🔊 ដើម្បីស្តាប់ (ចុចម្តងទៀតដើម្បីឈប់)</p>` : ''}
      </div>`, {
      full: true,
      beforeClose: () => (mode === 'student' && !state.done && Object.keys(state.answers).length) ? confirm('អ្នកមិនទាន់ចុច «បញ្ចប់» ទេ។ ចាកចេញដោយមិនរក្សាទុក?') : true,
      onClose: () => { clearInterval(state.timer); stopAudio(); }
    });

    const root = app.$('#modalBox');
    root.querySelectorAll('.ws-page').forEach(watchPageWidth);
    fillAuto(root, mode === 'view' ? '' : app.state.me.full_name, null, w.subject);
    setupAudio(root);
    state.timer = setInterval(() => { if (document.visibilityState === 'visible') state.seconds++; }, 1000);
    if (mode === 'view') { root.querySelectorAll('.ws-field input, .ws-field select, .ws-field button').forEach(el => el.disabled = true); return; }

    // inputs
    root.querySelectorAll('.ws-field[data-type=text] input').forEach(inp => inp.addEventListener('input', () => { state.answers[inp.dataset.fid] = inp.value; }));
    root.querySelectorAll('.ws-field[data-type=select] select').forEach(sel => sel.addEventListener('change', () => { state.answers[sel.dataset.fid] = sel.value; }));
    root.querySelectorAll('.ws-field[data-type=tick]').forEach(el => el.addEventListener('click', () => {
      if (state.done) return;
      const on = !el.classList.contains('ticked');
      el.classList.toggle('ticked', on); el.setAttribute('aria-pressed', on);
      state.answers[el.dataset.fid] = on;
    }));
    setupDragDrop(root, w, state);
    setupMatch(root, w, state);

    app.$('#wsFinish').addEventListener('click', () => finish(w, mode, state, root));
  }

  function playerFieldHtml(f, page) {
    const st = boxStyle(f, page);
    if (f.type === 'text') return `<div class="ws-field" data-type="text" data-fid="${f.id}" style="${st}"><input data-fid="${f.id}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="ចម្លើយ"></div>`;
    if (f.type === 'select') return `<div class="ws-field" data-type="select" data-fid="${f.id}" style="${st}"><select data-fid="${f.id}" aria-label="ជ្រើសចម្លើយ"><option value=""></option>${(f.options || []).map(o => `<option>${esc(o)}</option>`).join('')}</select></div>`;
    if (f.type === 'tick') return `<button type="button" class="ws-field ws-tick" data-type="tick" data-fid="${f.id}" aria-pressed="false" aria-label="ធីក" style="${st}"><i class="fa-solid fa-check"></i></button>`;
    if (f.type === 'drop') return `<div class="ws-field ws-drop" data-type="drop" data-fid="${f.id}" style="${st}"></div>`;
    if (f.type === 'name' || f.type === 'date') return `<div class="ws-auto" data-auto="${f.type}" style="${st}"></div>`;
    if (f.type === 'mleft') return `<div class="ws-field ws-mdot ws-mleft" data-type="mleft" data-fid="${f.id}" style="${st}" role="button" aria-label="ចំណុចសំណួរ"><span></span></div>`;
    if (f.type === 'mright') return `<div class="ws-mdot ws-mright" data-mr="${f.id}" style="${st}" role="button" aria-label="ចំណុចចម្លើយ"><span></span></div>`;
    if (f.type === 'audio') return `<button type="button" class="ws-audio" data-src="${esc(f.src || '')}" style="${st}" aria-label="ស្តាប់សំឡេង"><i class="fa-solid fa-volume-high"></i></button>`;
    if (f.type === 'drag') return `<div class="ws-hole" style="${st}"></div><div class="ws-drag" data-fid="${f.id}" data-label="${esc(f.label || '')}" data-home-style="${esc(st + cropStyle(f, page))}" style="${st}${cropStyle(f, page)}" role="button" tabindex="0" aria-label="${esc(f.label || 'ពាក្យ')}"></div>`;
    return '';
  }

  // drag & drop with pointer events (mouse + touch) and tap-to-place fallback
  function setupDragDrop(root, w, state) {
    const drags = [...root.querySelectorAll('.ws-drag')];
    if (!drags.length) return;
    const fieldById = Object.fromEntries((w.fields || []).map(f => [f.id, f]));

    const placeInto = (dragEl, dropEl) => {
      const dragId = dragEl.dataset.fid;
      // clear previous spot of this drag
      for (const [dz, dId] of Object.entries(state.placed)) if (dId === dragId) { delete state.placed[dz]; delete state.answers[dz]; }
      if (dropEl) {
        const dzId = dropEl.dataset.fid;
        const prev = state.placed[dzId];
        if (prev && prev !== dragId) sendHome(root.querySelector(`.ws-drag[data-fid="${prev}"]`));
        state.placed[dzId] = dragId;
        state.answers[dzId] = dragEl.dataset.label;
        // centre the word inside the drop zone (same page only)
        const d = fieldById[dragId], z = fieldById[dzId];
        const page = w.pages[z.page];
        if (dragEl.parentElement !== dropEl.parentElement) dropEl.parentElement.appendChild(dragEl);
        const nx = z.x + (z.w - d.w) / 2, ny = z.y + (z.h - d.h) / 2;
        dragEl.style.left = nx * 100 + '%'; dragEl.style.top = ny * 100 + '%';
        dragEl.classList.add('placed');
        void page;
      } else sendHome(dragEl);
    };
    const sendHome = (dragEl) => {
      if (!dragEl) return;
      const f = fieldById[dragEl.dataset.fid];
      const homePage = root.querySelector(`.ws-page[data-page="${f.page}"]`);
      if (dragEl.parentElement !== homePage) homePage.appendChild(dragEl);
      dragEl.setAttribute('style', dragEl.dataset.homeStyle);
      dragEl.classList.remove('placed');
      for (const [dz, dId] of Object.entries(state.placed)) if (dId === dragEl.dataset.fid) { delete state.placed[dz]; delete state.answers[dz]; }
    };
    const dropAt = (x, y) => [...root.querySelectorAll('.ws-drop')].find(z => { const r = z.getBoundingClientRect(); return x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6; });
    const selectDrag = (el) => { drags.forEach(d => d.classList.toggle('selected', d === el)); state.selectedDrag = el; root.classList.toggle('ws-picking', !!el); };

    drags.forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        if (state.done || e.button > 0) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const r = el.getBoundingClientRect();
        const start = { x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
        const ghost = el.cloneNode(true);
        const move = (ev) => {
          if (!start.moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return;
          if (!start.moved) {
            start.moved = true;
            ghost.className = 'ws-drag ws-ghost';
            Object.assign(ghost.style, { position: 'fixed', left: 0, top: 0, width: r.width + 'px', height: r.height + 'px', zIndex: 80 });
            document.body.appendChild(ghost); el.style.opacity = '0.25';
          }
          ghost.style.transform = `translate(${ev.clientX - start.ox}px, ${ev.clientY - start.oy}px)`;
          root.querySelectorAll('.ws-drop').forEach(z => z.classList.toggle('hover', z === dropAt(ev.clientX, ev.clientY)));
        };
        const up = (ev) => {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          root.querySelectorAll('.ws-drop.hover').forEach(z => z.classList.remove('hover'));
          if (start.moved) {
            ghost.remove(); el.style.opacity = '';
            placeInto(el, dropAt(ev.clientX, ev.clientY));
            selectDrag(null);
          } else {
            selectDrag(state.selectedDrag === el ? null : el);   // tap = pick up
          }
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDrag(state.selectedDrag === el ? null : el); } });
    });
    root.querySelectorAll('.ws-drop').forEach(z => {
      z.addEventListener('click', () => { if (state.selectedDrag && !state.done) { placeInto(state.selectedDrag, z); selectDrag(null); } });
    });
  }

  async function finish(w, mode, state, root) {
    const app = A();
    const btn = app.$('#wsFinish');
    // read text inputs again (autofill etc.)
    root.querySelectorAll('.ws-field[data-type=text] input').forEach(i => { if (i.value.trim()) state.answers[i.dataset.fid] = i.value; else delete state.answers[i.dataset.fid]; });
    const fl = w.fields || [];
    const groups = [...new Set(fl.filter(f => f.type === 'tick' && f.group).map(f => f.group))];
    const total = fl.filter(f => isQ(f) && f.type !== 'tick').length + groups.length;
    const answered = fl.filter(f => isQ(f) && f.type !== 'tick' && state.answers[f.id] !== undefined && state.answers[f.id] !== '').length
      + groups.filter(g => fl.some(f => f.group === g && state.answers[f.id] === true)).length;
    if (mode === 'student' && answered < total && !confirm(`អ្នកនៅសល់សំណួរមិនទាន់ឆ្លើយ។ បញ្ចប់ឥឡូវនេះ?`)) return;

    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    let out;
    if (mode === 'preview') {
      const { data, error } = await app.sb.from('worksheet_keys').select('answers').eq('worksheet_id', w.id).maybeSingle();
      if (error) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> បញ្ចប់'; return app.toast(app.errMsg(error), 'error'); }
      out = gradeLocally(w, state.answers, (data && data.answers) || {});
    } else {
      const { data, error } = await app.sb.rpc('submit_worksheet', { p_worksheet: w.id, p_answers: state.answers, p_seconds: state.seconds });
      if (error) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> បញ្ចប់'; return app.toast(app.errMsg(error), 'error'); }
      out = data;
      cache.subs.unshift({ worksheet_id: w.id, student_id: app.state.me.id, score: out.score, total: out.total, answers: state.answers, results: out.results, submitted_at: new Date().toISOString(), seconds_spent: state.seconds });
    }
    state.done = true;
    clearInterval(state.timer);
    markResults(root, w, state.answers, out.results, out.answers);
    showResultBar(w, out, mode);
    btn.remove();
    if (app.state.tab === 'worksheets' && app.$('#wsGrid')) drawGrid();
  }

  function gradeLocally(w, answers, keys) {
    const norm = (t) => {
      let x = String(t ?? '').replace(/[​‌‍﻿]/g, '').replace(/\s+/g, ' ').toLowerCase().replace(/[០-៩]/g, d => '០១២៣៤៥៦៧៨៩'.indexOf(d));
      if (/^[0-9][0-9 ]*(\.[0-9]+)?$/.test(x.trim())) x = x.replace(/ /g, '');           // 3 000 000 = 3000000
      if (/^[0-9]{1,3}(,[0-9]{3})+(\.[0-9]+)?$/.test(x.trim())) x = x.replace(/,/g, ''); // 3,000,000
      if (/^[0-9]+\.[0-9]+$/.test(x.trim())) x = x.trim().replace(/0+$/, '').replace(/\.$/, '');    // 1.50 = 1.5
      return x.trim().replace(/^[ .។,]+|[ .។,]+$/g, '');
    };
    const results = {}, groups = {}; let score = 0, total = 0;
    for (const f of w.fields || []) {
      if (!isQ(f) || keys[f.id] === undefined) continue;
      let ok;
      if (f.type === 'tick') ok = !!answers[f.id] === (keys[f.id] === true);
      else ok = String(keys[f.id]).split('/').some(a => norm(a) !== '' && norm(a) === norm(answers[f.id]));
      if (f.type === 'tick' && f.group) { const g = groups[f.group] || (groups[f.group] = { ok: true, ids: [] }); g.ok = g.ok && ok; g.ids.push(f.id); continue; }
      total++; results[f.id] = ok; if (ok) score++;
    }
    // a row of tick boxes (same group) is one question
    for (const g of Object.values(groups)) { total++; if (g.ok) score++; g.ids.forEach(id => { results[id] = g.ok; }); }
    return { score, total, results, answers: keys };
  }

  function markResults(root, w, answers, results, keys) {
    root.querySelectorAll('.ws-field').forEach(el => {
      const id = el.dataset.fid;
      if (!(id in (results || {}))) return;
      const ok = results[id];
      el.classList.add(ok ? 'ws-ok' : 'ws-bad');
      el.querySelectorAll('input,select').forEach(i => i.disabled = true);
      if (el.tagName === 'BUTTON') el.disabled = true;
      const f0 = (w.fields || []).find(x => x.id === id);
      if (f0 && f0.group) {   // grouped ticks: colour the row, outline the box that should be ticked
        if (!ok && keys && keys[id] === true) el.classList.add('ws-should');
        return;
      }
      if (!ok && keys && keys[id] !== undefined && f0 && f0.type !== 'mleft') {
        const f = f0;
        let txt = f.type === 'tick' ? (keys[id] === true ? 'ត្រូវធីក ✓' : 'មិនត្រូវធីក') : String(keys[id]).split('/')[0];
        el.insertAdjacentHTML('beforeend', `<span class="ws-correct">${esc(txt)}</span>`);
      }
    });
    root.querySelectorAll('.ws-drag').forEach(d => d.classList.add('locked'));
    if (root.querySelector('svg.ws-lines')) {
      const correct = {};
      if (keys) { const kp = pairsFromAnswers(w, keys); for (const l in kp) if (results && results[l] === false) correct[l] = kp[l]; }
      drawMatchLines(root, w, pairsFromAnswers(w, answers), results, correct);
    }
  }

  function showResultBar(w, out, mode) {
    const app = A();
    const p = out.total ? Math.round(out.score / out.total * 100) : 0;
    const msg = p === 100 ? 'អស្ចារ្យណាស់! ត្រូវទាំងអស់ 🎉' : p >= 80 ? 'ល្អណាស់! 👏' : p >= 50 ? 'ល្អ! ព្យាយាមបន្តទៀត 💪' : 'ព្យាយាមម្តងទៀត 📚';
    const bar = app.$('#wsResultBar');
    bar.className = `px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 ${p >= 50 ? 'bg-emerald-50' : 'bg-amber-50'}`;
    bar.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl sm:text-3xl font-bold ${p >= 50 ? 'text-emerald-700' : 'text-amber-700'}">${out.score}/${out.total}</span>
        <div><p class="font-bold text-slate-800">${msg}</p><p class="text-xs text-slate-500">${p}%${mode === 'preview' ? ' • (សាកល្បង — មិនរក្សាទុក)' : ' • បានរក្សាទុកពិន្ទុរួចហើយ'}</p></div>
      </div>
      <div class="flex gap-2">
        ${mode === 'preview' || w.allow_retry ? `<button type="button" id="wsRetry" class="btn-ghost"><i class="fa-solid fa-rotate-right"></i> ធ្វើម្តងទៀត</button>` : ''}
        <button type="button" data-close class="btn-primary">រួចរាល់</button>
      </div>`;
    const r = app.$('#wsRetry');
    if (r) r.addEventListener('click', () => { app.closeModal(true); openPlayer(w, { mode, previous: mode === 'student' ? { score: out.score, total: out.total } : null }); });
  }

  // read-only review of a submission (student own / parent child / teacher)
  async function openReview(w, sub, student) {
    const app = A();
    openPlayer(w, { mode: 'view' });
    const root = app.$('#modalBox');
    // fill answers
    root.querySelectorAll('.ws-field[data-type=text] input').forEach(i => { i.value = sub.answers[i.dataset.fid] || ''; });
    root.querySelectorAll('.ws-field[data-type=select] select').forEach(s => { s.value = sub.answers[s.dataset.fid] || ''; });
    root.querySelectorAll('.ws-field[data-type=tick]').forEach(t => t.classList.toggle('ticked', sub.answers[t.dataset.fid] === true));
    // place drags by label
    const fieldById = Object.fromEntries((w.fields || []).map(f => [f.id, f]));
    const used = new Set();
    for (const f of w.fields || []) {
      if (f.type !== 'drop' || !sub.answers[f.id]) continue;
      const d = (w.fields || []).find(x => x.type === 'drag' && !used.has(x.id) && x.label === sub.answers[f.id]);
      if (!d) continue;
      used.add(d.id);
      const el = root.querySelector(`.ws-drag[data-fid="${d.id}"]`);
      const zEl = root.querySelector(`.ws-drop[data-fid="${f.id}"]`);
      if (el.parentElement !== zEl.parentElement) zEl.parentElement.appendChild(el);
      el.style.left = (f.x + (f.w - d.w) / 2) * 100 + '%'; el.style.top = (f.y + (f.h - d.h) / 2) * 100 + '%';
      el.classList.add('placed');
      void fieldById;
    }
    fillAuto(root, student.full_name, sub.submitted_at, w.subject);
    const { data: keys } = await app.sb.rpc('worksheet_answers', { p_worksheet: w.id });
    markResults(root, w, sub.answers, sub.results, keys);
    const p = pct(sub);
    const bar = app.$('#wsResultBar');
    bar.className = `px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 ${p >= 50 ? 'bg-emerald-50' : 'bg-amber-50'}`;
    bar.innerHTML = `<span class="text-2xl font-bold ${p >= 50 ? 'text-emerald-700' : 'text-amber-700'}">${sub.score}/${sub.total}</span>
      <div class="text-sm"><p class="font-bold text-slate-800">${esc(student.full_name || '')}</p>
      <p class="text-xs text-slate-500">ដងទី ${sub.attempt || 1} • ${app.fmtDateTime(sub.submitted_at)} • ${app.fmtDuration(sub.seconds_spent)}</p></div>`;
  }

  // ---------------------------------------------------------
  //  RESULTS for teachers
  // ---------------------------------------------------------
  async function openResults(id) {
    const app = A(), w = cache.sheets.find(x => x.id === id);
    app.openModal(app.modalHeader('លទ្ធផល — ' + esc(w.title), 'fa-square-poll-vertical') + `<div id="resBody" class="p-4 sm:p-5">${app.loading()}</div>`, { wide: true });
    const [{ data: subs, error }, { data: students }] = await Promise.all([
      app.sb.from('worksheet_submissions').select('*').eq('worksheet_id', id).order('submitted_at', { ascending: false }),
      app.sb.from('profiles').select('id,full_name,username,grade').eq('role', 'student')
    ]);
    const body = app.$('#resBody'); if (!body) return;
    if (error) { body.innerHTML = app.emptyBox('fa-wifi', 'មិនអាចទាញយកបាន', esc(app.errMsg(error))); return; }
    const byId = Object.fromEntries((students || []).map(s => [s.id, s]));
    const best = bestBySheet(subs || []);
    const inGrade = (students || []).filter(s => s.grade === w.grade);
    const notDone = inGrade.filter(s => !best.some(b => b.student_id === s.id));
    const avg = best.length ? Math.round(best.reduce((a, b) => a + pct(b), 0) / best.length) : 0;
    body.innerHTML = `
      <div class="grid grid-cols-3 gap-3 mb-4">
        ${app.statCard('fa-user-check', 'text-emerald-600 bg-emerald-50', best.length, 'សិស្សបានធ្វើ')}
        ${app.statCard('fa-percent', 'text-blue-900 bg-blue-50', avg + '%', 'ពិន្ទុមធ្យម')}
        ${app.statCard('fa-user-clock', 'text-amber-600 bg-amber-50', notDone.length, 'មិនទាន់ធ្វើ')}
      </div>
      ${(subs || []).length ? `<div class="border border-slate-200 rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 text-xs text-slate-500 text-left"><tr><th class="p-3">សិស្ស</th><th class="p-3">ពិន្ទុ</th><th class="p-3 hidden sm:table-cell">ដងទី</th><th class="p-3 hidden sm:table-cell">រយៈពេល</th><th class="p-3">ពេលដាក់</th><th class="p-3"></th></tr></thead>
        <tbody class="divide-y divide-slate-100">${subs.map(s => `<tr class="hover:bg-slate-50 cursor-pointer" data-sub="${s.id}">
          <td class="p-3 font-semibold">${esc((byId[s.student_id] || {}).full_name || '—')}</td>
          <td class="p-3"><span class="badge ${scoreClass(pct(s))}">${s.score}/${s.total}</span></td>
          <td class="p-3 hidden sm:table-cell">${s.attempt}</td>
          <td class="p-3 hidden sm:table-cell whitespace-nowrap">${app.fmtDuration(s.seconds_spent)}</td>
          <td class="p-3 whitespace-nowrap text-slate-500">${app.fmtDateTime(s.submitted_at)}</td>
          <td class="p-3 text-right"><i class="fa-solid fa-eye text-slate-400"></i></td></tr>`).join('')}</tbody></table></div></div>`
        : app.emptyBox('fa-inbox', 'មិនទាន់មានសិស្សធ្វើកិច្ចការនេះ')}
      ${notDone.length ? `<p class="text-xs text-slate-500 mt-4"><b>មិនទាន់ធ្វើ (${esc(w.grade)})៖</b> ${notDone.map(s => esc(s.full_name)).join(', ')}</p>` : ''}`;
    body.addEventListener('click', (e) => {
      const tr = e.target.closest('[data-sub]'); if (!tr) return;
      const s = subs.find(x => x.id === tr.dataset.sub);
      openReview(w, s, byId[s.student_id] || {});
    });
  }

  // worksheet section shown inside a lesson
  async function injectLessonSection(lessonId, el) {
    if (!el) return;
    const app = A();
    const { data } = await app.sb.from('worksheets').select('id,title,fields').eq('lesson_id', lessonId).order('created_at');
    if (!data || !data.length || !document.body.contains(el)) return;
    data.forEach(d => { if (!cache.sheets.find(x => x.id === d.id)) cache.sheets.push(d); });
    el.innerHTML = `<h4 class="font-bold text-slate-800 mb-2 text-sm"><i class="fa-solid fa-pen-to-square mr-1"></i> កិច្ចការសម្រាប់មេរៀននេះ</h4>
      <div class="flex flex-wrap gap-2">${data.map(d => `<button type="button" data-ws-open="${d.id}" class="btn-ghost text-blue-900"><i class="fa-solid fa-file-pen"></i> ${esc(d.title)}</button>`).join('')}</div>`;
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-ws-open]'); if (!b) return;
      await loadSheets();
      if (app.state.me.role === 'student') cache.subs = await fetchSubmissions([app.state.me.id]);
      if (app.state.me.role === 'parent') cache.subs = await fetchSubmissions(app.state.children.map(c => c.id));
      app.closeModal(true);
      openSheetFor(b.dataset.wsOpen);
    });
  }

  // worksheet table inside a student's report
  function reportHtml(student, subs) {
    const app = A();
    const best = bestBySheet(subs);
    const sheets = cache.sheets;
    const title = (id) => (sheets.find(s => s.id === id) || {}).title || 'កិច្ចការ';
    return `<h3 class="font-bold text-slate-800 mt-6 mb-3"><i class="fa-solid fa-pen-to-square text-red-600 mr-1"></i> ពិន្ទុកិច្ចការ</h3>
      ${best.length ? `<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-slate-50 text-xs text-slate-500 text-left"><tr><th class="p-3">កិច្ចការ</th><th class="p-3">ពិន្ទុល្អបំផុត</th><th class="p-3 hidden sm:table-cell">ធ្វើបាន</th><th class="p-3 whitespace-nowrap">ចុងក្រោយ</th></tr></thead>
        <tbody class="divide-y divide-slate-100">${best.map(b => {
          const attempts = subs.filter(s => s.worksheet_id === b.worksheet_id);
          return `<tr><td class="p-3 font-semibold text-slate-800">${esc(title(b.worksheet_id))}</td>
            <td class="p-3"><span class="badge ${scoreClass(pct(b))}">${b.score}/${b.total} • ${pct(b)}%</span></td>
            <td class="p-3 hidden sm:table-cell">${attempts.length} ដង</td>
            <td class="p-3 whitespace-nowrap text-slate-500">${app.fmtDateTime(attempts[0].submitted_at)}</td></tr>`;
        }).join('')}</tbody></table></div></div>` : `<p class="text-sm text-slate-500 bg-white rounded-xl border border-slate-200 p-4">មិនទាន់បានធ្វើកិច្ចការណាមួយ</p>`}`;
  }

  // ---------------------------------------------------------
  //  BUILDER (teacher)
  // ---------------------------------------------------------
  async function openBuilder(sheet = null) {
    const app = A();
    const b = {
      id: sheet ? sheet.id : null,
      pages: sheet ? JSON.parse(JSON.stringify(sheet.pages || [])) : [],
      fields: sheet ? JSON.parse(JSON.stringify(sheet.fields || [])) : [],
      answers: {},
      tool: 'text', selected: null, dirty: false
    };
    if (sheet && sheet.id) {
      const { data } = await app.sb.from('worksheet_keys').select('answers').eq('worksheet_id', sheet.id).maybeSingle();
      b.answers = (data && data.answers) || {};
    }
    if (!app.state.lessons.length) { try { await app.loadLessons(); } catch (e) { /* optional */ } }
    const s = sheet || { title: '', subject: 'khmer', grade: '', instructions: '', allow_retry: true, show_answers: true, lesson_id: null };

    app.openModal(`
      <div class="sticky top-0 bg-white z-30 border-b border-slate-200 shadow-sm">
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <h3 class="font-bold text-blue-950"><i class="fa-solid fa-file-pen text-red-600 mr-1.5"></i>${sheet && sheet.id ? 'កែកិច្ចការ' : 'បង្កើតកិច្ចការថ្មី'}</h3>
          <div class="flex items-center gap-2">
            <button type="button" id="bTest" class="btn-ghost hidden sm:inline-flex"><i class="fa-solid fa-play"></i> សាកល្បង</button>
            <button type="button" id="bSave" class="btn-primary"><i class="fa-solid fa-floppy-disk"></i> រក្សាទុក</button>
            <button type="button" data-close class="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="បិទ"><i class="fa-solid fa-xmark text-lg"></i></button>
          </div>
        </div>
        <div id="bToolbar" class="px-4 pb-3 flex flex-wrap items-center gap-1.5">
          <span class="text-xs font-semibold text-slate-500 mr-1">គូសប្រអប់៖</span>
          ${Object.entries(TYPES).map(([k, t]) => `<button type="button" data-tool="${k}" class="b-tool"><i class="fa-solid ${t.icon}" style="color:${t.color}"></i> ${t.label}</button>`).join('')}
          <button type="button" data-tool="move" class="b-tool"><i class="fa-solid fa-arrow-pointer"></i> ជ្រើស/ផ្លាស់ទី</button>
        </div>
        <div id="bProps" class="hidden px-4 py-2.5 bg-blue-50 border-t border-blue-100"></div>
      </div>

      <div class="p-4 space-y-4 bg-slate-100">
        <details class="bg-white rounded-xl border border-slate-200 p-4" ${sheet && sheet.id ? '' : 'open'}>
          <summary class="font-bold text-slate-800 cursor-pointer">ព័ត៌មានកិច្ចការ</summary>
          <form id="bMeta" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="block sm:col-span-2"><span class="label">ចំណងជើង *</span><input name="title" required maxlength="200" class="field mt-1" value="${esc(s.title)}" placeholder="ឧ. កិច្ចការផ្ទះ — បំពេញពាក្យ"></label>
            <label class="block"><span class="label">មុខវិជ្ជា</span><select name="subject" class="field mt-1">${app.CFG.SUBJECTS.map(x => `<option value="${x.id}" ${x.id === s.subject ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
            <label class="block"><span class="label">ថ្នាក់ *</span><select name="grade" class="field mt-1"><option value="">— ជ្រើសថ្នាក់ —</option>${app.gradeOptions(s.grade || app.state.filter.grade, { only: app.myGrades() })}</select></label>
            <label class="block sm:col-span-2"><span class="label">ភ្ជាប់ទៅមេរៀន (ស្រេចចិត្ត)</span><select name="lesson_id" class="field mt-1"><option value="">— មិនភ្ជាប់ —</option>${app.state.lessons.map(l => `<option value="${l.id}" ${l.id === s.lesson_id ? 'selected' : ''}>${esc(l.grade)} • ${esc(l.title)}</option>`).join('')}</select></label>
            <label class="block sm:col-span-2"><span class="label">ការណែនាំសម្រាប់សិស្ស</span><textarea name="instructions" rows="2" class="field mt-1" placeholder="ឧ. អូសពាក្យក្នុងប្រអប់ទៅបំពេញចន្លោះ">${esc(s.instructions || '')}</textarea></label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="allow_retry" ${s.allow_retry ? 'checked' : ''} class="w-4 h-4 accent-blue-900"> អនុញ្ញាតឱ្យធ្វើម្តងទៀត</label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="show_answers" ${s.show_answers ? 'checked' : ''} class="w-4 h-4 accent-blue-900"> បង្ហាញចម្លើយត្រូវ ក្រោយបញ្ចប់</label>
          </form>
        </details>

        <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <label class="btn-red cursor-pointer self-start"><i class="fa-solid fa-upload"></i> Upload រូប ឬ PDF
            <input id="bUpload" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple class="hidden"></label>
          <p id="bUpMsg" class="text-xs text-slate-500">រូប JPG/PNG ឬ PDF (មួយទំព័រ = មួយរូប)។ បន្ទាប់មក ជ្រើសប្រភេទប្រអប់ខាងលើ ហើយ <b>អូសលើរូប</b> ដើម្បីគូស។</p>
        </div>
        <div id="bPages"></div>
      </div>`, {
      full: true,
      beforeClose: () => b.dirty ? confirm('មានការកែប្រែមិនទាន់រក្សាទុក។ បិទដោយមិនរក្សាទុក?') : true
    });

    const root = app.$('#modalBox');
    const meta = app.$('#bMeta');
    meta.addEventListener('input', () => { b.dirty = true; });

    // ---- toolbar ----
    const setTool = (t) => {
      b.tool = t;
      root.querySelectorAll('.b-tool').forEach(x => x.classList.toggle('active', x.dataset.tool === t));
      root.querySelectorAll('.b-page').forEach(p => { p.style.cursor = t === 'move' ? 'default' : 'crosshair'; p.style.touchAction = t === 'move' ? 'pan-y' : 'none'; });
    };
    app.$('#bToolbar').addEventListener('click', (e) => { const t = e.target.closest('[data-tool]'); if (t) setTool(t.dataset.tool); });

    // ---- pages ----
    const drawPages = () => {
      app.$('#bPages').innerHTML = b.pages.length ? b.pages.map((p, pi) => `
        <div class="mb-6">
          <div class="flex items-center justify-between mb-1.5 max-w-[1100px] mx-auto">
            <span class="text-xs font-semibold text-slate-500">ទំព័រ ${pi + 1}</span>
            <div class="flex gap-1">
              ${pi > 0 ? `<button type="button" data-page-up="${pi}" class="icon-btn" title="ផ្លាស់ឡើងលើ"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
              <button type="button" data-page-del="${pi}" class="icon-btn text-red-600" title="លុបទំព័រ"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
          <div class="b-page ws-page relative mx-auto shadow-md rounded-lg overflow-hidden bg-white select-none" data-page="${pi}" style="max-width:${Math.min(p.w, 1100)}px">
            <img src="${esc(p.url)}" alt="" class="block w-full pointer-events-none" draggable="false">
          </div>
        </div>`).join('') : `<div class="bg-white rounded-xl border-2 border-dashed border-slate-300 py-16 text-center text-slate-400"><i class="fa-regular fa-image text-4xl mb-2"></i><p class="text-sm">Upload រូប ឬ PDF សន្លឹកកិច្ចការ ដើម្បីចាប់ផ្តើម</p></div>`;
      root.querySelectorAll('.b-page').forEach(el => { watchPageWidth(el); bindPage(el); });
      drawFields(); setTool(b.tool);
    };
    app.$('#bPages').addEventListener('click', (e) => {
      const del = e.target.closest('[data-page-del]');
      if (del) {
        const pi = +del.dataset.pageDel;
        if (!confirm('លុបទំព័រនេះ និងប្រអប់ទាំងអស់លើវា?')) return;
        b.fields = b.fields.filter(f => f.page !== pi).map(f => f.page > pi ? { ...f, page: f.page - 1 } : f);
        b.pages.splice(pi, 1); b.selected = null; b.dirty = true; drawPages(); drawProps();
      }
      const up = e.target.closest('[data-page-up]');
      if (up) {
        const pi = +up.dataset.pageUp;
        [b.pages[pi - 1], b.pages[pi]] = [b.pages[pi], b.pages[pi - 1]];
        b.fields.forEach(f => { if (f.page === pi) f.page = pi - 1; else if (f.page === pi - 1) f.page = pi; });
        b.dirty = true; drawPages();
      }
    });

    // ---- fields ----
    const fieldLabel = (f) => {
      if (f.type === 'text') return b.answers[f.id] || '?';
      if (f.type === 'select') return b.answers[f.id] ? '▾ ' + b.answers[f.id] : '▾ ?';
      if (f.type === 'tick') return (b.answers[f.id] === true ? '✓' : '') + (f.group ? ` [${f.group}]` : '');
      if (f.type === 'drag') return f.label || '?';
      if (f.type === 'drop') return b.answers[f.id] ? '⇣ ' + b.answers[f.id] : '⇣ ?';
      if (f.type === 'name') return 'ឈ្មោះសិស្ស (ស្វ័យប្រវត្តិ)';
      if (f.type === 'date') return 'កាលបរិច្ឆេទ (ស្វ័យប្រវត្តិ)';
      if (f.type === 'mleft') return b.answers[f.id] ? '● → ' + b.answers[f.id] : '● ?';
      if (f.type === 'mright') return '◎ ' + (f.label || '?');
      if (f.type === 'audio') return f.src ? (f.src.startsWith('say:') ? '🔊 ' + f.src.replace(/^say:(en:|zh:|km:)?/, '') : '🔊 មានសំឡេង') : '🔊 ?';
      return '';
    };
    const drawFields = () => {
      root.querySelectorAll('.b-field').forEach(n => n.remove());
      for (const f of b.fields) {
        const pageEl = root.querySelector(`.b-page[data-page="${f.page}"]`); if (!pageEl) continue;
        const t = TYPES[f.type];
        pageEl.insertAdjacentHTML('beforeend', `<div class="b-field ${b.selected === f.id ? 'sel' : ''}" data-fid="${f.id}" style="${boxStyle(f, b.pages[f.page])};--c:${t.color}">
          <span class="b-field-label">${esc(fieldLabel(f))}</span><span class="b-handle" data-handle></span></div>`);
      }
      // preview of the answer-key lines for matching dots
      root.querySelectorAll('.b-page').forEach(pageEl => {
        let svg = pageEl.querySelector('svg.b-lines');
        if (!svg) { pageEl.insertAdjacentHTML('afterbegin', '<svg class="b-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>'); svg = pageEl.querySelector('svg.b-lines'); }
        const pi = +pageEl.dataset.page;
        const pairs = pairsFromAnswers({ fields: b.fields }, b.answers);
        const byId = Object.fromEntries(b.fields.map(f => [f.id, f]));
        svg.innerHTML = Object.entries(pairs).filter(([l]) => byId[l].page === pi).map(([l, r]) => { const [x1, y1] = centre(byId[l]), [x2, y2] = centre(byId[r]); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
      });
    };

    const pointerPos = (pageEl, e) => { const r = pageEl.getBoundingClientRect(); return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) }; };

    function bindPage(pageEl) {
      pageEl.addEventListener('pointerdown', (e) => {
        if (e.button > 0) return;
        const pi = +pageEl.dataset.page;
        const fieldEl = e.target.closest('.b-field');
        const p0 = pointerPos(pageEl, e);
        e.preventDefault();
        pageEl.setPointerCapture(e.pointerId);

        let mode, f, orig;
        if (fieldEl) {
          f = b.fields.find(x => x.id === fieldEl.dataset.fid);
          b.selected = f.id; orig = { ...f };
          mode = e.target.closest('[data-handle]') ? 'resize' : 'move';
          drawFields(); drawProps();
        } else if (b.tool !== 'move') {
          mode = 'create';
          f = { id: uid(), page: pi, x: round4(p0.x), y: round4(p0.y), w: 0, h: 0, type: b.tool };
          if (f.type === 'select') f.options = [];
          if (f.type === 'drag') f.label = '';
          if (f.type === 'mright') { const used = new Set(b.fields.filter(x => x.type === 'mright' && x.page === pi).map(x => x.label)); f.label = MATCH_LABELS.find(l => !used.has(l)) || String(used.size + 1); }
          if (f.type === 'audio') f.src = '';
          b.fields.push(f); b.selected = f.id;
        } else { b.selected = null; drawFields(); drawProps(); return; }

        const onMove = (ev) => {
          const p = pointerPos(pageEl, ev);
          if (mode === 'create') {
            f.x = round4(Math.min(p0.x, p.x)); f.y = round4(Math.min(p0.y, p.y));
            f.w = round4(Math.abs(p.x - p0.x)); f.h = round4(Math.abs(p.y - p0.y));
          } else if (mode === 'move') {
            f.x = round4(clamp(orig.x + p.x - p0.x, 0, 1 - f.w)); f.y = round4(clamp(orig.y + p.y - p0.y, 0, 1 - f.h));
          } else {
            f.w = round4(clamp(orig.w + p.x - p0.x, 0.01, 1 - f.x)); f.h = round4(clamp(orig.h + p.y - p0.y, 0.006, 1 - f.y));
          }
          drawFields();
        };
        const onUp = () => {
          pageEl.removeEventListener('pointermove', onMove); pageEl.removeEventListener('pointerup', onUp); pageEl.removeEventListener('pointercancel', onUp);
          if (mode === 'create') {
            const page = b.pages[pi], ratio = page.w / page.h;
            if (f.w < 0.012 || f.h < 0.008) { // a click: drop a default-size box
              const def = (f.type === 'mleft' || f.type === 'mright') ? [0.028, 0.028 * ratio] : f.type === 'audio' ? [0.045, 0.045 * ratio] : f.type === 'tick' ? [0.035, 0.035 * ratio] : f.type === 'drag' ? [0.12, 0.035 * ratio] : (f.type === 'name' || f.type === 'date') ? [0.25, 0.03 * ratio] : [0.18, 0.035 * ratio];
              f.w = round4(Math.min(def[0], 1 - f.x)); f.h = round4(Math.min(def[1], 1 - f.y));
            }
            setTimeout(() => { const inp = app.$('#bProps [data-autofocus]'); if (inp) inp.focus(); }, 30);
          }
          b.dirty = true; drawFields(); drawProps();
        };
        pageEl.addEventListener('pointermove', onMove); pageEl.addEventListener('pointerup', onUp); pageEl.addEventListener('pointercancel', onUp);
      });
    }

    // ---- properties panel for the selected box ----
    const dragLabels = () => [...new Set(b.fields.filter(f => f.type === 'drag' && f.label).map(f => f.label))];
    function drawProps() {
      const panel = app.$('#bProps');
      const f = b.fields.find(x => x.id === b.selected);
      if (!f) { panel.classList.add('hidden'); panel.innerHTML = ''; return; }
      panel.classList.remove('hidden');
      const t = TYPES[f.type];
      let inner = '';
      if (f.type === 'text') inner = `<label class="flex-1 min-w-[200px]"><span class="label">ចម្លើយត្រឹមត្រូវ <span class="font-normal text-slate-400">(ចម្លើយច្រើន បំបែកដោយ / )</span></span>
          <input data-prop="answer" data-autofocus class="field mt-0.5" value="${esc(b.answers[f.id] || '')}" placeholder="ឧ. រៀន"></label>`;
      if (f.type === 'select') inner = `<label class="flex-1 min-w-[200px]"><span class="label">ជម្រើស (បំបែកដោយ / )</span>
          <input data-prop="options" data-autofocus class="field mt-0.5" value="${esc((f.options || []).join(' / '))}" placeholder="ឧ. ក / ខ / គ"></label>
        <label class="min-w-[150px]"><span class="label">ចម្លើយត្រូវ</span>
          <select data-prop="answer" class="field mt-0.5"><option value="">—</option>${(f.options || []).map(o => `<option ${b.answers[f.id] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
      if (f.type === 'tick') inner = `<label class="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" data-prop="tick" ${b.answers[f.id] === true ? 'checked' : ''} class="w-5 h-5 accent-emerald-600"> ប្រអប់នេះត្រូវធីក (ចម្លើយត្រូវ)</label>
        <label class="min-w-[220px]"><span class="label">ក្រុម <span class="font-normal text-slate-400">(ស្រេចចិត្ត — ប្រអប់ក្នុងជួរតែមួយ ដាក់ឈ្មោះក្រុមដូចគ្នា ឧ. 1 → គិតជា ១ សំណួរ)</span></span>
          <input data-prop="group" class="field mt-0.5" value="${esc(f.group || '')}" maxlength="10" placeholder="ឧ. 1"></label>`;
      if (f.type === 'drag') inner = `<label class="flex-1 min-w-[200px]"><span class="label">ពាក្យនៅក្នុងប្រអប់នេះ (សម្រាប់ផ្ទៀងចម្លើយ)</span>
          <input data-prop="label" data-autofocus class="field mt-0.5" value="${esc(f.label || '')}" placeholder="ឧ. ល្អណាស់"></label>`;
      if (f.type === 'name') inner = `<p class="text-sm text-cyan-800 flex-1 min-w-[200px]"><i class="fa-solid fa-circle-info"></i> ប្រព័ន្ធនឹងសរសេរ <b>ឈ្មោះសិស្ស</b> ដែលចូលធ្វើ ដោយស្វ័យប្រវត្តិ (មិនគិតពិន្ទុ)។ គូសលើចន្លោះ «ឈ្មោះ៖ .....»។</p>`;
      if (f.type === 'date') inner = `<p class="text-sm text-cyan-800 flex-1 min-w-[200px]"><i class="fa-solid fa-circle-info"></i> ប្រព័ន្ធនឹងសរសេរ <b>កាលបរិច្ឆេទ</b> ដែលសិស្សធ្វើកិច្ចការ ដោយស្វ័យប្រវត្តិ (មិនគិតពិន្ទុ)។</p>`;
      if (f.type === 'drop') inner = `<label class="flex-1 min-w-[200px]"><span class="label">ពាក្យដែលត្រូវទម្លាក់ចូល</span>
          <select data-prop="answer" data-autofocus class="field mt-0.5"><option value="">— ជ្រើសពាក្យ —</option>${dragLabels().map(l => `<option ${b.answers[f.id] === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
          ${dragLabels().length ? '' : '<span class="text-[11px] text-amber-700">គូសប្រអប់ «ពាក្យសម្រាប់អូស» ជាមុនសិន</span>'}</label>`;
      if (f.type === 'mleft') {
        const rights = b.fields.filter(x => x.type === 'mright' && x.page === f.page && x.label);
        inner = `<label class="flex-1 min-w-[200px]"><span class="label">ភ្ជាប់ទៅចំណុចចម្លើយ (ចម្លើយត្រូវ)</span>
          <select data-prop="answer" data-autofocus class="field mt-0.5"><option value="">— ជ្រើស —</option>${rights.map(r => `<option ${b.answers[f.id] === r.label ? 'selected' : ''}>${esc(r.label)}</option>`).join('')}</select>
          ${rights.length ? '' : '<span class="text-[11px] text-amber-700">គូសប្រអប់ «ចំណុចផ្គូផ្គង (ចម្លើយ)» នៅទំព័រដដែលជាមុនសិន</span>'}</label>`;
      }
      if (f.type === 'mright') inner = `<label class="min-w-[160px]"><span class="label">ឈ្មោះចំណុច (ឧ. ក ខ គ)</span>
          <input data-prop="label" data-autofocus class="field mt-0.5" value="${esc(f.label || '')}" maxlength="20"></label>
        <p class="text-xs text-slate-500 flex-1 min-w-[200px] pb-2">ដាក់ចំណុចនេះនៅជាប់ពាក្យ/រូបចម្លើយ។ បន្ទាប់មកចុចលើ «ចំណុចសំណួរ» ហើយជ្រើសឈ្មោះនេះជាចម្លើយត្រូវ។ សិស្សមិនឃើញឈ្មោះនេះទេ។</p>`;
      if (f.type === 'audio') inner = `<div class="flex-1 min-w-[240px] space-y-1.5">
          <span class="label">សំឡេង <span class="font-normal text-slate-400">(MP3/M4A ≤ 20MB, ឬ Link Google Drive ដែល Share «Anyone with the link»)</span></span>
          <div class="flex flex-wrap gap-1.5">
            <label class="btn-ghost-sm cursor-pointer"><i class="fa-solid fa-upload"></i> Upload<input type="file" accept="audio/*" data-audio-file class="hidden"></label>
            <button type="button" data-act="rec" class="btn-ghost-sm"><i class="fa-solid fa-microphone text-red-600"></i> <span>ថតសំឡេង</span></button>
            ${f.src ? `<button type="button" data-act="play" class="btn-ghost-sm"><i class="fa-solid fa-play text-teal-600"></i> ស្តាប់</button>` : ''}
          </div>
          <input data-prop="say" class="field" value="${esc((f.src || '').startsWith('say:') ? f.src.replace(/^say:(en:|zh:|km:)?/, '') : '')}" placeholder="ឬវាយពាក្យ/ប្រយោគ ឱ្យឧបករណ៍អានឮៗ (ឧ. apple)">
          <select data-prop="sayLang" class="field" style="max-width:200px">${[['en', 'អានជាភាសាអង់គ្លេស'], ['zh', 'អានជាភាសាចិន'], ['km', 'អានជាភាសាខ្មែរ']].map(([k, t]) => `<option value="${k}" ${((f.src || '').match(/^say:(en|zh|km):/) || [, 'en'])[1] === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <input data-prop="src" class="field" value="${esc((f.src || '').startsWith('say:') ? '' : f.src || '')}" placeholder="ឬបិទភ្ជាប់ Link សំឡេង (https://...)">
          <p data-audio-msg class="text-[11px] text-slate-500"></p></div>`;
      panel.innerHTML = `<div class="flex flex-wrap items-end gap-3">
        <span class="text-sm font-bold whitespace-nowrap pb-2" style="color:${t.color}"><i class="fa-solid ${t.icon}"></i> ${t.label}</span>
        ${inner}
        <div class="flex gap-1 pb-0.5 ml-auto">
          <button type="button" data-act="dup" class="btn-ghost-sm" title="ចម្លងប្រអប់"><i class="fa-regular fa-copy"></i> ចម្លង</button>
          <button type="button" data-act="del" class="btn-ghost-sm text-red-600" title="លុបប្រអប់ (Delete)"><i class="fa-solid fa-trash"></i> លុប</button>
        </div></div>`;
      panel.oninput = panel.onchange = (e) => {
        const el = e.target, prop = el.dataset.prop; if (!prop) return;
        if (prop === 'answer') { if (el.value.trim()) b.answers[f.id] = el.value.trim(); else delete b.answers[f.id]; }
        if (prop === 'tick') { if (el.checked) b.answers[f.id] = true; else delete b.answers[f.id]; }
        if (prop === 'group') { const v = el.value.trim(); if (v) f.group = v; else delete f.group; }
        if (prop === 'label') {
          const old = f.label; f.label = el.value.trim();
          const target = f.type === 'mright' ? 'mleft' : 'drop';
          for (const z of b.fields) if (z.type === target && b.answers[z.id] === old && old && (target === 'drop' || z.page === f.page)) b.answers[z.id] = f.label;
        }
        if (prop === 'src') { f.src = el.value.trim(); if (e.type === 'change') drawProps(); }
        if (prop === 'say' || prop === 'sayLang') {
          const txt = panel.querySelector('[data-prop=say]').value.trim(), lg = panel.querySelector('[data-prop=sayLang]').value;
          f.src = txt ? `say:${lg === 'en' ? '' : lg + ':'}${txt}` : ''; if (e.type === 'change') drawProps();
        }
        if (prop === 'options') {
          f.options = el.value.split('/').map(o => o.trim()).filter(Boolean);
          if (e.type === 'change') { if (b.answers[f.id] && !f.options.includes(b.answers[f.id])) delete b.answers[f.id]; drawProps(); }
        }
        b.dirty = true; drawFields();
      };
      const fileInp = panel.querySelector('[data-audio-file]');
      if (fileInp) fileInp.onchange = async () => {
        const file = fileInp.files[0]; if (!file) return;
        const msg = panel.querySelector('[data-audio-msg]');
        if (file.size > 20 * 1024 * 1024) return app.toast('ឯកសារសំឡេងធំពេក (≤ 20MB)', 'error');
        msg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុង Upload...';
        try { f.src = await uploadAudio(file, file.name); b.dirty = true; drawFields(); drawProps(); app.toast('បាន Upload សំឡេង'); }
        catch (err) { msg.innerHTML = `<span class="text-red-600">${esc(app.errMsg(err))}</span>`; }
      };
      panel.onclick = async (e) => {
        const a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'play') {
          stopAudio(); playSource(f.src, a, () => {}).catch(() => app.toast('មិនអាចចាក់សំឡេងបានទេ — សូមពិនិត្យ Link', 'error'));
          return;
        }
        if (a.dataset.act === 'rec') {
          const msg = panel.querySelector('[data-audio-msg]');
          if (recorder) { recorder.stop(); return; }
          if (!navigator.mediaDevices || !window.MediaRecorder) return app.toast('Browser នេះមិនគាំទ្រការថតសំឡេងទេ', 'error');
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const chunks = []; recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
            recorder.onstop = async () => {
              stream.getTracks().forEach(t => t.stop());
              const type = (recorder.mimeType || 'audio/webm').split(';')[0]; recorder = null;
              const blob = new Blob(chunks, { type });
              msg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុង Upload...';
              try { f.src = await uploadAudio(blob, 'rec.' + (type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm')); b.dirty = true; drawFields(); drawProps(); app.toast('បានរក្សាទុកសំឡេង'); }
              catch (err) { msg.innerHTML = `<span class="text-red-600">${esc(app.errMsg(err))}</span>`; }
            };
            recorder.start();
            a.classList.add('bg-red-50'); a.querySelector('span').textContent = 'ឈប់ថត ■';
            msg.innerHTML = '<span class="text-red-600"><i class="fa-solid fa-circle fa-beat"></i> កំពុងថត... ចុច «ឈប់ថត» ពេលរួច</span>';
          } catch (err) { recorder = null; app.toast('មិនអាចប្រើ Microphone បានទេ — សូមអនុញ្ញាតក្នុង Browser', 'error'); }
          return;
        }
        if (a.dataset.act === 'del') removeSelected();
        if (a.dataset.act === 'dup') {
          const n = { ...JSON.parse(JSON.stringify(f)), id: uid(), y: round4(clamp(f.y + f.h + 0.01, 0, 1 - f.h)) };
          b.fields.push(n); if (b.answers[f.id] !== undefined && f.type !== 'drop') b.answers[n.id] = b.answers[f.id];
          b.selected = n.id; b.dirty = true; drawFields(); drawProps();
        }
      };
    }
    function removeSelected() {
      const f = b.fields.find(x => x.id === b.selected); if (!f) return;
      b.fields = b.fields.filter(x => x.id !== f.id); delete b.answers[f.id];
      b.selected = null; b.dirty = true; drawFields(); drawProps();
    }
    const keyHandler = (e) => {
      if (!document.body.contains(root) || !app.$('#bPages')) { document.removeEventListener('keydown', keyHandler); return; }
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const f = b.fields.find(x => x.id === b.selected); if (!f) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSelected(); }
      const step = e.shiftKey ? 0.01 : 0.002;
      const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (mv) { e.preventDefault(); f.x = round4(clamp(f.x + mv[0], 0, 1 - f.w)); f.y = round4(clamp(f.y + mv[1], 0, 1 - f.h)); b.dirty = true; drawFields(); }
    };
    document.addEventListener('keydown', keyHandler);

    // ---- upload images / PDF ----
    app.$('#bUpload').addEventListener('change', async (e) => {
      const files = [...e.target.files]; e.target.value = '';
      if (!files.length) return;
      const msg = app.$('#bUpMsg');
      try {
        for (const file of files) {
          if (file.type === 'application/pdf') {
            const pdfjs = await loadPdfJs();
            const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
              msg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុងបម្លែង PDF ទំព័រ ${i}/${pdf.numPages}...`;
              const page = await pdf.getPage(i);
              const vp1 = page.getViewport({ scale: 1 });
              const vp = page.getViewport({ scale: Math.min(2.5, 1400 / vp1.width) });
              const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
              const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
              await page.render({ canvasContext: ctx, viewport: vp }).promise;
              b.pages.push(await uploadCanvas(c)); b.dirty = true; drawPages();
            }
          } else if (/^image\//.test(file.type)) {
            msg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> កំពុង Upload ${esc(file.name)}...`;
            const img = await loadImage(URL.createObjectURL(file));
            const scale = Math.min(1, 1400 / img.naturalWidth);
            const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
            const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(img.src);
            b.pages.push(await uploadCanvas(c)); b.dirty = true; drawPages();
          } else app.toast('ប្រភេទឯកសារមិនគាំទ្រ៖ ' + file.name, 'error');
        }
        msg.innerHTML = '<span class="text-emerald-700"><i class="fa-solid fa-check"></i> Upload រួចរាល់។ ជ្រើសប្រភេទប្រអប់ខាងលើ ហើយអូសលើរូបដើម្បីគូស។</span>';
      } catch (err) {
        console.error(err);
        msg.innerHTML = `<span class="text-red-600">${esc(app.errMsg(err))}</span>`;
      }
    });

    // ---- validate + save ----
    function collect() {
      const fd = new FormData(meta);
      return {
        title: (fd.get('title') || '').trim(), subject: fd.get('subject'), grade: fd.get('grade'),
        lesson_id: fd.get('lesson_id') || null, instructions: (fd.get('instructions') || '').trim(),
        allow_retry: !!fd.get('allow_retry'), show_answers: !!fd.get('show_answers')
      };
    }
    function validate(m) {
      if (!m.title) return 'សូមបញ្ចូលចំណងជើងកិច្ចការ';
      if (!m.grade) return 'សូមជ្រើសថ្នាក់';
      if (!b.pages.length) return 'សូម Upload រូប ឬ PDF សន្លឹកកិច្ចការ';
      const gradable = b.fields.filter(isQ);
      if (!gradable.length) return 'សូមគូសប្រអប់ចម្លើយយ៉ាងហោចណាស់មួយ';
      const missing = gradable.filter(f => f.type !== 'tick' && !b.answers[f.id]);
      if (missing.length) { b.selected = missing[0].id; drawFields(); drawProps(); return `មានប្រអប់ ${missing.length} មិនទាន់កំណត់ចម្លើយ (បានជ្រើសប្រអប់ដំបូងឱ្យ)`; }
      const noLabel = b.fields.filter(f => f.type === 'drag' && !f.label);
      if (noLabel.length) { b.selected = noLabel[0].id; drawFields(); drawProps(); return 'សូមវាយពាក្យសម្រាប់ប្រអប់ «ពាក្យសម្រាប់អូស»'; }
      const rightsOn = (pg) => b.fields.filter(x => x.type === 'mright' && x.page === pg).map(x => x.label);
      const badRight = b.fields.filter(f => f.type === 'mright' && (!f.label || rightsOn(f.page).filter(l => l === f.label).length > 1));
      if (badRight.length) { b.selected = badRight[0].id; drawFields(); drawProps(); return 'ចំណុចចម្លើយនីមួយៗត្រូវមានឈ្មោះ ហើយមិនត្រូវជាន់គ្នា (ក្នុងទំព័រដដែល)'; }
      const badLeft = b.fields.filter(f => f.type === 'mleft' && !rightsOn(f.page).includes(b.answers[f.id]));
      if (badLeft.length) { b.selected = badLeft[0].id; drawFields(); drawProps(); return 'ចំណុចសំណួរត្រូវភ្ជាប់ទៅចំណុចចម្លើយដែលមាន'; }
      const noAudio = b.fields.filter(f => f.type === 'audio' && !f.src);
      if (noAudio.length) { b.selected = noAudio[0].id; drawFields(); drawProps(); return 'សូម Upload ឬថតសំឡេង សម្រាប់ប្រអប់សំឡេង'; }
      const badSel = b.fields.filter(f => f.type === 'select' && (f.options || []).length < 2);
      if (badSel.length) { b.selected = badSel[0].id; drawFields(); drawProps(); return 'Dropdown ត្រូវមានជម្រើសយ៉ាងតិច ២'; }
      return null;
    }
    // ticks without answer = "should stay empty" → store false so they're scored
    const answerKey = () => { const k = { ...b.answers }; b.fields.forEach(f => { if (f.type === 'tick' && k[f.id] !== true) k[f.id] = false; if (!isQ(f) && f.type !== 'tick') delete k[f.id]; }); return k; };

    app.$('#bSave').addEventListener('click', async () => {
      const m = collect();
      const err = validate(m);
      if (err) return app.toast(err, 'error');
      const btn = app.$('#bSave'); btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      const fields = b.fields.map(({ id, page, x, y, w, h, type, options, label, src, group }) => ({ id, page, x, y, w, h, type, ...(options ? { options } : {}), ...(type === 'drag' || type === 'mright' ? { label } : {}), ...(type === 'audio' ? { src } : {}), ...(type === 'tick' && group ? { group } : {}) }));
      const payload = { ...m, pages: b.pages, fields };
      let id = b.id, res;
      if (id) res = await app.sb.from('worksheets').update(payload).eq('id', id);
      else { res = await app.sb.from('worksheets').insert({ ...payload, created_by: app.state.me.id, teacher_name: app.state.me.full_name }).select('id').single(); if (res.data) id = res.data.id; }
      if (!res.error) res = await app.sb.from('worksheet_keys').upsert({ worksheet_id: id, answers: answerKey() });
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> រក្សាទុក';
      if (res.error) return app.toast(app.errMsg(res.error), 'error');
      b.id = id; b.dirty = false;
      app.toast('បានរក្សាទុកកិច្ចការ — សិស្សអាចធ្វើបានភ្លាមៗ');
      app.closeModal(true);
      filter.grade = m.grade;
      if (app.state.tab === 'worksheets') renderView(); else location.hash = '#worksheets';
    });

    app.$('#bTest').addEventListener('click', () => {
      const m = collect();
      if (!b.pages.length) return app.toast('សូម Upload ទំព័រជាមុនសិន', 'error');
      const temp = { ...m, id: b.id || 'draft', pages: b.pages, fields: b.fields };
      // local preview with current (unsaved) answers
      const saved = { b: JSON.parse(JSON.stringify(b)), meta: m };
      app.closeModal(true);
      openPlayer(temp, { mode: 'view' });
      const root2 = app.$('#modalBox');
      fillAuto(root2, app.state.me.full_name, null, temp.subject);
      root2.querySelectorAll('.ws-field input, .ws-field select, .ws-field button').forEach(el => el.disabled = false);
      const st = { answers: {}, placed: {}, done: false, selectedDrag: null };
      root2.querySelectorAll('.ws-field[data-type=text] input').forEach(inp => inp.addEventListener('input', () => { st.answers[inp.dataset.fid] = inp.value; }));
      root2.querySelectorAll('.ws-field[data-type=select] select').forEach(sel => sel.addEventListener('change', () => { st.answers[sel.dataset.fid] = sel.value; }));
      root2.querySelectorAll('.ws-field[data-type=tick]').forEach(el => el.addEventListener('click', () => { if (st.done) return; const on = !el.classList.contains('ticked'); el.classList.toggle('ticked', on); st.answers[el.dataset.fid] = on; }));
      setupDragDrop(root2, temp, st);
      setupMatch(root2, temp, st);
      const bar = app.$('#wsResultBar');
      bar.className = 'px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-amber-50';
      bar.innerHTML = `<span class="text-sm text-amber-800"><i class="fa-solid fa-flask"></i> សាកល្បងធ្វើដូចសិស្ស (មិនរក្សាទុក)</span>
        <div class="flex gap-2"><button type="button" id="tCheck" class="btn-green"><i class="fa-solid fa-flag-checkered"></i> ពិនិត្យ</button>
        <button type="button" id="tBack" class="btn-primary"><i class="fa-solid fa-arrow-left"></i> ត្រឡប់ទៅកែ</button></div>`;
      app.$('#tCheck').addEventListener('click', () => {
        const out = gradeLocally(temp, st.answers, answerKey());
        st.done = true; markResults(root2, temp, st.answers, out.results, out.answers);
        app.toast(`ពិន្ទុ ${out.score}/${out.total}`);
      });
      app.$('#tBack').addEventListener('click', () => {
        app.closeModal(true);
        const restored = { ...(sheet || {}), ...saved.meta, id: saved.b.id, pages: saved.b.pages, fields: saved.b.fields };
        reopenAnswers = saved.b.answers;   // keep the unsaved answers
        openBuilder(restored);
      });
    });

    if (reopenAnswers) { b.answers = reopenAnswers; reopenAnswers = null; b.dirty = true; }
    setTool('text');
    drawPages(); drawProps();
  }
  let reopenAnswers = null, recorder = null;

  // ---------- upload helpers ----------
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('មិនអាចបើករូបភាពបាន')); i.src = src; });
  }
  async function uploadCanvas(canvas) {
    const app = A();
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.86));
    const path = `${app.state.me.id}/${Date.now()}-${uid()}.jpg`;
    const { error } = await app.sb.storage.from('worksheets').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
    if (error) throw error;
    const { data } = app.sb.storage.from('worksheets').getPublicUrl(path);
    return { url: data.publicUrl, w: canvas.width, h: canvas.height };
  }
  async function uploadAudio(blob, name) {
    const app = A();
    const ext = (String(name).match(/\.([a-z0-9]{2,4})$/i) || [, 'mp3'])[1].toLowerCase();
    const type = (blob.type || 'audio/mpeg').split(';')[0];
    const path = `${app.state.me.id}/audio-${Date.now()}-${uid()}.${ext}`;
    const { error } = await app.sb.storage.from('worksheets').upload(path, blob, { contentType: type, cacheControl: '31536000' });
    if (error) throw error;
    return app.sb.storage.from('worksheets').getPublicUrl(path).data.publicUrl;
  }
  let pdfPromise = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!pdfPromise) pdfPromise = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'vendor/pdfjs/pdf.min.js';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js'; res(window.pdfjsLib); };
      s.onerror = () => rej(new Error('មិនអាចបើកកម្មវិធីអាន PDF បាន'));
      document.head.appendChild(s);
    });
    return pdfPromise;
  }

  window.Worksheets = { renderView, injectLessonSection, reportHtml, fetchSubmissions, bestBySheet };
})();
