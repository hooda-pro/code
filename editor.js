// ===== محرر الأكواد الذكي =====
// تم التطوير بواسطة: محمود احمد سعيد
// جميع الحقوق محفوظة © 2024

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 محرر الأكواد - بدء التحميل');
    window.editorState = {
        currentProject: null,
        files: [],
        currentFile: null,
        isChanged: false,
        isFullscreen: false,
        theme: 'dark-mode',
        autoSaveInterval: null,
        searchResults: [],
        currentSearchIndex: -1
    };
    loadProject();
});

function loadProject() {
    try {
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
            window.editorState.currentProject = JSON.parse(savedProject);
            if (window.editorState.currentProject.files) {
                Object.keys(window.editorState.currentProject.files).forEach(fileName => {
                    const fileType = window.editorState.currentProject.fileTypes[fileName] || detectLanguage(fileName);
                    window.editorState.files.push({
                        name: fileName,
                        content: window.editorState.currentProject.files[fileName],
                        type: fileType,
                        active: false,
                        unsaved: false
                    });
                });
            }
            if (window.editorState.files.length > 0) {
                window.editorState.files[0].active = true;
                window.editorState.currentFile = window.editorState.files[0];
            }
            initEditor();
        } else {
            showToast('لا يوجد مشروع محمل', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    } catch (error) {
        console.error('خطأ في تحميل المشروع:', error);
        showToast('حدث خطأ في تحميل المشروع', 'error');
    }
}

function initEditor() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('editorContainer').style.display = 'block';
            initEditorComponents();
            updateEditorUI();
            startAutoSave();
            showToast(`مرحباً بك في مشروع ${window.editorState.currentProject.name}`, 'success');
        }, 500);
    }, 1000);
}

function initEditorComponents() {
    document.getElementById('projectName').textContent = window.editorState.currentProject.name;
    initButtons();
    initModals();
    initCodeEditor();
    initKeyboardShortcuts();
    initSidebar();
    loadTheme();
    initMobileControls();
    console.log('✅ المحرر جاهز للاستخدام');
}

function initButtons() {
    document.getElementById('backBtn').addEventListener('click', showExitModal);
    document.getElementById('backToHome').addEventListener('click', showExitModal);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // زر المعاينة – يفتح صفحة منفصلة
    document.getElementById('previewBtn').addEventListener('click', openPreviewInNewTab);
    
    document.getElementById('saveBtn').addEventListener('click', saveProject);
    document.getElementById('downloadBtn').addEventListener('click', downloadProject);
    document.getElementById('addFileBtn').addEventListener('click', () => showModal('newFileModal'));
    document.getElementById('addFileFromManager').addEventListener('click', () => { hideAllModals(); showModal('newFileModal'); });
    document.getElementById('createFileBtn').addEventListener('click', createNewFile);
    document.getElementById('refreshFiles').addEventListener('click', updateEditorUI);
    document.getElementById('formatBtn').addEventListener('click', formatCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    document.getElementById('searchBtn').addEventListener('click', () => showModal('searchModal'));
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('copyCode').addEventListener('click', copyCode);
    document.getElementById('fileManagerBtn').addEventListener('click', showFileManager);
    
    document.getElementById('searchActionBtn').addEventListener('click', performSearch);
    document.getElementById('prevResult').addEventListener('click', prevSearchResult);
    document.getElementById('nextResult').addEventListener('click', nextSearchResult);
    document.getElementById('replaceBtn').addEventListener('click', replaceText);
    document.getElementById('replaceAllBtn').addEventListener('click', replaceAllText);
    
    document.getElementById('exitWithoutSave').addEventListener('click', exitToHome);
    document.getElementById('saveAndExit').addEventListener('click', saveAndExit);
}

// ===== فتح المعاينة في تبويب جديد =====
function openPreviewInNewTab() {
    // حفظ المشروع الحالي في localStorage لصفحة المعاينة
    localStorage.setItem('previewProject', JSON.stringify(window.editorState.currentProject));
    // فتح preview.html في نافذة جديدة
    window.open('preview.html', '_blank');
}

function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', hideAllModals));
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) { if (e.target === this) hideAllModals(); });
    });
    const newFileForm = document.getElementById('newFileForm');
    if (newFileForm) newFileForm.addEventListener('submit', e => { e.preventDefault(); createNewFile(); });
    const searchForm = document.getElementById('searchForm');
    if (searchForm) searchForm.addEventListener('submit', e => { e.preventDefault(); performSearch(); });
}

