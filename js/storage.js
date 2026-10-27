/**
 * ការគ្រប់គ្រងការរក្សាទុកទិន្នន័យ និងគណនីអ្នកប្រើប្រាស់ (Storage & User Auth Manager)
 * Handles LocalStorage persistence, Users, Roles (Admin, Teacher, Student, Parent), and Permissions.
 */

const STORAGE_KEYS = {
  ITEMS: 'hampton_eduhub_items_v2',
  BOOKMARKS: 'hampton_eduhub_bookmarks_v2',
  CURRENT_USER: 'hampton_eduhub_current_user_v2',
  USERS: 'hampton_eduhub_users_v2',
  COMPLETED_QUIZZES: 'hampton_eduhub_quizzes_v2'
};

// គណនីគំរូលំនាំដើម (Default Seed Users)
const INITIAL_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    name: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin)',
    role: 'admin',
    roleNameKhmer: 'អ្នកគ្រប់គ្រង (Admin)',
    avatarIcon: 'fa-user-shield',
    avatarBg: 'bg-red-600',
    email: 'admin@hampton.edu.kh',
    phone: '012 345 678',
    grade: 'គ្រប់កម្រិតថ្នាក់',
    createdAt: '2026-10-01'
  },
  {
    id: 'user-teacher-1',
    username: 'teacher',
    password: 'teacher123',
    name: 'លោកគ្រូ អ៊ុក វិបុល',
    role: 'teacher',
    roleNameKhmer: 'លោកគ្រូ-អ្នកគ្រូ (Teacher)',
    avatarIcon: 'fa-chalkboard-user',
    avatarBg: 'bg-blue-900',
    email: 'vibol.ouk@hampton.edu.kh',
    phone: '098 765 432',
    grade: 'បឋមសិក្សា & English',
    createdAt: '2026-10-05'
  },
  {
    id: 'user-student-1',
    username: 'student',
    password: 'student123',
    name: 'សិស្ស សុខ ពិសិដ្ឋ',
    role: 'student',
    roleNameKhmer: 'សិស្សានុសិស្ស (Student)',
    avatarIcon: 'fa-user-graduate',
    avatarBg: 'bg-emerald-600',
    email: 'piseth.sok@student.hampton.edu.kh',
    phone: '087 112 233',
    grade: 'ថ្នាក់ទី១',
    createdAt: '2026-10-10'
  },
  {
    id: 'user-parent-1',
    username: 'parent',
    password: 'parent123',
    name: 'អាណាព្យាបាល កែវ សម្បត្តិ',
    role: 'parent',
    roleNameKhmer: 'មាតាបិតា (Parent)',
    avatarIcon: 'fa-users',
    avatarBg: 'bg-amber-600',
    email: 'sambath.keo@gmail.com',
    phone: '092 889 900',
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
        return INITIAL_USERS;
      }
      return JSON.parse(data);
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
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) {
        // លំនាំដើម៖ ចូលប្រើជា Admin ដើម្បីងាយស្រួលសាកល្បង ឬជ្រើសរើស
        const defaultAdmin = INITIAL_USERS[0];
        this.setCurrentUser(defaultAdmin);
        return defaultAdmin;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user) {
    try {
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
      return { success: true, user };
    }
    return { success: false, message: 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ!' };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // បង្កើត User ថ្មី
  addUser(userData) {
    const users = this.getUsers();
    
    // ពិនិត្យឈ្មោះគណនីជាន់គ្នា
    const exists = users.some(u => u.username.toLowerCase().trim() === userData.username.toLowerCase().trim());
    if (exists) {
      return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានរួចហើយ សូមជ្រើសរើសឈ្មោះផ្សេង!' };
    }

    const roleMap = {
      admin: { name: 'អ្នកគ្រប់គ្រង (Admin)', icon: 'fa-user-shield', bg: 'bg-red-600' },
      teacher: { name: 'លោកគ្រូ-អ្នកគ្រូ (Teacher)', icon: 'fa-chalkboard-user', bg: 'bg-blue-900' },
      student: { name: 'សិស្សានុសិស្ស (Student)', icon: 'fa-user-graduate', bg: 'bg-emerald-600' },
      parent: { name: 'មាតាបិតា (Parent)', icon: 'fa-users', bg: 'bg-amber-600' }
    };

    const roleInfo = roleMap[userData.role] || roleMap.student;

    const newUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      username: userData.username.trim(),
      password: userData.password,
      name: userData.name.trim(),
      role: userData.role,
      roleNameKhmer: roleInfo.name,
      avatarIcon: roleInfo.icon,
      avatarBg: roleInfo.bg,
      email: userData.email ? userData.email.trim() : `${userData.username}@hampton.edu.kh`,
      phone: userData.phone ? userData.phone.trim() : '',
      grade: userData.grade || 'ទូទៅ',
      childName: userData.childName ? userData.childName.trim() : '',
      childGrade: userData.childGrade ? userData.childGrade.trim() : '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  },

  // កែប្រែ User
  updateUser(id, updatedFields) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return { success: false, message: 'រកមិនឃើញអ្នកប្រើប្រាស់នេះទេ' };

    // ពិនិត្យ username កុំឱ្យស្ទួនជាមួយអ្នកផ្សេង
    if (updatedFields.username) {
      const duplicate = users.some(u => u.id !== id && u.username.toLowerCase().trim() === updatedFields.username.toLowerCase().trim());
      if (duplicate) {
        return { success: false, message: 'ឈ្មោះគណនី (Username) នេះមានអ្នកប្រើប្រាស់រួចហើយ!' };
      }
    }

    const roleMap = {
      admin: { name: 'អ្នកគ្រប់គ្រង (Admin)', icon: 'fa-user-shield', bg: 'bg-red-600' },
      teacher: { name: 'លោកគ្រូ-អ្នកគ្រូ (Teacher)', icon: 'fa-chalkboard-user', bg: 'bg-blue-900' },
      student: { name: 'សិស្សានុសិស្ស (Student)', icon: 'fa-user-graduate', bg: 'bg-emerald-600' },
      parent: { name: 'មាតាបិតា (Parent)', icon: 'fa-users', bg: 'bg-amber-600' }
    };

    if (updatedFields.role && roleMap[updatedFields.role]) {
      updatedFields.roleNameKhmer = roleMap[updatedFields.role].name;
      updatedFields.avatarIcon = roleMap[updatedFields.role].icon;
      updatedFields.avatarBg = roleMap[updatedFields.role].bg;
    }

    users[index] = { ...users[index], ...updatedFields };
    this.saveUsers(users);

    // បើជា current user ត្រូវ update តាមដែរ
    const curr = this.getCurrentUser();
    if (curr && curr.id === id) {
      this.setCurrentUser(users[index]);
    }

    return { success: true, user: users[index] };
  },

  // លុប User (Admin មិនអាចលុបខ្លួនឯងបានទេ ប្រសិនបើជា admin ចុងក្រោយ)
  deleteUser(id) {
    const users = this.getUsers();
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return { success: false, message: 'រកមិនឃើញអ្នកប្រើប្រាស់' };

    const admins = users.filter(u => u.role === 'admin');
    if (userToDelete.role === 'admin' && admins.length <= 1) {
      return { success: false, message: 'មិនអាចលុប Admin ចុងក្រោយបានទេ!' };
    }

    const filtered = users.filter(u => u.id !== id);
    this.saveUsers(filtered);

    // បើលុបត្រូវចំ current user
    const curr = this.getCurrentUser();
    if (curr && curr.id === id) {
      this.setCurrentUser(filtered[0] || null);
    }

    return { success: true };
  },

  // ================= សិទ្ធិប្រើប្រាស់ (PERMISSIONS) =================
  // កំណត់សិទ្ធិតាមតួនាទី៖
  // - 'admin': ធ្វើអ្វីៗបានទាំងអស់ (Manage Users, Manage All Content, Backup, Delete any)
  // - 'teacher': បង្កើតមេរៀន/លំហាត់, កែប្រែ/លុបមេរៀនរបស់ខ្លួន, មើលពិន្ទុសិស្ស
  // - 'student': មើលមេរៀន, ធ្វើលំហាត់, Bookmark, មើលប្រវត្តិពិន្ទុខ្លួនឯង
  // - 'parent': មើលមេរៀន, តាមដានការរៀន និងពិន្ទុរបស់កូន, មើលកិច្ចការ
  hasPermission(action, targetItem = null) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin មានសិទ្ធិទាំងអស់ ១០០%
    if (user.role === 'admin') return true;

    switch (action) {
      case 'manage_users':
        return user.role === 'admin';

      case 'backup_system':
        return user.role === 'admin';

      case 'create_lesson':
        return user.role === 'teacher';

      case 'edit_lesson':
        if (user.role === 'admin') return true;
        if (user.role === 'teacher') {
          // គ្រូអាចកែសម្រួលមេរៀនរបស់ខ្លួន ឬមេរៀនទាំងអស់បើជាគ្រូ
          return true;
        }
        return false;

      case 'delete_lesson':
        if (user.role === 'admin') return true;
        if (user.role === 'teacher') return true;
        return false;

      case 'take_quiz':
        return true; // គ្រប់គ្នាអាចសាកល្បងធ្វើលំហាត់បាន

      case 'view_parent_dashboard':
        return user.role === 'parent' || user.role === 'admin';

      case 'bookmark':
        return true;

      default:
        return false;
    }
  },

  // ================= CONTENT ITEMS =================
  getItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!data) {
        this.saveItems(SAMPLE_ITEMS);
        return SAMPLE_ITEMS;
      }
      return JSON.parse(data);
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

  // ================= QUIZ RESULTS =================
  saveQuizResult(itemId, score, total) {
    try {
      const currUser = this.getCurrentUser();
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_QUIZZES) || '{}');
      const record = {
        userId: currUser ? currUser.id : 'guest',
        userName: currUser ? currUser.name : 'ភ្ញៀវ',
        userRole: currUser ? currUser.role : 'guest',
        score,
        total,
        percentage: Math.round((score / total) * 100),
        completedAt: new Date().toISOString()
      };
      existing[itemId] = record;
      localStorage.setItem(STORAGE_KEYS.COMPLETED_QUIZZES, JSON.stringify(existing));
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

  // ================= BACKUP & RESTORE =================
  exportData() {
    const data = {
      school: SCHOOL_INFO.nameKhmer,
      version: '2.5',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      items: this.getItems(),
      bookmarks: this.getBookmarks(),
      quizResults: this.getQuizResults()
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
      return { success: true, count };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  resetToDefault() {
    this.saveItems(SAMPLE_ITEMS);
    this.saveUsers(INITIAL_USERS);
    this.setCurrentUser(INITIAL_USERS[0]); // default to admin
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_QUIZZES);
    return true;
  }
};
