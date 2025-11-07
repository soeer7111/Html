// =================================================
// 🚨 Firebase Authentication Logic (Final Version with Forced Sign-In)
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

// Auth State ကို စစ်ဆေးပြီး UI ကို Update လုပ်ရန်
// videos.js ထဲက onAuthStateChanged အပိုင်းကို အစားထိုးရန်
if (window.onAuthStateChanged) {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user) {
            // User Login ဝင်ထားပါက ချက်ချင်း Home Page ကို ပို့သည်
            const displayEmail = user.email || 'N/A';
            const displayUsername = displayEmail.includes('@dummy.com') ? displayEmail.replace('@dummy.com', '') : displayEmail.split('@')[0];

            document.getElementById('username-display').textContent = displayUsername; 
            document.getElementById('profile-username').textContent = displayUsername; 
            
            const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
            const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
            document.getElementById('profile-registered-date').textContent = creationDate;
            document.getElementById('profile-last-login').textContent = lastLogin;
            
            // 🛑 Home Page ကို ချက်ချင်းပြရန်
            showPage('home-page'); 

        } else {
            // User Login မဝင်ထားပါက Login Page ကို ပြသည်
            showPage('login-page');
        }
    });
}

// 🚨 မှတ်ပုံတင်ခြင်း (Register) - Register ပြီးတာနဲ့ ချက်ချင်း Login ထပ်ခေါ်သည်
// videos.js ထဲက handleRegister function အပိုင်းကို အစားထိုးရန်
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
        // ၁။ User ကို ဖန်တီးသည်
        await window.createUserWithEmailAndPassword(window.auth, email, password);
        
        // ၂။ ချက်ချင်း Login ပြန်ဝင်ခိုင်းသည်
        await window.signInWithEmailAndPassword(window.auth, email, password);
        
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ Home သို့ ပို့နေပါသည်။'; 
        
        // 🛑 ၃။ Manual ဖြင့် Home Page ကို ချက်ချင်း ပို့ရန် (နောက်ဆုံး ဖြေရှင်းချက်)
        showPage('home-page'); 
        
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

// ဝင်ရောက်ခြင်း (Login) - ပြောင်းလဲမှုမရှိ
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
        } else if (error.code === 'auth/invalid-credential') { // Firebase error အသစ်
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
// Video Player Logic (အတည်တကျ ထားရှိသည်)
// =================================================

const videos = [
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
    player.src({ src: video.url, type: 'video/mp4' });
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
    // Initialization သည် onAuthStateChanged မှ စတင်ပါမည်။
});
