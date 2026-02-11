// ===== تطبيق محرر الأكواد الذكي =====
// تم التطوير بواسطة: محمود احمد سعيد
// تاريخ الإصدار: 2024
// جميع الحقوق محفوظة

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 محرر الأكواد الذكي - بدء التحميل');
    
    window.appState = {
        currentSection: 'home',
        projects: [],
        currentProject: null,
        isInitialized: false
    };
    
    setTimeout(initApp, 1000);
});

function initApp() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        initComponents();
        loadProjects();
        showToast('مرحباً بك في محرر الأكواد الذكي!', 'success');
    }, 500);
}

function initComponents() {
    initNavigation();
    initButtons();
    initModals();
    initForms();
    initSearch();
    initKeyboardShortcuts();
    detectDevice();
    window.appState.isInitialized = true;
    console.log('✅ التطبيق جاهز للاستخدام');
}

// ===== التنقل =====
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    const navItems = document.querySelectorAll('.nav-link, .footer-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
            const section = this.dataset.section;
            if (section) switchSection(section);
            else if (this.id === 'aboutBtn') showModal('aboutModal');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

function switchSection(sectionId) {
    ['homeSection', 'projectsSection', 'featuresSection'].forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.style.display = 'none';
    });
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.style.display = 'block';
        const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
        window.appState.currentSection = sectionId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (sectionId === 'projects') loadProjects();
    }
}

// ===== الأزرار =====
function initButtons() {
    document.getElementById('startProjectBtn')?.addEventListener('click', () => showModal('newProjectModal'));
    document.getElementById('viewProjectsBtn')?.addEventListener('click', () => switchSection('projects'));
    document.getElementById('newProjectBtn')?.addEventListener('click', () => showModal('newProjectModal'));
    document.getElementById('createFirstProjectBtn')?.addEventListener('click', () => showModal('newProjectModal'));
    document.getElementById('createProjectBtn')?.addEventListener('click', createNewProject);
}

// ===== المودالات =====
function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) hideAllModals();
        });
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideAllModals();
    });
}

function showModal(modalId) {
    hideAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

// ===== النماذج =====
function initForms() {
    const projectForm = document.getElementById('projectForm');
    if (projectForm) projectForm.addEventListener('submit', e => { e.preventDefault(); createNewProject(); });
}

// ===== البحث =====
function initSearch() {
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() { filterProjects(this.value); });
    }
}

// ===== اختصارات لوحة المفاتيح =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); showModal('newProjectModal'); }
        if ((e.ctrlKey || e.metaKey) && e.key === '/') { 
            e.preventDefault(); 
            const search = document.getElementById('projectSearch');
            if (search) { search.focus(); search.select(); }
        }
        if (e.key === 'Escape' && window.appState.currentSection !== 'home') switchSection('home');
    });
}

// ===== كشف الجهاز =====
function detectDevice() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    if (isMobile) document.body.classList.add('mobile-device');
    if (isTablet) document.body.classList.add('tablet-device');
    if (!isMobile && !isTablet) document.body.classList.add('desktop-device');
    if (window.innerWidth < 768) document.body.classList.add('small-screen');
    else document.body.classList.remove('small-screen');
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) document.body.classList.add('small-screen');
        else document.body.classList.remove('small-screen');
    });
}

