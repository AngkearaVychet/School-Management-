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
  editingItemId: null,
  editingUserId: null
};

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
  const adminManageBtn = document.getElementById('adminManageBtn');
  const parentDashBtn = document.getElementById('parentDashBtn');
  const backupBtn = document.getElementById('backupBtn');
  
  if (!container) return;

  const currentUser = StorageManager.getCurrentUser();

  if (!currentUser) {
    // បង្ហាញប៊ូតុង Login / Register ពេលមិនទាន់ចូល
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button 
          onclick="openLoginModal()" 
          class="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <i class="fa-solid fa-arrow-right-to-bracket text-xs"></i>
          <span>ចូលប្រើ (Login)</span>
        </button>
        <button 
          onclick="openRegisterModal()" 
          class="hidden sm:inline-flex px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition"
        >
          ចុះឈ្មោះ
        </button>
      </div>
    `;

    if (teacherAddBtn) teacherAddBtn.classList.add('hidden');
    if (adminManageBtn) adminManageBtn.classList.add('hidden');
    if (parentDashBtn) parentDashBtn.classList.add('hidden');
    if (backupBtn) backupBtn.classList.add('hidden');
    return;
  }

  // កំណត់ Badge ពណ៌តាម Role
  const roleBadgeConfig = {
    admin: { label: 'Admin (គ្រប់គ្រង)', bg: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-600' },
    teacher: { label: 'គ្រូបង្រៀន', bg: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-600' },
    student: { label: 'សិស្ស', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' },
    parent: { label: 'មាតាបិតា', bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-600' }
  };

  const badgeInfo = roleBadgeConfig[currentUser.role] || roleBadgeConfig.student;

  container.innerHTML = `
    <div class="relative group">
      <!-- Profile Button / Dropdown Trigger -->
      <button class="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition shadow-xs">
        <div class="w-8 h-8 rounded-xl ${currentUser.avatarBg || 'bg-blue-900'} text-white flex items-center justify-center text-xs font-bold shadow-xs">
          <i class="fa-solid ${currentUser.avatarIcon || 'fa-user'}"></i>
        </div>
        <div class="text-left hidden sm:block pr-1">
          <p class="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">${currentUser.name}</p>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold ${badgeInfo.bg} px-1.5 py-0.2 rounded-md border">
            <span class="w-1.5 h-1.5 rounded-full ${badgeInfo.dot}"></span>
            ${badgeInfo.label}
          </span>
        </div>
        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 mr-1 hidden sm:block"></i>
      </button>

      <!-- Dropdown Menu -->
      <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
        <!-- User Info Header -->
        <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <p class="text-xs text-slate-400 font-medium">គណនីបច្ចុប្បន្ន</p>
          <p class="text-sm font-bold text-slate-900 truncate">${currentUser.name}</p>
          <p class="text-[11px] text-slate-500 font-mono truncate">@${currentUser.username} • ${currentUser.grade || 'ទូទៅ'}</p>
        </div>

        <div class="py-1 text-xs">
          ${currentUser.role === 'admin' ? `
            <button onclick="openUserManagementModal()" class="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-users-gear text-red-600 text-sm"></i>
              <span>គ្រប់គ្រងអ្នកប្រើប្រាស់ (Users)</span>
            </button>
          ` : ''}

          ${currentUser.role === 'parent' ? `
            <button onclick="openParentModal()" class="w-full px-4 py-2 text-left hover:bg-amber-50 text-amber-900 font-bold flex items-center gap-2.5">
              <i class="fa-solid fa-chart-line text-amber-600 text-sm"></i>
              <span>តាមដានការរៀនរបស់កូន</span>
            </button>
          ` : ''}

          ${currentUser.role === 'admin' || currentUser.role === 'teacher' ? `
            <button onclick="openAddModal()" class="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2.5">
              <i class="fa-solid fa-circle-plus text-blue-900 text-sm"></i>
              <span>បន្ថែមមេរៀន / លំហាត់ថ្មី</span>
            </button>
          ` : ''}

          <button onclick="openRegisterModal()" class="w-full px-4 py-2 text-left hover:bg-emerald-50 text-emerald-800 font-bold flex items-center gap-2.5">
            <i class="fa-solid fa-user-plus text-emerald-600 text-sm"></i>
            <span>+ បង្កើតគណនីថ្មី (Create Account)</span>
          </button>

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

  // បង្ហាញ ឬលាក់ប៊ូតុងតាមសិទ្ធិ
  const canCreate = StorageManager.hasPermission('create_lesson');
  const isAdmin = currentUser.role === 'admin';
  const isParent = currentUser.role === 'parent';

  if (teacherAddBtn) {
    if (canCreate) teacherAddBtn.classList.remove('hidden');
    else teacherAddBtn.classList.add('hidden');
  }

  if (adminManageBtn) {
    if (isAdmin) adminManageBtn.classList.remove('hidden');
    else adminManageBtn.classList.add('hidden');
  }

  if (parentDashBtn) {
    if (isParent || isAdmin) parentDashBtn.classList.remove('hidden');
    else parentDashBtn.classList.add('hidden');
  }

  if (backupBtn) {
    if (isAdmin) backupBtn.classList.remove('hidden');
    else backupBtn.classList.add('hidden');
  }
}

