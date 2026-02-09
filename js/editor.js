// JavaScript للمحرر
document.addEventListener('DOMContentLoaded', function() {
    console.log('محرر الأكواد جاهز');
    
    // المتغيرات
    let currentSite = null;
    let currentFile = null;
    let files = [];
    let isChanged = false;
    
    // دعم اللغات
    const languageSupport = {
        // امتدادات الملفات وأنواعها
        extensions: {
            '.html': 'html',
            '.htm': 'html',
            '.css': 'css',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.php': 'php',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.rb': 'ruby',
            '.swift': 'swift',
            '.go': 'go',
            '.rs': 'rust',
            '.json': 'json',
            '.xml': 'xml',
            '.sql': 'sql',
            '.md': 'markdown',
            '.txt': 'text'
        },
        
        // أنماط الأيقونات
        icons: {
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'javascript': 'fab fa-js-square',
            'typescript': 'fas fa-code',
            'python': 'fab fa-python',
            'php': 'fab fa-php',
            'java': 'fab fa-java',
            'cpp': 'fas fa-file-code',
            'c': 'fas fa-file-code',
            'csharp': 'fas fa-file-code',
            'ruby': 'far fa-gem',
            'swift': 'fas fa-mobile-alt',
            'go': 'fas fa-code',
            'rust': 'fas fa-cog',
            'json': 'fas fa-code',
            'xml': 'fas fa-code',
            'sql': 'fas fa-database',
            'markdown': 'fas fa-file-alt',
            'text': 'fas fa-file-alt',
            'unknown': 'fas fa-file'
        },
        
        // أمثلة كود لكل لغة
        templates: {
            'html': `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مشروع جديد</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>مرحباً بك في مشروعك الجديد!</h1>
    <p>ابدأ بكتابة كود HTML هنا.</p>
    
    <script src="script.js"></script>
</body>
</html>`,
            
            'css': `/* أنماط CSS لمشروعك */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', sans-serif;
    background: #f8fafc;
    color: #1e293b;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #4a6ee0;
    margin-bottom: 20px;
}

p {
    color: #64748b;
    margin-bottom: 15px;
}`,
            
            'javascript': `// كود JavaScript لمشروعك
console.log('مرحباً بك في مشروعك الجديد!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    // أضف كود JavaScript الخاص بك هنا
    function greetUser() {
        alert('مرحباً! مشروعك يعمل بنجاح.');
    }
    
    // استدعاء الدالة بعد 2 ثانية
    setTimeout(greetUser, 2000);
});`,
            
            'python': `# كود Python لمشروعك
print("مرحباً بك في مشروعك الجديد!")

def greet_user():
    print("مشروعك يعمل بنجاح!")

if __name__ == "__main__":
    greet_user()`,
            
            'php': `<?php
// كود PHP لمشروعك
echo "مرحباً بك في مشروعك الجديد!";

function greetUser() {
    echo "مشروعك يعمل بنجاح!";
}

greetUser();
?>`,
            
            'default': `// ابدأ بكتابة كودك هنا
// هذا ملف جديد في مشروعك`
        }
    };
    
    // إخفاء شاشة التحميل
    setTimeout(function() {
        document.getElementById('loading').classList.add('hidden');
        loadCurrentSite();
        initEditor();
        setupEventListeners();
        updateUI();
    }, 500);
    
    // تحميل مكتبة JSZip
    loadJSZip();
    
    // تحميل الموقع الحالي
    function loadCurrentSite() {
        try {
            const savedSite = localStorage.getItem('currentSite');
            if (savedSite) {
                currentSite = JSON.parse(savedSite);
                document.getElementById('projectName').textContent = currentSite.name;
                
                // تحويل ملفات الموقع إلى مصفوفة
                files = [];
                if (currentSite.files) {
                    Object.keys(currentSite.files).forEach(fileName => {
                        const fileType = currentSite.fileTypes && currentSite.fileTypes[fileName] 
                            ? currentSite.fileTypes[fileName] 
                            : detectLanguage(fileName);
                        
                        files.push({
                            name: fileName,
                            content: currentSite.files[fileName],
                            type: fileType,
                            active: false
                        });
                    });
                }
                
                // إذا لم تكن هناك ملفات، إضافة ملفات افتراضية
                if (files.length === 0) {
                    files = [
                        { name: 'index.html', content: languageSupport.templates.html, type: 'html', active: true },
                        { name: 'style.css', content: languageSupport.templates.css, type: 'css', active: false },
                        { name: 'script.js', content: languageSupport.templates.javascript, type: 'javascript', active: false }
                    ];
                }
                
                // جعل الملف الأول نشطاً إذا لم يكن هناك ملف نشط
                if (!files.some(f => f.active) && files.length > 0) {
                    files[0].active = true;
                    currentFile = files[0];
                } else {
                    currentFile = files.find(f => f.active) || files[0];
                }
                
                console.log('تم تحميل الموقع:', currentSite.name);
                console.log('الملفات:', files.length);
            } else {
                // إذا لم يكن هناك موقع، العودة للرئيسية
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('خطأ في تحميل الموقع:', error);
            window.location.href = 'index.html';
        }
    }
    
    // كشف لغة الملف من امتداده
    function detectLanguage(fileName) {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return languageSupport.extensions[extension] || 'unknown';
    }
    
    // الحصول على أيقونة الملف حسب النوع
    function getFileIcon(fileType) {
        return languageSupport.icons[fileType] || languageSupport.icons.unknown;
    }
    
    // الحصول على قالب للغة
    function getLanguageTemplate(language) {
        return languageSupport.templates[language] || languageSupport.templates.default;
    }
    
    // تهيئة المحرر
    function initEditor() {
        renderFilesList();
        renderEditorTabs();
        renderEditors();
    }
    
    // تهيئة الأحداث
    function setupEventListeners() {
        // زر العودة
        document.getElementById('backBtn').addEventListener('click', showExitModal);
        
        // زر العودة للرئيسية
        document.getElementById('backToHome').addEventListener('click', showExitModal);
        
        // زر المعاينة
        document.getElementById('previewBtn').addEventListener('click', previewSite);
        
        // زر الحفظ
        document.getElementById('saveBtn').addEventListener('click', saveSite);
        
        // زر التحميل
        document.getElementById('downloadBtn').addEventListener('click', downloadCurrentSite);
        
        // زر إضافة ملف جديد
        document.getElementById('addFileBtn').addEventListener('click', showAddFileModal);
        
        // زر إدارة الملفات
        document.getElementById('fileManagerBtn').addEventListener('click', showFileManagerModal);
        
        // أزرار الأدوات
        document.getElementById('formatBtn').addEventListener('click', formatCurrentCode);
        document.getElementById('clearBtn').addEventListener('click', clearCurrentCode);
        document.getElementById('searchBtn').addEventListener('click', showSearchModal);
        
        // أحداث المودالات
        document.getElementById('submitAddFile').addEventListener('click', addNewFile);
        document.getElementById('addNewFileFromManager').addEventListener('click', showAddFileModal);
        
        // أحداث البحث والاستبدال
        document.getElementById('searchBtnModal').addEventListener('click', searchInCode);
        document.getElementById('replaceBtnModal').addEventListener('click', replaceInCode);
        document.getElementById('replaceAllBtnModal').addEventListener('click', replaceAllInCode);
        
        // أحداث الخروج
        document.getElementById('exitWithoutSave').addEventListener('click', exitToHome);
        document.getElementById('saveAndExit').addEventListener('click', saveAndExit);
        
        // إغلاق جميع المودالات
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                closeAllModals();
            });
        });
        
        // إغلاق المودالات عند النقر خارجها
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', function(e) {
            // حفظ مع Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveSite();
            }
            
            // معاينة مع Ctrl+P
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                previewSite();
            }
            
            // إضافة ملف جديد مع Ctrl+N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                showAddFileModal();
            }
            
            // البحث مع Ctrl+F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                showSearchModal();
            }
            
            // تبديل التبويبات مع Ctrl+Tab
            if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
                e.preventDefault();
                switchToNextTab();
            }
        });
        
        // تتبع التغييرات
        document.addEventListener('input', function() {
            isChanged = true;
        });
        
        // التحذير قبل مغادرة الصفحة إذا كانت هناك تغييرات غير محفوظة
        window.addEventListener('beforeunload', function(e) {
            if (isChanged) {
                e.preventDefault();
                e.returnValue = 'هناك تغييرات غير محفوظة. هل تريد المغادرة بدون حفظ؟';
            }
        });
    }
    
    // تحديث واجهة المستخدم
    function updateUI() {
        if (currentFile) {
            document.title = `${currentFile.name} - ${currentSite.name} - محرر الأكواد`;
        }
    }
    
    // عرض قائمة الملفات
    function renderFilesList() {
        const filesList = document.getElementById('filesList');
        filesList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = `file-item ${file.active ? 'active' : ''}`;
            fileItem.dataset.index = index;
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="${getFileIcon(file.type)} file-icon"></i>
                    <span class="file-name">${file.name}</span>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn delete-file" title="حذف الملف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            filesList.appendChild(fileItem);
        });
        
        // إضافة أحداث للملفات
        document.querySelectorAll('.file-item').forEach((item, index) => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.file-actions')) {
                    switchToFile(index);
                }
            });
        });
        
        // إضافة أحداث لأزرار الحذف
        document.querySelectorAll('.delete-file').forEach((btn, index) => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteFile(index);
            });
        });
    }
    
    // عرض تبويبات المحرر
    function renderEditorTabs() {
        const editorTabs = document.getElementById('editorTabs');
        editorTabs.innerHTML = '';
        
        files.forEach((file, index) => {
            if (file.active) {
                const tab = document.createElement('div');
                tab.className = `tab ${file === currentFile ? 'active' : ''}`;
                tab.dataset.index = index;
                
                tab.innerHTML = `
                    <i class="${getFileIcon(file.type)}"></i>
                    <span class="tab-name">${file.name}</span>
                    <span class="tab-close">×</span>
                `;
                
                editorTabs.appendChild(tab);
            }
        });
        
        // إضافة أحداث للتبويبات
        document.querySelectorAll('.tab').forEach((tab, index) => {
            tab.addEventListener('click', function(e) {
                if (!e.target.classList.contains('tab-close')) {
                    const fileIndex = parseInt(this.dataset.index);
                    if (files[fileIndex] !== currentFile) {
                        switchToFile(fileIndex);
                    }
                }
            });
            
            // حدث إغلاق التبويب
            const closeBtn = tab.querySelector('.tab-close');
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const fileIndex = parseInt(tab.dataset.index);
                closeTab(fileIndex);
            });
        });
    }
    
    // عرض محررات النصوص
    function renderEditors() {
        const editorsArea = document.getElementById('editorsArea');
        editorsArea.innerHTML = '';
        
        files.forEach((file, index) => {
            if (file.active) {
                const editorSection = document.createElement('div');
                editorSection.className = `editor-section ${file === currentFile ? 'active' : ''}`;
                editorSection.dataset.index = index;
                editorSection.dataset.lang = file.type;
                
                editorSection.innerHTML = `
                    <div class="editor-header">
                        <h3>
                            <i class="${getFileIcon(file.type)}"></i>
                            ${file.name}
                        </h3>
                        <div class="language-selector">
                            <select class="language-select" data-index="${index}">
                                <option value="html" ${file.type === 'html' ? 'selected' : ''}>HTML</option>
                                <option value="css" ${file.type === 'css' ? 'selected' : ''}>CSS</option>
                                <option value="javascript" ${file.type === 'javascript' ? 'selected' : ''}>JavaScript</option>
                                <option value="python" ${file.type === 'python' ? 'selected' : ''}>Python</option>
                                <option value="php" ${file.type === 'php' ? 'selected' : ''}>PHP</option>
                                <option value="java" ${file.type === 'java' ? 'selected' : ''}>Java</option>
                                <option value="cpp" ${file.type === 'cpp' ? 'selected' : ''}>C++</option>
                                <option value="csharp" ${file.type === 'csharp' ? 'selected' : ''}>C#</option>
                                <option value="ruby" ${file.type === 'ruby' ? 'selected' : ''}>Ruby</option>
                                <option value="swift" ${file.type === 'swift' ? 'selected' : ''}>Swift</option>
                                <option value="go" ${file.type === 'go' ? 'selected' : ''}>Go</option>
                                <option value="rust" ${file.type === 'rust' ? 'selected' : ''}>Rust</option>
                                <option value="typescript" ${file.type === 'typescript' ? 'selected' : ''}>TypeScript</option>
                                <option value="json" ${file.type === 'json' ? 'selected' : ''}>JSON</option>
                                <option value="xml" ${file.type === 'xml' ? 'selected' : ''}>XML</option>
                                <option value="sql" ${file.type === 'sql' ? 'selected' : ''}>SQL</option>
                                <option value="markdown" ${file.type === 'markdown' ? 'selected' : ''}>Markdown</option>
                                <option value="text" ${file.type === 'text' ? 'selected' : ''}>نص عادي</option>
                                <option value="other" ${!languageSupport.templates[file.type] ? 'selected' : ''}>أخرى</option>
                            </select>
                        </div>
                    </div>
                    <div class="code-editor">
                        <textarea class="code-textarea" data-index="${index}" 
                                  placeholder="اكتب كود ${file.type} هنا...">${file.content}</textarea>
                    </div>
                `;
                
                editorsArea.appendChild(editorSection);
            }
        });
        
        // إضافة أحداث لمحررات النصوص
        document.querySelectorAll('.code-textarea').forEach(textarea => {
            const index = parseInt(textarea.dataset.index);
            
            textarea.addEventListener('input', function() {
                files[index].content = this.value;
                isChanged = true;
            });
            
            // دعم Tab للكتابة
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    
                    // إضافة مسافتين
                    this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
                    
                    // تحريك المؤشر
                    this.selectionStart = this.selectionEnd = start + 2;
                    
                    // تحديث المحتوى
                    files[index].content = this.value;
                    isChanged = true;
                }
            });
        });
        
        // إضافة أحداث لمحددات اللغة
        document.querySelectorAll('.language-select').forEach(select => {
            const index = parseInt(select.dataset.index);
            
            select.addEventListener('change', function() {
                const newLanguage = this.value;
                files[index].type = newLanguage;
                
                // إذا كان المحتوى فارغاً، إضافة قالب للغة
                if (!files[index].content.trim()) {
                    files[index].content = getLanguageTemplate(newLanguage);
                    
                    // تحديث textarea
                    const textarea = document.querySelector(`.code-textarea[data-index="${index}"]`);
                    if (textarea) {
                        textarea.value = files[index].content;
                    }
                }
                
                renderFilesList();
                renderEditorTabs();
                renderEditors();
                isChanged = true;
            });
        });
    }
    
    // التبديل إلى ملف معين
    function switchToFile(index) {
        if (files[index]) {
            // تحديث الملف النشط الحالي
            files.forEach(file => file.active = false);
            files[index].active = true;
            currentFile = files[index];
            
            renderFilesList();
            renderEditorTabs();
            renderEditors();
            updateUI();
        }
    }
    
    // التبديل إلى التبويب التالي
    function switchToNextTab() {
        const activeFiles = files.filter(f => f.active);
        if (activeFiles.length > 1) {
            const currentIndex = activeFiles.indexOf(currentFile);
            const nextIndex = (currentIndex + 1) % activeFiles.length;
            const nextFile = activeFiles[nextIndex];
            const fileIndex = files.indexOf(nextFile);
            
            if (fileIndex !== -1) {
                switchToFile(fileIndex);
            }
        }
    }
    
    // إغلاق تبويب
    function closeTab(index) {
        if (files[index] && files[index].active) {
            // إذا كان هذا هو التبويب النشط الوحيد، لا يمكن إغلاقه
            const activeFiles = files.filter(f => f.active);
            if (activeFiles.length <= 1) {
                showToast('لا يمكن إغلاق آخر تبويب نشط', 'warning');
                return;
            }
            
            // إلغاء تفعيل الملف
            files[index].active = false;
            
            // إذا كان الملف المغلق هو الحالي، التبديل إلى ملف نشط آخر
            if (files[index] === currentFile) {
                const nextActiveFile = files.find(f => f.active && f !== currentFile);
                if (nextActiveFile) {
                    const nextIndex = files.indexOf(nextActiveFile);
                    switchToFile(nextIndex);
                }
            }
            
            renderFilesList();
            renderEditorTabs();
            renderEditors();
        }
    }
    
    // حذف ملف
    function deleteFile(index) {
        if (files[index]) {
            const fileName = files[index].name;
            
            if (confirm(`هل تريد حذف الملف "${fileName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
                // إذا كان الملف نشطاً، إغلاقه أولاً
                if (files[index].active) {
                    closeTab(index);
                }
                
                // حذف الملف
                files.splice(index, 1);
                
                // إذا لم يكن هناك ملفات، إضافة ملف افتراضي
                if (files.length === 0) {
                    files.push({
                        name: 'index.html',
                        content: languageSupport.templates.html,
                        type: 'html',
                        active: true
                    });
                    currentFile = files[0];
                }
                
                renderFilesList();
                renderEditorTabs();
                renderEditors();
                isChanged = true;
                
                showToast(`تم حذف الملف "${fileName}"`, 'success');
            }
        }
    }
    
    // عرض مودال إضافة ملف جديد
    function showAddFileModal() {
        closeAllModals();
        document.getElementById('addFileModal').classList.add('active');
        
        // التركيز على حقل اسم الملف
        setTimeout(() => {
            document.getElementById('newFileName').focus();
        }, 100);
    }
    
    // إضافة ملف جديد
    function addNewFile() {
        const fileNameInput = document.getElementById('newFileName');
        const fileLanguageSelect = document.getElementById('fileLanguage');
        const fileContentTextarea = document.getElementById('fileContent');
        
        const fileName = fileNameInput.value.trim();
        const fileLanguage = fileLanguageSelect.value;
        const fileContent = fileContentTextarea.value;
        
        if (!fileName) {
            showToast('يرجى إدخال اسم الملف', 'error');
            fileNameInput.focus();
            return;
        }
        
        // التحقق من صحة اسم الملف
        if (!fileName.includes('.')) {
            showToast('يرجى إضافة امتداد للملف (مثل .html, .js, .css)', 'error');
            fileNameInput.focus();
            return;
        }
        
        // التحقق من عدم تكرار اسم الملف
        if (files.some(f => f.name === fileName)) {
            showToast(`يوجد ملف باسم "${fileName}" بالفعل`, 'error');
            fileNameInput.focus();
            return;
        }
        
        // تحديد نوع اللغة من امتداد الملف
        let detectedLanguage = detectLanguage(fileName);
        if (detectedLanguage === 'unknown') {
            detectedLanguage = fileLanguage;
        }
        
        // إنشاء الملف الجديد
        const newFile = {
            name: fileName,
            content: fileContent || getLanguageTemplate(detectedLanguage),
            type: detectedLanguage,
            active: true
        };
        
        // إضافة الملف
        files.push(newFile);
        
        // التبديل إلى الملف الجديد
        switchToFile(files.length - 1);
        
        // إغلاق المودال وإعادة تعيين النموذج
        closeAllModals();
        fileNameInput.value = '';
        fileContentTextarea.value = '';
        
        showToast(`تم إضافة الملف "${fileName}"`, 'success');
        isChanged = true;
    }
    
    // عرض مودال إدارة الملفات
    function showFileManagerModal() {
        closeAllModals();
        
        const fileManagerList = document.getElementById('fileManagerList');
        fileManagerList.innerHTML = '';
        
        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-manager-item';
            
            item.innerHTML = `
                <div class="file-manager-info">
                    <i class="${getFileIcon(file.type)}"></i>
                    <span class="file-manager-name">${file.name}</span>
                    <span class="file-manager-type">${file.type}</span>
                </div>
                <div class="file-manager-actions">
                    <button class="btn btn-small btn-primary open-file-manager" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger delete-file-manager" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            fileManagerList.appendChild(item);
        });
        
        // إضافة أحداث للأزرار
        document.querySelectorAll('.open-file-manager').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                closeAllModals();
                switchToFile(index);
            });
        });
        
        document.querySelectorAll('.delete-file-manager').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteFile(index);
                showFileManagerModal(); // تحديث القائمة
            });
        });
        
        document.getElementById('fileManagerModal').classList.add('active');
    }
    
    // عرض مودال البحث والاستبدال
    function showSearchModal() {
        closeAllModals();
        document.getElementById('searchModal').classList.add('active');
        
        // التركيز على حقل البحث
        setTimeout(() => {
            document.getElementById('searchText').focus();
        }, 100);
    }
    
    // البحث في الكود
    function searchInCode() {
        const searchText = document.getElementById('searchText').value;
        const matchCase = document.getElementById('matchCase').checked;
        
        if (!searchText.trim()) {
            showToast('يرجى إدخال نص للبحث عنه', 'error');
            return;
        }
        
        if (!currentFile) {
            showToast('لا يوجد ملف نشط للبحث فيه', 'error');
            return;
        }
        
        const content = currentFile.content;
        const searchRegex = new RegExp(matchCase ? searchText : searchText, matchCase ? 'g' : 'gi');
        const matches = content.match(searchRegex);
        
        if (matches) {
            showToast(`تم العثور على ${matches.length} نتيجة`, 'success');
            
            // تمييز النتائج في المحرر
            highlightSearchResults(searchText, matchCase);
        } else {
            showToast('لم يتم العثور على نتائج', 'warning');
        }
    }
    
    // تمييز نتائج البحث
    function highlightSearchResults(searchText, matchCase) {
        const textarea = document.querySelector('.code-textarea[data-index="' + files.indexOf(currentFile) + '"]');
        if (!textarea) return;
        
        const content = textarea.value;
        const searchRegex = new RegExp(matchCase ? searchText : searchText, matchCase ? 'g' : 'gi');
        
        // هذا مثال بسيط، في تطبيق حقيقي نستخدم محرر متقدم مثل CodeMirror أو Monaco
        textarea.focus();
        
        // البحث عن أول ظهور
        const firstIndex = content.search(searchRegex);
        if (firstIndex !== -1) {
            textarea.selectionStart = firstIndex;
            textarea.selectionEnd = firstIndex + searchText.length;
        }
    }
    
    // الاستبدال في الكود
    function replaceInCode() {
        const searchText = document.getElementById('searchText').value;
        const replaceText = document.getElementById('replaceText').value;
        const matchCase = document.getElementById('matchCase').checked;
        
        if (!searchText.trim()) {
            showToast('يرجى إدخال نص للبحث عنه', 'error');
            return;
        }
        
        if (!currentFile) {
            showToast('لا يوجد ملف نشط', 'error');
            return;
        }
        
        const content = currentFile.content;
        const searchRegex = new RegExp(matchCase ? searchText : searchText, matchCase ? 'g' : 'gi');
        
        if (content.match(searchRegex)) {
            currentFile.content = content.replace(searchRegex, replaceText);
            
            // تحديث textarea
            const textarea = document.querySelector('.code-textarea[data-index="' + files.indexOf(currentFile) + '"]');
            if (textarea) {
                textarea.value = currentFile.content;
            }
            
            isChanged = true;
            showToast('تم الاستبدال بنجاح', 'success');
        } else {
            showToast('لم يتم العثور على النص للاستبدال', 'warning');
        }
    }
    
    // الاستبدال الكل في الكود
    function replaceAllInCode() {
        const searchText = document.getElementById('searchText').value;
        const replaceText = document.getElementById('replaceText').value;
        const matchCase = document.getElementById('matchCase').checked;
        
        if (!searchText.trim()) {
            showToast('يرجى إدخال نص للبحث عنه', 'error');
            return;
        }
        
        if (!currentFile) {
            showToast('لا يوجد ملف نشط', 'error');
            return;
        }
        
        const content = currentFile.content;
        const searchRegex = new RegExp(matchCase ? searchText : searchText, matchCase ? 'g' : 'gi');
        const matches = content.match(searchRegex);
        
        if (matches) {
            currentFile.content = content.replace(searchRegex, replaceText);
            
            // تحديث textarea
            const textarea = document.querySelector('.code-textarea[data-index="' + files.indexOf(currentFile) + '"]');
            if (textarea) {
                textarea.value = currentFile.content;
            }
            
            isChanged = true;
            showToast(`تم استبدال ${matches.length} نتيجة`, 'success');
        } else {
            showToast('لم يتم العثور على النص للاستبدال', 'warning');
        }
    }
    
    // تنسيق الكود الحالي
    function formatCurrentCode() {
        if (!currentFile) {
            showToast('لا يوجد ملف نشط للتنسيق', 'error');
            return;
        }
        
        // هذا مثال بسيط، في تطبيق حقيقي نستخدم مكتبة مثل Prettier
        let formattedContent = currentFile.content;
        
        switch(currentFile.type) {
            case 'html':
                formattedContent = formatHTML(currentFile.content);
                break;
            case 'css':
                formattedContent = formatCSS(currentFile.content);
                break;
            case 'javascript':
            case 'typescript':
                formattedContent = formatJS(currentFile.content);
                break;
            default:
                showToast('لا يوجد تنسيق خاص لهذه اللغة', 'info');
                return;
        }
        
        currentFile.content = formattedContent;
        
        // تحديث textarea
        const textarea = document.querySelector('.code-textarea[data-index="' + files.indexOf(currentFile) + '"]');
        if (textarea) {
            textarea.value = formattedContent;
        }
        
        isChanged = true;
        showToast('تم تنسيق الكود', 'success');
    }
    
    // تنسيق HTML
    function formatHTML(html) {
        // تبسيط تنسيق HTML
        let formatted = html
            .replace(/>\s+</g, '>\n<')
            .replace(/\s+/g, ' ')
            .replace(/\s\s+/g, ' ');
        
        // إضافة مسافات بادئة
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
            
            // إضافة السطر مع المسافة البادئة
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
        // في تطبيق حقيقي نستخدم مكتبة
        return js;
    }
    
    // مسح الكود الحالي
    function clearCurrentCode() {
        if (!currentFile) {
            showToast('لا يوجد ملف نشط للمسح', 'error');
            return;
        }
        
        if (confirm('هل تريد مسح محتوى الملف الحالي؟')) {
            currentFile.content = '';
            
            // تحديث textarea
            const textarea = document.querySelector('.code-textarea[data-index="' + files.indexOf(currentFile) + '"]');
            if (textarea) {
                textarea.value = '';
            }
            
            isChanged = true;
            showToast('تم مسح محتوى الملف', 'success');
        }
    }
    
    // معاينة الموقع في صفحة جديدة
    function previewSite() {
        if (!currentSite) return;
        
        // تحديث ملفات الموقع
        updateSiteFiles();
        
        // حفظ الموقع مؤقتاً للمعاينة
        const previewSite = {
            ...currentSite,
            files: {},
            fileTypes: {}
        };
        
        files.forEach(file => {
            previewSite.files[file.name] = file.content;
            previewSite.fileTypes[file.name] = file.type;
        });
        
        // حفظ في localStorage للمعاينة
        localStorage.setItem('previewSite', JSON.stringify(previewSite));
        
        // فتح صفحة المعاينة في نافذة جديدة
        const previewWindow = window.open('preview.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        if (previewWindow) {
            showToast('جاري فتح المعاينة...', 'info');
        } else {
            showToast('تم منع النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة', 'warning');
            
            // محاولة فتح في تبويب جديد كبديل
            window.open('preview.html', '_blank');
        }
    }
    
    // حفظ الموقع
    function saveSite() {
        if (!currentSite) return;
        
        try {
            // تحديث ملفات الموقع
            updateSiteFiles();
            
            // تحديث وقت التعديل
            currentSite.updatedAt = new Date().toISOString();
            
            // حفظ في localStorage كموقع حالي
            localStorage.setItem('currentSite', JSON.stringify(currentSite));
            
            // تحديث في قائمة المواقع
            updateSiteInList();
            
            // إعادة تعيين علامة التغيير
            isChanged = false;
            
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
    
    // تحديث ملفات الموقع
    function updateSiteFiles() {
        if (!currentSite.files) currentSite.files = {};
        if (!currentSite.fileTypes) currentSite.fileTypes = {};
        
        files.forEach(file => {
            currentSite.files[file.name] = file.content;
            currentSite.fileTypes[file.name] = file.type;
        });
    }
    
    // تحديث الموقع في القائمة
    function updateSiteInList() {
        try {
            const savedSites = JSON.parse(localStorage.getItem('userSites') || '[]');
            const siteIndex = savedSites.findIndex(site => site.id === currentSite.id);
            
            if (siteIndex !== -1) {
                savedSites[siteIndex] = currentSite;
            } else {
                savedSites.unshift(currentSite);
            }
            
            localStorage.setItem('userSites', JSON.stringify(savedSites));
        } catch (error) {
            console.error('خطأ في تحديث قائمة المواقع:', error);
        }
    }
    
    // تحميل الموقع الحالي
    function downloadCurrentSite() {
        if (!currentSite) return;
        
        // تحديث ملفات الموقع أولاً
        updateSiteFiles();
        
        // استخدام مكتبة JSZip إذا كانت موجودة
        if (typeof JSZip !== 'undefined') {
            createZipFile(currentSite);
        } else {
            // تحميل مكتبة JSZip أولاً
            loadJSZip(() => {
                if (typeof JSZip !== 'undefined') {
                    createZipFile(currentSite);
                } else {
                    showToast('تعذر تحميل مكتبة الضغط', 'error');
                }
            });
        }
    }
    
    // إنشاء ملف ZIP
    function createZipFile(site) {
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
            fileTypes: site.fileTypes,
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
    }
    
    // عرض مودال الخروج
    function showExitModal() {
        if (isChanged) {
            document.getElementById('exitModal').classList.add('active');
        } else {
            exitToHome();
        }
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
        // تنظيف الموقع الحالي من localStorage
        localStorage.removeItem('currentSite');
        localStorage.removeItem('previewSite');
        
        // التوجيه للصفحة الرئيسية
        window.location.href = 'index.html';
    }
    
    // إغلاق جميع المودالات
    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
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
});