// ===== تطبيق محرر الأكواد الذكي =====
// تم التطوير بواسطة: أحمد التميمي
// تاريخ الإصدار: 2024
// جميع الحقوق محفوظة

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 محرر الأكواد الذكي - بدء التحميل');
    
    // تهيئة المتغيرات العامة
    window.appState = {
        currentSection: 'home',
        projects: [],
        currentProject: null,
        isInitialized: false
    };
    
    // إخفاء شاشة التحميل بعد تأخير قصير
    setTimeout(initApp, 1000);
});

// تهيئة التطبيق الرئيسية
function initApp() {
    // إخفاء شاشة التحميل
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

// تهيئة جميع المكونات
function initComponents() {
    // تهيئة التنقل
    initNavigation();
    
    // تهيئة الأزرار
    initButtons();
    
    // تهيئة المودالات
    initModals();
    
    // تهيئة النماذج
    initForms();
    
    // تهيئة البحث
    initSearch();
    
    // تهيئة اختصارات لوحة المفاتيح
    initKeyboardShortcuts();
    
    // تحديث حالة التطبيق
    window.appState.isInitialized = true;
    console.log('✅ التطبيق جاهز للاستخدام');
}

// تهيئة التنقل
function initNavigation() {
    // زر تبديل القائمة على الهواتف
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // التنقل بين الأقسام
    const navItems = document.querySelectorAll('.nav-link, .footer-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إغلاق القائمة على الهواتف
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            const section = this.dataset.section;
            if (section) {
                switchSection(section);
            } else if (this.id === 'aboutBtn') {
                showModal('aboutModal');
            } else if (this.id === 'contactBtn') {
                showModal('contactModal');
            }
        });
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// التبديل بين الأقسام
function switchSection(sectionId) {
    // إخفاء جميع الأقسام
    const sections = ['homeSection', 'projectsSection', 'featuresSection'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });
    
    // إزالة النشاط من جميع عناصر التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // إضافة النشاط لعنصر التنقل المناسب
        const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // تحديث حالة التطبيق
        window.appState.currentSection = sectionId;
        
        // التمرير لأعلى الصفحة
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // إذا كان قسم المشاريع، تحميل المشاريع
        if (sectionId === 'projects') {
            loadProjects();
        }
    }
}

// تهيئة الأزرار
function initButtons() {
    // زر ابدأ مشروع جديد
    document.getElementById('startProjectBtn')?.addEventListener('click', function() {
        showModal('newProjectModal');
    });
    
    // زر استعرض المشاريع
    document.getElementById('viewProjectsBtn')?.addEventListener('click', function() {
        switchSection('projects');
    });
    
    // زر إنشاء مشروع جديد من قسم المشاريع
    document.getElementById('newProjectBtn')?.addEventListener('click', function() {
        showModal('newProjectModal');
    });
    
    // زر إنشاء أول مشروع
    document.getElementById('createFirstProjectBtn')?.addEventListener('click', function() {
        showModal('newProjectModal');
    });
    
    // زر إنشاء المشروع في المودال
    document.getElementById('createProjectBtn')?.addEventListener('click', createNewProject);
    
    // زر إرسال الرسالة
    document.getElementById('sendMessageBtn')?.addEventListener('click', sendContactMessage);
}

// تهيئة المودالات
function initModals() {
    // جميع أزرار الإغلاق
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            hideAllModals();
        });
    });
    
    // إغلاق المودالات عند النقر خارجها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideAllModals();
            }
        });
    });
    
    // إغلاق المودالات عند الضغط على زر Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });
}

// إظهار مودال
function showModal(modalId) {
    hideAllModals();
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// إخفاء جميع المودالات
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// تهيئة النماذج
function initForms() {
    // نموذج إنشاء المشروع
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewProject();
        });
    }
    
    // نموذج الاتصال
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendContactMessage();
        });
    }
}

