// ===== محرر الأكواد الذكي =====
// تم التطوير بواسطة: أحمد التميمي
// جميع الحقوق محفوظة © 2024

// تهيئة المحرر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 محرر الأكواد - بدء التحميل');
    
    // تهيئة المتغيرات العامة
    window.editorState = {
        currentProject: null,
        files: [],
        currentFile: null,
        isChanged: false,
        isFullscreen: false,
        isPreviewVisible: true,
        theme: 'dark-mode',
        autoSaveInterval: null,
        searchResults: [],
        currentSearchIndex: -1
    };
    
    // تحميل المشروع
    loadProject();
});

// تحميل المشروع من localStorage
function loadProject() {
    try {
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
            window.editorState.currentProject = JSON.parse(savedProject);
            console.log('تم تحميل المشروع:', window.editorState.currentProject.name);
            
            // تحويل ملفات المشروع إلى مصفوفة
            if (window.editorState.currentProject.files) {
                Object.keys(window.editorState.currentProject.files).forEach(fileName => {
                    const fileType = window.editorState.currentProject.fileTypes[fileName] || 
                                    detectLanguage(fileName);
                    
                    window.editorState.files.push({
                        name: fileName,
                        content: window.editorState.currentProject.files[fileName],
                        type: fileType,
                        active: false,
                        unsaved: false
                    });
                });
            }
            
            // جعل الملف الأول نشطاً
            if (window.editorState.files.length > 0) {
                window.editorState.files[0].active = true;
                window.editorState.currentFile = window.editorState.files[0];
            }
            
            // تهيئة الواجهة
            initEditor();
        } else {
            showToast('لا يوجد مشروع محمل', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        console.error('خطأ في تحميل المشروع:', error);
        showToast('حدث خطأ في تحميل المشروع', 'error');
    }
}

// تهيئة المحرر
function initEditor() {
    // إخفاء شاشة التحميل
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('editorContainer').style.display = 'block';
            
            // تهيئة المكونات
            initEditorComponents();
            updateEditorUI();
            startAutoSave();
            
            showToast(`مرحباً بك في مشروع ${window.editorState.currentProject.name}`, 'success');
        }, 500);
    }, 1000);
}

// تهيئة مكونات المحرر
function initEditorComponents() {
    // تحديث اسم المشروع
    document.getElementById('projectName').textContent = window.editorState.currentProject.name;
    
    // تهيئة الأزرار
    initButtons();
    
    // تهيئة المودالات
    initModals();
    
    // تهيئة المحرر النصي
    initCodeEditor();
    
    // تهيئة المعاينة
    initPreview();
    
    // تهيئة الاختصارات
    initKeyboardShortcuts();
    
    // تهيئة السايدبار
    initSidebar();
    
    // تحميل الوضع الحالي من localStorage
    loadTheme();
    
    console.log('✅ المحرر جاهز للاستخدام');
}

// تهيئة الأزرار
function initButtons() {
    // زر العودة
    document.getElementById('backBtn').addEventListener('click', showExitModal);
    document.getElementById('backToHome').addEventListener('click', showExitModal);
    
    // زر تبديل الوضع
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // زر المعاينة
    document.getElementById('previewBtn').addEventListener('click', togglePreview);
    document.getElementById('refreshPreview').addEventListener('click', refreshPreview);
    document.getElementById('togglePreview').addEventListener('click', togglePreview);
    
    // زر الحفظ
    document.getElementById('saveBtn').addEventListener('click', saveProject);
    
    // زر التحميل
    document.getElementById('downloadBtn').addEventListener('click', downloadProject);
    
    // زر إضافة ملف
    document.getElementById('addFileBtn').addEventListener('click', () => showModal('newFileModal'));
    document.getElementById('addFileFromManager').addEventListener('click', () => {
        hideAllModals();
        showModal('newFileModal');
    });
    
    // زر إنشاء ملف
    document.getElementById('createFileBtn').addEventListener('click', createNewFile);
    
    // زر تحديث الملفات
    document.getElementById('refreshFiles').addEventListener('click', updateEditorUI);
    
    // أزرار الأدوات
    document.getElementById('formatBtn').addEventListener('click', formatCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    document.getElementById('searchBtn').addEventListener('click', () => showModal('searchModal'));
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    
    // زر نسخ الكود
    document.getElementById('copyCode').addEventListener('click', copyCode);
    
    // أزرار إدارة الملفات
    document.getElementById('fileManagerBtn').addEventListener('click', () => showFileManager());
    
    // أزرار البحث
    document.getElementById('searchActionBtn').addEventListener('click', performSearch);
    document.getElementById('prevResult').addEventListener('click', prevSearchResult);
    document.getElementById('nextResult').addEventListener('click', nextSearchResult);
    document.getElementById('replaceBtn').addEventListener('click', replaceText);
    document.getElementById('replaceAllBtn').addEventListener('click', replaceAllText);
    
    // أزرار الخروج
    document.getElementById('exitWithoutSave').addEventListener('click', exitToHome);
    document.getElementById('saveAndExit').addEventListener('click', saveAndExit);
}

// تهيئة المودالات
function initModals() {
    // جميع أزرار الإغلاق
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', hideAllModals);
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
    
    // نموذج إنشاء ملف جديد
    const newFileForm = document.getElementById('newFileForm');
    if (newFileForm) {
        newFileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewFile();
        });
    }
    
    // نموذج البحث
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
}

