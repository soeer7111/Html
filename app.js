// =================================================
// ✅ Part 1: Firebase Configuration & Setup (FINAL)
// =================================================
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
window.db = firebase.firestore();
window.storage = firebase.storage(); 

const ADMIN_EMAIL = 'soeer71@dummy.com'; 
let unsubscribeChat; 
let unsubscribeUsers; 

// NOTE: Auth Bypass လုပ်ထားသည့်အတွက် ဒီ function များသည် Login State ပေါ် မမူတည်တော့ပါ။
async function saveUserDataToFirestore(user) {
    const userRef = window.db.collection('users').doc(user.uid);
    const displayName = user.displayName || user.email.split('@')[0];
    const isAdmin = user.email === ADMIN_EMAIL;
    const existingDoc = await userRef.get();
    
    const registeredAtValue = existingDoc.exists && existingDoc.data().registeredAt 
                                ? existingDoc.data().registeredAt 
                                : window.firebase.firestore.FieldValue.serverTimestamp();

    await userRef.set({ 
        uid: user.uid,
        email: user.email, 
        displayName: displayName,
        isAdmin: isAdmin, 
        registeredAt: registeredAtValue, 
        lastLoginAt: window.firebase.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
}

// =================================================
// ✅ Part 2: Page Navigation & UI Functions (FINAL)
// =================================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    window.location.hash = pageId; 

    const navBar = document.getElementById('nav-bar');
    if (navBar) {
        // Auth Bypass ဖြင့် Navigation Bar ကို ချက်ချင်း ပြသပါ။
        navBar.style.display = (pageId === 'home-page' || pageId === 'profile-page' || pageId === 'admin-page') ? 'flex' : 'none';
    }

    // 💡 Page ပြောင်းတိုင်း Functions များကို စနစ်တကျ ခေါ်စေခြင်း
    if (pageId === 'home-page') {
        initializeVideoPlayer(); 
    } else if (pageId === 'profile-page') {
        loadProfileData(); 
    } else if (pageId === 'admin-page') {
        // Admin Function ကို ခေါ်နိုင်သော်လည်း User မရှိ၍ Error ပြပါမည်။
        checkAdminStatus(); 
    }
}
window.showPage = showPage;
window.handleGoHome = () => { showPage('home-page'); };

// =================================================
// ✅ Part 3: Authentication (Login/Register/Logout/State Check) (FIX 13 - DISABLED)
// =================================================

// ❌ Login, Register, Logout Button များ နှိပ်လျှင် Error Message ပေးရန် ပြင်ဆင်ခြင်း
window.handleRegister = async () => {
    alert("❌ မှတ်ပုံတင်ခြင်းစနစ် ယာယီပိတ်ထားပါသည်။");
};

window.handleLogin = async () => {
    alert("❌ ဝင်ရောက်ခြင်းစနစ် ယာယီပိတ်ထားပါသည်။");
};

window.handleLogout = async () => {
    alert("❌ ထွက်ခွာခြင်းစနစ် ယာယီပိတ်ထားပါသည်။");
    window.location.reload(); // Page ကို Refresh လုပ်ပေးခြင်း
};

// ❌ Firebase Auth State စစ်ဆေးခြင်းကို လုံးဝ ပိတ်ထားပါသည်။
// window.auth.onAuthStateChanged((user) => { ... });

// =================================================
// ✅ Part 4: Profile Page Logic & All User Update Functions (FINAL)
// =================================================

window.loadProfileData = () => {
    // 💡 Auth Bypass တွင် User data မရှိသောကြောင့် Default ပြသခြင်း
    const user = window.auth.currentUser; // user သည် null ဖြစ်နေမည်
    if (!user) {
        document.getElementById('display-username').textContent = 'Guest User';
        document.getElementById('display-email').textContent = 'auth.disabled@guest.com';
        document.getElementById('creation-date').textContent = 'Instant Access';
        document.getElementById('profile-photo').src = 'default_user.png';
        
        // Admin Button ကို ဝှက်ထားပါ။
        const adminButton = document.getElementById('admin-nav-button');
        if (adminButton) adminButton.style.display = 'none';
        
        // Username Display နေရာတွင်လည်း ပြောင်းပေးပါ။
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) usernameDisplay.textContent = 'Guest';
        return; 
    } 
    // ... (Original logic for authenticated user) ...
};

