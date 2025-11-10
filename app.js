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
    // 💡 Pages အားလုံးကို အရင် ဝှက်ပါ။ (Double Home Page Error ရှင်းလင်းရန်)
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    window.location.hash = pageId; 

    // Nav Bar Logic ကို AuthStateChanged မှာ ထိန်းထားပါမည်။

    // 💡 Functions ခေါ်ခြင်း
    if (pageId === 'home-page') {
        initializeVideoPlayer(); 
    } else if (pageId === 'profile-page') {
        loadProfileData(); 
    } else if (pageId === 'admin-page') {
        checkAdminStatus(); 
    }
}
window.showPage = showPage;
window.handleGoHome = () => { 
    showPage('home-page'); 
};


// =================================================
// ✅ Part 3: Authentication (Login/Register/Logout/State Check) (FIX 16 - Re-Enabled)
// =================================================

window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        const result = await window.auth.createUserWithEmailAndPassword(email, password); 
        await window.auth.currentUser.updateProfile({ displayName: emailInput });
        await saveUserDataToFirestore(result.user); 
        
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ Home Page သို့ သွားပါမည်။'; 
        
        setTimeout(() => { 
            showPage('home-page'); 
        }, 300); 

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); 
        await saveUserDataToFirestore(result.user); 
        
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။ Home Page သို့ သွားပါမည်။'; 
        
        setTimeout(() => { 
            showPage('home-page'); 
        }, 300); 

    } catch (error) {
        messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    }
};

window.handleLogout = async () => {
    try {
        await window.auth.signOut();
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeChat) unsubscribeChat();
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 💡 ဤသည်မှာ State ကို စစ်ဆေးပြီး Page ကို Redirect လုပ်ပေးသော Function ဖြစ်သည်။
window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    const adminButton = document.getElementById('admin-nav-button');
    const globalHeader = document.getElementById('global-header'); // Header Tag

    if (globalHeader) { globalHeader.style.display = user ? 'flex' : 'none'; }
    if (navBar) { navBar.style.display = user ? 'flex' : 'none'; } // Fix 15 မှ navBar display logic
    if (adminButton) { 
        adminButton.style.display = (user && user.email === ADMIN_EMAIL) ? 'block' : 'none';
    }

    if (user) {
        // 🔑 Login ဝင်ထားပါက
        const hash = window.location.hash.substring(1); 
        
        if (!hash || hash === 'login-page' || hash === 'register-page') {
            showPage('home-page'); 
        } else {
            showPage(hash);
        }
        
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.displayName || user.email.split('@')[0];
        }

    } else {
        // 🔑 Login မဝင်ထားပါက: Login Page ကိုသာ ပြပါမည်။
        showPage('login-page');

        if (unsubscribeChat) unsubscribeChat(); 
        if (unsubscribeUsers) unsubscribeUsers(); 
    }
});


// =================================================
// ✅ Part 4: Profile Page Logic & All User Update Functions (FINAL)
// =================================================

window.loadProfileData = async () => {
    const user = window.auth.currentUser;
    if (!user) {
        document.getElementById('display-username').textContent = 'Login မဝင်ထားပါ။';
        // ... (Guest Logic) ...
        return;
    }
    
    // ... (Original profile loading logic) ...
    document.getElementById('display-username').textContent = user.displayName || user.email.split('@')[0];
    document.getElementById('display-email').textContent = user.email;
    
    const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';
    document.getElementById('creation-date').textContent = creationDate;

    // Load photo
    try {
        const photoRef = window.storage.ref(`profile_photos/${user.uid}`);
        const url = await photoRef.getDownloadURL();
        document.getElementById('profile-photo').src = url;
    } catch (e) {
        document.getElementById('profile-photo').src = 'default_user.png';
    }
};

window.changeUsername = async () => {
    const user = window.auth.currentUser;
    if (!user) { alert('Username ပြောင်းရန် Login ဝင်ပါ။'); return; }
    
    const newUsername = document.getElementById('new-username-input').value.trim();
    const messageDiv = document.getElementById('username-message');

    if (!newUsername) { messageDiv.textContent = 'Username ထည့်ပါ။'; return; }

    try {
        await user.updateProfile({ displayName: newUsername });
        await saveUserDataToFirestore(user); // Firestore ကိုပါ Update လုပ်
        loadProfileData(); // UI ကို Refresh လုပ်
        messageDiv.textContent = 'Username ပြောင်းလဲ အောင်မြင်ပါသည်။';
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
    }
};

window.uploadProfilePhoto = async () => {
    const user = window.auth.currentUser;
    if (!user) { alert('Photo Upload လုပ်ရန် Login ဝင်ပါ။'); return; }

    const fileInput = document.getElementById('photo-upload-input');
    const file = fileInput.files[0];
    const messageDiv = document.getElementById('photo-upload-message');
    
    if (!file) { messageDiv.textContent = 'File ရွေးပါ။'; return; }
    
    messageDiv.textContent = 'Uploading...';
    try {
        const storageRef = window.storage.ref(`profile_photos/${user.uid}`);
        await storageRef.put(file);
        
        loadProfileData();
        messageDiv.textContent = 'Upload အောင်မြင်ပါသည်။';
    } catch (error) {
        messageDiv.textContent = `Upload Error: ${error.message}`;
    }
};

