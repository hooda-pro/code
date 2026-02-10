// ===== معاينة الموقع =====
// تم التطوير بواسطة: أحمد التميمي

// دالة لإنشاء محتوى المعاينة
function createPreviewContent(project) {
    if (!project || !project.files) {
        return createSimplePreview();
    }
    
    // البحث عن ملف HTML
    let htmlContent = '';
    let htmlFileFound = false;
    
    // محاولة العثور على ملف HTML
    Object.keys(project.files).forEach(fileName => {
        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
            htmlContent = project.files[fileName];
            htmlFileFound = true;
        }
    });
    
    // إذا لم يتم العثور على ملف HTML، إنشاء واحد
    if (!htmlFileFound) {
        return createSimplePreview(project);
    }
    
    // دمج ملفات CSS
    Object.keys(project.files).forEach(fileName => {
        if (fileName.endsWith('.css')) {
            const cssContent = project.files[fileName];
            const styleTag = `<style>\n${cssContent}\n</style>`;
            htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
        }
    });
    
    // دمج ملفات JavaScript
    Object.keys(project.files).forEach(fileName => {
        if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
            const jsContent = project.files[fileName];
            const scriptTag = `<script>\n${jsContent}\n<\/script>`;
            htmlContent = htmlContent.replace('</body>', `${scriptTag}\n</body>`);
        }
    });
    
    // إضافة مكتبات إذا لم تكن موجودة
    if (!htmlContent.includes('font-awesome')) {
        const fontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">';
        htmlContent = htmlContent.replace('</head>', `${fontAwesome}\n</head>`);
    }
    
    if (!htmlContent.includes('fonts.googleapis.com')) {
        const googleFonts = '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">';
        htmlContent = htmlContent.replace('</head>', `${googleFonts}\n</head>`);
    }
    
    return htmlContent;
}

// دالة لإنشاء معاينة بسيطة
function createSimplePreview(project) {
    const projectName = project?.name || 'مشروع جديد';
    const files = project?.files || {};
    
    let filesList = '';
    Object.keys(files).forEach(fileName => {
        const fileType = project.fileTypes?.[fileName] || detectFileType(fileName);
        const icon = getFileIcon(fileType);
        filesList += `
            <div class="file-item">
                <i class="${icon}"></i>
                <span>${fileName}</span>
                <small>${fileType}</small>
            </div>
        `;
    });
    
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
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
            background: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
        }
        
        .container {
            max-width: 800px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            margin: 20px;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        h1 i {
            font-size: 2.5rem;
        }
        
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 30px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .file-list {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 30px 0;
            text-align: right;
        }
        
        .file-list h3 {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .file-item {
            padding: 10px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s ease;
        }
        
        .file-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .file-item:last-child {
            border-bottom: none;
        }
        
        .file-item i {
            width: 20px;
            text-align: center;
        }
        
        .file-item span {
            flex: 1;
            text-align: right;
        }
        
        .file-item small {
            margin-right: auto;
            opacity: 0.7;
            font-size: 0.8rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .info-box {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            text-align: right;
        }
        
        .info-box p {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: flex-end;
        }
        
        footer {
            margin-top: 40px;
            font-size: 0.9rem;
            opacity: 0.8;
            text-align: center;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .stat {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            min-width: 150px;
        }
        
        .stat i {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .stats {
                flex-direction: column;
                align-items: center;
            }
            
            .stat {
                width: 100%;
                max-width: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>
            <i class="fas fa-code"></i>
            ${projectName}
        </h1>
        
        <p class="subtitle">
            تم إنشاء هذا المشروع باستخدام محرر الأكواد الذكي
        </p>
        
        <div class="stats">
            <div class="stat">
                <i class="fas fa-file"></i>
                <div>${Object.keys(files).length} ملف</div>
            </div>
            <div class="stat">
                <i class="fas fa-calendar"></i>
                <div>${project ? new Date(project.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}</div>
            </div>
            <div class="stat">
                <i class="fas fa-user"></i>
                <div>أحمد التميمي</div>
            </div>
        </div>
        
        <div class="file-list">
            <h3>
                <i class="fas fa-folder-open"></i>
                ملفات المشروع
            </h3>
            ${filesList || '<p style="text-align: center; opacity: 0.7;">لا توجد ملفات بعد</p>'}
        </div>
        
        <div class="info-box">
            <p>
                <i class="fas fa-info-circle"></i>
                لرؤية معاينة كاملة للمشروع، أنشئ ملف index.html
            </p>
            <p>
                <i class="fas fa-lightbulb"></i>
                يمكنك إضافة ملفات HTML, CSS, JavaScript لتطوير موقعك
            </p>
        </div>
    </div>
    
    <footer>
        <p>تم التطوير باستخدام محرر الأكواد الذكي</p>
        <p>المطور: أحمد التميمي</p>
        <p>© 2024 جميع الحقوق محفوظة</p>
    </footer>
</body>
</html>`;
}

// دالة مساعدة لاكتشاف نوع الملف
function detectFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        'html': 'HTML',
        'htm': 'HTML',
        'css': 'CSS',
        'js': 'JavaScript',
        'jsx': 'JavaScript',
        'ts': 'TypeScript',
        'tsx': 'TypeScript',
        'php': 'PHP',
        'py': 'Python',
        'java': 'Java',
        'cpp': 'C++',
        'c': 'C',
        'cs': 'C#',
        'rb': 'Ruby',
        'go': 'Go',
        'rs': 'Rust',
        'json': 'JSON',
        'xml': 'XML',
        'md': 'Markdown',
        'txt': 'نص عادي'
    };
    return typeMap[extension] || 'غير معروف';
}

// دالة مساعدة للحصول على أيقونة الملف
function getFileIcon(fileType) {
    const icons = {
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'JavaScript': 'fab fa-js-square',
        'TypeScript': 'fas fa-code',
        'PHP': 'fab fa-php',
        'Python': 'fab fa-python',
        'Java': 'fab fa-java',
        'C++': 'fas fa-file-code',
        'C': 'fas fa-file-code',
        'C#': 'fas fa-file-code',
        'Ruby': 'fas fa-gem',
        'Go': 'fas fa-code',
        'Rust': 'fas fa-cog',
        'JSON': 'fas fa-code',
        'XML': 'fas fa-code',
        'Markdown': 'fas fa-file-alt',
        'نص عادي': 'fas fa-file-alt',
        'غير معروف': 'fas fa-file'
    };
    return icons[fileType] || icons['غير معروف'];
}

// تهيئة المعاينة عند تحميل الصفحة
if (document.getElementById('previewFrame')) {
    console.log('تهيئة المعاينة...');
    
    // تحميل المشروع من localStorage إذا كان موجوداً
    try {
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
            const project = JSON.parse(savedProject);
            const previewContent = createPreviewContent(project);
            document.getElementById('previewFrame').srcdoc = previewContent;
        }
    } catch (error) {
        console.error('خطأ في تحميل المعاينة:', error);
    }
}