window.changeUsername = async () => {
    alert("❌ Username ပြောင်းလဲခြင်းစနစ်ကို ယာယီပိတ်ထားပါသည်။");
};

window.uploadProfilePhoto = async () => {
    const messageDiv = document.getElementById('photo-upload-message');
    messageDiv.textContent = '❌ Photo Upload ဝန်ဆောင်မှု ယာယီ ပိတ်ထားပါသည်။';
};

window.sendPasswordResetEmail = async () => {
    alert("❌ Password ပြန်လည်သတ်မှတ်ခြင်းစနစ်ကို ယာယီပိတ်ထားပါသည်။");
};

// =================================================
// ✅ Part 5: Global Chatbox Functionality (FINAL)
// =================================================

window.toggleChatBox = () => {
    const chatBox = document.getElementById('chat-section');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    
    if (chatBox.style.display === 'flex') {
        chatBox.style.display = 'none';
        chatToggleBtn.style.display = 'block';
        if (unsubscribeChat) unsubscribeChat(); 
    } else {
        chatBox.style.display = 'flex';
        chatToggleBtn.style.display = 'none';
        loadChatMessages();
    }
};

window.sendMessage = async () => {
    alert('❌ စာပို့ရန်အတွက် Login ဝင်ပေးရန် လိုအပ်ပါသည်။ (စနစ်ပိတ်ထားသည်)');
};

window.deleteMessage = async (messageId) => {
    alert("❌ စာဖျက်ခွင့်မရှိပါ။ (Admin စနစ်ပိတ်ထားသည်)");
};

function loadChatMessages() {
    // ... (Chat loading logic is the same) ...
    // NOTE: Data loading from Firestore should still work if rules allow public read
    if (unsubscribeChat) unsubscribeChat(); 

    const chatMessagesDiv = document.getElementById('chat-messages');
    
    unsubscribeChat = window.db.collection('chats')
        .orderBy('timestamp', 'asc') 
        .limit(50) 
        .onSnapshot(snapshot => {
             // ... (Original rendering logic) ...
            chatMessagesDiv.innerHTML = ''; 
            const currentUser = window.auth.currentUser; // null
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const messageId = doc.id; 
                const messageElement = document.createElement('div');
                const time = data.timestamp ? data.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '...';
                
                const isUserAdmin = data.username === ADMIN_EMAIL; 
                const displayUsername = data.username.split('@')[0];
                const displayName = isUserAdmin ? `${displayUsername} 👑` : displayUsername;
                
                // Auth Disabled ဖြစ်သောကြောင့် Delete Button မပြပါ
                const deleteButtonHtml = ''; 
                
                messageElement.innerHTML = `
                    <p style="margin: 5px 0 5px 0; font-size: 14px; border-bottom: 1px dotted #eee; padding-bottom: 5px; display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="flex-grow: 1;">
                            <strong style="color: ${isUserAdmin ? '#c0392b' : '#34495e'};">${displayName}:</strong> 
                            <span style="color: black;">${data.message}</span>
                        </span>
                        
                        <span style="display: flex; align-items: center;">
                            <span style="font-size: 0.7em; color: #95a5a6;">${time}</span>
                            ${deleteButtonHtml} 
                        </span>
                    </p>
                `;
                chatMessagesDiv.appendChild(messageElement);
            });
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }, error => {
            console.error("Error loading chat messages:", error);
            const errorMessage = (error.code === 'permission-denied') ? "❌ Chat messages များကို Load မလုပ်နိုင်ပါ။ (Firestore Rules ကိုစစ်ပါ)" : `❌ Error: ${error.message}`;
            chatMessagesDiv.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
        });
}


// =================================================
// ✅ Part 6: Video Player & Data Persistence Logic (FINAL)
// =================================================