// تهيئة المحرر النصي
function initCodeEditor() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');
    
    if (!codeInput || !languageSelect) return;
    
    // تحديث المحتوى عند التغيير
    codeInput.addEventListener('input', function() {
        if (window.editorState.currentFile) {
            window.editorState.currentFile.content = this.value;
            window.editorState.currentFile.unsaved = true;
            window.editorState.isChanged = true;
            
            // تحديث حالة المشروع
            updateProjectStatus('توجد تغييرات غير محفوظة');
            
            // تحديث أرقام الأسطر
            updateLineNumbers();
            
            // تحديث الإحصائيات
            updateEditorStats();
            
            // تحديث المعاينة تلقائياً
            autoUpdatePreview();
        }
    });
    
    // تحديث أرقام الأسطر
    codeInput.addEventListener('scroll', function() {
        updateLineNumbers();
    });
    
    // تحديث موضع المؤشر
    codeInput.addEventListener('keyup', function() {
        updateCursorPosition();
    });
    
    codeInput.addEventListener('click', function() {
        updateCursorPosition();
    });
    
    // دعم Tab للكتابة
    codeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // إضافة مسافتين
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            
            // تحديث موضع المؤشر
            this.selectionStart = this.selectionEnd = start + 2;
            
            // تحديث المحتوى
            if (window.editorState.currentFile) {
                window.editorState.currentFile.content = this.value;
                window.editorState.currentFile.unsaved = true;
                window.editorState.isChanged = true;
            }
        }
    });
    
    // تحديث اللغة
    languageSelect.addEventListener('change', function() {
        if (window.editorState.currentFile) {
            window.editorState.currentFile.type = this.value;
            
            // تحديث واجهة المستخدم
            updateEditorUI();
            
            // تحديث حالة المشروع
            updateProjectStatus('تم تغيير لغة الملف');
        }
    });
}

// تهيئة المعاينة
function initPreview() {
    // تحميل المعاينة لأول مرة
    setTimeout(updatePreview, 1000);
    
    // إضافة مستمع لأحداث iframe
    const previewFrame = document.getElementById('previewFrame');
    if (previewFrame) {
        previewFrame.addEventListener('load', function() {
            document.getElementById('previewLoading').style.display = 'none';
        });
    }
}

// تهيئة الاختصارات
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S للحفظ
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
        }
        
        // Ctrl/Cmd + F للبحث
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            showModal('searchModal');
            document.getElementById('searchText').focus();
        }
        
        // Ctrl/Cmd + H للبحث والاستبدال
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            showModal('searchModal');
            document.getElementById('replaceText').focus();
        }
        
        // Ctrl/Cmd + N لملف جديد
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showModal('newFileModal');
        }
        
        // Ctrl/Cmd + P لتبديل المعاينة
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            togglePreview();
        }
        
        // F11 لملء الشاشة
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // Escape لإغلاق المودالات
        if (e.key === 'Escape') {
            if (document.querySelector('.modal.active')) {
                hideAllModals();
            }
        }
        
        // Ctrl/Cmd + / لتنسيق الكود
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            formatCode();
        }
    });
}

// تهيئة السايدبار
function initSidebar() {
    // تحديث تفاصيل المشروع
    updateProjectDetails();
    
    // إضافة مستمع لبحث الملفات
    const fileSearch = document.getElementById('fileSearch');
    if (fileSearch) {
        fileSearch.addEventListener('input', function() {
            filterFiles(this.value);
        });
    }
}

// تحديث واجهة المستخدم
function updateEditorUI() {
    updateFilesList();
    updateEditorTabs();
    updateCurrentFile();
    updateProjectDetails();
    updateLineNumbers();
    updateEditorStats();
}

