// ===== محرر الأكواد الذكي – الصفحة الرئيسية v3.0 =====
// مطور الواجهات: محمود أحمد سعيد
// جميع الحقوق محفوظة © 2026

'use strict';

// الحالة العامة للتطبيق
const AppState = {
  projects: [],
  currentSection: 'home',
  isDark: true,
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 منصة محرر الأكواد – بدء التشغيل');
  setTimeout(initApp, 800);
});

function initApp() {
  hideLoading();
  initTheme();
  initEvents();
  loadProjects();
  showToast('مرحباً بك في محرر الأكواد الذكي', 'success');
  window.AppState = AppState;
}

function hideLoading() {
  const loader = document.getElementById('loadingScreen');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 500);
}

// ===== إدارة المظهر =====
function initTheme() {
  const saved = localStorage.getItem('codeEditorTheme');
  if (saved === 'light-mode') {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    AppState.isDark = false;
    const icon = document.querySelector('.theme-toggle i');
    if (icon) icon.className = 'fas fa-sun';
  }
}

function toggleTheme() {
  const body = document.body;
  const icon = document.querySelector('.theme-toggle i');
  if (body.classList.contains('dark-mode')) {
    body.classList.replace('dark-mode', 'light-mode');
    icon.className = 'fas fa-sun';
    localStorage.setItem('codeEditorTheme', 'light-mode');
    AppState.isDark = false;
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    icon.className = 'fas fa-moon';
    localStorage.setItem('codeEditorTheme', 'dark-mode');
    AppState.isDark = true;
  }
  showToast(`الوضع ${AppState.isDark ? 'الداكن' : 'الفاتح'}`, 'info');
}

// ===== ربط الأحداث =====
function initEvents() {
  // زر القائمة للجوال
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // التنقل بين الأقسام
  document.querySelectorAll('.nav-link[data-section], .footer-links a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      switchSection(section);
      if (window.innerWidth <= 768) navLinks.classList.remove('active');
    });
  });

  // زر المطور
  document.getElementById('aboutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showModal('aboutModal');
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });

  // تبديل المظهر
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // أزرار المشاريع
  document.getElementById('startProjectBtn').addEventListener('click', () => showModal('newProjectModal'));
  document.getElementById('viewProjectsBtn').addEventListener('click', () => switchSection('projects'));
  document.getElementById('newProjectBtn').addEventListener('click', () => showModal('newProjectModal'));
  document.getElementById('createFirstProjectBtn').addEventListener('click', () => showModal('newProjectModal'));
  document.getElementById('createProjectBtn').addEventListener('click', createNewProject);

  // إغلاق المودالات
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', hideAllModals);
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideAllModals();
    });
  });

  // البحث
  const searchInput = document.getElementById('projectSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterProjects(this.value);
    });
  }

  // اختصارات لوحة المفاتيح
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      showModal('newProjectModal');
    }
    if (e.key === 'Escape') {
      hideAllModals();
      if (AppState.currentSection !== 'home') switchSection('home');
    }
  });
}

function switchSection(sectionId) {
  // إخفاء جميع الأقسام
  ['home', 'projects', 'features'].forEach(id => {
    const sec = document.getElementById(`${id}Section`);
    if (sec) sec.classList.remove('active');
  });
  // إظهار القسم المطلوب
  const target = document.getElementById(`${sectionId}Section`);
  if (target) {
    target.classList.add('active');
    AppState.currentSection = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // تحديث الروابط النشطة
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
  if (activeLink) activeLink.classList.add('active');

  if (sectionId === 'projects') loadProjects();
}

// ===== إدارة المشاريع =====
function loadProjects() {
  try {
    const saved = localStorage.getItem('codeEditorProjects');
    AppState.projects = saved ? JSON.parse(saved) : [];
    renderProjects();
  } catch (e) {
    console.error(e);
    showToast('فشل تحميل المشاريع', 'error');
  }
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  const empty = document.getElementById('emptyProjects');
  if (!grid || !empty) return;

  if (AppState.projects.length > 0) {
    empty.style.display = 'none';
    grid.innerHTML = '';
    AppState.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    AppState.projects.forEach((project, idx) => {
      grid.appendChild(createProjectCard(project, idx));
    });
  } else {
    empty.style.display = 'block';
    grid.innerHTML = '';
  }
}

function createProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.index = index;
  const created = new Date(project.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  const updated = new Date(project.updatedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  const fileCount = project.files ? Object.keys(project.files).length : 0;

  card.innerHTML = `
    <div class="project-header">
      <div class="project-icon"><i class="fas fa-code"></i></div>
      <div class="project-title">
        <h3>${escapeHTML(project.name)}</h3>
        <div class="project-date">${created}</div>
      </div>
    </div>
    <p style="opacity:0.8; flex:1;">${escapeHTML(project.description || 'بدون وصف')}</p>
    <div class="project-stats">
      <span><i class="fas fa-file"></i> ${fileCount} ملف</span>
      <span><i class="fas fa-clock"></i> ${updated}</span>
    </div>
    <div class="project-actions">
      <button class="btn btn-primary btn-sm open-project"><i class="fas fa-edit"></i> فتح</button>
      <button class="btn btn-outline btn-sm download-project"><i class="fas fa-download"></i> تحميل</button>
      <button class="btn btn-danger btn-sm delete-project"><i class="fas fa-trash"></i></button>
    </div>
  `;

  const openBtn = card.querySelector('.open-project');
  const downloadBtn = card.querySelector('.download-project');
  const deleteBtn = card.querySelector('.delete-project');

  openBtn.addEventListener('click', (e) => { e.stopPropagation(); openProject(index); });
  downloadBtn.addEventListener('click', (e) => { e.stopPropagation(); prepareDownload(index); });
  deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteProject(index); });
  card.addEventListener('click', () => openProject(index));

  return card;
}

