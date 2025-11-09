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
let unsubscribeChat; // Chat listener ကို သိမ်းရန်

// =================================================
// 🚨 Part 2: Page Navigation & UI Functions
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
    if (navBar) {
        if (pageId === 'home-page' || pageId === 'profile-page' || pageId === 'admin-page') {
            navBar.style.display = 'flex';
        } else {
            navBar.style.display = 'none';
        }
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
// 🚨 Part 3: Authentication (Login/Register/Logout/State Check)
// =================================================

// 💡 Helper: Firestore တွင် User Data သိမ်းခြင်း (Register/Login တွင် လိုအပ်ပါက)
async function saveUserDataToFirestore(user) {
    // ဤနေရာတွင် User ကို Firestore တွင် သိမ်းလိုပါက Code ရေးနိုင်ပါသည်။
    // ဥပမာ- window.db.collection('users').doc(user.uid).set({ email: user.email, ... }, { merge: true });
}

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

// 4. Auth State Check Logic (Reload တွင် လက်ရှိ Page ကို URL Hash ဖြင့် ထိန်းထားခြင်း)
window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    
    // Navigation Bar ၏ မြင်ကွင်းကို ထိန်းချုပ်ခြင်း
    if (navBar) {
        navBar.style.display = user ? 'flex' : 'none';
    }

    if (user) {
        // Login ဝင်ထားသော User များအတွက် (Persistence Logic)
        const hash = window.location.hash.substring(1); 
        
        if (hash && hash !== 'login-page' && hash !== 'register-page') {
            showPage(hash);
        } else {
            showPage('home-page');
        }
        
    } else {
        // Login မဝင်ထားသူများအတွက်
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

    // Admin Button ကို ပြ/ဖျောက် လုပ်ခြင်း
    const adminButton = document.getElementById('admin-nav-button');
    if (adminButton) {
        if (user.email === ADMIN_EMAIL) {
            adminButton.style.display = 'block';
        } else {
            adminButton.style.display = 'none';
        }
    }
};

// 2. Username ပြောင်းလဲခြင်း Function (ဤနေရာတွင် ထည့်မထားပါ)

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
// 🚨 Part 5: Global Chatbox Functionality
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

// စာပို့ခြင်း Function
window.sendMessage = async () => {
    const user = window.auth.currentUser;
    const chatInput = document.getElementById('chat-input');
    const messageText = chatInput.value.trim();

    if (!user) {
        alert('စာပို့ရန်အတွက် Login ဝင်ပေးပါ။');
        return;
    }
    if (!messageText) return;

    // 💡 ပြင်ဆင်ချက်: Email အပြည့်အစုံကို သိမ်းခြင်း
    const fullEmail = user.email; 
    
    try {
        await window.db.collection('chats').add({
            uid: user.uid,
            username: fullEmail, // ✅ Email အပြည့်အစုံကို သိမ်းခြင်း (Admin စစ်ဆေးဖို့)
            message: messageText,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        chatInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
        alert("စာပို့ရာတွင် အမှားဖြစ်ပွားပါသည်။");
    }
};

// 🗑️ Admin က Message ကို ဖျက်ရန် Function
window.deleteMessage = async (messageId) => {
    const user = window.auth.currentUser;
    // 💡 Admin ဖြစ်မဖြစ် စစ်ဆေးခြင်း
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("❌ သင့်တွင် ဤစာကို ဖျက်ခွင့်မရှိပါ။ (Admin သာ ဖျက်နိုင်ပါသည်။)");
        return;
    }
    
    if (confirm("ဤ Chat Message ကို ဖျက်မှာ သေချာပါသလား။")) {
        try {
            await window.db.collection('chats').doc(messageId).delete();
        } catch (error) {
            console.error("Error deleting message:", error);
            alert(`စာဖျက်ရာတွင် အမှားဖြစ်ပွားပါသည်။: ${error.message}`);
        }
    }
};

// Chat Message များ Real-time Load လုပ်ခြင်း
function loadChatMessages() {
    if (unsubscribeChat) unsubscribeChat(); 

    const chatMessagesDiv = document.getElementById('chat-messages');
    
    unsubscribeChat = window.db.collection('chats')
        .orderBy('timestamp', 'asc') 
        .limit(50) 
        .onSnapshot(snapshot => {
            chatMessagesDiv.innerHTML = ''; 
            const currentUser = window.auth.currentUser; // လက်ရှိ user ကို ရယူ
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const messageId = doc.id; 
                const messageElement = document.createElement('div');
                const time = data.timestamp ? data.timestamp.toDate().toLocaleTimeString() : '...';
                
                // Admin ဖြစ်မဖြစ် စစ်ဆေးခြင်း (Email အပြည့်အစုံဖြင့်)
                const isUserAdmin = data.username === ADMIN_EMAIL; 
                
                // Display တွင် Username ကိုသာ ပြသရန်
                const displayUsername = data.username.split('@')[0];
                const displayName = isUserAdmin ? `${displayUsername} 👑` : displayUsername;
                
                // Delete Button ကို Admin ဖြစ်မှသာ ပြသခြင်း
                const deleteButtonHtml = (currentUser && currentUser.email === ADMIN_EMAIL) 
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

// =================================================
// 🚨 Part 6: Video Player & Data Persistence Logic (Like/Comment)
// =================================================

// ⚠️ Note: Like/Comment data ကို Firestore ဖြင့် မပြောင်းရသေးဘဲ LocalStorage ဖြင့်သာ ဆက်လက်သုံးစွဲထားသည်။

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

    renderSidebar(); // 💡 Sidebar rendering function (ယခင် Code ထဲမှ ပျောက်နေသည်ကို ပြန်ထည့်ရန်လိုအပ်သည်)
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
    updateSidebarHighlight(); // 💡 Sidebar highlight function (ယခင် Code ထဲမှ ပျောက်နေသည်ကို ပြန်ထည့်ရန်လိုအပ်သည်)
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
    
    if (!user) { alert('Comment ရေးရန် Login ဝင်ပေးပါ။'); return; }

    const username = user.email; // ✅ Email အပြည့်အစုံကို Comment မှာပါ ထည့်သိမ်းပါ
    
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
    const currentUser = window.auth.currentUser;
    const isAdminUser = currentUser && currentUser.email === ADMIN_EMAIL; 

    if (video && currentUser) {
        const commentIndex = video.currentComments.findIndex(c => c.id === commentId);

        if (commentIndex !== -1) {
             // ✅ Comment ကို ရေးသူ သို့မဟုတ် Admin ဖြစ်မှသာ ဖျက်ခွင့်ပေးပါ
            const commentUser = video.currentComments[commentIndex].user;
            if (commentUser === currentUser.email || isAdminUser) {
                video.currentComments.splice(commentIndex, 1);
                saveDataToStorage();
                renderComments(video);
            } else {
                alert('ဤ Comment ကို ဖျက်ခွင့်မရှိပါ။');
            }
        }
    }
}

function renderComments(video) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    document.getElementById('comment-count').textContent = video.currentComments.length;
    
    const currentUser = window.auth.currentUser;
    const isAdminUser = currentUser && currentUser.email === ADMIN_EMAIL; 

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        // Display name ကို @ ရှေ့က စာလုံးသာပြသခြင်း
        const displayCommentUser = comment.user.split('@')[0];
        
        let deleteButton = '';
        // ✅ Comment ရေးတဲ့သူ သို့မဟုတ် Admin ဖြစ်ရင်သာ Delete Button ပေါ်စေ
        if (currentUser && (comment.user === currentUser.email || isAdminUser)) { 
             deleteButton = `<button style="float:right; background:red; padding:2px 5px; margin-left:10px; width:auto; font-size: 0.7em;" onclick="window.deleteComment(${video.id}, ${comment.id})">❌</button>`;
        }
        
        div.innerHTML = `
            <strong>${displayCommentUser}:</strong> 
            ${deleteButton}
            ${comment.text} 
            <span style="font-size: 0.7em; color: #999;">(${comment.timestamp})</span>
        `;
        commentsList.appendChild(div);
    });
      }
