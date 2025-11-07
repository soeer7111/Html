// =================================================
// 🚨 Part 1: Firebase Configuration & Setup
// =================================================

// 💡 သင့်ရဲ့ ပေးထားသော Firebase Config ID များ
const firebaseConfig = {
    apiKey: "AIzaSyBHFEAoD5nMUg7azmeeAFdy4Btlff5qiXQ",
    authDomain: "my-webi-dc06d.firebaseapp.com",
    projectId: "my-webi-dc06d",
    storageBucket: "my-webi-dc06d.firebasestorage.app", 
    messagingSenderId: "939042419939",
    appId: "1:939042419939:web:49e96f18117a68bb8b01d6",
    measurementId: "G-DJ9046C036"
};

window.app = firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();

// =================================================
// 🚨 Part 2: Page Navigation & UI Functions
// =================================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    if (pageId === 'home-page') {
        initializeVideoPlayer(); 
    } else if (pageId === 'profile-page') {
        loadProfileData(); 
    }
}
window.showPage = showPage;

function loadProfileData() {
    const user = window.auth.currentUser;
    if (user) {
        document.getElementById('profile-phone').value = user.displayName || ''; 
        document.getElementById('profile-message').textContent = '';
    }
}


// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout)
// =================================================

// Register Function
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        await window.auth.createUserWithEmailAndPassword(email, password);
        await window.auth.signInWithEmailAndPassword(email, password); 
        
        await window.auth.currentUser.updateProfile({
            displayName: emailInput 
        });

        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// Login Function (Fix: ချက်ချင်း Home Page ကို ပြောင်းသည်)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        await window.auth.signInWithEmailAndPassword(email, password);
        
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
        showPage('home-page'); 

    } catch (error) {
        messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    }
};

