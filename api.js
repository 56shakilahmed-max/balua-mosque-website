// Google Sheets Configuration
const GOOGLE_SHEETS = {
    // REPLACE THESE WITH YOUR GOOGLE SHEET IDs
    PRAYER_TIMES: 'YOUR_PRAYER_SHEET_ID',
    DONATIONS: 'YOUR_DONATION_SHEET_ID',
    NOTICES: 'YOUR_NOTICE_SHEET_ID',
    GALLERY: 'YOUR_GALLERY_SHEET_ID',
    CONTACTS: 'YOUR_CONTACT_SHEET_ID'
};

// Google Apps Script Web App URL (You need to deploy this separately)
const WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// Fallback Data (in case Google Sheet is not available)
const FALLBACK_DATA = {
    prayerTimes: [
        { name: 'ফজর', time: '৪:৩০ AM', iqamah: '৫:০০ AM', icon: 'fas fa-sun' },
        { name: 'যোহর', time: '১২:১৫ PM', iqamah: '১:১৫ PM', icon: 'fas fa-sun' },
        { name: 'আসর', time: '৪:৩০ PM', iqamah: '৫:০০ PM', icon: 'fas fa-sun' },
        { name: 'মাগরিব', time: '৬:১৫ PM', iqamah: '৬:৩০ PM', icon: 'fas fa-moon' },
        { name: 'এশা', time: '৭:৩০ PM', iqamah: '৮:০০ PM', icon: 'fas fa-moon' },
        { name: 'জুমা', time: '১:৩০ PM', iqamah: '২:০০ PM', icon: 'fas fa-users' }
    ],
    donations: [
        { method: 'bKash', number: '০১৭১২-৩৪৫৬৭৮', type: 'পার্সোনাল', qr: 'images/qr-bkash.png' },
        { method: 'Nagad', number: '০১৮১২-৩৪৫৬৭৯', type: 'পার্সোনাল', qr: 'images/qr-nagad.png' }
    ],
    recentDonations: [
        { name: 'মোহাম্মদ আলী', amount: '৫,০০০', method: 'bKash', date: '২০২৪-০৪-০১', purpose: 'নির্মাণ কাজ' },
        { name: 'আব্দুল করিম', amount: '২,০০০', method: 'Nagad', date: '২০২৪-০৩-৩১', purpose: 'বিদ্যুৎ বিল' },
        { name: 'ফাতেমা বেগম', amount: '১,০০০', method: 'bKash', date: '২০২৪-০৩-৩০', purpose: 'ইফতার' }
    ],
    notices: [
        { title: 'রমজান মাসের তাৎপর্য', content: 'রমজান মাসের ফজিলত সম্পর্কে বিশেষ বক্তৃতা', type: 'important', date: '২০২৪-০৪-০১' },
        { title: 'ইফতার পার্টি', content: 'প্রতি শুক্রবার মাগরিবের পর ইফতার পার্টির আয়োজন', type: 'event', date: '২০২৪-০৩-২৯' },
        { title: 'জুমার খুতবা', content: 'এই সপ্তাহের জুমার খুতবার বিষয়: ইসলামে সম্প্রীতি', type: 'general', date: '২০২৪-০৩-২৮' }
    ],
    gallery: [
        { src: 'images/gallery/construction1.jpg', title: 'নির্মাণ কাজ', description: 'মসজিদের নির্মাণ কাজ চলছে', category: 'construction' },
        { src: 'images/gallery/jummah1.jpg', title: 'জুমার নামাজ', description: 'জুমার দিনের কাতার', category: 'jummah' },
        { src: 'images/gallery/iftar1.jpg', title: 'ইফতার', description: 'রমজান মাসে ইফতার পার্টি', category: 'iftar' },
        { src: 'images/gallery/event1.jpg', title: 'মিলাদ মাহফিল', description: 'ঈদে মিলাদুন্নবী মাহফিল', category: 'event' }
    ],
    contacts: {
        address: 'বালুয়া, ইসলামাবাদ, সীতাকুন্ড, চট্টগ্রাম',
        imam: { name: 'মুফতি মুহাম্মদ আব্দুল্লাহ', phone: '০১৮১২-৩৪৫৬৭৮' },
        secretary: { name: 'মোহাম্মদ আলী', phone: '০১৭১১-২২৩৩৪৪' }
    }
};

