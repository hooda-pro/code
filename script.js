// Main application
class CodeEditorApp {
    constructor() {
        this.files = [
            { id: 1, name: 'index.html', type: 'html', content: this.getDefaultHTML(), active: true },
            { id: 2, name: 'style.css', type: 'css', content: this.getDefaultCSS(), active: true },
            { id: 3, name: 'script.js', type: 'js', content: this.getDefaultJS(), active: true }
        ];
        
        this.currentFileType = 'html';
        this.projectName = 'مشروع جديد';
        this.previewDevice = 'desktop';
        this.isPreviewFullscreen = false;
        this.isFullscreen = false;
        this.theme = localStorage.getItem('codeEditorTheme') || 'light';
        
        this.initializeApp();
    }
    
    // Initialize the application
    initializeApp() {
        this.setTheme(this.theme);
        this.setupEventListeners();
        this.loadSavedProject();
        this.renderFileList();
        this.renderEditorTabs();
        this.setupCodeEditors();
        this.updateStatus('جاهز', 'success');
    }
    
    // Get default HTML content
    getDefaultHTML() {
        return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مشروعي الأول</title>
    <link rel="stylesheet" href="style.css">
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
</html>`;
    }
    
    // Get default CSS content
    getDefaultCSS() {
        return `/* أنماط افتراضية للمشروع */
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
}`;
    }
    
    // Get default JavaScript content
    getDefaultJS() {
        return `// كود JavaScript افتراضي
document.addEventListener('DOMContentLoaded', function() {
    const demoBtn = document.getElementById('demoBtn');
    const demoText = document.getElementById('demoText');
    const featureCards = document.querySelectorAll('.feature-card');
    
    // تفاعل مع زر التجربة
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
    
    // تفاعل مع بطاقات الميزات
    featureCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
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
    
    // تأثير التمرير على العنوان
    const header = document.querySelector('header h1');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const hue = (scrollPosition % 360);
        header.style.background = \`linear-gradient(45deg, hsl(\${hue}, 100%, 50%), hsl(\${hue + 30}, 100%, 50%))\`;
        header.style.webkitBackgroundClip = 'text';
        header.style.backgroundClip = 'text';
    });
    
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
}`;
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        
        // Run code (opens preview modal)
        document.getElementById('runBtn').addEventListener('click', () => {
            this.runCode();
        });
        
        // Save all
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveAll();
        });
        