let videos = [
    { 
        id: 1, 
        url: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&dl=1',
        title: 'ထိုင်းကျောင်းသူမလေးလီးတုနဲ့လိုးပြနေသည်', 
        download: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&dl=1', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 2, 
        url: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&dl=1',
        title: 'ထိုင်ကျောင်းသူမလေးသူဘဲကြီးနဲ့လိုးပြနေသည်', 
        download: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&dl=1',
        currentLikes: 15, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 3, 
        url: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mp4?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&dl=1',
        title: 'ထိုင်း‌ ကျောင်းသူလေး', 
        download: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mp4?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&dl=1', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: []
    }
];


let currentVideoIndex = 0; 
let player; 

function loadDataFromStorage() {
    const storedData = localStorage.getItem('videoData');
    if (storedData) {
        const tempVideos = JSON.parse(storedData); 
        if (tempVideos.length === videos.length) { 
             videos = tempVideos;
        }
    } else {
        videos.forEach((v, i) => v.id = i + 1);
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
    
    const titleElement = document.getElementById('current-video-title-text');
    if (titleElement) titleElement.textContent = video.title;

    const downloadLink = document.getElementById('download-link');
    if (downloadLink) downloadLink.href = video.download;
    
    updateLikeStatus(video);
    renderComments(video); 
    updateSidebarHighlight();
}

function updateLikeStatus(video) {
    const likeButton = document.getElementById('like-button');
    if (!likeButton) return;

    if (video.userLiked) {
        likeButton.innerHTML = `❤️ လိုက်ခ် (${video.currentLikes})`;
    } else {
        likeButton.innerHTML = `👍 လိုက်ခ် (${video.currentLikes})`;
    }
}

window.toggleLike = () => {
    alert('❌ Like ပေးရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။ (စနစ်ပိတ်ထားသည်)');
};

window.addComment = () => {
    alert('❌ Comment ရေးရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။ (စနစ်ပိတ်ထားသည်)');
};

window.deleteComment = (videoId, commentId) => {
    alert('❌ Comment ဖျက်ရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။ (စနစ်ပိတ်ထားသည်)');
};

function renderComments(video) {
    // ... (Comment rendering logic - showing existing comments but not allowing new ones)
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    const commentCountElement = document.getElementById('comment-count');
    if (commentCountElement) commentCountElement.textContent = video.currentComments.length;
    
    // Auth Bypass တွင် user သည် null ဖြစ်နေမည်
    const currentUser = window.auth.currentUser; 
    const isAdminUser = false; 

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        const displayCommentUser = comment.user.split('@')[0];
        
        let deleteButton = '';
        
        div.innerHTML = `
            <p style="margin: 5px 0; border-bottom: 1px dotted #eee; padding-bottom: 5px;">
                <strong style="color: #333;">${displayCommentUser}:</strong> ${comment.text}
                <span style="font-size: 0.7em; color: #999; margin-left: 10px;">${comment.timestamp}</span>
                ${deleteButton}
            </p>
        `;
        commentsList.appendChild(div);
    });
}

function renderSidebar() {
    const list = document.getElementById('video-sidebar-list');
    list.innerHTML = ''; 

    videos.forEach((video, index) => {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.textContent = video.title;
        
        li.onclick = () => { loadVideo(video, index); };
        list.appendChild(li);
    });
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


// =================================================
// ✅ Part 7: Admin Panel Logic (User List Fetching) (FINAL)
// =================================================

window.checkAdminStatus = async () => {
    const adminMessage = document.getElementById('admin-message');
    const adminContainer = document.getElementById('admin-page');

    adminMessage.textContent = '❌ Admin ဝင်ခွင့်စနစ်ကို ယာယီ ပိတ်ထားပါသည်။';
    adminContainer.innerHTML = '<p style="color: red;">Access Denied. Admin System is disabled.</p>';
};

window.fetchUserList = () => {
    // ... (User List Fetching logic is now also bypassed/disabled)
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = '<li>❌ Admin စနစ် ပိတ်ထားပါသည်။</li>';

    if (unsubscribeUsers) unsubscribeUsers(); 
};
                                          