// تهيئة البحث
function initSearch() {
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProjects(this.value);
        });
    }
}

// تهيئة اختصارات لوحة المفاتيح
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N لإنشاء مشروع جديد
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showModal('newProjectModal');
        }
        
        // Ctrl/Cmd + / للبحث
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('projectSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Esc للعودة للرئيسية
        if (e.key === 'Escape' && window.appState.currentSection !== 'home') {
            switchSection('home');
        }
    });
}

// ===== إدارة المشاريع =====

// تحميل المشاريع
function loadProjects() {
    try {
        const savedProjects = localStorage.getItem('codeEditorProjects');
        if (savedProjects) {
            window.appState.projects = JSON.parse(savedProjects);
            console.log(`تم تحميل ${window.appState.projects.length} مشروع`);
        } else {
            window.appState.projects = [];
        }
    } catch (error) {
        console.error('خطأ في تحميل المشاريع:', error);
        window.appState.projects = [];
        showToast('حدث خطأ في تحميل المشاريع', 'error');
    }
    
    renderProjects();
}

// عرض المشاريع
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyProjects');
    
    if (!projectsGrid || !emptyState) return;
    
    // إخفاء حالة عدم وجود مشاريع إذا كان هناك مشاريع
    if (window.appState.projects.length > 0) {
        emptyState.style.display = 'none';
        projectsGrid.innerHTML = '';
        
        // عرض المشاريع بترتيب زمني (الأحدث أولاً)
        window.appState.projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        window.appState.projects.forEach((project, index) => {
            const projectCard = createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
        });
    } else {
        emptyState.style.display = 'block';
        projectsGrid.innerHTML = '';
    }
}

// إنشاء بطاقة مشروع
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.index = index;
    
    const date = new Date(project.createdAt);
    const dateString = date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const updatedDate = new Date(project.updatedAt);
    const updatedString = updatedDate.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric'
    });
    
    const fileCount = project.files ? Object.keys(project.files).length : 0;
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">
                <i class="fas fa-code"></i>
            </div>
            <div class="project-title">
                <h3>${project.name}</h3>
                <div class="project-date">تم الإنشاء: ${dateString}</div>
            </div>
        </div>
        
        <p style="color: var(--light-secondary); margin-bottom: 15px; flex: 1;">
            ${project.description || 'لا يوجد وصف للمشروع'}
        </p>
        
        <div class="project-stats">
            <span><i class="fas fa-file"></i> ${fileCount} ملف</span>
            <span><i class="fas fa-clock"></i> تم التعديل: ${updatedString}</span>
        </div>
        
        <div class="project-actions">
            <button class="btn btn-primary btn-sm open-project" data-index="${index}">
                <i class="fas fa-edit"></i>
                فتح
            </button>
            <button class="btn btn-secondary btn-sm download-project" data-index="${index}">
                <i class="fas fa-download"></i>
                تحميل
            </button>
            <button class="btn btn-danger btn-sm delete-project" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // إضافة الأحداث للأزرار
    card.querySelector('.open-project').addEventListener('click', function(e) {
        e.stopPropagation();
        openProject(index);
    });
    
    card.querySelector('.download-project').addEventListener('click', function(e) {
        e.stopPropagation();
        prepareDownload(index);
    });
    
    card.querySelector('.delete-project').addEventListener('click', function(e) {
        e.stopPropagation();
        deleteProject(index);
    });
    
    // فتح المشروع عند النقر على البطاقة
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.project-actions')) {
            openProject(index);
        }
    });
    
    return card;
}