// تحديث قائمة الملفات
function updateFilesList() {
    const filesList = document.getElementById('filesList');
    if (!filesList) return;
    
    filesList.innerHTML = '';
    
    window.editorState.files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${file.active ? 'active' : ''}`;
        fileItem.dataset.index = index;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="${getFileIcon(file.type)} file-icon"></i>
                <span class="file-name">${file.name}</span>
                ${file.unsaved ? '<span class="file-unsaved">●</span>' : ''}
            </div>
            <div class="file-actions">
                <button class="file-action-btn close-file" title="إغلاق الملف">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        filesList.appendChild(fileItem);
        
        // إضافة الأحداث
        fileItem.addEventListener('click', function(e) {
            if (!e.target.closest('.file-actions')) {
                const index = parseInt(this.dataset.index);
                switchToFile(index);
            }
        });
        
        const closeBtn = fileItem.querySelector('.close-file');
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(fileItem.dataset.index);
            closeFile(index);
        });
    });
}

// تحديث تبويبات المحرر
function updateEditorTabs() {
    const editorTabs = document.getElementById('editorTabs');
    if (!editorTabs) return;
    
    editorTabs.innerHTML = '';
    
    window.editorState.files.forEach((file, index) => {
        if (file.active) {
            const tab = document.createElement('div');
            tab.className = `tab ${file === window.editorState.currentFile ? 'active' : ''}`;
            tab.dataset.index = index;
            
            tab.innerHTML = `
                <i class="${getFileIcon(file.type)}"></i>
                <span class="tab-name">${file.name}</span>
                ${file.unsaved ? '<span class="tab-unsaved"></span>' : ''}
                <span class="tab-close">&times;</span>
            `;
            
            editorTabs.appendChild(tab);
            
            // إضافة الأحداث
            tab.addEventListener('click', function(e) {
                if (!e.target.classList.contains('tab-close')) {
                    const index = parseInt(this.dataset.index);
                    switchToFile(index);
                }
            });
            
            const closeBtn = tab.querySelector('.tab-close');
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(tab.dataset.index);
                closeFile(index);
            });
        }
    });
}

// تحديث الملف الحالي
function updateCurrentFile() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');
    const currentFileName = document.getElementById('currentFileName');
    
    if (!window.editorState.currentFile) {
        if (codeInput) codeInput.value = '';
        if (currentFileName) currentFileName.textContent = 'اختر ملفاً للبدء';
        if (languageSelect) languageSelect.value = 'html';
        return;
    }
    
    if (codeInput) {
        codeInput.value = window.editorState.currentFile.content;
        codeInput.focus();
    }
    
    if (currentFileName) {
        currentFileName.textContent = window.editorState.currentFile.name;
    }
    
    if (languageSelect) {
        languageSelect.value = window.editorState.currentFile.type;
    }
    
    // تحديث اللغة الحالية في شريط الحالة
    document.getElementById('currentLanguage').textContent = 
        getLanguageName(window.editorState.currentFile.type);
}

// تحديث تفاصيل المشروع
function updateProjectDetails() {
    const projectDetails = document.getElementById('projectDetails');
    if (!projectDetails || !window.editorState.currentProject) return;
    
    const date = new Date(window.editorState.currentProject.updatedAt);
    const dateString = date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const fileCount = window.editorState.files.length;
    const activeFileCount = window.editorState.files.filter(f => f.active).length;
    
    projectDetails.innerHTML = `
        <div class="project-detail">
            <span class="detail-label">النوع:</span>
            <span class="detail-value">${window.editorState.currentProject.type || 'موقع ويب'}</span>
        </div>
        <div class="project-detail">
            <span class="detail-label">الملفات:</span>
            <span class="detail-value">${fileCount} (${activeFileCount} مفتوح)</span>
        </div>
        <div class="project-detail">
            <span class="detail-label">آخر تعديل:</span>
            <span class="detail-value">${dateString}</span>
        </div>
        <div class="project-detail">
            <span class="detail-label">الحالة:</span>
            <span class="detail-value" id="projectStatusText">جاهز</span>
        </div>
    `;
}

// تحديث أرقام الأسطر
function updateLineNumbers() {
    const lineNumbers = document.getElementById('lineNumbers');
    const codeInput = document.getElementById('codeInput');
    
    if (!lineNumbers || !codeInput) return;
    
    const lines = codeInput.value.split('\n').length;
    const scrollTop = codeInput.scrollTop;
    
    lineNumbers.innerHTML = '';
    lineNumbers.style.transform = `translateY(${scrollTop}px)`;
    
    for (let i = 1; i <= lines; i++) {
        const lineNumber = document.createElement('div');
        lineNumber.className = 'line-number';
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
    }
}

// تحديث إحصائيات المحرر
function updateEditorStats() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    
    const content = codeInput.value;
    const lines = content.split('\n').length;
    const characters = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    
    document.getElementById('lineCount').textContent = `${lines} أسطر`;
    document.getElementById('charCount').textContent = `${characters} أحرف`;
}

// تحديث موضع المؤشر
function updateCursorPosition() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    
    const content = codeInput.value;
    const cursorPos = codeInput.selectionStart;
    
    // حساب السطر والعمود
    const textBeforeCursor = content.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    document.getElementById('cursorPos').textContent = `السطر: ${line}، العمود: ${column}`;
}

// ===== إدارة الملفات =====

// التبديل إلى ملف
function switchToFile(index) {
    if (window.editorState.files[index]) {
        // تعطيل جميع الملفات
        window.editorState.files.forEach(file => file.active = false);
        
        // تفعيل الملف المطلوب
        window.editorState.files[index].active = true;
        window.editorState.currentFile = window.editorState.files[index];
        
        // تحديث واجهة المستخدم
        updateEditorUI();
        
        // تحديث المعاينة
        updatePreview();
    }
}

// إغلاق ملف
function closeFile(index) {
    if (window.editorState.files[index]) {
        const file = window.editorState.files[index];
        
        // إذا كان الملف غير محفوظ، طلب التأكيد
        if (file.unsaved) {
            if (!confirm(`الملف "${file.name}" يحتوي على تغييرات غير محفوظة. هل تريد إغلاقه دون حفظ؟`)) {
                return;
            }
        }
        
        // إذا كان الملف هو الملف الحالي، التبديل إلى ملف آخر
        if (file === window.editorState.currentFile) {
            // البحث عن ملف نشط آخر
            const otherFile = window.editorState.files.find((f, i) => f.active && i !== index);
            
            if (otherFile) {
                const otherIndex = window.editorState.files.indexOf(otherFile);
                switchToFile(otherIndex);
            } else if (window.editorState.files.length > 1) {
                // التبديل إلى الملف الأول غير الحالي
                const nextIndex = index === 0 ? 1 : 0;
                switchToFile(nextIndex);
            } else {
                // إذا كان هذا هو الملف الوحيد، مسح المحرر
                window.editorState.currentFile = null;
            }
        }
        
        // إزالة الملف
        window.editorState.files.splice(index, 1);
        
        // تحديث واجهة المستخدم
        updateEditorUI();
        
        // تحديث المعاينة
        updatePreview();
        
        showToast(`تم إغلاق الملف "${file.name}"`, 'info');
    }
}

// إنشاء ملف جديد
function createNewFile() {
    const fileNameInput = document.getElementById('fileName');
    const fileLanguageSelect = document.getElementById('fileLanguage');
    const fileContentTextarea = document.getElementById('fileContent');
    
    const fileName = fileNameInput.value.trim();
    const fileLanguage = fileLanguageSelect.value;
    const fileContent = fileContentTextarea.value;
    
    // التحقق من صحة البيانات
    if (!fileName) {
        showToast('يرجى إدخال اسم الملف', 'error');
        fileNameInput.focus();
        return;
    }
    
    if (!fileName.includes('.')) {
        showToast('يرجى إضافة امتداد للملف (مثل .html, .js, .css)', 'error');
        fileNameInput.focus();
        return;
    }
    
    // التحقق من عدم تكرار الاسم
    if (window.editorState.files.some(f => f.name === fileName)) {
        showToast(`يوجد ملف باسم "${fileName}" بالفعل`, 'error');
        fileNameInput.focus();
        return;
    }
    
    // كشف اللغة من الامتداد
    let detectedLanguage = detectLanguage(fileName);
    if (detectedLanguage === 'unknown') {
        detectedLanguage = fileLanguage;
    }
    
    // إنشاء الملف الجديد
    const newFile = {
        name: fileName,
        content: fileContent || getFileTemplate(detectedLanguage, fileName),
        type: detectedLanguage,
        active: true,
        unsaved: true
    };
    
    // تعطيل جميع الملفات السابقة
    window.editorState.files.forEach(file => file.active = false);
    
    // إضافة الملف الجديد
    window.editorState.files.push(newFile);
    
    // تعيين الملف الجديد كحالي
    const newIndex = window.editorState.files.length - 1;
    window.editorState.currentFile = window.editorState.files[newIndex];
    
    // إغلاق المودال
    hideAllModals();
    
    // إعادة تعيين النموذج
    fileNameInput.value = '';
    fileContentTextarea.value = '';
    
    // تحديث واجهة المستخدم
    updateEditorUI();
    
    // تحديث المعاينة
    updatePreview();
    
    // عرض رسالة النجاح
    showToast(`تم إنشاء الملف "${fileName}"`, 'success');
    
    // تحديث حالة المشروع
    window.editorState.isChanged = true;
    updateProjectStatus('تم إنشاء ملف جديد');
}

// تصفية الملفات
function filterFiles(searchTerm) {
    const fileManagerList = document.getElementById('fileManagerList');
    if (!fileManagerList) return;
    
    const searchLower = searchTerm.toLowerCase();
    const filteredFiles = window.editorState.files.filter(file =>
        file.name.toLowerCase().includes(searchLower) ||
        file.type.toLowerCase().includes(searchLower)
    );
    
    fileManagerList.innerHTML = '';
    
    if (filteredFiles.length > 0) {
        filteredFiles.forEach((file, index) => {
            const originalIndex = window.editorState.files.indexOf(file);
            
            const item = document.createElement('div');
            item.className = 'file-manager-item';
            
            item.innerHTML = `
                <div class="file-manager-info">
                    <i class="${getFileIcon(file.type)}"></i>
                    <div>
                        <div class="file-manager-name">${file.name}</div>
                        <div class="file-manager-size">${file.type} • ${file.content.length} حرف</div>
                    </div>
                </div>
                <div class="file-manager-actions">
                    <button class="btn btn-sm btn-primary open-manager-file" data-index="${originalIndex}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-manager-file" data-index="${originalIndex}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            fileManagerList.appendChild(item);
            
            // إضافة الأحداث
            item.querySelector('.open-manager-file').addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                hideAllModals();
                switchToFile(index);
            });
            
            item.querySelector('.delete-manager-file').addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                deleteFile(index);
                showFileManager();
            });
        });
    } else {
        fileManagerList.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                <i class="fas fa-search" style="font-size: 40px; opacity: 0.5; margin-bottom: 20px;"></i>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على ملفات تطابق "${searchTerm}"</p>
            </div>
        `;
    }
}

// حذف ملف
function deleteFile(index) {
    if (window.editorState.files[index]) {
        const fileName = window.editorState.files[index].name;
        
        if (confirm(`هل تريد حذف الملف "${fileName}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            window.editorState.files.splice(index, 1);
            
            // إذا كان الملف المحذوف هو الملف الحالي، التبديل إلى ملف آخر
            if (!window.editorState.currentFile || window.editorState.files.indexOf(window.editorState.currentFile) === -1) {
                if (window.editorState.files.length > 0) {
                    window.editorState.currentFile = window.editorState.files[0];
                } else {
                    window.editorState.currentFile = null;
                }
            }
            
            // تحديث واجهة المستخدم
            updateEditorUI();
            
            // تحديث المعاينة
            updatePreview();
            
            // تحديث حالة المشروع
            window.editorState.isChanged = true;
            
            showToast(`تم حذف الملف "${fileName}"`, 'success');
        }
    }
}

