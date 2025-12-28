// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const loader = document.querySelector('.loader');
const modal = document.getElementById('imageModal');
const closeModal = document.querySelector('.close-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const successToast = document.getElementById('successToast');
const refreshBtn = document.getElementById('refresh-prayer');

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Show Toast Message
function showToast(message) {
    successToast.querySelector('span').textContent = message;
    successToast.style.display = 'flex';
    setTimeout(() => {
        successToast.style.display = 'none';
    }, 3000);
}

// Copy to Clipboard
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-copy')) {
        const number = e.target.dataset.number;
        navigator.clipboard.writeText(number).then(() => {
            showToast('নম্বর কপি করা হয়েছে!');
        });
    }
});

// Gallery Filter
document.querySelectorAll('.btn-gallery').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.btn-gallery').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const category = button.dataset.category;
        filterGallery(category);
    });
});

// Notice Filter
document.querySelectorAll('.btn-notice').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.btn-notice').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const type = button.dataset.type;
        filterNotices(type);
    });
});

function filterGallery(category) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterNotices(type) {
    const noticeItems = document.querySelectorAll('.notice-item');
    noticeItems.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Modal for Gallery Images
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('gallery-img')) {
        const img = e.target;
        modalImage.src = img.dataset.full;
        modalTitle.textContent = img.dataset.title;
        modalDescription.textContent = img.dataset.description;
        modal.style.display = 'flex';
    }
});

// Close Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Contact Form Submission
const contactForm = document.getElementById('message-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would send to Google Sheets via API
        showToast('বার্তা পাঠানো হয়েছে!');
        contactForm.reset();
    });
}

// Set Current Year in Footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Prayer Time Countdown
function updatePrayerCountdown() {
    const prayerTimes = window.prayerTimes || {};
    const now = new Date();
    
    // Find current and next prayer
    let currentPrayer = null;
    let nextPrayer = null;
    
    if (prayerTimes.fajr) {
        // Your logic here to determine current/next prayer
        // This is simplified - you'll need to implement based on your time data
    }
    
    if (currentPrayer) {
        document.getElementById('current-prayer-name').textContent = currentPrayer.name;
        document.getElementById('current-prayer-time').textContent = currentPrayer.time;
    }
    
    if (nextPrayer) {
        document.getElementById('next-prayer-name').textContent = nextPrayer.name;
        // Calculate countdown
        const nextTime = new Date();
        // Set next prayer time
        const diff = nextTime - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        document.getElementById('next-prayer-countdown').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Refresh Prayer Times
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        if (window.loadPrayerTimes) {
            window.loadPrayerTimes();
            showToast('নামাজের সময় রিফ্রেশ করা হয়েছে!');
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after 1 second
    setTimeout(() => {
        loader.style.display = 'none';
    }, 1000);
    
    // Initial countdown update
    updatePrayerCountdown();
    setInterval(updatePrayerCountdown, 1000);
});