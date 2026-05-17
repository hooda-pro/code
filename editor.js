// ===== VS Code Editor Mobile - صفحة المحرر (كاملة الميزات مع ربط كامل للأزرار) =====
'use strict';

const EditorState = {
    project: null,
    files: [],
    currentFile: null,
    isChanged: false,
    isFullscreen: false,
    theme: 'dark-mode',
    autoSaveInterval: null,
    searchResults: [],
    currentSearchIndex: -1,
    lineHeight: 24,
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('📁 تحميل المحرر...');
    loadProject();
});

function loadProject() {
    try {
        const saved = localStorage.getItem('currentProject');
        if (!saved) {
            showToast('لا يوجد مشروع', 'error');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }
        EditorState.project = JSON.parse(saved);
        EditorState.files = [];
        if (EditorState.project.files) {
            Object.entries(EditorState.project.files).forEach(([name, content]) => {
                const type = EditorState.project.fileTypes?.[name] || detectLanguage(name);
                EditorState.files.push({
                    name,
                    content,
                    type,
                    active: false,
                    unsaved: false,
                });
            });
        }
        if (EditorState.files.length > 0) {
            EditorState.files[0].active = true;
            EditorState.currentFile = EditorState.files[0];
        }
        initEditor();
    } catch (e) {
        console.error(e);
        showToast('خطأ في تحميل المشروع', 'error');
    }
}

function initEditor() {
    const loader = document.getElementById('loadingScreen');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            const editorApp = document.getElementById('editorApp');
            if (editorApp) editorApp.style.display = 'flex';
            setupEditor();
            updateUI();
            startAutoSave();
            showToast(`مرحباً في مشروع ${EditorState.project?.name || ''}`, 'success');
        }, 500);
    }
}

function setupEditor() {
    bindEvents();
    initCodeEditor();
    initKeyboardShortcuts();
    initTheme();
    initMobile();
}

