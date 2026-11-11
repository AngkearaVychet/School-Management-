/**
 * កម្មវិធីសាលាអន្តរជាតិ ហេមតុន (Hampton International School)
 * Main Application Logic with Multi-User Authentication & Role-Based Permissions
 * Roles: Admin, Teacher, Student, Parent
 */

const state = {
  currentTab: 'all',          // 'all', 'lesson', 'exercise', 'video', 'bookmarks'
  selectedProgram: 'all',     // 'all', 'khmer_kg', 'khmer_primary', 'english_ey', 'english_pri', 'parttime_en', 'parttime_zh'
  selectedSubject: 'all',
  selectedGrade: 'all',
  searchQuery: '',
  sortBy: 'newest',
  activeItem: null,
  quizAnswers: {},
  quizSubmitted: false,
  quizStartedAt: null,
  editingItemId: null,
  editingUserId: null,
  plpTab: 'attendance',
  plpAttDate: new Date().toISOString().slice(0, 10),
  plpAttGrade: 'ថ្នាក់ទី១',
  plpProfileGrade: 'all',
  editingProfileUserId: null,
  plpAnalyticsGrade: 'all',
  plpAnalyticsType: 'all'
};

// មុខងារការពារ XSS សម្រាប់អត្ថបទបញ្ចូលដោយអ្នកប្រើប្រាស់
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// បំប្លែង Link ឬ Embed Code (<iframe>) ពី YouTube / Google Drive / MP4 ទៅជាទម្រង់បង្ហាញ
function parseVideoEmbed(rawInput) {
  if (!rawInput || !rawInput.trim()) return null;
  let value = rawInput.trim();

  // បើអ្នកប្រើ Paste កូដ <iframe>...</iframe> ទាំងមូល
  if (/<iframe/i.test(value)) {
    const srcMatch = value.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) return null;
    value = srcMatch[1].trim();
  }

  // អនុញ្ញាតតែ http:// ឬ https:// ប៉ុណ្ណោះ
  if (!/^https?:\/\//i.test(value)) return null;

  // ពិនិត្យតំណភ្ជាប់ YouTube គ្រប់ទម្រង់ (watch?v=, youtu.be/, shorts/, live/, embed/)
  const ytMatch = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/i
  );
  if (ytMatch) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // ពិនិត្យវីដេអូពី Google Drive (/file/d/<ID>/view)
  const driveVideoMatch = value.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/i);
  if (driveVideoMatch) {
    return {
      kind: 'iframe',
      src: `https://drive.google.com/file/d/${driveVideoMatch[1]}/preview`
    };
  }

  // ឯកសារវីដេអូផ្ទាល់ (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
    return { kind: 'video', src: value };
  }

  return { kind: 'iframe', src: value };
}

// បង្កើត Link សម្រាប់ «មើលឯកសារ» និង «ទាញយកឯកសារ» ពី Google Drive ឬ URL ផ្សេងៗ
function getDriveActionLinks(rawUrl) {
  const url = (rawUrl || '').trim();
  if (!url || url === '#' || url.includes('SAMPLE_FILE_ID')) {
    return {
      viewUrl: url || '#',
      downloadUrl: url || '#',
      isSample: true,
      isDrive: true
    };
  }

  // Google Drive File (/file/d/ID, open?id=ID, uc?id=ID)
  const fileIdMatch =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([A-Za-z0-9_-]+)/i);
  if (fileIdMatch) {
    const id = fileIdMatch[1];
    return {
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      isSample: false,
      isDrive: true
    };
  }

  // Google Docs / Sheets / Slides -> Export PDF សម្រាប់ទាញយក
  const docsMatch = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]+)/i);
  if (docsMatch) {
    const [, docType, id] = docsMatch;
    return {
      viewUrl: url,
      downloadUrl: `https://docs.google.com/${docType}/d/${id}/export?format=pdf`,
      isSample: false,
      isDrive: true
    };
  }

  // Google Drive Folder
  if (/drive\.google\.com\/drive\/folders\//i.test(url)) {
    return {
      viewUrl: url,
      downloadUrl: url,
      isSample: false,
      isDrive: true
    };
  }

  return {
    viewUrl: url,
    downloadUrl: url,
    isSample: false,
    isDrive: false
  };
}

// គ្រប់គ្រងពេលចុច Link គំរូ Google Drive កុំឱ្យចេញ 404 និងកត់ត្រាការមើល/ទាញយក
function handleSampleDriveLink(event, actionType, url, fileName) {
  if (url && url !== '#' && !url.includes('SAMPLE_FILE_ID')) {
    StorageManager.recordActivity(
      actionType === 'download' ? 'download_doc' : 'view_doc',
      `${actionType === 'download' ? 'ទាញយកឯកសារ' : 'បើកមើលឯកសារ'}៖ ${fileName || url}`,
      state.activeItem
    );
    return true; // បើក Link ពិតក្នុង Tab ថ្មីធម្មតា
  }
  if (event) event.preventDefault();

  const label = (fileName || 'ឯកសារសិក្សា_គំរូ.pdf').trim();
  const actionTitle = actionType === 'download' ? 'ទាញយកឯកសារ (គំរូ)' : 'មើលឯកសារ (គំរូ)';
  const currentUser = StorageManager.getCurrentUser();
  const canEdit = currentUser && ['admin', 'head', 'teacher'].includes(currentUser.role);

  const modal = document.getElementById('detailModal');
  const modalContent = document.getElementById('detailModalContent');
  if (!modal || !modalContent) {
    showToast('នេះជា Link Google Drive គំរូ — សូមជំនួសដោយ Link ពិតពី Google Drive របស់អ្នក', 'info');
    return false;
  }

  modalContent.innerHTML = `
    <div class="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center">
          <i class="fa-brands fa-google-drive text-lg"></i>
        </div>
        <div>
          <h3 class="text-base font-black text-slate-900">${escapeHtml(actionTitle)}</h3>
          <p class="text-xs text-slate-500">${escapeHtml(label)}</p>
        </div>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="p-6 space-y-4 text-sm text-slate-700">
      <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed">
        <p class="font-bold mb-1"><i class="fa-solid fa-circle-info mr-1"></i> នេះគឺជាប៊ូតុង Google Drive គំរូ</p>
        <p>ដើម្បីភ្ជាប់ឯកសារពិតពី Google Drive របស់សាលា៖</p>
        <ol class="list-decimal list-inside mt-2 space-y-1">
          <li>Upload ឯកសារ PDF ឬ Word ចូល Google Drive រួចកំណត់ Share ជា <strong>Anyone with the link</strong>។</li>
          <li>ចម្លង Link នោះ ហើយបិទភ្ជាប់តាមប៊ូតុង <strong>«ប្តូរ Link YouTube / Drive»</strong> ឬក្នុងកូដ <code class="bg-white px-1 rounded">index.html</code>។</li>
        </ol>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2 pt-2">
        ${canEdit ? `
          <button onclick="closeAllModals(); openFeaturedEditModal();" class="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition">
            <i class="fa-solid fa-pen-to-square mr-1"></i> ដាក់ Link Google Drive ឥឡូវនេះ
          </button>
        ` : ''}
        <button onclick="closeAllModals()" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100">
          បិទ
        </button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  return false;
}

// មុខងារជំនួយ Markdown
function parseMarkdown(mdText) {
  if (!mdText) return '';
  let html = mdText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2 flex items-center gap-2"><i class="fa-solid fa-chevron-right text-blue-900 text-sm"></i> $1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-3 border-b pb-2 border-slate-200">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-700">$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200">$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-700">$1</li>')
    .replace(/\n\s*\n/g, '</p><p class="mb-3 text-slate-700 leading-relaxed">');

  return '<p class="mb-3 text-slate-700 leading-relaxed">' + html + '</p>';
}

function renderMath() {
  if (typeof renderMathInElement === 'function') {
    try {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
    }
  }
}

function getSubjectObj(id) {
  return INITIAL_SUBJECTS.find(s => s.id === id) || { id: 'other', name: 'ទូទៅ', icon: 'fa-book', color: 'slate' };
}

function getSubjectBadgeClass(color) {
  const map = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return map[color] || map.slate;
}

// ================= AUTHENTICATION & USER UI =================
function renderUserNav() {
  const container = document.getElementById('userNavContainer');
  const teacherAddBtn = document.getElementById('teacherAddBtn');
  const scoreboardBtn = document.getElementById('scoreboardBtn');
  const featuredEditBtn = document.getElementById('featuredEditBtn');
  const adminManageBtn = document.getElementById('adminManageBtn');
  const userManageBtnLabel = document.getElementById('userManageBtnLabel');
  const studentRecordsBtn = document.getElementById('studentRecordsBtn');
  const parentDashBtn = document.getElementById('parentDashBtn');
  const backupBtn = document.getElementById('backupBtn');

  if (!container) return;

  const currentUser = StorageManager.getCurrentUser();

  if (!currentUser) {
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button 
          onclick="openRegisterModal()" 
          class="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
          title="ចុះឈ្មោះគណនីថ្មី"
        >
          <i class="fa-solid fa-user-plus text-xs"></i>
          <span>+ បង្កើតគណនី</span>
        </button>
        <button 
          onclick="openLoginModal()" 
          class="px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
          <span>ចូលប្រព័ន្ធ (Login)</span>
        </button>
      </div>
    `;

    [teacherAddBtn, scoreboardBtn, featuredEditBtn, adminManageBtn, studentRecordsBtn, parentDashBtn, backupBtn].forEach(el => {
      if (el) el.classList.add('hidden');
    });
    renderPlpRoleBar();
    return;
  }

  const badgeInfo = ROLE_META[currentUser.role] || ROLE_META.student;
  const canManageUsers = StorageManager.hasPermission('manage_users') || StorageManager.hasPermission('manage_students');
  const canCreate = StorageManager.hasPermission('create_lesson');
  const canScoreboard = StorageManager.hasPermission('view_scoreboard');
  const canParentDash = StorageManager.hasPermission('view_parent_dashboard');
  const canOwnRecords = StorageManager.hasPermission('view_own_records');
  const canBackup = StorageManager.hasPermission('backup_system');

  const manageLabel = currentUser.role === 'teacher'
    ? 'គ្រប់គ្រងសិស្ស'
    : currentUser.role === 'head'
      ? 'គ្រូ សិស្ស & មាតាបិតា'
      : 'គ្រប់គ្រង User';

  container.innerHTML = `
    <div class="relative group">
      <button class="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition shadow-xs">
        <div class="w-8 h-8 rounded-xl ${currentUser.avatarBg || badgeInfo.bg} text-white flex items-center justify-center text-xs font-bold shadow-xs">
          <i class="fa-solid ${currentUser.avatarIcon || badgeInfo.icon}"></i>
        </div>
        <div class="text-left hidden sm:block pr-1">
          <p class="text-xs font-bold text-slate-800 leading-tight max-w-[130px] truncate">${escapeHtml(currentUser.name)}</p>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold ${badgeInfo.badge} px-1.5 py-0.2 rounded-md border">
            <span class="w-1.5 h-1.5 rounded-full ${badgeInfo.dot}"></span>
            ${escapeHtml(badgeInfo.short)}
          </span>
        </div>
        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 mr-1 hidden sm:block"></i>
      </button>

      <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 hidden group-hover:block hover:block z-50">
        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <p class="text-xs text-slate-400 font-medium">គណនីបច្ចុប្បន្ន</p>
          <p class="text-sm font-bold text-slate-900 truncate">${escapeHtml(currentUser.name)}</p>
          <p class="text-[11px] text-slate-500 font-mono truncate">@${escapeHtml(currentUser.username)} • ${escapeHtml(currentUser.grade || 'ទូទៅ')}</p>
        </div>

        <div class="py-1 text-xs">
          ${canOwnRecords ? `
            <button onclick="openStudentRecordsModal()" class="w-full px-4 py-2 text-left hover:bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-clipboard-check text-emerald-600 text-sm"></i>
              <span>ប្រវត្តិសិក្សា &amp; ពិន្ទុរបស់ខ្ញុំ</span>
            </button>
          ` : ''}

          ${canManageUsers ? `
            <button onclick="openUserManagementModal()" class="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-users-gear text-red-600 text-sm"></i>
              <span>${escapeHtml(manageLabel)}</span>
            </button>
          ` : ''}

          ${canScoreboard ? `
            <button onclick="openScoreboardModal()" class="w-full px-4 py-2 text-left hover:bg-indigo-50 text-indigo-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-table-list text-indigo-600 text-sm"></i>
              <span>ស្រង់ពិន្ទុ &amp; កំណត់ត្រាប្រព័ន្ធ</span>
            </button>
          ` : ''}

          ${canParentDash ? `
            <button onclick="openParentModal()" class="w-full px-4 py-2 text-left hover:bg-amber-50 text-amber-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-chart-line text-amber-600 text-sm"></i>
              <span>${currentUser.role === 'parent' ? 'តាមដានព័ត៌មានកូន' : 'តាមដានសិស្ស (Parent View)'}</span>
            </button>
          ` : ''}

          ${canCreate ? `
            <button onclick="openAddModal()" class="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5">
              <i class="fa-solid fa-circle-plus text-blue-900 text-sm"></i>
              <span>បន្ថែមមេរៀន / លំហាត់ថ្មី</span>
            </button>
          ` : ''}

          <button onclick="openLoginModal()" class="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5">
            <i class="fa-solid fa-users-viewfinder text-slate-500 text-sm"></i>
            <span>ប្តូរគណនី (Switch User)</span>
          </button>
        </div>

        <div class="pt-1 border-t border-slate-100">
          <button onclick="handleLogout()" class="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-2.5">
            <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            <span>ចាកចេញពីគណនី (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  `;

  if (teacherAddBtn) teacherAddBtn.classList.toggle('hidden', !canCreate);
  if (scoreboardBtn) scoreboardBtn.classList.toggle('hidden', !canScoreboard);
  if (featuredEditBtn) featuredEditBtn.classList.toggle('hidden', !StorageManager.hasPermission('edit_featured_media'));
  if (adminManageBtn) adminManageBtn.classList.toggle('hidden', !canManageUsers);
  if (userManageBtnLabel) userManageBtnLabel.textContent = manageLabel;
  if (studentRecordsBtn) studentRecordsBtn.classList.toggle('hidden', !canOwnRecords);
  if (parentDashBtn) parentDashBtn.classList.toggle('hidden', !canParentDash);
  if (backupBtn) backupBtn.classList.toggle('hidden', !canBackup);
  renderPlpRoleBar();
}

function handleQrLoginSubmit(presetCode = null) {
  const input = document.getElementById('qrLoginCodeInput');
  const raw = presetCode !== null ? presetCode : (input ? input.value : '');
  const res = StorageManager.loginWithQrToken(raw);
  if (res.success) {
    showToast(`ស្កេនកាត QR ជោគជ័យ! សូមស្វាគមន៍ ${res.user.name}`, 'success');
    if (input) input.value = '';
    closeAllModals();
    renderUserNav();
    renderSubjectFilters();
    renderGradeFilter();
    renderStats();
    renderCards();
  } else {
    alert(res.message);
  }
}

// ចូលប្រើប្រាស់ Login
function openLoginModal() {
  closeAllModals();
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.loginUsername.value.trim();
  const password = form.loginPassword.value;

  const res = StorageManager.login(username, password);
  if (res.success) {
    showToast(`សូមស្វាគមន៍! ${res.user.name} (${res.user.roleNameKhmer})`, 'success');
    form.reset();
    closeAllModals();
    renderUserNav();
    renderSubjectFilters();
    renderGradeFilter();
    renderStats();
    renderCards();
  } else {
    alert(res.message);
  }
}

function handleLogout() {
  StorageManager.logout();
  showToast('បានចាកចេញពីគណនីដោយជោគជ័យ', 'info');
  renderUserNav();
  renderSubjectFilters();
  renderGradeFilter();
  renderStats();
  renderCards();
}

// ចុះឈ្មោះ Register (អនុញ្ញាត សិស្ស, គ្រូ និងមាតាបិតា)
function openRegisterModal() {
  closeAllModals();
  const modal = document.getElementById('registerModal');
  if (modal) modal.classList.remove('hidden');
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const userData = {
    name: form.regName.value.trim(),
    username: form.regUsername.value.trim(),
    password: form.regPassword.value,
    role: form.regRole.value,
    grade: form.regGrade.value,
    email: form.regEmail.value.trim(),
    phone: form.regPhone.value.trim(),
    childName: form.regChildName ? form.regChildName.value.trim() : '',
    childGrade: form.regRole.value === 'parent' ? form.regGrade.value : ''
  };

  const res = StorageManager.addUser(userData, { isSelfRegister: true });
  if (res.success) {
    StorageManager.setCurrentUser(res.user);
    StorageManager.recordActivity('register', `ចុះឈ្មោះគណនីថ្មី (${res.user.roleNameKhmer})`);
    showToast('ចុះឈ្មោះបានជោគជ័យ! សូមស្វាគមន៍មកកាន់សាលា ហេមតុន', 'success');
    form.reset();
    closeAllModals();
    renderUserNav();
    renderSubjectFilters();
    renderGradeFilter();
    renderStats();
    renderCards();
  } else {
    alert(res.message);
  }
}

// ================= ROLE-SCOPED USER MANAGEMENT MODAL =================
function toggleCreateUserParentField() {
  const roleSelect = document.getElementById('adminNewRoleSelect');
  const childWrap = document.getElementById('adminNewChildWrap');
  if (!roleSelect || !childWrap) return;
  childWrap.classList.toggle('hidden', roleSelect.value !== 'parent');
}

