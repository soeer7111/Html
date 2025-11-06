// videos.js

// 🚨 API Endpoints များကို သင့် Cloudflare Function URL ဖြင့် အစားထိုးပါ
const API_BASE_URL = '/api/auth'; // Cloudflare Pages Function များကို ခေါ်ယူရန်

// =================================================
// 🚨 Authentication Logic (Frontend)
// =================================================

// မျက်နှာပြင်ပြောင်းလဲရန် Function
function showPage(pageId) {
    ['login-page', 'register-page', 'forgot-password-page', 'profile-page', 'home-page'].forEach(id => {
        const page = document.getElementById(id);
        if (page) page.style.display = 'none';
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    if (pageId === 'home-page') {
        initializeVideoPlayer();
    }
    if (pageId === 'profile-page') {
        loadUserProfile();
    }
}

// စာမျက်နှာကို စတင်ချိန်တွင် Login အခြေအနေကို စစ်ဆေးရန်
async function checkLoginState() {
    // 🚨 Worker API ကို ခေါ်ယူပြီး Token ကို စစ်ဆေးပါ
    const token = localStorage.getItem('token');
    if (!token) {
        showPage('login-page');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            showPage('home-page');
        } else {
            // Token သက်တမ်းကုန်/မမှန်ပါက
            handleLogout();
        }
    } catch (error) {
        console.error('Login state check failed:', error);
        handleLogout();
    }
}

// မှတ်ပုံတင်ရန်
async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const msgDiv = document.getElementById('register-message');
    msgDiv.textContent = '';

    if (!username || !password) {
        msgDiv.textContent = 'အသုံးပြုသူအမည်နှင့် လျှို့ဝှက်နံပါတ် ဖြည့်သွင်းပါ။';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("မှတ်ပုံတင်ခြင်း အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ ဝင်ရောက်ပါ။");
            showPage('login-page');
        } else {
            msgDiv.textContent = data.error || 'မှတ်ပုံတင်ရာတွင် အမှားအယွင်းရှိပါသည်။';
        }
    } catch (error) {
        msgDiv.textContent = 'API ခေါ်ဆိုမှု မအောင်မြင်ပါ။';
    }
}

// Login ဝင်ရန်
async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msgDiv = document.getElementById('login-message');
    msgDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user)); // User object ကို သိမ်းမည်
            showPage('home-page');
        } else {
            msgDiv.textContent = data.error || 'Login မအောင်မြင်ပါ။';
        }
    } catch (error) {
        msgDiv.textContent = 'API ခေါ်ဆိုမှု မအောင်မြင်ပါ။';
    }
}

// ထွက်ရန် (Logout)
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    showPage('login-page');
    alert("ထွက်ခွာခြင်း အောင်မြင်ပါသည်။");
}

// Profile Data ကို တင်ရန်
function loadUserProfile() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        handleLogout();
        return;
    }
    
    const user = JSON.parse(userString);
    
    document.getElementById('profile-username').textContent = user.username;
    // Worker မှ ပေးပို့သော တကယ့် Data များကို ဤနေရာတွင် ပြသရန်
    document.getElementById('profile-last-login').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A';
    document.getElementById('profile-registered-date').textContent = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A';
}

// DOMContentLoaded တွင် စတင်ရန်
document.addEventListener('DOMContentLoaded', checkLoginState);

// =================================================
// 🚨 Video Player Logic (ယခင် Code အတိုင်း)
// =================================================