function initCodeEditor() {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');
    if (!codeInput || !languageSelect) return;
    
    codeInput.addEventListener('input', function() {
        if (window.editorState.currentFile) {
            window.editorState.currentFile.content = this.value;
            window.editorState.currentFile.unsaved = true;
            window.editorState.isChanged = true;
            updateProjectStatus('توجد تغييرات غير محفوظة');
            updateLineNumbers();
            updateEditorStats();
        }
    });
    codeInput.addEventListener('scroll', updateLineNumbers);
    codeInput.addEventListener('keyup', updateCursorPosition);
    codeInput.addEventListener('click', updateCursorPosition);
    
    codeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart, end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 2;
            if (window.editorState.currentFile) {
                window.editorState.currentFile.content = this.value;
                window.editorState.currentFile.unsaved = true;
                window.editorState.isChanged = true;
            }
        }
    });
    
    languageSelect.addEventListener('change', function() {
        if (window.editorState.currentFile) {
            window.editorState.currentFile.type = this.value;
            updateEditorUI();
            updateProjectStatus('تم تغيير لغة الملف');
        }
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); showModal('searchModal'); document.getElementById('searchText').focus(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); showModal('newFileModal'); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); openPreviewInNewTab(); }
        if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
        if (e.key === 'Escape') { if (document.querySelector('.modal.active')) hideAllModals(); }
        if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); formatCode(); }
    });
}

function initSidebar() {
    updateProjectDetails();
    const fileSearch = document.getElementById('fileSearch');
    if (fileSearch) fileSearch.addEventListener('input', function() { filterFiles(this.value); });
}

// ===== وظائف الجوال =====
function initMobileControls() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('editorSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const bottomMenu = document.getElementById('bottomMenu');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
    }
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !bottomMenu?.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    const moreBtn = document.getElementById('mobileMoreBtn');
    const dropdown = document.getElementById('mobileDropdown');
    if (moreBtn && dropdown) {
        moreBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); });
        document.addEventListener('click', (e) => {
            if (!moreBtn.contains(e.target) && !dropdown.contains(e.target)) dropdown.classList.remove('show');
        });
    }

    document.getElementById('mobileAddFile')?.addEventListener('click', () => { showModal('newFileModal'); dropdown?.classList.remove('show'); });
    document.getElementById('mobileDownload')?.addEventListener('click', () => { downloadProject(); dropdown?.classList.remove('show'); });
    document.getElementById('mobileFormat')?.addEventListener('click', () => { formatCode(); dropdown?.classList.remove('show'); });
    document.getElementById('mobileFullscreen')?.addEventListener('click', () => { toggleFullscreen(); dropdown?.classList.remove('show'); });

    document.getElementById('bottomSave')?.addEventListener('click', saveProject);
    document.getElementById('bottomPreview')?.addEventListener('click', openPreviewInNewTab);
    document.getElementById('bottomNewFile')?.addEventListener('click', () => showModal('newFileModal'));
    document.getElementById('bottomMenu')?.addEventListener('click', () => sidebar.classList.toggle('active'));

    if (window.innerWidth <= 768) {
        document.querySelectorAll('.modal-content').forEach(modal => {
            modal.addEventListener('touchmove', (e) => e.stopPropagation());
        });
    }
}