// إنشاء مشروع جديد
function createNewProject() {
    const projectNameInput = document.getElementById('projectName');
    const projectTypeSelect = document.getElementById('projectType');
    const projectDescriptionTextarea = document.getElementById('projectDescription');
    
    const projectName = projectNameInput.value.trim();
    const projectType = projectTypeSelect.value;
    const projectDescription = projectDescriptionTextarea.value.trim();
    
    // التحقق من صحة البيانات
    if (!projectName) {
        showToast('يرجى إدخال اسم المشروع', 'error');
        projectNameInput.focus();
        return;
    }
    
    // التحقق من عدم تكرار الاسم
    const existingProject = window.appState.projects.find(
        p => p.name.toLowerCase() === projectName.toLowerCase()
    );
    
    if (existingProject) {
        if (!confirm(`يوجد مشروع باسم "${projectName}" بالفعل. هل تريد فتحه؟`)) {
            return;
        }
        openProject(window.appState.projects.indexOf(existingProject));
        hideAllModals();
        return;
    }
    
    // إنشاء المشروع الجديد
    const newProject = {
        id: generateId(),
        name: projectName,
        type: projectType,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: getDefaultFiles(projectName, projectType),
        fileTypes: {
            'index.html': 'html',
            'style.css': 'css',
            'script.js': 'javascript'
        }
    };
    
    // إضافة المشروع
    window.appState.projects.unshift(newProject);
    
    // حفظ المشاريع
    saveProjects();
    
    // إغلاق المودال وإعادة تعيين النموذج
    hideAllModals();
    projectNameInput.value = '';
    projectDescriptionTextarea.value = '';
    
    // عرض رسالة النجاح
    showToast(`تم إنشاء المشروع "${projectName}" بنجاح`, 'success');
    
    // فتح المشروع في المحرر
    openProject(0);
}

// الحصول على الملفات الافتراضية حسب نوع المشروع
function getDefaultFiles(projectName, projectType) {
    const baseFiles = {
        'index.html': getDefaultHTML(projectName, projectType),
        'style.css': getDefaultCSS(projectName, projectType),
        'script.js': getDefaultJS(projectName, projectType)
    };
    
    // إضافة ملفات إضافية حسب نوع المشروع
    switch(projectType) {
        case 'webapp':
            baseFiles['app.js'] = '// ملف JavaScript الرئيسي للتطبيق\nconsole.log("مرحباً بك في تطبيقك الجديد!");';
            baseFiles['fileTypes']['app.js'] = 'javascript';
            break;
        case 'portfolio':
            baseFiles['portfolio.html'] = '<!DOCTYPE html>\n<html>\n<head>\n    <title>بورتفوليو</title>\n</head>\n<body>\n    <h1>مرحباً في بورتفوليو</h1>\n</body>\n</html>';
            baseFiles['fileTypes']['portfolio.html'] = 'html';
            break;
    }
    
    return baseFiles;
}

// فتح مشروع في المحرر
function openProject(index) {
    if (window.appState.projects[index]) {
        window.appState.currentProject = window.appState.projects[index];
        
        // حفظ المشروع الحالي
        localStorage.setItem('currentProject', JSON.stringify(window.appState.currentProject));
        
        // التوجيه لصفحة المحرر
        window.location.href = 'editor.html';
    }
}

// تحضير التحميل
function prepareDownload(index) {
    if (window.appState.projects[index]) {
        // حفظ المشروع للتحميل
        localStorage.setItem('downloadProject', JSON.stringify(window.appState.projects[index]));
        
        // التوجيه لتحميل المشروع
        downloadProject(window.appState.projects[index]);
    }
}

// تحميل مشروع
function downloadProject(project) {
    if (typeof JSZip !== 'undefined') {
        createZipFile(project);
    } else {
        showToast('جاري تحميل مكتبة الضغط...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') {
                createZipFile(project);
            } else {
                showToast('تعذر تحميل مكتبة الضغط', 'error');
            }
        }, 1000);
    }
}

