// ===== وظائف إضافية للصفحة الرئيسية =====
// تم التطوير بواسطة: أحمد التميمي

// تحسينات اللمس للهواتف
if ('ontouchstart' in window) {
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - (window.lastTouchEnd || 0) <= 300) e.preventDefault();
        window.lastTouchEnd = now;
    }, false);
    
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', function() { this.style.transform = 'scale(0.95)'; });
        btn.addEventListener('touchend', function() { setTimeout(() => this.style.transform = '', 150); });
    });
}

// حفظ آخر زيارة
try {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date();
    if (lastVisit) {
        const diffDays = Math.floor((now - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) console.log('مرحباً بعودتك! لقد زرتَ اليوم.');
        else if (diffDays === 1) console.log('مرحباً بعودتك! لقد زرتَ بالأمس.');
        else console.log(`مرحباً بعودتك! آخر زيارة كانت منذ ${diffDays} أيام.`);
    }
    localStorage.setItem('lastVisit', now.toISOString());
} catch (e) {}

// اختصارات لوحة المفاتيح
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        document.getElementById('sideMenu')?.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
});

// إضافة تأثيرات CSS للرسائل
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
    @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
`;
document.head.appendChild(style);