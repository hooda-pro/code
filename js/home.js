// الصفحة الرئيسية - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة البداية جاهزة');
    
    // تهيئة المتغيرات
    let sites = [];
    let currentDownloadSite = null;
    
    // إخفاء شاشة التحميل
    setTimeout(function() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
    
    // تهيئة القائمة الجانبية
    initSideMenu();
    
    // تهيئة سجلات المواقع
    loadSites();
    
    // تهيئة الأحداث
    initEvents();
    
    // تحميل مكتبة JSZip
    loadJSZip();
    
    // وظيفة تهيئة القائمة الجانبية
    function initSideMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const sideMenu = document.getElementById('sideMenu');
        const closeMenu = document.getElementById('closeMenu');
        const menuItems = document.querySelectorAll('.menu-item');
        
        // فتح/إغلاق القائمة
        menuToggle.addEventListener('click', function() {
            sideMenu.classList.toggle('open');
        });
        
        closeMenu.addEventListener('click', function() {
            sideMenu.classList.remove('open');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(event) {
            if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                sideMenu.classList.remove('open');
            }
        });
        
        // التنقل بين عناصر القائمة
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                // إزالة النشاط من جميع العناصر
                menuItems.forEach(i => i.classList.remove('active'));
                // إضافة النشاط للعنصر الحالي
                this.classList.add('active');
                
                // تنفيذ الإجراء المناسب
                const id = this.id;
                switch(id) {
                    case 'homeMenuItem':
                        scrollToSection('app-header');
                        break;
                    case 'sitesMenuItem':
                        scrollToSection('sitesSection');
                        break;
                    case 'whoAmIMenuItem':
                        openModal('whoAmIModal');
                        break;
                    case 'publishMenuItem':
                        openModal('publishModal');
                        break;
                    case 'newSiteMenuItem':
                        openModal('createSiteModal');
                        break;
                }
                
                // إغلاق القائمة على الموبايل
                if (window.innerWidth <= 768) {
                    sideMenu.classList.remove('open');
                }
            });
        });
    }
    
    // وظيفة تهيئة الأحداث
    function initEvents() {
        // زر ابدأ الآن الثابت
        const startFixedBtn = document.getElementById('startFixedBtn');
        startFixedBtn.addEventListener('click', function() {
            openModal('createSiteModal');
        });
        
        // زر إنشاء أول موقع
        const createFirstSiteBtn = document.getElementById('createFirstSiteBtn');
        createFirstSiteBtn.addEventListener('click', function() {
            openModal('createSiteModal');
        });
        
        // زر إنشاء موقع في المودال
        const submitCreateSite = document.getElementById('submitCreateSite');
        submitCreateSite.addEventListener('click', createNewSite);
        
        // زر تحميل في المودال
        const confirmDownload = document.getElementById('confirmDownload');
        confirmDownload.addEventListener('click', downloadSite);
        
        // إغلاق جميع المودالات
        const closeModalBtns = document.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                closeAllModals();
            });
        });
        
        // إغلاق المودالات عند النقر خارجها
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(modal => {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // إرسال النموذج عند الضغط على Enter
        const siteNameInput = document.getElementById('siteName');
        siteNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                createNewSite();
            }
        });
        
        // تحديث عرض المواقع عند تغيير حجم النافذة
        window.addEventListener('resize', function() {
            renderSites();
        });
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + N لإنشاء موقع جديد
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                openModal('createSiteModal');
            }
            
            // Ctrl/Cmd + S لحفظ الموقع (في المحرر)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentDownloadSite) {
                    prepareDownload(currentDownloadSite);
                }
            }
        });
    }
    
    // وظيفة تحميل سجلات المواقع
    function loadSites() {
        try {
            const savedSites = localStorage.getItem('userSites');
            if (savedSites) {
                sites = JSON.parse(savedSites);
                console.log('تم تحميل المواقع:', sites.length);
            }
        } catch (error) {
            console.error('خطأ في تحميل المواقع:', error);
            sites = [];
        }
        
        renderSites();
    }
    
    // وظيفة عرض المواقع
    function renderSites() {
        const sitesGrid = document.getElementById('sitesGrid');
        const emptySites = document.getElementById('emptySites');
        
        if (sites.length === 0) {
            sitesGrid.innerHTML = '';
            emptySites.style.display = 'block';
            return;
        }
        
        emptySites.style.display = 'none';
        sitesGrid.innerHTML = '';
        
        // عرض المواقع بترتيب زمني (الأحدث أولاً)
        sites.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        sites.forEach((site, index) => {
            const siteCard = document.createElement('div');
            siteCard.className = 'site-card';
            siteCard.dataset.index = index;
            
            const date = new Date(site.updatedAt);
            const dateString = date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // حساب عدد الملفات
            const fileCount = site.files ? Object.keys(site.files).length : 0;
            
            siteCard.innerHTML = `
                <div class="site-icon">
                    <i class="fas fa-globe"></i>
                </div>
                <div class="site-name">${site.name}</div>
                <div class="site-date">
                    ${dateString}
                    <br>
                    <small>${fileCount} ملف${fileCount !== 1 ? 'ات' : ''}</small>
                </div>
                <div class="site-actions">
                    <button class="btn btn-primary btn-small edit-site" data-index="${index}">
                        <i class="fas fa-edit"></i>
                        فتح
                    </button>
                    <button class="btn btn-secondary btn-small download-site" data-index="${index}">
                        <i class="fas fa-download"></i>
                        تحميل
                    </button>
                    <button class="btn btn-danger btn-small delete-site" data-index="${index}">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            `;
            
            sitesGrid.appendChild(siteCard);
        });
        
        // إضافة أحداث للأزرار
        document.querySelectorAll('.edit-site').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                editSite(index);
            });
        });
        
        document.querySelectorAll('.download-site').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                prepareDownload(index);
            });
        });
        
        document.querySelectorAll('.delete-site').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                deleteSite(index);
            });
        });
        
        // فتح الموقع عند النقر على البطاقة
        document.querySelectorAll('.site-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.site-actions')) {
                    const index = parseInt(this.dataset.index);
                    editSite(index);
                }
            });
        });
    }
    
    // وظيفة إنشاء موقع جديد
    function createNewSite() {
        const siteNameInput = document.getElementById('siteName');
        const siteName = siteNameInput.value.trim();
        
        if (!siteName) {
            showToast('يرجى إدخال اسم الموقع', 'error');
            siteNameInput.focus();
            return;
        }
        
        // التحقق من عدم تكرار الاسم
        const existingSite = sites.find(site => site.name.toLowerCase() === siteName.toLowerCase());
        if (existingSite) {
            if (!confirm(`يوجد موقع باسم "${siteName}" بالفعل. هل تريد فتحه؟`)) {
                return;
            }
            loadEditorWithSite(existingSite);
            closeAllModals();
            return;
        }
        
        // إنشاء الموقع
        const newSite = {
            id: generateSiteId(),
            name: siteName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: {
                'index.html': getDefaultHTML(siteName),
                'style.css': getDefaultCSS(siteName),
                'script.js': getDefaultJS(siteName)
            },
            fileTypes: {
                'index.html': 'html',
                'style.css': 'css',
                'script.js': 'javascript'
            }
        };
        
        // إضافة الموقع للمصفوفة
        sites.unshift(newSite);
        
        // حفظ في localStorage
        saveSites();
        
        // إغلاق المودال
        closeAllModals();
        
        // إعادة تعيين النموذج
        siteNameInput.value = '';
        
        // عرض رسالة النجاح
        showToast(`تم إنشاء الموقع "${siteName}" بنجاح`, 'success');
        
        // تحميل موقع المحرر
        loadEditorWithSite(newSite);
    }
    
    // وظيفة تحميل المحرر مع الموقع
    function loadEditorWithSite(site) {
        // حفظ الموقع الحالي
        localStorage.setItem('currentSite', JSON.stringify(site));
        
        // إظهار شاشة التحميل
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.remove('hidden');
        loadingScreen.querySelector('.loading-text').textContent = 'جاري تحميل المحرر...';
        
        // التوجيه إلى المحرر بعد تأخير
        setTimeout(function() {
            window.location.href = 'editor.html';
        }, 1500);
    }
    
    // وظيفة تحميل المحرر للتحرير
    function editSite(index) {
        if (sites[index]) {
            loadEditorWithSite(sites[index]);
        }
    }
    
    // وظيفة تحضير التحميل
    function prepareDownload(index) {
        if (sites[index]) {
            currentDownloadSite = sites[index];
            
            // تحديث قائمة الملفات في المودال
            const downloadFilesList = document.getElementById('downloadFilesList');
            downloadFilesList.innerHTML = '';
            
            const files = currentDownloadSite.files;
            Object.keys(files).forEach(fileName => {
                const li = document.createElement('li');
                const fileType = currentDownloadSite.fileTypes[fileName] || 'unknown';
                const icon = getFileIcon(fileType);
                
                li.innerHTML = `
                    <span>
                        <i class="${icon}"></i>
                        ${fileName}
                    </span>
                    <small>${fileType}</small>
                `;
                downloadFilesList.appendChild(li);
            });
            
            openModal('downloadModal');
        }
    }
    
    // وظيفة تحميل الموقع
    function downloadSite() {
        if (currentDownloadSite) {
            createZipFile(currentDownloadSite);
            closeAllModals();
        }
    }
    
    // وظيفة حذف الموقع
    function deleteSite(index) {
        if (sites[index]) {
            const siteName = sites[index].name;
            if (confirm(`هل تريد حذف الموقع "${siteName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
                sites.splice(index, 1);
                saveSites();
                renderSites();
                showToast(`تم حذف الموقع "${siteName}"`, 'success');
            }
        }
    }
    
    // وظيفة إنشاء ملف ZIP
    function createZipFile(site) {
        // استخدام مكتبة JSZip إذا كانت موجودة
        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            
            // إضافة الملفات
            Object.keys(site.files).forEach(fileName => {
                zip.file(fileName, site.files[fileName]);
            });
            
            // إضافة ملف معلومات
            const info = {
                siteName: site.name,
                created: site.createdAt,
                modified: site.updatedAt,
                files: Object.keys(site.files),
                developer: "محمود أحمد سعيد"
            };
            zip.file("site-info.json", JSON.stringify(info, null, 2));
            
            // إنشاء الملف وتنزيله
            zip.generateAsync({type: "blob"})
                .then(function(content) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(content);
                    link.download = `${site.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_${Date.now()}.zip`;
                    link.click();
                    
                    // تنظيف
                    setTimeout(() => URL.revokeObjectURL(link.href), 100);
                    
                    showToast('تم تحميل الموقع بنجاح', 'success');
                })
                .catch(function(error) {
                    console.error('خطأ في إنشاء ملف ZIP:', error);
                    showToast('حدث خطأ في التحميل', 'error');
                });
        } else {
            showToast('جاري تحميل مكتبة الضغط...', 'warning');
            loadJSZip(() => {
                if (typeof JSZip !== 'undefined') {
                    createZipFile(site);
                } else {
                    showToast('تعذر تحميل مكتبة الضغط', 'error');
                }
            });
        }
    }
    
    // وظيفة حفظ المواقع
    function saveSites() {
        try {
            localStorage.setItem('userSites', JSON.stringify(sites));
            renderSites();
        } catch (error) {
            console.error('خطأ في حفظ المواقع:', error);
            showToast('حدث خطأ في حفظ المواقع', 'error');
        }
    }
    
    // وظيفة فتح المودال
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // التركيز على حقل الإدخال إذا كان موجود
            const input = modal.querySelector('input');
            if (input) {
                setTimeout(() => {
                    input.focus();
                    input.select();
                }, 100);
            }
        }
    }
    
    // وظيفة إغلاق جميع المودالات
    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        currentDownloadSite = null;
    }
    
    // وظيفة التمرير للقسم
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // وظيفة عرض الرسائل
    function showToast(message, type = 'info') {
        // إزالة أي رسالة سابقة
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // إنشاء عنصر الرسالة
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' :
                    type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' :
                    'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // إزالة الرسالة بعد 3 ثواني
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // توليد معرف فريد للموقع
    function generateSiteId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // الحصول على أيقونة الملف حسب النوع
    function getFileIcon(fileType) {
        const icons = {
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'javascript': 'fab fa-js-square',
            'js': 'fab fa-js-square',
            'python': 'fab fa-python',
            'php': 'fab fa-php',
            'java': 'fab fa-java',
            'c': 'fas fa-file-code',
            'cpp': 'fas fa-file-code',
            'csharp': 'fas fa-file-code',
            'ruby': 'far fa-gem',
            'swift': 'fas fa-mobile-alt',
            'go': 'fas fa-code',
            'rust': 'fas fa-cog',
            'typescript': 'fas fa-code',
            'json': 'fas fa-code',
            'xml': 'fas fa-code',
            'sql': 'fas fa-database',
            'markdown': 'fas fa-file-alt',
            'text': 'fas fa-file-alt',
            'unknown': 'fas fa-file'
        };
        
        return icons[fileType.toLowerCase()] || icons.unknown;
    }
    
    // المحتوى الافتراضي للملفات
    function getDefaultHTML(siteName) {
        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteName}</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        /* أنماط إضافية */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
        }
        
        header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .content {
            background: white;
            color: #333;
            padding: 2rem;
            border-radius: 15px;
            margin-bottom: 2rem;
        }
        
        footer {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 ${siteName}</h1>
            <p>مرحباً بك في موقعك الجديد!</p>
            <p><small>تم الإنشاء باستخدام محرر الأكواد المتطور</small></p>
        </header>
        
        <main class="content">
            <h2>محتوى الموقع</h2>
            <p>هذا موقعك الذي أنشأته باستخدام محرر الأكواد المتطور. يمكنك تعديل هذا المحتوى كما تريد.</p>
            
            <div class="features" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 3rem 0;">
                <div class="feature" style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 10px;">
                    <i class="fas fa-rocket" style="font-size: 3rem; color: #4a6ee0; margin-bottom: 1rem;"></i>
                    <h3>سريع</h3>
                    <p>موقع سريع الاستجابة</p>
                </div>
                <div class="feature" style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 10px;">
                    <i class="fas fa-mobile-alt" style="font-size: 3rem; color: #4a6ee0; margin-bottom: 1rem;"></i>
                    <h3>متجاوب</h3>
                    <p>يعمل على جميع الأجهزة</p>
                </div>
                <div class="feature" style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 10px;">
                    <i class="fas fa-paint-brush" style="font-size: 3rem; color: #4a6ee0; margin-bottom: 1rem;"></i>
                    <h3>جميل</h3>
                    <p>تصميم حديث وجذاب</p>
                </div>
            </div>
            
            <button id="demoBtn" style="display: block; margin: 2rem auto; padding: 1rem 3rem; background: linear-gradient(45deg, #4a6ee0, #6a4ee0); color: white; border: none; border-radius: 50px; font-size: 1.1rem; cursor: pointer;">
                <i class="fas fa-magic"></i>
                جرب التفاعل
            </button>
            
            <div id="demoText" style="text-align: center; padding: 2rem; font-size: 1.2rem; color: #64748b;">
                👆 اضغط على الزر أعلاه
            </div>
        </main>
        
        <footer>
            <p>تم التطوير باستخدام محرر الأكواد المتطور</p>
            <p>مطور بواسطة: محمود أحمد سعيد</p>
        </footer>
    </div>
    
    <script>
        // كود JavaScript
        document.addEventListener('DOMContentLoaded', function() {
            const demoBtn = document.getElementById('demoBtn');
            const demoText = document.getElementById('demoText');
            
            if (demoBtn) {
                demoBtn.addEventListener('click', function() {
                    demoText.innerHTML = '🎊 <strong>ممتاز!</strong> أنت تستخدم JavaScript!';
                    demoText.style.color = '#4a6ee0';
                    demoText.style.fontSize = '1.5rem';
                    
                    this.innerHTML = '<i class="fas fa-check"></i> تم التنفيذ!';
                    this.style.background = 'linear-gradient(45deg, #10b981, #34d399)';
                    
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-magic"></i> جرب مرة أخرى';
                        this.style.background = 'linear-gradient(45deg, #4a6ee0, #6a4ee0)';
                        demoText.innerHTML = '👆 اضغط على الزر أعلاه';
                        demoText.style.color = '#64748b';
                        demoText.style.fontSize = '1.2rem';
                    }, 2000);
                });
            }
            
            console.log('🚀 موقع ${siteName} يعمل بنجاح!');
        });
    </script>
</body>
</html>`;
    }
    
    function getDefaultCSS(siteName) {
        return `/* أنماط موقع ${siteName} */

/* Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* أنماط عامة */
body {
    font-family: 'Cairo', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header */
header {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
}

header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Content */
.content {
    background: white;
    color: #333;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
}

/* Features */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
}

.feature {
    text-align: center;
    padding: 2rem;
    background: #f8fafc;
    border-radius: 10px;
    transition: transform 0.3s ease;
    cursor: pointer;
}

.feature:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature i {
    font-size: 3rem;
    color: #4a6ee0;
    margin-bottom: 1rem;
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
}

.feature p {
    color: #64748b;
}

/* Button */
button {
    display: block;
    margin: 2rem auto;
    padding: 1rem 3rem;
    background: linear-gradient(45deg, #4a6ee0, #6a4ee0);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(74, 110, 224, 0.3);
}

/* Footer */
footer {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
}

/* Responsive */
@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    .features {
        grid-template-columns: 1fr;
    }
    
    .feature {
        padding: 1.5rem;
    }
    
    button {
        width: 90%;
        padding: 0.8rem;
    }
}`;
    }
    
    function getDefaultJS(siteName) {
        return `// JavaScript لموقع ${siteName}

console.log('🚀 موقع ${siteName} يعمل بنجاح!');
console.log('💻 تم التطوير باستخدام محرر الأكواد المتطور');

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 تم تحميل الصفحة بنجاح');
    
    // الحصول على العناصر
    const demoBtn = document.getElementById('demoBtn');
    const demoText = document.getElementById('demoText');
    const features = document.querySelectorAll('.feature');
    
    // تفاعل مع زر التجربة
    if (demoBtn && demoText) {
        demoBtn.addEventListener('click', function() {
            demoText.textContent = '🎊 ممتاز! أنت تستخدم JavaScript!';
            demoText.style.color = '#4a6ee0';
            demoText.style.fontSize = '1.5rem';
            demoText.style.fontWeight = 'bold';
            
            this.style.background = 'linear-gradient(45deg, #10b981, #34d399)';
            this.innerHTML = '<i class="fas fa-check"></i> تم التنفيذ!';
            
            setTimeout(() => {
                this.style.background = 'linear-gradient(45deg, #4a6ee0, #6a4ee0)';
                this.innerHTML = '<i class="fas fa-magic"></i> جرب مرة أخرى';
                demoText.textContent = '👆 اضغط على الزر أعلاه';
                demoText.style.color = '#64748b';
                demoText.style.fontSize = '1.2rem';
                demoText.style.fontWeight = 'normal';
            }, 2000);
        });
    }
    
    // تفاعل مع بطاقات الميزات
    if (features.length > 0) {
        features.forEach((feature, index) => {
            feature.addEventListener('click', function() {
                const colors = ['#4a6ee0', '#6a4ee0', '#10b981'];
                const h3 = this.querySelector('h3');
                const icon = this.querySelector('i');
                
                const originalText = h3.textContent;
                const originalColor = h3.style.color;
                
                h3.textContent = 'مميز!';
                h3.style.color = colors[index] || '#4a6ee0';
                
                setTimeout(() => {
                    h3.textContent = originalText;
                    h3.style.color = originalColor;
                }, 1000);
            });
        });
    }
    
    // تحديث تاريخ الفوتر
    const footer = document.querySelector('footer');
    if (footer) {
        const date = new Date();
        const dateStr = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
       
        footer.appendChild(dateElement);
    }
});

// دالة مساعدة لعرض الرسائل
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${type === 'success' ? '#10b981' : 
                    type === 'error' ? '#ef4444' : 
                    type === 'warning' ? '#f59e0b' : '#4a6ee0'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        font-family: 'Cairo', sans-serif;
        animation: fadeIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    \`;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// دالة مساعدة لإضافة تأثيرات
function addEffect(element, effect = 'bounce') {
    element.style.animation = \`\${effect} 0.5s ease\`;
    
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}`;
    }
    
    // تحميل مكتبة JSZip
    function loadJSZip(callback) {
        if (typeof JSZip === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = function() {
                console.log('تم تحميل مكتبة JSZip');
                if (callback) callback();
            };
            script.onerror = function() {
                console.error('فشل في تحميل مكتبة JSZip');
                if (callback) callback();
            };
            document.head.appendChild(script);
        } else if (callback) {
            callback();
        }
    }
});