function bindEvents() {
    // دالة مساعدة لربط الأحداث بأمان
    function safeAddListener(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with id "${id}" not found`);
        }
    }

    // أزرار الرأس والتنقل
    safeAddListener('backBtn', 'click', showExitModal);
    safeAddListener('backToHome', 'click', showExitModal);
    safeAddListener('themeToggle', 'click', toggleTheme);
    
    // أزرار المعاينة والحفظ والتحميل (قد تكون متعددة)
    const previewBtns = ['previewBtn', 'mobilePreview', 'bottomPreview'];
    previewBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', openPreview);
    });

    const saveBtns = ['saveBtn', 'mobileSave', 'bottomSave'];
    saveBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', saveProject);
    });

    const downloadBtns = ['downloadBtn', 'mobileDownload'];
    downloadBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', downloadProject);
    });

    // أزرار إضافة ملف (متعددة)
    const addFileBtns = ['addFileBtn', 'mobileAddFile', 'bottomAddFile'];
    addFileBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => showModal('newFileModal'));
    });

    // زر إنشاء ملف في المودال
    safeAddListener('createFileBtn', 'click', createNewFile);

    // تحديث قائمة الملفات
    safeAddListener('refreshFiles', 'click', () => updateUI());

    // أدوات التحرير
    safeAddListener('formatBtn', 'click', formatCode);
    safeAddListener('clearBtn', 'click', clearCode);
    safeAddListener('searchBtn', 'click', () => showModal('searchModal'));
    safeAddListener('fullscreenBtn', 'click', toggleFullscreen);
    safeAddListener('copyCode', 'click', copyCodeHandler);
    safeAddListener('fileManagerBtn', 'click', showFileManager);
    safeAddListener('addFileFromManager', 'click', () => {
        hideAllModals();
        showModal('newFileModal');
    });

    // إغلاق الشريط الجانبي
    safeAddListener('closeSidebar', 'click', () => {
        document.getElementById('editorSidebar')?.classList.remove('active');
    });

    // مودالات - أزرار الإغلاق
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) hideAllModals(); });
    });

    // نماذج
    const newFileForm = document.getElementById('newFileForm');
    if (newFileForm) newFileForm.addEventListener('submit', (e) => { e.preventDefault(); createNewFile(); });
    
    const searchForm = document.getElementById('searchForm');
    if (searchForm) searchForm.addEventListener('submit', (e) => { e.preventDefault(); performSearch(); });

    // بحث واستبدال
    safeAddListener('searchActionBtn', 'click', performSearch);
    safeAddListener('prevResult', 'click', prevSearchResult);
    safeAddListener('nextResult', 'click', nextSearchResult);
    safeAddListener('replaceBtn', 'click', replaceText);
    safeAddListener('replaceAllBtn', 'click', replaceAllText);

    // خروج
    safeAddListener('exitWithoutSave', 'click', exitToHome);
    safeAddListener('saveAndExit', 'click', saveAndExit);

    // البحث في مدير الملفات
    const fileSearch = document.getElementById('fileSearch');
    if (fileSearch) fileSearch.addEventListener('input', function() {
        filterFiles(this.value);
    });

    console.log('✅ تم ربط جميع الأحداث');
}

// ===== تهيئة المحرر النصي =====
function initCodeEditor() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');

    if (!codeInput || !languageSelect) return;

    codeInput.addEventListener('input', function() {
        if (EditorState.currentFile) {
            EditorState.currentFile.content = this.value;
            EditorState.currentFile.unsaved = true;
            EditorState.isChanged = true;
            updateProjectStatus('توجد تغييرات غير محفوظة', 'warning');
            updateLineNumbers();
            updateEditorStats();
        }
    });

    codeInput.addEventListener('scroll', function() {
        const lineNumbers = document.getElementById('lineNumbers');
        if (lineNumbers) lineNumbers.style.transform = `translateY(${this.scrollTop}px)`;
    });

    codeInput.addEventListener('keyup', updateCursorPosition);
    codeInput.addEventListener('click', updateCursorPosition);

    codeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
            if (EditorState.currentFile) {
                EditorState.currentFile.content = this.value;
                EditorState.currentFile.unsaved = true;
                EditorState.isChanged = true;
            }
        }
    });

    languageSelect.addEventListener('change', function() {
        if (EditorState.currentFile) {
            EditorState.currentFile.type = this.value;
            EditorState.currentFile.unsaved = true;
            EditorState.isChanged = true;
            updateUI();
            updateProjectStatus('تم تغيير لغة الملف', 'info');
        }
    });
}

// ===== اختصارات لوحة المفاتيح =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProject();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            showModal('searchModal');
            document.getElementById('searchText')?.focus();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showModal('newFileModal');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            openPreview();
        }
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        if (e.key === 'Escape') {
            if (document.querySelector('.modal.active')) hideAllModals();
        }
    });
}

// ===== تحديث واجهة المستخدم =====
function updateUI() {
    updateFilesList();
    updateEditorTabs();
    updateCurrentFile();
    updateProjectDetails();
    updateLineNumbers();
    updateEditorStats();
}

function updateFilesList() {
    const filesList = document.getElementById('filesList');
    if (!filesList) return;
    filesList.innerHTML = '';
    EditorState.files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = `file-item ${file.active ? 'active' : ''}`;
        item.dataset.index = index;
        item.innerHTML = `
            <div class="file-info">
                <i class="${getFileIcon(file.type)} file-icon"></i>
                <span class="file-name">${escapeHTML(file.name)}</span>
                ${file.unsaved ? '<span class="file-unsaved">●</span>' : ''}
            </div>
            <div class="file-actions">
                <button class="file-action-btn download-file" title="تحميل"><i class="fas fa-download"></i></button>
                <button class="file-action-btn close-file" title="إغلاق"><i class="fas fa-times"></i></button>
            </div>
        `;
        filesList.appendChild(item);
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.file-actions')) {
                const idx = parseInt(this.dataset.index);
                switchToFile(idx);
            }
        });
        const closeBtn = item.querySelector('.close-file');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(item.dataset.index);
                closeFile(idx);
            });
        }
        const downloadBtn = item.querySelector('.download-file');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(item.dataset.index);
                downloadSingleFile(idx);
            });
        }
    });
}

function downloadSingleFile(index) {
    const file = EditorState.files[index];
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast(`تم تحميل "${file.name}"`, 'success');
}

function updateEditorTabs() {
    const tabs = document.getElementById('editorTabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    EditorState.files.forEach((file, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${file === EditorState.currentFile ? 'active' : ''}`;
        tab.dataset.index = index;
        tab.innerHTML = `
            <i class="${getFileIcon(file.type)}"></i>
            <span class="tab-name">${escapeHTML(file.name)}</span>
            ${file.unsaved ? '<span class="tab-unsaved"></span>' : ''}
            <span class="tab-close">&times;</span>
        `;
        tabs.appendChild(tab);
        tab.addEventListener('click', function(e) {
            if (!e.target.classList.contains('tab-close')) {
                const idx = parseInt(this.dataset.index);
                switchToFile(idx);
            }
        });
        const closeBtn = tab.querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(tab.dataset.index);
                closeFile(idx);
            });
        }
    });
}