const videos = [
    // 🚨 သင်၏ တကယ့် Video Links ၂၀ ခုကို ဤနေရာတွင် ထည့်သွင်းပါ။
    { 
                url: 'https://www.dropbox.com/scl/fi/e3uu24s41eiar49ue6sky/1762078122323.mp4?rlkey=9w787qu03xhz3ssbq0a0q3288&st=i0ykgfay&raw=1', 
                title: 'ထိုင်း‌ ကျောင်းသူမလေးလီးတုနဲ့လိုးပြနေသည်', 
                download: 'https://www.dropbox.com/scl/fi/e3uu24s41eiar49ue6sky/1762078122323.mp4?rlkey=9w787qu03xhz3ssbq0a0q3288&st=i0ykgfay&raw=1', 
                currentLikes: 15, userLiked: false, currentComments: []
            },
            { 
                url: 'https://link-to-your-video-2.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-2.mp4?raw=1', 
                currentLikes: 80, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-3.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-3.mp4?raw=1', 
                currentLikes: 30, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-4.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-4.mp4?raw=1', 
                currentLikes: 55, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-5.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-5.mp4?raw=1', 
                currentLikes: 12, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-6.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-6.mp4?raw=1', 
                currentLikes: 44, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-7.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-7.mp4?raw=1', 
                currentLikes: 90, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-8.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-8.mp4?raw=1', 
                currentLikes: 25, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-9.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-9.mp4?raw=1', 
                currentLikes: 18, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-10.mp4?raw=1', 
                title: 'မရှိ‌ သေးဘူး', 
                download: 'https://link-to-your-video-10.mp4?raw=1', 
                currentLikes: 70, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-11.mp4?raw=1', 
                title: 'အခန်း ၁၁ - ဗဟုသုတ', 
                download: 'https://link-to-your-video-11.mp4?raw=1', 
                currentLikes: 63, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-12.mp4?raw=1', 
                title: 'အခန်း ၁၂ - ဇာတ်ကားများ', 
                download: 'https://link-to-your-video-12.mp4?raw=1', 
                currentLikes: 22, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-13.mp4?raw=1', 
                title: 'အခန်း ၁၃ - ပညာရေး', 
                download: 'https://link-to-your-video-13.mp4?raw=1', 
                currentLikes: 48, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-14.mp4?raw=1', 
                title: 'အခန်း ၁၄ - အားကစား', 
                download: 'https://link-to-your-video-14.mp4?raw=1', 
                currentLikes: 79, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-15.mp4?raw=1', 
                title: 'အခန်း ၁၅ - ခရီးစဉ်များ', 
                download: 'https://link-to-your-video-15.mp4?raw=1', 
                currentLikes: 33, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-16.mp4?raw=1', 
                title: 'အခန်း ၁၆ - ဖက်ရှင်', 
                download: 'https://link-to-your-video-16.mp4?raw=1', 
                currentLikes: 11, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-17.mp4?raw=1', 
                title: 'အခန်း ၁၇ - သိပ္ပံ', 
                download: 'https://link-to-your-video-17.mp4?raw=1', 
                currentLikes: 67, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-18.mp4?raw=1', 
                title: 'အခန်း ၁၈ - ကိုယ်ရေးအရာ', 
                download: 'https://link-to-your-video-18.mp4?raw=1', 
                currentLikes: 41, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-19.mp4?raw=1', 
                title: 'အခန်း ၁၉ - အင်တာဗျူး', 
                download: 'https://link-to-your-video-19.mp4?raw=1', 
                currentLikes: 58, userLiked: false, currentComments: [] 
            },
            { 
                url: 'https://link-to-your-video-20.mp4?raw=1', 
                title: 'အခန်း ၂၀ - နိဂုံး (နောက်ဆုံး)', 
                download: 'https://link-to-your-video-20.mp4?raw=1', 
                currentLikes: 99, userLiked: false, currentComments: [] 
            }
];
let currentVideo = videos[0]; 

function initializeVideoPlayer() {
    if (document.getElementById('home-page')) {
        currentVideo = videos[0];
        renderSidebar();
        loadVideo(currentVideo, 0); 
    }
}

function renderSidebar() { /* ... (Code remains the same as previous HTML versions) ... */ }
function loadVideo(video, index) { /* ... (Code remains the same as previous HTML versions) ... */ }
function toggleLike() { /* ... (Code remains the same as previous HTML versions) ... */ }
function renderComments() { /* ... (Code remains the same as previous HTML versions) ... */ }
function addComment() { /* ... (Code remains the same as previous HTML versions) ... */ 
    const userString = localStorage.getItem('currentUser');
    const currentUser = userString ? JSON.parse(userString).username : 'Guest';
    // ... (rest of the addComment logic using currentUser) ...
}

// ⚠️ Note: For brevity, the full video player functions (renderSidebar, loadVideo, etc.) 
// are assumed to be copied from the final static version.
