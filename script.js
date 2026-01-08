// Main Code Editor Application
class CodeEditor {
    constructor() {
        this.files = [];
        this.currentFileType = 'html';
        this.projectName = 'مشروع جديد';
        this.isFullscreen = false;
        this.theme = localStorage.getItem('codeEditorTheme') || 'light';
        this.previewWindow = null;
        
        this.defaultFiles = {
            html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مشروعي الأول</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 مرحباً في محرر الأكواد!</h1>
            <p>مطور بواسطة: محمود أحمد سعيد</p>
        </header>
        
        <main>
            <div class="features">
                <div class="feature-card">
                    <i class="fas fa-code"></i>
                    <h3>HTML5</h3>
                    <p>بناء هيكل الصفحة</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-palette"></i>
                    <h3>CSS3</h3>
                    <p>تنسيق وتصميم الصفحة</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-magic"></i>
                    <h3>JavaScript</h3>
                    <p>إضافة التفاعلية</p>
                </div>
            </div>
            
            <button id="demoBtn" class="btn">جرب التفاعل</button>
            <div id="demoText" class="demo-text">👆 اضغط على الزر أعلاه</div>
        </main>
        
        <footer>
            <p>تم التطوير باستخدام محرر الأكواد المتطور</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,

            css: `/* أنماط افتراضية للمشروع */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    min-height: 100vh;
    padding: 20px;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: fadeIn 1s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

header {
    background: linear-gradient(45deg, #4a6ee0, #6a4ee0);
    color: white;
    padding: 3rem 2rem;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
}

header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 3rem 2rem;
}

.feature-card {
    background: #f8fafc;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    cursor: pointer;
}

.feature-card:hover {
    transform: translateY(-10px);
    border-color: #4a6ee0;
    box-shadow: 0 10px 30px rgba(74, 110, 224, 0.2);
}

.feature-card i {
    font-size: 3rem;
    color: #4a6ee0;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
}

.feature-card p {
    color: #64748b;
}

.btn {
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
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.btn:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 30px rgba(74, 110, 224, 0.4);
}

.demo-text {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #64748b;
    transition: all 0.3s ease;
}

.demo-text.active {
    color: #4a6ee0;
    font-size: 1.5rem;
    font-weight: bold;
    animation: bounce 0.5s ease;
}

@keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

footer {
    text-align: center;
    padding: 2rem;
    background: #f8fafc;
    color: #64748b;
    border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 1.8rem;
    }
    
    .features {
        grid-template-columns: 1fr;
        padding: 2rem 1rem;
    }
    
    .btn {
        width: 90%;
        padding: 0.8rem;
    }
}`,

            js: `// كود JavaScript افتراضي
document.addEventListener('DOMContentLoaded', function() {
    const demoBtn = document.getElementById('demoBtn');
    const demoText = document.getElementById('demoText');
    const featureCards = document.querySelectorAll('.feature-card');
    
    // تفاعل مع زر التجربة
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            demoText.textContent = '🎊 ممتاز! أنت تستخدم JavaScript!';
            demoText.classList.add('active');
            
            this.style.background = 'linear-gradient(45deg, #10b981, #34d399)';
            this.innerHTML = '<i class="fas fa-check"></i> تم التنفيذ!';
            
            setTimeout(() => {
                this.style.background = 'linear-gradient(45deg, #4a6ee0, #6a4ee0)';
                this.innerHTML = 'جرب التفاعل مرة أخرى';
                demoText.classList.remove('active');
                demoText.textContent = '👆 اضغط على الزر أعلاه';
            }, 2000);
        });
    }
    
    // تفاعل مع بطاقات الميزات
    if (featureCards.length > 0) {
        featureCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                const colors = ['#4a6ee0', '#6a4ee0', '#10b981'];
                const icons = ['fa-code', 'fa-palette', 'fa-magic'];
                const h3 = this.querySelector('h3');
                const icon = this.querySelector('i');
                
                const originalText = h3.textContent;
                const originalIcon = icon.className;
                
                h3.textContent = 'مميز!';
                h3.style.color = colors[index];
                icon.className = \`fas \${icons[index]} fa-spin\`;
                
                setTimeout(() => {
                    h3.textContent = originalText;
                    h3.style.color = '';
                    icon.className = originalIcon;
                }, 1000);
            });
        });
    }
    
    // تأثير التمرير على العنوان
    const header = document.querySelector('header h1');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const hue = (scrollPosition % 360);
            header.style.background = \`linear-gradient(45deg, hsl(\${hue}, 100%, 50%), hsl(\${hue + 30}, 100%, 50%))\`;
            header.style.webkitBackgroundClip = 'text';
            header.style.backgroundClip = 'text';
        });
    }
    
    console.log('🚀 مرحباً بك في محرر الأكواد!');
    console.log('💻 تم التطوير بواسطة محمود أحمد سعيد');
});

// دالة مساعدة لإضافة تأثيرات عشوائية
function addRandomEffect(element) {
    const effects = ['bounce', 'pulse', 'rubberBand', 'shake'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    element.classList.add('animate__animated', \`animate__\${randomEffect}\`);
    
    setTimeout(() => {
        element.classList.remove('animate__animated', \`animate__\${randomEffect}\`);
    }, 1000);
}`
        };
        
        this.initialize();
    }
    