function updateCurrentFile() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');
    const currentFileName = document.getElementById('currentFileName');
    if (!EditorState.currentFile) {
        if (codeInput) {
            if (EditorState.files.length === 0) {
                codeInput.value = '👈 أضف ملف جديد للبدء في البرمجة\n\nاضغط على زر "ملف جديد" في الشريط الجانبي أو من القائمة.';
            } else {
                codeInput.value = '';
            }
        }
        if (currentFileName) currentFileName.textContent = 'اختر ملفاً';
        if (languageSelect) languageSelect.value = 'html';
        return;
    }
    if (codeInput) codeInput.value = EditorState.currentFile.content;
    if (currentFileName) currentFileName.textContent = EditorState.currentFile.name;
    if (languageSelect) languageSelect.value = EditorState.currentFile.type;
}

function updateProjectDetails() {
    const details = document.getElementById('projectDetails');
    if (!details || !EditorState.project) return;
    const date = new Date(EditorState.project.updatedAt || Date.now());
    const dateStr = date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    details.innerHTML = `
        <div class="project-detail"><span class="detail-label">النوع:</span><span class="detail-value">${EditorState.project.type || 'موقع ويب'}</span></div>
        <div class="project-detail"><span class="detail-label">الملفات:</span><span class="detail-value">${EditorState.files.length} ملف</span></div>
        <div class="project-detail"><span class="detail-label">آخر تعديل:</span><span class="detail-value">${dateStr}</span></div>
        <div class="project-detail"><span class="detail-label">الحالة:</span><span class="detail-value" id="projectStatusText">جاهز</span></div>
    `;
}

function updateLineNumbers() {
    const lineNumbers = document.getElementById('lineNumbers');
    const codeInput = document.getElementById('codeInput');
    if (!lineNumbers || !codeInput) return;
    const lines = codeInput.value.split('\n').length;
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
        const div = document.createElement('div');
        div.className = 'line-number';
        div.textContent = i;
        lineNumbers.appendChild(div);
    }
}

function updateEditorStats() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    const content = codeInput.value;
    const lines = content.split('\n').length;
    const chars = content.length;
    const lineCount = document.getElementById('lineCount');
    const charCount = document.getElementById('charCount');
    if (lineCount) lineCount.textContent = `${lines}`;
    if (charCount) charCount.textContent = `${chars}`;
}

function updateCursorPosition() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    const pos = codeInput.selectionStart;
    const text = codeInput.value;
    const lines = text.substring(0, pos).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    const cursorPos = document.getElementById('cursorPos');
    if (cursorPos) cursorPos.textContent = `السطر ${line}، العمود ${column}`;
}

function updateProjectStatus(msg, type = 'info') {
    const status = document.getElementById('projectStatus');
    const statusText = document.getElementById('projectStatusText');
    if (status) {
        status.innerHTML = `<i class="fas fa-circle" style="color: ${type === 'warning' ? 'var(--warning)' : 'var(--success)'};"></i> ${msg}`;
    }
    if (statusText) statusText.textContent = msg;
}