// إنشاء ملف ZIP
function createZipFile(project) {
    const zip = new JSZip();
    
    // إضافة الملفات
    Object.keys(project.files).forEach(fileName => {
        zip.file(fileName, project.files[fileName]);
    });
    
    // إضافة ملف معلومات
    const info = {
        projectName: project.name,
        projectType: project.type,
        description: project.description,
        created: project.createdAt,
        modified: project.updatedAt,
        files: Object.keys(project.files),
        developer: "أحمد التميمي"
    };
    zip.file("project-info.json", JSON.stringify(info, null, 2));
    
    // إنشاء الملف وتنزيله
    zip.generateAsync({ type: "blob" })
        .then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_${Date.now()}.zip`;
            link.click();
            
            // تنظيف
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
            showToast('تم تحميل المشروع بنجاح', 'success');
        })
        .catch(function(error) {
            console.error('خطأ في إنشاء ملف ZIP:', error);
            showToast('حدث خطأ في التحميل', 'error');
        });
}

// حذف مشروع
function deleteProject(index) {
    if (window.appState.projects[index]) {
        const projectName = window.appState.projects[index].name;
        
        if (confirm(`هل تريد حذف المشروع "${projectName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            window.appState.projects.splice(index, 1);
            saveProjects();
            renderProjects();
            showToast(`تم حذف المشروع "${projectName}"`, 'success');
        }
    }
}