// إظهار مدير الملفات
function showFileManager() {
    showModal('fileManagerModal');
    
    // تحديث قائمة الملفات
    const fileManagerList = document.getElementById('fileManagerList');
    if (fileManagerList) {
        filterFiles('');
    }
}

// ===== إدارة المشروع =====

// حفظ المشروع
function saveProject() {
    if (!window.editorState.currentProject) return;
    
    try {
        // تحديث ملفات المشروع
        window.editorState.currentProject.files = {};
        window.editorState.currentProject.fileTypes = {};
        
        window.editorState.files.forEach(file => {
            window.editorState.currentProject.files[file.name] = file.content;
            window.editorState.currentProject.fileTypes[file.name] = file.type;
            file.unsaved = false;
        });
        
        // تحديث تاريخ التعديل
        window.editorState.currentProject.updatedAt = new Date().toISOString();
        
        // حفظ في localStorage
        localStorage.setItem('currentProject', JSON.stringify(window.editorState.currentProject));
        
        // تحديث المشاريع في الصفحة الرئيسية
        updateProjectsList();
        
        // تحديث حالة المشروع
        window.editorState.isChanged = false;
        updateProjectStatus('تم الحفظ بنجاح');
        
        // عرض رسالة النجاح
        showToast('تم حفظ المشروع بنجاح', 'success');
        
        // تحديث شريط الحالة
        document.getElementById('lastSaved').textContent = 
            `آخر حفظ: ${new Date().toLocaleTimeString('ar-EG')}`;
        
        // تأثير زر الحفظ
        const saveBtn = document.getElementById('saveBtn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">تم الحفظ</span>';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = false;
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في حفظ المشروع:', error);
        showToast('حدث خطأ في حفظ المشروع', 'error');
    }
}

// بدء الحفظ التلقائي
function startAutoSave() {
    // إيقاف أي فاصل زمني سابق
    if (window.editorState.autoSaveInterval) {
        clearInterval(window.editorState.autoSaveInterval);
    }
    
    // بدء فاصل زمني جديد (كل 30 ثانية)
    window.editorState.autoSaveInterval = setInterval(() => {
        if (window.editorState.isChanged) {
            saveProject();
        }
    }, 30000); // 30 ثانية
}

// تحديث قائمة المشاريع
function updateProjectsList() {
    try {
        const savedProjects = localStorage.getItem('codeEditorProjects');
        let projects = [];
        
        if (savedProjects) {
            projects = JSON.parse(savedProjects);
            
            // تحديث المشروع الحالي في القائمة
            const projectIndex = projects.findIndex(p => p.id === window.editorState.currentProject.id);
            
            if (projectIndex !== -1) {
                projects[projectIndex] = window.editorState.currentProject;
            } else {
                projects.unshift(window.editorState.currentProject);
            }
            
            localStorage.setItem('codeEditorProjects', JSON.stringify(projects));
        }
    } catch (error) {
        console.error('خطأ في تحديث قائمة المشاريع:', error);
    }
}

// تحديث حالة المشروع
function updateProjectStatus(status) {
    const statusElement = document.getElementById('projectStatusText');
    if (statusElement) {
        statusElement.textContent = status;
        
        // إضافة تأثير ظهور
        statusElement.style.animation = 'none';
        setTimeout(() => {
            statusElement.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }
}

// ===== المعاينة =====

// تحديث المعاينة
function updatePreview() {
    if (!window.editorState.currentProject) return;
    
    const previewFrame = document.getElementById('previewFrame');
    const previewLoading = document.getElementById('previewLoading');
    
    if (!previewFrame || !previewLoading) return;
    
    // إظهار مؤشر التحميل
    previewLoading.style.display = 'flex';
    
    // إنشاء محتوى HTML للمعاينة
    const htmlContent = generatePreviewContent();
    
    // تعيين المحتوى للإطار
    setTimeout(() => {
        previewFrame.srcdoc = htmlContent;
    }, 300);
}

// تحديث المعاينة تلقائياً
function autoUpdatePreview() {
    // تحديث المعاينة بعد تأخير (debounce)
    if (window.previewTimeout) {
        clearTimeout(window.previewTimeout);
    }
    
    window.previewTimeout = setTimeout(() => {
        if (window.editorState.isPreviewVisible) {
            updatePreview();
        }
    }, 1000); // تأخير ثانية واحدة
}

// توليد محتوى المعاينة
function generatePreviewContent() {
    if (!window.editorState.currentProject) return '';
    
    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';
    
    // جمع محتويات الملفات
    window.editorState.files.forEach(file => {
        if (file.name.endsWith('.html')) {
            htmlContent = file.content;
        } else if (file.name.endsWith('.css')) {
            cssContent += file.content + '\n';
        } else if (file.name.endsWith('.js')) {
            jsContent += file.content + '\n';
        }
    });
    
    // إذا لم يكن هناك ملف HTML، إنشاء واحد بسيط
    if (!htmlContent) {
        htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${window.editorState.currentProject.name}</title>
    <style>${cssContent}</style>
</head>
<body>
    <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>${window.editorState.currentProject.name}</h1>
        <p>تم إنشاء هذا المشروع باستخدام محرر الأكواد الذكي</p>
        <p>أنشئ ملف index.html لرؤية محتوى موقعك هنا.</p>
    </div>
    <script>${jsContent}</script>
</body>
</html>`;
    } else {
        // دمج CSS و JavaScript في HTML
        if (cssContent) {
            htmlContent = htmlContent.replace('</head>', `<style>\n${cssContent}\n</style>\n</head>`);
        }
        
        if (jsContent) {
            htmlContent = htmlContent.replace('</body>', `<script>\n${jsContent}\n</script>\n</body>`);
        }
    }
    
    return htmlContent;
}

// تحديث المعاينة يدوياً
function refreshPreview() {
    updatePreview();
    showToast('تم تحديث المعاينة', 'info');
}

// تبديل عرض المعاينة
function togglePreview() {
    const previewPanel = document.getElementById('previewPanel');
    
    if (!previewPanel) return;
    
    if (window.editorState.isPreviewVisible) {
        previewPanel.classList.add('collapsed');
        window.editorState.isPreviewVisible = false;
        document.getElementById('previewBtn').innerHTML = '<i class="fas fa-eye-slash"></i> <span class="btn-text">إظهار</span>';
    } else {
        previewPanel.classList.remove('collapsed');
        window.editorState.isPreviewVisible = true;
        document.getElementById('previewBtn').innerHTML = '<i class="fas fa-eye"></i> <span class="btn-text">معاينة</span>';
        updatePreview();
    }
}

// ===== التحميل =====

// تحميل المشروع
function downloadProject() {
    if (!window.editorState.currentProject) return;
    
    // حفظ التغييرات أولاً
    saveProject();
    
    if (typeof JSZip !== 'undefined') {
        createZipFile(window.editorState.currentProject);
    } else {
        showToast('جاري تحميل مكتبة الضغط...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') {
                createZipFile(window.editorState.currentProject);
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
        fileTypes: project.fileTypes,
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

// ===== الأدوات =====

// تنسيق الكود
function formatCode() {
    if (!window.editorState.currentFile) {
        showToast('لا يوجد ملف نشط للتنسيق', 'error');
        return;
    }
    
    let formattedContent = window.editorState.currentFile.content;
    
    switch(window.editorState.currentFile.type) {
        case 'html':
            formattedContent = formatHTML(window.editorState.currentFile.content);
            break;
        case 'css':
            formattedContent = formatCSS(window.editorState.currentFile.content);
            break;
        case 'javascript':
            formattedContent = formatJS(window.editorState.currentFile.content);
            break;
        default:
            showToast('لا يوجد تنسيق خاص لهذه اللغة', 'info');
            return;
    }
    
    window.editorState.currentFile.content = formattedContent;
    window.editorState.currentFile.unsaved = true;
    window.editorState.isChanged = true;
    
    // تحديث المحرر
    updateCurrentFile();
    
    showToast('تم تنسيق الكود', 'success');
}

// مسح الكود
function clearCode() {
    if (!window.editorState.currentFile) {
        showToast('لا يوجد ملف نشط للمسح', 'error');
        return;
    }
    
    if (confirm('هل تريد مسح محتوى الملف الحالي؟')) {
        window.editorState.currentFile.content = '';
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        
        // تحديث المحرر
        updateCurrentFile();
        
        showToast('تم مسح محتوى الملف', 'success');
    }
}

// البحث في الكود
function performSearch() {
    const searchText = document.getElementById('searchText').value;
    const replaceText = document.getElementById('replaceText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    
    if (!searchText.trim()) {
        showToast('يرجى إدخال نص للبحث عنه', 'error');
        return;
    }
    
    if (!window.editorState.currentFile) {
        showToast('لا يوجد ملف نشط للبحث فيه', 'error');
        return;
    }
    
    const content = window.editorState.currentFile.content;
    let searchRegex;
    
    try {
        if (wholeWord) {
            searchRegex = new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi');
        } else {
            searchRegex = new RegExp(searchText, matchCase ? 'g' : 'gi');
        }
    } catch (error) {
        showToast('تعبير البحث غير صحيح', 'error');
        return;
    }
    
    const matches = content.match(searchRegex);
    const searchResults = document.getElementById('searchResults');
    
    if (matches) {
        // حفظ نتائج البحث
        window.editorState.searchResults = [];
        window.editorState.currentSearchIndex = 0;
        
        let match;
        while ((match = searchRegex.exec(content)) !== null) {
            window.editorState.searchResults.push({
                index: match.index,
                length: match[0].length,
                text: match[0]
            });
        }
        
        // عرض النتائج
        searchResults.innerHTML = `
            <div class="search-result-count">
                تم العثور على ${matches.length} نتيجة
            </div>
        `;
        
        // عرض أول 10 نتائج
        const displayResults = window.editorState.searchResults.slice(0, 10);
        displayResults.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';
            resultElement.dataset.index = index;
            
            // استخراج السياق
            const start = Math.max(0, result.index - 30);
            const end = Math.min(content.length, result.index + result.length + 30);
            const context = content.substring(start, end);
            
            resultElement.innerHTML = `
                <div class="search-result-line">
                    ${highlightText(context, searchText, matchCase)}
                </div>
                <div class="search-result-context">
                    السطر: ${getLineNumber(content, result.index)} • الموضع: ${result.index}
                </div>
            `;
            
            searchResults.appendChild(resultElement);
            
            // إضافة حدث النقر
            resultElement.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                goToSearchResult(index);
            });
        });
        
        // التوجه إلى أول نتيجة
        if (window.editorState.searchResults.length > 0) {
            goToSearchResult(0);
        }
        
        showToast(`تم العثور على ${matches.length} نتيجة`, 'success');
    } else {
        searchResults.innerHTML = `
            <div class="search-result-count">
                لم يتم العثور على نتائج
            </div>
        `;
        showToast('لم يتم العثور على نتائج', 'warning');
    }
}

// استبدال النص
function replaceText() {
    const searchText = document.getElementById('searchText').value;
    const replaceText = document.getElementById('replaceText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    
    if (!searchText.trim()) {
        showToast('يرجى إدخال نص للبحث عنه', 'error');
        return;
    }
    
    if (!window.editorState.currentFile) {
        showToast('لا يوجد ملف نشط', 'error');
        return;
    }
    
    if (window.editorState.searchResults.length === 0) {
        showToast('لا توجد نتائج بحث للاستبدال', 'warning');
        return;
    }
    
    const currentIndex = window.editorState.currentSearchIndex;
    if (currentIndex >= 0 && currentIndex < window.editorState.searchResults.length) {
        const result = window.editorState.searchResults[currentIndex];
        const content = window.editorState.currentFile.content;
        
        // استبدال النص
        const before = content.substring(0, result.index);
        const after = content.substring(result.index + result.length);
        window.editorState.currentFile.content = before + replaceText + after;
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        
        // تحديث المحرر
        updateCurrentFile();
        
        // تحديث نتائج البحث
        window.editorState.searchResults.splice(currentIndex, 1);
        
        // تعديل مواضع النتائج المتبقية
        for (let i = currentIndex; i < window.editorState.searchResults.length; i++) {
            window.editorState.searchResults[i].index += replaceText.length - result.length;
        }
        
        // التوجه إلى النتيجة التالية
        if (window.editorState.searchResults.length > 0) {
            goToSearchResult(Math.min(currentIndex, window.editorState.searchResults.length - 1));
        } else {
            document.getElementById('searchResults').innerHTML = `
                <div class="search-result-count">
                    تم استبدال جميع النتائج
                </div>
            `;
        }
        
        showToast('تم الاستبدال بنجاح', 'success');
    }
}

// استبدال الكل
function replaceAllText() {
    const searchText = document.getElementById('searchText').value;
    const replaceText = document.getElementById('replaceText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    
    if (!searchText.trim()) {
        showToast('يرجى إدخال نص للبحث عنه', 'error');
        return;
    }
    
    if (!window.editorState.currentFile) {
        showToast('لا يوجد ملف نشط', 'error');
        return;
    }
    
    let searchRegex;
    try {
        if (wholeWord) {
            searchRegex = new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi');
        } else {
            searchRegex = new RegExp(searchText, matchCase ? 'g' : 'gi');
        }
    } catch (error) {
        showToast('تعبير البحث غير صحيح', 'error');
        return;
    }
    
    const content = window.editorState.currentFile.content;
    const matches = content.match(searchRegex);
    
    if (matches) {
        window.editorState.currentFile.content = content.replace(searchRegex, replaceText);
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        
        // تحديث المحرر
        updateCurrentFile();
        
        // إعادة البحث
        performSearch();
        
        showToast(`تم استبدال ${matches.length} نتيجة`, 'success');
    } else {
        showToast('لم يتم العثور على نص للاستبدال', 'warning');
    }
}

// التنقل بين نتائج البحث
function prevSearchResult() {
    if (window.editorState.searchResults.length === 0) return;
    
    window.editorState.currentSearchIndex = 
        (window.editorState.currentSearchIndex - 1 + window.editorState.searchResults.length) % 
        window.editorState.searchResults.length;
    
    goToSearchResult(window.editorState.currentSearchIndex);
}

function nextSearchResult() {
    if (window.editorState.searchResults.length === 0) return;
    
    window.editorState.currentSearchIndex = 
        (window.editorState.currentSearchIndex + 1) % window.editorState.searchResults.length;
    
    goToSearchResult(window.editorState.currentSearchIndex);
}

function goToSearchResult(index) {
    if (index < 0 || index >= window.editorState.searchResults.length) return;
    
    const result = window.editorState.searchResults[index];
    window.editorState.currentSearchIndex = index;
    
    // التمرير إلى النتيجة
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.focus();
        codeInput.setSelectionRange(result.index, result.index + result.length);
        
        // التمرير لجعل النتيجة مرئية
        const lineHeight = 24; // ارتفاع السطر التقريبي
        const linesBefore = codeInput.value.substring(0, result.index).split('\n').length;
        const scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
        codeInput.scrollTop = scrollTop;
    }
    
    // تحديث تظليل النتيجة النشطة
    document.querySelectorAll('.search-result').forEach((el, i) => {
        if (i === index) {
            el.style.background = 'rgba(88, 166, 255, 0.1)';
            el.style.border = '1px solid rgba(88, 166, 255, 0.3)';
        } else {
            el.style.background = '';
            el.style.border = '1px solid transparent';
        }
    });
}

// ===== الوضع المظلم/الفاتح =====

// تبديل الوضع
function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        window.editorState.theme = 'light-mode';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.title = 'تبديل الوضع الفاتح';
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        window.editorState.theme = 'dark-mode';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'تبديل الوضع المظلم';
    }
    
    // حفظ الوضع
    localStorage.setItem('codeEditorTheme', window.editorState.theme);
    
    showToast(`تم التبديل إلى الوضع ${window.editorState.theme === 'dark-mode' ? 'المظلم' : 'الفاتح'}`, 'info');
}

// تحميل الوضع
function loadTheme() {
    const savedTheme = localStorage.getItem('codeEditorTheme');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (savedTheme) {
        body.className = savedTheme;
        window.editorState.theme = savedTheme;
        
        if (savedTheme === 'light-mode') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.title = 'تبديل الوضع الفاتح';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.title = 'تبديل الوضع المظلم';
        }
    }
}

// ===== ملء الشاشة =====

function toggleFullscreen() {
    const editorContainer = document.getElementById('editorContainer');
    
    if (!window.editorState.isFullscreen) {
        if (editorContainer.requestFullscreen) {
            editorContainer.requestFullscreen();
        } else if (editorContainer.webkitRequestFullscreen) {
            editorContainer.webkitRequestFullscreen();
        } else if (editorContainer.msRequestFullscreen) {
            editorContainer.msRequestFullscreen();
        }
        window.editorState.isFullscreen = true;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i> خروج من ملء الشاشة';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        window.editorState.isFullscreen = false;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i> ملء الشاشة';
    }
}

// مستمع حدث خروج ملء الشاشة
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        window.editorState.isFullscreen = false;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i> ملء الشاشة';
    }
}

// ===== وظائف مساعدة =====

// نسخ الكود
function copyCode() {
    if (!window.editorState.currentFile) {
        showToast('لا يوجد كود للنسخ', 'error');
        return;
    }
    
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.select();
        document.execCommand('copy');
        
        showToast('تم نسخ الكود إلى الحافظة', 'success');
        
        // تأثير زر النسخ
        const copyBtn = document.getElementById('copyCode');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 1500);
    }
}

// كشف لغة البرمجة من اسم الملف
function detectLanguage(fileName) {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const extensions = {
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
    };
    return extensions[extension] || 'unknown';
}

// الحصول على أيقونة الملف
function getFileIcon(fileType) {
    const icons = {
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
    };
    return icons[fileType] || icons.unknown;
}

// الحصول على اسم اللغة
function getLanguageName(languageCode) {
    const languages = {
        'html': 'HTML',
        'css': 'CSS',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'python': 'Python',
        'php': 'PHP',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'csharp': 'C#',
        'ruby': 'Ruby',
        'swift': 'Swift',
        'go': 'Go',
        'rust': 'Rust',
        'json': 'JSON',
        'xml': 'XML',
        'sql': 'SQL',
        'markdown': 'Markdown',
        'text': 'نص عادي'
    };
    return languages[languageCode] || 'غير معروف';
}

// الحصول على قالب الملف
function getFileTemplate(language, fileName) {
    const templates = {
        'html': `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '').replace('.htm', '')}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>مرحباً بك في ${fileName}</h1>
    <p>ابدأ بكتابة كود HTML هنا.</p>
    
    <script src="script.js"></script>
</body>
</html>`,
        
        'css': `/* أنماط ${fileName} */

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
}`,
        
        'javascript': `// ${fileName}

console.log('مرحباً بك في ${fileName}');

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة بنجاح');
    
    // أضف كود JavaScript الخاص بك هنا
    function init() {
        console.log('التطبيق جاهز');
    }
    
    init();
});`,
        
        'default': `// ${fileName}
