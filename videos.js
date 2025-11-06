// =================================================
// 🚨 Firebase Authentication Logic (Final Clean Version)
// =================================================

// UI ဖွဲ့စည်းမှု Functions
function showPage(pageId) {
    // Page အားလုံးကို ဖျောက်ထားသည်
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'none';
    
    // ရည်ရွယ်ထားသော Page ကိုသာ ပြသည်
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    if (pageId === 'home-page') {
        // Home Page ကိုပြရင် Video Player ကို စတင်ရန်
        initializeVideoPlayer();
    }
}
window.showPage = showPage; // HTML က ခေါ်သုံးနိုင်ဖို့ ထုတ်ပေးသည်

// Auth State ကို စစ်ဆေးပြီး UI ကို Update လုပ်ရန်
if (window.onAuthStateChanged) {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            // User Login ဝင်ထားပါက
            const displayEmail = user.email || 'N/A';
            // '@dummy.com' ကို ဖြုတ်ပြီး username သာ ပြသရန်
            const displayUsername = displayEmail.includes('@dummy.com') ? displayEmail.replace('@dummy.com', '') : displayEmail.split('@')[0];

            document.getElementById('username-display').textContent = displayUsername; 
            document.getElementById('profile-username').textContent = displayUsername; 
            
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
}

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
        if (!window.createUserWithEmailAndPassword) {
            messageDiv.textContent = 'CRITICAL ERROR: Firebase Register Function မရှိပါ။ index.html ကို ပြန်စစ်ပါ။';
            console.error("Firebase Auth Function Missing: createUserWithEmailAndPassword is not defined on window.");
            return;
        }

        // 🚨 ဤနေရာတွင် User ကို Firebase တွင် အောင်မြင်စွာ ဖန်တီးလိုက်သည်
        await window.createUserWithEmailAndPassword(window.auth, email, password);
        
        // 🚨 ပြင်ဆင်ချက်: Email Verification ကို ကျော်ပြီး ချက်ချင်း Home Page သို့ ပို့ရန်
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။'; 
        // onAuthStateChanged က user ကို တွေ့ပြီး Home Page ကို ပို့ပေးပါမည်။

    } catch (error) {
        // Error ဖြစ်ပါက
        if (error.code === 'auth/email-already-in-use') {
             messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။';
        } else if (error.code === 'auth/invalid-email') {
             messageDiv.textContent = 'မှန်ကန်သော အသုံးပြုသူအမည် ပုံစံမဟုတ်ပါ။';
        } else {
             messageDiv.textContent = `Error: ${error.message}`;
             console.error("Register Failed Firebase Error:", error);
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
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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
// 🚨 Video Player Logic 
// =================================================

const videos = [
    // ဗီဒီယို Links များ (ဒါတွေကို နှိပ်ပြီး ဖွင့်နိုင်ဖို့ index.html က VideoJS နဲ့ ချိတ်ထားသည်)
    { 
        url: 'https://www.dropbox.com/scl/fi/e3uu24s41eiar49ue6sky/1762078122323.mp4?rlkey=9w787qu03xhz3ssbq0a0q3288&st=i0ykgfay&raw=1', 
        title: 'ထိုင်း‌ ကျောင်းသူမလေး လီးတုနဲ့လိုးပြနေသည်', 
        download: 'https://www.dropbox.com/scl/fi/e3uu24s41eiar49ue6sky/1762078122323.mp4?rlkey=9w787qu03xhz3ssbq0a0q3288&st=i0ykgfay&raw=1', 
        currentLikes: 15, userLiked: false, 
        currentComments: [
            { user: 'Admin', text: 'ကောင်းလိုက်တာ!', timestamp: '2025-11-06 10:00' }
        ]
    },
    { 
        url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        title: 'ဒုတိယမြောက် စမ်းသပ်ဗီဒီယို', 
        download: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        currentLikes: 8, userLiked: true, 
        currentComments: [
            { user: 'User99', text: 'အရည်အသွေး ကောင်းတယ်', timestamp: '2025-11-06 12:30' }
        ]
    },
    // လိုအပ်ပါက ဗီဒီယိုများ ထပ်ထည့်နိုင်သည်
];

let currentVideoIndex = 0; 
let player; 

function initializeVideoPlayer() {
    if (!player) {
        player = videojs('my-video');
    }
    
    currentVideoIndex = 0;
    renderSidebar();
    loadVideo(videos[currentVideoIndex], currentVideoIndex); 
}

function loadVideo(video, index) {
    currentVideoIndex = index;
    
    player.src({
        src: video.url,
        type: 'video/mp4' 
    });
    player.load();
    
    document.getElementById('current-video-title').textContent = video.title;
    document.getElementById('download-link').href = video.download;
    
    updateLikeStatus(video);
    renderComments(video);
    updateSidebarHighlight();
}

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
    updateLikeStatus(video);
}

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
        
        commentInput.value = '';
        renderComments(video);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // onAuthStateChanged သည် UI ကို ထိန်းချုပ်ပေးပါမည်။
});