// ===== إدارة الملفات =====
function switchToFile(index) {
    if (EditorState.files[index]) {
        EditorState.files.forEach(f => f.active = false);
        EditorState.files[index].active = true;
        EditorState.currentFile = EditorState.files[index];
        updateUI();
    }
}

function closeFile(index) {
    const file = EditorState.files[index];
    if (!file) return;
    if (file.unsaved) {
        if (!confirm(`الملف "${file.name}" يحتوي على تغييرات غير محفوظة. هل تريد إغلاقه دون حفظ؟`)) return;
    }
    if (file === EditorState.currentFile) {
        const other = EditorState.files.find((f, i) => i !== index);
        if (other) {
            switchToFile(EditorState.files.indexOf(other));
        } else {
            EditorState.currentFile = null;
        }
    }
    EditorState.files.splice(index, 1);
    updateUI();
    showToast(`تم إغلاق "${file.name}"`, 'info');
}

function createNewFile() {
    const nameInput = document.getElementById('fileName');
    const langSelect = document.getElementById('fileLanguage');
    const contentTextarea = document.getElementById('fileContent');
    if (!nameInput || !langSelect || !contentTextarea) return;
    const fileName = nameInput.value.trim();
    if (!fileName) {
        showToast('أدخل اسم الملف', 'error');
        nameInput.focus();
        return;
    }
    if (!fileName.includes('.')) {
        showToast('أضف امتداد الملف', 'error');
        nameInput.focus();
        return;
    }
    if (EditorState.files.some(f => f.name === fileName)) {
        showToast(`الملف "${fileName}" موجود بالفعل`, 'error');
        return;
    }
    let detected = detectLanguage(fileName);
    if (detected === 'unknown') detected = langSelect.value;
    const newFile = {
        name: fileName,
        content: contentTextarea.value || getFileTemplate(detected, fileName),
        type: detected,
        active: true,
        unsaved: true
    };
    EditorState.files.forEach(f => f.active = false);
    EditorState.files.push(newFile);
    EditorState.currentFile = newFile;
    EditorState.isChanged = true;
    hideAllModals();
    nameInput.value = '';
    contentTextarea.value = '';
    updateUI();
    showToast(`تم إنشاء "${fileName}"`, 'success');
}

function deleteFile(index) {
    const file = EditorState.files[index];
    if (!file) return;
    if (confirm(`هل تريد حذف "${file.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        EditorState.files.splice(index, 1);
        if (!EditorState.currentFile || EditorState.files.indexOf(EditorState.currentFile) === -1) {
            EditorState.currentFile = EditorState.files[0] || null;
        }
        updateUI();
        EditorState.isChanged = true;
        showToast(`تم حذف "${file.name}"`, 'success');
    }
}

function showFileManager() {
    showModal('fileManagerModal');
    filterFiles('');
}

function filterFiles(query) {
    const list = document.getElementById('fileManagerList');
    if (!list) return;
    const q = query.toLowerCase();
    const filtered = EditorState.files.filter(f => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));
    list.innerHTML = '';
    if (filtered.length > 0) {
        filtered.forEach((file, idx) => {
            const originalIndex = EditorState.files.indexOf(file);
            const item = document.createElement('div');
            item.className = 'file-manager-item';
            item.innerHTML = `
                <div class="file-manager-info">
                    <i class="${getFileIcon(file.type)}"></i>
                    <div>
                        <div class="file-manager-name">${escapeHTML(file.name)}</div>
                        <div class="file-manager-size">${file.type} • ${file.content.length} حرف</div>
                    </div>
                </div>
                <div class="file-manager-actions">
                    <button class="btn btn-sm btn-primary open-manager-file"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-success download-manager-file"><i class="fas fa-download"></i></button>
                    <button class="btn btn-sm btn-danger delete-manager-file"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(item);
            const openBtn = item.querySelector('.open-manager-file');
            if (openBtn) {
                openBtn.addEventListener('click', () => {
                    hideAllModals();
                    switchToFile(originalIndex);
                });
            }
            const downloadBtn = item.querySelector('.download-manager-file');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    downloadSingleFile(originalIndex);
                });
            }
            const deleteBtn = item.querySelector('.delete-manager-file');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    deleteFile(originalIndex);
                    filterFiles('');
                });
            }
        });
    } else {
        list.innerHTML = `<div class="empty-state" style="padding:30px;"><i class="fas fa-search"></i><h4>لا توجد نتائج</h4><p>لم يتم العثور على ملفات.</p></div>`;
    }
}

