/**
 * ការគ្រប់គ្រងការរក្សាទុកទិន្នន័យ និងគណនីអ្នកប្រើប្រាស់ (Storage & User Auth Manager)
 * Handles LocalStorage persistence, Users, Roles (Admin, Teacher, Student, Parent), and Permissions.
 */

const STORAGE_KEYS = {
  ITEMS: 'hampton_eduhub_items_v2',
  BOOKMARKS: 'hampton_eduhub_bookmarks_v2',
  CURRENT_USER: 'hampton_eduhub_current_user_v2',
  USERS: 'hampton_eduhub_users_v2',
  COMPLETED_QUIZZES: 'hampton_eduhub_quizzes_v2',
  QUIZ_HISTORY: 'hampton_eduhub_quiz_history_v2',
  HOMEWORK_SUBMISSIONS: 'hampton_eduhub_homeworks_v2',
  FEATURED_MEDIA: 'hampton_eduhub_featured_media_v2',
  ACTIVITY_LOGS: 'hampton_eduhub_activity_logs_v3'
};

// ព័ត៌មានតួនាទីទាំង ៥ ក្នុងប្រព័ន្ធ (Single Source of Truth)
const ROLE_META = {
  admin: {
    name: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)',
    short: 'Admin',
    icon: 'fa-user-shield',
    bg: 'bg-red-600',
    badge: 'bg-red-100 text-red-800 border-red-300',
    dot: 'bg-red-600'
  },
  head: {
    name: 'ប្រធានផ្នែក (Head)',
    short: 'ប្រធានផ្នែក',
    icon: 'fa-user-tie',
    bg: 'bg-purple-700',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    dot: 'bg-purple-600'
  },
  teacher: {
    name: 'លោកគ្រូ-អ្នកគ្រូ (Teacher)',
    short: 'គ្រូបង្រៀន',
    icon: 'fa-chalkboard-user',
    bg: 'bg-blue-900',
    badge: 'bg-blue-100 text-blue-900 border-blue-300',
    dot: 'bg-blue-600'
  },
  student: {
    name: 'សិស្សានុសិស្ស (Student)',
    short: 'សិស្ស',
    icon: 'fa-user-graduate',
    bg: 'bg-emerald-600',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dot: 'bg-emerald-600'
  },
  parent: {
    name: 'មាតាបិតា (Parent)',
    short: 'មាតាបិតា',
    icon: 'fa-users',
    bg: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    dot: 'bg-amber-600'
  }
};

