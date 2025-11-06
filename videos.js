// =================================================
// 🚨 Firebase Authentication Logic (သီးသန့်)
// =================================================

// UI ဖွဲ့စည်းမှု Functions
function showPage(pageId) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'none';
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    if (pageId === 'home-page') {
        initializeVideoPlayer();
    }
}

// Auth State ကို စစ်ဆေးပြီး UI ကို အမြဲတမ်း Update လုပ်ရန် (Firebase စစ်ဆေးမှု)
window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
        // User Login ဝင်ထားပါက
        document.getElementById('username-display').textContent = user.email.replace('@dummy.com', ''); // Username ကိုသာ ပြပါ
        document.getElementById('profile-username').textContent = user.email.replace('@dummy.com', ''); 
        
        // Profile Info ဖြည့်ရန်
        const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
        const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
        document.getElementById('profile-registered-date').textContent = creationDate;
        document.getElementById('profile-last-login').textContent = lastLogin;
        
        showPage('home-page');
    } else {
        // User Login မဝင်ထားပါက
        showPage('login-page');
    }
});


// မှတ်ပုံတင်ခြင်း (Register)
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) {
        messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။';
        return;
    }

    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        await window.createUserWithEmailAndPassword(window.auth, email, password);
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။';
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
             messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။';
        } else {
             messageDiv.textContent = `Error: ${error.message}`;
        }
    }
};

// ဝင်ရောက်ခြင်း (Login)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        await window.signInWithEmailAndPassword(window.auth, email, password);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
             messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
        } else {
             messageDiv.textContent = `Error: ${error.message}`;
        }
    }
};

// ထွက်ခြင်း (Logout)
window.handleLogout = async () => {
    try {
        await window.signOut(window.auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};


// =================================================
// 🚨 Video Player Logic (အတည်တကျ Code)
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
            // ... (ကျန်သော ဗီဒီယိုများ)
];
let currentVideo = videos[0]; 

function initializeVideoPlayer() {
    // Video Player ကို Home Page မှာ စတင်ရန်
    if (document.getElementById('home-page')) {
        currentVideo = videos[0];
        renderSidebar();
        loadVideo(currentVideo, 0); 
    }
}

// ⚠️ Note: For brevity, the full video player functions (renderSidebar, loadVideo, toggleLike, renderComments, addComment) 
// are assumed to be copied from the final static version, using window.auth.currentUser for the user's name.

// 🚨 လိုအပ်သော Video Player Functions များကို ဤနေရာတွင် ထည့်သွင်းရန်
function renderSidebar() { /* ... */ }
function loadVideo(video, index) { /* ... */ }
function toggleLike() { /* ... */ }
function renderComments() { /* ... */ }
function addComment() { /* ... */ }

// window.showPage ကို HTML မှာ ခေါ်သုံးနိုင်ဖို့ ထုတ်ပေးသည်
window.showPage = showPage;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