// ===== إدارة المشروع =====
function saveProject() {
    if (!EditorState.project) return;
    EditorState.project.files = {};
    EditorState.project.fileTypes = {};
    EditorState.files.forEach(f => {
        EditorState.project.files[f.name] = f.content;
        EditorState.project.fileTypes[f.name] = f.type;
        f.unsaved = false;
    });
    EditorState.project.updatedAt = new Date().toISOString();
    localStorage.setItem('currentProject', JSON.stringify(EditorState.project));
    localStorage.setItem('previewProject', JSON.stringify(EditorState.project));
    updateProjectsList();
    EditorState.isChanged = false;
    updateProjectStatus('تم الحفظ بنجاح', 'success');
    showToast('تم حفظ المشروع', 'success');
}

function startAutoSave() {
    if (EditorState.autoSaveInterval) clearInterval(EditorState.autoSaveInterval);
    EditorState.autoSaveInterval = setInterval(() => {
        if (EditorState.isChanged) saveProject();
    }, 30000);
}

function updateProjectsList() {
    try {
        const saved = localStorage.getItem('codeEditorProjects');
        if (saved) {
            let projects = JSON.parse(saved);
            const idx = projects.findIndex(p => p.id === EditorState.project.id);
            if (idx !== -1) projects[idx] = EditorState.project;
            else projects.unshift(EditorState.project);
            localStorage.setItem('codeEditorProjects', JSON.stringify(projects));
        }
    } catch (e) { console.error(e); }
}

// ===== تحميل المشروع =====
function downloadProject() {
    if (!EditorState.project) return;
    saveProject();
    if (typeof JSZip === 'undefined') {
        showToast('جار تحميل مكتبة الضغط...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') createZip();
            else showToast('تعذر تحميل المكتبة', 'error');
        }, 1000);
        return;
    }
    createZip();
}

function createZip() {
    const zip = new JSZip();
    Object.keys(EditorState.project.files).forEach(fname => {
        zip.file(fname, EditorState.project.files[fname]);
    });
    zip.file('project-info.json', JSON.stringify({
        projectName: EditorState.project.name,
        projectType: EditorState.project.type,
        description: EditorState.project.description,
        created: EditorState.project.createdAt,
        modified: EditorState.project.updatedAt,
        files: Object.keys(EditorState.project.files),
        developer: 'محمود أحمد سعيد'
    }, null, 2));
    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${EditorState.project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('تم تحميل المشروع', 'success');
    }).catch(() => showToast('فشل التحميل', 'error'));
}

// ===== الأدوات =====
function formatCode() {
    if (!EditorState.currentFile) {
        showToast('لا يوجد ملف نشط', 'error');
        return;
    }
    let formatted = EditorState.currentFile.content;
    switch (EditorState.currentFile.type) {
        case 'html':
            formatted = formatHTML(formatted);
            break;
        case 'css':
            formatted = formatCSS(formatted);
            break;
        case 'javascript':
        case 'json':
            formatted = formatJS(formatted);
            break;
        default:
            showToast('لا يدعم التنسيق لهذه اللغة', 'info');
            return;
    }
    EditorState.currentFile.content = formatted;
    EditorState.currentFile.unsaved = true;
    EditorState.isChanged = true;
    updateCurrentFile();
    showToast('تم تنسيق الكود', 'success');
}

function clearCode() {
    if (!EditorState.currentFile) {
        showToast('لا يوجد ملف نشط', 'error');
        return;
    }
    if (confirm('مسح محتوى الملف الحالي؟')) {
        EditorState.currentFile.content = '';
        EditorState.currentFile.unsaved = true;
        EditorState.isChanged = true;
        updateCurrentFile();
        showToast('تم مسح المحتوى', 'success');
    }
}

