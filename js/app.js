/* =========================================================
 * សាលាអន្តរជាតិ ហេមតុន — ថ្នាក់រៀនអនឡាញ
 * តួនាទី៖ admin, teacher (គ្រូ), student (សិស្ស), parent (មាតាបិតា)
 * ========================================================= */
(function () {
  'use strict';

  const CFG = window.APP_CONFIG;
  const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'hampton-auth' }
  });

  const ROLES = {
    admin:   { label: 'Admin ប្រព័ន្ធ', icon: 'fa-user-shield',  bg: 'bg-red-600' },
    manager: { label: 'អ្នកគ្រប់គ្រង', icon: 'fa-user-gear',     bg: 'bg-rose-500' },
    head:    { label: 'ប្រធានផ្នែក', icon: 'fa-user-tie',         bg: 'bg-purple-700' },
    teacher: { label: 'គ្រូបង្រៀន', icon: 'fa-chalkboard-user',  bg: 'bg-blue-900' },
    student: { label: 'សិស្ស',      icon: 'fa-user-graduate',    bg: 'bg-emerald-600' },
    parent:  { label: 'មាតាបិតា',   icon: 'fa-people-roof',      bg: 'bg-amber-500' }
  };
  const SUBJECT_COLORS = {
    blue: 'bg-blue-50 text-blue-800', indigo: 'bg-indigo-50 text-indigo-800', emerald: 'bg-emerald-50 text-emerald-800',
    rose: 'bg-rose-50 text-rose-800', amber: 'bg-amber-50 text-amber-800', purple: 'bg-purple-50 text-purple-800',
    slate: 'bg-slate-100 text-slate-700'
  };
  // card header gradients per subject colour
  const SUBJECT_GRAD = {
    blue: 'from-blue-600 via-blue-700 to-blue-900', indigo: 'from-indigo-500 via-indigo-600 to-violet-800', emerald: 'from-emerald-500 via-emerald-600 to-teal-800',
    rose: 'from-rose-500 via-rose-600 to-red-800', amber: 'from-amber-400 via-orange-500 to-orange-700', purple: 'from-purple-500 via-fuchsia-600 to-purple-800',
    slate: 'from-slate-500 via-slate-600 to-slate-800'
  };
  const SUBJECT_DOT = { blue: 'bg-blue-600', indigo: 'bg-indigo-600', emerald: 'bg-emerald-600', rose: 'bg-rose-600', amber: 'bg-orange-500', purple: 'bg-purple-600', slate: 'bg-slate-500' };
  const KD = '០១២៣៤៥៦៧៨៩';
  const toArabic = (t) => String(t).replace(/[០-៩]/g, d => KD.indexOf(d));
  // «មេរៀនទី១០ ៖ សត្វ…» → { no: 10, label: 'មេរៀនទី១០', rest: 'សត្វ…' }
  function splitTitle(t) {
    const m = /^\s*(មេរៀនទី\s*([០-៩0-9]+))\s*[៖:]\s*(.+)$/.exec(t || '');
    return m ? { no: +toArabic(m[2]), label: m[1], rest: m[3] } : { no: null, label: '', rest: t || '' };
  }
  const KM_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const KM_DAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const kmNum = (n) => String(n).replace(/[0-9]/g, d => KD[d]);
  const todayKm = () => { const d = new Date(); return `ថ្ងៃ${KM_DAYS[d.getDay()]} ទី${kmNum(d.getDate())} ខែ${KM_MONTHS[d.getMonth()]} ឆ្នាំ${kmNum(d.getFullYear())}`; };
  const ALL_GRADES = CFG.GRADES.flatMap(g => g.items);

  const state = {
    me: null,            // profile
    lessons: [],
    myRecords: {},       // lesson_id -> record (student)
    children: [],        // parent
    filter: { grade: '', subject: '', q: '' },
    tab: 'lessons'
  };

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const subjectOf = (id) => CFG.SUBJECTS.find(s => s.id === id) || CFG.SUBJECTS[CFG.SUBJECTS.length - 1];
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('km-KH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('km-KH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  function fmtDuration(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec + ' វិនាទី';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h ? `${h} ម៉ោង ${m} នាទី` : `${m} នាទី`;
  }
  function gradeOptions(selected, { includeAll = false, allLabel = 'គ្រប់ថ្នាក់', only = null } = {}) {
    let html = includeAll ? `<option value="">${allLabel}</option>` : '';
    for (const g of CFG.GRADES) {
      const items = only ? g.items.filter(i => only.includes(i)) : g.items;
      if (!items.length) continue;
      html += `<optgroup label="${esc(g.group)}">` + items.map(i => `<option ${i === selected ? 'selected' : ''}>${esc(i)}</option>`).join('') + '</optgroup>';
    }
    return html;
  }
  // a department head is stored as a teacher with managed_grades
  // a manager (អ្នកគ្រប់គ្រង) is stored as an admin that is not the system owner
  const effRole = (p) => (p.role === 'teacher' && (p.managed_grades || []).length) ? 'head' : (p.role === 'admin' && !p.is_owner) ? 'manager' : p.role;
  const myGrades = () => {
    if (!state.me) return null;
    if (state.me.role === 'head') return state.me.managed_grades || [];
    if (state.me.role === 'teacher' && (state.me.teach_grades || []).length) return state.me.teach_grades;
    return null;
  };
  // a classroom teacher only sees the grades they teach (lessons, worksheets)
  // students see only their own grade, parents only their children's grades
  const viewGrades = () => {
    const me = state.me; if (!me) return null;
    if (me.role === 'teacher' && (me.teach_grades || []).length) return me.teach_grades;
    if (me.role === 'student') return me.grade ? [me.grade] : [];
    if (me.role === 'parent') return [...new Set((state.children || []).map(c => c.grade).filter(Boolean))];
    return null;
  };
  const viewAllLabel = () => state.me && state.me.role === 'parent' ? 'គ្រប់ថ្នាក់របស់កូន' : 'គ្រប់ថ្នាក់របស់ខ្ញុំ';
  const fixGradeFilter = (f) => { const vg = viewGrades(); if (vg && !vg.includes(f.grade)) f.grade = vg.length === 1 ? vg[0] : ''; };
  const canManageGrade = (g) => state.me.role === 'admin' || (state.me.role === 'head' && myGrades().includes(g));
  function linkify(text) {
    return esc(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" class="text-blue-700 underline break-all">$1</a>').replace(/\n/g, '<br>');
  }
  function toast(msg, type = 'ok') {
    const t = $('#toast');
    t.textContent = msg;
    t.className = t.className.replace(/bg-\S+/g, '') + (type === 'error' ? ' bg-red-600' : ' bg-slate-900');
    t.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.style.opacity = '0'; }, type === 'error' ? 4500 : 2800);
  }
  function errMsg(e) {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/Invalid login credentials/i.test(m)) return 'Username ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'មិនអាចភ្ជាប់ Internet បានទេ — សូមពិនិត្យការតភ្ជាប់';
    if (/JWT expired/i.test(m)) return 'សម័យប្រើប្រាស់ផុតកំណត់ — សូមចូលម្តងទៀត';
    return m;
  }
  const isStaff = () => state.me && ['admin', 'head', 'teacher'].includes(state.me.role);

  // ---------- YouTube & Google Drive ----------
  function youtubeId(input) {
    if (!input) return null;
    const s = String(input).trim();
    const src = (s.match(/src=["']([^"']+)["']/) || [])[1] || s;
    const m = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(src)) return src;
    return null;
  }
  function driveLinks(url) {
    if (!url) return null;
    const u = String(url).trim();
    let m = u.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]+)/);
    if (m) {
      const kind = m[1], id = m[2];
      const fmt = { document: 'docx', spreadsheets: 'xlsx', presentation: 'pptx' }[kind];
      return {
        kind: kind === 'document' ? 'word' : kind === 'spreadsheets' ? 'excel' : 'powerpoint',
        preview: `https://docs.google.com/${kind}/d/${id}/preview`,
        view: `https://docs.google.com/${kind}/d/${id}/view`,
        download: `https://docs.google.com/${kind}/d/${id}/export?format=${fmt}`,
        downloadPdf: `https://docs.google.com/${kind}/d/${id}/export?format=pdf`
      };
    }
    m = u.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/) || u.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([A-Za-z0-9_-]+)/);
    if (m) {
      const id = m[1];
      return {
        kind: 'file',
        preview: `https://drive.google.com/file/d/${id}/preview`,
        view: `https://drive.google.com/file/d/${id}/view`,
        download: `https://drive.google.com/uc?export=download&id=${id}`
      };
    }
    if (/^https?:\/\//.test(u)) return { kind: 'link', preview: null, view: u, download: null };
    return null;
  }
  function fileIcon(name, kind) {
    const n = (name || '').toLowerCase();
    if (kind === 'word' || /\.docx?$/.test(n)) return 'fa-file-word text-blue-700';
    if (kind === 'excel' || /\.xlsx?$/.test(n)) return 'fa-file-excel text-emerald-700';
    if (kind === 'powerpoint' || /\.pptx?$/.test(n)) return 'fa-file-powerpoint text-orange-600';
    if (/\.pdf$/.test(n)) return 'fa-file-pdf text-red-600';
    return 'fa-file-lines text-slate-500';
  }

  // ---------- Modal ----------
  let onModalClose = null, beforeModalClose = null;
  function openModal(html, { wide = false, full = false, onClose = null, beforeClose = null } = {}) {
    beforeModalClose = beforeClose;
    const box = $('#modalBox');
    box.className = 'relative bg-white w-full sm:rounded-2xl shadow-2xl max-h-screen sm:max-h-[94vh] overflow-y-auto ' + (full ? 'sm:max-w-6xl' : wide ? 'sm:max-w-4xl' : 'sm:max-w-lg');
    box.innerHTML = html;
    $('#modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    onModalClose = onClose;
  }
  function closeModal(force = false) {
    if (!force && beforeModalClose && beforeModalClose() === false) return;
    beforeModalClose = null;
    if (onModalClose) { const f = onModalClose; onModalClose = null; f(); }
    $('#modal').classList.add('hidden');
    $('#modalBox').innerHTML = '';
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').classList.contains('hidden')) closeModal(); });
  const modalHeader = (title, icon = '') => `
    <div class="sticky top-0 bg-white z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
      <h3 class="font-bold text-blue-950 text-base leading-snug">${icon ? `<i class="fa-solid ${icon} mr-1.5 text-red-600"></i>` : ''}${title}</h3>
      <button type="button" data-close class="w-9 h-9 flex-shrink-0 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="បិទ"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>`;

  // ---------- Auth ----------
  async function boot() {
    $('#year').textContent = new Date().getFullYear();
    const { data } = await sb.auth.getSession();
    if (data.session) await enterApp();
    else showLogin();
  }
  function showLogin() {
    $('#bootScreen').classList.add('hidden');
    $('#appScreen').classList.add('hidden');
    $('#loginScreen').classList.remove('hidden');
    setTimeout(() => $('#loginForm [name=username]').focus(), 50);
  }
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('button[type=submit]'), err = $('#loginError');
    err.classList.add('hidden');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុងចូល...';
    const username = f.username.value.trim().toLowerCase();
    const { error } = await sb.auth.signInWithPassword({ email: `${username}@${CFG.EMAIL_DOMAIN}`, password: f.password.value });
    btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> ចូល';
    if (error) { err.textContent = errMsg(error); err.classList.remove('hidden'); return; }
    f.reset();
    await enterApp();
  });

  async function enterApp() {
    const { data: { session } } = await sb.auth.getSession();
    const user = session && session.user;
    if (!user) return showLogin();
    const { data: me, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (error || !me) {
      await sb.auth.signOut();
      showLogin();
      const err = $('#loginError'); err.textContent = 'គណនីនេះមិនទាន់មានក្នុងប្រព័ន្ធសាលា — សូមទាក់ទង Admin'; err.classList.remove('hidden');
      return;
    }
    me.role = effRole(me);
    me.isManager = me.role === 'manager';
    if (me.isManager) me.role = 'admin'; // a manager has every admin right except managing admins
    state.me = me;
    const r = ROLES[me.isManager ? 'manager' : me.role];
    $('#userAvatar').className = `w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${r.bg}`;
    $('#userAvatar').innerHTML = `<i class="fa-solid ${r.icon}"></i>`;
    const roleText = r.label + (me.role === 'student' && me.grade ? ' • ' + me.grade : '') + (me.role === 'head' ? ' • ' + me.managed_grades.length + ' ថ្នាក់' : '') + (me.role === 'teacher' && (me.teach_grades || []).length ? ' • ' + me.teach_grades.join(', ') : '');
    $('#userName').textContent = me.full_name; $('#userNameMobile').textContent = me.full_name;
    $('#userRole').textContent = roleText; $('#userRoleMobile').textContent = roleText;

    if (me.role === 'student') state.filter.grade = me.grade || '';
    if (me.role === 'parent') {
      // RLS: a parent can only read the profiles of their own linked children
      const { data: kids } = await sb.from('profiles').select('*').eq('role', 'student').order('full_name');
      state.children = kids || [];
    }

    $('#bootScreen').classList.add('hidden');
    $('#loginScreen').classList.add('hidden');
    $('#appScreen').classList.remove('hidden');
    renderTabs();
    route();
  }

  // user menu
  $('#userMenuBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#userDropdown').classList.toggle('hidden'); });
  document.addEventListener('click', () => $('#userDropdown').classList.add('hidden'));
  $('#userDropdown').addEventListener('click', async (e) => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    if (a.dataset.action === 'logout') {
      await sb.auth.signOut();
      state.me = null; state.lessons = []; state.myRecords = {}; state.children = [];
      location.hash = '';
      showLogin();
    }
    if (a.dataset.action === 'change-password') openChangePassword();
  });

  function openChangePassword() {
    openModal(modalHeader('ប្តូរពាក្យសម្ងាត់', 'fa-key') + `
      <form id="pwForm" class="p-5 space-y-4">
        <label class="block"><span class="label">ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)</span>
          <input name="p1" type="password" minlength="6" required class="field mt-1" autocomplete="new-password"></label>
        <label class="block"><span class="label">វាយម្តងទៀត</span>
          <input name="p2" type="password" minlength="6" required class="field mt-1" autocomplete="new-password"></label>
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button><button class="btn-primary">រក្សាទុក</button></div>
      </form>`);
    $('#pwForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.p1.value !== f.p2.value) return toast('ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នា', 'error');
      const { error } = await sb.auth.updateUser({ password: f.p1.value });
      if (error) return toast(errMsg(error), 'error');
      closeModal(); toast('បានប្តូរពាក្យសម្ងាត់រួចរាល់');
    });
  }

  // ---------- Tabs / routing ----------
  function tabsForRole(role) {
    if (role === 'student') return [['lessons', 'fa-book-open', 'មេរៀនរបស់ខ្ញុំ'], ['worksheets', 'fa-pen-to-square', 'កិច្ចការ'], ['records', 'fa-chart-simple', 'កំណត់ត្រារៀន']];
    if (role === 'parent') return [['records', 'fa-chart-simple', 'ការរៀនរបស់កូន'], ['lessons', 'fa-book-open', 'មេរៀន'], ['worksheets', 'fa-pen-to-square', 'កិច្ចការ']];
    return [['lessons', 'fa-book-open', 'មេរៀន'], ['worksheets', 'fa-pen-to-square', 'កិច្ចការ'], ['records', 'fa-chart-simple', 'កំណត់ត្រាសិស្ស'], ['accounts', 'fa-users', role === 'admin' ? 'គណនីអ្នកប្រើ' : role === 'head' ? 'គណនីផ្នែក' : 'គណនីសិស្ស']];
  }
  function renderTabs() {
    $('#tabs').innerHTML = tabsForRole(state.me.role).map(([id, icon, label]) =>
      `<a href="#${id}" data-tab="${id}" class="tab-link"><i class="fa-solid ${icon}"></i><span>${label}</span></a>`).join('');
  }
  function route() {
    if (!state.me) return;
    const allowed = tabsForRole(state.me.role).map(t => t[0]);
    let tab = location.hash.replace('#', '') || allowed[0];
    if (!allowed.includes(tab)) tab = allowed[0];
    state.tab = tab;
    document.querySelectorAll('#tabs .tab-link').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
    if (tab === 'lessons') renderLessonsView();
    else if (tab === 'records') renderRecordsView();
    else if (tab === 'worksheets') window.Worksheets.renderView();
    else if (tab === 'accounts') renderAccountsView();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  const loading = () => `<div class="py-16 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>`;
  const emptyBox = (icon, title, sub = '') => `
    <div class="py-14 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center text-2xl mb-3"><i class="fa-solid ${icon}"></i></div>
      <p class="font-bold text-slate-700">${title}</p>${sub ? `<p class="text-sm text-slate-500 mt-1">${sub}</p>` : ''}
    </div>`;

  // =========================================================
  //  LESSONS
  // =========================================================
  async function loadLessons() {
    const vg = viewGrades();
    let q = sb.from('lessons').select('*').order('created_at', { ascending: false });
    if (vg) q = q.in('grade', vg.length ? vg : ['-']);          // only the grades this person may see
    const recQ = state.me.role === 'student' ? sb.from('lesson_records').select('*').eq('student_id', state.me.id) : null;
    const [{ data, error }, recs] = await Promise.all([q, recQ]);  // both requests at the same time
    if (error) throw error;
    state.lessons = data || [];
    if (recQ) state.myRecords = Object.fromEntries(((recs && recs.data) || []).map(r => [r.lesson_id, r]));
  }

  async function renderLessonsView() {
    const v = $('#view');
    v.innerHTML = loading();
    // worksheet counts are fetched in parallel with the lessons
    const vg0 = viewGrades();
    let wq = sb.from('worksheets').select('id,lesson_id,grade'); if (vg0) wq = wq.in('grade', vg0.length ? vg0 : ['-']);
    const wsCountP = wq.then(r => r, () => ({ data: [] }));
    try { await loadLessons(); } catch (e) { v.innerHTML = emptyBox('fa-wifi', 'មិនអាចទាញយកមេរៀនបាន', esc(errMsg(e))); return; }
    const me = state.me;
    if (me.role === 'parent' && !state.filter.grade && state.children[0]) state.filter.grade = state.children[0].grade || '';
    fixGradeFilter(state.filter);

    const gradeLocked = me.role === 'student';
    const hello = 'សួស្តី ' + esc(me.full_name) + ' 👋';
    const sub = me.role === 'student' ? 'តោះ! ចាប់ផ្តើមរៀនមេរៀនថ្ងៃនេះ' : me.role === 'parent' ? 'តាមដានមេរៀនរបស់កូនៗ' : 'គ្រប់គ្រងមេរៀន និងកិច្ចការរបស់សាលា';
    v.innerHTML = `
      <section class="hero mb-5">
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div class="min-w-0">
            <p class="text-blue-200 text-xs sm:text-sm"><i class="fa-regular fa-calendar mr-1.5"></i>${todayKm()}</p>
            <h1 class="text-2xl sm:text-3xl font-bold mt-1.5 leading-snug">${hello}</h1>
            <p class="text-blue-100/90 text-sm mt-1">${sub}${me.role === 'student' && me.grade ? ' • ' + esc(me.grade) : ''}</p>
            ${isStaff() ? `<button type="button" id="newLessonBtn" class="hero-btn mt-4"><i class="fa-solid fa-plus"></i> បង្កើតមេរៀនថ្មី</button>` : ''}
          </div>
          <div id="heroStats" class="grid grid-cols-3 gap-2.5 sm:gap-3 lg:w-[460px] flex-shrink-0"></div>
        </div>
      </section>

      <div class="bg-white rounded-2xl border border-slate-200 p-2.5 mb-3 flex flex-col sm:flex-row gap-2 shadow-sm">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input id="fQ" type="search" value="${esc(state.filter.q)}" placeholder="ស្វែងរកមេរៀន..." class="field pl-10 border-transparent bg-slate-50 focus:bg-white">
        </div>
        ${gradeLocked ? '' : `<div class="relative sm:w-56"><i class="fa-solid fa-layer-group absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i><select id="fGrade" class="field pl-10 border-transparent bg-slate-50">${gradeOptions(state.filter.grade, viewGrades() ? { includeAll: viewGrades().length > 1, allLabel: viewAllLabel(), only: viewGrades() } : { includeAll: true })}</select></div>`}
      </div>
      <div id="subjectChips" class="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5"></div>
      <div id="lessonGrid"></div>`;

    $('#fQ').addEventListener('input', (e) => { state.filter.q = e.target.value; drawLessonGrid(); });
    if (!gradeLocked) $('#fGrade').addEventListener('change', (e) => { state.filter.grade = e.target.value; drawSubjectChips(); drawLessonGrid(); });
    if ($('#newLessonBtn')) $('#newLessonBtn').addEventListener('click', () => openLessonForm());
    drawSubjectChips();
    drawLessonGrid();
    // worksheet counts (for the banner and the cards) — loaded after first paint
    wsCountP.then(({ data }) => {
      state.wsList = data || [];
      state.wsByLesson = {};
      for (const w of state.wsList) if (w.lesson_id) state.wsByLesson[w.lesson_id] = (state.wsByLesson[w.lesson_id] || 0) + 1;
      if ($('#lessonGrid')) { drawHeroStats(); drawLessonGrid(); }
    });
  }

  function drawSubjectChips() {
    const base = lessonsForGrade();
    const cnt = (id) => id ? base.filter(l => l.subject === id).length : base.length;
    const chips = [{ id: '', name: 'ទាំងអស់', icon: 'fa-border-all' }, ...CFG.SUBJECTS].filter(s => !s.id || cnt(s.id) || state.filter.subject === s.id);
    $('#subjectChips').innerHTML = chips.map(s => `
      <button type="button" data-subject="${s.id}" class="chip ${state.filter.subject === s.id ? 'chip-active' : ''}">
        <i class="fa-solid ${s.icon}"></i> ${esc(s.name)} <span class="chip-n">${kmNum(cnt(s.id))}</span>
      </button>`).join('');
    drawHeroStats();
    $('#subjectChips').onclick = (e) => {
      const b = e.target.closest('[data-subject]'); if (!b) return;
      state.filter.subject = b.dataset.subject; drawSubjectChips(); drawLessonGrid();
    };
  }

  const lessonsForGrade = () => state.lessons.filter(l => !state.filter.grade || l.grade === state.filter.grade);
  function filteredLessons() {
    const { subject, q } = state.filter;
    const qq = q.trim().toLowerCase();
    const order = Object.fromEntries(CFG.SUBJECTS.map((x, i) => [x.id, i]));
    const gi = (g) => { const i = ALL_GRADES.indexOf(g); return i < 0 ? 999 : i; };
    return lessonsForGrade().filter(l =>
      (!subject || l.subject === subject) &&
      (!qq || (l.title + ' ' + l.description + ' ' + l.teacher_name).toLowerCase().includes(qq)))
      .sort((a, b) => (order[a.subject] ?? 99) - (order[b.subject] ?? 99) || gi(a.grade) - gi(b.grade) ||
        (splitTitle(a.title).no ?? 1e9) - (splitTitle(b.title).no ?? 1e9) || String(b.created_at).localeCompare(String(a.created_at)));
  }
  function drawHeroStats() {
    const box = $('#heroStats'); if (!box) return;
    const base = lessonsForGrade(), me = state.me;
    const tile = (icon, n, label) => `<div class="hero-stat"><i class="fa-solid ${icon}"></i><b>${kmNum(n)}</b><span>${label}</span></div>`;
    const ws = state.wsList ? state.wsList.filter(w => !state.filter.grade || w.grade === state.filter.grade).length : '…';
    if (me.role === 'student') {
      const done = base.filter(l => state.myRecords[l.id] && state.myRecords[l.id].completed_at).length;
      box.innerHTML = tile('fa-book-open', base.length, 'មេរៀន') + tile('fa-circle-check', done, 'រៀនរួច') + tile('fa-pen-to-square', ws, 'កិច្ចការ');
    } else {
      const subj = new Set(base.map(l => l.subject)).size;
      box.innerHTML = tile('fa-book-open', base.length, 'មេរៀន') + tile('fa-pen-to-square', ws, 'កិច្ចការ') + tile('fa-shapes', subj, 'មុខវិជ្ជា');
    }
  }

  function canEdit(l) { return l.created_by === state.me.id || canManageGrade(l.grade); }

  function drawLessonGrid() {
    const list = filteredLessons();
    const grid = $('#lessonGrid');
    if (!list.length) {
      grid.innerHTML = emptyBox('fa-folder-open', 'មិនទាន់មានមេរៀន', isStaff() ? 'ចុច «បង្កើតមេរៀនថ្មី» ដើម្បីដាក់មេរៀនដំបូង' : 'គ្រូនឹងដាក់មេរៀនឆាប់ៗនេះ');
      return;
    }
    const card = (l) => {
      const s = subjectOf(l.subject), t = splitTitle(l.title);
      const rec = state.myRecords[l.id];
      const files = (l.attachments || []).length;
      const ytId = youtubeId(l.youtube_url);
      const nWs = (state.wsByLesson || {})[l.id] || 0;
      const who = (l.teacher_name || '—').trim();
      return `
      <article class="lesson-card group" data-open="${l.id}" tabindex="0" role="button" aria-label="${esc(l.title)}">
        <div class="relative h-28 bg-gradient-to-br ${SUBJECT_GRAD[s.color]} overflow-hidden">
          ${ytId ? `<img src="https://i.ytimg.com/vi/${ytId}/mqdefault.jpg" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition duration-300">` : ''}
          <span class="card-dots"></span>
          <i class="fa-solid ${s.icon} absolute right-3 -bottom-3 text-[72px] text-white/20 group-hover:rotate-[-8deg] transition duration-300"></i>
          <div class="absolute left-4 top-3.5 right-4 flex items-start justify-between gap-2">
            <span class="card-no">${t.label ? esc(t.label) : '<i class="fa-solid ' + s.icon + '"></i>'}</span>
            ${rec && rec.completed_at ? '<span class="card-done"><i class="fa-solid fa-check"></i> រៀនរួច</span>' : ''}
          </div>
          ${ytId ? '<span class="absolute left-4 bottom-3 card-yt"><i class="fa-solid fa-play"></i> វីដេអូ</span>' : ''}
        </div>
        <div class="p-4 flex flex-col gap-2.5 flex-1">
          <h3 class="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 min-h-[2.6em]">${esc(t.rest)}</h3>
          <div class="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span class="badge ${SUBJECT_COLORS[s.color]}">${esc(s.name)}</span>
            <span class="badge bg-slate-100 text-slate-600">${esc(l.grade)}</span>
            ${files ? `<span class="badge bg-amber-50 text-amber-700"><i class="fa-solid fa-paperclip"></i> ${files}</span>` : ''}
            ${nWs ? `<span class="badge bg-emerald-50 text-emerald-700"><i class="fa-solid fa-pen-to-square"></i> កិច្ចការ ${nWs}</span>` : ''}
          </div>
          <div class="mt-auto pt-3 flex items-center gap-2 border-t border-slate-100">
            <span class="w-7 h-7 rounded-full ${SUBJECT_DOT[s.color]} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">${esc(who.replace(/^(អ្នកគ្រូ|លោកគ្រូ|អ្នក)\s*/, '').charAt(0) || '?')}</span>
            <span class="text-xs text-slate-500 truncate flex-1">${esc(who)}</span>
            ${canEdit(l) ? `<span class="flex gap-1 flex-shrink-0">
              <button type="button" data-edit="${l.id}" class="icon-btn" title="កែ" aria-label="កែ"><i class="fa-solid fa-pen"></i></button>
              <button type="button" data-del="${l.id}" class="icon-btn hover:!bg-red-50 hover:!text-red-600" title="លុប" aria-label="លុប"><i class="fa-solid fa-trash"></i></button>
            </span>` : '<i class="fa-solid fa-arrow-right text-slate-300 group-hover:text-blue-700 group-hover:translate-x-0.5 transition"></i>'}
          </div>
        </div>
      </article>`;
    };
    const gridCls = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    if (state.filter.subject) { grid.innerHTML = `<div class="${gridCls}">${list.map(card).join('')}</div>`; }
    else {
      const groups = [];
      for (const l of list) { const g = groups.find(x => x.id === l.subject); if (g) g.items.push(l); else groups.push({ id: l.subject, items: [l] }); }
      grid.innerHTML = groups.map(g => { const s = subjectOf(g.id); return `
        <section class="mb-7">
          <div class="flex items-center gap-2.5 mb-3">
            <span class="w-8 h-8 rounded-lg ${SUBJECT_DOT[s.color]} text-white flex items-center justify-center text-sm"><i class="fa-solid ${s.icon}"></i></span>
            <h2 class="font-bold text-slate-800 text-lg">${esc(s.name)}</h2>
            <span class="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">${kmNum(g.items.length)} មេរៀន</span>
            <span class="flex-1 h-px bg-slate-200 ml-1"></span>
          </div>
          <div class="${gridCls}">${g.items.map(card).join('')}</div>
        </section>`; }).join('');
    }

    grid.onclick = (e) => {
      const ed = e.target.closest('[data-edit]'); if (ed) { e.stopPropagation(); return openLessonForm(state.lessons.find(x => x.id === ed.dataset.edit)); }
      const de = e.target.closest('[data-del]'); if (de) { e.stopPropagation(); return deleteLesson(de.dataset.del); }
      const op = e.target.closest('[data-open]'); if (op) openLesson(op.dataset.open);
    };
    grid.onkeydown = (e) => { const op = e.target.closest('[data-open]'); if (op && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLesson(op.dataset.open); } };
  }

  // ---------- Lesson viewer + study tracking ----------
  function openLesson(id) {
    const l = state.lessons.find(x => x.id === id); if (!l) return;
    const s = subjectOf(l.subject);
    const ytId = youtubeId(l.youtube_url);
    const isStudent = state.me.role === 'student';
    const rec = state.myRecords[l.id];
    const files = l.attachments || [];

    openModal(modalHeader(esc(l.title)) + `
      <div class="p-4 sm:p-6 space-y-5">
        <div class="flex items-center gap-1.5 flex-wrap text-xs">
          <span class="badge ${SUBJECT_COLORS[s.color]}"><i class="fa-solid ${s.icon}"></i> ${esc(s.name)}</span>
          <span class="badge bg-slate-100 text-slate-600">${esc(l.grade)}</span>
          <span class="text-slate-500 ml-1"><i class="fa-solid fa-user-pen"></i> ${esc(l.teacher_name || '—')} • ${fmtDate(l.created_at)}</span>
        </div>

        ${ytId ? `<div class="aspect-video rounded-xl overflow-hidden bg-black shadow">
            <iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0" title="${esc(l.title)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>` : ''}

        ${l.description ? `<div class="text-[15px] leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">${linkify(l.description)}</div>` : ''}

        ${files.length ? `<div>
            <h4 class="font-bold text-slate-800 mb-2 text-sm"><i class="fa-solid fa-paperclip mr-1"></i> ឯកសារមេរៀន</h4>
            <div class="space-y-2">${files.map((f, i) => {
              const d = driveLinks(f.url) || {};
              return `<div class="border border-slate-200 rounded-xl">
                <div class="flex items-center gap-3 p-3">
                  <i class="fa-solid ${fileIcon(f.name, d.kind)} text-2xl flex-shrink-0"></i>
                  <p class="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">${esc(f.name || 'ឯកសារ')}</p>
                  <div class="flex gap-1.5 flex-shrink-0">
                    ${d.preview ? `<button type="button" data-preview="${i}" class="btn-ghost-sm"><i class="fa-solid fa-eye"></i><span class="hidden sm:inline"> មើល</span></button>` : ''}
                    ${d.download ? `<a href="${esc(d.download)}" target="_blank" rel="noopener" class="btn-ghost-sm text-emerald-700"><i class="fa-solid fa-download"></i><span class="hidden sm:inline"> ទាញយក</span></a>` : ''}
                    ${d.downloadPdf ? `<a href="${esc(d.downloadPdf)}" target="_blank" rel="noopener" class="btn-ghost-sm text-red-600" title="ទាញយកជា PDF"><i class="fa-solid fa-file-pdf"></i><span class="hidden sm:inline"> PDF</span></a>` : ''}
                    ${!d.preview && d.view ? `<a href="${esc(d.view)}" target="_blank" rel="noopener" class="btn-ghost-sm"><i class="fa-solid fa-up-right-from-square"></i> បើក</a>` : ''}
                  </div>
                </div>
                <div id="pv${i}" class="hidden px-3 pb-3"></div>
              </div>`;
            }).join('')}</div>
          </div>` : ''}

        <div id="lessonWorksheets"></div>

        ${!ytId && !l.description && !files.length ? emptyBox('fa-hourglass-half', 'មេរៀននេះមិនទាន់មានខ្លឹមសារ') : ''}

        ${isStudent ? `<div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p class="text-sm text-emerald-900"><i class="fa-regular fa-clock mr-1"></i> រយៈពេលរៀន៖ <strong id="studyTime">${fmtDuration(rec ? rec.seconds_spent : 0)}</strong></p>
            <button type="button" id="completeBtn" class="${rec && rec.completed_at ? 'btn-ghost text-emerald-700 pointer-events-none' : 'btn-green'}">
              ${rec && rec.completed_at ? '<i class="fa-solid fa-circle-check"></i> បានរៀនរួចហើយ' : '<i class="fa-solid fa-check"></i> ខ្ញុំរៀនរួចហើយ'}
            </button>
          </div>` : ''}
      </div>`, { wide: true, onClose: isStudent ? () => stopTracking() : null });

    $('#modalBox').querySelectorAll('[data-preview]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.preview, box = $('#pv' + i), d = driveLinks(files[i].url);
      if (box.classList.toggle('hidden')) { box.innerHTML = ''; return; }
      box.innerHTML = `<iframe src="${esc(d.preview)}" class="w-full h-[70vh] rounded-lg border border-slate-200" allow="autoplay" loading="lazy"></iframe>`;
    }));
    if (isStudent) startTracking(l.id);
    window.Worksheets.injectLessonSection(l.id, $('#lessonWorksheets'));
  }

  // ពេលសិស្សបើកមេរៀន ប្រព័ន្ធកត់ត្រា៖ ការបើក, រយៈពេលរៀន (រាប់តែពេលកំពុងមើលទំព័រ), និងការរៀនចប់
  const tracker = { lessonId: null, pending: 0, total: 0, tick: null };
  function startTracking(lessonId) {
    stopTracking();
    tracker.lessonId = lessonId;
    tracker.pending = 0;
    tracker.total = (state.myRecords[lessonId] || {}).seconds_spent || 0;
    sendActivity(lessonId, 0, false, true);
    tracker.tick = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      tracker.pending += 1; tracker.total += 1;
      const el = $('#studyTime'); if (el && tracker.total % 5 === 0) el.textContent = fmtDuration(tracker.total);
      if (tracker.pending >= 30) flushTracking();
    }, 1000);
    const btn = $('#completeBtn');
    if (btn) btn.addEventListener('click', async () => {
      btn.disabled = true;
      const sec = tracker.pending; tracker.pending = 0;
      const ok = await sendActivity(lessonId, sec, true, false);
      if (ok) {
        btn.className = 'btn-ghost text-emerald-700 pointer-events-none';
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> បានរៀនរួចហើយ';
        toast('អស្ចារ្យណាស់! 🎉 បានកត់ត្រាថាអ្នករៀនមេរៀននេះរួច');
        drawLessonGridIfVisible();
      } else btn.disabled = false;
    });
  }
  function flushTracking() {
    if (!tracker.lessonId || tracker.pending <= 0) return;
    const sec = tracker.pending; tracker.pending = 0;
    sendActivity(tracker.lessonId, sec, false, false);
  }
  function stopTracking() {
    if (tracker.tick) clearInterval(tracker.tick);
    flushTracking();
    tracker.tick = null; tracker.lessonId = null;
  }
  async function sendActivity(lessonId, seconds, complete, newOpen) {
    const { error } = await sb.rpc('record_lesson_activity', { p_lesson: lessonId, p_seconds: seconds, p_complete: complete, p_new_open: newOpen });
    if (error) { toast(errMsg(error), 'error'); return false; }
    const r = state.myRecords[lessonId] || { lesson_id: lessonId, seconds_spent: 0, open_count: 0 };
    r.seconds_spent = (r.seconds_spent || 0) + seconds;
    if (newOpen) r.open_count = (r.open_count || 0) + 1;
    if (complete && !r.completed_at) r.completed_at = new Date().toISOString();
    r.last_opened_at = new Date().toISOString();
    state.myRecords[lessonId] = r;
    return true;
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushTracking(); });
  window.addEventListener('pagehide', flushTracking);
  function drawLessonGridIfVisible() { if (state.tab === 'lessons' && $('#lessonGrid')) drawLessonGrid(); }

  // ---------- Lesson form (teacher/admin) ----------
  function attachmentRow(a = {}) {
    return `<div class="att-row grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-start">
      <input class="field" name="attName" placeholder="ឈ្មោះឯកសារ ឧ. សន្លឹកកិច្ចការ.pdf" value="${esc(a.name || '')}">
      <input class="field" name="attUrl" type="url" placeholder="Link Google Drive (PDF / Word)" value="${esc(a.url || '')}">
      <button type="button" class="btn-ghost-sm text-red-600 justify-self-end" data-remove-att aria-label="លុប"><i class="fa-solid fa-trash"></i></button>
    </div>`;
  }
  function openLessonForm(lesson = null) {
    const l = lesson || { grade: state.filter.grade || '', subject: state.filter.subject || 'khmer', attachments: [] };
    openModal(modalHeader(lesson ? 'កែមេរៀន' : 'បង្កើតមេរៀនថ្មី', 'fa-book-medical') + `
      <form id="lessonForm" class="p-5 space-y-4">
        <label class="block"><span class="label">ចំណងជើងមេរៀន *</span>
          <input name="title" required maxlength="200" class="field mt-1" value="${esc(l.title || '')}" placeholder="ឧ. ព្យញ្ជនៈ ក ខ គ ឃ ង"></label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block"><span class="label">មុខវិជ្ជា *</span>
            <select name="subject" class="field mt-1">${CFG.SUBJECTS.map(s => `<option value="${s.id}" ${s.id === l.subject ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
          <label class="block"><span class="label">ថ្នាក់ *</span>
            <select name="grade" required class="field mt-1"><option value="">— ជ្រើសថ្នាក់ —</option>${gradeOptions(l.grade, { only: myGrades() })}</select></label>
        </div>
        <label class="block"><span class="label"><i class="fa-brands fa-youtube text-red-600"></i> Link វីដេអូ YouTube</span>
          <input name="youtube" class="field mt-1" value="${esc(l.youtube_url || '')}" placeholder="https://www.youtube.com/watch?v=...">
          <span id="ytHint" class="block text-[11px] mt-1 text-slate-400">បិទភ្ជាប់ Link ពី YouTube (Share → Copy link)</span></label>
        <label class="block"><span class="label">ខ្លឹមសារ / ការណែនាំ</span>
          <textarea name="description" rows="5" class="field mt-1" placeholder="សរសេរការពន្យល់ ឬកិច្ចការឱ្យសិស្ស...">${esc(l.description || '')}</textarea></label>
        <div>
          <span class="label"><i class="fa-brands fa-google-drive text-emerald-600"></i> ឯកសារពី Google Drive (PDF / Word)</span>
          <div id="attList" class="space-y-2 mt-1">${(l.attachments.length ? l.attachments : [{}]).map(attachmentRow).join('')}</div>
          <button type="button" id="addAtt" class="btn-ghost-sm mt-2"><i class="fa-solid fa-plus"></i> បន្ថែមឯកសារ</button>
          <p class="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2"><i class="fa-solid fa-circle-info"></i>
            នៅ Google Drive ចុច <b>Share</b> → <b>General access</b> → <b>Anyone with the link</b> ដើម្បីឱ្យសិស្សមើល និងទាញយកបាន។</p>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" data-close class="btn-ghost">បោះបង់</button>
          <button class="btn-primary"><i class="fa-solid fa-floppy-disk"></i> ${lesson ? 'រក្សាទុក' : 'ដាក់មេរៀន'}</button>
        </div>
      </form>`);
    const f = $('#lessonForm');
    const ytCheck = () => {
      const v = f.youtube.value.trim(), h = $('#ytHint');
      if (!v) { h.className = 'block text-[11px] mt-1 text-slate-400'; h.textContent = 'បិទភ្ជាប់ Link ពី YouTube (Share → Copy link)'; return; }
      const ok = !!youtubeId(v);
      h.className = 'block text-[11px] mt-1 ' + (ok ? 'text-emerald-600' : 'text-red-600');
      h.textContent = ok ? '✓ Link YouTube ត្រឹមត្រូវ' : '✗ Link នេះមិនមែនជាវីដេអូ YouTube';
    };
    f.youtube.addEventListener('input', ytCheck); ytCheck();
    $('#addAtt').addEventListener('click', () => $('#attList').insertAdjacentHTML('beforeend', attachmentRow()));
    $('#attList').addEventListener('click', (e) => { const b = e.target.closest('[data-remove-att]'); if (b) b.closest('.att-row').remove(); });

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const yt = f.youtube.value.trim();
      if (yt && !youtubeId(yt)) return toast('Link YouTube មិនត្រឹមត្រូវ', 'error');
      const attachments = [];
      for (const row of f.querySelectorAll('.att-row')) {
        const name = row.querySelector('[name=attName]').value.trim(), url = row.querySelector('[name=attUrl]').value.trim();
        if (!url && !name) continue;
        if (!url) return toast('សូមបញ្ចូល Link សម្រាប់ឯកសារ «' + name + '»', 'error');
        if (!driveLinks(url)) return toast('Link ឯកសារមិនត្រឹមត្រូវ', 'error');
        attachments.push({ name: name || 'ឯកសារ', url });
      }
      const payload = {
        title: f.title.value.trim(), subject: f.subject.value, grade: f.grade.value,
        description: f.description.value.trim(), youtube_url: yt, attachments
      };
      const btn = f.querySelector('button:not([type])'); btn.disabled = true;
      let res;
      if (lesson) res = await sb.from('lessons').update(payload).eq('id', lesson.id);
      else res = await sb.from('lessons').insert({ ...payload, created_by: state.me.id, teacher_name: state.me.full_name });
      btn.disabled = false;
      if (res.error) return toast(errMsg(res.error), 'error');
      closeModal();
      toast(lesson ? 'បានកែមេរៀនរួចរាល់' : 'បានដាក់មេរៀនថ្មីរួចរាល់ — សិស្សអាចមើលបានភ្លាមៗ');
      state.filter.grade = payload.grade;
      renderLessonsView();
    });
  }

  async function deleteLesson(id) {
    const l = state.lessons.find(x => x.id === id); if (!l) return;
    openModal(modalHeader('លុបមេរៀន?', 'fa-trash') + `
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600">តើអ្នកពិតជាចង់លុបមេរៀន <b>«${esc(l.title)}»</b> មែនទេ? កំណត់ត្រារៀនរបស់សិស្សសម្រាប់មេរៀននេះក៏នឹងត្រូវលុបដែរ។</p>
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button>
          <button type="button" id="confirmDel" class="btn-red">លុប</button></div>
      </div>`);
    $('#confirmDel').addEventListener('click', async () => {
      const { error } = await sb.from('lessons').delete().eq('id', id);
      if (error) return toast(errMsg(error), 'error');
      closeModal(); toast('បានលុបមេរៀន'); renderLessonsView();
    });
  }

  // =========================================================
  //  RECORDS (កំណត់ត្រាសិស្ស)
  // =========================================================
  async function fetchRecordsFor(studentIds) {
    if (!studentIds.length) return [];
    const { data, error } = await sb.from('lesson_records').select('*').in('student_id', studentIds).order('last_opened_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  function studentReportHtml(student, records, lessons, subs) {
    const gradeLessons = lessons.filter(l => l.grade === student.grade);
    const byLesson = Object.fromEntries(records.map(r => [r.lesson_id, r]));
    const done = records.filter(r => r.completed_at).length;
    const totalSec = records.reduce((a, r) => a + r.seconds_spent, 0);
    const pct = gradeLessons.length ? Math.round(gradeLessons.filter(l => byLesson[l.id] && byLesson[l.id].completed_at).length / gradeLessons.length * 100) : 0;
    const last = records[0] ? records[0].last_opened_at : null;
    // lessons in grade + any other lesson the student opened
    const shown = [...gradeLessons, ...lessons.filter(l => l.grade !== student.grade && byLesson[l.id])];

    return `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        ${statCard('fa-circle-check', 'text-emerald-600 bg-emerald-50', done, 'មេរៀនរៀនរួច')}
        ${statCard('fa-percent', 'text-blue-900 bg-blue-50', pct + '%', 'វឌ្ឍនភាពថ្នាក់')}
        ${statCard('fa-clock', 'text-amber-600 bg-amber-50', fmtDuration(totalSec), 'រយៈពេលរៀនសរុប')}
        ${statCard('fa-calendar-day', 'text-purple-700 bg-purple-50', last ? fmtDate(last) : '—', 'ចូលរៀនចុងក្រោយ')}
      </div>
      ${shown.length ? `<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto"><table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-500 text-left"><tr>
            <th class="p-3">មេរៀន</th><th class="p-3 whitespace-nowrap">ស្ថានភាព</th><th class="p-3 whitespace-nowrap">រយៈពេល</th>
            <th class="p-3 whitespace-nowrap hidden sm:table-cell">បើកមើល</th><th class="p-3 whitespace-nowrap hidden sm:table-cell">ចុងក្រោយ</th></tr></thead>
          <tbody class="divide-y divide-slate-100">${shown.map(l => {
            const r = byLesson[l.id]; const s = subjectOf(l.subject);
            const status = !r ? '<span class="badge bg-slate-100 text-slate-500">មិនទាន់រៀន</span>'
              : r.completed_at ? `<span class="badge bg-emerald-50 text-emerald-700"><i class="fa-solid fa-check"></i> រៀនរួច</span>`
              : '<span class="badge bg-amber-50 text-amber-700">កំពុងរៀន</span>';
            return `<tr>
              <td class="p-3"><p class="font-semibold text-slate-800">${esc(l.title)}</p><p class="text-xs text-slate-400">${esc(s.name)} • ${esc(l.grade)}</p></td>
              <td class="p-3">${status}</td>
              <td class="p-3 whitespace-nowrap">${r ? fmtDuration(r.seconds_spent) : '—'}</td>
              <td class="p-3 hidden sm:table-cell">${r ? r.open_count + ' ដង' : '—'}</td>
              <td class="p-3 whitespace-nowrap hidden sm:table-cell text-slate-500">${r ? fmtDateTime(r.last_opened_at) : '—'}</td></tr>`;
          }).join('')}</tbody></table></div></div>` : emptyBox('fa-book', 'មិនទាន់មានមេរៀនសម្រាប់ថ្នាក់នេះ')}
      ${subs ? window.Worksheets.reportHtml(student, subs) : ''}`;
  }
  const statCard = (icon, cls, value, label) => `
    <div class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
      <span class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls}"><i class="fa-solid ${icon}"></i></span>
      <div class="min-w-0"><p class="font-bold text-slate-900 text-lg leading-tight truncate">${value}</p><p class="text-xs text-slate-500">${label}</p></div>
    </div>`;

  async function renderRecordsView() {
    const v = $('#view'); v.innerHTML = loading();
    const me = state.me;
    try {
      const recsPromise = me.role === 'parent' ? fetchRecordsFor(state.children.map(c => c.id)) : me.role === 'student' ? fetchRecordsFor([me.id]) : null;
      const kidIds = me.role === 'parent' ? state.children.map(c => c.id) : me.role === 'student' ? [me.id] : null;
      const subsPromise = kidIds ? window.Worksheets.fetchSubmissions(kidIds) : null;
      if (!state.lessons.length) await loadLessons();
      if (me.role === 'student') {
        const recs = await recsPromise;
        v.innerHTML = `<h1 class="text-xl sm:text-2xl font-bold text-blue-950 mb-1">កំណត់ត្រារៀនរបស់ខ្ញុំ</h1>
          <p class="text-sm text-slate-500 mb-5">${esc(me.full_name)} • ${esc(me.grade || '')}</p>` + studentReportHtml(me, recs, state.lessons, await subsPromise);
        return;
      }
      if (me.role === 'parent') {
        if (!state.children.length) { v.innerHTML = emptyBox('fa-child', 'មិនទាន់បានភ្ជាប់គណនីកូន', 'សូមទាក់ទងគ្រូ ឬ Admin ដើម្បីភ្ជាប់គណនីកូនរបស់អ្នក'); return; }
        const recs = await recsPromise;
        const subs = await subsPromise;
        v.innerHTML = `<h1 class="text-xl sm:text-2xl font-bold text-blue-950 mb-5">ការរៀនរបស់កូន</h1>` +
          state.children.map(c => `<section class="mb-8">
            <div class="flex items-center gap-3 mb-3"><span class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><i class="fa-solid fa-user-graduate"></i></span>
              <div><p class="font-bold text-slate-900">${esc(c.full_name)}</p><p class="text-xs text-slate-500">${esc(c.grade || '')}</p></div></div>
            ${studentReportHtml(c, recs.filter(r => r.student_id === c.id), state.lessons, subs.filter(x => x.student_id === c.id))}</section>`).join('');
        return;
      }
      // staff: summary per student
      let { data: students, error } = await sb.from('profiles').select('*').eq('role', 'student').order('full_name');
      if (error) throw error;
      if (me.role === 'teacher' && myGrades()) students = (students || []).filter(s => myGrades().includes(s.grade));
      // (lessons were loaded above)
      const [recs, allSubs] = await Promise.all([fetchRecordsFor((students || []).map(s => s.id)), window.Worksheets.fetchSubmissions((students || []).map(s => s.id))]);
      const gradeSel = state.recGrade || '';
      v.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div><h1 class="text-xl sm:text-2xl font-bold text-blue-950">កំណត់ត្រាសិស្ស</h1>
            <p class="text-sm text-slate-500">តាមដានការចូលរៀន រយៈពេល និងមេរៀនដែលរៀនរួច</p></div>
          <div class="flex gap-2">
            <select id="recGrade" class="field sm:w-52">${gradeOptions(gradeSel, { includeAll: true, allLabel: myGrades() ? (me.role === 'teacher' ? 'គ្រប់ថ្នាក់របស់ខ្ញុំ' : 'គ្រប់ថ្នាក់ក្នុងផ្នែក') : 'គ្រប់ថ្នាក់', only: myGrades() })}</select>
            <button type="button" id="csvBtn" class="btn-ghost whitespace-nowrap" title="ទាញយក Excel/CSV"><i class="fa-solid fa-file-excel text-emerald-700"></i> CSV</button>
          </div>
        </div>
        <div id="recTable"></div>`;
      const draw = () => {
        const g = state.recGrade || '';
        const list = (students || []).filter(s => !g || s.grade === g);
        if (!list.length) { $('#recTable').innerHTML = emptyBox('fa-user-graduate', 'មិនមានសិស្សក្នុងថ្នាក់នេះ', 'បង្កើតគណនីសិស្សនៅផ្ទាំង «គណនី»'); return; }
        const rows = list.map(s => {
          const rs = recs.filter(r => r.student_id === s.id);
          const gl = state.lessons.filter(l => l.grade === s.grade);
          const doneIn = gl.filter(l => rs.some(r => r.lesson_id === l.id && r.completed_at)).length;
          const best = window.Worksheets.bestBySheet(allSubs.filter(x => x.student_id === s.id));
          const wsAvg = best.length ? Math.round(best.reduce((a, b) => a + (b.total ? b.score / b.total : 0), 0) / best.length * 100) : null;
          return { s, rs, gl, doneIn, wsAvg, wsCount: best.length, sec: rs.reduce((a, r) => a + r.seconds_spent, 0), last: rs[0] ? rs[0].last_opened_at : null };
        });
        state._recRows = rows;
        $('#recTable').innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-500 text-left"><tr><th class="p-3">សិស្ស</th><th class="p-3">ថ្នាក់</th><th class="p-3 whitespace-nowrap">រៀនរួច</th>
            <th class="p-3 whitespace-nowrap">កិច្ចការ</th>
            <th class="p-3 whitespace-nowrap hidden sm:table-cell">រយៈពេល</th><th class="p-3 whitespace-nowrap hidden md:table-cell">ចុងក្រោយ</th><th class="p-3"></th></tr></thead>
          <tbody class="divide-y divide-slate-100">${rows.map(({ s, gl, doneIn, sec, last, wsAvg, wsCount }) => {
            const pct = gl.length ? Math.round(doneIn / gl.length * 100) : 0;
            return `<tr class="hover:bg-slate-50 cursor-pointer" data-student="${s.id}">
              <td class="p-3 font-semibold text-slate-800">${esc(s.full_name)}<span class="block text-xs font-normal text-slate-400">@${esc(s.username)}</span></td>
              <td class="p-3 whitespace-nowrap">${esc(s.grade || '—')}</td>
              <td class="p-3 min-w-[120px]"><div class="flex items-center gap-2"><div class="flex-1 h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-emerald-500" style="width:${pct}%"></div></div>
                <span class="text-xs text-slate-600 whitespace-nowrap">${doneIn}/${gl.length}</span></div></td>
              <td class="p-3 whitespace-nowrap">${wsAvg === null ? '<span class="text-slate-400">—</span>' : `<span class="font-semibold ${wsAvg >= 50 ? 'text-emerald-700' : 'text-red-600'}">${wsAvg}%</span> <span class="text-xs text-slate-400">(${wsCount})</span>`}</td>
              <td class="p-3 whitespace-nowrap hidden sm:table-cell">${fmtDuration(sec)}</td>
              <td class="p-3 whitespace-nowrap hidden md:table-cell text-slate-500">${last ? fmtDateTime(last) : 'មិនទាន់ចូល'}</td>
              <td class="p-3 text-right"><i class="fa-solid fa-chevron-right text-slate-300"></i></td></tr>`;
          }).join('')}</tbody></table></div></div>`;
      };
      draw();
      $('#recGrade').addEventListener('change', (e) => { state.recGrade = e.target.value; draw(); });
      $('#recTable').addEventListener('click', (e) => {
        const tr = e.target.closest('[data-student]'); if (!tr) return;
        const s = students.find(x => x.id === tr.dataset.student);
        openModal(modalHeader('កំណត់ត្រារៀន — ' + esc(s.full_name), 'fa-chart-simple') +
          `<div class="p-4 sm:p-6 bg-slate-50">${studentReportHtml(s, recs.filter(r => r.student_id === s.id), state.lessons, allSubs.filter(x => x.student_id === s.id))}</div>`, { wide: true });
      });
      $('#csvBtn').addEventListener('click', () => exportCsv(state._recRows || []));
    } catch (e) {
      v.innerHTML = emptyBox('fa-wifi', 'មិនអាចទាញយកទិន្នន័យបាន', esc(errMsg(e)));
    }
  }

  function exportCsv(rows) {
    const lines = [['ឈ្មោះសិស្ស', 'Username', 'ថ្នាក់', 'មេរៀនរៀនរួច', 'មេរៀនសរុបក្នុងថ្នាក់', 'កិច្ចការបានធ្វើ', 'ពិន្ទុកិច្ចការមធ្យម (%)', 'រយៈពេលរៀន (នាទី)', 'ចូលរៀនចុងក្រោយ']];
    rows.forEach(({ s, gl, doneIn, sec, last, wsAvg, wsCount }) => lines.push([s.full_name, s.username, s.grade || '', doneIn, gl.length, wsCount, wsAvg === null ? '' : wsAvg, Math.round(sec / 60), last ? new Date(last).toLocaleString() : '']));
    const csv = '﻿' + lines.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'kamnot-trea-sis-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // =========================================================
  //  ACCOUNTS (Admin: គ្រប់តួនាទី • Teacher: សិស្ស & មាតាបិតា)
  // =========================================================
  function canManage(p) {
    if (p.id === state.me.id) return false;
    if (p.is_owner) return false;
    if (state.me.role === 'admin') return ['admin', 'manager'].includes(p.role) ? !!state.me.is_owner : true;
    if (state.me.role === 'head') {
      if (p.role === 'teacher') return true;
      if (p.role === 'student') return myGrades().includes(p.grade);
      if (p.role === 'parent') return state.links.filter(l => l.parent_id === p.id).every(l => { const k = state.people.find(x => x.id === l.student_id); return k && myGrades().includes(k.grade); });
      return false;
    }
    return ['student', 'parent'].includes(p.role);
  }

  async function renderAccountsView() {
    const v = $('#view'); v.innerHTML = loading();
    const [{ data: people, error }, { data: links }] = await Promise.all([
      sb.from('profiles').select('*').order('role').order('full_name'),
      sb.from('parent_children').select('*')
    ]);
    if (error) { v.innerHTML = emptyBox('fa-wifi', 'មិនអាចទាញយកទិន្នន័យបាន', esc(errMsg(error))); return; }
    state.links = links || [];
    let all = (people || []).map(p => ({ ...p, role: effRole(p) }));
    // each role only sees the accounts it works with
    const g = myGrades();
    if (state.me.role !== 'admin') {
      const okStudent = (st) => !g || g.includes(st.grade);
      const visKids = new Set(all.filter(x => x.role === 'student' && okStudent(x)).map(x => x.id));
      all = all.filter(x => {
        if (x.id === state.me.id) return false;
        if (x.role === 'student') return okStudent(x);
        if (x.role === 'parent') { const ks = state.links.filter(l => l.parent_id === x.id); return !ks.length || ks.some(l => visKids.has(l.student_id)); }
        if (x.role === 'teacher') return state.me.role === 'head' && (!(x.teach_grades || []).length || x.teach_grades.some(t => g.includes(t)));
        return false;
      });
    }
    state.people = all;
    const roleFilter = state.accRole || '';
    const roleChoices = state.me.role === 'admin' ? ['student', 'parent', 'teacher', 'head', ...(state.me.is_owner ? ['manager'] : [])] : state.me.role === 'head' ? ['student', 'parent', 'teacher'] : ['student', 'parent'];

    v.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div><h1 class="text-xl sm:text-2xl font-bold text-blue-950">${state.me.role === 'admin' ? 'គណនីអ្នកប្រើ' : state.me.role === 'head' ? 'គណនីក្នុងផ្នែក' : 'គណនីសិស្ស & មាតាបិតា'}</h1>
          <p class="text-sm text-slate-500">បង្កើតគណនី ហើយផ្តល់ Username & ពាក្យសម្ងាត់ទៅសិស្ស ឬមាតាបិតា</p></div>
        <button type="button" id="newUserBtn" class="btn-red self-start sm:self-auto"><i class="fa-solid fa-user-plus"></i> បង្កើតគណនី</button>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar mb-4" id="roleChips">
        ${[['', 'ទាំងអស់'], ...Object.entries(ROLES).filter(([k]) => state.me.role === 'admin' || state.people.some(p => p.role === k)).map(([k, r]) => [k, r.label])].map(([k, label]) =>
          `<button type="button" data-role="${k}" class="chip ${roleFilter === k ? 'chip-active' : ''}">${label} <span class="opacity-60">${k ? state.people.filter(p => p.role === k).length : state.people.length}</span></button>`).join('')}
      </div>
      <div id="peopleList" class="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100"></div>`;

    const draw = () => {
      const list = state.people.filter(p => !state.accRole || p.role === state.accRole);
      $('#peopleList').innerHTML = list.length ? list.map(p => {
        const r = ROLES[p.role];
        const kids = p.role === 'parent' ? state.links.filter(l => l.parent_id === p.id).map(l => (state.people.find(x => x.id === l.student_id) || {}).full_name).filter(Boolean) : [];
        return `<div class="p-3 sm:p-4 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl ${r.bg} text-white flex items-center justify-center flex-shrink-0"><i class="fa-solid ${r.icon}"></i></span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-slate-800 truncate">${esc(p.full_name)} ${p.id === state.me.id ? '<span class="text-xs text-slate-400">(ខ្ញុំ)</span>' : ''}</p>
            <p class="text-xs text-slate-500 truncate">@${esc(p.username)} • ${r.label}${p.grade ? ' • ' + esc(p.grade) : ''}${p.phone ? ' • ' + esc(p.phone) : ''}</p>
            ${p.role === 'head' ? `<p class="text-xs mt-0.5 text-purple-700"><i class="fa-solid fa-layer-group"></i> ${esc((p.managed_grades || []).join(', '))}</p>` : ''}
            ${p.role === 'teacher' ? `<p class="text-xs mt-0.5 ${(p.teach_grades || []).length ? 'text-blue-800' : 'text-amber-600'}"><i class="fa-solid fa-chalkboard"></i> ${(p.teach_grades || []).length ? esc(p.teach_grades.join(', ')) : 'មិនទាន់ចាត់ថ្នាក់'}</p>` : ''}
            ${p.role === 'manager' ? `<p class="text-xs mt-0.5 text-rose-600"><i class="fa-solid fa-shield-halved"></i> សិទ្ធិគ្រប់យ៉ាង (ក្រោម Admin ប្រព័ន្ធ)</p>` : ''}
            ${p.role === 'parent' ? `<p class="text-xs mt-0.5 ${kids.length ? 'text-emerald-700' : 'text-amber-600'}"><i class="fa-solid fa-child"></i> ${kids.length ? esc(kids.join(', ')) : 'មិនទាន់ភ្ជាប់កូន'}</p>` : ''}
          </div>
          ${canManage(p) ? `<div class="flex gap-1 flex-shrink-0">
            ${p.role === 'parent' ? `<button type="button" data-kids="${p.id}" class="icon-btn text-emerald-700" title="ភ្ជាប់កូន"><i class="fa-solid fa-link"></i></button>` : ''}
            <button type="button" data-edit-user="${p.id}" class="icon-btn" title="កែព័ត៌មាន"><i class="fa-solid fa-pen"></i></button>
            <button type="button" data-pw="${p.id}" class="icon-btn" title="កំណត់ពាក្យសម្ងាត់ថ្មី"><i class="fa-solid fa-key"></i></button>
            <button type="button" data-del-user="${p.id}" class="icon-btn text-red-600" title="លុប"><i class="fa-solid fa-trash"></i></button>
          </div>` : ''}
        </div>`;
      }).join('') : emptyBox('fa-users', 'មិនទាន់មានគណនី');
    };
    draw();

    $('#roleChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-role]'); if (!b) return;
      state.accRole = b.dataset.role;
      document.querySelectorAll('#roleChips .chip').forEach(c => c.classList.toggle('chip-active', c === b));
      draw();
    });
    $('#newUserBtn').addEventListener('click', () => openUserForm(roleChoices));
    $('#peopleList').addEventListener('click', (e) => {
      const get = (attr) => { const b = e.target.closest(`[${attr}]`); return b ? state.people.find(p => p.id === b.getAttribute(attr)) : null; };
      let p;
      if ((p = get('data-edit-user'))) return openUserForm(roleChoices, p);
      if ((p = get('data-pw'))) return openResetPassword(p);
      if ((p = get('data-del-user'))) return openDeleteUser(p);
      if ((p = get('data-kids'))) return openLinkKids(p);
    });
  }

  function gradeChecks(name, checked, only, accent) {
    return CFG.GRADES.map(g => {
      const items = only ? g.items.filter(i => only.includes(i)) : g.items;
      if (!items.length) return '';
      return `<div><label class="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1"><input type="checkbox" data-group="${esc(name + ':' + g.group)}" class="w-4 h-4 ${accent}"> ${esc(g.group)}</label>
        <div class="flex flex-wrap gap-x-4 gap-y-1 pl-6">${items.map(i => `<label class="flex items-center gap-1.5 text-sm"><input type="checkbox" name="${name}" value="${esc(i)}" data-in="${esc(name + ':' + g.group)}" ${(checked || []).includes(i) ? 'checked' : ''} class="w-4 h-4 ${accent}"> ${esc(i)}</label>`).join('')}</div></div>`;
    }).join('');
  }
  function openUserForm(roleChoices, p = null) {
    const role = p ? p.role : (state.accRole && roleChoices.includes(state.accRole) ? state.accRole : 'student');
    openModal(modalHeader(p ? 'កែព័ត៌មានគណនី' : 'បង្កើតគណនីថ្មី', 'fa-user-plus') + `
      <form id="userForm" class="p-5 space-y-4">
        ${p ? '' : `<div><span class="label">តួនាទី *</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">${roleChoices.map(k => `
            <label class="role-opt"><input type="radio" name="role" value="${k}" ${k === role ? 'checked' : ''} class="sr-only peer">
              <span class="peer-checked:border-blue-900 peer-checked:bg-blue-50 peer-checked:text-blue-950"><i class="fa-solid ${ROLES[k].icon}"></i> ${ROLES[k].label}</span></label>`).join('')}</div></div>`}
        <label class="block"><span class="label">ឈ្មោះពេញ *</span>
          <input name="full_name" required class="field mt-1" value="${esc(p ? p.full_name : '')}" placeholder="ឧ. សុខ ពិសិដ្ឋ"></label>
        ${p ? '' : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block"><span class="label">Username * <span class="font-normal text-slate-400">(a-z, 0-9)</span></span>
            <input name="username" required pattern="[a-zA-Z0-9._\\-]{3,30}" autocapitalize="none" class="field mt-1" placeholder="ឧ. pisith01"></label>
          <label class="block"><span class="label">ពាក្យសម្ងាត់ * <span class="font-normal text-slate-400">(≥ ៦ តួ)</span></span>
            <input name="password" required minlength="6" class="field mt-1 font-mono" value="${genPassword()}"></label>
        </div>`}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block" id="gradeWrap"><span class="label">ថ្នាក់ (សម្រាប់សិស្ស)</span>
            <select name="grade" class="field mt-1"><option value="">—</option>${gradeOptions(p ? p.grade : (state.recGrade || ''), { only: myGrades() })}</select></label>
          <label class="block"><span class="label">លេខទូរស័ព្ទ</span>
            <input name="phone" type="tel" class="field mt-1" value="${esc(p ? p.phone || '' : '')}" placeholder="012 345 678"></label>
        </div>
        <div id="managedWrap" class="hidden">
          <span class="label">ថ្នាក់ដែលប្រធានផ្នែកគ្រប់គ្រង * <span class="font-normal text-slate-400">(ធីកច្រើនបាន)</span></span>
          <div class="mt-1 space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3">${gradeChecks('managed', p && p.managed_grades, null, 'accent-purple-700')}</div>
        </div>
        <div id="teachWrap" class="hidden">
          <span class="label">ថ្នាក់ដែលគ្រូបង្រៀន <span class="font-normal text-slate-400">(ធីកច្រើនបាន — គ្រូនឹងឃើញតែថ្នាក់ទាំងនេះពេលដាក់មេរៀន និងមើលកំណត់ត្រា)</span></span>
          <div class="mt-1 space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3">${gradeChecks('teach', p && p.teach_grades, myGrades(), 'accent-blue-800')}</div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" data-close class="btn-ghost">បោះបង់</button>
          <button class="btn-primary"><i class="fa-solid fa-floppy-disk"></i> ${p ? 'រក្សាទុក' : 'បង្កើតគណនី'}</button>
        </div>
      </form>`);
    const f = $('#userForm');
    const syncGrade = () => {
      const r = p ? p.role : (f.querySelector('[name=role]:checked') || {}).value;
      $('#gradeWrap').classList.toggle('hidden', r !== 'student');
      $('#managedWrap').classList.toggle('hidden', !(r === 'head' && state.me.role === 'admin'));
      $('#teachWrap').classList.toggle('hidden', !(r === 'teacher' && ['admin', 'head'].includes(state.me.role)));
    };
    f.addEventListener('change', (e) => {
      if (e.target.dataset.group) f.querySelectorAll(`[data-in="${CSS.escape(e.target.dataset.group)}"]`).forEach(c => { c.checked = e.target.checked; });
      syncGrade();
    });
    syncGrade();
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button:not([type])'); btn.disabled = true;
      const r = p ? p.role : f.querySelector('[name=role]:checked').value;
      const grade = r === 'student' ? f.grade.value : '';
      if (r === 'student' && !grade) { btn.disabled = false; return toast('សូមជ្រើសថ្នាក់សម្រាប់សិស្ស', 'error'); }
      const managed = r === 'head' ? [...f.querySelectorAll('[name=managed]:checked')].map(c => c.value) : null;
      if (r === 'head' && state.me.role === 'admin' && !managed.length) { btn.disabled = false; return toast('សូមធីកថ្នាក់យ៉ាងតិចមួយ ឱ្យប្រធានផ្នែក', 'error'); }
      const teach = r === 'teacher' && ['admin', 'head'].includes(state.me.role) ? [...f.querySelectorAll('[name=teach]:checked')].map(c => c.value) : null;
      let error;
      if (p) ({ error } = await sb.rpc('update_account', { p_user: p.id, p_full_name: f.full_name.value, p_grade: grade, p_phone: f.phone.value, p_managed: state.me.role === 'admin' ? managed : null, p_teach: teach }));
      else ({ error } = await sb.rpc('create_account', { p_username: f.username.value.trim().toLowerCase(), p_password: f.password.value, p_full_name: f.full_name.value, p_role: r, p_grade: grade, p_phone: f.phone.value, p_managed: managed, p_teach: teach }));
      btn.disabled = false;
      if (error) return toast(errMsg(error), 'error');
      if (p) { closeModal(); toast('បានរក្សាទុក'); renderAccountsView(); return; }
      showCredentials(f.full_name.value.trim(), f.username.value.trim().toLowerCase(), f.password.value, r);
      renderAccountsView();
    });
  }
  function genPassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    const a = new Uint32Array(6); crypto.getRandomValues(a);
    return Array.from(a, n => chars[n % chars.length]).join('');
  }
  function showCredentials(name, username, password, role) {
    const text = `${CFG.SCHOOL_NAME_KM}\nឈ្មោះ: ${name}\nUsername: ${username}\nពាក្យសម្ងាត់: ${password}\nចូលរៀនតាម: ${location.origin + location.pathname}`;
    openModal(modalHeader('បានបង្កើតគណនីរួចរាល់ ✓', 'fa-circle-check') + `
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600">សូមចម្លង ឬថតរូបព័ត៌មានខាងក្រោម ហើយផ្តល់ទៅ${role === 'parent' ? 'មាតាបិតា' : role === 'student' ? 'សិស្ស' : 'អ្នកប្រើ'}៖</p>
        <pre class="bg-slate-900 text-emerald-300 rounded-xl p-4 text-sm whitespace-pre-wrap font-mono">${esc(text)}</pre>
        ${role === 'parent' ? '<p class="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5"><i class="fa-solid fa-link"></i> កុំភ្លេចចុចប៊ូតុង «ភ្ជាប់កូន» ដើម្បីឱ្យមាតាបិតាមើលកំណត់ត្រារបស់កូនបាន។</p>' : ''}
        <div class="flex justify-end gap-2"><button type="button" id="copyCred" class="btn-ghost"><i class="fa-regular fa-copy"></i> ចម្លង</button><button type="button" data-close class="btn-primary">រួចរាល់</button></div>
      </div>`);
    $('#copyCred').addEventListener('click', async () => { try { await navigator.clipboard.writeText(text); toast('បានចម្លង'); } catch { toast('មិនអាចចម្លងបាន — សូមថតរូបអេក្រង់', 'error'); } });
  }
  function openResetPassword(p) {
    const pw = genPassword();
    openModal(modalHeader('កំណត់ពាក្យសម្ងាត់ថ្មី', 'fa-key') + `
      <form id="rpForm" class="p-5 space-y-4">
        <p class="text-sm text-slate-600">សម្រាប់ <b>${esc(p.full_name)}</b> (@${esc(p.username)})</p>
        <input name="pw" required minlength="6" class="field font-mono" value="${pw}">
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button><button class="btn-primary">រក្សាទុក</button></div>
      </form>`);
    $('#rpForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = e.target.pw.value;
      const { error } = await sb.rpc('admin_set_password', { p_user: p.id, p_password: val });
      if (error) return toast(errMsg(error), 'error');
      showCredentials(p.full_name, p.username, val, p.role);
    });
  }
  function openDeleteUser(p) {
    openModal(modalHeader('លុបគណនី?', 'fa-trash') + `
      <div class="p-5 space-y-4">
        <p class="text-sm text-slate-600">លុបគណនី <b>${esc(p.full_name)}</b> (@${esc(p.username)})? ${p.role === 'student' ? 'កំណត់ត្រារៀនទាំងអស់របស់សិស្សនេះនឹងត្រូវលុបដែរ។' : ''} មិនអាចត្រឡប់វិញបានទេ។</p>
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button><button type="button" id="cDelU" class="btn-red">លុប</button></div>
      </div>`);
    $('#cDelU').addEventListener('click', async () => {
      const { error } = await sb.rpc('admin_delete_user', { p_user: p.id });
      if (error) return toast(errMsg(error), 'error');
      closeModal(); toast('បានលុបគណនី'); renderAccountsView();
    });
  }
  function openLinkKids(parent) {
    const students = state.people.filter(x => x.role === 'student');
    const linked = new Set(state.links.filter(l => l.parent_id === parent.id).map(l => l.student_id));
    openModal(modalHeader('ភ្ជាប់កូន — ' + esc(parent.full_name), 'fa-link') + `
      <div class="p-5 space-y-3">
        <input id="kidSearch" type="search" class="field" placeholder="ស្វែងរកឈ្មោះសិស្ស...">
        <div id="kidList" class="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
          ${students.length ? students.map(s => `<label class="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer" data-name="${esc((s.full_name + ' ' + s.username).toLowerCase())}">
            <input type="checkbox" value="${s.id}" ${linked.has(s.id) ? 'checked' : ''} class="w-4 h-4 accent-blue-900">
            <span class="flex-1"><span class="font-semibold text-sm">${esc(s.full_name)}</span> <span class="text-xs text-slate-400">@${esc(s.username)} • ${esc(s.grade || '')}</span></span></label>`).join('')
            : '<p class="p-4 text-sm text-slate-500">មិនទាន់មានគណនីសិស្ស</p>'}
        </div>
        <div class="flex justify-end gap-2"><button type="button" data-close class="btn-ghost">បោះបង់</button><button type="button" id="saveKids" class="btn-primary">រក្សាទុក</button></div>
      </div>`);
    $('#kidSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#kidList [data-name]').forEach(el => el.classList.toggle('hidden', !el.dataset.name.includes(q)));
    });
    $('#saveKids').addEventListener('click', async () => {
      const btn = $('#saveKids'); btn.disabled = true;
      const boxes = [...document.querySelectorAll('#kidList input[type=checkbox]')];
      for (const b of boxes) {
        const want = b.checked, has = linked.has(b.value);
        if (want === has) continue;
        const { error } = await sb.rpc('link_parent_child', { p_parent: parent.id, p_student: b.value, p_link: want });
        if (error) { btn.disabled = false; return toast(errMsg(error), 'error'); }
      }
      closeModal(); toast('បានភ្ជាប់កូនរួចរាល់'); renderAccountsView();
    });
  }

  // session expiry / sign-out in another tab
  sb.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT' && state.me) { state.me = null; showLogin(); } });

  // shared helpers for js/worksheets.js
  window.App = { sb, CFG, state, $, esc, toast, errMsg, openModal, closeModal, modalHeader, gradeOptions, subjectOf, SUBJECT_COLORS,
    isStaff, myGrades, viewGrades, viewAllLabel, fixGradeFilter, canManageGrade, loading, emptyBox, statCard, fmtDate, fmtDateTime, fmtDuration, loadLessons, linkify };

  boot().catch((e) => { console.error(e); showLogin(); });
})();