// ចូលប្រើប្រាស់ Login
function openLoginModal() {
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
    showToast(`សូមស្វាគមន៍! លោក ${res.user.name} (${res.user.roleNameKhmer})`, 'success');
    closeAllModals();
    renderUserNav();
    renderCards();
    renderStats();
  } else {
    alert(res.message);
  }
}

// Quick 1-Click Login សម្រាប់សាកល្បង Roles
function quickLogin(role) {
  const users = StorageManager.getUsers();
  const targetUser = users.find(u => u.role === role);
  if (targetUser) {
    StorageManager.setCurrentUser(targetUser);
    showToast(`បានចូលប្រើជា៖ ${targetUser.name} (${targetUser.roleNameKhmer})`, 'success');
    closeAllModals();
    renderUserNav();
    renderCards();
    renderStats();
  } else {
    alert(`មិនទាន់មានគណនីតួនាទី ${role} នៅឡើយទេ`);
  }
}

function handleLogout() {
  StorageManager.logout();
  showToast('បានចាកចេញពីគណនីដោយជោគជ័យ', 'info');
  renderUserNav();
  renderCards();
}

// ចុះឈ្មោះ Register
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
    childName: form.regChildName ? form.regChildName.value.trim() : ''
  };

  const res = StorageManager.addUser(userData);
  if (res.success) {
    // Auto login
    StorageManager.setCurrentUser(res.user);
    showToast(`ចុះឈ្មោះបានជោគជ័យ! សូមស្វាគមន៍មកកាន់សាលា ហេមតុន`, 'success');
    closeAllModals();
    renderUserNav();
    renderCards();
  } else {
    alert(res.message);
  }
}

// ================= ADMIN USER MANAGEMENT MODAL =================
function openUserManagementModal() {
  if (!StorageManager.hasPermission('manage_users')) {
    alert('មានតែគណនី Admin ប៉ុណ្ណោះដែលមានសិទ្ធិគ្រប់គ្រងអ្នកប្រើប្រាស់!');
    return;
  }
  renderUserManagementTable();
  const modal = document.getElementById('userManagementModal');
  if (modal) modal.classList.remove('hidden');
}