function performSearch() {
    const searchText = document.getElementById('searchText')?.value || '';
    const matchCase = document.getElementById('matchCase')?.checked || false;
    const wholeWord = document.getElementById('wholeWord')?.checked || false;
    if (!searchText.trim()) {
        showToast('أدخل نصاً للبحث', 'error');
        return;
    }
    if (!EditorState.currentFile) {
        showToast('لا يوجد ملف نشط', 'error');
        return;
    }
    const content = EditorState.currentFile.content;
    let regex;
    try {
        if (wholeWord) regex = new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi');
        else regex = new RegExp(searchText, matchCase ? 'g' : 'gi');
    } catch (e) {
        showToast('تعبير غير صحيح', 'error');
        return;
    }
    const matches = content.match(regex);
    const resultsDiv = document.getElementById('searchResults');
    if (matches) {
        EditorState.searchResults = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            EditorState.searchResults.push({
                index: match.index,
                length: match[0].length,
                text: match[0]
            });
        }
        EditorState.currentSearchIndex = 0;
        resultsDiv.innerHTML = `<div class="search-result-count">تم العثور على ${matches.length} نتيجة</div>`;
        EditorState.searchResults.slice(0, 10).forEach((res, i) => {
            const start = Math.max(0, res.index - 30);
            const end = Math.min(content.length, res.index + res.length + 30);
            const context = content.substring(start, end);
            const resultEl = document.createElement('div');
            resultEl.className = 'search-result';
            resultEl.dataset.index = i;
            resultEl.innerHTML = `<div class="search-result-line">${highlightText(context, searchText, matchCase)}</div>
                <div class="search-result-context">السطر: ${getLineNumber(content, res.index)} • الموضع: ${res.index}</div>`;
            resultsDiv.appendChild(resultEl);
            resultEl.addEventListener('click', () => goToSearchResult(i));
        });
        goToSearchResult(0);
        showToast(`تم العثور على ${matches.length} نتيجة`, 'success');
    } else {
        resultsDiv.innerHTML = '<div class="search-result-count">لم يتم العثور على نتائج</div>';
        showToast('لا توجد نتائج', 'warning');
    }
}

function replaceText() {
    const searchText = document.getElementById('searchText')?.value || '';
    const replaceText = document.getElementById('replaceText')?.value || '';
    if (EditorState.searchResults.length === 0) {
        showToast('لا توجد نتائج للاستبدال', 'warning');
        return;
    }
    const idx = EditorState.currentSearchIndex;
    if (idx >= 0 && idx < EditorState.searchResults.length) {
        const result = EditorState.searchResults[idx];
        const content = EditorState.currentFile.content;
        EditorState.currentFile.content = content.substring(0, result.index) + replaceText + content.substring(result.index + result.length);
        EditorState.currentFile.unsaved = true;
        EditorState.isChanged = true;
        updateCurrentFile();
        EditorState.searchResults.splice(idx, 1);
        for (let i = idx; i < EditorState.searchResults.length; i++) {
            EditorState.searchResults[i].index += replaceText.length - result.length;
        }
        if (EditorState.searchResults.length > 0) {
            goToSearchResult(Math.min(idx, EditorState.searchResults.length - 1));
        } else {
            document.getElementById('searchResults').innerHTML = '<div class="search-result-count">تم استبدال جميع النتائج</div>';
        }
        showToast('تم الاستبدال', 'success');
    }
}

function replaceAllText() {
    const searchText = document.getElementById('searchText')?.value || '';
    const replaceText = document.getElementById('replaceText')?.value || '';
    const matchCase = document.getElementById('matchCase')?.checked || false;
    const wholeWord = document.getElementById('wholeWord')?.checked || false;
    if (!EditorState.currentFile) return;
    let regex;
    try {
        if (wholeWord) regex = new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi');
        else regex = new RegExp(searchText, matchCase ? 'g' : 'gi');
    } catch (e) { return; }
    const content = EditorState.currentFile.content;
    const matches = content.match(regex);
    if (matches) {
        EditorState.currentFile.content = content.replace(regex, replaceText);
        EditorState.currentFile.unsaved = true;
        EditorState.isChanged = true;
        updateCurrentFile();
        performSearch(); // إعادة البحث
        showToast(`تم استبدال ${matches.length} نتيجة`, 'success');
    }
}