// Fetch data from Google Sheets
async function fetchFromGoogleSheets(sheetId, range = 'A:Z') {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&tq&gid=0&range=${range}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        return parseSheetData(json);
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return null;
    }
}

// Parse Google Sheets data
function parseSheetData(json) {
    if (!json.table || !json.table.rows) return [];
    
    const rows = json.table.rows;
    const headers = json.table.cols.map(col => col.label);
    
    return rows.map(row => {
        const obj = {};
        row.c.forEach((cell, index) => {
            obj[headers[index]] = cell ? cell.v : '';
        });
        return obj;
    });
}

// Load Prayer Times
async function loadPrayerTimes() {
    let data;
    
    // Try Google Sheets first
    if (GOOGLE_SHEETS.PRAYER_TIMES !== 'YOUR_PRAYER_SHEET_ID') {
        data = await fetchFromGoogleSheets(GOOGLE_SHEETS.PRAYER_TIMES);
    }
    
    // Use fallback if Google Sheets fails
    if (!data || data.length === 0) {
        data = FALLBACK_DATA.prayerTimes;
    }
    
    // Store globally for other functions
    window.prayerTimes = data;
    
    // Update UI
    updatePrayerTimesUI(data);
}

// Update Prayer Times UI
function updatePrayerTimesUI(prayers) {
    const container = document.getElementById('prayer-grid');
    if (!container) return;
    
    container.innerHTML = prayers.map(prayer => `
        <div class="prayer-card">
            <div class="prayer-icon">
                <i class="${prayer.icon || 'fas fa-clock'}"></i>
            </div>
            <h3 class="prayer-name">${prayer.name}</h3>
            <div class="prayer-time">${prayer.time}</div>
            <div class="prayer-iqamah">ইকামত: ${prayer.iqamah || prayer.time}</div>
        </div>
    `).join('');
    
    // Update dates
    updateDates();
}

// Update Dates
function updateDates() {
    const now = new Date();
    
    // English Date
    document.getElementById('english-date').textContent = 
        now.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }) + ' ইংরেজি';
    
    // You can add Hijri and Bangla date calculations here
    // For now, using placeholders
    document.getElementById('hijri-date').textContent = '২০ রমজান ১৪৪৫ হিজরি';
    document.getElementById('bangla-date').textContent = '৫ বৈশাখ ১৪৩১ বঙ্গাব্দ';
}

// Load Donation Methods
async function loadDonationMethods() {
    let data;
    
    if (GOOGLE_SHEETS.DONATIONS !== 'YOUR_DONATION_SHEET_ID') {
        data = await fetchFromGoogleSheets(GOOGLE_SHEETS.DONATIONS);
    }
    
    if (!data || data.length === 0) {
        data = FALLBACK_DATA.donations;
    }
    
    updateDonationMethodsUI(data);
    loadRecentDonations();
}

function updateDonationMethodsUI(methods) {
    const container = document.querySelector('.donation-methods');
    if (!container) return;
    
    container.innerHTML = methods.map(method => `
        <div class="donation-method">
            <div class="method-header">
                <i class="fas fa-${method.method === 'bKash' ? 'mobile-alt' : 'wallet'}"></i>
                <h3>${method.method}</h3>
            </div>
            <div class="method-details">
                <p><strong>নম্বর:</strong> ${method.number}</p>
                <p><strong>টাইপ:</strong> ${method.type}</p>
                <div class="qr-code">
                    <img src="${method.qr}" alt="${method.method} QR Code" class="qr-img">
                </div>
                <button class="btn-copy" data-number="${method.number.replace(/[^\d]/g, '')}">
                    <i class="fas fa-copy"></i> নম্বর কপি করুন
                </button>
            </div>
        </div>
    `).join('');
}

