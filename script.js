window.addEventListener("error", function(e) {
    console.log("Script error caught:", e.message);
});


// الصفحة الرئيسية - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة البداية جاهزة');
    
    // تهيئة المتغيرات
    let sites = [];
    
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
    
    // وظيفة تهيئة القائمة الجانبية
    function initSideMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.getElementById('closeMenu');
    const menuItems = document.querySelectorAll('.menu-item');

    if (!menuToggle || !sideMenu) return;

    menuToggle.addEventListener('click', function() {
        sideMenu.classList.toggle('open');
    });

    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            sideMenu.classList.remove('open');
        });
    }
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
        sites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        sites.forEach((site, index) => {
            const siteCard = document.createElement('div');
            siteCard.className = 'site-card';
            siteCard.dataset.index = index;
            
            const date = new Date(site.createdAt);
            const dateString = date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            siteCard.innerHTML = `
                <div class="site-icon">
                    <i class="fas fa-globe"></i>
                </div>
                <div class="site-name">${site.name}</div>
                <div class="site-date">تم الإنشاء: ${dateString}</div>
                <div class="site-actions">
                    <button class="btn btn-primary btn-small edit-site" data-index="${index}">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-secondary btn-small download-site" data-index="${index}">
                        <i class="fas fa-download"></i>
                        تحميل
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
        
        // إنشاء الموقع
        const newSite = {
            id: generateSiteId(),
            name: siteName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: {
                html: getDefaultHTML(siteName),
                css: getDefaultCSS(),
                js: getDefaultJS()
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
            // حفظ الفهرس الحالي للتحميل
            localStorage.setItem('downloadSiteIndex', index);
            openModal('downloadModal');
        }
    }
    
    // وظيفة تحميل الموقع
    function downloadSite() {
        const index = localStorage.getItem('downloadSiteIndex');
        if (index !== null && sites[index]) {
            const site = sites[index];
            createZipFile(site);
            closeAllModals();
        }
    }
    
    // وظيفة إنشاء ملف ZIP
    function createZipFile(site) {
        // استخدام مكتبة JSZip إذا كانت موجودة
        if (typeof JSZip !== 'undefined') {
            const zip = new JSZip();
            
            // إضافة الملفات
            zip.file("index.html", site.files.html);
            zip.file("style.css", site.files.css);
            zip.file("script.js", site.files.js);
            
            // إضافة ملف معلومات
            const info = {
                siteName: site.name,
                created: site.createdAt,
                modified: site.updatedAt,
                developer: "محمود أحمد سعيد"
            };
            zip.file("site-info.json", JSON.stringify(info, null, 2));
            
            // إنشاء الملف وتنزيله
            zip.generateAsync({type: "blob"})
                .then(function(content) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(content);
                    link.download = `${site.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.zip`;
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
            // البديل إذا لم تكن مكتبة JSZip موجودة
            showToast('ميزة التحميل تحتاج إلى مكتبة JSZip', 'warning');
            
            // تحميل ملف HTML فقط كبديل
            const htmlContent = site.files.html;
            const blob = new Blob([htmlContent], {type: 'text/html'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${site.name.replace(/[^a-z0-9]/gi, '_')}.html`;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
            showToast('تم تحميل ملف HTML', 'info');
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
                setTimeout(() => input.focus(), 100);
            }
        }
    }
    
    // وظيفة إغلاق جميع المودالات
    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
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
        // إنشاء عنصر الرسالة
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc2626' : 
                        type === 'success' ? '#10b981' : 
                        type === 'warning' ? '#f59e0b' : '#4a6ee0'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 4000;
            font-family: 'Cairo', sans-serif;
            text-align: center;
            animation: toastSlideIn 0.3s ease;
        `;
        
        const icon = type === 'success' ? 'fas fa-check-circle' :
                    type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' :
                    'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon}" style="margin-left: 10px;"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // إزالة الرسالة بعد 3 ثواني
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // توليد معرف فريد للموقع
    function generateSiteId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 ${siteName}</h1>
            <p>مرحباً بك في موقعك الجديد!</p>
        </header>
        
        <main>
            <div class="content">
                <h2>محتوى الموقع</h2>
                <p>هذا موقعك الذي أنشأته باستخدام محرر الأكواد المتطور. يمكنك تعديل هذا المحتوى كما تريد.</p>
                
                <div class="features">
                    <div class="feature">
                        <i class="fas fa-rocket"></i>
                        <h3>سريع</h3>
                        <p>موقع سريع الاستجابة</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-mobile-alt"></i>
                        <h3>متجاوب</h3>
                        <p>يعمل على جميع الأجهزة</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-paint-brush"></i>
                        <h3>جميل</h3>
                        <p>تصميم حديث وجذاب</p>
                    </div>
                </div>
            </div>
        </main>
        
        <footer>
            <p>تم التطوير باستخدام محرر الأكواد المتطور - مطور بواسطة محمود أحمد سعيد</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`;
    }
    
    function getDefaultCSS() {
        return `/* أنماط موقع ${siteName} */
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
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.content {
    background: white;
    color: #333;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
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
    background: #f8fafc;
    border-radius: 10px;
    transition: transform 0.3s ease;
}

.feature:hover {
    transform: translateY(-10px);
}

.feature i {
    font-size: 3rem;
    color: #4a6ee0;
    margin-bottom: 1rem;
}

footer {
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
}

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
}`;
    }
    
    function getDefaultJS() {
        return `// JavaScript لموقع ${siteName}
console.log('مرحباً بك في موقعك الجديد!');

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة بنجاح');
    
    // إضافة تأثيرات للعناصر
    const features = document.querySelectorAll('.feature');
    
    features.forEach(feature => {
        feature.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            this.style.background = '#e0e7ff';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.background = '';
            }, 300);
        });
    });
    
    // تحديث التاريخ في الفوتر
    const footer = document.querySelector('footer p');
    if (footer) {
        const date = new Date();
        const dateStr = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        footer.innerHTML += '<br><small>تاريخ الإنشاء: ' + dateStr + '</small>';
    }
});

// دالة مساعدة لإضافة رسائل
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${type === 'success' ? '#10b981' : '#4a6ee0'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    \`;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}`;
    }
    
    // تحميل مكتبة JSZip عند الحاجة
    function loadJSZip() {
        if (typeof JSZip === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = function() {
                console.log('تم تحميل مكتبة JSZip');
            };
            document.head.appendChild(script);
        }
    }
    
    // تحميل مكتبة JSZip عند بدء الصفحة
    loadJSZip();
});