window.sendPasswordResetEmail = async () => {
    const user = window.auth.currentUser;
    if (!user) { alert('Password Reset လုပ်ရန် Login ဝင်ပါ။'); return; }

    const messageDiv = document.getElementById('password-reset-message');
    messageDiv.textContent = 'Sending...';

    try {
        await window.auth.sendPasswordResetEmail(user.email);
        messageDiv.textContent = 'Reset Link ကို Email သို့ ပို့လိုက်ပါသည်။';
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
    }
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
    const user = window.auth.currentUser;
    if (!user) { alert('Chat မှာ စာပို့ရန် Login ဝင်ပေးပါ။'); return; }

    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        try {
            await window.db.collection('chats').add({
                username: user.displayName || user.email,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
};

window.deleteMessage = async (messageId) => {
    const user = window.auth.currentUser;
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("စာဖျက်ခွင့်မရှိပါ။ (Admin သာ)");
        return;
    }

    if (confirm("ဤစာကို ဖျက်ရန် သေချာပါသလား။")) {
        try {
            await window.db.collection('chats').doc(messageId).delete();
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    }
};

function loadChatMessages() {
    if (unsubscribeChat) unsubscribeChat(); 

    const chatMessagesDiv = document.getElementById('chat-messages');
    
    unsubscribeChat = window.db.collection('chats')
        .orderBy('timestamp', 'asc') 
        .limit(50) 
        .onSnapshot(snapshot => {
            chatMessagesDiv.innerHTML = ''; 
            const currentUser = window.auth.currentUser; 
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const messageId = doc.id; 
                const messageElement = document.createElement('div');
                
                const time = data.timestamp ? data.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '...';
                
                const isUserAdmin = data.username === ADMIN_EMAIL; 
                const isCurrentUser = currentUser && (data.username === currentUser.email || data.username === currentUser.displayName);
                const displayUsername = data.username.split('@')[0];
                const displayName = isUserAdmin ? `${displayUsername} 👑` : displayUsername;
                
                let deleteButton = '';
                if (currentUser && currentUser.email === ADMIN_EMAIL) {
                    deleteButton = `<button onclick="window.deleteMessage('${messageId}')" style="background: none; border: none; color: red; cursor: pointer; font-size: 0.9em; margin-left: 5px; padding: 0;">&times;</button>`;
                }
                
                messageElement.innerHTML = `
                    <p style="margin: 5px 0 5px 0; font-size: 14px; border-bottom: 1px dotted #eee; padding-bottom: 5px; display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="flex-grow: 1; color: ${isCurrentUser ? '#007bff' : 'inherit'};">
                            <strong style="color: ${isUserAdmin ? '#c0392b' : '#34495e'};">${displayName}:</strong> 
                            <span style="color: black;">${data.message}</span>
                        </span>
                        
                        <span style="display: flex; align-items: center;">
                            <span style="font-size: 0.7em; color: #95a5a6;">${time}</span>
                            ${deleteButton} 
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
        download: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mpkey=pe5pxns9stqmzz2hg2lxpjxnu&dl=1', 
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
    const user = window.auth.currentUser;
    if (!user) { alert('Like ပေးရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။'); return; }

    const video = videos[currentVideoIndex];
    if (video.userLiked) {
        video.currentLikes--;
        video.userLiked = false;
    } else {
        video.currentLikes++;
        video.userLiked = true;
    }
    updateLikeStatus(video);
    saveDataToStorage();
};

window.addComment = () => {
    const user = window.auth.currentUser;
    if (!user) { alert('Comment ရေးရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။'); return; }

    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (text) {
        const video = videos[currentVideoIndex];
        video.currentComments.push({
            id: Date.now(),
            user: user.displayName || user.email,
            text: text,
            timestamp: new Date().toLocaleTimeString()
        });
        input.value = '';
        renderComments(video);
        saveDataToStorage();
    }
};

window.deleteComment = (videoId, commentId) => {
    const user = window.auth.currentUser;
    if (!user) { alert('Comment ဖျက်ရန် Login ဝင်ပေးရန် လိုအပ်ပါသည်။'); return; }

    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const commentIndex = video.currentComments.findIndex(c => c.id === commentId);
    if (commentIndex > -1) {
        const commentUser = video.currentComments[commentIndex].user;
        if (commentUser === (user.displayName || user.email) || user.email === ADMIN_EMAIL) {
            if (confirm("ဤမှတ်ချက်ကို ဖျက်ရန် သေချာပါသလား။")) {
                 video.currentComments.splice(commentIndex, 1);
                 renderComments(video);
                 saveDataToStorage();
            }
        } else {
            alert("သင်သာ ဖျက်ခွင့်ရှိပါသည်။");
        }
    }
};

function renderComments(video) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    const commentCountElement = document.getElementById('comment-count');
    if (commentCountElement) commentCountElement.textContent = video.currentComments.length;
    
    const currentUser = window.auth.currentUser; 

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        const displayCommentUser = comment.user.split('@')[0];
        
        let deleteButton = '';
        const isAuthor = currentUser && (comment.user === (currentUser.displayName || currentUser.email));
        const isAdmin = currentUser && currentUser.email === ADMIN_EMAI