        // Download project
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadProject();
        });
        
        // Fullscreen toggle
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // New file button
        document.getElementById('newFileBtn').addEventListener('click', () => {
            this.showNewFileModal();
        });
        
        // Create file button
        document.getElementById('createFileBtn').addEventListener('click', () => {
            this.createNewFile();
        });
        
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });
        
        // Preview modal controls
        document.getElementById('closePreviewBtn').addEventListener('click', () => {
            this.closePreview();
        });
        
        document.getElementById('refreshPreviewBtn').addEventListener('click', () => {
            this.refreshPreview();
        });
        
        document.getElementById('fullscreenPreviewBtn').addEventListener('click', () => {
            this.togglePreviewFullscreen();
        });
        
        // Device switcher buttons
        document.querySelectorAll('.btn-device').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const device = e.target.closest('button').dataset.device;
                this.switchPreviewDevice(device);
            });
        });
        
        // Format code buttons
        document.querySelectorAll('[data-action="format"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.formatCode(lang);
            });
        });
        
        // Clear code buttons
        document.querySelectorAll('[data-action="clear"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if (confirm(`هل تريد مسح محتوى ${lang.toUpperCase()}؟`)) {
                    this.clearEditor(lang);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Save with Ctrl+S
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveAll();
            }
            
            // Run with Ctrl+R
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.runCode();
            }
            
            // New file with Ctrl+N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showNewFileModal();
            }
            
            // Close preview with Escape
            if (e.key === 'Escape' && document.getElementById('previewModal').classList.contains('active')) {
                e.preventDefault();
                this.closePreview();
            }
            
            // Format code with Ctrl+Shift+F
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.formatCode(this.currentFileType);
            }
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
        
        // Update preview size on resize
        window.addEventListener('resize', () => {
            this.updatePreviewSize();
        });
    }
    
    // Render file list
    renderFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        this.files.forEach(file => {
            const li = document.createElement('li');
            li.className = `file-item ${this.currentFileType === file.type ? 'active' : ''}`;
            li.innerHTML = `
                <div>
                    <i class="fab fa-${file.type === 'html' ? 'html5' : 
                                      file.type === 'css' ? 'css3-alt' : 
                                      file.type === 'js' ? 'js-square' : 
                                      'file-alt'} file-icon ${file.type}"></i>
                    ${file.name}
                </div>
                <div class="file-actions">
                    <button class="btn btn-icon btn-small" onclick="app.deleteFile(${file.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                    this.switchToFile(file.type);
                }
            });
            
            fileList.appendChild(li);
        });
        
        // Update current file in footer
        const currentFile = this.files.find(f => f.type === this.currentFileType);
        if (currentFile) {
            document.getElementById('currentFile').textContent = currentFile.name;
        }
    }
    
    // Render editor tabs
    renderEditorTabs() {
        const editorTabs = document.getElementById('editorTabs');
        editorTabs.innerHTML = '';
        
        this.files.forEach(file => {
            if (file.active) {
                const tab = document.createElement('div');
                tab.className = `tab ${this.currentFileType === file.type ? 'active' : ''}`;
                tab.innerHTML = `
                    <i class="fab fa-${file.type === 'html' ? 'html5' : 
                                      file.type === 'css' ? 'css3-alt' : 
                                      'js-square'} ${file.type}"></i>
                    ${file.name}
                    <span class="tab-close" onclick="app.closeTab('${file.type}')">
                        <i class="fas fa-times"></i>
                    </span>
                `;
                
                tab.addEventListener('click', () => {
                    this.switchToFile(file.type);
                });
                
                editorTabs.appendChild(tab);
            }
        });
    }
    
    // Setup code editors
    setupCodeEditors() {
        // Initialize editors with content
        this.files.forEach(file => {
            const editor = document.getElementById(`${file.type}Editor`);
            if (editor) {
                const textarea = document.createElement('textarea');
                textarea.value = file.content;
                textarea.spellcheck = false;
                
                textarea.addEventListener('input', (e) => {
                    this.saveFileContent(file.type, e.target.value);
                });
                
                // Replace the editor div with textarea
                editor.innerHTML = '';
                editor.appendChild(textarea);
            }
        });
        
        // Show the current editor
        this.showEditor(this.currentFileType);
    }
    
    // Show specific editor
    showEditor(type) {
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
    }
    
    // Switch to a file
    switchToFile(type) {
        this.currentFileType = type;
        this.showEditor(type);
    }
    
    // Save file content
    saveFileContent(type, content) {
        const fileIndex = this.files.findIndex(f => f.type === type);
        if (fileIndex > -1) {
            this.files[fileIndex].content = content;
        }
    }
    
    // Run code and open preview modal
    runCode() {
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
        
        // Update preview iframe
        const previewFrame = document.getElementById('previewFrame');
        const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        
        previewDoc.open();
        previewDoc.write(htmlContent);
        previewDoc.close();
        
        // Open preview modal
        this.openPreview();
        
        // Update preview stats
        this.updatePreviewStats();
        
        this.showToast('✅ تم تشغيل الكود بنجاح', 'success');
        this.updateStatus('جاهز', 'success');
        
        // Update run button temporarily
        const runBtn = document.getElementById('runBtn');
        const originalHTML = runBtn.innerHTML;
        runBtn.innerHTML = '<i class="fas fa-check"></i>';
        runBtn.disabled = true;
        
        setTimeout(() => {
            runBtn.innerHTML = originalHTML;
            runBtn.disabled = false;
        }, 1500);
    }
    
    // Open preview modal
    openPreview() {
        const previewModal = document.getElementById('previewModal');
        previewModal.classList.add('active');
        
        // Update device display
        this.updateDeviceDisplay();
        
        // Update preview size
        this.updatePreviewSize();
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Close preview modal
    closePreview() {
        const previewModal = document.getElementById('previewModal');
        previewModal.classList.remove('active');
        
        // Enable body scroll
        document.body.style.overflow = '';
        
        // Exit fullscreen if active
        if (this.isPreviewFullscreen) {
            this.togglePreviewFullscreen();
        }
        
        this.showToast('تم إغلاق المعاينة', 'info');
    }
    
    // Refresh preview
    refreshPreview() {
        this.runCode();
        this.showToast('🔄 تم تحديث المعاينة', 'success');
    }
    
    // Switch preview device
    switchPreviewDevice(device) {
        this.previewDevice = device;
        
        // Update active device button
        document.querySelectorAll('.btn-device').forEach(btn => {
            if (btn.dataset.device === device) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update device display
        this.updateDeviceDisplay();
        
        // Update preview container class
        const container = document.querySelector('.preview-frame-container');
        container.className = 'preview-frame-container';
        
        if (this.isPreviewFullscreen) {
            container.classList.add('fullscreen');
        } else {
            container.classList.add(device);
        }
        
        // Update preview size
        this.updatePreviewSize();
    }
    
    // Update device display
    updateDeviceDisplay() {
        const deviceNames = {
            'desktop': 'جهاز كمبيوتر',
            'tablet': 'جهاز لوحي',
            'mobile': 'جوال'
        };
        
        document.getElementById('previewDevice').textContent = deviceNames[this.previewDevice];
    }
    
    // Update preview size display
    updatePreviewSize() {
        const container = document.querySelector('.preview-frame-container');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        document.getElementById('previewSize').textContent = `${width} × ${height}`;
    }
    
    // Update preview stats
    updatePreviewStats() {
        const htmlFile = this.files.find(f => f.type === 'html');
        const cssFile = this.files.find(f => f.type === 'css');
        const jsFile = this.files.find(f => f.type === 'js');
        
        const htmlSize = htmlFile ? Math.round(htmlFile.content.length / 1024 * 100) / 100 : 0;
        const cssSize = cssFile ? Math.round(cssFile.content.length / 1024 * 100) / 100 : 0;
        const jsSize = jsFile ? Math.round(jsFile.content.length / 1024 * 100) / 100 : 0;
        
        document.getElementById('htmlSize').textContent = htmlSize;
        document.getElementById('cssSize').textContent = cssSize;
        document.getElementById('jsSize').textContent = jsSize;
    }
    
    // Toggle preview fullscreen
    togglePreviewFullscreen() {
        const container = document.querySelector('.preview-frame-container');
        const fullscreenBtn = document.getElementById('fullscreenPreviewBtn');
        
        this.isPreviewFullscreen = !this.isPreviewFullscreen;
        
        if (this.isPreviewFullscreen) {
            container.classList.add('fullscreen');
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            fullscreenBtn.title = 'تصغير';
        } else {
            container.classList.remove('fullscreen');
            container.classList.add(this.previewDevice);
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullscreenBtn.title = 'ملء الشاشة';
        }
        
        // Update preview size
        setTimeout(() => {
            this.updatePreviewSize();
        }, 100);
    }
    
    // Save all files
    saveAll() {
        this.updateStatus('جاري الحفظ...', 'warning');
        
        // Save to localStorage
        const projectData = {
            files: this.files,
            projectName: this.projectName,
            theme: this.theme
        };
        
        localStorage.setItem('codeEditorProject', JSON.stringify(projectData));
        
        this.showToast('💾 تم حفظ المشروع بنجاح', 'success');
        this.updateStatus('جاهز', 'success');
        
        // Update save button temporarily
        const saveBtn = document.getElementById('saveBtn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = false;
        }, 1500);
    }
    
    // Load saved project
    loadSavedProject() {
        const saved = localStorage.getItem('codeEditorProject');
        if (saved) {
            try {
                const projectData = JSON.parse(saved);
                this.files = projectData.files || this.files;
                this.projectName = projectData.projectName || this.projectName;
                this.theme = projectData.theme || this.theme;
                
                document.getElementById('projectName').textContent = this.projectName;
                this.setTheme(this.theme);
                
                this.showToast('📂 تم تحميل المشروع المحفوظ', 'success');
            } catch (e) {
                console.error('خطأ في تحميل المشروع:', e);
                this.showToast('❌ خطأ في تحميل المشروع المحفوظ', 'error');
            }
        }
    }
    
    // Download project
    downloadProject() {
        this.updateStatus('جاري تحضير الملف...', 'warning');
        
        // Create a ZIP file with all files
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
        
        this.showToast('📦 تم تحميل المشروع', 'success');
        this.updateStatus('جاهز', 'success');
    }
    
    // Show new file modal
    showNewFileModal() {
        document.getElementById('newFileModal').classList.add('active');
        document.getElementById('fileName').focus();
    }
    
    // Close modal
    closeModal() {
        document.getElementById('newFileModal').classList.remove('active');
        
        // Reset form
        document.getElementById('fileName').value = '';
        document.getElementById('fileContent').value = '';
    }
    
    // Create new file
    createNewFile() {
        const name = document.getElementById('fileName').value.trim();
        const type = document.getElementById('fileType').value;
        const content = document.getElementById('fileContent').value;
        
        if (!name) {
            this.showToast('❌ يرجى إدخال اسم الملف', 'error');
            return;
        }
        
        // Check if file with same type already exists
        const existingFile = this.files.find(f => f.type === type);
        if (existingFile) {
            if (!confirm(`يوجد ملف ${type} بالفعل. هل تريد استبداله؟`)) {
                return;
            }
            
            // Remove existing file
            this.files = this.files.filter(f => f.type !== type);
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
        const fileIndex = this.files.findIndex(f => f.type === type);
        if (fileIndex === -1) return;
        
        this.files[fileIndex].active = false;
        
        // If the closed tab was active, switch to another active file
        if (type === this.currentFileType) {
            const nextActiveFile = this.files.find(f => f.active);
            if (nextActiveFile) {
                this.switchToFile(nextActiveFile.type);
            } else {
                // If no active files, show message
                this.showToast('⚠️ لا توجد ملفات مفتوحة', 'warning');
            }
        }
        
        this.renderEditorTabs();
    }
    
    // Format code
    formatCode(type) {
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
        // Simple HTML formatting (for demonstration)
        let formatted = html
            .replace(/></g, '>\n<')
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
        // In a real app, you would use a proper JS formatter
        return js;
    }
    
    // Clear editor
    clearEditor(type) {
        const editor = document.querySelector(`#${type}Editor textarea`);
        if (editor) {
            editor.value = '';
            this.saveFileContent(type, '');
            this.showToast(`تم مسح محتوى ${type.toUpperCase()}`, 'success');
        }
    }
    
    // Toggle fullscreen
    toggleFullscreen() {
        const app = document.getElementById('app');
        
        if (!this.isFullscreen) {
            if (app.requestFullscreen) {
                app.requestFullscreen();
            } else if (app.webkitRequestFullscreen) {
                app.webkitRequestFullscreen();
            } else if (app.mozRequestFullScreen) {
                app.mozRequestFullScreen();
            } else if (app.msRequestFullscreen) {
                app.msRequestFullscreen();
            }
            
            document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i>';
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
            this.isFullscreen = false;
        }
    }
    
    // Toggle theme
    toggleTheme() {
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
        const themeIcon = document.getElementById('themeToggle').querySelector('i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showToast(`تم التبديل إلى الوضع ${theme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'success');
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' :
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     type === 'warning' ? 'fas fa-exclamation-triangle' :
                     'fas fa-info-circle';
        
        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <span>${message}</span>
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
        
        statusText.textContent = text;
        statusIcon.className = 'fas fa-circle';
        
        if (type === 'success') {
            statusIcon.style.color = 'var(--success-color)';
        } else if (type === 'warning') {
            statusIcon.style.color = 'var(--warning-color)';
            statusIcon.classList.add('saving');
        } else if (type === 'error') {
            statusIcon.style.color = 'var(--danger-color)';
            statusIcon.classList.add('offline');
        } else {
            statusIcon.style.color = 'var(--info-color)';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CodeEditorApp();
});

// Handle fullscreen change
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        app.isFullscreen = false;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', (e) => {
    // You could add autosave functionality here
    // For now, just show a warning
    // e.preventDefault();
    // e.returnValue = 'هل تريد حفظ التغييرات قبل المغادرة؟';
});