    // Initialize the application
    initialize() {
        console.log('جاري تهيئة المحرر...');
        
        // Set theme
        this.setTheme(this.theme);
        
        // Load saved project or use defaults
        this.loadProject();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render initial UI
        this.renderFileList();
        this.renderEditorTabs();
        this.setupCodeEditors();
        
        // Update status
        this.updateStatus('جاهز', 'success');
        
        console.log('تم تهيئة المحرر بنجاح!');
    }
    
    // Setup event listeners
    setupEventListeners() {
        console.log('جاري إعداد مستمعي الأحداث...');
        
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleSidebar());
            console.log('تم إعداد زر القائمة');
        }
        
        // Run code
        const runBtn = document.getElementById('runBtn');
        if (runBtn) {
            runBtn.addEventListener('click', () => this.runCode());
            console.log('تم إعداد زر التشغيل');
        }
        
        // Save all
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAll());
            console.log('تم إعداد زر الحفظ');
        }
        
        // Download project
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadProject());
            console.log('تم إعداد زر التحميل');
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('تم إعداد زر السمة');
        }
        
        // New file button
        const newFileBtn = document.getElementById('newFileBtn');
        if (newFileBtn) {
            newFileBtn.addEventListener('click', () => this.showNewFileModal());
            console.log('تم إعداد زر الملف الجديد');
        }
        
        // Create file button
        const createFileBtn = document.getElementById('createFileBtn');
        if (createFileBtn) {
            createFileBtn.addEventListener('click', () => this.createNewFile());
            console.log('تم إعداد زر إنشاء الملف');
        }
        
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        console.log('تم إعداد أزرار إغلاق النافذة');
        
        // Format code buttons
        document.querySelectorAll('[data-action="format"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.closest('button').dataset.lang;
                this.formatCode(lang);
            });
        });
        console.log('تم إعداد أزرار التنسيق');
        
        // Clear code buttons
        document.querySelectorAll('[data-action="clear"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.closest('button').dataset.lang;
                if (confirm(`هل تريد مسح محتوى ${lang.toUpperCase()}؟`)) {
                    this.clearEditor(lang);
                }
            });
        });
        console.log('تم إعداد أزرار المسح');
        
        // Handle clicks outside sidebar on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (window.innerWidth <= 768 && 
                sidebar && sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                menuToggle && !menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 300);
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Save with Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAll();
            }
            
            // Run with Ctrl+Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            
            // New file with Ctrl+N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showNewFileModal();
            }
            
            // Close sidebar with Escape
            if (e.key === 'Escape') {
                this.closeSidebar();
                this.closeModal();
            }
        });
        
        console.log('تم إعداد جميع مستمعي الأحداث');
    }
    
    // Handle window resize
    handleResize() {
        // Adjust textarea font size for mobile
        const isMobile = window.innerWidth <= 768;
        const textareas = document.querySelectorAll('.code-editor textarea');
        
        textareas.forEach(textarea => {
            textarea.style.fontSize = isMobile ? '14px' : '15px';
        });
        
        // Close sidebar on resize to desktop
        if (window.innerWidth > 768) {
            this.closeSidebar();
        }
    }
    
    // Load project from localStorage or create default
    loadProject() {
        console.log('جاري تحميل المشروع...');
        
        try {
            const saved = localStorage.getItem('codeEditorProject');
            
            if (saved) {
                const projectData = JSON.parse(saved);
                this.files = projectData.files || this.createDefaultFiles();
                this.projectName = projectData.projectName || 'مشروع جديد';
                this.theme = projectData.theme || 'light';
                
                console.log('تم تحميل المشروع من التخزين المحلي');
            } else {
                this.files = this.createDefaultFiles();
                console.log('تم إنشاء مشروع جديد افتراضي');
            }
            
            // Update project name in UI
            const projectNameElement = document.getElementById('projectName');
            if (projectNameElement) {
                projectNameElement.textContent = this.projectName;
            }
        } catch (error) {
            console.error('خطأ في تحميل المشروع:', error);
            this.files = this.createDefaultFiles();
            this.showToast('❌ حدث خطأ في تحميل المشروع المحفوظ', 'error');
        }
    }
    
    // Create default files
    createDefaultFiles() {
        return [
            { 
                id: 1, 
                name: 'index.html', 
                type: 'html', 
                content: this.defaultFiles.html,
                active: true 
            },
            { 
                id: 2, 
                name: 'style.css', 
                type: 'css', 
                content: this.defaultFiles.css,
                active: true 
            },
            { 
                id: 3, 
                name: 'script.js', 
                type: 'js', 
                content: this.defaultFiles.js,
                active: true 
            }
        ];
    }
    
    // Render file list
    renderFileList() {
        console.log('جاري عرض قائمة الملفات...');
        
        const fileList = document.getElementById('fileList');
        if (!fileList) {
            console.error('عنصر قائمة الملفات غير موجود');
            return;
        }
        
        fileList.innerHTML = '';
        
        this.files.forEach(file => {
            const li = document.createElement('li');
            li.className = `file-item ${this.currentFileType === file.type ? 'active' : ''}`;
            
            const iconClass = file.type === 'html' ? 'html5' :
                            file.type === 'css' ? 'css3-alt' :
                            file.type === 'js' ? 'js-square' : 'file-alt';
            
            li.innerHTML = `
                <div class="file-info">
                    <i class="fab fa-${iconClass} file-icon ${file.type}"></i>
                    <span class="file-name">${file.name}</span>
                </div>
                <div class="file-actions">
                    <button class="btn btn-icon btn-small delete-file" data-id="${file.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click event to switch to file
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    this.switchToFile(file.type);
                    if (window.innerWidth <= 768) {
                        this.closeSidebar();
                    }
                }
            });
            
            fileList.appendChild(li);
        });
        
        // Add event listeners to delete buttons
        fileList.querySelectorAll('.delete-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileId = parseInt(e.currentTarget.dataset.id);
                this.deleteFile(fileId);
            });
        });
        
        console.log('تم عرض قائمة الملفات');
    }
    
    // Render editor tabs
    renderEditorTabs() {
        console.log('جاري عرض علامات التبويب...');
        
        const editorTabs = document.getElementById('editorTabs');
        if (!editorTabs) {
            console.error('عنصر علامات التبويب غير موجود');
            return;
        }
        
        editorTabs.innerHTML = '';
        
        const activeFiles = this.files.filter(f => f.active);
        
        if (activeFiles.length === 0) {
            console.log('لا توجد ملفات نشطة لعرضها');
            return;
        }
        
        activeFiles.forEach(file => {
            const tab = document.createElement('div');
            tab.className = `tab ${this.currentFileType === file.type ? 'active' : ''}`;
            
            const iconClass = file.type === 'html' ? 'html5' :
                            file.type === 'css' ? 'css3-alt' : 'js-square';
            
            tab.innerHTML = `
                <i class="fab fa-${iconClass} ${file.type}"></i>
                <span class="tab-name">${file.name}</span>
                ${activeFiles.length > 1 ? `<span class="tab-close" data-type="${file.type}"><i class="fas fa-times"></i></span>` : ''}
            `;
            
            // Add click event to switch to file
            tab.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-close')) {
                    this.switchToFile(file.type);
                }
            });
            
            // Add click event to close tab
            const closeBtn = tab.querySelector('.tab-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeTab(file.type);
                });
            }
            
            editorTabs.appendChild(tab);
        });
        
        console.log('تم عرض علامات التبويب');
    }
    
    // Setup code editors
    setupCodeEditors() {
        console.log('جاري إعداد المحررات...');
        
        // Initialize editors with content
        this.files.forEach(file => {
            const editor = document.getElementById(`${file.type}Editor`);
            if (editor) {
                let textarea = editor.querySelector('textarea');
                
                if (!textarea) {
                    textarea = document.createElement('textarea');
                    textarea.spellcheck = false;
                    textarea.autocomplete = 'off';
                    textarea.autocorrect = 'off';
                    textarea.autocapitalize = 'off';
                    
                    // Set mobile-friendly styles
                    textarea.style.fontSize = window.innerWidth <= 768 ? '14px' : '15px';
                    textarea.style.lineHeight = '1.6';
                    textarea.style.fontFamily = "'Cairo', 'Courier New', monospace";
                    
                    editor.appendChild(textarea);
                }
                
                textarea.value = file.content;
                
                // Add input event listener
                textarea.addEventListener('input', (e) => {
                    this.saveFileContent(file.type, e.target.value);
                });
                
                // Handle keyboard for mobile
                textarea.addEventListener('keydown', (e) => {
                    // Tab key support
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        
                        // Insert 2 spaces
                        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                        
                        // Move cursor
                        textarea.selectionStart = textarea.selectionEnd = start + 2;
                        
                        // Trigger input event
                        textarea.dispatchEvent(new Event('input'));
                    }
                });
            }
        });
        
        // Show the current editor
        this.showEditor(this.currentFileType);
        
        console.log('تم إعداد المحررات');
    }
    
    // Show specific editor
    showEditor(type) {
        console.log(`جاري عرض محرر ${type}...`);
        
        // Hide all editors
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected editor
        const editorSection = document.querySelector(`.editor-section[data-lang="${type}"]`);
        if (editorSection) {
            editorSection.classList.add('active');
        }
        
        // Update current file type
        this.currentFileType = type;
        
        // Update UI
        this.renderFileList();
        this.renderEditorTabs();
        
        // Update current file in footer
        const currentFile = this.files.find(f => f.type === type);
        if (currentFile) {
            const currentFileElement = document.getElementById('currentFile');
            if (currentFileElement) {
                currentFileElement.textContent = currentFile.name;
            }
        }
        
        console.log(`تم عرض محرر ${type}`);
    }
    
    // Switch to a file
    switchToFile(type) {
        if (this.currentFileType !== type) {
            this.currentFileType = type;
            this.showEditor(type);
        }
    }
    
    // Save file content
    saveFileContent(type, content) {
        const fileIndex = this.files.findIndex(f => f.type === type);
        if (fileIndex > -1) {
            this.files[fileIndex].content = content;
        }
    }
    
    // Run code
    runCode() {
        console.log('جاري تشغيل الكود...');
        this.updateStatus('جاري التشغيل...', 'warning');
        
        const htmlFile = this.files.find(f => f.type === 'html');
        const cssFile = this.files.find(f => f.type === 'css');
        const jsFile = this.files.find(f => f.type === 'js');
        
        if (!htmlFile) {
            this.showToast('❌ ملف HTML مطلوب للتشغيل', 'error');
            this.updateStatus('خطأ', 'error');
            return;
        }
        
        // Prepare HTML content
        let htmlContent = htmlFile.content;
        
        // Inject CSS if exists
        if (cssFile && cssFile.content.trim()) {
            const styleTag = `<style>\n${cssFile.content}\n</style>`;
            htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
        }
        
        // Inject JavaScript if exists
        if (jsFile && jsFile.content.trim()) {
            const scriptTag = `<script>\n${jsFile.content}\n</script>`;
            htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
        }
        
        // Add Font Awesome and Google Fonts if not present
        if (!htmlContent.includes('font-awesome') && !htmlContent.includes('fontawesome')) {
            const fontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">';
            htmlContent = htmlContent.replace('</head>', `${fontAwesome}\n</head>`);
        }
        
        if (!htmlContent.includes('fonts.googleapis.com')) {
            const googleFonts = '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">';
            htmlContent = htmlContent.replace('</head>', `${googleFonts}\n</head>`);
        }
        
        // Create a blob URL for the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const previewUrl = URL.createObjectURL(blob);
        
        // Open in new window/tab
        this.openPreviewWindow(previewUrl);
        
        this.showToast('✅ تم تشغيل الكود بنجاح', 'success');
        this.updateStatus('جاهز', 'success');
        
        // Update run button temporarily
        const runBtn = document.getElementById('runBtn');
        if (runBtn) {
            const originalHTML = runBtn.innerHTML;
            runBtn.innerHTML = '<i class="fas fa-check"></i>';
            runBtn.disabled = true;
            
            setTimeout(() => {
                runBtn.innerHTML = originalHTML;
                runBtn.disabled = false;
            }, 1500);
        }
    }
    
    // Open preview window
    openPreviewWindow(url) {
        console.log('جاري فتح نافذة المعاينة...');
        
        // Close previous preview window if open
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.close();
        }
        
        // Generate unique window name
        const windowName = 'preview_' + Date.now();
        
        // Calculate window size based on device
        const isMobile = window.innerWidth <= 768;
        const width = isMobile ? window.innerWidth : Math.min(1200, window.innerWidth * 0.9);
        const height = isMobile ? window.innerHeight : Math.min(800, window.innerHeight * 0.9);
        
        // For mobile, use full screen
        if (isMobile) {
            this.previewWindow = window.open(url, windowName, 'fullscreen=yes');
        } else {
            // For desktop, use centered window
            const left = (window.innerWidth - width) / 2 + window.screenX;
            const top = (window.innerHeight - height) / 2 + window.screenY;
            
            this.previewWindow = window.open(url, windowName, `
                width=${width},
                height=${height},
                left=${left},
                top=${top},
                resizable=yes,
                scrollbars=yes,
                toolbar=no,
                menubar=no,
                location=no,
                status=no
            `);
        }
        
        if (this.previewWindow) {
            // Focus the new window
            this.previewWindow.focus();
            
            // Handle window close
            this.previewWindow.onbeforeunload = () => {
                URL.revokeObjectURL(url);
            };
        } else {
            this.showToast('❌ تم منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة', 'error');
            // Fallback: open in new tab
            const newTab = window.open(url, '_blank');
            if (newTab) {
                this.previewWindow = newTab;
            }
        }
    }
    
    // Save all files
    saveAll() {
        console.log('جاري حفظ المشروع...');
        this.updateStatus('جاري الحفظ...', 'warning');
        
        // Save to localStorage
        const projectData = {
            files: this.files,
            projectName: this.projectName,
            theme: this.theme,
            lastSaved: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('codeEditorProject', JSON.stringify(projectData));
            
            this.showToast('💾 تم حفظ المشروع بنجاح', 'success');
            this.updateStatus('جاهز', 'success');
            
            // Update save button temporarily
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) {
                const originalHTML = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-check"></i>';
                saveBtn.disabled = true;
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalHTML;
                    saveBtn.disabled = false;
                }, 1500);
            }
        } catch (error) {
            console.error('خطأ في حفظ المشروع:', error);
            this.showToast('❌ حدث خطأ في حفظ المشروع', 'error');
            this.updateStatus('خطأ', 'error');
        }
    }
    
    // Download project
    downloadProject() {
        console.log('جاري تحميل المشروع...');
        this.updateStatus('جاري تحضير الملف...', 'warning');
        
        // Create project data
        const projectData = {
            files: this.files,
            projectName: this.projectName,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `مشروع-محرر-الأكواد-${new Date().getTime()}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up URL
        setTimeout(() => {
            URL.revokeObjectURL(downloadLink.href);
        }, 1000);
        
        this.showToast('📦 تم تحميل المشروع', 'success');
        this.updateStatus('جاهز', 'success');
    }
    
    // Show new file modal
    showNewFileModal() {
        console.log('جاري عرض نافذة الملف الجديد...');
        const modal = document.getElementById('newFileModal');
        if (modal) {
            modal.classList.add('active');
            
            // Focus on file name input
            const fileNameInput = document.getElementById('fileName');
            if (fileNameInput) {
                setTimeout(() => {
                    fileNameInput.focus();
                }, 100);
            }
        }
    }
    
    // Close modal
    closeModal() {
        console.log('جاري إغلاق النافذة...');
        const modal = document.getElementById('newFileModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset form
        const fileNameInput = document.getElementById('fileName');
        const fileContentTextarea = document.getElementById('fileContent');
        
        if (fileNameInput) fileNameInput.value = 'newfile.html';
        if (fileContentTextarea) fileContentTextarea.value = '';
    }
    
    // Create new file
    createNewFile() {
        console.log('جاري إنشاء ملف جديد...');
        
        const fileNameInput = document.getElementById('fileName');
        const fileTypeSelect = document.getElementById('fileType');
        const fileContentTextarea = document.getElementById('fileContent');
        
        if (!fileNameInput || !fileTypeSelect) {
            this.showToast('❌ حدث خطأ في إنشاء الملف', 'error');
            return;
        }
        
        const name = fileNameInput.value.trim();
        const type = fileTypeSelect.value;
        const content = fileContentTextarea ? fileContentTextarea.value : '';
        
        if (!name) {
            this.showToast('❌ يرجى إدخال اسم الملف', 'error');
            return;
        }
        
        // Check if file with same name already exists
        const existingFile = this.files.find(f => f.name === name);
        if (existingFile) {
            if (!confirm(`يوجد ملف باسم "${name}" بالفعل. هل تريد استبداله؟`)) {
                return;
            }
            
            // Remove existing file
            this.files = this.files.filter(f => f.name !== name);
        }
        
        const newFile = {
            id: Date.now(),
            name: name.includes('.') ? name : `${name}.${type}`,
            type: type,
            content: content,
            active: true
        };
        
        this.files.push(newFile);
        this.closeModal();
        this.switchToFile(type);
        this.setupCodeEditors();
        
        this.showToast(`✅ تم إنشاء الملف ${newFile.name}`, 'success');
    }
    
    // Delete file
    deleteFile(fileId) {
        console.log(`جاري حذف الملف رقم ${fileId}...`);
        
        const fileIndex = this.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;
        
        const file = this.files[fileIndex];
        
        if (this.files.length <= 1) {
            this.showToast('❌ لا يمكن حذف جميع الملفات', 'error');
            return;
        }
        
        if (confirm(`هل أنت متأكد من حذف الملف "${file.name}"؟`)) {
            this.files.splice(fileIndex, 1);
            
            // If the deleted file was active, switch to another file
            if (file.type === this.currentFileType) {
                const nextFile = this.files[0];
                if (nextFile) {
                    this.switchToFile(nextFile.type);
                }
            }
            
            this.renderFileList();
            this.renderEditorTabs();
            this.showToast(`🗑️ تم حذف الملف ${file.name}`, 'success');
        }
    }
    
    // Close tab
    closeTab(type) {
        console.log(`جاري إغلاق علامة التبويب ${type}...`);
        
        const fileIndex = this.files.findIndex(f => f.type === type);
        if (fileIndex === -1) return;
        
        this.files[fileIndex].active = false;
        
        // If the closed tab was active, switch to another active file
        if (type === this.currentFileType) {
            const nextActiveFile = this.files.find(f => f.active);
            if (nextActiveFile) {
                this.switchToFile(nextActiveFile.type);
            } else {
                // If no active files, activate the first file
                if (this.files.length > 0) {
                    this.files[0].active = true;
                    this.switchToFile(this.files[0].type);
                }
            }
        }
        
        this.renderEditorTabs();
    }
    
    // Format code
    formatCode(type) {
        console.log(`جاري تنسيق كود ${type}...`);
        
        const editor = document.querySelector(`#${type}Editor textarea`);
        if (!editor) return;
        
        let content = editor.value;
        
        try {
            switch(type) {
                case 'html':
                    content = this.formatHTML(content);
                    break;
                case 'css':
                    content = this.formatCSS(content);
                    break;
                case 'js':
                    content = this.formatJS(content);
                    break;
            }
            
            editor.value = content;
            this.saveFileContent(type, content);
            this.showToast('✨ تم تنسيق الكود', 'success');
        } catch (e) {
            console.error('خطأ في التنسيق:', e);
            this.showToast('❌ حدث خطأ في تنسيق الكود', 'error');
        }
    }
    
    // Format HTML
    formatHTML(html) {
        // Simple HTML formatting
        let formatted = html
            .replace(/>\s+</g, '>\n<')
            .replace(/\s+/g, ' ')
            .replace(/\s\s+/g, ' ');
        
        // Add indentation
        let indentLevel = 0;
        const lines = formatted.split('\n');
        const formattedLines = [];
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Decrease indent for closing tags
            if (line.startsWith('</')) {
                indentLevel--;
            }
            
            // Add current line with indentation
            formattedLines.push('  '.repeat(Math.max(0, indentLevel)) + line);
            
            // Increase indent for opening tags (that don't self-close)
            if (line.startsWith('<') && !line.startsWith('</') && 
                !line.includes('/>') && !line.match(/<(br|hr|img|meta|link|input)/)) {
                indentLevel++;
            }
        }
        
        return formattedLines.join('\n');
    }
    
    // Format CSS
    formatCSS(css) {
        // Simple CSS formatting
        let formatted = css
            .replace(/\s*\{\s*/g, ' {\n  ')
            .replace(/\s*\}\s*/g, '\n}\n\n')
            .replace(/\s*;\s*/g, ';\n  ')
            .replace(/\s*:\s*/g, ': ')
            .replace(/,\s*/g, ', ');
        
        return formatted;
    }
    
    // Format JavaScript
    formatJS(js) {
        // For now, just return the original
        return js;
    }
    
    // Clear editor
    clearEditor(type) {
        console.log(`جاري مسح محرر ${type}...`);
        
        const editor = document.querySelector(`#${type}Editor textarea`);
        if (editor) {
            editor.value = '';
            this.saveFileContent(type, '');
            this.showToast(`تم مسح محتوى ${type.toUpperCase()}`, 'success');
        }
    }
    
    // Toggle sidebar
    toggleSidebar() {
        console.log('جاري تبديل القائمة الجانبية...');
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
            
            // Prevent body scroll when sidebar is open on mobile
            if (window.innerWidth <= 768) {
                if (sidebar.classList.contains('open')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        }
    }
    
    // Close sidebar
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    
    // Toggle theme
    toggleTheme() {
        console.log('جاري تبديل السمة...');
        
        if (this.theme === 'light') {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }
    
    // Set theme
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('codeEditorTheme', theme);
        
        // Update theme button icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.showToast(`تم التبديل إلى الوضع ${theme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'success');
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        console.log(`عرض إشعار: ${message}`);
        
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.error('حاوية الإشعارات غير موجودة');
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' :
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     type === 'warning' ? 'fas fa-exclamation-triangle' :
                     'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Update status
    updateStatus(text, type = 'success') {
        const statusText = document.getElementById('statusText');
        const statusIcon = document.getElementById('statusIcon');
        
        if (statusText) statusText.textContent = text;
        if (statusIcon) {
            statusIcon.className = 'fas fa-circle';
            statusIcon.style.color = 'var(--success-color)';
            
            if (type === 'warning') {
                statusIcon.style.color = 'var(--warning-color)';
                statusIcon.classList.add('saving');
            } else if (type === 'error') {
                statusIcon.style.color = 'var(--danger-color)';
                statusIcon.classList.add('offline');
            } else {
                statusIcon.classList.remove('saving', 'offline');
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحة محرر الأكواد جاهزة للتهيئة');
    
    // Fix for mobile viewport height
    function setViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set initial height
    setViewportHeight();
    
    // Update on resize
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // The app will be initialized by the loading screen script
    console.log('جاهز لتحميل التطبيق...');
});

// Handle beforeunload
window.addEventListener('beforeunload', function(e) {
    // Clean up blob URLs
    // Note: We can't clean up here because we don't have access to the preview URL
    // This would need to be handled differently in a real app
});

// Make CodeEditor available globally
window.CodeEditor = CodeEditor;