// الوظائف المشتركة بين جميع الصفحات

// تهيئة الصفحة الأساسية
document.addEventListener('DOMContentLoaded', function() {
    // تحسينات للهواتف المحمولة
    if ('ontouchstart' in window) {
        handleTouchEvents();
    }
    
    // تحسينات للأجهزة المختلفة
    detectDevice();
    
    // إعادة التحقق عند تغيير حجم الشاشة
    window.addEventListener('resize', detectDevice);
    
    // رسالة ترحيب في الكونسول
    console.log('%c🚀 محرر الأكواد المتطور', 'font-size: 24px; color: #4a6ee0; font-weight: bold;');
    console.log('%cمرحباً بك! استمتع بتجربة التطوير.', 'font-size: 16px; color: #a5b4fc;');
});

// معالجة أحداث اللمس للهواتف
function handleTouchEvents() {
    // منع التكبير عند النقر المزدوج
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // تحسينات للأزرار على الهواتف
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// كشف نوع الجهاز
function detectDevice() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
    
    if (isTablet) {
        document.body.classList.add('tablet-device');
    }
    
    // تحسينات للشاشات الصغيرة
    if (window.innerWidth < 768) {
        document.body.classList.add('small-screen');
    } else {
        document.body.classList.remove('small-screen');
    }
}

