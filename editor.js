// JavaScript للمحرر
document.addEventListener('DOMContentLoaded', function() {
    console.log('محرر الأكواد جاهز');
    
    // المتغيرات
    let currentSite = null;
    let currentFile = 'html';
    let isPreviewFullscreen = false;
    
    // إخفاء شاشة التحميل
    setTimeout(function() {
        document.getElementById('loading').classList.add('hidden');
        loadCurrentSite();
        initEditor();
        setupEventListeners();
        refreshPreview();
    }, 500);
    
    // تحميل الموقع الحالي
    function loadCurrentSite() {
        try {
            const savedSite = localStorage.getItem('currentSite');
            if (savedSite) {
                currentSite = JSON.parse(savedSite);
                document.getElementById('projectName').textContent = currentSite.name;
                updateEditors();
            } else {
                // إذا لم يكن هناك موقع، العودة للرئيسية
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('خطأ في تحميل الموقع:', error);
            window.location.href = 'index.html';
        }
    }
    
    // تحديث المحررات بالمحتوى
    function updateEditors() {
        if (!currentSite) return;
        
        document.getElementById('htmlEditor').value = currentSite.files.html || '';
        document.getElementById('cssEditor').value = currentSite.files.css || '';
        document.getElementById('jsEditor').value = currentSite.files.js || '';
    }
    
    // تهيئة المحرر
    function initEditor() {
        // إضافة أحداث للملفات في السايدبار
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', function() {
                const file = this.dataset.file;
                switchFile(file);
            });
        });
        
        // إضافة أحداث للتبويبات
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function(e) {
                if (!e.target.classList.contains('tab-close')) {
                    const file = this.dataset.file;
                    switchFile(file);
                }
            });
        });
        
        // إضافة أحداث لأزرار الإغلاق في التبويبات
        document.querySelectorAll('.tab-close').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const file = this.dataset.file;
                // لا يمكن إغلاق التبويب النشط الوحيد
                const activeTabs = document.querySelectorAll('.tab.active');
                if (activeTabs.length > 1) {
                    closeTab(file);
                }
            });
        });
        
        // تحديث المحتوى عند الكتابة
        document.getElementById('htmlEditor').addEventListener('input', function() {
            if (currentSite) {
                currentSite.files.html = this.value;
                currentSite.updatedAt = new Date().toISOString();
            }
        });
        
        document.getElementById('cssEditor').addEventListener('input', function() {
            if (currentSite) {
                currentSite.files.css = this.value;
                currentSite.updatedAt = new Date().toISOString();
            }
        });
        
        document.getElementById('jsEditor').addEventListener('input', function() {
            if (currentSite) {
                currentSite.files.js = this.value;
                currentSite.updatedAt = new Date().toISOString();
            }
        });
    }
    
    // تهيئة الأحداث
    function setupEventListeners() {
        // زر العودة
        document.getElementById('backBtn').addEventListener('click', showExitModal);
        
        // زر العودة للرئيسية
        document.getElementById('backToHome').addEventListener('click', showExitModal);
        
        // زر التشغيل
        document.getElementById('runBtn').addEventListener('click', refreshPreview);
        
        // زر الحفظ
        document.getElementById('saveBtn').addEventListener('click', saveSite);
        
        // زر التحميل
        document.getElementById('downloadBtn').addEventListener('click', downloadCurrentSite);
        
        // زر تحديث المعاينة
        document.getElementById('refreshPreview').addEventListener('click', refreshPreview);
        
        // زر تكبير المعاينة
        document.getElementById('togglePreview').addEventListener('click', togglePreviewFullscreen);
        
        // أزرار الأدوات
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleToolAction(action);
            });
        });
        
        // أزرار التنسيق والمسح في المحررات
        document.querySelectorAll('[data-action="format"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;
                formatCode(lang);
            });
        });
        
        document.querySelectorAll('[data-action="clear"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.dataset.lang;
                clearCode(lang);
            });
        });
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', function(e) {
            // حفظ مع Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveSite();
            }
            
            // تشغيل مع Ctrl+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                refreshPreview();
            }
            
            // تبديل الملفات مع Ctrl+1/2/3
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                const files = ['html', 'css', 'js'];
                const index = parseInt(e.key) - 1;
                if (files[index]) {
                    switchFile(files[index]);
                }
            }
            
            // إغلاق التبويب مع Ctrl+W
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                e.preventDefault();
                const activeTabs = document.querySelectorAll('.tab.active');
                if (activeTabs.length > 1) {
                    closeTab(currentFile);
                }
            }
        });
        
        // أحداث الخروج
        document.getElementById('exitWithoutSave').addEventListener('click', exitToHome);
        document.getElementById('saveAndExit').addEventListener('click', saveAndExit);
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('exitModal').classList.remove('active');
            });
        });
    }
    
    // تبديل الملف النشط
    function switchFile(file) {
        if (currentFile === file) return;
        
        currentFile = file;
        
        // تحديث الملفات في السايدبار
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.file === file) {
                item.classList.add('active');
            }
        });
        
        // تحديث التبويبات
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.file === file) {
                tab.classList.add('active');
            }
        });
        
        // إظهار المحرر المناسب
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
            if (section.dataset.lang === file) {
                section.classList.add('active');
            }
        });
        
        // التركيز على المحرر
        document.getElementById(file + 'Editor').focus();
    }
    
    // إغلاق التبويب
    function closeTab(file) {
        if (file === currentFile) {
            // البحث عن تبويب آخر لتفعيله
            const tabs = document.querySelectorAll('.tab:not(.active)');
            if (tabs.length > 0) {
                const nextFile = tabs[0].dataset.file;
                switchFile(nextFile);
            }
        }
        
        // إخفاء التبويب (في واجهة حقيقية سنقوم بإزالته)
        const tab = document.querySelector(`.tab[data-file="${file}"]`);
        if (tab) {
            tab.style.display = 'none';
        }
    }
    
    // حفظ الموقع
    function saveSite() {
        if (!currentSite) return;
        
        try {
            // تحديث وقت التعديل
            currentSite.updatedAt = new Date().toISOString();
            
            // حفظ في localStorage كموقع حالي
            localStorage.setItem('currentSite', JSON.stringify(currentSite));
            
            // تحديث في قائمة المواقع
            updateSiteInList();
            
            // عرض رسالة النجاح
            showToast('تم حفظ الموقع بنجاح', 'success');
            
            // تأثير على زر الحفظ
            const saveBtn = document.getElementById('saveBtn');
            const originalHTML = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> تم الحفظ';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.innerHTML = originalHTML;
                saveBtn.disabled = false;
            }, 1500);
            
        } catch (error) {
            console.error('خطأ في حفظ الموقع:', error);
            showToast('حدث خطأ في حفظ الموقع', 'error');
        }
    }
    
    // تحديث الموقع في القائمة
    function updateSiteInList() {
        try {
            const savedSites = JSON.parse(localStorage.getItem('userSites') || '[]');
            const siteIndex = savedSites.findIndex(site => site.id === currentSite.id);
            
            if (siteIndex !== -1) {
                savedSites[siteIndex] = currentSite;
                localStorage.setItem('userSites', JSON.stringify(savedSites));
            }
        } catch (error) {
            console.error('خطأ في تحديث قائمة المواقع:', error);
        }
    }
    
    // تحميل الموقع الحالي
    function downloadCurrentSite() {
        if (!currentSite) return;
        
        // استخدام مكتبة JSZip إذا كانت موجودة
        if (typeof JSZip !== 'undefined') {
            createZipFile(currentSite);
        } else {
            // تحميل مكتبة JSZip أولاً
            loadJSZip(() => {
                if (typeof JSZip !== 'undefined') {
                    createZipFile(currentSite);
                } else {
                    // البديل: تحميل ملف HTML فقط
                    downloadHTMLFile();
                }
            });
        }
    }
    
    // إنشاء ملف ZIP
    function createZipFile(site) {
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
    }
    
    // تحميل ملف HTML فقط
    function downloadHTMLFile() {
        if (!currentSite) return;
        
        const htmlContent = currentSite.files.html;
        const blob = new Blob([htmlContent], {type: 'text/html'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${currentSite.name.replace(/[^a-z0-9]/gi, '_')}.html`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        showToast('تم تحميل ملف HTML', 'info');
    }
    
    // تحديث المعاينة
    function refreshPreview() {
        if (!currentSite) return;
        
        const iframe = document.getElementById('previewFrame');
        
        // جمع الكود
        let html = currentSite.files.html;
        const css = currentSite.files.css;
        const js = currentSite.files.js;
        
        // إضافة CSS إذا لم يكن مضمن
        if (!html.includes('<style>')) {
            const styleTag = `<style>\n${css}\n</style>`;
            html = html.replace('</head>', `${styleTag}\n</head>`);
        }
        
        // إضافة JavaScript إذا لم يكن مضمن
        if (!html.includes('<script>')) {
            const scriptTag = `<script>\n${js}\n</script>`;
            html = html.replace('</body>', `${scriptTag}\n</body>`);
        }
        
        // إضافة Font Awesome إذا لم يكن موجود
        if (!html.includes('font-awesome')) {
            const fontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">';
            html = html.replace('</head>', `${fontAwesome}\n</head>`);
        }
        
        // إضافة Google Fonts إذا لم يكن موجود
        if (!html.includes('fonts.googleapis.com')) {
            const googleFonts = '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
            html = html.replace('</head>', `${googleFonts}\n</head>`);
        }
        
        // عرض المعاينة
        iframe.srcdoc = html;
        
        // تأثير على زر التشغيل
        const runBtn = document.getElementById('runBtn');
        const originalHTML = runBtn.innerHTML;
        runBtn.innerHTML = '<i class="fas fa-check"></i> تم التشغيل';
        runBtn.disabled = true;
        
        setTimeout(() => {
            runBtn.innerHTML = originalHTML;
            runBtn.disabled = false;
        }, 1500);
    }
    
    // تبديل وضع ملء الشاشة للمعاينة
    function togglePreviewFullscreen() {
        const previewPanel = document.querySelector('.preview-panel');
        const toggleBtn = document.getElementById('togglePreview');
        
        if (!isPreviewFullscreen) {
            // الدخول إلى وضع ملء الشاشة
            previewPanel.style.position = 'fixed';
            previewPanel.style.top = '0';
            previewPanel.style.left = '0';
            previewPanel.style.right = '0';
            previewPanel.style.bottom = '0';
            previewPanel.style.width = '100%';
            previewPanel.style.height = '100%';
            previewPanel.style.zIndex = '2000';
            
            toggleBtn.innerHTML = '<i class="fas fa-compress"></i> تصغير';
            isPreviewFullscreen = true;
        } else {
            // الخروج من وضع ملء الشاشة
            previewPanel.style.position = '';
            previewPanel.style.top = '';
            previewPanel.style.left = '';
            previewPanel.style.right = '';
            previewPanel.style.bottom = '';
            previewPanel.style.width = '';
            previewPanel.style.height = '';
            previewPanel.style.zIndex = '';
            
            toggleBtn.innerHTML = '<i class="fas fa-expand"></i> تكبير';
            isPreviewFullscreen = false;
        }
    }
    
    // معالجة إجراءات الأدوات
    function handleToolAction(action) {
        switch(action) {
            case 'format':
                formatCode(currentFile);
                break;
            case 'clear':
                clearCode(currentFile);
                break;
            case 'preview':
                refreshPreview();
                break;
        }
    }
    
    // تنسيق الكود
    function formatCode(lang) {
        const editor = document.getElementById(lang + 'Editor');
        if (!editor) return;
        
        let content = editor.value;
        
        try {
            switch(lang) {
                case 'html':
                    content = formatHTML(content);
                    break;
                case 'css':
                    content = formatCSS(content);
                    break;
                case 'js':
                    content = formatJS(content);
                    break;
            }
            
            editor.value = content;
            
            // تحديث في currentSite
            if (currentSite) {
                currentSite.files[lang] = content;
                currentSite.updatedAt = new Date().toISOString();
            }
            
            showToast('تم تنسيق الكود', 'success');
        } catch (error) {
            console.error('خطأ في التنسيق:', error);
            showToast('حدث خطأ في تنسيق الكود', 'error');
        }
    }
    
    // تنسيق HTML
    function formatHTML(html) {
        // تبسيط التنسيق - في تطبيق حقيقي نستخدم مكتبة متخصصة
        let formatted = html
            .replace(/>\s+</g, '>\n<')
            .replace(/\s+/g, ' ')
            .replace(/\s\s+/g, ' ');
        
        // إضافة مسافات بادئة بسيطة
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // تقليل المسافة البادئة للوسم المغلق
            if (line.startsWith('</')) {
                indentLevel--;
            }
            
            // إضافة السطر الحالي مع المسافة البادئة
            formattedLines.push('  '.repeat(Math.max(0, indentLevel)) + line);
            
            // زيادة المسافة البادئة للوسم المفتوح
            if (line.startsWith('<') && !line.startsWith('</') && 
                !line.includes('/>') && !line.match(/<(br|hr|img|meta|link|input)/i)) {
                indentLevel++;
            }
        }
        
        return formattedLines.join('\n');
    }
    
    // تنسيق CSS
    function formatCSS(css) {
        // تبسيط تنسيق CSS
        let formatted = css
            .replace(/\s*\{\s*/g, ' {\n  ')
            .replace(/\s*\}\s*/g, '\n}\n\n')
            .replace(/\s*;\s*/g, ';\n  ')
            .replace(/\s*:\s*/g, ': ')
            .replace(/,\s*/g, ', ');
        
        return formatted;
    }
    
    // تنسيق JavaScript
    function formatJS(js) {
        // في تطبيق حقيقي نستخدم مكتبة مثل Prettier
        return js;
    }
    
    // مسح الكود
    function clearCode(lang) {
        if (confirm(`هل تريد مسح محتوى ${lang.toUpperCase()}؟`)) {
            const editor = document.getElementById(lang + 'Editor');
            if (editor) {
                editor.value = '';
                
                // تحديث في currentSite
                if (currentSite) {
                    currentSite.files[lang] = '';
                    currentSite.updatedAt = new Date().toISOString();
                }
                
                showToast(`تم مسح محتوى ${lang.toUpperCase()}`, 'success');
            }
        }
    }
    
    // عرض مودال الخروج
    function showExitModal() {
        document.getElementById('exitModal').classList.add('active');
    }
    
    // حفظ والخروج
    function saveAndExit() {
        saveSite();
        setTimeout(() => {
            exitToHome();
        }, 500);
    }
    
    // الخروج للرئيسية
    function exitToHome() {
        window.location.href = 'index.html';
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
            document.head.appendChild(script);
        } else if (callback) {
            callback();
        }
    }
    
    // وظيفة عرض الرسائل
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#dc2626' : 
                        type === 'success' ? '#10b981' : 
                        type === 'warning' ? '#f59e0b' : '#4a6ee0'};
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            z-index: 4000;
            font-family: 'Cairo', sans-serif;
            text-align: center;
            animation: toastSlideIn 0.3s ease;
            max-width: 90%;
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
    
    // تحميل مكتبة JSZip عند بدء الصفحة
    loadJSZip();
});