// ===== تحديثات واجهة المستخدم =====
function updateEditorUI() {
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
                <button class="file-action-btn close-file" title="إغلاق الملف"><i class="fas fa-times"></i></button>
            </div>
        `;
        filesList.appendChild(fileItem);
        fileItem.addEventListener('click', function(e) {
            if (!e.target.closest('.file-actions')) {
                switchToFile(parseInt(this.dataset.index));
            }
        });
        fileItem.querySelector('.close-file').addEventListener('click', function(e) {
            e.stopPropagation();
            closeFile(parseInt(fileItem.dataset.index));
        });
    });
}

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
            tab.addEventListener('click', function(e) {
                if (!e.target.classList.contains('tab-close')) {
                    switchToFile(parseInt(this.dataset.index));
                }
            });
            tab.querySelector('.tab-close').addEventListener('click', function(e) {
                e.stopPropagation();
                closeFile(parseInt(tab.dataset.index));
            });
        }
    });
}

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
    if (codeInput) codeInput.value = window.editorState.currentFile.content;
    if (currentFileName) currentFileName.textContent = window.editorState.currentFile.name;
    if (languageSelect) languageSelect.value = window.editorState.currentFile.type;
    document.getElementById('currentLanguage').textContent = getLanguageName(window.editorState.currentFile.type);
}

function updateProjectDetails() {
    const details = document.getElementById('projectDetails');
    if (!details || !window.editorState.currentProject) return;
    const date = new Date(window.editorState.currentProject.updatedAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
    const fileCount = window.editorState.files.length;
    const activeCount = window.editorState.files.filter(f => f.active).length;
    details.innerHTML = `
        <div class="project-detail"><span class="detail-label">النوع:</span><span class="detail-value">${window.editorState.currentProject.type || 'موقع ويب'}</span></div>
        <div class="project-detail"><span class="detail-label">الملفات:</span><span class="detail-value">${fileCount} (${activeCount} مفتوح)</span></div>
        <div class="project-detail"><span class="detail-label">آخر تعديل:</span><span class="detail-value">${date}</span></div>
        <div class="project-detail"><span class="detail-label">الحالة:</span><span class="detail-value" id="projectStatusText">جاهز</span></div>
    `;
}

function updateLineNumbers() {
    const lineNumbers = document.getElementById('lineNumbers');
    const codeInput = document.getElementById('codeInput');
    if (!lineNumbers || !codeInput) return;
    const lines = codeInput.value.split('\n').length;
    const scrollTop = codeInput.scrollTop;
    lineNumbers.innerHTML = '';
    lineNumbers.style.transform = `translateY(${scrollTop}px)`;
    for (let i = 1; i <= lines; i++) {
        const line = document.createElement('div');
        line.className = 'line-number';
        line.textContent = i;
        lineNumbers.appendChild(line);
    }
}

function updateEditorStats() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    const content = codeInput.value;
    const lines = content.split('\n').length;
    const chars = content.length;
    document.getElementById('lineCount').textContent = `${lines} أسطر`;
    document.getElementById('charCount').textContent = `${chars} أحرف`;
}

function updateCursorPosition() {
    const codeInput = document.getElementById('codeInput');
    if (!codeInput) return;
    const content = codeInput.value;
    const pos = codeInput.selectionStart;
    const before = content.substring(0, pos);
    const line = before.split('\n').length;
    const col = before.split('\n').pop().length + 1;
    document.getElementById('cursorPos').textContent = `السطر: ${line}، العمود: ${col}`;
}

// ===== إدارة الملفات =====
function switchToFile(index) {
    if (window.editorState.files[index]) {
        window.editorState.files.forEach(f => f.active = false);
        window.editorState.files[index].active = true;
        window.editorState.currentFile = window.editorState.files[index];
        updateEditorUI();
    }
}

function closeFile(index) {
    if (window.editorState.files[index]) {
        const file = window.editorState.files[index];
        if (file.unsaved && !confirm(`الملف "${file.name}" يحتوي على تغييرات غير محفوظة. هل تريد إغلاقه دون حفظ؟`)) return;
        if (file === window.editorState.currentFile) {
            const other = window.editorState.files.find((f,i) => f.active && i!==index);
            if (other) switchToFile(window.editorState.files.indexOf(other));
            else if (window.editorState.files.length > 1) switchToFile(index===0?1:0);
            else window.editorState.currentFile = null;
        }
        window.editorState.files.splice(index,1);
        updateEditorUI();
        showToast(`تم إغلاق الملف "${file.name}"`, 'info');
    }
}

function createNewFile() {
    const fileNameInput = document.getElementById('fileName');
    const fileLangSelect = document.getElementById('fileLanguage');
    const fileContentText = document.getElementById('fileContent');
    const fileName = fileNameInput.value.trim();
    if (!fileName) { showToast('يرجى إدخال اسم الملف', 'error'); fileNameInput.focus(); return; }
    if (!fileName.includes('.')) { showToast('يرجى إضافة امتداد للملف', 'error'); fileNameInput.focus(); return; }
    if (window.editorState.files.some(f => f.name === fileName)) { showToast(`يوجد ملف باسم "${fileName}" بالفعل`, 'error'); fileNameInput.focus(); return; }
    
    let detected = detectLanguage(fileName);
    if (detected === 'unknown') detected = fileLangSelect.value;
    const newFile = {
        name: fileName,
        content: fileContentText.value || getFileTemplate(detected, fileName),
        type: detected,
        active: true,
        unsaved: true
    };
    window.editorState.files.forEach(f => f.active = false);
    window.editorState.files.push(newFile);
    const newIndex = window.editorState.files.length-1;
    window.editorState.currentFile = window.editorState.files[newIndex];
    hideAllModals();
    fileNameInput.value = '';
    fileContentText.value = '';
    updateEditorUI();
    showToast(`تم إنشاء الملف "${fileName}"`, 'success');
    window.editorState.isChanged = true;
    updateProjectStatus('تم إنشاء ملف جديد');
}

function filterFiles(searchTerm) {
    const list = document.getElementById('fileManagerList');
    if (!list) return;
    const term = searchTerm.toLowerCase();
    const filtered = window.editorState.files.filter(f => f.name.toLowerCase().includes(term) || f.type.toLowerCase().includes(term));
    list.innerHTML = '';
    if (filtered.length > 0) {
        filtered.forEach((file, idx) => {
            const orig = window.editorState.files.indexOf(file);
            const item = document.createElement('div');
            item.className = 'file-manager-item';
            item.innerHTML = `
                <div class="file-manager-info">
                    <i class="${getFileIcon(file.type)}"></i>
                    <div><div class="file-manager-name">${file.name}</div><div class="file-manager-size">${file.type} • ${file.content.length} حرف</div></div>
                </div>
                <div class="file-manager-actions">
                    <button class="btn btn-sm btn-primary open-manager-file" data-index="${orig}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-manager-file" data-index="${orig}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(item);
            item.querySelector('.open-manager-file').addEventListener('click', function() {
                hideAllModals();
                switchToFile(parseInt(this.dataset.index));
            });
            item.querySelector('.delete-manager-file').addEventListener('click', function() {
                deleteFile(parseInt(this.dataset.index));
                showFileManager();
            });
        });
    } else {
        list.innerHTML = `<div class="empty-state" style="padding:40px 20px; text-align:center;"><i class="fas fa-search" style="font-size:40px; opacity:0.5; margin-bottom:20px;"></i><h3>لا توجد نتائج</h3><p>لم يتم العثور على ملفات تطابق "${searchTerm}"</p></div>`;
    }
}