function openUserManagementModal() {
  const currentUser = StorageManager.getCurrentUser();
  if (!StorageManager.hasPermission('manage_users') && !StorageManager.hasPermission('manage_students')) {
    alert('មានតែគណនី Admin, ប្រធានផ្នែក ឬគ្រូបង្រៀន ប៉ុណ្ណោះដែលអាចគ្រប់គ្រងគណនីបាន!');
    return;
  }

  const subtitle = document.getElementById('userManageModalSubtitle');
  const titleEl = document.getElementById('userManageModalTitle');
  const formTitle = document.getElementById('userCreateFormTitle');
  const roleSelect = document.getElementById('adminNewRoleSelect');
  const gradeSelect = document.getElementById('adminNewGradeSelect');
  const childSelect = document.getElementById('adminNewChildSelect');

  if (currentUser.role === 'teacher') {
    if (subtitle) subtitle.textContent = 'ផ្ទាំងគ្រូបង្រៀន (Teacher Student Manager)';
    if (titleEl) titleEl.textContent = 'បង្កើត និងតាមដានគណនីកូនសិស្ស';
    if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-user-plus text-blue-900"></i> <span>បង្កើតគណនីកូនសិស្ស ឬមាតាបិតា</span>';
  } else if (currentUser.role === 'head') {
    if (subtitle) subtitle.textContent = 'ផ្ទាំងប្រធានផ្នែក (Department Head)';
    if (titleEl) titleEl.textContent = 'គ្រប់គ្រងលើគ្រូ សិស្ស និងមាតាបិតា';
    if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-user-plus text-blue-900"></i> <span>បង្កើតគណនី គ្រូ / សិស្ស / មាតាបិតា</span>';
  } else {
    if (subtitle) subtitle.textContent = 'ផ្ទាំងគ្រប់គ្រងអភិបាល (Full System Admin)';
    if (titleEl) titleEl.textContent = 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់ និងសិទ្ធិទាំងអស់';
    if (formTitle) formTitle.innerHTML = '<i class="fa-solid fa-user-plus text-blue-900"></i> <span>បង្កើតគណនីថ្មី (គ្រប់ Role)</span>';
  }

  if (roleSelect) {
    const allowed = StorageManager.getManageableRoles(currentUser);
    roleSelect.innerHTML = allowed.map(r => {
      const meta = ROLE_META[r] || ROLE_META.student;
      return `<option value="${r}">${escapeHtml(meta.name)}</option>`;
    }).join('');
  }

  if (gradeSelect) {
    let gHtml = `<option value="ទូទៅ">ទូទៅ (All)</option>`;
    GRADE_GROUPS.forEach(group => {
      gHtml += `<optgroup label="${escapeHtml(group.groupName)}">`;
      group.grades.forEach(g => {
        gHtml += `<option value="${escapeHtml(g)}" ${g === 'ថ្នាក់ទី១' ? 'selected' : ''}>${escapeHtml(g)}</option>`;
      });
      gHtml += `</optgroup>`;
    });
    gradeSelect.innerHTML = gHtml;
  }

  if (childSelect) {
    const students = StorageManager.getUsers().filter(u => u.role === 'student');
    childSelect.innerHTML = `<option value="">-- ជ្រើសរើសឈ្មោះសិស្ស --</option>` +
      students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.grade)})</option>`).join('');
  }

  toggleCreateUserParentField();
  renderUserManagementTable();
  const modal = document.getElementById('userManagementModal');
  if (modal) modal.classList.remove('hidden');
}

function renderUserManagementTable() {
  const container = document.getElementById('usersTableBody');
  const countEl = document.getElementById('totalUsersCount');
  if (!container) return;

  const allUsers = StorageManager.getUsers();
  const currentUser = StorageManager.getCurrentUser();
  const quizHistory = StorageManager.getQuizHistory();
  const submissions = StorageManager.getSubmissions();

  // កំណត់បញ្ជី User ដែលតួនាទីនីមួយៗអាចមើល និងគ្រប់គ្រងបាន
  const users = allUsers.filter(u => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'head') return ['teacher', 'student', 'parent'].includes(u.role) || u.id === currentUser.id;
    if (currentUser.role === 'teacher') return ['student', 'parent'].includes(u.role);
    return false;
  });

  if (countEl) countEl.textContent = users.length;

  container.innerHTML = users.map((u, idx) => {
    const isSelf = currentUser && currentUser.id === u.id;
    const meta = ROLE_META[u.role] || ROLE_META.student;
    const canManageThis = StorageManager.canManageUser(currentUser, u);
    const quizCount = quizHistory.filter(q => q.userId === u.id).length;
    const hwCount = submissions.filter(s => s.userId === u.id).length;
    const studentStats = u.role === 'student'
      ? `<div class="text-[11px] text-emerald-700 font-semibold mt-0.5">Quiz: ${quizCount} • កិច្ចការ: ${hwCount}</div>`
      : '';

    return `
      <tr class="hover:bg-slate-50/80 transition text-xs sm:text-sm border-b border-slate-100">
        <td class="p-3 text-slate-500 font-mono text-center">${idx + 1}</td>
        <td class="p-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl ${u.avatarBg || meta.bg} text-white flex items-center justify-center text-xs flex-shrink-0">
              <i class="fa-solid ${u.avatarIcon || meta.icon}"></i>
            </div>
            <div>
              <p class="font-bold text-slate-900">${escapeHtml(u.name)} ${isSelf ? '<span class="text-[10px] text-blue-600 font-normal">(ខ្លួនឯង)</span>' : ''}</p>
              <p class="text-xs text-slate-400 font-mono">@${escapeHtml(u.username)} • ${escapeHtml(u.phone || 'គ្មានលេខទូរស័ព្ទ')}</p>
            </div>
          </div>
        </td>
        <td class="p-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}">
            ${escapeHtml(meta.short)}
          </span>
        </td>
        <td class="p-3 font-medium text-slate-700">
          ${escapeHtml(u.grade || 'ទូទៅ')}
          ${u.childName ? `<div class="text-[11px] text-amber-700">កូន៖ ${escapeHtml(u.childName)}</div>` : ''}
          ${studentStats}
        </td>
        <td class="p-3 text-slate-400 text-xs hidden sm:table-cell">
          ${escapeHtml(u.createdAt || '2026-10-01')}
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${canManageThis ? `
              <button 
                onclick="editUserRole('${u.id}')" 
                title="កែប្រែថ្នាក់ / Role / Password" 
                class="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 flex items-center justify-center transition"
              >
                <i class="fa-solid fa-user-pen text-xs"></i>
              </button>
              ${!isSelf ? `
                <button 
                  onclick="confirmDeleteUser('${u.id}')" 
                  title="លុបអ្នកប្រើប្រាស់" 
                  class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              ` : ''}
            ` : '<span class="text-[11px] text-slate-400">-</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleAdminCreateUser(e) {
  e.preventDefault();
  const form = e.target;

  const userData = {
    name: form.adminNewName.value.trim(),
    username: form.adminNewUsername.value.trim(),
    password: form.adminNewPassword.value,
    role: form.adminNewRole.value,
    grade: form.adminNewGrade.value,
    childId: form.adminNewChildId ? form.adminNewChildId.value : '',
    email: form.adminNewEmail.value.trim(),
    phone: form.adminNewPhone.value.trim()
  };

  const res = StorageManager.addUser(userData);
  if (res.success) {
    showToast(`បានបង្កើតគណនី ${userData.name} ដោយជោគជ័យ!`, 'success');
    form.reset();
    toggleCreateUserParentField();
    renderUserManagementTable();
  } else {
    alert(res.message);
  }
}

function editUserRole(userId) {
  const currentUser = StorageManager.getCurrentUser();
  const users = StorageManager.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  if (!StorageManager.canManageUser(currentUser, user)) {
    alert('អ្នកមិនមានសិទ្ធិកែប្រែគណនីនេះទេ!');
    return;
  }

  const allowedRoles = StorageManager.getManageableRoles(currentUser);
  const newRole = prompt(`កែប្រែតួនាទីសម្រាប់ ${user.name}:\n(${allowedRoles.join(', ')})\nបច្ចុប្បន្ន៖ ${user.role}`, user.role);
  if (newRole === null) return;
  const cleanRole = newRole.toLowerCase().trim();
  if (!allowedRoles.includes(cleanRole)) {
    alert(`តួនាទីមិនត្រឹមត្រូវ! អ្នកអាចកំណត់បានតែ៖ ${allowedRoles.join(', ')}`);
    return;
  }

  const newGrade = prompt(`កែប្រែកម្រិតថ្នាក់សម្រាប់ ${user.name}:`, user.grade || 'ថ្នាក់ទី១');
  if (newGrade === null) return;

  const newPass = prompt(`ប្តូរពាក្យសម្ងាត់ថ្មីសម្រាប់ ${user.name} (ទុកទទេបើមិនប្តូរ):`, '');
  const updates = { role: cleanRole, grade: newGrade.trim() || user.grade };
  if (newPass && newPass.trim()) {
    updates.password = newPass.trim();
  }

  const res = StorageManager.updateUser(userId, updates);
  if (res.success) {
    showToast(`បានកែប្រែគណនី ${user.name} រួចរាល់!`, 'success');
    renderUserManagementTable();
    renderUserNav();
    renderCards();
  } else {
    alert(res.message);
  }
}

function confirmDeleteUser(userId) {
  const users = StorageManager.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  if (confirm(`តើលោកអ្នកពិតជាចង់លុបគណនី "${user.name} (@${user.username})" មែនទេ?`)) {
    const res = StorageManager.deleteUser(userId);
    if (res.success) {
      showToast('បានលុបអ្នកប្រើប្រាស់រួចរាល់', 'info');
      renderUserManagementTable();
      renderUserNav();
    } else {
      alert(res.message);
    }
  }
}