function prevSearchResult() {
    if (EditorState.searchResults.length === 0) return;
    EditorState.currentSearchIndex = (EditorState.currentSearchIndex - 1 + EditorState.searchResults.length) % EditorState.searchResults.length;
    goToSearchResult(EditorState.currentSearchIndex);
}

function nextSearchResult() {
    if (EditorState.searchResults.length === 0) return;
    EditorState.currentSearchIndex = (EditorState.currentSearchIndex + 1) % EditorState.searchResults.length;
    goToSearchResult(EditorState.currentSearchIndex);
}

function goToSearchResult(index) {
    if (index < 0 || index >= EditorState.searchResults.length) return;
    const result = EditorState.searchResults[index];
    EditorState.currentSearchIndex = index;
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.focus();
        codeInput.setSelectionRange(result.index, result.index + result.length);
        const lineHeight = 24;
        const linesBefore = codeInput.value.substring(0, result.index).split('\n').length;
        codeInput.scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
    }
    document.querySelectorAll('.search-result').forEach((el, i) => {
        if (i === index) el.style.background = 'rgba(59,130,246,0.1)';
        else el.style.background = '';
    });
}

// ===== المظهر =====
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('themeToggle')?.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        if (icon) icon.className = 'fas fa-sun';
        localStorage.setItem('codeEditorTheme', 'light-mode');
        EditorState.theme = 'light-mode';
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        if (icon) icon.className = 'fas fa-moon';
        localStorage.setItem('codeEditorTheme', 'dark-mode');
        EditorState.theme = 'dark-mode';
    }
    showToast(`الوضع ${EditorState.theme === 'dark-mode' ? 'الداكن' : 'الفاتح'}`, 'info');
}

function initTheme() {
    const saved = localStorage.getItem('codeEditorTheme');
    if (saved === 'light-mode') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        EditorState.theme = 'light-mode';
        const icon = document.getElementById('themeToggle')?.querySelector('i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// ===== ملء الشاشة =====
function toggleFullscreen() {
    const el = document.documentElement;
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!fsEl) {
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (req) {
            req.call(el).catch(() => showToast('ملء الشاشة غير مدعوم', 'error'));
            EditorState.isFullscreen = true;
        } else {
            showToast('المتصفح لا يدعم ملء الشاشة', 'warning');
        }
    } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            exit.call(document);
            EditorState.isFullscreen = false;
        }
    }
}

function onFullscreenChange() {
    EditorState.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
document.addEventListener('MSFullscreenChange', onFullscreenChange);

// ===== معاينة =====
function openPreview() {
    if (EditorState.project) {
        localStorage.setItem('previewProject', JSON.stringify(EditorState.project));
        window.open('preview.html', '_blank');
    }
}

// ===== نسخ الكود =====
function copyCodeHandler() {
    if (!EditorState.currentFile) {
        showToast('لا يوجد كود للنسخ', 'error');
        return;
    }
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.select();
        document.execCommand('copy');
        showToast('تم النسخ', 'success');
    }
}

// ===== الجوال =====
function initMobile() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('editorSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const bottomMenu = document.getElementById('bottomMenu');
    const moreBtn = document.getElementById('mobileMoreBtn');
    const dropdown = document.getElementById('mobileDropdown');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
    }
    if (bottomMenu && sidebar) {
        bottomMenu.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar) {
            if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target) && !bottomMenu?.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
    if (moreBtn && dropdown) {
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!moreBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // ربط أزرار الجوال (تم ربطها مسبقاً ولكن للتأكيد)
    // لا حاجة لتكرار الربط هنا لأنها تمت في bindEvents
}