function deleteFile(index) {
    if (window.editorState.files[index]) {
        const name = window.editorState.files[index].name;
        if (confirm(`هل تريد حذف الملف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            window.editorState.files.splice(index, 1);
            if (!window.editorState.currentFile || window.editorState.files.indexOf(window.editorState.currentFile) === -1) {
                window.editorState.currentFile = window.editorState.files[0] || null;
            }
            updateEditorUI();
            window.editorState.isChanged = true;
            showToast(`تم حذف الملف "${name}"`, 'success');
        }
    }
}

function showFileManager() {
    showModal('fileManagerModal');
    const list = document.getElementById('fileManagerList');
    if (list) filterFiles('');
}

// ===== إدارة المشروع =====
function saveProject() {
    if (!window.editorState.currentProject) return;
    try {
        window.editorState.currentProject.files = {};
        window.editorState.currentProject.fileTypes = {};
        window.editorState.files.forEach(file => {
            window.editorState.currentProject.files[file.name] = file.content;
            window.editorState.currentProject.fileTypes[file.name] = file.type;
            file.unsaved = false;
        });
        window.editorState.currentProject.updatedAt = new Date().toISOString();
        localStorage.setItem('currentProject', JSON.stringify(window.editorState.currentProject));
        updateProjectsList();
        window.editorState.isChanged = false;
        updateProjectStatus('تم الحفظ بنجاح');
        showToast('تم حفظ المشروع بنجاح', 'success');
        document.getElementById('lastSaved').textContent = `آخر حفظ: ${new Date().toLocaleTimeString('ar-EG')}`;
        const saveBtn = document.getElementById('saveBtn');
        const orig = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">تم الحفظ</span>';
        saveBtn.disabled = true;
        setTimeout(() => { saveBtn.innerHTML = orig; saveBtn.disabled = false; }, 1500);
    } catch (error) {
        console.error('خطأ في حفظ المشروع:', error);
        showToast('حدث خطأ في حفظ المشروع', 'error');
    }
}

function startAutoSave() {
    if (window.editorState.autoSaveInterval) clearInterval(window.editorState.autoSaveInterval);
    window.editorState.autoSaveInterval = setInterval(() => {
        if (window.editorState.isChanged) saveProject();
    }, 30000);
}

function updateProjectsList() {
    try {
        const saved = localStorage.getItem('codeEditorProjects');
        if (saved) {
            let projects = JSON.parse(saved);
            const idx = projects.findIndex(p => p.id === window.editorState.currentProject.id);
            if (idx !== -1) projects[idx] = window.editorState.currentProject;
            else projects.unshift(window.editorState.currentProject);
            localStorage.setItem('codeEditorProjects', JSON.stringify(projects));
        }
    } catch (e) { console.error('خطأ في تحديث قائمة المشاريع:', e); }
}

function updateProjectStatus(status) {
    const el = document.getElementById('projectStatusText');
    if (el) {
        el.textContent = status;
        el.style.animation = 'none';
        setTimeout(() => el.style.animation = 'fadeIn 0.5s ease', 10);
    }
}

// ===== التحميل =====
function downloadProject() {
    if (!window.editorState.currentProject) return;
    saveProject();
    if (typeof JSZip !== 'undefined') createZipFile(window.editorState.currentProject);
    else {
        showToast('جاري تحميل مكتبة الضغط...', 'warning');
        setTimeout(() => {
            if (typeof JSZip !== 'undefined') createZipFile(window.editorState.currentProject);
            else showToast('تعذر تحميل مكتبة الضغط', 'error');
        }, 1000);
    }
}

function createZipFile(project) {
    const zip = new JSZip();
    Object.keys(project.files).forEach(fn => zip.file(fn, project.files[fn]));
    zip.file("project-info.json", JSON.stringify({
        projectName: project.name, projectType: project.type,
        description: project.description, created: project.createdAt,
        modified: project.updatedAt, files: Object.keys(project.files),
        fileTypes: project.fileTypes, developer: "محمود احمد سعيد"
    }, null, 2));
    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${project.name.replace(/[^a-z0-9\u0600-\u06FF]/gi, '_')}_${Date.now()}.zip`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        showToast('تم تحميل المشروع بنجاح', 'success');
    }).catch(err => { console.error(err); showToast('حدث خطأ في التحميل', 'error'); });
}

// ===== الأدوات =====
function formatCode() {
    if (!window.editorState.currentFile) { showToast('لا يوجد ملف نشط للتنسيق', 'error'); return; }
    let content = window.editorState.currentFile.content;
    switch(window.editorState.currentFile.type) {
        case 'html': content = formatHTML(content); break;
        case 'css': content = formatCSS(content); break;
        case 'javascript': content = formatJS(content); break;
        default: showToast('لا يوجد تنسيق خاص لهذه اللغة', 'info'); return;
    }
    window.editorState.currentFile.content = content;
    window.editorState.currentFile.unsaved = true;
    window.editorState.isChanged = true;
    updateCurrentFile();
    showToast('تم تنسيق الكود', 'success');
}

function clearCode() {
    if (!window.editorState.currentFile) { showToast('لا يوجد ملف نشط للمسح', 'error'); return; }
    if (confirm('هل تريد مسح محتوى الملف الحالي؟')) {
        window.editorState.currentFile.content = '';
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        updateCurrentFile();
        showToast('تم مسح محتوى الملف', 'success');
    }
}

function performSearch() {
    const searchText = document.getElementById('searchText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    if (!searchText.trim()) { showToast('يرجى إدخال نص للبحث عنه', 'error'); return; }
    if (!window.editorState.currentFile) { showToast('لا يوجد ملف نشط للبحث فيه', 'error'); return; }
    const content = window.editorState.currentFile.content;
    let regex;
    try {
        regex = wholeWord ? new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi') : new RegExp(searchText, matchCase ? 'g' : 'gi');
    } catch(e) { showToast('تعبير البحث غير صحيح', 'error'); return; }
    const matches = content.match(regex);
    const resultsDiv = document.getElementById('searchResults');
    if (matches) {
        window.editorState.searchResults = [];
        window.editorState.currentSearchIndex = 0;
        let m;
        while ((m = regex.exec(content)) !== null) {
            window.editorState.searchResults.push({ index: m.index, length: m[0].length, text: m[0] });
        }
        resultsDiv.innerHTML = `<div class="search-result-count">تم العثور على ${matches.length} نتيجة</div>`;
        const display = window.editorState.searchResults.slice(0, 10);
        display.forEach((res, idx) => {
            const start = Math.max(0, res.index - 30);
            const end = Math.min(content.length, res.index + res.length + 30);
            const context = content.substring(start, end);
            const el = document.createElement('div');
            el.className = 'search-result';
            el.dataset.index = idx;
            el.innerHTML = `<div class="search-result-line">${highlightText(context, searchText, matchCase)}</div>
                <div class="search-result-context">السطر: ${getLineNumber(content, res.index)} • الموضع: ${res.index}</div>`;
            resultsDiv.appendChild(el);
            el.addEventListener('click', function() { goToSearchResult(parseInt(this.dataset.index)); });
        });
        if (window.editorState.searchResults.length > 0) goToSearchResult(0);
        showToast(`تم العثور على ${matches.length} نتيجة`, 'success');
    } else {
        resultsDiv.innerHTML = '<div class="search-result-count">لم يتم العثور على نتائج</div>';
        showToast('لم يتم العثور على نتائج', 'warning');
    }
}

function replaceText() {
    const searchText = document.getElementById('searchText').value;
    const replaceText = document.getElementById('replaceText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    if (!searchText.trim()) { showToast('يرجى إدخال نص للبحث عنه', 'error'); return; }
    if (!window.editorState.currentFile) { showToast('لا يوجد ملف نشط', 'error'); return; }
    if (window.editorState.searchResults.length === 0) { showToast('لا توجد نتائج بحث للاستبدال', 'warning'); return; }
    const idx = window.editorState.currentSearchIndex;
    if (idx >= 0 && idx < window.editorState.searchResults.length) {
        const res = window.editorState.searchResults[idx];
        const content = window.editorState.currentFile.content;
        const before = content.substring(0, res.index);
        const after = content.substring(res.index + res.length);
        window.editorState.currentFile.content = before + replaceText + after;
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        updateCurrentFile();
        window.editorState.searchResults.splice(idx, 1);
        for (let i = idx; i < window.editorState.searchResults.length; i++) {
            window.editorState.searchResults[i].index += replaceText.length - res.length;
        }
        if (window.editorState.searchResults.length > 0) {
            goToSearchResult(Math.min(idx, window.editorState.searchResults.length - 1));
        } else {
            document.getElementById('searchResults').innerHTML = '<div class="search-result-count">تم استبدال جميع النتائج</div>';
        }
        showToast('تم الاستبدال بنجاح', 'success');
    }
}

function replaceAllText() {
    const searchText = document.getElementById('searchText').value;
    const replaceText = document.getElementById('replaceText').value;
    const matchCase = document.getElementById('matchCase').checked;
    const wholeWord = document.getElementById('wholeWord').checked;
    if (!searchText.trim()) { showToast('يرجى إدخال نص للبحث عنه', 'error'); return; }
    if (!window.editorState.currentFile) { showToast('لا يوجد ملف نشط', 'error'); return; }
    let regex;
    try {
        regex = wholeWord ? new RegExp(`\\b${searchText}\\b`, matchCase ? 'g' : 'gi') : new RegExp(searchText, matchCase ? 'g' : 'gi');
    } catch(e) { showToast('تعبير البحث غير صحيح', 'error'); return; }
    const content = window.editorState.currentFile.content;
    const matches = content.match(regex);
    if (matches) {
        window.editorState.currentFile.content = content.replace(regex, replaceText);
        window.editorState.currentFile.unsaved = true;
        window.editorState.isChanged = true;
        updateCurrentFile();
        performSearch();
        showToast(`تم استبدال ${matches.length} نتيجة`, 'success');
    } else { showToast('لم يتم العثور على نص للاستبدال', 'warning'); }
}

function prevSearchResult() {
    if (window.editorState.searchResults.length === 0) return;
    window.editorState.currentSearchIndex = (window.editorState.currentSearchIndex - 1 + window.editorState.searchResults.length) % window.editorState.searchResults.length;
    goToSearchResult(window.editorState.currentSearchIndex);
}
function nextSearchResult() {
    if (window.editorState.searchResults.length === 0) return;
    window.editorState.currentSearchIndex = (window.editorState.currentSearchIndex + 1) % window.editorState.searchResults.length;
    goToSearchResult(window.editorState.currentSearchIndex);
}
function goToSearchResult(index) {
    if (index < 0 || index >= window.editorState.searchResults.length) return;
    const res = window.editorState.searchResults[index];
    window.editorState.currentSearchIndex = index;
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.focus();
        codeInput.setSelectionRange(res.index, res.index + res.length);
        const lineHeight = 24;
        const linesBefore = codeInput.value.substring(0, res.index).split('\n').length;
        codeInput.scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
    }
    document.querySelectorAll('.search-result').forEach((el, i) => {
        if (i === index) { el.style.background = 'rgba(88,166,255,0.1)'; el.style.border = '1px solid rgba(88,166,255,0.3)'; }
        else { el.style.background = ''; el.style.border = '1px solid transparent'; }
    });
}

// ===== الوضع المظلم/الفاتح =====
function toggleTheme() {
    const btn = document.getElementById('themeToggle');
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode'); body.classList.add('light-mode');
        window.editorState.theme = 'light-mode';
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        btn.title = 'تبديل الوضع الفاتح';
    } else {
        body.classList.remove('light-mode'); body.classList.add('dark-mode');
        window.editorState.theme = 'dark-mode';
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.title = 'تبديل الوضع المظلم';
    }
    localStorage.setItem('codeEditorTheme', window.editorState.theme);
    showToast(`تم التبديل إلى الوضع ${window.editorState.theme === 'dark-mode' ? 'المظلم' : 'الفاتح'}`, 'info');
}
function loadTheme() {
    const saved = localStorage.getItem('codeEditorTheme');
    const btn = document.getElementById('themeToggle');
    if (saved) {
        document.body.className = saved;
        window.editorState.theme = saved;
        btn.innerHTML = saved === 'light-mode' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        btn.title = saved === 'light-mode' ? 'تبديل الوضع الفاتح' : 'تبديل الوضع المظلم';
    }
}

// ===== ملء الشاشة =====
function toggleFullscreen() {
    const container = document.getElementById('editorContainer');
    if (!window.editorState.isFullscreen) {
        if (container.requestFullscreen) container.requestFullscreen();
        else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        else if (container.msRequestFullscreen) container.msRequestFullscreen();
        window.editorState.isFullscreen = true;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-compress"></i> خروج من ملء الشاشة';
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        window.editorState.isFullscreen = false;
        document.getElementById('fullscreenBtn').innerHTML = '<i class="fas fa-expand"></i> ملء الشاشة';
    }
}
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
function copyCode() {
    if (!window.editorState.currentFile) { showToast('لا يوجد كود للنسخ', 'error'); return; }
    const codeInput = document.getElementById('codeInput');
    if (codeInput) {
        codeInput.select();
        document.execCommand('copy');
        showToast('تم نسخ الكود إلى الحافظة', 'success');
        const copyBtn = document.getElementById('copyCode');
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = orig, 1500);
    }
}
function detectLanguage(fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const map = { '.html':'html', '.htm':'html', '.css':'css', '.js':'javascript', '.jsx':'javascript', '.ts':'typescript', '.tsx':'typescript', '.py':'python', '.php':'php', '.java':'java', '.cpp':'cpp', '.c':'c', '.cs':'csharp', '.rb':'ruby', '.swift':'swift', '.go':'go', '.rs':'rust', '.json':'json', '.xml':'xml', '.sql':'sql', '.md':'markdown', '.txt':'text' };
    return map[ext] || 'unknown';
}
function getFileIcon(type) {
    const icons = { 'html':'fab fa-html5', 'css':'fab fa-css3-alt', 'javascript':'fab fa-js-square', 'typescript':'fas fa-code', 'python':'fab fa-python', 'php':'fab fa-php', 'java':'fab fa-java', 'cpp':'fas fa-file-code', 'c':'fas fa-file-code', 'csharp':'fas fa-file-code', 'ruby':'far fa-gem', 'swift':'fas fa-mobile-alt', 'go':'fas fa-code', 'rust':'fas fa-cog', 'json':'fas fa-code', 'xml':'fas fa-code', 'sql':'fas fa-database', 'markdown':'fas fa-file-alt', 'text':'fas fa-file-alt', 'unknown':'fas fa-file' };
    return icons[type] || icons.unknown;
}
function getLanguageName(code) {
    const names = { 'html':'HTML', 'css':'CSS', 'javascript':'JavaScript', 'typescript':'TypeScript', 'python':'Python', 'php':'PHP', 'java':'Java', 'cpp':'C++', 'c':'C', 'csharp':'C#', 'ruby':'Ruby', 'swift':'Swift', 'go':'Go', 'rust':'Rust', 'json':'JSON', 'xml':'XML', 'sql':'SQL', 'markdown':'Markdown', 'text':'نص عادي' };
    return names[code] || 'غير معروف';
}
function getFileTemplate(lang, fileName) {
    const templates = {
        'html': `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${fileName.replace('.html','')}</title><link rel="stylesheet" href="style.css"></head><body><h1>مرحباً بك في ${fileName}</h1><script src="script.js"></script></body></html>`,
        'css': `/* أنماط ${fileName} */\n* { margin:0; padding:0; box-sizing:border-box; }\nbody { font-family:'Tajawal', sans-serif; line-height:1.6; color:#333; background:#f8f9fa; }`,
        'javascript': `// ${fileName}\nconsole.log('مرحباً بك في ${fileName}');\ndocument.addEventListener('DOMContentLoaded', function() { console.log('تم تحميل الصفحة'); });`,
        'default': `// ${fileName}\n// تم إنشاء هذا الملف باستخدام محرر الأكواد الذكي`
    };
    return templates[lang] || templates.default;
}
function formatHTML(html) {
    let formatted = html.replace(/>\s+</g, '>\n<').replace(/\s+/g, ' ').replace(/\s\s+/g, ' ');
    let indent = 0;
    const lines = formatted.split('\n');
    const result = [];
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith('</')) indent--;
        result.push('  '.repeat(Math.max(0, indent)) + line);
        if (line.startsWith('<') && !line.startsWith('</') && !line.includes('/>') && !line.match(/<(br|hr|img|meta|link|input)/i)) indent++;
    }
    return result.join('\n');
}
function formatCSS(css) { return css.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*\}\s*/g, '\n}\n\n').replace(/\s*;\s*/g, ';\n  ').replace(/\s*:\s*/g, ': ').replace(/,\s*/g, ', '); }
function formatJS(js) { return js.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*\}\s*/g, '\n}\n\n').replace(/\s*;\s*/g, ';\n  ').replace(/,\s*/g, ', '); }
function getLineNumber(content, pos) { return content.substring(0, pos).split('\n').length; }
function highlightText(text, search, matchCase) {
    if (!search) return text;
    const re = new RegExp(search, matchCase ? 'g' : 'gi');
    return text.replace(re, '<mark>$&</mark>');
}