// ================= PARENT DASHBOARD MODAL (CHILD-SCOPED) =================
function openParentModal(selectedChildId = null) {
  const currentUser = StorageManager.getCurrentUser();
  if (!StorageManager.hasPermission('view_parent_dashboard')) {
    alert('មានតែគណនី មាតាបិតា, ប្រធានផ្នែក ឬ Admin ប៉ុណ្ណោះដែលអាចបើកផ្ទាំងនេះបាន!');
    return;
  }

  const modal = document.getElementById('parentModal');
  const content = document.getElementById('parentModalContent');
  if (!modal || !content) return;

  const allStudents = StorageManager.getUsers().filter(u => u.role === 'student');
  let child = null;
  if ((currentUser.role === 'admin' || currentUser.role === 'head') && allStudents.length > 0) {
    child = (selectedChildId && allStudents.find(s => s.id === selectedChildId)) || allStudents[0];
  } else {
    child = StorageManager.getParentChild(currentUser);
  }

  const childId = child ? child.id : '';
  const childName = child ? child.name : 'សិស្ស';
  const childGrade = child ? child.grade : 'ថ្នាក់ទី១';

  const quizHistory = StorageManager.getQuizHistory().filter(
    rec => (childId && rec.userId === childId) || (rec.userName && rec.userName === childName)
  );
  const submissions = StorageManager.getSubmissions().filter(
    sub => (childId && sub.userId === childId) || (sub.userName && sub.userName === childName)
  );
  const childLogs = childId ? StorageManager.getActivityLogs({ userId: childId }).slice(0, 15) : [];

  const studentSelectorHtml = (currentUser.role === 'admin' || currentUser.role === 'head') && allStudents.length > 0
    ? `<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
         <span class="font-bold text-slate-700"><i class="fa-solid fa-user-graduate mr-1 text-emerald-700"></i> ជ្រើសរើសសិស្សដើម្បីពិនិត្យព័ត៌មាន៖</span>
         <select onchange="openParentModal(this.value)" class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800">
           ${allStudents.map(s => `<option value="${escapeHtml(s.id)}" ${s.id === childId ? 'selected' : ''}>${escapeHtml(s.name)} (${escapeHtml(s.grade)})</option>`).join('')}
         </select>
       </div>`
    : '';

  content.innerHTML = `
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 sticky top-0 z-10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-md">
          <i class="fa-solid fa-users"></i>
        </div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-800">ផ្ទាំងព័ត៌មានមាតាបិតា (Parent Portal)</span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900">តាមដានព័ត៌មាន និងការសិក្សារបស់កូន</h3>
        </div>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <div class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
      ${studentSelectorHtml}

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            <i class="fa-solid fa-child"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-base">${escapeHtml(childName)}</h4>
            <p class="text-xs text-slate-500 font-medium">កម្រិតថ្នាក់៖ <strong class="text-blue-900">${escapeHtml(childGrade)}</strong> • សាលាអន្តរជាតិ ហេមតុន</p>
          </div>
        </div>

        <div class="flex items-center gap-3 text-center">
          <div class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
            <span class="block text-lg font-black text-blue-900">${quizHistory.length}</span>
            <span class="text-[10px] text-slate-500 font-medium">លំហាត់ Quiz</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
            <span class="block text-lg font-black text-indigo-800">${submissions.length}</span>
            <span class="text-[10px] text-slate-500 font-medium">កិច្ចការផ្ទះ</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span class="block text-lg font-black text-emerald-700">${childLogs.length}</span>
            <span class="text-[10px] text-slate-500 font-medium">កំណត់ត្រាសិក្សា</span>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-pen-nib text-amber-600"></i>
          លទ្ធផលលំហាត់ Quiz &amp; ប្រឡងរបស់កូន
        </h4>
        ${quizHistory.length === 0 ? `
          <div class="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            កូនរបស់អ្នកមិនទាន់មានកំណត់ត្រាធ្វើលំហាត់នៅឡើយទេ។
          </div>
        ` : `
          <div class="space-y-2">
            ${quizHistory.map(res => {
              const percent = res.percentage || 0;
              return `
                <div class="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                  <div class="truncate pr-3">
                    <p class="font-bold text-slate-900 truncate">${escapeHtml(res.itemTitle || 'លំហាត់អនុវត្ត')}</p>
                    <span class="text-[11px] text-slate-400">${escapeHtml(res.itemGrade || '')} • ${res.completedAt ? res.completedAt.split('T')[0] : ''}</span>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="font-black text-slate-800">${res.score}/${res.total}</span>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${percent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'}">
                      ${percent}%
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-file-signature text-indigo-700"></i>
          កិច្ចការផ្ទះ និងពិន្ទុពីលោកគ្រូ-អ្នកគ្រូ
        </h4>
        ${submissions.length === 0 ? `
          <div class="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            មិនទាន់មានការប្រគល់កិច្ចការផ្ទះរបស់កូននៅឡើយទេ។
          </div>
        ` : `
          <div class="space-y-2">
            ${submissions.map(sub => `
              <div class="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="min-w-0">
                  <p class="font-bold text-slate-900">${escapeHtml(sub.itemTitle)}</p>
                  <p class="text-slate-600">${escapeHtml(sub.note)}</p>
                  ${sub.feedback ? `<p class="text-emerald-800 mt-0.5"><i class="fa-solid fa-comment-dots mr-1"></i> មតិគ្រូ៖ ${escapeHtml(sub.feedback)}</p>` : ''}
                </div>
                <div class="flex-shrink-0">
                  ${sub.status === 'graded'
                    ? `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">ពិន្ទុ៖ ${sub.score}/${sub.maxScore}</span>`
                    : `<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">រង់ចាំគ្រូដាក់ពិន្ទុ</span>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-emerald-600"></i>
          កំណត់ត្រាសកម្មភាពសិក្សារបស់កូន (System Record)
        </h4>
        ${childLogs.length === 0 ? `
          <div class="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            មិនទាន់មានកំណត់ត្រាសកម្មភាពចូលរៀនរបស់កូននៅឡើយទេ។
          </div>
        ` : `
          <div class="space-y-1.5">
            ${childLogs.map(log => `
              <div class="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span class="text-slate-700 font-medium truncate pr-2">${escapeHtml(log.details)}</span>
                <span class="text-[11px] text-slate-400 flex-shrink-0 font-mono">${escapeHtml((log.timestamp || '').replace('T', ' ').slice(0, 16))}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// ================= STUDENT MY RECORDS MODAL =================
function openStudentRecordsModal() {
  const currentUser = StorageManager.getCurrentUser();
  if (!currentUser || !StorageManager.hasPermission('view_own_records')) {
    alert('ផ្ទាំងនេះសម្រាប់គណនីសិស្សានុសិស្ស!');
    return;
  }

  const modal = document.getElementById('studentRecordsModal');
  const content = document.getElementById('studentRecordsModalContent');
  if (!modal || !content) return;

  const myQuizzes = StorageManager.getQuizHistory().filter(r => r.userId === currentUser.id);
  const mySubmissions = StorageManager.getSubmissions().filter(s => s.userId === currentUser.id);
  const myLogs = StorageManager.getActivityLogs({ userId: currentUser.id }).slice(0, 20);

  content.innerHTML = `
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
          <i class="fa-solid fa-clipboard-check"></i>
        </div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-800">កំណត់ត្រាសិក្សារបស់សិស្ស</span>
          <h3 class="text-lg font-black text-slate-900">${escapeHtml(currentUser.name)} • ${escapeHtml(currentUser.grade)}</h3>
        </div>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="p-6 overflow-y-auto flex-1 space-y-6">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="p-3 rounded-2xl bg-blue-50 border border-blue-100">
          <span class="block text-xl font-black text-blue-900">${myQuizzes.length}</span>
          <span class="text-xs text-slate-600">លំហាត់ Quiz</span>
        </div>
        <div class="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
          <span class="block text-xl font-black text-indigo-800">${mySubmissions.length}</span>
          <span class="text-xs text-slate-600">កិច្ចការផ្ទះបានផ្ញើ</span>
        </div>
        <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span class="block text-xl font-black text-emerald-700">${myLogs.length}</span>
          <span class="text-xs text-slate-600">សកម្មភាពកត់ត្រា</span>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-2">ពិន្ទុលំហាត់ &amp; កិច្ចការផ្ទះរបស់ខ្ញុំ</h4>
        ${(myQuizzes.length === 0 && mySubmissions.length === 0) ? `
          <div class="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">អ្នកមិនទាន់បានធ្វើលំហាត់ ឬផ្ញើកិច្ចការផ្ទះនៅឡើយទេ។</div>
        ` : `
          <div class="space-y-2">
            ${myQuizzes.map(q => `
              <div class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <span class="font-bold text-slate-800 truncate pr-2">Quiz: ${escapeHtml(q.itemTitle)}</span>
                <span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-bold flex-shrink-0">${q.score}/${q.total} (${q.percentage}%)</span>
              </div>
            `).join('')}
            ${mySubmissions.map(s => `
              <div class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div class="min-w-0 pr-2">
                  <span class="font-bold text-indigo-900 block truncate">កិច្ចការផ្ទះ: ${escapeHtml(s.itemTitle)}</span>
                  ${s.feedback ? `<span class="text-emerald-700">មតិគ្រូ៖ ${escapeHtml(s.feedback)}</span>` : ''}
                </div>
                <span class="px-2.5 py-1 rounded-full font-bold flex-shrink-0 ${s.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${s.status === 'graded' ? `${s.score}/${s.maxScore}` : 'រង់ចាំគ្រូដាក់ពិន្ទុ'}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-2">ប្រវត្តិសកម្មភាពដែលប្រព័ន្ធបានកត់ត្រា (System Record)</h4>
        ${myLogs.length === 0 ? `
          <div class="p-4 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">មិនទាន់មានកំណត់ត្រាសកម្មភាពនៅឡើយទេ។</div>
        ` : `
          <div class="space-y-1.5">
            ${myLogs.map(log => `
              <div class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span class="text-slate-700 truncate pr-2">${escapeHtml(log.details)}</span>
                <span class="text-[11px] text-slate-400 font-mono flex-shrink-0">${escapeHtml((log.timestamp || '').replace('T', ' ').slice(0, 16))}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// ================= PROGRAMS, SUBJECTS, GRADES FILTERS =================
function renderProgramTabs() {
  const container = document.getElementById('programTabsContainer');
  if (!container) return;

  container.innerHTML = PROGRAMS.map(prog => {
    const isActive = state.selectedProgram === prog.id;
    return `
      <button 
        onclick="setProgramFilter('${prog.id}')"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
          isActive 
            ? 'bg-blue-900 text-white shadow-md shadow-blue-900/25 ring-2 ring-red-600' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
        }"
      >
        <i class="fa-solid ${prog.icon} ${isActive ? 'text-red-400' : 'text-blue-900'}"></i>
        <span>${prog.name}</span>
      </button>
    `;
  }).join('');
}

function setProgramFilter(progId) {
  state.selectedProgram = progId;
  renderProgramTabs();
  renderCards();
}

function renderSubjectFilters() {
  const container = document.getElementById('subjectFilters');
  if (!container) return;

  const currentUser = StorageManager.getCurrentUser();
  let items = StorageManager.getItems();
  if (currentUser) {
    items = items.filter(i => StorageManager.canUserAccessItem(currentUser, i));
  }

  container.innerHTML = INITIAL_SUBJECTS.map(subj => {
    const isActive = state.selectedSubject === subj.id;
    const count = subj.id === 'all' 
      ? items.length 
      : items.filter(i => i.subject === subj.id).length;

    return `
      <button 
        onclick="setSubjectFilter('${subj.id}')"
        class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition whitespace-nowrap ${
          isActive 
            ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-900' 
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
        }"
      >
        <i class="fa-solid ${subj.icon} ${isActive ? 'text-white' : 'text-slate-400'}"></i>
        <span>${subj.name}</span>
        <span class="text-[11px] px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-blue-950 text-blue-200' : 'bg-slate-100 text-slate-500'
        }">${count}</span>
      </button>
    `;
  }).join('');
}

function renderGradeFilter() {
  const select = document.getElementById('gradeSelect');
  if (!select) return;

  const currentUser = StorageManager.getCurrentUser();
  if (currentUser && currentUser.role === 'student') {
    select.innerHTML = `<option value="all">ថ្នាក់របស់ខ្ញុំ៖ ${escapeHtml(currentUser.grade)} (+ គ្រូ Assign)</option>`;
    state.selectedGrade = 'all';
    select.disabled = true;
    return;
  }
  if (currentUser && currentUser.role === 'parent') {
    const child = StorageManager.getParentChild(currentUser);
    select.innerHTML = `<option value="all">ថ្នាក់របស់កូន៖ ${escapeHtml(child?.grade || currentUser.grade)}</option>`;
    state.selectedGrade = 'all';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  let html = `<option value="all">គ្រប់កម្រិតថ្នាក់ទាំងអស់ (All Grades)</option>`;

  GRADE_GROUPS.forEach(group => {
    html += `<optgroup label="── ${group.groupName} ──">`;
    group.grades.forEach(grade => {
      const selected = state.selectedGrade === grade ? 'selected' : '';
      html += `<option value="${grade}" ${selected}>${grade}</option>`;
    });
    html += `</optgroup>`;
  });

  select.innerHTML = html;
}

function populateTeacherGradeSelect(selectedGrade = '') {
  const select = document.getElementById('modalItemGrade');
  if (!select) return;

  let html = '';
  GRADE_GROUPS.forEach(group => {
    html += `<optgroup label="${group.groupName}">`;
    group.grades.forEach(grade => {
      const isSelected = selectedGrade === grade ? 'selected' : '';
      html += `<option value="${grade}" ${isSelected}>${grade}</option>`;
    });
    html += `</optgroup>`;
  });

  select.innerHTML = html;
}

function renderStats() {
  const currentUser = StorageManager.getCurrentUser();
  let items = StorageManager.getItems();
  if (currentUser) {
    items = items.filter(i => StorageManager.canUserAccessItem(currentUser, i));
  }
  const lessonsCount = items.filter(i => i.type === 'lesson').length;
  const exercisesCount = items.filter(i => i.type === 'exercise' || i.type === 'homework').length;
  const videosCount = items.filter(i => i.videoUrl && i.videoUrl.trim() !== '').length;

  let completedCount = 0;
  if (currentUser && currentUser.role === 'student') {
    completedCount = StorageManager.getQuizHistory().filter(q => q.userId === currentUser.id).length +
      StorageManager.getSubmissions().filter(s => s.userId === currentUser.id).length;
  } else if (currentUser && currentUser.role === 'parent') {
    const child = StorageManager.getParentChild(currentUser);
    completedCount = StorageManager.getQuizHistory().filter(q => child && q.userId === child.id).length;
  } else {
    completedCount = StorageManager.getQuizHistory().length + StorageManager.getSubmissions().length;
  }

  const elTotal = document.getElementById('statTotalLessons');
  const elExercises = document.getElementById('statTotalExercises');
  const elVideos = document.getElementById('statTotalVideos');
  const elCompleted = document.getElementById('statCompleted');

  if (elTotal) elTotal.textContent = lessonsCount;
  if (elExercises) elExercises.textContent = exercisesCount;
  if (elVideos) elVideos.textContent = videosCount;
  if (elCompleted) elCompleted.textContent = completedCount;
}

function getFilteredItems() {
  const currentUser = StorageManager.getCurrentUser();
  if (!currentUser) return [];

  let items = StorageManager.getItems().filter(i => StorageManager.canUserAccessItem(currentUser, i));
  const bookmarks = StorageManager.getBookmarks();

  if (state.selectedProgram !== 'all') {
    items = items.filter(i => i.program === state.selectedProgram);
  }

  if (state.currentTab === 'lesson') {
    items = items.filter(i => i.type === 'lesson');
  } else if (state.currentTab === 'exercise') {
    items = items.filter(i => i.type === 'exercise');
  } else if (state.currentTab === 'homework') {
    items = items.filter(i => i.type === 'homework');
  } else if (state.currentTab === 'video') {
    items = items.filter(i => i.videoUrl && i.videoUrl.trim() !== '');
  } else if (state.currentTab === 'bookmarks') {
    items = items.filter(i => bookmarks.includes(i.id));
  }

  if (state.selectedSubject !== 'all') {
    items = items.filter(i => i.subject === state.selectedSubject);
  }

  if (state.selectedGrade !== 'all') {
    items = items.filter(i => i.grade === state.selectedGrade);
  }

  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    items = items.filter(i => 
      (i.title && i.title.toLowerCase().includes(q)) ||
      (i.summary && i.summary.toLowerCase().includes(q)) ||
      (i.teacher && i.teacher.toLowerCase().includes(q)) ||
      (i.content && i.content.toLowerCase().includes(q)) ||
      (i.grade && i.grade.toLowerCase().includes(q))
    );
  }

  if (state.sortBy === 'newest') {
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (state.sortBy === 'views') {
    items.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (state.sortBy === 'bookmarks') {
    items.sort((a, b) => (b.bookmarks || 0) - (a.bookmarks || 0));
  }

  return items;
}

// Render Content Cards
function renderCards() {
  const container = document.getElementById('cardsContainer');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  const currentUser = StorageManager.getCurrentUser();
  if (!currentUser) {
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center text-2xl mb-4">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">សូមចូលប្រព័ន្ធ (Login) ដើម្បីចូលរៀនតាមតួនាទីរបស់អ្នក</h3>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
          ប្រព័ន្ធកំណត់សិទ្ធិច្បាស់លាស់៖ <strong>សិស្ស</strong> មើលមេរៀន និងធ្វើលំហាត់តែថ្នាក់ដែលគ្រូ Assign • <strong>មាតាបិតា</strong> តាមដានព័ត៌មានកូន • <strong>គ្រូ</strong> បង្កើតសិស្ស និងមេរៀន • <strong>ប្រធានផ្នែក</strong> គ្រប់គ្រងគ្រូ សិស្ស និងមាតាបិតា • <strong>Admin</strong> គ្រប់គ្រងប្រព័ន្ធទាំងមូល។
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button onclick="openLoginModal()" class="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            <span>ចូលប្រព័ន្ធ (Login)</span>
          </button>
          <button onclick="openRegisterModal()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2">
            <i class="fa-solid fa-user-plus"></i>
            <span>ចុះឈ្មោះគណនីថ្មី</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  const items = getFilteredItems();

  if (items.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = items.map(item => {
    const subj = getSubjectObj(item.subject);
    const badgeColor = getSubjectBadgeClass(subj.color);
    const isSaved = StorageManager.isBookmarked(item.id);
    const hasVideo = item.videoUrl && item.videoUrl.trim() !== '';
    const hasQuestions = item.questions && item.questions.length > 0;
    const hasAttachments = item.attachments && item.attachments.length > 0;
    const isExercise = item.type === 'exercise';
    const isHomework = item.type === 'homework';
    const isAssignedDirectly = currentUser.role === 'student' && Array.isArray(item.assignedStudentIds) && item.assignedStudentIds.includes(currentUser.id);
    const typeMeta = isHomework
      ? { color: 'text-purple-800', icon: 'fa-file-signature', label: 'កិច្ចការផ្ទះ' }
      : isExercise
        ? { color: 'text-emerald-700', icon: 'fa-pen-to-square', label: 'កម្រងលំហាត់' }
        : { color: 'text-blue-900', icon: 'fa-book-open', label: 'មេរៀនទ្រឹស្តី' };

    // សិទ្ធិកែប្រែ ឬលុប
    const canManageThis = StorageManager.hasPermission('edit_lesson', item);

    return `
      <div class="card-hover bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md transition-all">
        <div class="p-5 pb-3">
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeColor}">
                <i class="fa-solid ${subj.icon} text-xs"></i>
                ${subj.name}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                ${escapeHtml(item.grade)}
              </span>
              ${isAssignedDirectly ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">គ្រូ Assign ផ្ទាល់</span>` : ''}
            </div>

            <div class="flex items-center gap-1">
              <button 
                onclick="toggleBookmark('${item.id}', event)"
                title="${isSaved ? 'ដកការរក្សាទុក' : 'រក្សាទុកមេរៀននេះ'}"
                class="w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isSaved ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                }"
              >
                <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
              </button>

              ${canManageThis ? `
                <button 
                  onclick="openEditModal('${item.id}', event)" 
                  title="កែសម្រួល" 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-900 hover:bg-blue-50 transition"
                >
                  <i class="fa-solid fa-pencil text-xs"></i>
                </button>
                <button 
                  onclick="confirmDeleteItem('${item.id}', event)" 
                  title="លុប" 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              ` : ''}
            </div>
          </div>

          <div class="mb-2">
            <span class="inline-block text-[11px] font-bold uppercase tracking-wider ${typeMeta.color} mb-1">
              <i class="fa-solid ${typeMeta.icon} mr-1"></i>
              ${typeMeta.label}
            </span>
            <h3 
              onclick="openDetailModal('${item.id}')"
              class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition cursor-pointer line-clamp-2 leading-snug"
            >
              ${escapeHtml(item.title)}
            </h3>
          </div>

          <p class="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            ${escapeHtml(item.summary || 'ចុចដើម្បីចូលមើលខ្លឹមសារ និងព័ត៌មានលម្អិត...')}
          </p>
        </div>

        <div class="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-2 truncate">
            <div class="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
              ${escapeHtml((item.teacher || 'គ្រូ').charAt(0))}
            </div>
            <span class="truncate font-medium text-slate-700">${escapeHtml(item.teacher || 'គ្រូបង្រៀន')}</span>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            ${hasVideo ? '<span class="text-red-600 font-semibold flex items-center gap-1" title="មានវីដេអូ"><i class="fa-solid fa-circle-play"></i> វីដេអូ</span>' : ''}
            ${hasAttachments ? '<span class="text-blue-800 font-semibold flex items-center gap-1" title="មានឯកសារ Google Drive / PDF"><i class="fa-brands fa-google-drive"></i> ឯកសារ</span>' : ''}
            ${hasQuestions ? `<span class="text-emerald-700 font-semibold flex items-center gap-1" title="មានសំណួរអនុវត្ត"><i class="fa-solid fa-list-check"></i> ${item.questions.length} សំណួរ</span>` : ''}
          </div>
        </div>

        <div class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <button 
            onclick="openDetailModal('${item.id}')"
            class="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <i class="fa-solid ${isHomework ? 'fa-file-arrow-up' : 'fa-eye'} text-xs"></i>
            <span>${isHomework ? 'មើល & ប្រគល់កិច្ចការ' : 'អានមេរៀន'}</span>
          </button>

          ${hasQuestions ? `
            <button 
              onclick="openQuizModal('${item.id}', event)"
              class="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              title="សាកល្បងធ្វើលំហាត់"
            >
              <i class="fa-solid fa-pen-nib text-xs"></i>
              <span>ធ្វើលំហាត់</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  renderMath();
}

function setTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tab;
    if (isTarget) {
      btn.className = 'tab-btn flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-blue-900 text-white shadow-md transition whitespace-nowrap';
    } else {
      btn.className = 'tab-btn flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition whitespace-nowrap';
    }
  });
  renderCards();
}

function setSubjectFilter(subjId) {
  state.selectedSubject = subjId;
  renderSubjectFilters();
  renderCards();
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderCards();
    });
  }

  const heroSearchInput = document.getElementById('heroSearchInput');
  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchInput) searchInput.value = e.target.value;
      renderCards();
    });
  }

  const gradeSelect = document.getElementById('gradeSelect');
  if (gradeSelect) {
    gradeSelect.addEventListener('change', (e) => {
      state.selectedGrade = e.target.value;
      renderCards();
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderCards();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function toggleBookmark(id, event) {
  if (event) event.stopPropagation();
  const isNowSaved = StorageManager.toggleBookmark(id);
  showToast(isNowSaved ? 'បានរក្សាទុកក្នុងបញ្ជីពេញចិត្ត!' : 'បានដកចេញពីបញ្ជីពេញចិត្ត');
  renderCards();
  renderStats();
}

// DETAIL MODAL
function openDetailModal(id) {
  const item = StorageManager.getItemById(id);
  if (!item) return;

  const currentUser = StorageManager.getCurrentUser();
  if (!currentUser) {
    openLoginModal();
    showToast('សូមចូលប្រព័ន្ធ (Login) ជាមុនសិន!', 'info');
    return;
  }
  if (!StorageManager.hasPermission('access_item', item)) {
    alert('អ្នកមានសិទ្ធិចូលមើលមេរៀន និងលំហាត់តែក្នុងថ្នាក់របស់អ្នក ឬមេរៀនដែលគ្រូបាន Assign ឱ្យប៉ុណ្ណោះ!');
    return;
  }

  state.activeItem = item;
  StorageManager.incrementViews(id);
  StorageManager.recordActivity('view_lesson', `ចូលមើលមេរៀន/លំហាត់៖ ${item.title}`, item);

  const modal = document.getElementById('detailModal');
  const modalContent = document.getElementById('detailModalContent');
  if (!modal || !modalContent) return;

  const subj = getSubjectObj(item.subject);
  const badgeColor = getSubjectBadgeClass(subj.color);
  const hasQuestions = item.questions && item.questions.length > 0;

  let videoEmbedHtml = '';
  const parsedVideo = parseVideoEmbed(item.videoUrl);
  if (parsedVideo) {
    const mediaTag = parsedVideo.kind === 'video'
      ? `<video src="${escapeHtml(parsedVideo.src)}" controls class="w-full h-full"></video>`
      : `<iframe 
            src="${escapeHtml(parsedVideo.src)}" 
            title="${escapeHtml(item.title)}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>`;

    videoEmbedHtml = `
      <div class="mb-6">
        <h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <i class="fa-solid fa-circle-play text-red-600"></i>
          វីដេអូពន្យល់មេរៀន (YouTube / Video)
        </h4>
        <div class="video-container shadow-md">
          ${mediaTag}
        </div>
      </div>
    `;
  }

  let attachmentsHtml = '';
  if (item.attachments && item.attachments.length > 0) {
    attachmentsHtml = `
      <div class="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-brands fa-google-drive text-blue-900"></i>
          ឯកសារភ្ជាប់ និងសន្លឹកកិច្ចការ (Google Drive)
        </h4>
        <div class="space-y-2.5">
          ${item.attachments.map(att => {
            const links = getDriveActionLinks(att.url);
            const safeName = escapeHtml(att.name || 'ឯកសារមេរៀន.pdf');
            const safeSize = escapeHtml(att.size || (links.isDrive ? 'Google Drive' : 'ឯកសារ'));
            return `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm">
                <div class="flex items-center gap-2.5 min-w-0">
                  <i class="fa-solid fa-file-pdf text-red-600 text-lg flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-800 truncate">${safeName}</p>
                    <span class="text-xs text-slate-400">${safeSize}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a 
                    href="${escapeHtml(links.viewUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    onclick="return handleSampleDriveLink(event, 'view', this.href, '${safeName.replace(/'/g, '')}')"
                    class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs flex items-center gap-1.5 transition border border-blue-200"
                  >
                    <i class="fa-solid fa-eye"></i>
                    <span>មើលឯកសារ</span>
                  </a>
                  <a 
                    href="${escapeHtml(links.downloadUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    onclick="return handleSampleDriveLink(event, 'download', this.href, '${safeName.replace(/'/g, '')}')"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <i class="fa-solid fa-download"></i>
                    <span>ទាញយកឯកសារ</span>
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ផ្នែកប្រគល់កិច្ចការផ្ទះ (Homework Submission) និងមើលពិន្ទុ
  const itemSubmissions = StorageManager.getSubmissions(item.id);
  const mySubmissions = currentUser ? itemSubmissions.filter(s => s.userId === currentUser.id) : [];
  const isTeacherOrAdmin = StorageManager.hasPermission('grade_homework');
  const showHomeworkSection = item.type === 'homework' || item.type === 'exercise';

  const homeworkHtml = showHomeworkSection ? `
    <div class="mt-6 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center text-base shadow-xs flex-shrink-0">
            <i class="fa-solid fa-file-arrow-up"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-sm sm:text-base">ប្រគល់កិច្ចការផ្ទះ (Submit Homework)</h4>
            <p class="text-xs text-slate-600">ដាក់ Link Google Drive កិច្ចការ ឬសរសេរចម្លើយផ្ញើជូនគ្រូស្រង់ពិន្ទុ</p>
          </div>
        </div>
        ${isTeacherOrAdmin ? `
          <button
            type="button"
            onclick="closeAllModals(); openScoreboardModal('homework');"
            class="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <i class="fa-solid fa-table-list"></i>
            <span>ពិនិត្យ &amp; ដាក់ពិន្ទុ (${itemSubmissions.length})</span>
          </button>
        ` : ''}
      </div>

      <form onsubmit="handleHomeworkSubmit(event, '${item.id}')" class="space-y-3 bg-white p-4 rounded-xl border border-indigo-100">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">តំណភ្ជាប់ Google Drive កិច្ចការរបស់អ្នក (បើមាន)</label>
          <input type="url" name="hwDriveLink" placeholder="https://drive.google.com/file/d/.../view" class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-700 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ចម្លើយ ឬកំណត់ចំណាំជូនលោកគ្រូ/អ្នកគ្រូ *</label>
          <textarea name="hwNote" rows="2" placeholder="សរសេរចម្លើយសង្ខេប ឬសំណួរ..." class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-700 focus:outline-none" required></textarea>
        </div>
        <div class="flex justify-end">
          <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <i class="fa-solid fa-paper-plane"></i>
            <span>បញ្ជូនកិច្ចការផ្ទះ</span>
          </button>
        </div>
      </form>

      ${mySubmissions.length > 0 ? `
        <div class="space-y-2">
          <p class="text-xs font-bold text-indigo-900">ប្រវត្តិការប្រគល់កិច្ចការរបស់អ្នក៖</p>
          ${mySubmissions.map(sub => `
            <div class="p-3 rounded-xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-slate-800">${escapeHtml(sub.note)}</p>
                ${sub.driveLink ? `<a href="${escapeHtml(sub.driveLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:underline break-all"><i class="fa-brands fa-google-drive mr-1"></i>${escapeHtml(sub.driveLink)}</a>` : ''}
                ${sub.feedback ? `<p class="text-emerald-800 mt-1"><i class="fa-solid fa-comment-dots mr-1"></i>មតិគ្រូ៖ ${escapeHtml(sub.feedback)}</p>` : ''}
              </div>
              <div class="flex-shrink-0">
                ${sub.status === 'graded'
                  ? `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">ពិន្ទុ៖ ${sub.score}/${sub.maxScore}</span>`
                  : `<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">រង់ចាំគ្រូដាក់ពិន្ទុ</span>`
                }
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  ` : '';

  modalContent.innerHTML = `
    <div class="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
      <div class="flex items-center justify-between gap-4 mb-3">
        <div class="flex items-center gap-3">
          <img src="${SCHOOL_INFO.logo}" alt="Logo" class="w-12 h-12 object-contain filter drop-shadow-sm flex-shrink-0" />
          <div>
            <h3 class="text-base sm:text-lg font-black text-blue-950">${SCHOOL_INFO.nameKhmer}</h3>
            <p class="text-xs text-red-600 font-bold tracking-wide">${SCHOOL_INFO.nameEnglish}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button 
            onclick="window.print()" 
            title="បោះពុម្ពឯកសារនេះ (Print)"
            class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
          >
            <i class="fa-solid fa-print"></i>
          </button>
          <button 
            onclick="closeAllModals()" 
            class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeColor}">
          <i class="fa-solid ${subj.icon} text-xs"></i>
          ${subj.name}
        </span>
        <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          ${item.grade}
        </span>
        <span class="px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
          item.type === 'homework'
            ? 'bg-purple-50 text-purple-800'
            : item.type === 'exercise'
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-blue-50 text-blue-900'
        }">
          ${item.type === 'homework' ? 'កិច្ចការផ្ទះ' : item.type === 'exercise' ? 'លំហាត់' : 'មេរៀន'}
        </span>
      </div>
      <h2 class="text-lg sm:text-2xl font-black text-slate-900 mt-2 leading-snug">${escapeHtml(item.title)}</h2>
    </div>

    <div class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
      <div class="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
            ${(item.teacher || 'គ្រូ').charAt(0)}
          </div>
          <div>
            <p class="font-bold text-slate-900">${item.teacher || 'គ្រូបង្រៀន'}</p>
            <p class="text-xs text-slate-500">${item.school || SCHOOL_INFO.nameKhmer} • កាលបរិច្ឆេទ៖ ${item.createdAt || 'ថ្មីៗ'}</p>
          </div>
        </div>
        <div class="text-right text-xs text-slate-500 hidden sm:block">
          <p><i class="fa-regular fa-eye mr-1"></i> ${item.views || 1} ទស្សនា</p>
        </div>
      </div>

      ${videoEmbedHtml}

      <div class="markdown-body text-slate-800 leading-relaxed bg-white rounded-xl">
        ${parseMarkdown(item.content)}
      </div>

      ${attachmentsHtml}

      ${homeworkHtml}

      ${hasQuestions ? `
        <div class="mt-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-md">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900">មានលំហាត់អនុវត្តចំនួន ${item.questions.length} សំណួរ</h4>
              <p class="text-xs text-slate-600">សាកល្បងដោះស្រាយសំណួរ និងផ្ទៀងផ្ទាត់ពិន្ទុភ្លាមៗ</p>
            </div>
          </div>
          <button 
            onclick="closeAllModals(); openQuizModal('${item.id}');"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i class="fa-solid fa-pen-nib"></i>
            <span>ចាប់ផ្ដើមធ្វើលំហាត់</span>
          </button>
        </div>
      ` : ''}

      <div id="detailForumSection" class="mt-8">
        ${buildForumSectionHtml(item)}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  renderMath();
}

// QUIZ MODAL
function openQuizModal(id, event) {
  if (event) event.stopPropagation();
  const currentUser = StorageManager.getCurrentUser();
  if (!currentUser) {
    openLoginModal();
    showToast('សូមចូលប្រព័ន្ធ (Login) ជាមុនសិន!', 'info');
    return;
  }

  const item = StorageManager.getItemById(id);
  if (!item || !item.questions || item.questions.length === 0) {
    alert('មេរៀននេះមិនទាន់មានសំណួរអនុវត្តនៅឡើយទេ!');
    return;
  }
  if (!StorageManager.hasPermission('take_quiz', item)) {
    alert('អ្នកមានសិទ្ធិធ្វើលំហាត់តែក្នុងថ្នាក់របស់អ្នក ឬលំហាត់ដែលគ្រូបាន Assign ឱ្យប៉ុណ្ណោះ!');
    return;
  }

  state.activeItem = item;
  state.quizAnswers = {};
  state.quizSubmitted = false;
  state.quizStartedAt = Date.now();

  renderQuizUI();

  const modal = document.getElementById('quizModal');
  if (modal) modal.classList.remove('hidden');
}

function renderQuizUI() {
  const item = state.activeItem;
  if (!item) return;

  const modalContent = document.getElementById('quizModalContent');
  if (!modalContent) return;

  const subj = getSubjectObj(item.subject);
  const questions = item.questions;

  modalContent.innerHTML = `
    <div class="p-6 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
            <i class="fa-solid fa-pen-nib mr-1"></i> កម្រងលំហាត់អនុវត្ត
          </span>
          <span class="text-xs text-slate-500 font-medium">${subj.name} • ${item.grade}</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-slate-900">${item.title}</h3>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <div class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto" id="quizQuestionsContainer">
      ${questions.map((q, qIndex) => {
        const selected = state.quizAnswers[qIndex];
        const isSubmitted = state.quizSubmitted;
        const isCorrect = isSubmitted && selected === q.answer;

        return `
          <div class="p-5 rounded-2xl border ${
            isSubmitted 
              ? (isCorrect ? 'bg-emerald-50/60 border-emerald-300' : 'bg-rose-50/60 border-rose-300')
              : 'bg-white border-slate-200 shadow-xs'
          }">
            <div class="flex items-start justify-between gap-3 mb-4">
              <h4 class="font-bold text-slate-900 text-base leading-relaxed flex items-start gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                  ${qIndex + 1}
                </span>
                <span>${q.question}</span>
              </h4>

              ${isSubmitted ? `
                <span class="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }">
                  <i class="fa-solid ${isCorrect ? 'fa-check' : 'fa-xmark'}"></i>
                  ${isCorrect ? 'ត្រឹមត្រូវ' : 'ខុស'}
                </span>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 gap-2.5">
              ${q.options.map((opt, optIndex) => {
                const isThisSelected = selected === optIndex;
                let optionStyle = 'bg-slate-50 border-slate-200 hover:bg-blue-50/60 hover:border-blue-300 text-slate-700';

                if (isSubmitted) {
                  if (optIndex === q.answer) {
                    optionStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isThisSelected && !isCorrect) {
                    optionStyle = 'bg-rose-100 border-rose-400 text-rose-800';
                  } else {
                    optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isThisSelected) {
                  optionStyle = 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-2 ring-blue-600/20';
                }

                const letter = String.fromCharCode(65 + optIndex);

                return `
                  <button 
                    type="button"
                    ${isSubmitted ? 'disabled' : ''}
                    onclick="selectQuizOption(${qIndex}, ${optIndex})"
                    class="w-full text-left p-3.5 rounded-xl border transition flex items-center gap-3 ${optionStyle}"
                  >
                    <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isThisSelected ? 'bg-blue-900 text-white' : 'bg-white border border-slate-300 text-slate-600'
                    }">
                      ${letter}
                    </span>
                    <span class="flex-1 text-sm">${opt}</span>
                  </button>
                `;
              }).join('')}
            </div>

            ${isSubmitted ? `
              <div class="mt-4 p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm">
                <p class="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <i class="fa-solid fa-lightbulb text-amber-500"></i>
                  ដំណោះស្រាយ និងការពន្យល់លម្អិត៖
                </p>
                <p class="text-slate-600 leading-relaxed">${q.explanation || 'ចម្លើយត្រឹមត្រូវគឺជម្រើស ' + String.fromCharCode(65 + q.answer)}</p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}

      <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        ${state.quizSubmitted ? `
          <div id="quizScoreResult" class="flex items-center gap-3"></div>
          <button 
            onclick="retryQuiz()"
            class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm transition flex items-center gap-2"
          >
            <i class="fa-solid fa-rotate-right"></i>
            <span>ធ្វើលំហាត់ឡើងវិញ</span>
          </button>
        ` : `
          <p class="text-xs text-slate-500">
            សូមជ្រើសរើសចម្លើយឱ្យបានគ្រប់សំណួរ មុនពេលចុចបញ្ជូនផ្ទៀងផ្ទាត់។
          </p>
          <button 
            onclick="submitQuiz()"
            class="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            <i class="fa-solid fa-paper-plane"></i>
            <span>បញ្ជូនចម្លើយ និងមើលពិន្ទុ</span>
          </button>
        `}
      </div>
    </div>
  `;

  renderMath();
}

function selectQuizOption(qIndex, optIndex) {
  state.quizAnswers[qIndex] = optIndex;
  renderQuizUI();
}

function submitQuiz() {
  const item = state.activeItem;
  if (!item || !item.questions) return;

  const total = item.questions.length;
  const answeredCount = Object.keys(state.quizAnswers).length;

  if (answeredCount < total) {
    if (!confirm(`អ្នកឆ្លើយបានតែ ${answeredCount}/${total} សំណួរប៉ុណ្ណោះ។ តើអ្នកពិតជាចង់ផ្ទៀងផ្ទាត់ចម្លើយឥឡូវនេះមែនទេ?`)) {
      return;
    }
  }

  let score = 0;
  const wrongIndices = [];
  const wrongTexts = [];
  item.questions.forEach((q, idx) => {
    if (state.quizAnswers[idx] === q.answer) {
      score++;
    } else {
      wrongIndices.push(idx);
      wrongTexts.push(q.question || `សំណួរទី ${idx + 1}`);
    }
  });

  const durationSeconds = state.quizStartedAt
    ? Math.max(1, Math.round((Date.now() - state.quizStartedAt) / 1000))
    : 0;

  state.quizSubmitted = true;
  StorageManager.saveQuizResult(item.id, score, total, {
    assessmentType: item.assessmentType || 'lesson_quiz',
    wrongQuestionIndices: wrongIndices,
    wrongQuestionTexts: wrongTexts,
    durationSeconds
  });
  renderStats();
  renderPlpRoleBar();
  renderQuizUI();

  const scoreContainer = document.getElementById('quizScoreResult');
  if (scoreContainer) {
    const percent = Math.round((score / total) * 100);
    let message = 'ព្យាយាមបន្តទៀត!';
    let badgeColor = 'bg-amber-100 text-amber-800';

    if (percent >= 80) {
      message = 'ពូកែណាស់! លទ្ធផលល្អឥតខ្ចោះ 🎉';
      badgeColor = 'bg-emerald-100 text-emerald-800';
    } else if (percent >= 50) {
      message = 'ល្អប្រសើរ! 👍';
      badgeColor = 'bg-blue-100 text-blue-900';
    }

    scoreContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl font-black text-slate-900">${score} / ${total}</span>
        <span class="px-3 py-1 rounded-full text-xs font-bold ${badgeColor}">
          ${percent}% - ${message}
        </span>
      </div>
    `;
  }
}

function retryQuiz() {
  state.quizAnswers = {};
  state.quizSubmitted = false;
  renderQuizUI();
}

// TEACHER ADD / EDIT MODAL
function renderAssignStudentsCheckboxes(selectedIds = []) {
  const container = document.getElementById('assignStudentsCheckboxes');
  if (!container) return;
  const students = StorageManager.getUsers().filter(u => u.role === 'student');
  if (students.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-500">មិនទាន់មានគណនីសិស្សនៅឡើយទេ</span>';
    return;
  }
  const selectedSet = new Set(selectedIds || []);
  container.innerHTML = students.map(s => `
    <label class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs cursor-pointer hover:bg-indigo-50 transition">
      <input type="checkbox" name="assignStudentIds" value="${escapeHtml(s.id)}" ${selectedSet.has(s.id) ? 'checked' : ''} class="rounded text-indigo-700 focus:ring-indigo-600" />
      <span class="font-semibold text-slate-800">${escapeHtml(s.name)}</span>
      <span class="text-[10px] text-slate-400">(${escapeHtml(s.grade)})</span>
    </label>
  `).join('');
}

function openAddModal() {
  if (!StorageManager.hasPermission('create_lesson')) {
    alert('មានតែគណនីគ្រូបង្រៀន ប្រធានផ្នែក ឬ Admin ប៉ុណ្ណោះដែលមានសិទ្ធិបន្ថែមមេរៀន/លំហាត់!');
    return;
  }

  state.editingItemId = null;
  const modal = document.getElementById('editModal');
  const title = document.getElementById('editModalTitle');
  const form = document.getElementById('itemForm');
  if (!modal || !form) return;

  if (title) title.textContent = 'បង្កើតមេរៀន ឬលំហាត់ថ្មី - សាលាអន្តរជាតិ ហេមតុន';
  form.reset();

  const currentUser = StorageManager.getCurrentUser();
  if (currentUser && currentUser.name && form.itemTeacher) {
    form.itemTeacher.value = currentUser.name;
  }

  populateTeacherGradeSelect('ថ្នាក់ទី១');
  renderAssignStudentsCheckboxes([]);
  renderQuestionBuilder([]);

  modal.classList.remove('hidden');
}

function openEditModal(id, event) {
  if (event) event.stopPropagation();
  const item = StorageManager.getItemById(id);
  if (!item) return;

  if (!StorageManager.hasPermission('edit_lesson', item)) {
    alert('លោកអ្នកមិនមានសិទ្ធិកែប្រែមេរៀននេះទេ!');
    return;
  }

  state.editingItemId = id;
  const modal = document.getElementById('editModal');
  const title = document.getElementById('editModalTitle');
  const form = document.getElementById('itemForm');
  if (!modal || !form) return;

  if (title) title.textContent = 'កែសម្រួលមេរៀន / លំហាត់';

  form.itemType.value = item.type || 'lesson';
  form.itemSubject.value = item.subject || 'khmer';
  if (form.itemAssessmentType) {
    form.itemAssessmentType.value = item.assessmentType || 'lesson_quiz';
  }
  populateTeacherGradeSelect(item.grade || 'ថ្នាក់ទី១');
  form.itemTeacher.value = item.teacher || '';
  form.itemTitle.value = item.title || '';
  form.itemSummary.value = item.summary || '';
  form.itemVideoUrl.value = item.videoUrl || '';
  if (form.itemDriveName) {
    form.itemDriveName.value = (item.attachments && item.attachments[0] && item.attachments[0].name) || '';
  }
  if (form.itemDriveUrl) {
    const existingUrl = (item.attachments && item.attachments[0] && item.attachments[0].url) || '';
    form.itemDriveUrl.value = existingUrl === '#' ? '' : existingUrl;
  }
  form.itemContent.value = item.content || '';

  renderAssignStudentsCheckboxes(item.assignedStudentIds || []);
  renderQuestionBuilder(item.questions || []);

  modal.classList.remove('hidden');
}

function renderQuestionBuilder(questions = []) {
  const container = document.getElementById('questionsBuilderContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
        <i class="fa-solid fa-list-check text-blue-900"></i>
        សំណួរពហុជ្រើសរើស (លំហាត់អនុវត្ត)
      </h4>
      <button 
        type="button" 
        onclick="addQuestionRow()"
        class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition flex items-center gap-1"
      >
        <i class="fa-solid fa-plus text-xs"></i> បន្ថែមសំណួរ
      </button>
    </div>
    <div id="questionRows" class="space-y-4">
      ${questions.map((q, idx) => createQuestionRowHtml(idx, q)).join('')}
    </div>
  `;
}

function createQuestionRowHtml(index, q = { question: '', options: ['', '', '', ''], answer: 0, explanation: '' }) {
  const opts = q.options && q.options.length >= 4 ? q.options : ['', '', '', ''];
  return `
    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 relative question-row" data-index="${index}">
      <button 
        type="button" 
        onclick="this.closest('.question-row').remove()" 
        class="absolute top-3 right-3 text-slate-400 hover:text-red-600 text-sm"
        title="លុបសំណួរនេះ"
      >
        <i class="fa-solid fa-trash-can"></i>
      </button>

      <div class="mb-3 pr-6">
        <label class="block text-xs font-bold text-slate-700 mb-1">សំណួរទី ${index + 1}៖</label>
        <input 
          type="text" 
          name="q_text_${index}" 
          value="${(q.question || '').replace(/"/g, '&quot;')}" 
          placeholder="បញ្ចូលសំណួរនៅទីនេះ..." 
          class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none" 
          required
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        ${[0, 1, 2, 3].map(optIdx => `
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">
              ជម្រើស ${String.fromCharCode(65 + optIdx)}៖
            </label>
            <input 
              type="text" 
              name="q_opt_${index}_${optIdx}" 
              value="${(opts[optIdx] || '').replace(/"/g, '&quot;')}" 
              placeholder="ជម្រើស ${String.fromCharCode(65 + optIdx)}" 
              class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
              required
            />
          </div>
        `).join('')}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div class="sm:col-span-1">
          <label class="block text-[11px] font-bold text-slate-700 mb-0.5">ចម្លើយត្រឹមត្រូវ៖</label>
          <select 
            name="q_ans_${index}" 
            class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
          >
            <option value="0" ${q.answer === 0 ? 'selected' : ''}>ជម្រើស A</option>
            <option value="1" ${q.answer === 1 ? 'selected' : ''}>ជម្រើស B</option>
            <option value="2" ${q.answer === 2 ? 'selected' : ''}>ជម្រើស C</option>
            <option value="3" ${q.answer === 3 ? 'selected' : ''}>ជម្រើស D</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="block text-[11px] font-semibold text-slate-600 mb-0.5">ដំណោះស្រាយពន្យល់៖</label>
          <input 
            type="text" 
            name="q_exp_${index}" 
            value="${(q.explanation || '').replace(/"/g, '&quot;')}" 
            placeholder="ពន្យល់ពីរបៀបដោះស្រាយ..." 
            class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
      </div>
    </div>
  `;
}

function addQuestionRow() {
  const container = document.getElementById('questionRows');
  if (!container) return;
  const count = container.querySelectorAll('.question-row').length;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = createQuestionRowHtml(count);
  container.appendChild(tempDiv.firstElementChild);
}

function handleItemFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const questionRows = document.querySelectorAll('#questionRows .question-row');
  const questions = [];

  questionRows.forEach((row, idx) => {
    const qText = row.querySelector(`[name^="q_text_"]`)?.value || '';
    const opt0 = row.querySelector(`[name$="_0"]`)?.value || '';
    const opt1 = row.querySelector(`[name$="_1"]`)?.value || '';
    const opt2 = row.querySelector(`[name$="_2"]`)?.value || '';
    const opt3 = row.querySelector(`[name$="_3"]`)?.value || '';
    const ans = parseInt(row.querySelector(`[name^="q_ans_"]`)?.value || '0', 10);
    const exp = row.querySelector(`[name^="q_exp_"]`)?.value || '';

    if (qText.trim()) {
      questions.push({
        question: qText.trim(),
        options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
        answer: ans,
        explanation: exp.trim()
      });
    }
  });

  const selectedGrade = form.itemGrade.value;
  let program = 'khmer_primary';
  if (selectedGrade.includes('មត្តេយ្យ')) program = 'khmer_kg';
  else if (['Pre-Nursery', 'Nursery', 'K1', 'K2', 'K3', 'K4'].includes(selectedGrade)) program = 'english_ey';
  else if (['Primary 1', 'Primary 2', 'Primary 3', 'GEP 1', 'GEP 2', 'GEP 3'].includes(selectedGrade)) program = 'english_pri';
  else if (selectedGrade === 'ថ្នាក់ក្រៅម៉ោង ភាសាអង់គ្លេស') program = 'parttime_en';
  else if (selectedGrade === 'ថ្នាក់ក្រៅម៉ោង ភាសាចិន') program = 'parttime_zh';

  const parsedVid = parseVideoEmbed(form.itemVideoUrl.value);
  const driveName = form.itemDriveName ? form.itemDriveName.value.trim() : '';
  const driveUrl = form.itemDriveUrl ? form.itemDriveUrl.value.trim() : '';
  const attachments = (driveName || driveUrl)
    ? [{
        name: driveName || 'ឯកសារមេរៀន_Google_Drive.pdf',
        size: driveUrl ? 'Google Drive' : 'ឯកសារគំរូ',
        url: driveUrl || '#'
      }]
    : [];

  const assignedStudentIds = Array.from(document.querySelectorAll('#assignStudentsCheckboxes input[name="assignStudentIds"]:checked'))
    .map(cb => cb.value);

  const itemData = {
    type: form.itemType.value,
    assessmentType: form.itemAssessmentType ? form.itemAssessmentType.value : 'lesson_quiz',
    title: form.itemTitle.value.trim(),
    subject: form.itemSubject.value,
    grade: selectedGrade,
    program: program,
    teacher: form.itemTeacher.value.trim() || 'លោកគ្រូ/អ្នកគ្រូ',
    school: SCHOOL_INFO.nameKhmer,
    summary: form.itemSummary.value.trim(),
    videoUrl: parsedVid ? parsedVid.src : form.itemVideoUrl.value.trim(),
    content: form.itemContent.value.trim(),
    assignedStudentIds,
    attachments,
    questions: questions
  };

  if (state.editingItemId) {
    const updated = StorageManager.updateItem(state.editingItemId, itemData);
    StorageManager.recordActivity('edit_lesson', `កែសម្រួលមេរៀន៖ ${itemData.title}`, updated);
    showToast('បានកែសម្រួលមេរៀនដោយជោគជ័យ!', 'success');
  } else {
    const created = StorageManager.addItem(itemData);
    StorageManager.recordActivity('create_lesson', `បង្កើតមេរៀនថ្មី (${selectedGrade})៖ ${itemData.title}`, created);
    showToast('បានបន្ថែមមេរៀនថ្មីដោយជោគជ័យ!', 'success');
  }

  closeAllModals();
  renderCards();
  renderSubjectFilters();
  renderStats();
}

function confirmDeleteItem(id, event) {
  if (event) event.stopPropagation();
  const item = StorageManager.getItemById(id);
  if (!item) return;

  if (!StorageManager.hasPermission('delete_lesson', item)) {
    alert('លោកអ្នកមិនមានសិទ្ធិលុបមេរៀននេះទេ!');
    return;
  }

  if (confirm(`តើលោកអ្នកពិតជាចង់លុប "${item.title}" មែនទេ?`)) {
    StorageManager.deleteItem(id);
    showToast('បានលុបមេរៀនរួចរាល់');
    renderCards();
    renderSubjectFilters();
    renderStats();
  }
}

// ================= HOMEWORK SUBMISSION & SCOREBOARD =================
function handleHomeworkSubmit(e, itemId) {
  e.preventDefault();
  const form = e.target;
  const driveLink = form.hwDriveLink ? form.hwDriveLink.value.trim() : '';
  const note = form.hwNote ? form.hwNote.value.trim() : '';

  if (!note && !driveLink) {
    alert('សូមបញ្ចូលចម្លើយ ឬ Link Google Drive កិច្ចការរបស់អ្នក!');
    return;
  }

  StorageManager.addSubmission({ itemId, driveLink, note });
  showToast('បានបញ្ជូនកិច្ចការផ្ទះដោយជោគជ័យ!', 'success');
  openDetailModal(itemId);
}

function openScoreboardModal(activeTab = 'quizzes') {
  if (!StorageManager.hasPermission('view_scoreboard')) {
    alert('មានតែគណនីគ្រូបង្រៀន ប្រធានផ្នែក ឬ Admin ប៉ុណ្ណោះដែលអាចមើលតារាងស្រង់ពិន្ទុបាន!');
    return;
  }

  const modal = document.getElementById('scoreboardModal');
  const content = document.getElementById('scoreboardModalContent');
  if (!modal || !content) return;

  const currentUser = StorageManager.getCurrentUser();
  const quizHistory = StorageManager.getQuizHistory();
  const submissions = StorageManager.getSubmissions();
  const activityLogs = StorageManager.getActivityLogs();
  const allUsers = StorageManager.getUsers();
  const allItems = StorageManager.getItems();

  const canMonitorTeachers = StorageManager.hasPermission('view_teacher_monitor');
  const teachers = allUsers.filter(u => u.role === 'teacher');
  const teacherSummaryHtml = canMonitorTeachers ? `
    <div class="mb-5 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
      <h4 class="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2.5 flex items-center gap-1.5">
        <i class="fa-solid fa-user-tie"></i>
        សង្ខេបការត្រួតពិនិត្យគ្រូបង្រៀន (Teacher Monitoring)
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        ${teachers.map(t => {
          const count = allItems.filter(i => i.createdById === t.id || i.teacher === t.name).length;
          return `
            <div class="p-3 rounded-xl bg-white border border-purple-100 text-xs flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <p class="font-bold text-slate-900 truncate">${escapeHtml(t.name)}</p>
                <p class="text-[11px] text-slate-500 truncate">${escapeHtml(t.grade || '')}</p>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold flex-shrink-0">${count} មេរៀន</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  content.innerHTML = `
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-indigo-700 text-white flex items-center justify-center text-lg shadow-sm">
          <i class="fa-solid fa-table-list"></i>
        </div>
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-800">តារាងស្រង់ពិន្ទុ &amp; កំណត់ត្រាសកម្មភាព</span>
          <h3 class="text-lg font-black text-slate-900">លទ្ធផលប្រឡង កិច្ចការផ្ទះ និង System Records</h3>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="exportScoreboardCsv()" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
          <i class="fa-solid fa-file-csv"></i>
          <span>ទាញយក CSV (Excel)</span>
        </button>
        <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div class="px-6 pt-4 border-b border-slate-200 flex items-center gap-2 bg-white overflow-x-auto">
      <button onclick="openScoreboardModal('quizzes')" class="px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'quizzes' ? 'border-blue-900 text-blue-900 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i class="fa-solid fa-pen-nib mr-1"></i> ពិន្ទុ Quiz / ប្រឡង (${quizHistory.length})
      </button>
      <button onclick="openScoreboardModal('homework')" class="px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'homework' ? 'border-indigo-700 text-indigo-800 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i class="fa-solid fa-file-signature mr-1"></i> កិច្ចការផ្ទះសិស្ស (${submissions.length})
      </button>
      <button onclick="openScoreboardModal('records')" class="px-4 py-2 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'records' ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i class="fa-solid fa-clock-rotate-left mr-1"></i> កំណត់ត្រាប្រព័ន្ធ (${activityLogs.length})
      </button>
    </div>

    <div class="p-6 overflow-y-auto flex-1">
      ${teacherSummaryHtml}
      ${activeTab === 'quizzes' ? (
        quizHistory.length === 0
          ? `<div class="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">មិនទាន់មានទិន្នន័យសិស្សធ្វើតេស្ត ឬប្រឡងនៅឡើយទេ។</div>`
          : `<div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr class="bg-slate-100 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <th class="p-3">#</th>
                    <th class="p-3">សិស្ស / អ្នកប្រើ</th>
                    <th class="p-3">មេរៀន / តេស្ត</th>
                    <th class="p-3">កម្រិតថ្នាក់</th>
                    <th class="p-3">ពិន្ទុ</th>
                    <th class="p-3">ភាគរយ</th>
                    <th class="p-3">កាលបរិច្ឆេទ</th>
                  </tr>
                </thead>
                <tbody>
                  ${quizHistory.map((rec, i) => `
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="p-3 text-slate-400 font-mono">${i + 1}</td>
                      <td class="p-3 font-bold text-slate-900">${escapeHtml(rec.userName || 'សិស្ស')}</td>
                      <td class="p-3 text-slate-700 max-w-xs truncate">${escapeHtml(rec.itemTitle || 'លំហាត់')}</td>
                      <td class="p-3 text-slate-600">${escapeHtml(rec.itemGrade || '-')}</td>
                      <td class="p-3 font-black text-slate-900">${rec.score} / ${rec.total}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-xs font-bold ${(rec.percentage || 0) >= 80 ? 'bg-emerald-100 text-emerald-800' : (rec.percentage || 0) >= 50 ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-800'}">
                          ${rec.percentage || 0}%
                        </span>
                      </td>
                      <td class="p-3 text-slate-400 text-xs">${rec.completedAt ? rec.completedAt.split('T')[0] : '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>`
      ) : activeTab === 'homework' ? (
        submissions.length === 0
          ? `<div class="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">មិនទាន់មានសិស្សប្រគល់កិច្ចការផ្ទះនៅឡើយទេ។</div>`
          : `<div class="space-y-3">
              ${submissions.map(sub => `
                <div class="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-slate-900 text-sm">${escapeHtml(sub.userName)}</span>
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">${escapeHtml(sub.itemGrade || sub.userGrade || '')}</span>
                      <span class="text-[11px] text-slate-400">${sub.submittedAt ? sub.submittedAt.split('T')[0] : ''}</span>
                    </div>
                    <p class="text-xs font-semibold text-indigo-900">${escapeHtml(sub.itemTitle)}</p>
                    <p class="text-xs text-slate-700">${escapeHtml(sub.note)}</p>
                    ${sub.driveLink ? `<a href="${escapeHtml(sub.driveLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline break-all"><i class="fa-brands fa-google-drive"></i> ${escapeHtml(sub.driveLink)}</a>` : ''}
                    ${sub.feedback ? `<p class="text-xs text-emerald-800"><i class="fa-solid fa-comment-dots mr-1"></i> មតិគ្រូ៖ ${escapeHtml(sub.feedback)}</p>` : ''}
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    ${sub.status === 'graded'
                      ? `<span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">ពិន្ទុ៖ ${sub.score}/${sub.maxScore}</span>`
                      : `<span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">រង់ចាំដាក់ពិន្ទុ</span>`
                    }
                    <button onclick="gradeHomeworkPrompt('${sub.id}')" class="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition">
                      <i class="fa-solid fa-pen mr-1"></i> ដាក់ពិន្ទុ
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>`
      ) : (
        activityLogs.length === 0
          ? `<div class="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">មិនទាន់មានកំណត់ត្រាសកម្មភាពនៅឡើយទេ។</div>`
          : `<div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-100 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <th class="p-3">ពេលវេលា</th>
                    <th class="p-3">អ្នកប្រើ</th>
                    <th class="p-3">តួនាទី</th>
                    <th class="p-3">សកម្មភាពដែលបានកត់ត្រា</th>
                  </tr>
                </thead>
                <tbody>
                  ${activityLogs.slice(0, 80).map(log => {
                    const meta = ROLE_META[log.userRole] || ROLE_META.student;
                    return `
                      <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="p-3 font-mono text-slate-400 whitespace-nowrap">${escapeHtml((log.timestamp || '').replace('T', ' ').slice(0, 16))}</td>
                        <td class="p-3 font-bold text-slate-900 whitespace-nowrap">${escapeHtml(log.userName)}</td>
                        <td class="p-3 whitespace-nowrap"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badge}">${escapeHtml(meta.short)}</span></td>
                        <td class="p-3 text-slate-700">${escapeHtml(log.details)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>`
      )}
    </div>
  `;

  modal.classList.remove('hidden');
}

function gradeHomeworkPrompt(submissionId) {
  const scoreStr = prompt('បញ្ចូលពិន្ទុសិស្ស (លើ ១០០)៖', '90');
  if (scoreStr === null) return;
  const score = parseFloat(scoreStr);
  if (Number.isNaN(score) || score < 0 || score > 100) {
    alert('សូមបញ្ចូលពិន្ទុជាលេខចន្លោះពី 0 ដល់ 100!');
    return;
  }
  const feedback = prompt('មតិយោបល់របស់លោកគ្រូ/អ្នកគ្រូ (បើមាន)៖', 'ធ្វើបានល្អណាស់!') || '';
  StorageManager.gradeSubmission(submissionId, score, 100, feedback);
  showToast('បានរក្សាទុកពិន្ទុកិច្ចការផ្ទះរួចរាល់!', 'success');
  openScoreboardModal('homework');
}

function exportScoreboardCsv() {
  const quizHistory = StorageManager.getQuizHistory();
  const submissions = StorageManager.getSubmissions();
  const rows = [['Type', 'Student', 'Item', 'Grade', 'Score', 'Max', 'Percent', 'Date', 'LinkOrFeedback']];

  quizHistory.forEach(r => {
    rows.push(['Quiz/Exam', r.userName || '', r.itemTitle || '', r.itemGrade || '', r.score, r.total, `${r.percentage || 0}%`, (r.completedAt || '').split('T')[0], '']);
  });
  submissions.forEach(s => {
    const pct = s.score !== null ? `${Math.round((s.score / (s.maxScore || 100)) * 100)}%` : 'Pending';
    rows.push(['Homework', s.userName || '', s.itemTitle || '', s.itemGrade || '', s.score ?? '', s.maxScore || 100, pct, (s.submittedAt || '').split('T')[0], s.driveLink || s.feedback || '']);
  });

  const csv = '\uFEFF' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hampton_scoreboard_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('បានទាញយកតារាងពិន្ទុ CSV ដោយជោគជ័យ!', 'success');
}

// ================= FEATURED YOUTUBE & GOOGLE DRIVE SHOWCASE =================
const DEFAULT_FEATURED_MEDIA = {
  title: 'មេរៀនគណិតវិទ្យាគំរូ និងសន្លឹកកិច្ចការសិស្ស',
  youtubeUrl: 'https://www.youtube.com/embed/FE-40gqhuHg',
  driveName: 'សន្លឹកកិច្ចការមេរៀន_និង_លំហាត់_គំរូ.pdf',
  driveUrl: 'https://drive.google.com/file/d/SAMPLE_FILE_ID/view'
};

function applyFeaturedMedia() {
  const saved = StorageManager.getFeaturedMedia() || DEFAULT_FEATURED_MEDIA;
  const iframe = document.getElementById('featuredYoutubeIframe');
  const titleEl = document.getElementById('featuredVideoTitle');
  const docNameEl = document.getElementById('featuredDriveDocName');
  const viewBtn = document.getElementById('featuredDriveViewBtn');
  const dlBtn = document.getElementById('featuredDriveDownloadBtn');

  const parsed = parseVideoEmbed(saved.youtubeUrl || DEFAULT_FEATURED_MEDIA.youtubeUrl);
  if (iframe && parsed && parsed.src) iframe.src = parsed.src;
  if (titleEl) titleEl.textContent = saved.title || DEFAULT_FEATURED_MEDIA.title;
  if (docNameEl) docNameEl.textContent = saved.driveName || DEFAULT_FEATURED_MEDIA.driveName;

  const links = getDriveActionLinks(saved.driveUrl || DEFAULT_FEATURED_MEDIA.driveUrl);
  if (viewBtn) viewBtn.href = links.viewUrl;
  if (dlBtn) dlBtn.href = links.downloadUrl;
}

function openFeaturedEditModal() {
  const current = StorageManager.getFeaturedMedia() || DEFAULT_FEATURED_MEDIA;
  const modal = document.getElementById('featuredEditModal');
  const form = document.getElementById('featuredEditForm');
  if (!modal || !form) return;

  form.featTitle.value = current.title || '';
  form.featYoutube.value = current.youtubeUrl || '';
  form.featDriveName.value = current.driveName || '';
  form.featDriveUrl.value = current.driveUrl || '';
  modal.classList.remove('hidden');
}

function handleFeaturedEditSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const parsed = parseVideoEmbed(form.featYoutube.value);
  if (!parsed) {
    alert('សូមបញ្ចូល Link YouTube ឬកូដ <iframe> ឱ្យបានត្រឹមត្រូវ!');
    return;
  }

  StorageManager.saveFeaturedMedia({
    title: form.featTitle.value.trim(),
    youtubeUrl: parsed.src,
    driveName: form.featDriveName.value.trim() || 'ឯកសារមេរៀន_Google_Drive.pdf',
    driveUrl: form.featDriveUrl.value.trim()
  });
  applyFeaturedMedia();
  closeAllModals();
  showToast('បានអាប់ដេតវីដេអូ YouTube និង Google Drive ទំព័រដើម!', 'success');
}

function resetFeaturedMediaUI() {
  StorageManager.resetFeaturedMedia();
  applyFeaturedMedia();
  closeAllModals();
  showToast('បានត្រឡប់ទៅគំរូដើមវិញរួចរាល់!');
}

// BACKUP & SETTINGS
function openBackupModal() {
  if (!StorageManager.hasPermission('backup_system')) {
    alert('មានតែគណនី Admin ប៉ុណ្ណោះដែលអាចគ្រប់គ្រង Backup ប្រព័ន្ធបាន!');
    return;
  }
  const modal = document.getElementById('backupModal');
  if (modal) modal.classList.remove('hidden');
}

function handleExportData() {
  StorageManager.exportData();
  showToast('បានទាញយកឯកសារ Backup ដោយជោគជ័យ!');
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const res = StorageManager.importData(e.target.result);
    if (res.success) {
      showToast(`បញ្ចូលទិន្នន័យបានជោគជ័យ! (${res.count} មេរៀន/លំហាត់)`, 'success');
      closeAllModals();
      renderCards();
      renderSubjectFilters();
      renderStats();
      renderUserNav();
    } else {
      alert('កំហុសក្នុងការបញ្ចូលទិន្នន័យ៖ ' + res.message);
    }
  };
  reader.readAsText(file);
}

function handleResetDefaults() {
  if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញទៅជាគំរូដើមរបស់សាលាអន្តរជាតិ ហេមតុន មែនទេ?')) {
    StorageManager.resetToDefault();
    showToast('បានកំណត់ទិន្នន័យគំរូឡើងវិញរួចរាល់!');
    closeAllModals();
    renderUserNav();
    renderGradeFilter();
    renderSubjectFilters();
    renderStats();
    renderCards();
  }
}

function closeAllModals() {
  document.querySelectorAll('.app-modal').forEach(m => m.classList.add('hidden'));
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  if (!toast || !toastText) return;

  toastText.textContent = message;

  if (toastIcon) {
    if (type === 'success') {
      toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
    } else {
      toastIcon.className = 'fa-solid fa-circle-info text-blue-400 text-lg';
    }
  }

  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3200);
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.getItems(); // trigger seed
  StorageManager.getUsers(); // trigger users seed
  applyFeaturedMedia();
  renderUserNav();
  renderProgramTabs();
  renderSubjectFilters();
  renderGradeFilter();
  renderStats();
  renderCards();
  setupEventListeners();

  const featuredForm = document.getElementById('featuredEditForm');
  if (featuredForm) {
    featuredForm.addEventListener('submit', handleFeaturedEditSubmit);
  }

  const form = document.getElementById('itemForm');
  if (form) {
    form.addEventListener('submit', handleItemFormSubmit);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  const adminCreateUserForm = document.getElementById('adminCreateUserForm');
  if (adminCreateUserForm) {
    adminCreateUserForm.addEventListener('submit', handleAdminCreateUser);
  }
});

// ================= MOEYS PLP (Primary Learning Platform) MANAGEMENT MODULES =================

/**
 * Generates a deterministic crisp SVG QR-style pass pattern without external CDN calls.
 */
function generateQrSvg(code, size = 104) {
  const clean = String(code || 'HPT-QR');
  const cells = 15;
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 5 && c >= bc && c < bc + 5;
    const isBorder = (br, bc) => (r === br || r === br + 4 || c === bc || c === bc + 4);
    const isCore = (br, bc) => r >= br + 2 && r <= br + 2 && c >= bc + 2 && c <= bc + 2;
    const check = (br, bc) => inBox(br, bc) && (isBorder(br, bc) || isCore(br, bc));
    return check(0, 0) || check(0, cells - 5) || check(cells - 5, 0);
  };

  const inFinderArea = (r, c) =>
    (r < 6 && c < 6) || (r < 6 && c >= cells - 6) || (r >= cells - 6 && c < 6);

  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      let dark = false;
      if (inFinderArea(r, c)) {
        dark = isFinder(r, c);
      } else {
        const bitHash = (hash ^ Math.imul(r + 11, 73856093) ^ Math.imul(c + 17, 19349663)) >>> 0;
        dark = (bitHash % 10) < 5;
      }
      if (dark) {
        rects.push(`<rect x="${c + 1}" y="${r + 1}" width="1" height="1" rx="0.15" fill="#0f172a"/>`);
      }
    }
  }
  const view = cells + 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${view} ${view}" class="rounded-xl border border-slate-200 bg-white p-1">${rects.join('')}</svg>`;
}

/**
 * Renders the PLP Management Hub Bar directly under the Hero Banner based on active role.
 */
function renderPlpRoleBar() {
  const host = document.getElementById('plpManagementBar');
  if (!host) return;

  const user = StorageManager.getCurrentUser();
  if (!user) {
    host.innerHTML = `
      <div class="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 shadow-md border border-blue-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-start sm:items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center text-xl flex-shrink-0">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                MoEYS PLP Model Management
              </span>
              <h2 class="text-sm sm:text-base font-black">ប្រព័ន្ធគ្រប់គ្រងសាលា និងការសិក្សាតាមស្តង់ដា PLP (ថ្នាលបឋម)</h2>
            </div>
            <p class="text-xs text-blue-100/90 leading-relaxed">
              គ្រប់គ្រង <strong>វត្តមានសិស្ស-គ្រូ</strong>, <strong>ប្រវត្តិសុខភាព &amp; កាត QR សិស្ស</strong>, <strong>វិភាគលទ្ធផល &amp; សិស្សត្រូវការជំនួយ</strong>, <strong>វេទិកាសួរ-ឆ្លើយមេរៀន</strong> និង <strong>ប្រឹក្សាគរុកោសល្យ-ស្តង់ដាសាលាគំរូ</strong>។
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button onclick="openLoginModal()" class="px-4 py-2 rounded-xl bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <i class="fa-solid fa-qrcode text-emerald-700"></i>
            <span>ចូលប្រព័ន្ធ / ស្កេនកាត QR</span>
          </button>
          <button onclick="openRegisterModal()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <i class="fa-solid fa-user-plus"></i>
            <span>+ ចុះឈ្មោះគណនី</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  const canMentoring = StorageManager.hasPermission('view_mentoring');
  const analytics = StorageManager.getPlpAnalytics({});
  const mentoring = StorageManager.getMentoringData();
  const standardsList = Object.values(mentoring.standards || {});
  const avgStandardScore = standardsList.length
    ? Math.round((standardsList.reduce((s, x) => s + (x.score || 0), 0) / (standardsList.length * 5)) * 100)
    : 0;

  let statusChip = '';
  if (user.role === 'student') {
    const att = StorageManager.getStudentAttendanceSummary(user.id);
    const qr = StorageManager.getUserQrToken(user);
    statusChip = `វត្តមាន ${att.rate}% • កូដ QR: <span class="font-mono font-bold text-emerald-800">${escapeHtml(qr)}</span>`;
  } else if (user.role === 'parent') {
    const child = StorageManager.getParentChild(user);
    const att = child ? StorageManager.getStudentAttendanceSummary(child.id) : { rate: 100 };
    statusChip = child
      ? `កូន៖ <strong>${escapeHtml(child.name)}</strong> (${escapeHtml(child.grade)}) • វត្តមាន ${att.rate}%`
      : 'មិនទាន់ភ្ជាប់ឈ្មោះកូន';
  } else {
    statusChip = `សិស្ស ${analytics.totalStudents} នាក់ • ត្រូវការជំនួយ ${analytics.atRiskStudents.length} នាក់ • ស្តង់ដាសាលាគំរូ ${avgStandardScore}%`;
  }

  const badgeInfo = ROLE_META[user.role] || ROLE_META.student;

  host.innerHTML = `
    <div class="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl ${badgeInfo.bg} text-white flex items-center justify-center text-base shadow-xs flex-shrink-0">
            <i class="fa-solid ${badgeInfo.icon}"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-sm sm:text-base font-black text-blue-950">មជ្ឈមណ្ឌលគ្រប់គ្រង PLP (School Management Hub)</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeInfo.badge}">${escapeHtml(badgeInfo.short)}</span>
            </div>
            <p class="text-xs text-slate-600 mt-0.5">${statusChip}</p>
          </div>
        </div>
        ${user.role === 'student' ? `
          <button onclick="openStudentRecordsModal()" class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto">
            <i class="fa-solid fa-clipboard-check"></i>
            <span>ប្រវត្តិពិន្ទុ &amp; កិច្ចការខ្ញុំ</span>
          </button>
        ` : user.role === 'parent' ? `
          <button onclick="openParentModal()" class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto">
            <i class="fa-solid fa-child-reaching"></i>
            <span>ផ្ទាំងតាមដានកូនលម្អិត</span>
          </button>
        ` : `
          <button onclick="openScoreboardModal()" class="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto">
            <i class="fa-solid fa-table-list"></i>
            <span>តារាងស្រង់ពិន្ទុ &amp; CSV</span>
          </button>
        `}
      </div>

      <div class="grid grid-cols-2 ${canMentoring ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-2.5 sm:gap-3">
        <button onclick="openPlpHubModal('attendance')" class="p-3 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 text-left transition group flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition">
            <i class="fa-solid fa-clipboard-user"></i>
          </div>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">វត្តមានសិស្ស &amp; គ្រូ</p>
            <p class="text-[11px] text-slate-600 truncate">${StorageManager.hasPermission('manage_attendance') ? 'ស្រង់វត្តមានប្រចាំថ្ងៃ' : 'ពិនិត្យកំណត់ត្រាវត្តមាន'}</p>
          </div>
        </button>

        <button onclick="openPlpHubModal('profiles')" class="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-left transition group flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition">
            <i class="fa-solid fa-qrcode"></i>
          </div>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">ប្រវត្តិសិស្ស សុខភាព &amp; QR</p>
            <p class="text-[11px] text-slate-600 truncate">${user.role === 'student' ? 'កាត QR និងសុខភាពខ្ញុំ' : 'បញ្ជីសុខភាព &amp; កាត QR'}</p>
          </div>
        </button>

        <button onclick="openPlpHubModal('analytics')" class="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-left transition group flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">វិភាគការសិក្សា &amp; កិត្តិយស</p>
            <p class="text-[11px] text-slate-600 truncate">សិស្សពូកែ &amp; ចំណុចត្រូវជួយ</p>
          </div>
        </button>

        ${canMentoring ? `
          <button onclick="openPlpHubModal('mentoring')" class="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200 text-left transition group flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center text-base flex-shrink-0 group-hover:scale-105 transition">
              <i class="fa-solid fa-award"></i>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold text-slate-900 truncate">គរុកោសល្យ &amp; ស្តង់ដាសាលា</p>
              <p class="text-[11px] text-slate-600 truncate">${StorageManager.hasPermission('manage_mentoring') ? 'វាយតម្លៃគ្រូ &amp; ៥ ស្តង់ដា' : 'មតិប្រឹក្សាគរុកោសល្យ'}</p>
            </div>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ----------------- PLP LESSON Q&A FORUM -----------------
function buildForumSectionHtml(item) {
  const posts = StorageManager.getForumPosts(item.id);
  const canPost = StorageManager.hasPermission('post_forum', item);
  const canModerate = StorageManager.hasPermission('moderate_forum');

  return `
    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center text-sm">
            <i class="fa-solid fa-comments"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-sm">វេទិកាសួរ-ឆ្លើយមេរៀន (PLP Q&amp;A Forum)</h4>
            <p class="text-[11px] text-slate-500">សិស្ស គ្រូ និងមាតាបិតាអាចពិភាក្សា សួរសំណួរលើមេរៀននេះ (${posts.length} មតិ)</p>
          </div>
        </div>
      </div>

      ${canPost ? `
        <form onsubmit="handleForumPostSubmit(event, '${escapeHtml(item.id)}')" class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="forumMessage"
            placeholder="សរសេរសំណួរ ឬមតិឆ្លើយតបអំពីមេរៀននេះ..."
            class="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
            required
          />
          <button type="submit" class="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap">
            <i class="fa-solid fa-paper-plane"></i>
            <span>ផ្ញើមតិ</span>
          </button>
        </form>
      ` : ''}

      <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        ${posts.length === 0 ? `
          <p class="text-xs text-slate-500 text-center py-4 bg-white rounded-xl border border-slate-200">
            មិនទាន់មានសំណួរនៅក្នុងមេរៀននេះទេ។ ចាប់ផ្ដើមសួរសំណួរដំបូង!
          </p>
        ` : posts.map(post => {
          const roleMeta = ROLE_META[post.userRole] || ROLE_META.student;
          return `
            <div class="p-3 rounded-xl bg-white border ${post.isResolved ? 'border-emerald-200' : 'border-slate-200'} text-xs space-y-1.5">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900">${escapeHtml(post.userName)}</span>
                  <span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${roleMeta.badge}">${escapeHtml(roleMeta.short)}</span>
                  ${post.isResolved ? `<span class="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ បានដោះស្រាយ</span>` : ''}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>${escapeHtml(new Date(post.createdAt).toLocaleString())}</span>
                  ${canModerate ? `
                    <button type="button" onclick="toggleForumPostResolved('${escapeHtml(post.id)}', '${escapeHtml(item.id)}')" class="text-emerald-700 hover:underline font-bold">
                      ${post.isResolved ? 'បើកវិញ' : 'ដាក់រួចរាល់'}
                    </button>
                    <button type="button" onclick="deleteForumPostItem('${escapeHtml(post.id)}', '${escapeHtml(item.id)}')" class="text-red-600 hover:underline font-bold">
                      លុប
                    </button>
                  ` : ''}
                </div>
              </div>
              <p class="text-slate-700 leading-relaxed">${escapeHtml(post.message)}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function refreshDetailForum(itemId) {
  const host = document.getElementById('detailForumSection');
  const item = StorageManager.getItemById(itemId);
  if (host && item) {
    host.innerHTML = buildForumSectionHtml(item);
  }
}

function handleForumPostSubmit(e, itemId) {
  e.preventDefault();
  const msg = e.target.forumMessage ? e.target.forumMessage.value.trim() : '';
  if (!msg) return;
  const created = StorageManager.addForumPost(itemId, msg);
  if (created) {
    showToast('បានផ្ញើមតិទៅក្នុងវេទិកាមេរៀន!', 'success');
    refreshDetailForum(itemId);
  }
}

function toggleForumPostResolved(postId, itemId) {
  if (!StorageManager.hasPermission('moderate_forum')) return;
  StorageManager.toggleForumResolved(postId);
  refreshDetailForum(itemId);
}

function deleteForumPostItem(postId, itemId) {
  if (!StorageManager.hasPermission('moderate_forum')) return;
  StorageManager.deleteForumPost(postId);
  showToast('បានលុបមតិពីវេទិកា!', 'info');
  refreshDetailForum(itemId);
}

// ----------------- PLP HUB MODAL CONTROLLERS -----------------
function openPlpHubModal(tab = state.plpTab || 'attendance') {
  const user = StorageManager.getCurrentUser();
  if (!user) {
    openLoginModal();
    showToast('សូមចូលប្រព័ន្ធ (Login) ជាមុនសិន!', 'info');
    return;
  }

  closeAllModals();
  state.plpTab = tab;
  if (tab === 'mentoring' && !StorageManager.hasPermission('view_mentoring')) {
    state.plpTab = 'attendance';
  }

  const modal = document.getElementById('plpHubModal');
  if (modal) modal.classList.remove('hidden');
  renderPlpHubModalContent();
}

function renderPlpHubModalContent() {
  const container = document.getElementById('plpHubModalContent');
  const user = StorageManager.getCurrentUser();
  if (!container || !user) return;

  const canMentoring = StorageManager.hasPermission('view_mentoring');
  const activeTab = state.plpTab;

  let bodyHtml = '';
  if (activeTab === 'attendance') bodyHtml = buildPlpAttendanceTabHtml(user);
  else if (activeTab === 'profiles') bodyHtml = buildPlpProfilesTabHtml(user);
  else if (activeTab === 'analytics') bodyHtml = buildPlpAnalyticsTabHtml(user);
  else if (activeTab === 'mentoring' && canMentoring) bodyHtml = buildPlpMentoringTabHtml(user);
  else bodyHtml = buildPlpAttendanceTabHtml(user);

  const tabBtn = (id, icon, label, activeColor) => {
    const isActive = activeTab === id;
    return `
      <button
        type="button"
        onclick="openPlpHubModal('${id}')"
        class="px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
          isActive
            ? `${activeColor} bg-slate-50`
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }"
      >
        <i class="fa-solid ${icon}"></i>
        <span>${label}</span>
      </button>
    `;
  };

  container.innerHTML = `
    <div class="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-lg">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300">ប្រព័ន្ធគ្រប់គ្រងស្តង់ដា PLP (MoEYS Style)</span>
          <h3 class="text-base sm:text-lg font-black">សាលាអន្តរជាតិ ហេមតុន — មជ្ឈមណ្ឌលគ្រប់គ្រងប្រតិបត្តិការសាលា</h3>
        </div>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="px-5 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto">
      ${tabBtn('attendance', 'fa-clipboard-user', 'វត្តមានសិស្ស & គ្រូ', 'border-sky-600 text-sky-900')}
      ${tabBtn('profiles', 'fa-qrcode', 'ប្រវត្តិសិស្ស សុខភាព & កាត QR', 'border-emerald-600 text-emerald-900')}
      ${tabBtn('analytics', 'fa-chart-pie', 'វិភាគការសិក្សា & តារាងកិត្តិយស', 'border-amber-600 text-amber-900')}
      ${canMentoring ? tabBtn('mentoring', 'fa-award', 'ប្រឹក្សាគរុកោសល្យ & ស្តង់ដាសាលាគំរូ', 'border-purple-700 text-purple-900') : ''}
    </div>

    <div class="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/40">
      ${bodyHtml}
    </div>
  `;
}

// --- TAB 1: ATTENDANCE (STUDENT DAILY P/L/E/A + TEACHER SHIFT CHECK-IN) ---
function setPlpAttDateGrade(dateVal, gradeVal) {
  if (dateVal) state.plpAttDate = dateVal;
  if (gradeVal) state.plpAttGrade = gradeVal;
  renderPlpHubModalContent();
}

function buildPlpAttendanceTabHtml(user) {
  const canManage = StorageManager.hasPermission('manage_attendance');
  if (!canManage) {
    const targetStudent = user.role === 'parent' ? StorageManager.getParentChild(user) : user;
    if (!targetStudent) {
      return `<div class="p-6 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">មិនទាន់ភ្ជាប់គណនីសិស្សដើម្បីបង្ហាញវត្តមានឡើយ។</div>`;
    }
    const summary = StorageManager.getStudentAttendanceSummary(targetStudent.id);
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 class="font-bold text-slate-900">កំណត់ត្រាវត្តមានប្រចាំថ្ងៃរបស់៖ ${escapeHtml(targetStudent.name)}</h4>
            <p class="text-xs text-slate-500">កម្រិតថ្នាក់៖ ${escapeHtml(targetStudent.grade || 'ថ្នាក់ទី១')}</p>
          </div>
          <span class="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
            អត្រាមករៀន៖ ${summary.rate}% (${summary.total} ថ្ងៃកត់ត្រា)
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200"><strong class="block text-lg text-emerald-800">${summary.present}</strong>មករៀន (P)</div>
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200"><strong class="block text-lg text-amber-800">${summary.late}</strong>មកយឺត (L)</div>
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-200"><strong class="block text-lg text-blue-800">${summary.excused}</strong>មានច្បាប់ (E)</div>
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-200"><strong class="block text-lg text-rose-800">${summary.absent}</strong>អវត្តមាន (A)</div>
        </div>
        ${summary.logs.length === 0
          ? `<p class="text-xs text-slate-500 text-center py-6 bg-slate-50 rounded-xl">មិនទាន់មានកំណត់ត្រាវត្តមាននៅឡើយទេ។</p>`
          : `<div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-600 font-bold">
                  <tr><th class="p-2.5">កាលបរិច្ឆេទ</th><th class="p-2.5">ថ្នាក់</th><th class="p-2.5">ស្ថានភាព</th><th class="p-2.5">កំណត់ចំណាំ</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${summary.logs.map(l => {
                    const meta = ATTENDANCE_STATUS_META[l.status] || ATTENDANCE_STATUS_META.P;
                    return `<tr>
                      <td class="p-2.5 font-mono">${escapeHtml(l.date)}</td>
                      <td class="p-2.5">${escapeHtml(l.grade)}</td>
                      <td class="p-2.5"><span class="px-2 py-0.5 rounded-full border text-[11px] font-bold ${meta.badge}">${escapeHtml(meta.short)}</span></td>
                      <td class="p-2.5 text-slate-600">${escapeHtml(l.note || '—')}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;
  }

  const date = state.plpAttDate || new Date().toISOString().slice(0, 10);
  const grade = state.plpAttGrade || 'ថ្នាក់ទី១';
  const existing = StorageManager.getAttendanceByDateGrade(date, grade);
  const students = StorageManager.getUsers().filter(u => u.role === 'student' && (!grade || grade === 'all' || u.grade === grade));
  const recMap = (existing && existing.records) || {};
  const noteMap = (existing && existing.notes) || {};
  const shiftInfo = (existing && existing.teacherShift) || {
    teacherName: user.name,
    shift: 'វេនព្រឹក (07:30 - 11:00)',
    checkIn: '07:25'
  };

  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">កាលបរិច្ឆេទ</label>
          <input type="date" id="attDatePicker" value="${escapeHtml(date)}" onchange="setPlpAttDateGrade(this.value, null)" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">កម្រិតថ្នាក់</label>
          <select id="attGradePicker" onchange="setPlpAttDateGrade(null, this.value)" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
            ${ALL_GRADES.map(g => `<option value="${escapeHtml(g)}" ${g === grade ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">វេនបង្រៀនគ្រូ</label>
          <input type="text" id="attTeacherShiftInput" value="${escapeHtml(shiftInfo.shift)}" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ម៉ោងគ្រូចូលបង្រៀន (Check-In)</label>
          <input type="text" id="attTeacherCheckIn" value="${escapeHtml(shiftInfo.checkIn)}" placeholder="07:25" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono" />
        </div>
      </div>

      ${students.length === 0 ? `
        <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
          មិនទាន់មានគណនីសិស្សក្នុងថ្នាក់ "${escapeHtml(grade)}" នៅឡើយទេ។ សូមបង្កើតសិស្សក្នុងផ្ទាំង "គ្រប់គ្រងសិស្ស" ឬជ្រើសថ្នាក់ទី១!
        </div>
      ` : `
        <form onsubmit="savePlpAttendanceForm(event)" class="space-y-3">
          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">ឈ្មោះសិស្ស</th>
                  <th class="p-3">ស្ថានភាព (P / L / E / A)</th>
                  <th class="p-3">កំណត់ចំណាំ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${students.map((st, idx) => {
                  const curr = recMap[st.id] || 'P';
                  return `
                    <tr class="hover:bg-slate-50/70">
                      <td class="p-3 font-mono text-slate-400">${idx + 1}</td>
                      <td class="p-3">
                        <p class="font-bold text-slate-900">${escapeHtml(st.name)}</p>
                        <p class="text-[10px] text-slate-500 font-mono">${escapeHtml(StorageManager.getUserQrToken(st))}</p>
                      </td>
                      <td class="p-3">
                        <div class="flex flex-wrap gap-1.5">
                          ${Object.keys(ATTENDANCE_STATUS_META).map(code => {
                            const m = ATTENDANCE_STATUS_META[code];
                            return `
                              <label class="cursor-pointer">
                                <input type="radio" name="att_status_${escapeHtml(st.id)}" value="${code}" ${curr === code ? 'checked' : ''} class="peer sr-only" />
                                <span class="inline-block px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-white text-slate-600 border-slate-200 ${m.peerBtn} transition">
                                  ${escapeHtml(m.short)}
                                </span>
                              </label>
                            `;
                          }).join('')}
                        </div>
                      </td>
                      <td class="p-3">
                        <input type="text" name="att_note_${escapeHtml(st.id)}" value="${escapeHtml(noteMap[st.id] || '')}" placeholder="មូលហេតុ ឬកំណត់ចំណាំ..." class="w-full min-w-[150px] px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-600 focus:outline-none" />
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <span class="text-[11px] text-slate-500">
              ${existing ? `កែសម្រួលចុងក្រោយដោយ ${escapeHtml(existing.updatedBy)}` : 'មិនទាន់កត់ត្រាវត្តមានសម្រាប់ថ្ងៃនេះនៅឡើយទេ'}
            </span>
            <button type="submit" class="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>រក្សាទុកវត្តមានថ្ងៃនេះ</span>
            </button>
          </div>
        </form>
      `}
    </div>
  `;
}

function savePlpAttendanceForm(e) {
  e.preventDefault();
  if (!StorageManager.hasPermission('manage_attendance')) return;
  const form = e.target;
  const date = state.plpAttDate || new Date().toISOString().slice(0, 10);
  const grade = state.plpAttGrade || 'ថ្នាក់ទី១';
  const students = StorageManager.getUsers().filter(u => u.role === 'student' && u.grade === grade);
  const records = {};
  const notes = {};

  students.forEach(st => {
    const checked = form.querySelector(`input[name="att_status_${st.id}"]:checked`);
    const noteEl = form.querySelector(`input[name="att_note_${st.id}"]`);
    records[st.id] = checked ? checked.value : 'P';
    notes[st.id] = noteEl ? noteEl.value.trim() : '';
  });

  const shiftEl = document.getElementById('attTeacherShiftInput');
  const checkInEl = document.getElementById('attTeacherCheckIn');
  const currUser = StorageManager.getCurrentUser();

  StorageManager.saveAttendanceRecord({
    date,
    grade,
    records,
    notes,
    teacherShift: {
      teacherId: currUser ? currUser.id : 'teacher',
      teacherName: currUser ? currUser.name : 'គ្រូបង្រៀន',
      shift: shiftEl ? shiftEl.value.trim() : 'វេនព្រឹក',
      checkIn: checkInEl ? checkInEl.value.trim() : '07:30',
      status: 'on_time'
    }
  });

  showToast(`បានរក្សាទុកវត្តមានថ្នាក់ ${grade} ថ្ងៃ ${date} រួចរាល់!`, 'success');
  renderPlpRoleBar();
  renderPlpHubModalContent();
}

// --- TAB 2: STUDENT DIRECTORY, HEALTH PROFILES & QR PASS ---
function setPlpProfileGrade(gradeVal) {
  state.plpProfileGrade = gradeVal || 'all';
  state.editingProfileUserId = null;
  renderPlpHubModalContent();
}

function toggleEditStudentProfileForm(userId) {
  state.editingProfileUserId = state.editingProfileUserId === userId ? null : userId;
  renderPlpHubModalContent();
}

function saveStudentProfileInline(e, userId) {
  e.preventDefault();
  if (!StorageManager.hasPermission('manage_student_profiles')) return;
  const f = e.target;
  StorageManager.saveStudentProfile(userId, {
    studentCode: f.spCode.value.trim(),
    gender: f.spGender.value.trim(),
    dob: f.spDob.value.trim(),
    guardianName: f.spGuardian.value.trim(),
    guardianPhone: f.spPhone.value.trim(),
    bloodGroup: f.spBlood.value.trim(),
    allergies: f.spAllergies.value.trim(),
    healthNotes: f.spHealth.value.trim(),
    behaviorNote: f.spBehavior.value.trim()
  });
  state.editingProfileUserId = null;
  showToast('បានរក្សាទុកប្រវត្តិ និងព័ត៌មានសុខភាពសិស្សដោយជោគជ័យ!', 'success');
  renderPlpHubModalContent();
}

function copyQrCodeText(code) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  showToast(`បានចម្លងកូដ QR (${code}) — អាចប្រើសម្រាប់ស្កេនចូលប្រព័ន្ធសិស្ស!`, 'success');
}

function buildPlpProfilesTabHtml(user) {
  const canEdit = StorageManager.hasPermission('manage_student_profiles');
  let students = StorageManager.getUsers().filter(u => u.role === 'student');

  if (user.role === 'student') {
    students = students.filter(s => s.id === user.id);
  } else if (user.role === 'parent') {
    const child = StorageManager.getParentChild(user);
    students = child ? [child] : [];
  } else if (state.plpProfileGrade && state.plpProfileGrade !== 'all') {
    students = students.filter(s => s.grade === state.plpProfileGrade);
  }

  return `
    <div class="space-y-4">
      ${canEdit ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-bold text-slate-900 text-sm">បញ្ជីប្រវត្តិសិស្ស ព័ត៌មានសុខភាព និងកាត QR ចូលរៀន (SIS)</h4>
            <p class="text-xs text-slate-500">គ្រូ ប្រធានផ្នែក និង Admin អាចកែប្រែព័ត៌មានសុខភាព ទំនាក់ទំនងបន្ទាន់ និងចម្លងកាត QR សិស្ស</p>
          </div>
          <select onchange="setPlpProfileGrade(this.value)" class="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
            <option value="all" ${state.plpProfileGrade === 'all' ? 'selected' : ''}>គ្រប់កម្រិតថ្នាក់</option>
            ${ALL_GRADES.map(g => `<option value="${escapeHtml(g)}" ${state.plpProfileGrade === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
          </select>
        </div>
      ` : ''}

      ${students.length === 0 ? `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">មិនមានទិន្នន័យសិស្សសម្រាប់បង្ហាញទេ។</div>
      ` : `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          ${students.map(st => {
            const p = StorageManager.getStudentProfile(st.id);
            const qrToken = StorageManager.getUserQrToken(st);
            const att = StorageManager.getStudentAttendanceSummary(st.id);
            const isEditing = canEdit && state.editingProfileUserId === st.id;

            return `
              <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    ${generateQrSvg(qrToken, 84)}
                    <div class="min-w-0">
                      <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">${escapeHtml(p.studentCode || qrToken)}</span>
                      <h5 class="font-black text-slate-900 text-base truncate mt-1">${escapeHtml(st.name)}</h5>
                      <p class="text-xs text-slate-600">${escapeHtml(st.grade || 'ទូទៅ')} • ភេទ៖ ${escapeHtml(p.gender || 'មិនទាន់កំណត់')}</p>
                      <div class="flex flex-wrap gap-1.5 mt-2">
                        <button type="button" onclick="copyQrCodeText('${escapeHtml(qrToken)}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1">
                          <i class="fa-solid fa-copy"></i> ${escapeHtml(qrToken)}
                        </button>
                        ${canEdit ? `
                          <button type="button" onclick="toggleEditStudentProfileForm('${escapeHtml(st.id)}')" class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold transition border border-blue-200">
                            <i class="fa-solid fa-pen"></i> ${isEditing ? 'បិទ' : 'កែសុខភាព/ប្រវត្តិ'}
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-bold flex-shrink-0">
                    វត្តមាន ${att.rate}%
                  </span>
                </div>

                ${isEditing ? `
                  <form onsubmit="saveStudentProfileInline(event, '${escapeHtml(st.id)}')" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label class="font-bold text-slate-700">អត្តលេខសិស្ស (ID)</label>
                      <input name="spCode" value="${escapeHtml(p.studentCode || '')}" placeholder="HPT-01-001" class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div>
                      <label class="font-bold text-slate-700">ភេទ / ថ្ងៃកំណើត</label>
                      <div class="flex gap-1.5 mt-0.5">
                        <input name="spGender" value="${escapeHtml(p.gender || '')}" placeholder="ប្រុស/ស្រី" class="w-20 px-2 py-1.5 rounded-lg border border-slate-300 bg-white" />
                        <input name="spDob" type="date" value="${escapeHtml(p.dob || '')}" class="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label class="font-bold text-slate-700">អាណាព្យាបាល</label>
                      <input name="spGuardian" value="${escapeHtml(p.guardianName || '')}" placeholder="ឈ្មោះមាតាបិតា" class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div>
                      <label class="font-bold text-slate-700">ទូរស័ព្ទបន្ទាន់</label>
                      <input name="spPhone" value="${escapeHtml(p.guardianPhone || st.phone || '')}" placeholder="012 345 678" class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div>
                      <label class="font-bold text-slate-700">ក្រុមឈាម</label>
                      <input name="spBlood" value="${escapeHtml(p.bloodGroup || '')}" placeholder="O+, A+, B+" class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div>
                      <label class="font-bold text-slate-700">ប្រតិកម្មអាឡ័កស៊ី</label>
                      <input name="spAllergies" value="${escapeHtml(p.allergies || '')}" placeholder="គ្មាន ឬបញ្ជាក់..." class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="font-bold text-slate-700">កំណត់ត្រាសុខភាពសិស្ស</label>
                      <input name="spHealth" value="${escapeHtml(p.healthNotes || '')}" placeholder="ស្ថានភាពភ្នែក ធ្មេញ វ៉ាក់សាំង..." class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="font-bold text-slate-700">កំណត់ត្រាវិន័យ &amp; ការចូលរួម</label>
                      <input name="spBehavior" value="${escapeHtml(p.behaviorNote || '')}" placeholder="អាកប្បកិរិយាក្នុងថ្នាក់..." class="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    </div>
                    <div class="sm:col-span-2 flex justify-end gap-2 pt-1">
                      <button type="button" onclick="toggleEditStudentProfileForm('${escapeHtml(st.id)}')" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold">បោះបង់</button>
                      <button type="submit" class="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">រក្សាទុក</button>
                    </div>
                  </form>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div><span class="text-slate-500">អាណាព្យាបាល៖</span> <strong>${escapeHtml(p.guardianName || '—')}</strong></div>
                    <div><span class="text-slate-500">ទូរស័ព្ទបន្ទាន់៖</span> <strong>${escapeHtml(p.guardianPhone || st.phone || '—')}</strong></div>
                    <div><span class="text-slate-500">ក្រុមឈាម / ប្រតិកម្ម៖</span> <strong class="text-rose-700">${escapeHtml(p.bloodGroup || '—')} • ${escapeHtml(p.allergies || 'គ្មាន')}</strong></div>
                    <div><span class="text-slate-500">ថ្ងៃកំណើត៖</span> <strong>${escapeHtml(p.dob || '—')}</strong></div>
                    <div class="sm:col-span-2"><span class="text-slate-500">កំណត់ត្រាសុខភាព៖</span> <span class="text-slate-800">${escapeHtml(p.healthNotes || 'មិនទាន់មានកំណត់ត្រា')}</span></div>
                    <div class="sm:col-span-2"><span class="text-slate-500">វិន័យ &amp; អាកប្បកិរិយា៖</span> <span class="text-slate-800">${escapeHtml(p.behaviorNote || 'មិនទាន់មានកំណត់ត្រា')}</span></div>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

// --- TAB 3: PLP LEARNING ANALYTICS, HONOR ROLL, AT-RISK ALERTS & MISSED QUESTIONS ---
function setPlpAnalyticsFilters(gradeVal, typeVal) {
  if (gradeVal !== null) state.plpAnalyticsGrade = gradeVal;
  if (typeVal !== null) state.plpAnalyticsType = typeVal;
  renderPlpHubModalContent();
}

function buildPlpAnalyticsTabHtml(user) {
  const analytics = StorageManager.getPlpAnalytics({
    grade: state.plpAnalyticsGrade || 'all',
    assessmentType: state.plpAnalyticsType || 'all'
  });

  const isStaff = StorageManager.hasPermission('view_analytics');
  const child = user.role === 'parent' ? StorageManager.getParentChild(user) : null;

  return `
    <div class="space-y-5">
      <div class="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 class="font-bold text-slate-900 text-sm">ផ្ទាំងវិភាគការសិក្សា PLP &amp; តារាងកិត្តិយស</h4>
          <p class="text-xs text-slate-500">តាមដានតាមប្រភេទប្រឡង (តាមមេរៀន / ប្រចាំខែ / ឆមាស), សិស្សត្រូវការជំនួយ និងសំណួរដែលសិស្សខុសញឹកញាប់</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select onchange="setPlpAnalyticsFilters(this.value, null)" class="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
            <option value="all" ${state.plpAnalyticsGrade === 'all' ? 'selected' : ''}>គ្រប់ថ្នាក់</option>
            ${ALL_GRADES.map(g => `<option value="${escapeHtml(g)}" ${state.plpAnalyticsGrade === g ? 'selected' : ''}>${escapeHtml(g)}</option>`).join('')}
          </select>
          <select onchange="setPlpAnalyticsFilters(null, this.value)" class="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
            <option value="all" ${state.plpAnalyticsType === 'all' ? 'selected' : ''}>គ្រប់ប្រភេទវាយតម្លៃ</option>
            ${Object.values(ASSESSMENT_TYPES).map(t => `<option value="${t.id}" ${state.plpAnalyticsType === t.id ? 'selected' : ''}>${escapeHtml(t.label)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200">
          <span class="block text-2xl font-black text-blue-900">${analytics.totalStudents}</span>
          <span class="text-xs text-slate-500">សិស្សសរុប</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200">
          <span class="block text-2xl font-black text-emerald-700">${analytics.totalQuizAttempts}</span>
          <span class="text-xs text-slate-500">ដងប្រឡង / Quiz</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200">
          <span class="block text-2xl font-black text-indigo-700">${analytics.totalSubmissions}</span>
          <span class="text-xs text-slate-500">កិច្ចការផ្ទះប្រគល់</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
          <span class="block text-2xl font-black text-rose-700">${analytics.atRiskStudents.length}</span>
          <span class="text-xs text-rose-700 font-bold">សិស្សត្រូវការជំនួយ</span>
        </div>
      </div>

      <!-- Honor Roll -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <h5 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <i class="fa-solid fa-trophy text-amber-500"></i>
          តារាងកិត្តិយសប្រចាំសាលា (Honor Roll — ចំណាត់ថ្នាក់សរុប)
        </h5>
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 text-slate-600 font-bold">
              <tr>
                <th class="p-2.5">ចំណាត់ថ្នាក់</th>
                <th class="p-2.5">ឈ្មោះសិស្ស</th>
                <th class="p-2.5">មធ្យម Quiz</th>
                <th class="p-2.5">កិច្ចការផ្ទះ</th>
                <th class="p-2.5">វត្តមាន</th>
                <th class="p-2.5">មើលមេរៀន</th>
                <th class="p-2.5">ពិន្ទុសរុប PLP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${analytics.honorRoll.map((row, idx) => {
                const highlight = (user.role === 'student' && row.student.id === user.id) || (child && row.student.id === child.id);
                const medal = idx === 0 ? '🥇 ទី១' : idx === 1 ? '🥈 ទី២' : idx === 2 ? '🥉 ទី៣' : `#${idx + 1}`;
                return `
                  <tr class="${highlight ? 'bg-amber-50/80 font-bold' : ''}">
                    <td class="p-2.5 font-bold">${medal}</td>
                    <td class="p-2.5">${escapeHtml(row.student.name)} <span class="text-[10px] text-slate-400">(${escapeHtml(row.student.grade)})</span></td>
                    <td class="p-2.5">${row.quizAvg !== null ? `${row.quizAvg}% (${row.quizCount})` : '—'}</td>
                    <td class="p-2.5">${row.hwAvg !== null ? `${row.hwAvg}% (${row.hwCount})` : '—'}</td>
                    <td class="p-2.5">${row.attendanceRate}%</td>
                    <td class="p-2.5">${row.lessonViews} ដង</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black">${row.composite}%</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${isStaff ? `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-white rounded-2xl border border-rose-200 p-4 space-y-2.5">
            <h5 class="font-bold text-rose-900 text-sm flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-rose-600"></i>
              សិស្សត្រូវការជំនួយបំប៉ន (At-Risk Alerts)
            </h5>
            ${analytics.atRiskStudents.length === 0 ? `
              <p class="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl">សិស្សទាំងអស់កំពុងមានវឌ្ឍនភាពល្អ!</p>
            ` : analytics.atRiskStudents.map(row => `
              <div class="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs flex items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-slate-900">${escapeHtml(row.student.name)} (${escapeHtml(row.student.grade)})</p>
                  <p class="text-[11px] text-rose-700">
                    ${row.quizAvg !== null && row.quizAvg < 60 ? `ពិន្ទុ Quiz ទាប (${row.quizAvg}%) ` : ''}
                    ${row.attendanceTotal > 0 && row.attendanceRate < 80 ? `អវត្តមានញឹកញាប់ (មក ${row.attendanceRate}%) ` : ''}
                    ${row.quizCount === 0 && row.hwCount === 0 ? 'មិនទាន់មានកំណត់ត្រាធ្វើលំហាត់ ឬកិច្ចការ' : ''}
                  </p>
                </div>
                <button type="button" onclick="openPlpHubModal('profiles')" class="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-[11px] font-bold flex-shrink-0">
                  មើលទំនាក់ទំនង
                </button>
              </div>
            `).join('')}
          </div>

          <div class="bg-white rounded-2xl border border-amber-200 p-4 space-y-2.5">
            <h5 class="font-bold text-amber-950 text-sm flex items-center gap-2">
              <i class="fa-solid fa-magnifying-glass-chart text-amber-600"></i>
              សំណួរដែលសិស្សធ្វើខុសញឹកញាប់ (Reteach Insights)
            </h5>
            ${analytics.missedQuestions.length === 0 ? `
              <p class="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">នៅពេលសិស្សធ្វើតេស្តខុសសំណួរណាមួយ ប្រព័ន្ធនឹងវិភាគសំណួរនោះនៅទីនេះដោយស្វ័យប្រវត្តិ។</p>
            ` : analytics.missedQuestions.slice(0, 6).map(mq => `
              <div class="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">${escapeHtml(mq.itemTitle)}</p>
                  <p class="text-slate-700 mt-0.5">${escapeHtml(mq.questionText)}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] flex-shrink-0">ខុស ${mq.missCount} ដង</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// --- TAB 4: PEDAGOGICAL MENTORING & MODEL SCHOOL STANDARDS (HEAD / ADMIN / TEACHER) ---
function handleMentoringSubmit(e) {
  e.preventDefault();
  if (!StorageManager.hasPermission('manage_mentoring')) return;
  const f = e.target;
  const teacherUser = StorageManager.getUsers().find(u => u.id === f.mentTeacherId.value);
  StorageManager.addMentoringObservation({
    teacherId: f.mentTeacherId.value,
    teacherName: teacherUser ? teacherUser.name : 'គ្រូបង្រៀន',
    date: f.mentDate.value,
    grade: f.mentGrade.value,
    subject: f.mentSubject.value.trim(),
    scores: {
      lessonPlan: Number(f.mentPlan.value),
      teachingMethod: Number(f.mentMethod.value),
      engagement: Number(f.mentEngage.value),
      assessment: Number(f.mentAssess.value)
    },
    strengths: f.mentStrengths.value,
    recommendations: f.mentRecommendations.value
  });
  showToast('បានរក្សាទុកកំណត់ត្រាប្រឹក្សាគរុកោសល្យគ្រូ!', 'success');
  renderPlpRoleBar();
  renderPlpHubModalContent();
}

function saveModelSchoolStandardRow(standardId) {
  if (!StorageManager.hasPermission('manage_mentoring')) return;
  const scoreEl = document.getElementById(`stdScore_${standardId}`);
  const evEl = document.getElementById(`stdEvidence_${standardId}`);
  if (!scoreEl || !evEl) return;
  StorageManager.saveSchoolStandard(standardId, Number(scoreEl.value), evEl.value);
  showToast('បានធ្វើបច្ចុប្បន្នភាពពិន្ទុស្តង់ដាសាលាគំរូ!', 'success');
  renderPlpRoleBar();
  renderPlpHubModalContent();
}

function buildPlpMentoringTabHtml(user) {
  const canManage = StorageManager.hasPermission('manage_mentoring');
  const data = StorageManager.getMentoringData();
  const teachers = StorageManager.getUsers().filter(u => u.role === 'teacher');
  const observations = canManage
    ? (data.observations || [])
    : (data.observations || []).filter(o => o.teacherId === user.id || o.teacherName === user.name);

  const standardsMap = data.standards || {};
  const standardsTotal = MODEL_SCHOOL_STANDARDS.reduce((sum, st) => sum + ((standardsMap[st.id] && standardsMap[st.id].score) || 0), 0);
  const standardsPct = Math.round((standardsTotal / (MODEL_SCHOOL_STANDARDS.length * 5)) * 100);

  return `
    <div class="space-y-5">
      <!-- Model School Standards 5 Pillars -->
      <div class="bg-white rounded-2xl border border-purple-200 p-4 sm:p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 class="font-bold text-purple-950 text-sm flex items-center gap-2">
              <i class="fa-solid fa-school-circle-check text-purple-700"></i>
              អធិការកិច្ច &amp; ស្តង់ដាសាលាគំរូ ៥ ចំណុច (MoEYS Model School Standards)
            </h4>
            <p class="text-xs text-slate-500">ពិន្ទុវាយតម្លៃគុណភាពសាលាប្រចាំឆមាស (កម្រិត ១ ដល់ ៥)</p>
          </div>
          <span class="px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-900 text-xs font-black">
            ពិន្ទុរួម៖ ${standardsPct}% (${standardsTotal}/${MODEL_SCHOOL_STANDARDS.length * 5})
          </span>
        </div>

        <div class="space-y-2.5">
          ${MODEL_SCHOOL_STANDARDS.map(st => {
            const cur = standardsMap[st.id] || { score: 4, evidence: '' };
            return `
              <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-slate-900">${escapeHtml(st.title)}</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(st.description)}</p>
                </div>
                ${canManage ? `
                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select id="stdScore_${escapeHtml(st.id)}" class="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold">
                      ${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${cur.score === n ? 'selected' : ''}>${n} / 5 ពិន្ទុ</option>`).join('')}
                    </select>
                    <input id="stdEvidence_${escapeHtml(st.id)}" value="${escapeHtml(cur.evidence || '')}" placeholder="ភស្តុតាង / កំណត់សម្គាល់..." class="w-full sm:w-56 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" />
                    <button type="button" onclick="saveModelSchoolStandardRow('${escapeHtml(st.id)}')" class="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold whitespace-nowrap">
                      រក្សាទុក
                    </button>
                  </div>
                ` : `
                  <div class="text-right">
                    <span class="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">${cur.score} / 5</span>
                    <p class="text-[11px] text-slate-600 mt-1">${escapeHtml(cur.evidence || '')}</p>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Teacher Pedagogical Mentoring Form (Head/Admin Only) -->
      ${canManage && teachers.length > 0 ? `
        <form onsubmit="handleMentoringSubmit(event)" class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 text-xs">
          <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <i class="fa-solid fa-chalkboard-user text-blue-900"></i>
            កត់ត្រាការចុះប្រឹក្សាគរុកោសល្យគ្រូបង្រៀន (New Classroom Observation)
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label class="font-bold text-slate-700">គ្រូបង្រៀន *</label>
              <select name="mentTeacherId" class="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold" required>
                ${teachers.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700">កាលបរិច្ឆេទ</label>
              <input name="mentDate" type="date" value="${escapeHtml(new Date().toISOString().slice(0, 10))}" class="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-300 bg-white" required />
            </div>
            <div>
              <label class="font-bold text-slate-700">កម្រិតថ្នាក់</label>
              <select name="mentGrade" class="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-300 bg-white">
                ${ALL_GRADES.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700">មុខវិជ្ជា</label>
              <input name="mentSubject" value="ភាសាខ្មែរ" class="w-full mt-1 px-2.5 py-2 rounded-xl border border-slate-300 bg-white" required />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label class="font-bold text-slate-700">កិច្ចតែងការ (1-5)</label>
              <input name="mentPlan" type="number" min="1" max="5" value="5" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" required />
            </div>
            <div>
              <label class="font-bold text-slate-700">វិធីសាស្ត្របង្រៀន (1-5)</label>
              <input name="mentMethod" type="number" min="1" max="5" value="4" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" required />
            </div>
            <div>
              <label class="font-bold text-slate-700">សកម្មភាពសិស្ស (1-5)</label>
              <input name="mentEngage" type="number" min="1" max="5" value="5" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" required />
            </div>
            <div>
              <label class="font-bold text-slate-700">ការវាយតម្លៃ (1-5)</label>
              <input name="mentAssess" type="number" min="1" max="5" value="4" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700">ចំណុចខ្លាំងរបស់គ្រូ</label>
              <textarea name="mentStrengths" rows="2" placeholder="សង្ខេបចំណុចល្អក្នុងការបង្រៀន..." class="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 bg-white" required></textarea>
            </div>
            <div>
              <label class="font-bold text-slate-700">អនុសាសន៍កែលម្អបន្ថែម</label>
              <textarea name="mentRecommendations" rows="2" placeholder="ណែនាំវិធីសាស្ត្របង្រៀនបន្ថែម..." class="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 bg-white" required></textarea>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold shadow-xs transition flex items-center gap-1.5">
              <i class="fa-solid fa-plus-circle"></i>
              <span>រក្សាទុកកំណត់ត្រាប្រឹក្សា</span>
            </button>
          </div>
        </form>
      ` : ''}

      <!-- Past Observations List -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <h4 class="font-bold text-slate-900 text-sm">ប្រវត្តិប្រឹក្សាគរុកោសល្យ (${observations.length})</h4>
        ${observations.length === 0 ? `
          <p class="text-xs text-slate-500 text-center py-6 bg-slate-50 rounded-xl">មិនទាន់មានកំណត់ត្រាប្រឹក្សាគរុកោសល្យនៅឡើយទេ។</p>
        ` : observations.map(obs => `
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p class="font-black text-slate-900 text-sm">${escapeHtml(obs.teacherName)} • ${escapeHtml(obs.grade)} (${escapeHtml(obs.subject)})</p>
                <p class="text-[11px] text-slate-500">អ្នកប្រឹក្សា៖ ${escapeHtml(obs.evaluatorName)} • ថ្ងៃទី ${escapeHtml(obs.date)}</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black self-start sm:self-auto">
                ពិន្ទុគរុកោសល្យ៖ ${obs.totalPercent}%
              </span>
            </div>
            <p class="text-emerald-900"><strong>ចំណុចខ្លាំង៖</strong> ${escapeHtml(obs.strengths)}</p>
            <p class="text-amber-900"><strong>អនុសាសន៍៖</strong> ${escapeHtml(obs.recommendations)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
