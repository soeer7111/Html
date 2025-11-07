// =================================================
// 🚨 Firebase Authentication Logic (Session & Verification Fix)
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
window.showPage = showPage;

// 🚨 Auth State ကို စစ်ဆေးပြီး UI ကို Update လုပ်ရန် (Session အမှတ်ဆုံး အပိုင်း)
function setupAuthListener() {
    if (window.onAuthStateChanged && window.auth) {
        window.onAuthStateChanged(window.auth, (user) => {
            if (user) {
                // User Login ဝင်ထားပါက (Reload လုပ်ရင် ဒီက စပါမယ်)
                const displayEmail = user.email || 'N/A';
                const displayUsername = displayEmail.includes('@dummy.com') ? displayEmail.replace('@dummy.com', '') : displayEmail.split('@')[0];

                document.getElementById('username-display').textContent = displayUsername; 
                document.getElementById('profile-username').textContent = displayUsername; 
                
                const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
                const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
                document.getElementById('profile-registered-date').textContent = creationDate;
                document.getElementById('profile-last-login').textContent = lastLogin;
                
                showPage('home-page'); 
            } else {
                showPage('login-page');
            }
        });
    }
}


// 🚨 မှတ်ပုံတင်ခြင်း (Register) - Verification ကို ကျော်လွှားသည်
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        await window.createUserWithEmailAndPassword(window.auth, email, password);
        await window.signInWithEmailAndPassword(window.auth, email, password);
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; console.error("Register Failed Firebase Error:", error); }
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
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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
// 🎥 Video Player & Data Persistence Logic
// =================================================

// 🚨 Initial Video Data (Working Links Only)
let videos = [
    { 
        id: 1, 
        // 🚨 Working URL
        url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        title: 'ဒုတိယမြောက် စမ်းသပ်ဗီဒီယို (Testing Stream)', 
        download: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: [
            { user: 'User99', text: 'အရည်အသွေး ကောင်းတယ်', timestamp: '2025-11-06 12:30' }
        ]
    },
    { 
        id: 2,
        // 🚨 Dropbox Link ကို နောက်ဆုံးထားပြီး အလုပ်လုပ်တဲ့ Link နဲ့ ပြောင်းထားသည်
        url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        title: 'Big Buck Bunny (Sample Video)', 
        download: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        currentLikes: 15, 
        userLiked: false, 
        currentComments: [
            { user: 'Admin', text: 'ကောင်းလိုက်တာ!', timestamp: '2025-11-06 10:00' }
        ]
    },
];

let currentVideoIndex = 0; 
let player; 

// 🚨 Local Storage မှ Data များကို Load လုပ်ခြင်း
function loadDataFromStorage() {
    const storedData = localStorage.getItem('videoData');
    if (storedData) {
        // Stored data ကို videos array အဖြစ် ပြန်လည်ရယူသည်
        videos = JSON.parse(storedData); 
    } else {
        // ပထမဆုံးအကြိမ် Load လုပ်ရင် ID တွေကို သေချာထည့်ပေးထားပါ
        videos.forEach((v, i) => v.id = i + 1);
    }
}

// 🚨 Local Storage တွင် Data များကို Save လုပ်ခြင်း
function saveDataToStorage() {
    localStorage.setItem('videoData', JSON.stringify(videos));
}

function initializeVideoPlayer() {
    // 🚨 Data ကို ဦးစွာ Load လုပ်သည်
    loadDataFromStorage();

    if (!player) {
        player = videojs('my-video');
    }
    currentVideoIndex = 0;
    renderSidebar();
    loadVideo(videos[currentVideoIndex], currentVideoIndex); 
}

function loadVideo(video, index) {
    currentVideoIndex = index;
    // video.js က URL ကို တိုက်ရိုက်ယူပြီး ဖွင့်သည်
    player.src({ src: video.url, type: 'video/mp4' });
    player.load();
    
    // Marquee effect အတွက် title ကို ပြပါ
    document.getElementById('current-video-title-text').textContent = video.title;
    
    document.getElementById('download-link').href = video.download;
    updateLikeStatus(video);
    renderComments(video);
    updateSidebarHighlight();
}

// Sidebar Functions
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

// Like Functions (Data Save ပါ ထည့်ထားသည်)
function updateLikeStatus(video) {
    const likeButton = document.getElementById('like-button');
    document.getElementById('like-count').textContent = video.currentLikes;
    if (video.userLiked) {
        likeButton.textContent = `❤️ လိုက်ခ် (${video.currentLikes})`;
    } else {
        likeButton.textContent = `👍 လိုက်ခ် (${video.currentLikes})`;
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
    
    // 🚨 Data ကို Save လုပ်သည်
    saveDataToStorage();

    updateLikeStatus(video);
}

// Comment Functions (Data Save ပါ ထည့်ထားသည်)
function renderComments(video) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    document.getElementById('comment-count').textContent = video.currentComments.length;
    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `<strong>${comment.user}:</strong> ${comment.text} <span class="timestamp">(${comment.timestamp})</span>`;
        commentsList.appendChild(div);
    });
    commentsList.scrollTop = commentsList.scrollHeight;
}

window.addComment = () => {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    const user = window.auth && window.auth.currentUser ? document.getElementById('username-display').textContent : 'Guest'; 
    
    if (commentText) {
        const video = videos[currentVideoIndex];
        const newComment = {
            user: user,
            text: commentText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
        video.currentComments.push(newComment);
        
        // 🚨 Data ကို Save လုပ်သည်
        saveDataToStorage();

        commentInput.value = '';
        renderComments(video);
    }
}

// App စတင် run ရန်အတွက်
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
});
