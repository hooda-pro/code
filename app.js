// ===== VS Code Editor Mobile - التطبيق الرئيسي v2.0 =====
'use strict';

const AppState = {
    projects: [],
    currentSection: 'home',
    isDark: true,
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initApp, 800);
});

function initApp() {
    hideLoading();
    initTheme();
    initEvents();
    loadProjects();
    showToast('مرحباً بك في محرر VS Code للموبايل', 'success');
    window.AppState = AppState;
}

function hideLoading() {
    const loader = document.getElementById('loadingScreen');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }, 300);
}

// ===== المظهر =====
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

// ===== الأحداث =====
function initEvents() {
    // القائمة الجانبية
    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    const closeNav = document.getElementById('closeNav');
    if (menuBtn) menuBtn.addEventListener('click', () => nav.classList.add('active'));
    if (closeNav) closeNav.addEventListener('click', () => nav.classList.remove('active'));
    document.addEventListener('click', (e) => {
        if (nav && !nav.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
            nav.classList.remove('active');
        }
    });

    // التنقل
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
            nav.classList.remove('active');
        });
    });

    // زر المطور
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal('aboutModal');
            nav.classList.remove('active');
        });
    }

    // إغلاق المودالات
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideAllModals();
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    const startProjectBtn = document.getElementById('startProjectBtn');
    if (startProjectBtn) startProjectBtn.addEventListener('click', () => showModal('newProjectModal'));

    const viewProjectsBtn = document.getElementById('viewProjectsBtn');
    if (viewProjectsBtn) viewProjectsBtn.addEventListener('click', () => switchSection('projects'));

    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) newProjectBtn.addEventListener('click', () => showModal('newProjectModal'));

    const createFirstProjectBtn = document.getElementById('createFirstProjectBtn');
    if (createFirstProjectBtn) createFirstProjectBtn.addEventListener('click', () => showModal('newProjectModal'));

    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn) createProjectBtn.addEventListener('click', createNewProject);

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
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`${sectionId}Section`);
    if (target) {
        target.classList.add('active');
        AppState.currentSection = sectionId;
    }
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
    const date = new Date(project.updatedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon"><i class="fas fa-code"></i></div>
            <div class="project-title">
                <h3>${escapeHTML(project.name)}</h3>
                <div class="project-date">${date}</div>
            </div>
        </div>
        <p style="font-size:13px; color:var(--text-muted);">${escapeHTML(project.description || 'بدون وصف')}</p>
        <div class="project-stats">
            <span><i class="fas fa-file"></i> ${Object.keys(project.files || {}).length} ملف</span>
        </div>
        <div class="project-actions">
            <button class="btn btn-primary btn-sm open-project"><i class="fas fa-edit"></i> فتح</button>
            <button class="btn btn-outline btn-sm download-project"><i class="fas fa-download"></i></button>
            <button class="btn btn-outline btn-sm delete-project"><i class="fas fa-trash"></i></button>
        </div>
    `;

    card.querySelector('.open-project').addEventListener('click', (e) => { e.stopPropagation(); openProject(index); });
    card.querySelector('.download-project').addEventListener('click', (e) => { e.stopPropagation(); prepareDownload(index); });
    card.querySelector('.delete-project').addEventListener('click', (e) => { e.stopPropagation(); deleteProject(index); });
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
    if (project && confirm(`حذف "${project.name}"؟`)) {
        AppState.projects.splice(index, 1);
        saveProjects();
        renderProjects();
        showToast('تم الحذف', 'success');
    }
}

function prepareDownload(index) {
    const project = AppState.projects[index];
    if (project) downloadProject(project);
}

function downloadProject(project) {
    if (typeof JSZip === 'undefined') {
        showToast('تحميل المكتبة...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') createZip(project);
            else showToast('فشل التحميل', 'error');
        }, 1000);
        return;
    }
    createZip(project);
}

function createZip(project) {
    const zip = new JSZip();
    Object.keys(project.files || {}).forEach(fname => zip.file(fname, project.files[fname]));
    zip.file('info.json', JSON.stringify({ name: project.name, type: project.type }, null, 2));
    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('تم التحميل', 'success');
    }).catch(() => showToast('فشل', 'error'));
}

function createNewProject() {
    const name = document.getElementById('projectName').value.trim();
    if (!name) {
        showToast('أدخل اسم المشروع', 'error');
        return;
    }
    const exists = AppState.projects.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        if (confirm(`يوجد مشروع باسم "${name}". فتحه؟`)) {
            openProject(AppState.projects.indexOf(exists));
        }
        hideAllModals();
        return;
    }

    const newProject = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        type: document.getElementById('projectType').value,
        description: document.getElementById('projectDescription').value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: getDefaultFiles(name),
        fileTypes: { 'index.html': 'html', 'style.css': 'css', 'script.js': 'javascript' }
    };

    AppState.projects.unshift(newProject);
    saveProjects();
    hideAllModals();
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    showToast('تم الإنشاء', 'success');
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
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-search"></i><h3>لا توجد نتائج</h3></div>`;
    }
}

function getDefaultFiles(projectName) {
    return {
        'index.html': `<!DOCTYPE html>\n<html dir="rtl">\n<head>\n    <meta charset="UTF-8">\n    <title>${projectName}</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>مرحباً</h1>\n</body>\n</html>`,
        'style.css': `body { font-family: sans-serif; }`,
        'script.js': `console.log('مرحباً');`
    };
}

// ===== المودالات =====
function showModal(id) {
    hideAllModals();
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

// ===== التوست =====
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
    toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlide 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}