// تم إنشاء هذا الملف باستخدام محرر الأكواد الذكي
// ابدأ بكتابة كودك هنا...`
    };
    
    return templates[language] || templates.default;
}

// تنسيق HTML
function formatHTML(html) {
    let formatted = html
        .replace(/>\s+</g, '>\n<')
        .replace(/\s+/g, ' ')
        .replace(/\s\s+/g, ' ');
    
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line.startsWith('</')) {
            indentLevel--;
        }
        
        formattedLines.push('  '.repeat(Math.max(0, indentLevel)) + line);
        
        if (line.startsWith('<') && !line.startsWith('</') && 
            !line.includes('/>') && !line.match(/<(br|hr|img|meta|link|input)/i)) {
            indentLevel++;
        }
    }
    
    return formattedLines.join('\n');
}

// تنسيق CSS
function formatCSS(css) {
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
    let formatted = js
        .replace(/\s*\{\s*/g, ' {\n  ')
        .replace(/\s*\}\s*/g, '\n}\n\n')
        .replace(/\s*;\s*/g, ';\n  ')
        .replace(/,\s*/g, ', ');
    
    return formatted;
}

// حساب رقم السطر
function getLineNumber(content, position) {
    return content.substring(0, position).split('\n').length;
}

// تظليل النص في نتائج البحث
function highlightText(text, searchText, matchCase) {
    if (!searchText) return text;
    
    const searchRegex = new RegExp(searchText, matchCase ? 'g' : 'gi');
    return text.replace(searchRegex, '<mark>$&</mark>');
}