// ===== الخروج =====
function showExitModal() {
    if (EditorState.isChanged) showModal('exitModal');
    else exitToHome();
}
function saveAndExit() {
    saveProject();
    setTimeout(exitToHome, 300);
}
function exitToHome() {
    if (EditorState.autoSaveInterval) clearInterval(EditorState.autoSaveInterval);
    localStorage.removeItem('currentProject');
    window.location.href = 'index.html';
}

// ===== دوال مساعدة =====
function detectLanguage(fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const map = {
        '.html': 'html', '.htm': 'html', '.css': 'css', '.js': 'javascript',
        '.jsx': 'javascript', '.ts': 'typescript', '.py': 'python', '.php': 'php',
        '.java': 'java', '.cpp': 'cpp', '.c': 'c', '.cs': 'csharp', '.rb': 'ruby',
        '.swift': 'swift', '.go': 'go', '.rs': 'rust', '.json': 'json',
        '.xml': 'xml', '.sql': 'sql', '.md': 'markdown', '.txt': 'text'
    };
    return map[ext] || 'unknown';
}

function getFileIcon(type) {
    const icons = {
        html: 'fab fa-html5', css: 'fab fa-css3-alt', javascript: 'fab fa-js-square',
        typescript: 'fas fa-code', python: 'fab fa-python', php: 'fab fa-php',
        java: 'fab fa-java', cpp: 'fas fa-file-code', c: 'fas fa-file-code',
        csharp: 'fas fa-file-code', ruby: 'far fa-gem', swift: 'fas fa-mobile-alt',
        go: 'fas fa-code', rust: 'fas fa-cog', json: 'fas fa-code',
        xml: 'fas fa-code', sql: 'fas fa-database', markdown: 'fas fa-file-alt',
        text: 'fas fa-file-alt', unknown: 'fas fa-file'
    };
    return icons[type] || icons.unknown;
}

function getLanguageName(code) {
    const names = {
        html: 'HTML', css: 'CSS', javascript: 'JavaScript', typescript: 'TypeScript',
        python: 'Python', php: 'PHP', java: 'Java', cpp: 'C++', c: 'C',
        csharp: 'C#', ruby: 'Ruby', swift: 'Swift', go: 'Go', rust: 'Rust',
        json: 'JSON', xml: 'XML', sql: 'SQL', markdown: 'Markdown', text: 'نص عادي'
    };
    return names[code] || 'غير معروف';
}

function getFileTemplate(lang, fileName) {
    const templates = {
        html: `<!DOCTYPE html>\n<html dir="rtl">\n<head>\n    <meta charset="UTF-8">\n    <title>${fileName}</title>\n</head>\n<body>\n    <h1>مرحباً</h1>\n</body>\n</html>`,
        css: `/* ${fileName} */\n* { margin:0; padding:0; box-sizing:border-box; }\nbody { font-family: sans-serif; }`,
        javascript: `// ${fileName}\nconsole.log('Hello from ${fileName}');`,
        default: `// ${fileName}\n`
    };
    return templates[lang] || templates.default;
}

function formatHTML(html) {
    return html.replace(/>\s+</g, '>\n<').split('\n').map((line, i) => '  '.repeat(Math.floor(i / 2)) + line.trim()).join('\n');
}
function formatCSS(css) {
    return css.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*\}\s*/g, '\n}\n\n');
}
function formatJS(js) {
    return js.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*\}\s*/g, '\n}\n\n');
}

function getLineNumber(content, pos) {
    return content.substring(0, pos).split('\n').length;
}
function highlightText(text, search, matchCase) {
    if (!search) return text;
    const regex = new RegExp(search, matchCase ? 'g' : 'gi');
    return text.replace(regex, '<mark>$&</mark>');
}
function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

// ===== إدارة المودالات =====
function showModal(id) {
    hideAllModals();
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
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

// كشف جهاز اللمس
if ('ontouchstart' in window) {
    document.body.classList.add('touch');
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', () => btn.style.transform = 'scale(0.95)');
        btn.addEventListener('touchend', () => setTimeout(() => btn.style.transform = '', 150));
    });
}