function renderUserManagementTable() {
  const container = document.getElementById('usersTableBody');
  const countEl = document.getElementById('totalUsersCount');
  if (!container) return;

  const users = StorageManager.getUsers();
  const currentUser = StorageManager.getCurrentUser();

  if (countEl) countEl.textContent = users.length;

  const roleStyles = {
    admin: 'bg-red-100 text-red-800 border-red-300',
    teacher: 'bg-blue-100 text-blue-900 border-blue-300',
    student: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    parent: 'bg-amber-100 text-amber-900 border-amber-300'
  };

  container.innerHTML = users.map((u, idx) => {
    const isSelf = currentUser && currentUser.id === u.id;
    return `
      <tr class="hover:bg-slate-50/80 transition text-xs sm:text-sm border-b border-slate-100">
        <td class="p-3 text-slate-500 font-mono text-center">${idx + 1}</td>
        <td class="p-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl ${u.avatarBg || 'bg-blue-900'} text-white flex items-center justify-center text-xs flex-shrink-0">
              <i class="fa-solid ${u.avatarIcon || 'fa-user'}"></i>
            </div>
            <div>
              <p class="font-bold text-slate-900">${u.name} ${isSelf ? '<span class="text-[10px] text-blue-600 font-normal">(ខ្លួនឯង)</span>' : ''}</p>
              <p class="text-xs text-slate-400 font-mono">@${u.username} • ${u.phone || 'គ្មានលេខទូរស័ព្ទ'}</p>
            </div>
          </div>
        </td>
        <td class="p-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleStyles[u.role] || roleStyles.student}">
            ${u.roleNameKhmer || u.role}
          </span>
        </td>
        <td class="p-3 font-medium text-slate-700">
          ${u.grade || 'ទូទៅ'}
          ${u.childName ? `<div class="text-[11px] text-amber-700">កូន៖ ${u.childName}</div>` : ''}
        </td>
        <td class="p-3 text-slate-400 text-xs hidden sm:table-cell">
          ${u.createdAt || '2026-10-01'}
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button 
              onclick="editUserRole('${u.id}')" 
              title="កែប្រែតួនាទី / Password" 
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
    email: form.adminNewEmail.value.trim(),
    phone: form.adminNewPhone.value.trim()
  };

  const res = StorageManager.addUser(userData);
  if (res.success) {
    showToast(`បានបង្កើតគណនី ${userData.name} ដោយជោគជ័យ!`, 'success');
    form.reset();
    renderUserManagementTable();
  } else {
    alert(res.message);
  }
}

function editUserRole(userId) {
  const users = StorageManager.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const newRole = prompt(`កែប្រែតួនាទីសម្រាប់ ${user.name}:\n(admin, teacher, student, parent)\nបច្ចុប្បន្ន៖ ${user.role}`, user.role);
  if (!newRole) return;

  const validRoles = ['admin', 'teacher', 'student', 'parent'];
  if (!validRoles.includes(newRole.toLowerCase().trim())) {
    alert('តួនាទីមិនត្រឹមត្រូវ! ត្រូវតែជា admin, teacher, student ឬ parent។');
    return;
  }

  const res = StorageManager.updateUser(userId, { role: newRole.toLowerCase().trim() });
  if (res.success) {
    showToast(`បានកែប្រែតួនាទីជា ${newRole} រួចរាល់!`, 'success');
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

// ================= PARENT DASHBOARD MODAL =================
function openParentModal() {
  const currentUser = StorageManager.getCurrentUser();
  const modal = document.getElementById('parentModal');
  const content = document.getElementById('parentModalContent');
  if (!modal || !content) return;

  const quizResults = StorageManager.getQuizResults();
  const completedEntries = Object.entries(quizResults);
  const items = StorageManager.getItems();

  const childName = (currentUser && currentUser.childName) ? currentUser.childName : 'សិស្ស សុខ ពិសិដ្ឋ';
  const childGrade = (currentUser && currentUser.childGrade) ? currentUser.childGrade : 'ថ្នាក់ទី១';

  content.innerHTML = `
    <!-- Modal Header -->
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50 sticky top-0 z-10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-xl shadow-md">
          <i class="fa-solid fa-users"></i>
        </div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-800">ផ្ទាំងព័ត៌មានមាតាបិតា (Parent Portal)</span>
          <h3 class="text-lg sm:text-xl font-black text-slate-900">តាមដានការរៀនសូត្ររបស់កូន</h3>
        </div>
      </div>
      <button onclick="closeAllModals()" class="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
      <!-- Child Info Card -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            <i class="fa-solid fa-child"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-base">${childName}</h4>
            <p class="text-xs text-slate-500 font-medium">កម្រិតថ្នាក់៖ <strong class="text-blue-900">${childGrade}</strong> • សាលាអន្តរជាតិ ហេមតុន</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-center">
          <div class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
            <span class="block text-lg font-black text-blue-900">${completedEntries.length}</span>
            <span class="text-[10px] text-slate-500 font-medium">លំហាត់អនុវត្ត</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <span class="block text-lg font-black text-emerald-700">ល្អប្រសើរ</span>
            <span class="text-[10px] text-slate-500 font-medium">ស្ថានភាពរៀន</span>
          </div>
        </div>
      </div>

      <!-- Quizzes Completed by Child -->
      <div>
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-amber-600"></i>
          ប្រវត្តិលំហាត់ដែលកូនបានអនុវត្តរួចរាល់
        </h4>

        ${completedEntries.length === 0 ? `
          <div class="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            កូនរបស់អ្នកមិនទាន់បានធ្វើលំហាត់ណាមួយនៅឡើយទេ! សូមលើកទឹកចិត្តឱ្យកូនសាកល្បងធ្វើលំហាត់ក្នុងគេហទំព័រ។
          </div>
        ` : `
          <div class="space-y-2.5">
            ${completedEntries.map(([itemId, res]) => {
              const item = items.find(i => i.id === itemId);
              const title = item ? item.title : 'លំហាត់អនុវត្ត';
              const percent = res.percentage || 0;
              return `
                <div class="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                  <div class="truncate pr-3">
                    <p class="font-bold text-slate-900 truncate">${title}</p>
                    <span class="text-[11px] text-slate-400">${item ? item.grade : ''} • កាលបរិច្ឆេទ៖ ${res.completedAt ? res.completedAt.split('T')[0] : 'ថ្មីៗ'}</span>
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

      <!-- Advice for Parents -->
      <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
        <p class="font-bold flex items-center gap-1.5 mb-1 text-sm">
          <i class="fa-solid fa-lightbulb text-amber-600"></i>
          គន្លឹះជួយកូនរៀននៅផ្ទះពីសាលា ហេមតុន៖
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li>ចំណាយពេល ២០ នាទីក្នុងមួយថ្ងៃដើម្បីមើលវីដេអូបង្រៀនជាមួយកូន។</li>
          <li>សាកល្បងឱ្យកូនធ្វើកម្រងលំហាត់ (Quiz) ហើយលើកទឹកចិត្តកូនពេលឆ្លើយត្រូវ។</li>
          <li>ទាញយកសន្លឹកកិច្ចការ PDF មកឱ្យកូនហាត់សរសេរដៃផ្ទាល់។</li>
        </ul>
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

  const items = StorageManager.getItems();

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
  const items = StorageManager.getItems();
  const lessonsCount = items.filter(i => i.type === 'lesson').length;
  const exercisesCount = items.filter(i => i.type === 'exercise').length;
  const videosCount = items.filter(i => i.videoUrl && i.videoUrl.trim() !== '').length;
  const quizResults = StorageManager.getQuizResults();
  const completedCount = Object.keys(quizResults).length;

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
  let items = StorageManager.getItems();
  const bookmarks = StorageManager.getBookmarks();

  if (state.selectedProgram !== 'all') {
    items = items.filter(i => i.program === state.selectedProgram);
  }

  if (state.currentTab === 'lesson') {
    items = items.filter(i => i.type === 'lesson');
  } else if (state.currentTab === 'exercise') {
    items = items.filter(i => i.type === 'exercise');
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

  const items = getFilteredItems();
  const currentUser = StorageManager.getCurrentUser();
  const canEditAny = currentUser && currentUser.role === 'admin';
  const canEditTeacher = currentUser && currentUser.role === 'teacher';

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
    const isExercise = item.type === 'exercise';

    // សិទ្ធិកែប្រែ ឬលុប
    const canManageThis = canEditAny || (canEditTeacher && (!item.createdById || item.createdById === currentUser.id || item.teacher === currentUser.name));

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
                ${item.grade}
              </span>
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
            <span class="inline-block text-[11px] font-bold uppercase tracking-wider ${
              isExercise ? 'text-emerald-700' : 'text-blue-900'
            } mb-1">
              <i class="fa-solid ${isExercise ? 'fa-pen-to-square' : 'fa-book-open'} mr-1"></i>
              ${isExercise ? 'កម្រងលំហាត់' : 'មេរៀនទ្រឹស្តី'}
            </span>
            <h3 
              onclick="openDetailModal('${item.id}')"
              class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition cursor-pointer line-clamp-2 leading-snug"
            >
              ${item.title}
            </h3>
          </div>

          <p class="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            ${item.summary || 'ចុចដើម្បីចូលមើលខ្លឹមសារ និងព័ត៌មានលម្អិត...'}
          </p>
        </div>

        <div class="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-2 truncate">
            <div class="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
              ${(item.teacher || 'គ្រូ').charAt(0)}
            </div>
            <span class="truncate font-medium text-slate-700">${item.teacher || 'គ្រូបង្រៀន'}</span>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            ${hasVideo ? '<span class="text-red-600 font-semibold flex items-center gap-1" title="មានវីដេអូ"><i class="fa-solid fa-circle-play"></i> វីដេអូ</span>' : ''}
            ${hasQuestions ? `<span class="text-emerald-700 font-semibold flex items-center gap-1" title="មានសំណួរអនុវត្ត"><i class="fa-solid fa-list-check"></i> ${item.questions.length} សំណួរ</span>` : ''}
          </div>
        </div>

        <div class="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <button 
            onclick="openDetailModal('${item.id}')"
            class="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <i class="fa-solid fa-eye text-xs"></i>
            <span>អានមេរៀន</span>
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
      btn.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-900 text-white shadow-md transition';
    } else {
      btn.className = 'tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition';
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

  state.activeItem = item;
  StorageManager.incrementViews(id);

  const modal = document.getElementById('detailModal');
  const modalContent = document.getElementById('detailModalContent');
  if (!modal || !modalContent) return;

  const subj = getSubjectObj(item.subject);
  const badgeColor = getSubjectBadgeClass(subj.color);
  const hasQuestions = item.questions && item.questions.length > 0;

  let videoEmbedHtml = '';
  if (item.videoUrl && item.videoUrl.trim() !== '') {
    let embedSrc = item.videoUrl;
    if (embedSrc.includes('watch?v=')) {
      embedSrc = embedSrc.replace('watch?v=', 'embed/');
    } else if (embedSrc.includes('youtu.be/')) {
      const vidId = embedSrc.split('youtu.be/')[1].split('?')[0];
      embedSrc = `https://www.youtube.com/embed/${vidId}`;
    }

    videoEmbedHtml = `
      <div class="mb-6">
        <h4 class="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <i class="fa-solid fa-circle-play text-red-600"></i>
          វីដេអូពន្យល់មេរៀន
        </h4>
        <div class="video-container shadow-md">
          <iframe 
            src="${embedSrc}" 
            title="${item.title}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }

  let attachmentsHtml = '';
  if (item.attachments && item.attachments.length > 0) {
    attachmentsHtml = `
      <div class="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-paperclip text-blue-900"></i>
          ឯកសារភ្ជាប់ និងសន្លឹកកិច្ចការ
        </h4>
        <div class="space-y-2">
          ${item.attachments.map(att => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm">
              <div class="flex items-center gap-2.5 truncate">
                <i class="fa-solid fa-file-pdf text-red-600 text-lg"></i>
                <div>
                  <p class="font-bold text-slate-800 truncate">${att.name}</p>
                  <span class="text-xs text-slate-400">${att.size || 'ឯកសារ PDF'}</span>
                </div>
              </div>
              <button 
                onclick="alert('ឯកសារគំរូត្រូវបានទាញយកដោយជោគជ័យ!');"
                class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <i class="fa-solid fa-download"></i>
                ទាញយក
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

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
          item.type === 'exercise' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-900'
        }">
          ${item.type === 'exercise' ? 'លំហាត់' : 'មេរៀន'}
        </span>
      </div>
      <h2 class="text-lg sm:text-2xl font-black text-slate-900 mt-2 leading-snug">${item.title}</h2>
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
    </div>
  `;

  modal.classList.remove('hidden');
  renderMath();
}

// QUIZ MODAL
function openQuizModal(id, event) {
  if (event) event.stopPropagation();
  const item = StorageManager.getItemById(id);
  if (!item || !item.questions || item.questions.length === 0) {
    alert('មេរៀននេះមិនទាន់មានសំណួរអនុវត្តនៅឡើយទេ!');
    return;
  }

  state.activeItem = item;
  state.quizAnswers = {};
  state.quizSubmitted = false;

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
  item.questions.forEach((q, idx) => {
    if (state.quizAnswers[idx] === q.answer) {
      score++;
    }
  });

  state.quizSubmitted = true;
  StorageManager.saveQuizResult(item.id, score, total);
  renderStats();
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
function openAddModal() {
  if (!StorageManager.hasPermission('create_lesson')) {
    alert('មានតែគណនីគ្រូបង្រៀន ឬ Admin ប៉ុណ្ណោះដែលមានសិទ្ធិបន្ថែមមេរៀន/លំហាត់!');
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
  populateTeacherGradeSelect(item.grade || 'ថ្នាក់ទី១');
  form.itemTeacher.value = item.teacher || '';
  form.itemTitle.value = item.title || '';
  form.itemSummary.value = item.summary || '';
  form.itemVideoUrl.value = item.videoUrl || '';
  form.itemContent.value = item.content || '';

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

  const itemData = {
    type: form.itemType.value,
    title: form.itemTitle.value.trim(),
    subject: form.itemSubject.value,
    grade: selectedGrade,
    program: program,
    teacher: form.itemTeacher.value.trim() || 'លោកគ្រូ/អ្នកគ្រូ',
    school: SCHOOL_INFO.nameKhmer,
    summary: form.itemSummary.value.trim(),
    videoUrl: form.itemVideoUrl.value.trim(),
    content: form.itemContent.value.trim(),
    attachments: [
      { name: 'ឯកសារមេរៀន_ហែមតុន.pdf', size: '1.5 MB', url: '#' }
    ],
    questions: questions
  };

  if (state.editingItemId) {
    StorageManager.updateItem(state.editingItemId, itemData);
    showToast('បានកែសម្រួលមេរៀនដោយជោគជ័យ!', 'success');
  } else {
    StorageManager.addItem(itemData);
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
    renderCards();
    renderSubjectFilters();
    renderStats();
    renderUserNav();
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
  renderUserNav();
  renderProgramTabs();
  renderSubjectFilters();
  renderGradeFilter();
  renderStats();
  renderCards();
  setupEventListeners();

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