// تحميل أي بيانات محفوظة سابقاً
function loadSavedData() {
    try {
        const lastVisit = localStorage.getItem('lastVisit');
        if (lastVisit) {
            const visitDate = new Date(lastVisit);
            const now = new Date();
            const diffDays = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                console.log('مرحباً بعودتك! لقد زرتَ اليوم.');
            } else if (diffDays === 1) {
                console.log('مرحباً بعودتك! لقد زرتَ بالأمس.');
            } else {
                console.log(`مرحباً بعودتك! آخر زيارة كانت منذ ${diffDays} أيام.`);
            }
        }
    } catch (e) {
        console.log('لا يمكن قراءة البيانات المحفوظة');
    }
}

// حفظ بيانات الزيارة
function saveVisitData() {
    try {
        localStorage.setItem('lastVisit', new Date().toISOString());
    } catch (e) {
        console.log('لا يمكن حفظ البيانات');
    }
}

// دعم لوحة المفاتيح (اختصارات عامة)
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // زر Escape لإغلاق النوافذ
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu && sideMenu.classList.contains('open')) {
                sideMenu.classList.remove('open');
            }
        }
    });
}

// تهيئة اختصارات لوحة المفاتيح
initKeyboardShortcuts();

// تحميل بيانات الزيارة
loadSavedData();

// حفظ بيانات الزيارة عند الخروج
window.addEventListener('beforeunload', function() {
    saveVisitData();
});

// تأثيرات CSS إضافية للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
`;
document.head.appendChild(style);

// الوظائف المشتركة بين جميع الصفحات

// تهيئة الصفحة الأساسية
document.addEventListener('DOMContentLoaded', function() {
    console.log('محرر الأكواد المتطور - تهيئة الصفحة');
    
    // تحسينات للهواتف المحمولة
    if ('ontouchstart' in window) {
        handleTouchEvents();
    }
    
    // تحسينات للأجهزة المختلفة
    detectDevice();
    
    // إعادة التحقق عند تغيير حجم الشاشة
    window.addEventListener('resize', detectDevice);
    
    // تهيئة اختصارات لوحة المفاتيح
    initKeyboardShortcuts();
    
    // تحميل بيانات الزيارة
    loadSavedData();
    
    // رسالة ترحيب في الكونسول
    console.log('%c🚀 محرر الأكواد المتطور', 'font-size: 24px; color: #4a6ee0; font-weight: bold;');
    console.log('%cمرحباً بك! استمتع بتجربة التطوير.', 'font-size: 16px; color: #a5b4fc;');
});

// معالجة أحداث اللمس للهواتف
function handleTouchEvents() {
    // منع التكبير عند النقر المزدوج
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // تحسينات للأزرار على الهواتف
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// كشف نوع الجهاز
function detectDevice() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
    
    if (isTablet) {
        document.body.classList.add('tablet-device');
    }
    
    // تحسينات للشاشات الصغيرة
    if (window.innerWidth < 768) {
        document.body.classList.add('small-screen');
    } else {
        document.body.classList.remove('small-screen');
    }
}

// تحميل أي بيانات محفوظة سابقاً
function loadSavedData() {
    try {
        const lastVisit = localStorage.getItem('lastVisit');
        if (lastVisit) {
            const visitDate = new Date(lastVisit);
            const now = new Date();
            const diffDays = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                console.log('مرحباً بعودتك! لقد زرتَ اليوم.');
            } else if (diffDays === 1) {
                console.log('مرحباً بعودتك! لقد زرتَ بالأمس.');
            } else {
                console.log(`مرحباً بعودتك! آخر زيارة كانت منذ ${diffDays} أيام.`);
            }
        }
    } catch (e) {
        console.log('لا يمكن قراءة البيانات المحفوظة');
    }
}

// حفظ بيانات الزيارة
function saveVisitData() {
    try {
        localStorage.setItem('lastVisit', new Date().toISOString());
    } catch (e) {
        console.log('لا يمكن حفظ البيانات');
    }
}

// دعم لوحة المفاتيح (اختصارات عامة)
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // زر Escape لإغلاق النوافذ
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu && sideMenu.classList.contains('open')) {
                sideMenu.classList.remove('open');
            }
        }
    });
}

// حفظ بيانات الزيارة عند الخروج
window.addEventListener('beforeunload', function() {
    saveVisitData();
});

// تأثيرات CSS إضافية للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);