// Logout Function
window.handleLogout = async () => {
    try {
        await window.auth.signOut();
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// Auth State Check 
window.auth.onAuthStateChanged((user) => {
    if (user) {
        const displayUsername = user.email.includes('@dummy.com') ? user.email.replace('@dummy.com', '') : user.email.split('@')[0];

        document.getElementById('username-display').textContent = displayUsername; 
        document.getElementById('profile-username').textContent = displayUsername; 
        
        const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
        const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
        document.getElementById('profile-registered-date').textContent = creationDate;
        document.getElementById('profile-last-login').textContent = lastLogin;
        
        if (document.getElementById('home-page').style.display === 'none') {
            showPage('home-page'); 
        }
    } else {
        showPage('login-page');
    }
});


// =================================================
// 🚨 Part 4: Profile Update Logic (Photo Upload ဖြုတ်ထားသည်)
// =================================================

// Profile အချက်အလက်များ (ဖုန်းနံပါတ်) ကို Update လုပ်ခြင်း
window.updateProfileDetails = async () => {
    const user = window.auth.currentUser;
    const phone = document.getElementById('profile-phone').value.trim();
    const messageDiv = document.getElementById('profile-message');

    if (!user) { messageDiv.textContent = 'User not logged in.'; return; }
    
    try {
        await user.updateProfile({
            displayName: phone 
        });
        messageDiv.textContent = 'ဖုန်းနံပါတ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။';
        loadProfileData(); 
    } catch (error) {
        messageDiv.textContent = `Update Failed: ${error.message}`;
    }
}


// =================================================
// 🚨 Part 5: Video Player & Data Persistence Logic (Like/Comment)
// =================================================

// 📄 app.js (Part 5: Video Player & Data Persistence Logic)

let videos = [
    { 
        id: 1, 
        // 🚨 MediaFire ကနေ ရလာတဲ့ Direct Link ကို အစားထိုးလိုက်ပါပြီ
        url: 'https://download2285.mediafire.com/e6w0xns4olkgqf58wWvPLniykI0hY48zWD3PFlqPl_ZJ0419p96tay2TFwvGobbKaHrw5gAPL2Eh-yYb7tuAO6vio6nPlTemPrg3OtHeHeUY-6goBDQrJFKIpmYs5irC92fefYCLbbRvu3ROYq9Qe2oEmrMDtyhSn1BPmy43NM0/ep6gqdvvjkpdaos/5_6208271644641729117.mp4', 
        
        title: 'ကျွန်တော်တို့ရဲ့ ဗီဒီယို အသစ်', 
        
        // Download Link ကိုလည်း Direct Link သာ ထားပါ
        download: 'https://download2285.mediafire.com/e6w0xns4olkgqf58wWvPLniykI0hY48zWD3PFlqPl_ZJ0419p96tay2TFwvGobbKaHrw5gAPL2Eh-yYb7tuAO6vio6nPlTemPrg3OtHeHeUY-6goBDQrJFKIpmYs5irC92fefYCLbbRvu3ROYq9Qe2oEmrMDtyhSn1BPmy43NM0/ep6gqdvvjkpdaos/5_6208271644641729117.mp4', 
        
        currentLikes: 8, 
        userLiked: false, 
        currentComments: []
    },
    // ... အခြားသော ဗီဒီယိုများ ...
];

let currentVideoIndex = 0; 
let player; 

function loadDataFromStorage() {
    const storedData = localStorage.getItem('videoData');
    
    // 💡 ယာယီ ရှင်းလင်းရေး Logic
    // ဒီနေရာမှာ သင့်ရဲ့ code အသစ်ထဲက video အရေအတွက် (ဥပမာ: 2 ခု) နဲ့ မကိုက်ညီရင် 
    // data အဟောင်းကို ရှင်းထုတ်ပြီး data အသစ်ကို ဖြည့်သွင်းပါ
    if (storedData) {
        let tempVideos = JSON.parse(storedData);
        
        // 🚨 သင့်ရဲ့ လက်ရှိ code ထဲက videos array မှာ item 2 ခု ရှိပါတယ်။
        // storedData ထဲမှာ video 2 ခု မရှိရင် (အဟောင်းဖြစ်နေရင်) ရှင်းထုတ်ခိုင်းတာပါ။
        if (tempVideos.length < videos.length || tempVideos[0].title !== videos[0].title) {
             console.log("Local Storage data သည် Code အသစ်နှင့် မကိုက်ညီပါ၊ ရှင်းလင်းပါမည်။");
             localStorage.removeItem('videoData');
             videos.forEach((v, i) => v.id = i + 1); // Code အသစ်မှ data ကို ပြန်ထည့်
             saveDataToStorage();
             return; // ရှင်းပြီးရင် ဆက်မလုပ်တော့ပါ
        }
        
        // data အဟောင်းက မှန်ကန်တယ်ဆိုရင် အဟောင်းကို ပြန်သုံးပါ
        videos = tempVideos;

    } else {
        // storedData မရှိမှသာ ID ကို သတ်မှတ်ပါ
        videos.forEach((v, i) => v.id = i + 1);
        // data အသစ်ကို တစ်ခါတည်း save လုပ်ထားပါ
        saveDataToStorage(); 
    }
}


function saveDataToStorage() {
    localStorage.setItem('videoData', JSON.stringify(videos));
}

function initializeVideoPlayer() {
    loadDataFromStorage();

    if (!player) {
        player = videojs('my-video');
    }
    if (currentVideoIndex >= videos.length) currentVideoIndex = 0;

    renderSidebar();
    loadVideo(videos[currentVideoIndex], currentVideoIndex); 
}

function loadVideo(video, index) {
    currentVideoIndex = index;
    player.src({ src: video.url, type: 'video/mp4' });
    player.load();
    
    document.getElementById('current-video-title-text').textContent = video.title;
    document.getElementById('download-link').href = video.download;
    updateLikeStatus(video);
    renderComments(video); 
    updateSidebarHighlight();
}

// Like Functions
function updateLikeStatus(video) {
    const likeButton = document.getElementById('like-button');
    if (!likeButton) return;

    if (video.userLiked) {
        likeButton.innerHTML = `❤️ လိုက်ခ် (<span id="like-count">${video.currentLikes}</span>)`;
    } else {
        likeButton.innerHTML = `👍 လိုက်ခ် (<span id="like-count">${video.currentLikes}</span>)`;
    }
}

window.toggleLike = () => {
    const video = videos[currentVideoIndex];
    if (video.userLiked) {
        video.currentLikes--;
    } else {
        video.currentLikes++;
    }
    video.userLiked = !video.userLiked;
    
    saveDataToStorage(); 

    updateLikeStatus(video);
}

// Comment Functions
window.addComment = () => {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    const user = window.auth.currentUser;
    const username = user ? (user.email.includes('@dummy.com') ? user.email.replace('@dummy.com', '') : user.email.split('@')[0]) : 'Guest'; 
    
    if (commentText) {
        const video = videos[currentVideoIndex];
        const newComment = {
            user: username,
            text: commentText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            id: Date.now()
        };
        video.currentComments.push(newComment);
        
        saveDataToStorage();

        commentInput.value = '';
        renderComments(video);
    }
}

window.deleteComment = (videoId, commentId) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
        video.currentComments = video.currentComments.filter(c => c.id !== commentId);
        
        saveDataToStorage();
        renderComments(video);
    }
}

function renderComments(video) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    document.getElementById('comment-count').textContent = video.currentComments.length;
    
    const currentUser = window.auth.currentUser;
    const currentUsername = currentUser ? (currentUser.email.includes('@dummy.com') ? currentUser.email.replace('@dummy.com', '') : currentUser.email.split('@')[0]) : 'Guest';

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        let deleteButton = '';
        if (comment.user === currentUsername || currentUsername === 'Admin') { 
             deleteButton = `<button style="float:right; background:red; padding:2px 5px; margin-left:10px; width:auto; font-size: 0.7em;" onclick="window.deleteComment(${video.id}, ${comment.id})">❌</button>`;
        }
        
        div.innerHTML = `
            <strong>${comment.user}:</strong> 
            ${deleteButton}
            ${comment.text} 
            <span class="timestamp">(${comment.timestamp})</span>
        `;
        commentsList.appendChild(div);
    });
    commentsList.scrollTop = commentsList.scrollHeight;
}

// =================================================
// 🚨 Part 6: Video Sidebar/List Functions (Video Player Functions အောက်မှာ ထားသည်)
// =================================================

function updateSidebarHighlight() {
    document.querySelectorAll('.sidebar-item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentVideoIndex) {
            item.classList.add('active');
        }
    });
}

function renderSidebar() {
    const sidebar = document.getElementById('video-sidebar');
    if (!sidebar) return;
    
    sidebar.innerHTML = '<h4>ဗီဒီယို စာရင်း</h4>';
    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.textContent = `${index + 1}. ${video.title}`;
        item.onclick = () => loadVideo(video, index);
        sidebar.appendChild(item);
    });
    updateSidebarHighlight();
      }