// ===== الخروج =====

// إظهار مودال الخروج
function showExitModal() {
    if (window.editorState.isChanged) {
        showModal('exitModal');
    } else {
        exitToHome();
    }
}

// حفظ والخروج
function saveAndExit() {
    saveProject();
    setTimeout(() => {
        exitToHome();
    }, 500);
}

// الخروج بدون حفظ
function exitToHome() {
    // تنظيف
    if (window.editorState.autoSaveInterval) {
        clearInterval(window.editorState.autoSaveInterval);
    }
    
    localStorage.removeItem('currentProject');
    window.location.href = 'index.html';
}

// ===== وظائف عامة =====

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

// ===== تهيئة إضافية =====
console.log('%cمحرر الأكواد الذكي v1.0', 'font-size: 16px; color: #58a6ff; font-weight: bold;');
console.log('%cالمطور: أحمد التميمي', 'color: #238636;');
console.log('%cجميع الحقوق محفوظة © 2024', 'color: #c9d1d9;');

// تحسينات للأجهزة المحمولة
if ('ontouchstart' in window) {
    document.body.classList.add('touch');
    
    // تحسينات للأزرار
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

// تحسينات للأداء
window.addEventListener('load', function() {
    // إضافة فئة للأجهزة المختلفة
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile');
    } else if (window.innerWidth < 1024) {
        document.body.classList.add('tablet');
    } else {
        document.body.classList.add('desktop');
    }
    
    // إضافة تأثيرات للصور
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        if (img.complete) {
            img.classList.add('loaded');
        }
    });
});