// ===== إدارة المشاريع =====
function loadProjects() {
    try {
        const saved = localStorage.getItem('codeEditorProjects');
        window.appState.projects = saved ? JSON.parse(saved) : [];
        console.log(`تم تحميل ${window.appState.projects.length} مشروع`);
    } catch (e) {
        console.error('خطأ في تحميل المشاريع:', e);
        window.appState.projects = [];
        showToast('حدث خطأ في تحميل المشاريع', 'error');
    }
    renderProjects();
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const empty = document.getElementById('emptyProjects');
    if (!grid || !empty) return;

    if (window.appState.projects.length > 0) {
        empty.style.display = 'none';
        grid.innerHTML = '';
        window.appState.projects.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        window.appState.projects.forEach((project, idx) => {
            const card = createProjectCard(project, idx);
            grid.appendChild(card);
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
    
    const created = new Date(project.createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' });
    const updated = new Date(project.updatedAt).toLocaleDateString('ar-EG', { month:'short', day:'numeric' });
    const fileCount = project.files ? Object.keys(project.files).length : 0;
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon"><i class="fas fa-code"></i></div>
            <div class="project-title">
                <h3>${project.name}</h3>
                <div class="project-date">تم الإنشاء: ${created}</div>
            </div>
        </div>
        <p style="color: var(--light-secondary); margin-bottom: 15px; flex: 1;">${project.description || 'لا يوجد وصف'}</p>
        <div class="project-stats">
            <span><i class="fas fa-file"></i> ${fileCount} ملف</span>
            <span><i class="fas fa-clock"></i> تم التعديل: ${updated}</span>
        </div>
        <div class="project-actions">
            <button class="btn btn-primary btn-sm open-project" data-index="${index}"><i class="fas fa-edit"></i> فتح</button>
            <button class="btn btn-secondary btn-sm download-project" data-index="${index}"><i class="fas fa-download"></i> تحميل</button>
            <button class="btn btn-danger btn-sm delete-project" data-index="${index}"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    card.querySelector('.open-project').addEventListener('click', e => { e.stopPropagation(); openProject(index); });
    card.querySelector('.download-project').addEventListener('click', e => { e.stopPropagation(); prepareDownload(index); });
    card.querySelector('.delete-project').addEventListener('click', e => { e.stopPropagation(); deleteProject(index); });
    card.addEventListener('click', e => { if (!e.target.closest('.project-actions')) openProject(index); });
    return card;
}

function createNewProject() {
    const nameInput = document.getElementById('projectName');
    const typeSelect = document.getElementById('projectType');
    const descText = document.getElementById('projectDescription');
    const projectName = nameInput.value.trim();
    if (!projectName) {
        showToast('يرجى إدخال اسم المشروع', 'error');
        nameInput.focus();
        return;
    }
    const existing = window.appState.projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
    if (existing) {
        if (confirm(`يوجد مشروع باسم "${projectName}" بالفعل. هل تريد فتحه؟`)) {
            openProject(window.appState.projects.indexOf(existing));
        }
        hideAllModals();
        return;
    }
    
    const newProject = {
        id: generateId(),
        name: projectName,
        type: typeSelect.value,
        description: descText.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: getDefaultFiles(projectName, typeSelect.value),
        fileTypes: { 'index.html':'html', 'style.css':'css', 'script.js':'javascript' }
    };
    
    window.appState.projects.unshift(newProject);
    saveProjects();
    hideAllModals();
    nameInput.value = '';
    descText.value = '';
    showToast(`تم إنشاء المشروع "${projectName}" بنجاح`, 'success');
    openProject(0);
}

function openProject(index) {
    if (window.appState.projects[index]) {
        window.appState.currentProject = window.appState.projects[index];
        localStorage.setItem('currentProject', JSON.stringify(window.appState.currentProject));
        window.location.href = 'editor.html';
    }
}

function prepareDownload(index) {
    if (window.appState.projects[index]) {
        downloadProject(window.appState.projects[index]);
    }
}

function downloadProject(project) {
    if (typeof JSZip !== 'undefined') {
        createZipFile(project);
    } else {
        showToast('جاري تحميل مكتبة الضغط...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') createZipFile(project);
            else showToast('تعذر تحميل مكتبة الضغط', 'error');
        }, 1000);
    }
}

function createZipFile(project) {
    const zip = new JSZip();
    Object.keys(project.files).forEach(fn => zip.file(fn, project.files[fn]));
    zip.file("project-info.json", JSON.stringify({
        projectName: project.name, projectType: project.type, description: project.description,
        created: project.createdAt, modified: project.updatedAt,
        files: Object.keys(project.files), developer: "محمود احمد سعيد"
    }, null, 2));
    zip.generateAsync({ type: "blob" })
        .then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_${Date.now()}.zip`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
            showToast('تم تحميل المشروع بنجاح', 'success');
        })
        .catch(err => { console.error(err); showToast('حدث خطأ في التحميل', 'error'); });
}

function deleteProject(index) {
    if (window.appState.projects[index]) {
        const name = window.appState.projects[index].name;
        if (confirm(`هل تريد حذف المشروع "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            window.appState.projects.splice(index, 1);
            saveProjects();
            renderProjects();
            showToast(`تم حذف المشروع "${name}"`, 'success');
        }
    }
}

function filterProjects(searchTerm) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const term = searchTerm.toLowerCase();
    const filtered = window.appState.projects.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.type.toLowerCase().includes(term)
    );
    if (filtered.length > 0) {
        grid.innerHTML = '';
        filtered.forEach((p, i) => {
            const orig = window.appState.projects.indexOf(p);
            grid.appendChild(createProjectCard(p, orig));
        });
    } else {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
            <div class="empty-icon"><i class="fas fa-search"></i></div>
            <h3>لا توجد نتائج</h3><p>لم يتم العثور على مشاريع تطابق "${searchTerm}"</p>
        </div>`;
    }
}

function saveProjects() {
    try {
        localStorage.setItem('codeEditorProjects', JSON.stringify(window.appState.projects));
    } catch (e) {
        console.error('خطأ في حفظ المشاريع:', e);
        showToast('حدث خطأ في حفظ المشاريع', 'error');
    }
}

// ===== وظائف مساعدة =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'fas fa-check-circle', error:'fas fa-exclamation-circle', warning:'fas fa-exclamation-triangle', info:'fas fa-info-circle' };
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// ===== الملفات الافتراضية =====
function getDefaultFiles(projectName, projectType) {
    return {
        'index.html': getDefaultHTML(projectName, projectType),
        'style.css': getDefaultCSS(projectName, projectType),
        'script.js': getDefaultJS(projectName, projectType)
    };
}

function getDefaultHTML(name, type) {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1>${name}</h1>
            <p>مرحباً بك في موقعك الجديد</p>
        </header>
        <main>
            <div class="content">
                <h2>ابدأ التطوير</h2>
                <p>هذا هو ملف HTML الرئيسي لمشروعك. عدل عليه كما تشاء.</p>
            </div>
        </main>
        <footer>
            <p>© 2024 ${name}</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
}

function getDefaultCSS(name, type) {
    return `/* أنماط ${name} */
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
footer { text-align: center; padding: 2rem; margin-top: 2rem; background: rgba(0,0,0,0.2); border-radius: 15px; }`;
}

function getDefaultJS(name, type) {
    return `// JavaScript لـ ${name}
console.log('مرحباً بك في ${name}');
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
});`;
}

// ===== تهيئة إضافية =====
console.log('%cمحرر الأكواد الذكي v2.0', 'font-size:16px; color:#4361ee; font-weight:bold;');
console.log('%cتم التطوير بواسطة: محمود احمد سعيد', 'color:#7209b7;');

// كشف الجهاز عند التحميل
detectDevice();