// គណនីគំរូលំនាំដើម (Default Seed Users)
const INITIAL_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    name: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)',
    role: 'admin',
    roleNameKhmer: ROLE_META.admin.name,
    avatarIcon: ROLE_META.admin.icon,
    avatarBg: ROLE_META.admin.bg,
    email: 'admin@hampton.edu.kh',
    phone: '012 345 678',
    grade: 'គ្រប់កម្រិតថ្នាក់',
    createdAt: '2026-10-01'
  },
  {
    id: 'user-head-1',
    username: 'head',
    password: 'head123',
    name: 'ប្រធានផ្នែក សិក្សាធិការ',
    role: 'head',
    roleNameKhmer: ROLE_META.head.name,
    avatarIcon: ROLE_META.head.icon,
    avatarBg: ROLE_META.head.bg,
    email: 'head@hampton.edu.kh',
    phone: '012 555 888',
    grade: 'គ្រប់គ្រងគ្រូ សិស្ស និងមាតាបិតា',
    createdAt: '2026-10-02'
  },
  {
    id: 'user-teacher-1',
    username: 'teacher',
    password: 'teacher123',
    name: 'លោកគ្រូ អ៊ុក វិបុល',
    role: 'teacher',
    roleNameKhmer: ROLE_META.teacher.name,
    avatarIcon: ROLE_META.teacher.icon,
    avatarBg: ROLE_META.teacher.bg,
    email: 'vibol.ouk@hampton.edu.kh',
    phone: '098 765 432',
    grade: 'ថ្នាក់ទី១, ថ្នាក់ទី២',
    assignedGrades: ['ថ្នាក់ទី១', 'ថ្នាក់ទី២'],
    createdAt: '2026-10-05'
  },
  {
    id: 'user-student-1',
    username: 'student',
    password: 'student123',
    name: 'សិស្ស សុខ ពិសិដ្ឋ',
    role: 'student',
    roleNameKhmer: ROLE_META.student.name,
    avatarIcon: ROLE_META.student.icon,
    avatarBg: ROLE_META.student.bg,
    email: 'piseth.sok@student.hampton.edu.kh',
    phone: '087 112 233',
    grade: 'ថ្នាក់ទី១',
    createdById: 'user-teacher-1',
    createdAt: '2026-10-10'
  },
  {
    id: 'user-student-2',
    username: 'maly',
    password: 'student123',
    name: 'សិស្ស ចាន់ ម៉ាលី',
    role: 'student',
    roleNameKhmer: ROLE_META.student.name,
    avatarIcon: ROLE_META.student.icon,
    avatarBg: ROLE_META.student.bg,
    email: 'maly.chan@student.hampton.edu.kh',
    phone: '087 223 344',
    grade: 'ថ្នាក់ទី២',
    createdById: 'user-teacher-1',
    createdAt: '2026-10-11'
  },
  {
    id: 'user-parent-1',
    username: 'parent',
    password: 'parent123',
    name: 'អាណាព្យាបាល កែវ សម្បត្តិ',
    role: 'parent',
    roleNameKhmer: ROLE_META.parent.name,
    avatarIcon: ROLE_META.parent.icon,
    avatarBg: ROLE_META.parent.bg,
    email: 'sambath.keo@gmail.com',
    phone: '092 889 900',
    childId: 'user-student-1',
    childName: 'សិស្ស សុខ ពិសិដ្ឋ',
    childGrade: 'ថ្នាក់ទី១',
    grade: 'ថ្នាក់ទី១',
    createdAt: '2026-10-12'
  }
];