// Load Recent Donations
async function loadRecentDonations() {
    // This would fetch from your donation tracking sheet
    const donations = FALLBACK_DATA.recentDonations;
    
    const container = document.getElementById('donation-list');
    if (!container) return;
    
    container.innerHTML = donations.map(donation => `
        <div class="donation-item">
            <div class="donation-info">
                <strong>${donation.name}</strong>
                <small>${donation.date} • ${donation.purpose}</small>
            </div>
            <div class="donation-amount">
                <strong>${donation.amount} টাকা</strong>
                <small>${donation.method}</small>
            </div>
        </div>
    `).join('');
}

// Load Notices
async function loadNotices() {
    let data;
    
    if (GOOGLE_SHEETS.NOTICES !== 'YOUR_NOTICE_SHEET_ID') {
        data = await fetchFromGoogleSheets(GOOGLE_SHEETS.NOTICES);
    }
    
    if (!data || data.length === 0) {
        data = FALLBACK_DATA.notices;
    }
    
    updateNoticesUI(data);
}

function updateNoticesUI(notices) {
    const container = document.getElementById('notice-board');
    if (!container) return;
    
    container.innerHTML = notices.map(notice => `
        <div class="notice-item" data-type="${notice.type}">
            <div class="notice-header">
                <h3>${notice.title}</h3>
                <span class="notice-date">${notice.date}</span>
            </div>
            <div class="notice-content">
                <p>${notice.content}</p>
            </div>
            <div class="notice-type">${notice.type === 'important' ? 'জরুরী' : 
                                    notice.type === 'event' ? 'ইভেন্ট' : 'সাধারণ'}</div>
        </div>
    `).join('');
}

// Load Gallery
async function loadGallery() {
    let data;
    
    if (GOOGLE_SHEETS.GALLERY !== 'YOUR_GALLERY_SHEET_ID') {
        data = await fetchFromGoogleSheets(GOOGLE_SHEETS.GALLERY);
    }
    
    if (!data || data.length === 0) {
        data = FALLBACK_DATA.gallery;
    }
    
    updateGalleryUI(data);
}

function updateGalleryUI(images) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    
    container.innerHTML = images.map(img => `
        <div class="gallery-item" data-category="${img.category}">
            <img src="${img.src}" 
                 alt="${img.title}"
                 class="gallery-img"
                 data-full="${img.src}"
                 data-title="${img.title}"
                 data-description="${img.description}">
            <div class="gallery-overlay">
                <h4>${img.title}</h4>
                <p>${img.description}</p>
            </div>
        </div>
    `).join('');
}

// Load Contact Info
async function loadContactInfo() {
    // For now using fallback data
    const contacts = FALLBACK_DATA.contacts;
    
    document.getElementById('mosque-address').textContent = contacts.address;
    document.getElementById('imam-name').textContent = contacts.imam.name;
    document.getElementById('imam-phone').textContent = contacts.imam.phone;
    document.getElementById('secretary-name').textContent = contacts.secretary.name;
    document.getElementById('secretary-phone').textContent = contacts.secretary.phone;
}

// Update Last Update Time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('bn-BD', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('last-update').textContent = timeString;
}

// Initialize all data loading
async function initializeData() {
    console.log('Loading data from Google Sheets...');
    
    // Show loading state
    document.querySelector('.loader p').textContent = 'গুগল শীট থেকে ডেটা লোড হচ্ছে...';
    
    try {
        // Load all data in parallel
        await Promise.all([
            loadPrayerTimes(),
            loadDonationMethods(),
            loadNotices(),
            loadGallery(),
            loadContactInfo()
        ]);
        
        // Update UI
        updateLastUpdateTime();
        
        // Hide loader
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none';
        }, 500);
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('.loader p').textContent = 'ফলব্যাক ডেটা ব্যবহার করা হচ্ছে...';
        
        // Use fallback data
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none';
        }, 1000);
    }
}

// Make functions available globally
window.loadPrayerTimes = loadPrayerTimes;
window.initializeData = initializeData;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeData);