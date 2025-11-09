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
window.db = firebase.firestore();
window.storage = firebase.storage(); 

// ⚠️ Admin Email ကို Global Variable အဖြစ် Part 1 တွင် သတ်မှတ်သည်
const ADMIN_EMAIL = 'soeer71@dummy.com'; 

// =================================================
// 🚨 Part 2: Page Navigation & UI Functions (Final Version)
// =================================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.style.display = 'block';

    // ✅ URL Hash ကို Update လုပ်ခြင်း (Reload persistence အတွက်)
    window.location.hash = pageId; 

    // Nav Bar ပြခြင်း/ဖျောက်ခြင်း Logic
    const navBar = document.getElementById('nav-bar');
    if (pageId === 'home-page' || pageId === 'profile-page' || pageId === 'admin-page') {
        if (navBar) navBar.style.display = 'flex';
    } else {
        if (navBar) navBar.style.display = 'none';
    }

    if (pageId === 'home-page') {
        initializeVideoPlayer(); 
    } else if (pageId === 'profile-page') {
        loadProfileData(); 
    } else if (pageId === 'admin-page') {
        checkAdminStatus(); 
    }
}
window.showPage = showPage;

// Home Page ကို ပြန်သွားစေရန် Function 
window.handleGoHome = () => {
    showPage('home-page');
};
// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout)
// =================================================

// 1. Register Function 
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        const result = await window.auth.createUserWithEmailAndPassword(email, password); 
        await window.auth.currentUser.updateProfile({
            displayName: emailInput 
        });

        await saveUserDataToFirestore(result.user); 
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
        // ချက်ချင်း Home page သို့ သွားစေရန်
        showPage('home-page'); 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// 2. Login Function
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); 
        await saveUserDataToFirestore(result.user); 
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
        showPage('home-page'); 

    } catch (error) {
        messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    }
};

// 3. Logout Function
window.handleLogout = async () => {
    try {
        await window.auth.signOut();
    } catch (error) {
        console.error("Logout Error:", error);
    }
};


// 4. Auth State Check Logic (Reload တွင် လက်ရှိ Page ကို ထိန်းထားခြင်း)
// =================================================
// 🚨 Part 3: Authentication Logic (Final Version)
// =================================================

// 4. Auth State Check Logic (Reload တွင် လက်ရှိ Page ကို URL Hash ဖြင့် ထိန်းထားခြင်း)

// ✅ ဤ Function သည် Reload လုပ်တိုင်း (သို့မဟုတ် Login state ပြောင်းတိုင်း) အလုပ်လုပ်မည်
window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    
    // 1. Navigation Bar ၏ မြင်ကွင်းကို ထိန်းချုပ်ခြင်း
    if (navBar) {
        navBar.style.display = user ? 'flex' : 'none';
    }

    if (user) {
        // 2. Login ဝင်ထားသော User များအတွက် (Persistence Logic)
        
        // 💡 URL Hash (#profile-page, #admin-page) မှ Page ID ကို ရယူခြင်း
        const hash = window.location.hash.substring(1); // # ကို ဖြုတ်ပြီး ရယူ
        
        // 🚨 Reload လုပ်တဲ့အခါ Hash ရှိရင် ထို Page ကို ပြန်သွားပါမည်။
        if (hash && hash !== 'login-page' && hash !== 'register-page') {
            showPage(hash);
        } else {
            // Hash မရှိရင် Home Page ကို ပို့ပါမည်။
            showPage('home-page');
        }
        
    } else {
        // 3. Login မဝင်ထားသူများအတွက်
        
        // Login Page ကိုသာ ပြပါမည်။
        showPage('login-page');
    }
});
// =================================================
// 🚨 Part 4: Profile Page Logic & All User Update Functions
// =================================================

// 1. Profile Data များကို Load လုပ်ခြင်း
window.loadProfileData = () => {
    const user = window.auth.currentUser;
    if (!user) return; 

    document.getElementById('display-username').textContent = user.displayName || user.email.replace('@dummy.com', '');
    document.getElementById('display-email').textContent = user.email;
    document.getElementById('creation-date').textContent = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';
    document.getElementById('profile-photo').src = user.photoURL || 'default_user.png';

    const adminButton = document.getElementById('admin-nav-button');
    if (adminButton) {
        if (user.email === ADMIN_EMAIL) {
            adminButton.style.display = 'block';
        } else {
            adminButton.style.display = 'none';
        }
    }
};
// 🚨 sendMessage Function ကို အစားထိုးပါ (Part 5)
window.sendMessage = async () => {
    const user = window.auth.currentUser;
    const chatInput = document.getElementById('chat-input');
    const messageText = chatInput.value.trim();

    if (!user) {
        alert('စာပို့ရန်အတွက် Login ဝင်ပေးပါ။');
        return;
    }
    if (!messageText) return;

    // 💡 ပြင်ဆင်ချက်: Username အစား Email အပြည့်အစုံကို သိမ်းပါ
    const fullEmail = user.email; 
    
    try {
        await window.db.collection('chats').add({
            uid: user.uid,
            // ✅ Email အပြည့်အစုံကို သိမ်းခြင်း
            username: fullEmail, 
            message: messageText,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        chatInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
        alert("စာပို့ရာတွင် အမှားဖြစ်ပွားပါသည်။");
    }
};
// =================================================
// 🚨 Part 4: Profile Page Logic & All User Update Functions
// =================================================
// ... (loadProfileData, changeUsername functions)

// 3. Profile Photo Upload လုပ်ခြင်း (ယာယီ Disable လုပ်ထားပါသည်)
window.uploadProfilePhoto = async () => {
    const messageDiv = document.getElementById('photo-upload-message');
    // 💡 Credit Card ပြဿနာကြောင့် ယာယီ disable လုပ်ထားသည်
    messageDiv.textContent = '❌ Photo Upload ဝန်ဆောင်မှု ယာယီ ပိတ်ထားပါသည်။ (Firebase Storage အတွက် Billing လိုအပ်ပါသည်)';
    console.error("Firebase Storage is disabled due to Billing requirement.");
};

// 4. Password Reset Email ပို့ခြင်း
window.sendPasswordResetEmail = async () => {
    const user = window.auth.currentUser;
    const messageDiv = document.getElementById('password-reset-message');

    if (!user || !user.email) { messageDiv.textContent = 'Login ဝင်ထားသော User ကို မတွေ့ပါ။'; return; }

    try {
        await window.auth.sendPasswordResetEmail(user.email);
        messageDiv.textContent = `✅ Password Reset Link ကို ${user.email} သို့ ပို့လိုက်ပါပြီ။`;
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
    }
};
// =================================================
// 🚨 Part 5: Global Chatbox Functionality (အသစ်ထည့်သွင်းပါ)
// =================================================

// Chatbox ပေါ်/ပျောက် လုပ်ခြင်း
window.toggleChatBox = () => {
    const chatBox = document.getElementById('chat-section');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    
    if (chatBox.style.display === 'flex') {
        chatBox.style.display = 'none';
        chatToggleBtn.style.display = 'block';
    } else {
        chatBox.style.display = 'flex';
        chatToggleBtn.style.display = 'none';
        // 💬 Chatbox ဖွင့်တာနဲ့ စကားပြောခန်းကို Load လုပ်ပါ
        loadChatMessages();
    }
};
// 🚨 Part 5: Chatbox Logic အောက်တွင် ထပ်ထည့်ရန်
// 🗑️ Admin က Message ကို ဖျက်ရန် Function
window.deleteMessage = async (messageId) => {
    const user = window.auth.currentUser;
    // 💡 Admin ဖြစ်မဖြစ် စစ်ဆေးခြင်း
    if (!user || user.email !== 'soeer71@dummy.com') {
        alert("❌ သင့်တွင် ဤစာကို ဖျက်ခွင့်မရှိပါ။ (Admin သာ ဖျက်နိုင်ပါသည်။)");
        return;
    }
    
    if (confirm("ဤ Chat Message ကို ဖျက်မှာ သေချာပါသလား။")) {
        try {
            // ✅ Firestore မှ Message ကို ဖျက်ခြင်း
            await window.db.collection('chats').doc(messageId).delete();
            // Real-time Listener က အလိုအလျောက် update လုပ်ပါမည်။
        } catch (error) {
            console.error("Error deleting message:", error);
            alert(`စာဖျက်ရာတွင် အမှားဖြစ်ပွားပါသည်။: ${error.message}`);
        }
    }
};


// 🚨 sendMessage Function ကို အစားထိုးပါ (Part 5)
window.sendMessage = async () => {
    const user = window.auth.currentUser;
    const chatInput = document.getElementById('chat-input');
    const messageText = chatInput.value.trim();

    if (!user) {
        alert('စာပို့ရန်အတွက် Login ဝင်ပေးပါ။');
        return;
    }
    if (!messageText) return;

    // 💡 ပြင်ဆင်ချက်: Username အစား Email အပြည့်အစုံကို သိမ်းပါ
    const fullEmail = user.email; 
    
    try {
        await window.db.collection('chats').add({
            uid: user.uid,
            // ✅ Email အပြည့်အစုံကို သိမ်းခြင်း
            username: fullEmail, 
            message: messageText,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        chatInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
        alert("စာပို့ရာတွင် အမှားဖြစ်ပွားပါသည်။");
    }
};

// 🚨 loadChatMessages Function ကို ပြန်လည် အစားထိုးပါ (Part 5)
function loadChatMessages() {
    if (unsubscribeChat) unsubscribeChat(); 

    const chatMessagesDiv = document.getElementById('chat-messages');
    
    unsubscribeChat = window.db.collection('chats')
        .orderBy('timestamp', 'asc') 
        .limit(50) 
        .onSnapshot(snapshot => {
            chatMessagesDiv.innerHTML = ''; 
            snapshot.forEach(doc => {
                const data = doc.data();
                const messageId = doc.id; // ✅ Message ID ကို ဖျက်ဖို့အတွက် ရယူခြင်း
                const messageElement = document.createElement('div');
                const time = data.timestamp ? data.timestamp.toDate().toLocaleTimeString() : '...';
                
                // Admin ဖြစ်မဖြစ် စစ်ဆေးခြင်း
                const isUserAdmin = data.username.includes('@dummy.com'); 
                const displayUsername = data.username.split('@')[0];
                const displayName = isUserAdmin ? `${displayUsername} 👑` : displayUsername;
                
                // 🗑️ Delete Button HTML ကို Admin ဖြစ်မှသာ ပြသခြင်း
                const deleteButtonHtml = isUserAdmin 
                    ? `<button onclick="window.deleteMessage('${messageId}')" style="background: none; border: none; color: #e74c3c; font-size: 10px; cursor: pointer; float: right; margin-left: 5px;">[X]</button>`
                    : '';
                
                messageElement.innerHTML = `
                    <p style="margin: 5px 0 10px 0; font-size: 14px; border-bottom: 1px dotted #eee; padding-bottom: 5px; color: black; display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="flex-grow: 1;">
                            <strong style="color: ${isUserAdmin ? '#c0392b' : '#34495e'};">${displayName}:</strong> 
                            <span style="color: black;">${data.message}</span>
                        </span>
                        
                        <span style="display: flex; align-items: center;">
                            <span style="font-size: 10px; color: #95a5a6;">${time}</span>
                            ${deleteButtonHtml} 
                        </span>
                    </p>
                `;
                chatMessagesDiv.appendChild(messageElement);
            });
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }, error => {
            console.error("Error loading chat messages:", error);
            chatMessagesDiv.innerHTML = '<p style="color: red;">Chat messages များကို Load မလုပ်နိုင်ပါ။</p>';
        });
}
// 💬 Auth State ပြောင်းတိုင်း chat listener ကို စတင်/ရပ်တန့်ခြင်း
window.auth.onAuthStateChanged((user) => {
    if (user) {
        // Login ဝင်လာရင် Chatbox ကို စတင်နိုင်ပြီ။
        // Note: chatbox ကို ဖွင့်မှသာ loadChatMessages() ကို ခေါ်ပါမည်။
    } else {
        // Logout လုပ်ရင် Listener ကို ဖြုတ်ပါ
        if (unsubscribeChat) unsubscribeChat();
    }
});
// =================================================
// 🚨 Part 5: Video Player & Data Persistence Logic (Like/Comment)
// =================================================

let videos = [
    { 
        id: 1, 
        url: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&st=u8dfzund&dl=1',
        title: 'ထိုင်းကျောင်းသူမလေးလီးတုနဲ့လိုးပြနေသည်', 
        download: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&st=u8dfzund&dl=1', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 2, 
        url: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&st=0dpqj5da&dl=1',
        title: 'ထိုင်ကျောင်းသူမလေးသူဘဲကြီးနဲ့လိုးပြနေသည်', 
        download: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&st=0dpqj5da&dl=1',
        currentLikes: 15, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 3, 
        url: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mp4?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&st=irvwtia2&dl=1',
        title: 'ထိုင်း‌ ကျောင်းသူလေး', 
        download: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mpq?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&st=irvwtia2&dl=1', 
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
        videos = JSON.parse(storedData); 
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
    
    // 💡 Comment Delete အတွက် Admin Check
    const isAdminUser = currentUser && currentUser.email === ADMIN_EMAIL; 

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        let deleteButton = '';
        // ✅ Comment ရေးတဲ့သူ ဒါမှမဟုတ် Admin ဖြစ်ရင်သာ Delete Button ပေါ်စေ
        if (comment.user === currentUsername || isAdminUser) { 
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
// 🚨 Part 6: Video Sidebar/List Functions
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
    
    sidebar.innerHTML = '<h4>နောက်ထပ်videoများ</h4>';
    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = `sidebar-item marq-item`; 
        
        item.innerHTML = `
            <span class="video-index">${index + 1}.</span>
            <span class="video-title-marquee">${video.title}</span>
        `;
        
        item.onclick = () => loadVideo(video, index);
        sidebar.appendChild(item);
    });
    updateSidebarHighlight();
}

// =================================================
// 🚨 Part 7: Admin Panel Logic (Final Working Version)
// =================================================

// 💡 Helper Function: User Data ကို Firestore ထဲသိမ်းဆည်းရန်
async function saveUserDataToFirestore(user) {
    const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
    const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Date.now();
    
    // ⚠️ Admin Email ဖြစ်ပါက is_admin: true အလိုအလျောက် ပေးခြင်း
    const isAdminUser = user.email === ADMIN_EMAIL; 

    const userRef = window.db.collection('users').doc(user.uid);
    try {
        await userRef.set({
            email: user.email,
            displayName: user.displayName || user.email.replace('@dummy.com', ''),
            creationTime: creationTime,
            lastSignInTime: lastSignInTime,
            is_admin: isAdminUser // ✅ Admin flag ကို Firestore ထဲ ထည့်လိုက်ပါပြီ
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
    }
}
window.saveUserDataToFirestore = saveUserDataToFirestore;


async function checkAdminStatus() {
    const user = window.auth.currentUser;
    const adminStatusDiv = document.getElementById('admin-status');
    const userListContainer = document.getElementById('user-list-container');
    
    if (!user) {
        if (adminStatusDiv) adminStatusDiv.textContent = 'Admin ဝင်ရောက်ထားခြင်း မရှိပါ။';
        if (userListContainer) userListContainer.style.display = 'none';
        return false;
    }

    if (adminStatusDiv) adminStatusDiv.textContent = 'Checking admin permissions...';

    try {
        // 2. Firestore ကနေ is_admin flag ကို ဆွဲထုတ်စစ်ဆေးခြင်း
        const userDoc = await window.db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // 3. Admin စစ်ဆေးခြင်း (Email သို့မဟုတ် Firestore flag)
        const isUserAdmin = userData && userData.is_admin === true; 

        if (isUserAdmin || user.email === ADMIN_EMAIL) {
            if (adminStatusDiv) adminStatusDiv.textContent = '✅ Admin အဖြစ် ဝင်ရောက်ထားပါသည်။';
            if (userListContainer) userListContainer.style.display = 'block';
            await loadUserList(); // ✅ Admin ဖြစ်မှ User List ကို Load လုပ်ပါ
            return true;
        } else {
            if (adminStatusDiv) adminStatusDiv.textContent = `❌ သင့်မှာ Admin ခွင့်ပြုချက် မရှိပါ။ (Login: ${user.email.replace('@dummy.com', '')})`;
            if (userListContainer) userListContainer.style.display = 'none';
            return false;
        }
    } catch (error) {
        console.error("Admin check failed:", error);
        // Error ပေါ်လာပါက Rules Error များ ဖြစ်နိုင်
        if (adminStatusDiv) adminStatusDiv.textContent = `🚨 Permission check failed: ${error.code || error.message}. Check Firestore Rules!`;
        if (userListContainer) userListContainer.style.display = 'none';
        return false;
    }
}
window.checkAdminStatus = checkAdminStatus;


window.loadUserList = async () => {
    const userList = document.getElementById('user-list');
    if (!userList) return; 

    userList.innerHTML = '<li>User Data များကို ခေါ်ယူနေပါသည်။...</li>';

    try {
        // Rules မှာ ခွင့်ပြုထားရင် ဒီကနေ Data ရပါမည်
        const snapshot = await window.db.collection('users').get(); 
        
        if (snapshot.empty) {
            userList.innerHTML = '<li>မှတ်ပုံတင်ထားသော User မရှိပါ။</li>';
            return;
        }

        userList.innerHTML = '';
        snapshot.forEach(doc => {
            const userData = doc.data();
            const isAdmin = userData.is_admin ? ' (👑 Admin)' : '';
            const li = document.createElement('li');
            li.style.cssText = 'border-bottom: 1px solid #ccc; padding: 5px 0; margin-bottom: 5px;';
            li.innerHTML = `
                <strong>User ID:</strong> ${doc.id}<br>
                <strong>Email:</strong> ${userData.email || 'N/A'} ${isAdmin}<br>
                <strong>Username:</strong> ${userData.displayName || 'N/A'}<br>
                <strong>Registered:</strong> ${new Date(userData.creationTime).toLocaleString()}<br>
            `;
            userList.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading user list:", error);
        // ❌ Rules error/Permission Denied မှန်ကန်စွာ ဖမ်းမိစေရန်
        userList.innerHTML = `<li>🚨 Data ခေါ်ယူရာတွင် အမှားဖြစ်ပွားပါသည်။: **${error.code || 'Unknown Error'}** - Firestore Rules များကို စစ်ဆေးပါ။</li>`;
    }
};
      
