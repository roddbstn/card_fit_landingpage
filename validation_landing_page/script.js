// Email Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const emailInput = document.getElementById('emailInput');
    const toast = document.getElementById('toast');

    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Basic email validation
        if (!isValidEmail(email)) {
            showToast('올바른 이메일 주소를 입력해주세요.', 'error');
            return;
        }

        // Simulate email submission
        submitEmail(email);
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function submitEmail(email) {
        // In production, this would send to your backend
        console.log('Email submitted:', email);
        
        // Store in localStorage for demo purposes
        const submissions = JSON.parse(localStorage.getItem('emailSubmissions') || '[]');
        submissions.push({
            email: email,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('emailSubmissions', JSON.stringify(submissions));

        // Show success message
        showToast('✓ 가입 신청이 완료되었습니다!', 'success');
        
        // Clear form
        emailInput.value = '';
    }

    function showToast(message, type = 'success') {
        toast.querySelector('p').textContent = message;
        
        if (type === 'error') {
            toast.style.background = '#FF6B6B';
        } else {
            toast.style.background = '#3182F6';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add input focus animation
    emailInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.01)';
    });

    emailInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});