function openProject(index) {
  if (AppState.projects[index]) {
    localStorage.setItem('currentProject', JSON.stringify(AppState.projects[index]));
    window.location.href = 'editor.html';
  }
}

function deleteProject(index) {
  const project = AppState.projects[index];
  if (!project) return;
  if (confirm(`هل أنت متأكد من حذف "${project.name}"؟`)) {
    AppState.projects.splice(index, 1);
    saveProjects();
    renderProjects();
    showToast(`تم حذف "${project.name}"`, 'success');
  }
}

function prepareDownload(index) {
  const project = AppState.projects[index];
  if (project) downloadProject(project);
}

function downloadProject(project) {
  if (typeof JSZip === 'undefined') {
    showToast('جار تحميل مكتبة الضغط...', 'warning');
    setTimeout(() => {
      if (typeof JSZip !== 'undefined') createZip(project);
      else showToast('تعذر تحميل المكتبة', 'error');
    }, 1000);
    return;
  }
  createZip(project);
}

function createZip(project) {
  const zip = new JSZip();
  Object.keys(project.files).forEach(fname => zip.file(fname, project.files[fname]));
  zip.file('project-info.json', JSON.stringify({
    name: project.name,
    type: project.type,
    description: project.description,
    created: project.createdAt,
    modified: project.updatedAt,
    files: Object.keys(project.files)
  }, null, 2));
  zip.generateAsync({ type: 'blob' }).then(content => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('تم تحميل المشروع', 'success');
  }).catch(() => showToast('فشل التحميل', 'error'));
}

function createNewProject() {
  const nameInput = document.getElementById('projectName');
  const typeSelect = document.getElementById('projectType');
  const descInput = document.getElementById('projectDescription');
  const name = nameInput.value.trim();
  if (!name) {
    showToast('أدخل اسم المشروع', 'error');
    nameInput.focus();
    return;
  }

  const exists = AppState.projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    if (confirm(`يوجد مشروع باسم "${name}". هل تريد فتحه؟`)) {
      openProject(AppState.projects.indexOf(exists));
    }
    hideAllModals();
    return;
  }

  const newProject = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    name,
    type: typeSelect.value,
    description: descInput.value.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    files: getDefaultFiles(name, typeSelect.value),
    fileTypes: { 'index.html': 'html', 'style.css': 'css', 'script.js': 'javascript' }
  };

  AppState.projects.unshift(newProject);
  saveProjects();
  hideAllModals();
  nameInput.value = '';
  descInput.value = '';
  showToast(`تم إنشاء "${name}"`, 'success');
  openProject(0);
}

function saveProjects() {
  localStorage.setItem('codeEditorProjects', JSON.stringify(AppState.projects));
}

function filterProjects(query) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const q = query.toLowerCase();
  const filtered = AppState.projects.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
  if (filtered.length > 0) {
    grid.innerHTML = '';
    filtered.forEach((p, i) => {
      const originalIndex = AppState.projects.indexOf(p);
      grid.appendChild(createProjectCard(p, originalIndex));
    });
  } else {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-search"></i><h3>لا توجد نتائج</h3><p>لا يوجد مشروع يطابق "${query}"</p></div>`;
  }
}

// ===== الملفات الافتراضية للمشروع الجديد =====
function getDefaultFiles(projectName, projectType) {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1>${projectName}</h1>
            <p>مرحباً بك في موقعك الجديد</p>
        </header>
        <main>
            <div class="content">
                <h2>ابدأ التطوير</h2>
                <p>هذا هو ملف HTML الرئيسي لمشروعك. عدل عليه كما تشاء.</p>
            </div>
        </main>
        <footer>
            <p>© 2026 ${projectName}</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
    'style.css': `/* أنماط ${projectName} */
* { margin:0; padding:0; box-sizing:border-box; }
body {
    font-family: 'Tajawal', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    line-height: 1.6;
}
.container { max-width: 1200px; margin:0 auto; padding:20px; }
header { text-align: center; padding: 3rem 2rem; background: rgba(255,255,255,0.1); border-radius: 20px; margin-bottom: 2rem; }
h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.content { background: white; color: #333; padding: 2rem; border-radius: 15px; }
footer { text-align: center; padding: 2rem; margin-top: 2rem; background: rgba(0,0,0,0.2); border-radius: 15px; }`,
    'script.js': `// JavaScript لـ ${projectName}
console.log('مرحباً بك في ${projectName}');
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
});`
  };
}

// ===== إدارة المودالات =====
function showModal(id) {
  hideAllModals();
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function hideAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = 'auto';
}

// ===== رسائل التوست =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
    <div class="toast-content">${message}</div>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'toastSlide 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// ===== دوال مساعدة =====
function escapeHTML(str) {
  return String(str).replace(/[&<>"]/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

// كشف جهاز اللمس
function detectTouch() {
  if ('ontouchstart' in window) document.body.classList.add('touch-device');
}
detectTouch();

// التصدير للاستخدام العام
window.showToast = showToast;