// تصفية المشاريع
function filterProjects(searchTerm) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    const searchLower = searchTerm.toLowerCase();
    const filteredProjects = window.appState.projects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        project.type.toLowerCase().includes(searchLower)
    );
    
    // إعادة عرض المشاريع المصفاة
    if (filteredProjects.length > 0) {
        projectsGrid.innerHTML = '';
        filteredProjects.forEach((project, index) => {
            const originalIndex = window.appState.projects.indexOf(project);
            const projectCard = createProjectCard(project, originalIndex);
            projectsGrid.appendChild(projectCard);
        });
    } else {
        projectsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على مشاريع تطابق "${searchTerm}"</p>
            </div>
        `;
    }
}

// حفظ المشاريع
function saveProjects() {
    try {
        localStorage.setItem('codeEditorProjects', JSON.stringify(window.appState.projects));
    } catch (error) {
        console.error('خطأ في حفظ المشاريع:', error);
        showToast('حدث خطأ في حفظ المشاريع', 'error');
    }
}

// ===== وظائف مساعدة =====

// توليد معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// إظهار رسائل Toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // حدث إغلاق Toast
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.remove();
    });
    
    // إزالة Toast تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// إرسال رسالة الاتصال
function sendContactMessage() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // التحقق من صحة البيانات
    if (!name || !email || !subject || !message) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
        return;
    }
    
    // في الواقع، هنا سيتم إرسال البيانات للخادم
    // لكننا سنعرض رسالة نجاح للتوضيح
    
    // إعادة تعيين النموذج
    document.getElementById('contactForm').reset();
    
    // إغلاق المودال
    hideAllModals();
    
    // عرض رسالة النجاح
    showToast('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً!', 'success');
    
    // تسجيل البيانات في الكونسول (لأغراض التطوير)
    console.log('رسالة اتصال جديدة:', { name, email, subject, message });
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// ===== المحتوى الافتراضي للملفات =====

// HTML افتراضي
function getDefaultHTML(projectName, projectType) {
    let additionalContent = '';
    
    switch(projectType) {
        case 'website':
            additionalContent = `
        <section class="hero">
            <h2>مرحباً بك في موقع ${projectName}</h2>
            <p>موقع ويب احترافي تم إنشاؤه باستخدام محرر الأكواد الذكي</p>
        </section>
        
        <section class="features">
            <div class="feature">
                <i class="fas fa-rocket"></i>
                <h3>سريع</h3>
                <p>أداء فائق وسرعة في التحميل</p>
            </div>
            <div class="feature">
                <i class="fas fa-mobile-alt"></i>
                <h3>متجاوب</h3>
                <p>يعمل على جميع الأجهزة والشاشات</p>
            </div>
            <div class="feature">
                <i class="fas fa-palette"></i>
                <h3>جذاب</h3>
                <p>تصميم عصري وجذاب</p>
            </div>
        </section>`;
            break;
            
        case 'webapp':
            additionalContent = `
        <div id="app">
            <header class="app-header">
                <h1>${projectName}</h1>
                <p>تطبيق ويب تفاعلي</p>
            </header>
            
            <main class="app-content">
                <div class="card">
                    <h3>لوحة التحكم</h3>
                    <p>مرحباً بك في تطبيقك الجديد!</p>
                    <button id="demoBtn" class="btn">جرب التفاعل</button>
                </div>
                
                <div id="output" class="output"></div>
            </main>
        </div>`;
            break;
            
        case 'portfolio':
            additionalContent = `
        <header class="portfolio-header">
            <div class="profile">
                <img src="https://via.placeholder.com/150" alt="الصورة الشخصية" class="profile-img">
                <h2>${projectName}</h2>
                <p class="title">مطور ويب ومصمم</p>
            </div>
        </header>
        
        <section class="portfolio-content">
            <h3>المشاريع السابقة</h3>
            <div class="projects-grid">
                <div class="project">
                    <h4>مشروع 1</h4>
                    <p>وصف مختصر للمشروع</p>
                </div>
                <div class="project">
                    <h4>مشروع 2</h4>
                    <p>وصف مختصر للمشروع</p>
                </div>
            </div>
        </section>`;
            break;
            
        case 'landing':
            additionalContent = `
        <section class="hero-section">
            <div class="hero-content">
                <h2>${projectName}</h2>
                <p class="hero-text">وصف مختصر وجذاب للمنتج أو الخدمة</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary">ابدأ الآن</button>
                    <button class="btn btn-outline">اعرف المزيد</button>
                </div>
            </div>
        </section>
        
        <section class="features-section">
            <h3>مميزاتنا</h3>
            <div class="features">
                <div class="feature">
                    <h4>الميزة الأولى</h4>
                    <p>وصف الميزة الأولى</p>
                </div>
                <div class="feature">
                    <h4>الميزة الثانية</h4>
                    <p>وصف الميزة الثانية</p>
                </div>
            </div>
        </section>`;
            break;
    }
    
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            border-radius: 0 0 20px 20px;
            margin-bottom: 3rem;
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            background: #1a1a2e;
            color: white;
            margin-top: 3rem;
            border-radius: 20px 20px 0 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${projectName}</h1>
            <p>تم إنشاء هذا المشروع باستخدام محرر الأكواد الذكي</p>
        </header>
        
        <main>
            ${additionalContent}
        </main>
        
        <footer>
            <p>© 2024 ${projectName}. جميع الحقوق محفوظة.</p>
            <p>تم التطوير باستخدام محرر الأكواد الذكي</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
}

// CSS افتراضي
function getDefaultCSS(projectName, projectType) {
    let additionalStyles = '';
    
    switch(projectType) {
        case 'website':
            additionalStyles = `
        .hero {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            border-radius: 20px;
            margin-bottom: 3rem;
        }
        
        .hero h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .feature {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-10px);
        }
        
        .feature i {
            font-size: 3rem;
            color: #4361ee;
            margin-bottom: 1rem;
        }`;
            break;
            
        case 'webapp':
            additionalStyles = `
        #app {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .app-header {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            border-radius: 0 0 20px 20px;
        }
        
        .app-content {
            flex: 1;
            padding: 2rem;
        }
        
        .card {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            margin: 2rem auto;
            text-align: center;
        }
        
        .output {
            background: #1a1a2e;
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            margin-top: 2rem;
            min-height: 100px;
            font-family: 'Courier New', monospace;
        }`;
            break;
            
        case 'portfolio':
            additionalStyles = `
        .portfolio-header {
            text-align: center;
            padding: 3rem 2rem;
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            border-radius: 0 0 20px 20px;
        }
        
        .profile-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 5px solid white;
            margin-bottom: 1rem;
        }
        
        .title {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .portfolio-content {
            padding: 2rem;
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .project {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }`;
            break;
            
        case 'landing':
            additionalStyles = `
        .hero-section {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            padding: 2rem;
            border-radius: 0 0 20px 20px;
        }
        
        .hero-content h2 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero-text {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            max-width: 600px;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .features-section {
            padding: 4rem 2rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .feature {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }`;
            break;
    }
    
    return `/* أنماط ${projectName} - ${projectType} */

/* إعادة الضبط */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* أنماط عامة */
body {
    font-family: 'Tajawal', sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* الروابط */
a {
    color: #4361ee;
    text-decoration: none;
    transition: color 0.3s ease;
}

a:hover {
    color: #7209b7;
}

/* الأزرار */
.btn {
    display: inline-block;
    padding: 12px 24px;
    background: #4361ee;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Tajawal', sans-serif;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn:hover {
    background: #3a56d4;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
}

.btn-primary {
    background: linear-gradient(45deg, #4361ee, #7209b7);
}

.btn-outline {
    background: transparent;
    border: 2px solid white;
    color: white;
}

.btn-outline:hover {
    background: white;
    color: #4361ee;
}

/* التجاوب */
@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    .hero-content h2 {
        font-size: 2rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 300px;
    }
}

${additionalStyles}`;
}

// JavaScript افتراضي
function getDefaultJS(projectName, projectType) {
    let additionalScript = '';
    
    switch(projectType) {
        case 'website':
            additionalScript = `
// كود JavaScript لموقع ${projectName}
console.log('🚀 موقع ${projectName} يعمل بنجاح!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    // إضافة تأثيرات للعناصر
    const features = document.querySelectorAll('.feature');
    
    if (features.length > 0) {
        features.forEach(feature => {
            feature.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });
            
            feature.addEventListener('mouseleave', function() {
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            });
        });
    }
    
    // تحديث السنة في الفوتر
    const footer = document.querySelector('footer');
    if (footer) {
        const year = new Date().getFullYear();
        const yearElement = document.createElement('p');
        yearElement.innerHTML = \`© \${year} ${projectName}. جميع الحقوق محفوظة.\`;
        footer.appendChild(yearElement);
    }
});`;
            break;
            
        case 'webapp':
            additionalScript = `
// تطبيق ${projectName}
console.log('🚀 تطبيق ${projectName} يعمل بنجاح!');

const app = {
    init() {
        console.log('تهيئة التطبيق...');
        this.bindEvents();
        this.showMessage('التطبيق جاهز للاستخدام!');
    },
    
    bindEvents() {
        const demoBtn = document.getElementById('demoBtn');
        const output = document.getElementById('output');
        
        if (demoBtn && output) {
            demoBtn.addEventListener('click', () => {
                this.handleDemoClick(output);
            });
        }
    },
    
    handleDemoClick(output) {
        const messages = [
            '🎉 عمل رائع!',
            '✨ التفاعل يعمل بشكل مثالي!',
            '🚀 أنت تستخدم JavaScript باحترافية!',
            '💡 فكرة ممتازة!',
            '🌟 مذهل!'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        output.innerHTML = \`<p>\${randomMessage}</p>\`;
        
        // إضافة تأثير
        output.style.animation = 'none';
        setTimeout(() => {
            output.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    },
    
    showMessage(message) {
        console.log(\`📢 \${message}\`);
    }
};

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});`;
            break;
            
        case 'portfolio':
            additionalScript = `
// بورتفوليو ${projectName}
console.log('🎨 بورتفوليو ${projectName} يعمل بنجاح!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة البورتفوليو...');
    
    // إضافة تأثيرات للصور
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        profileImg.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        profileImg.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // إضافة تأثيرات للمشاريع
    const projects = document.querySelectorAll('.project');
    projects.forEach((project, index) => {
        project.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        project.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
        
        // إضافة حدث النقر
        project.addEventListener('click', function() {
            alert(\`مشروع \${index + 1} - تفاصيل قريباً!\`);
        });
    });
    
    // تحديث السنة
    const year = new Date().getFullYear();
    const yearElement = document.createElement('p');
    yearElement.textContent = \`© \${year} ${projectName}\`;
    document.querySelector('footer').appendChild(yearElement);
});`;
            break;
            
        case 'landing':
            additionalScript = `
// صفحة هبوط ${projectName}
console.log('📱 صفحة هبوط ${projectName} تعمل بنجاح!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة صفحة الهبوط...');
    
    // تتبع النقرات على الأزرار
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            console.log(\`تم النقر على زر: \${buttonText}\`);
            
            // عرض رسالة للمستخدم
            if (buttonText.includes('ابدأ الآن')) {
                alert('مرحباً بك! سنوجهك لصفحة التسجيل قريباً.');
            } else if (buttonText.includes('اعرف المزيد')) {
                alert('معلومات إضافية قريباً!');
            }
        });
    });
    
    // إضافة تأثيرات للميزات
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        let isAnimating = false;
        
        feature.addEventListener('mouseenter', function() {
            if (!isAnimating) {
                isAnimating = true;
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    isAnimating = false;
                }, 300);
            }
        });
        
        feature.addEventListener('mouseleave', function() {
            if (!isAnimating) {
                this.style.transform = 'scale(1)';
            }
        });
    });
    
    // إضافة مؤثرات للصفحة
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        let scrollCount = 0;
        
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroSection.style.backgroundPosition = \`50% \${rate}px\`;
            
            // تسجيل التمرير (لأغراض التحليل)
            if (scrolled > 100 && scrollCount === 0) {
                console.log('المستخدم يمرر الصفحة...');
                scrollCount++;
            }
        });
    }
});`;
            break;
    }
    
    return `// JavaScript لـ ${projectName}
// تم التطوير باستخدام محرر الأكواد الذكي
// المطور: أحمد التميمي

${additionalScript}

// دالة مساعدة لعرض الرسائل
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' : '#4361ee'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        font-family: 'Tajawal', sans-serif;
    \`;
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// تأثيرات CSS إضافية
const style = document.createElement('style');
style.textContent = \`
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
\`;
document.head.appendChild(style);

// تسجيل معلومات التحميل
console.log('%c🚀 ${projectName}', 'font-size: 20px; color: #4361ee; font-weight: bold;');
console.log('%cتم التطوير باستخدام محرر الأكواد الذكي', 'font-size: 14px; color: #7209b7;');
console.log('%cالمطور: أحمد التميمي', 'font-size: 14px; color: #1a1a2e;');`;
}

// ===== تهيئة إضافية عند تحميل الصفحة =====
// تسجيل معلومات الإصدار
console.log('%cمحرر الأكواد الذكي v1.0', 'font-size: 16px; color: #4361ee; font-weight: bold;');
console.log('%cتم التطوير بواسطة: أحمد التميمي', 'color: #7209b7;');
console.log('%cجميع الحقوق محفوظة © 2024', 'color: #1a1a2e;');

// إضافة فئة للجسم بناءً على نوع الجهاز
function detectDevice() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    if (isMobile) document.body.classList.add('mobile');
    if (isTablet) document.body.classList.add('tablet');
    if (!isMobile && !isTablet) document.body.classList.add('desktop');
}

// تشغيل كشف الجهاز
detectDevice();

// تحسين الأداء على الهواتف
if ('ontouchstart' in window) {
    document.body.classList.add('touch');
    
    // منع التكبير عند النقر المزدوج
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// إضافة تأثيرات تحميل الصور
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transition = 'opacity 0.3s ease';
        });
        
        // تعيين الشفافية الابتدائية
        img.style.opacity = '0';
    });
});

// إضافة تأثيرات التمرير الناعم
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