// ===== الخروج =====
function showExitModal() { if (window.editorState.isChanged) showModal('exitModal'); else exitToHome(); }
function saveAndExit() { saveProject(); setTimeout(exitToHome, 500); }
function exitToHome() {
    if (window.editorState.autoSaveInterval) clearInterval(window.editorState.autoSaveInterval);
    localStorage.removeItem('currentProject');
    window.location.href = 'index.html';
}

// ===== وظائف عامة =====
function showModal(id) {
    hideAllModals();
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = 'auto';
}
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'fas fa-check-circle', error:'fas fa-exclamation-circle', warning:'fas fa-exclamation-triangle', info:'fas fa-info-circle' };
    toast.innerHTML = `<i class="${icons[type]||icons.info}"></i><div class="toast-content">${message}</div><button class="toast-close">&times;</button>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// تحسينات اللمس
if ('ontouchstart' in window) {
    document.body.classList.add('touch');
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', function() { this.style.transform = 'scale(0.95)'; });
        btn.addEventListener('touchend', function() { setTimeout(() => this.style.transform = '', 150); });
    });
}
window.addEventListener('load', () => {
    if (window.innerWidth < 768) document.body.classList.add('mobile');
    else if (window.innerWidth < 1024) document.body.classList.add('tablet');
    else document.body.classList.add('desktop');
});