const StorageManager = {
  // ================= USERS & AUTH =================
  getUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        this.saveUsers(INITIAL_USERS);
        localStorage.setItem('hampton_eduhub_users_migrated_v3', '1');
        return INITIAL_USERS;
      }
      const users = JSON.parse(data);
      if (!localStorage.getItem('hampton_eduhub_users_migrated_v3') && Array.isArray(users)) {
        let changed = false;
        INITIAL_USERS.forEach(seed => {
          const existing = users.find(u => u.id === seed.id || u.username === seed.username);
          if (!existing) {
            users.push(seed);
            changed = true;
          } else {
            if (seed.childId && !existing.childId) { existing.childId = seed.childId; changed = true; }
            if (seed.assignedGrades && !existing.assignedGrades) { existing.assignedGrades = seed.assignedGrades; changed = true; }
            if (seed.createdById && !existing.createdById) { existing.createdById = seed.createdById; changed = true; }
          }
        });
        if (changed) this.saveUsers(users);
        localStorage.setItem('hampton_eduhub_users_migrated_v3', '1');
      }
      return users;
    } catch (e) {
      console.error('Error reading users:', e);
      return INITIAL_USERS;
    }
  },

  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving users:', e);
      return false;
    }
  },

  getCurrentUser() {
    try {
      if (!localStorage.getItem('hampton_eduhub_auth_v3')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.setItem('hampton_eduhub_auth_v3', '1');
        return null;
      }
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (!parsed || !parsed.id) return null;
      const fresh = this.getUsers().find(u => u.id === parsed.id);
      return fresh || parsed;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    try {
      localStorage.setItem('hampton_eduhub_auth_v3', '1');
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } else {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      }
      return true;
    } catch (e) {
      console.error('Error setting current user:', e);
      return false;
    }
  },

  // ផ្ទៀងផ្ទាត់ការ Login
  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
      u.password === password
    );

    if (user) {
      this.setCurrentUser(user);
      this.recordActivity('login', `ចូលប្រព័ន្ធជា ${user.roleNameKhmer}`);
      return { success: true, user };
    }
    return { success: false, message: 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!' };
  },

  logout() {
    const curr = this.getCurrentUser();
    if (curr) {
      this.recordActivity('logout', 'ចាកចេញពីប្រព័ន្ធ');
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // តួនាទីដែលអ្នកប្រើប្រាស់បច្ចុប្បន្នអាចបង្កើត ឬគ្រប់គ្រងបាន
  getManageableRoles(actor = this.getCurrentUser()) {
    if (!actor) return [];
    if (actor.role === 'admin') return ['student', 'parent', 'teacher', 'head', 'admin'];
    if (actor.role === 'head') return ['student', 'parent', 'teacher'];
    if (actor.role === 'teacher') return ['student', 'parent'];
    return [];
  },

  canManageUser(actor, targetUserOrRole) {
    if (!actor) return false;
    const targetRole = typeof targetUserOrRole === 'string' ? targetUserOrRole : targetUserOrRole?.role;
    if (!targetRole) return false;
    if (actor.role === 'admin') return true;
    if (actor.role === 'head') return ['teacher', 'student', 'parent'].includes(targetRole);
    if (actor.role === 'teacher') return ['student', 'parent'].includes(targetRole);
    return false;
  },

  // បង្កើត User ថ្មី
  addUser(userData, options = {}) {
    const users = this.getUsers();
    const actor = this.getCurrentUser();

    if (options.isSelfRegister) {
      if (!['student', 'parent'].includes(userData.role)) {
        return { success: false, message: 'ការចុះឈ្មោះដោយខ្លួនឯងអនុញ្ញាតតែតួនាទី សិស្ស ឬ មាតាបិតា ប៉ុណ្ណោះ!' };
      }
    } else if (!actor || !this.canManageUser(actor, userData.role)) {
      return { success: false, message: 'អ្នកមិនមានសិទ្ធិបង្កើតគណនីតួនាទីនេះទេ!' };
    }

    const exists = users.some(u => u.username.toLowerCase().trim() === userData.username.toLowerCase().trim());
    if (exists) {
      return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានរួចហើយ សូមជ្រើសរើសឈ្មោះផ្សេង!' };
    }

    const roleInfo = ROLE_META[userData.role] || ROLE_META.student;

    // ភ្ជាប់ព័ត៌មានកូនដោយស្វ័យប្រវត្តិបើជាមាតាបិតា
    let childId = userData.childId || '';
    let childName = userData.childName ? userData.childName.trim() : '';
    let childGrade = userData.childGrade ? userData.childGrade.trim() : (userData.grade || '');
    if (userData.role === 'parent' && childId) {
      const childObj = users.find(u => u.id === childId);
      if (childObj) {
        childName = childObj.name;
        childGrade = childObj.grade;
      }
    }

    const newUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      username: userData.username.trim(),
      password: userData.password,
      name: userData.name.trim(),
      role: userData.role,
      roleNameKhmer: roleInfo.name,
      avatarIcon: roleInfo.icon,
      avatarBg: roleInfo.bg,
      email: userData.email ? userData.email.trim() : `${userData.username.trim()}@hampton.edu.kh`,
      phone: userData.phone ? userData.phone.trim() : '',
      grade: userData.role === 'parent' ? (childGrade || userData.grade || 'ថ្នាក់ទី១') : (userData.grade || 'ទូទៅ'),
      childId,
      childName,
      childGrade,
      createdById: actor ? actor.id : 'self',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    this.saveUsers(users);
    if (actor) {
      this.recordActivity('create_user', `បង្កើតគណនី ${newUser.name} (${roleInfo.short})`);
    }
    return { success: true, user: newUser };
  },

  // កែប្រែ User
  updateUser(id, updatedFields) {
    const users = this.getUsers();
    const actor = this.getCurrentUser();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'រកមិនឃើញអ្នកប្រើប្រាស់នេះទេ' };

    const target = users[index];
    if (!this.canManageUser(actor, target) || (updatedFields.role && !this.canManageUser(actor, updatedFields.role))) {
      return { success: false, message: 'អ្នកមិនមានសិទ្ធិកែប្រែគណនីនេះទេ!' };
    }

    if (updatedFields.username) {
      const duplicate = users.some(u => u.id !== id && u.username.toLowerCase().trim() === updatedFields.username.toLowerCase().trim());
      if (duplicate) {
        return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានអ្នកប្រើប្រាស់រួចហើយ!' };
      }
    }

    if (updatedFields.role && ROLE_META[updatedFields.role]) {
      updatedFields.roleNameKhmer = ROLE_META[updatedFields.role].name;
      updatedFields.avatarIcon = ROLE_META[updatedFields.role].icon;
      updatedFields.avatarBg = ROLE_META[updatedFields.role].bg;
    }

    users[index] = { ...target, ...updatedFields };
    this.saveUsers(users);

    if (actor && actor.id === id) {
      this.setCurrentUser(users[index]);
    }
    if (actor) {
      this.recordActivity('update_user', `កែប្រែព័ត៌មានគណនី ${users[index].name}`);
    }

    return { success: true, user: users[index] };
  },

  // លុប User
  deleteUser(id) {
    const users = this.getUsers();
    const actor = this.getCurrentUser();
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return { success: false, message: 'រកមិនឃើញអ្នកប្រើប្រាស់' };

    if (!this.canManageUser(actor, userToDelete)) {
      return { success: false, message: 'អ្នកមិនមានសិទ្ធិលុបគណនីនេះទេ!' };
    }

    const admins = users.filter(u => u.role === 'admin');
    if (userToDelete.role === 'admin' && admins.length <= 1) {
      return { success: false, message: 'មិនអាចលុប Admin ចុងក្រោយបានទេ!' };
    }

    const filtered = users.filter(u => u.id !== id);
    this.saveUsers(filtered);

    if (actor && actor.id === id) {
      this.setCurrentUser(null);
    }
    if (actor) {
      this.recordActivity('delete_user', `លុបគណនី ${userToDelete.name}`);
    }

    return { success: true };
  },

  // រកព័ត៌មានកូនរបស់មាតាបិតា
  getParentChild(parentUser) {
    if (!parentUser) return null;
    const users = this.getUsers();
    let child = null;
    if (parentUser.childId) {
      child = users.find(u => u.id === parentUser.childId);
    }
    if (!child && parentUser.childName) {
      const targetName = parentUser.childName.trim().toLowerCase();
      child = users.find(u => u.role === 'student' && u.name.trim().toLowerCase() === targetName);
    }
    if (child) return child;
    return {
      id: parentUser.childId || '',
      name: parentUser.childName || 'សិស្ស',
      grade: parentUser.childGrade || parentUser.grade || 'ថ្នាក់ទី១',
      username: ''
    };
  },

  // ពិនិត្យថាតើ User អាចចូលមើលមេរៀន/លំហាត់នេះបានឬទេ (តាមថ្នាក់ ឬ Assign ដោយគ្រូ)
  canUserAccessItem(user, item) {
    if (!user || !item) return false;
    if (['admin', 'head', 'teacher'].includes(user.role)) return true;

    const assignedIds = Array.isArray(item.assignedStudentIds) ? item.assignedStudentIds : [];
    if (user.role === 'student') {
      return item.grade === user.grade || item.grade === 'ទូទៅ' || assignedIds.includes(user.id);
    }
    if (user.role === 'parent') {
      const child = this.getParentChild(user);
      const childGrade = child ? child.grade : (user.childGrade || user.grade);
      return item.grade === childGrade || item.grade === 'ទូទៅ' || (child && child.id && assignedIds.includes(child.id));
    }
    return false;
  },

  // ================= សិទ្ធិប្រើប្រាស់ (PERMISSIONS) =================
  // - 'admin': គ្រប់គ្រង Full System ១០០%
  // - 'head' (ប្រធានផ្នែក): មើល និងគ្រប់គ្រងលើគ្រូ សិស្ស និងមាតាបិតា + មេរៀន + ពិន្ទុ + កំណត់ត្រាប្រព័ន្ធ
  // - 'teacher' (គ្រូ): បង្កើត User សិស្ស/មាតាបិតា, បង្កើត/កែមេរៀន, តាមដានសិស្ស & ដាក់ពិន្ទុ
  // - 'student' (សិស្ស): ចូលរៀន/ធ្វើលំហាត់/កិច្ចការផ្ទះតែថ្នាក់ខ្លួន ឬមេរៀនគ្រូ Assign, System Record
  // - 'parent' (មាតាបិតា): តាមដាន និងមើលព័ត៌មាន/ពិន្ទុ/សកម្មភាពកូនរបស់ខ្លួន
  hasPermission(action, targetItem = null) {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (user.role === 'admin') return true;

    switch (action) {
      case 'manage_users':
        return user.role === 'head';

      case 'manage_students':
        return user.role === 'teacher' || user.role === 'head';

      case 'backup_system':
        return false; // មានតែ Admin ប៉ុណ្ណោះ

      case 'create_lesson':
        return user.role === 'teacher' || user.role === 'head';

      case 'edit_lesson':
      case 'delete_lesson':
        if (user.role === 'head') return true;
        if (user.role === 'teacher') {
          if (!targetItem) return true;
          return !targetItem.createdById || targetItem.createdById === user.id || targetItem.teacher === user.name;
        }
        return false;

      case 'access_item':
        return this.canUserAccessItem(user, targetItem);

      case 'take_quiz':
      case 'submit_homework':
        if (user.role === 'student') return !targetItem || this.canUserAccessItem(user, targetItem);
        return ['head', 'teacher', 'parent'].includes(user.role);

      case 'view_parent_dashboard':
        return user.role === 'parent' || user.role === 'head';

      case 'view_scoreboard':
      case 'view_activity_logs':
      case 'grade_homework':
      case 'edit_featured_media':
        return user.role === 'teacher' || user.role === 'head';

      case 'view_teacher_monitor':
        return user.role === 'head';

      case 'view_own_records':
        return user.role === 'student';

      case 'bookmark':
        return true;

      default:
        return false;
    }
  },

  // ================= SYSTEM ACTIVITY RECORDS =================
  getActivityLogs(filters = {}) {
    try {
      let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
      if (filters.userId) {
        logs = logs.filter(l => l.userId === filters.userId);
      }
      if (Array.isArray(filters.roles) && filters.roles.length > 0) {
        logs = logs.filter(l => filters.roles.includes(l.userRole));
      }
      return logs;
    } catch (e) {
      return [];
    }
  },

  recordActivity(action, details, item = null) {
    try {
      const user = this.getCurrentUser();
      if (!user) return null;
      const logs = this.getActivityLogs();
      const entry = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userGrade: user.grade || '',
        action,
        details,
        itemId: item ? item.id : '',
        itemTitle: item ? item.title : '',
        timestamp: new Date().toISOString()
      };
      logs.unshift(entry);
      if (logs.length > 300) logs.length = 300;
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
      return entry;
    } catch (e) {
      console.error('Error recording activity:', e);
      return null;
    }
  },

  // ================= CONTENT ITEMS =================
  getItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!data) {
        this.saveItems(SAMPLE_ITEMS);
        localStorage.setItem('hampton_eduhub_migrated_v26', '1');
        localStorage.setItem('hampton_eduhub_migrated_v30', '1');
        return SAMPLE_ITEMS;
      }
      const items = JSON.parse(data);
      if (!localStorage.getItem('hampton_eduhub_migrated_v30') && Array.isArray(items)) {
        let changed = false;
        items.forEach(item => {
          if (item && item.videoUrl && item.videoUrl.includes('dQw4w9WgXcQ')) {
            item.videoUrl = 'https://www.youtube.com/embed/FE-40gqhuHg';
            changed = true;
          }
          if (item && (item.id === 'hpt-2' || item.id === 'hpt-11') && !item.createdById) {
            item.createdById = 'user-teacher-1';
            changed = true;
          }
          if (item && item.id === 'hpt-11' && !Array.isArray(item.assignedStudentIds)) {
            item.assignedStudentIds = ['user-student-1'];
            changed = true;
          }
        });
        if (typeof SAMPLE_ITEMS !== 'undefined') {
          ['hpt-11', 'hpt-12'].forEach(seedId => {
            const seed = SAMPLE_ITEMS.find(i => i.id === seedId);
            if (seed && !items.some(i => i.id === seedId)) {
              items.push(seed);
              changed = true;
            }
          });
        }
        if (changed) this.saveItems(items);
        localStorage.setItem('hampton_eduhub_migrated_v26', '1');
        localStorage.setItem('hampton_eduhub_migrated_v30', '1');
      }
      return items;
    } catch (e) {
      console.error('Error reading items:', e);
      return SAMPLE_ITEMS;
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return true;
    } catch (e) {
      console.error('Error saving items:', e);
      return false;
    }
  },

  getItemById(id) {
    const items = this.getItems();
    return items.find(item => item.id === id) || null;
  },

  addItem(itemData) {
    const items = this.getItems();
    const currUser = this.getCurrentUser();
    const newItem = {
      ...itemData,
      id: 'hpt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      school: SCHOOL_INFO.nameKhmer,
      createdById: currUser ? currUser.id : 'system',
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      bookmarks: 0
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  },

  updateItem(id, updatedData) {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { 
        ...items[index], 
        ...updatedData, 
        school: SCHOOL_INFO.nameKhmer,
        updatedAt: new Date().toISOString().split('T')[0] 
      };
      this.saveItems(items);
      return items[index];
    }
    return null;
  },

  deleteItem(id) {
    const items = this.getItems();
    const filtered = items.filter(item => item.id !== id);
    this.saveItems(filtered);
    this.removeBookmark(id);
    return true;
  },

  incrementViews(id) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.views = (item.views || 0) + 1;
      this.saveItems(items);
    }
  },

  // ================= BOOKMARKS =================
  getBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isBookmarked(id) {
    const bookmarks = this.getBookmarks();
    return bookmarks.includes(id);
  },

  toggleBookmark(id) {
    let bookmarks = this.getBookmarks();
    const isSaved = bookmarks.includes(id);
    const items = this.getItems();
    const item = items.find(i => i.id === id);

    if (isSaved) {
      bookmarks = bookmarks.filter(bId => bId !== id);
      if (item && item.bookmarks > 0) item.bookmarks--;
    } else {
      bookmarks.push(id);
      if (item) item.bookmarks = (item.bookmarks || 0) + 1;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      this.saveItems(items);
    } catch (e) {
      console.error(e);
    }

    return !isSaved;
  },

  removeBookmark(id) {
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(bId => bId !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  // ================= QUIZ RESULTS & SCOREBOARD =================
  saveQuizResult(itemId, score, total) {
    try {
      const currUser = this.getCurrentUser();
      const item = this.getItemById(itemId);
      const history = this.getQuizHistory();
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_QUIZZES) || '{}');
      const record = {
        id: 'quiz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        itemId,
        itemTitle: item ? item.title : 'លំហាត់ / ប្រឡង',
        itemGrade: item ? item.grade : '',
        userId: currUser ? currUser.id : 'guest',
        userName: currUser ? currUser.name : 'ភ្ញៀវ',
        userRole: currUser ? currUser.role : 'guest',
        score,
        total,
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        completedAt: new Date().toISOString()
      };
      existing[itemId] = record;
      localStorage.setItem(STORAGE_KEYS.COMPLETED_QUIZZES, JSON.stringify(existing));

      history.unshift(record);
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
      this.recordActivity('submit_quiz', `ធ្វើលំហាត់/ប្រឡងបានពិន្ទុ ${score}/${total} (${record.percentage}%)`, item);
    } catch (e) {
      console.error(e);
    }
  },

  getQuizResults() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_QUIZZES) || '{}');
    } catch (e) {
      return {};
    }
  },

  getQuizHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      if (data) return JSON.parse(data);
      // Fallback migration from COMPLETED_QUIZZES if history not populated yet
      const legacy = Object.entries(this.getQuizResults()).map(([itemId, rec]) => ({
        id: rec.id || ('legacy-' + itemId),
        itemId,
        itemTitle: rec.itemTitle || (this.getItemById(itemId)?.title || 'លំហាត់'),
        itemGrade: rec.itemGrade || (this.getItemById(itemId)?.grade || ''),
        ...rec
      }));
      return legacy;
    } catch (e) {
      return [];
    }
  },

  // ================= HOMEWORK SUBMISSIONS =================
  getSubmissions(itemId = null) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS) || '[]');
      return itemId ? all.filter(s => s.itemId === itemId) : all;
    } catch (e) {
      return [];
    }
  },

  addSubmission({ itemId, driveLink, note }) {
    const currUser = this.getCurrentUser();
    const item = this.getItemById(itemId);
    const all = this.getSubmissions();
    const submission = {
      id: 'hw-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId,
      itemTitle: item ? item.title : 'កិច្ចការផ្ទះ',
      itemGrade: item ? item.grade : '',
      userId: currUser ? currUser.id : 'guest',
      userName: currUser ? currUser.name : 'សិស្ស',
      userGrade: currUser ? (currUser.grade || '') : '',
      driveLink: (driveLink || '').trim(),
      note: (note || '').trim(),
      status: 'submitted',
      score: null,
      maxScore: 100,
      feedback: '',
      submittedAt: new Date().toISOString(),
      gradedAt: null
    };
    all.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(all));
    this.recordActivity('submit_homework', `ប្រគល់កិច្ចការផ្ទះ៖ ${submission.note || submission.driveLink}`, item);
    return submission;
  },

  gradeSubmission(submissionId, score, maxScore, feedback) {
    const all = this.getSubmissions();
    const idx = all.findIndex(s => s.id === submissionId);
    if (idx === -1) return null;
    const currUser = this.getCurrentUser();
    all[idx] = {
      ...all[idx],
      score: Number(score),
      maxScore: Number(maxScore) || 100,
      feedback: (feedback || '').trim(),
      status: 'graded',
      gradedBy: currUser ? currUser.name : 'គ្រូបង្រៀន',
      gradedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(all));
    this.recordActivity('grade_homework', `ដាក់ពិន្ទុកិច្ចការ ${all[idx].userName} (${score}/${all[idx].maxScore})`);
    return all[idx];
  },

  // ================= FEATURED PAGE MEDIA =================
  getFeaturedMedia() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEATURED_MEDIA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveFeaturedMedia(media) {
    try {
      localStorage.setItem(STORAGE_KEYS.FEATURED_MEDIA, JSON.stringify(media));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  resetFeaturedMedia() {
    localStorage.removeItem(STORAGE_KEYS.FEATURED_MEDIA);
  },

  // ================= BACKUP & RESTORE =================
  exportData() {
    const data = {
      school: SCHOOL_INFO.nameKhmer,
      version: '3.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      items: this.getItems(),
      bookmarks: this.getBookmarks(),
      quizResults: this.getQuizResults(),
      quizHistory: this.getQuizHistory(),
      submissions: this.getSubmissions(),
      activityLogs: this.getActivityLogs(),
      featuredMedia: this.getFeaturedMedia()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hampton_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData(jsonContent) {
    try {
      const data = JSON.parse(jsonContent);
      let count = 0;
      if (Array.isArray(data.items)) {
        this.saveItems(data.items);
        count = data.items.length;
      }
      if (Array.isArray(data.users)) {
        this.saveUsers(data.users);
      }
      if (Array.isArray(data.bookmarks)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
      }
      if (Array.isArray(data.quizHistory)) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(data.quizHistory));
      }
      if (Array.isArray(data.submissions)) {
        localStorage.setItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS, JSON.stringify(data.submissions));
      }
      if (Array.isArray(data.activityLogs)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(data.activityLogs));
      }
      if (data.featuredMedia) {
        this.saveFeaturedMedia(data.featuredMedia);
      }
      return { success: true, count };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  resetToDefault() {
    this.saveItems(SAMPLE_ITEMS);
    this.saveUsers(INITIAL_USERS);
    this.setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.HOMEWORK_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.FEATURED_MEDIA);
    return true;
  }
};
