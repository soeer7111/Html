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
// Login Function (ပြင်ဆင်ချက်)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); // Result ကို ဖမ်းယူပါ
        
        // ✅ Firestore ထဲကို User Data သိမ်းဆည်းရန် ထပ်တိုးလိုက်သည်
        await saveUserDataToFirestore(result.user); 

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

// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout) အောက်မှာ
// =================================================

// ... (handleLogin, handleRegister, handleLogout functions များရှိရပါမည်)

// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout) အောက်မှာ
// =================================================

// ... (handleLogin, handleRegister, handleLogout functions များရှိရပါမည်)

// ✅ ဤသည်မှာ Auth State Check Logic အဟောင်းကို အစားထိုးရမည့် Code ဖြစ်သည်
window.auth.onAuthStateChanged((user) => {
    // 1. Loading Page (သို့မဟုတ်) Initial UI များကို ဖျောက်ပါ
    document.getElementById('loading-page').style.display = 'none';

    if (user) {
        // User Login ဝင်ထားရင်
        // 2. Navigation Bar ကို ပြပါ (Logout Button ပါဝင်သည်)
        document.getElementById('nav-bar').style.display = 'flex'; 
        
        // 3. Home Page ကို တိုက်ရိုက် ပြသပါ
        showPage('home-page'); 

    } else {
        // User Login မဝင်ထားရင်
        // 2. Navigation Bar ကို ဝှက်ပါ
        document.getElementById('nav-bar').style.display = 'none';
        
        // 3. Login Page ကို ပြပါ
        showPage('login-page');
    }


        // 4. Admin Account ဖြစ်မဖြစ် စစ်ဆေးပြီး Profile မှာ Admin Button ပြသရန်
        const adminButton = document.getElementById('admin-nav-button');
        if (adminButton && user.email === ADMIN_EMAIL) {
             adminButton.style.display = 'block';
        }

    } else {
        // User Login မဝင်ထားရင်
        // 2. Navigation Bar ကို ဝှက်ပါ
        document.getElementById('nav-bar').style.display = 'none';
        
        // 3. Login Page ကို ပြပါ
        showPage('login-page');
    }
});

// =================================================
// 🚨 Part 4: Profile Update Logic (Photo Upload ဖြုတ်ထားသည်)
// =================================================
// 🚨 Part 4: Profile Page Logic အောက်က loadProfileData ကို ပြင်ပါ
window.loadProfileData = () => {
    // ... (ရှိပြီးသား profile code များ) ...

    // Admin Button ကို စစ်ဆေးပြီး ပြသခြင်း
    const adminButton = document.getElementById('admin-nav-button');
    if (checkAdminStatus()) {
        adminButton.style.display = 'block'; // Admin ဖြစ်ရင် ပြပါ
    } else {
        adminButton.style.display = 'none'; // မဟုတ်ရင် ဖျောက်ပါ
    }
};

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
// =================================================
// 🚨 Part 5: Video Player & Data Persistence Logic (Like/Comment)
// =================================================

// =================================================
// 🚨 Part 5: Video Player & Data Persistence Logic (Like/Comment)
// =================================================

let videos = [
    { 
        id: 1, 
        // ✅ Google Drive Direct Stream URL အသစ်
        url: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&st=u8dfzund&dl=1',
        title: 'ထိုင်းကျောင်းသူမလေးလီးတုနဲ့လိုးပြနေသည်', 
        
        // ✅ Download အတွက်ကိုလည်း Direct Link ကိုသာ ထည့်ထားပါသည်
        download: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&st=u8dfzund&dl=1', 
        
        currentLikes: 8, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 2, 
        // ⚠️ Video 2 အတွက်ကိုလည်း လောလောဆယ် Link အတူတူ သုံးထားလိုက်ပါမည်။
        url: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&st=0dpqj5da&dl=1',
        title: 'ထိုင်ကျောင်းသူမလေးသူဘဲကြီးနဲ့လိုးပြနေသည်', 
        
        download: 'https://www.dropbox.com/scl/fi/3pvicl6ck8oiyimuf3izh/5_6208271644641729120.mp4?rlkey=knc74hnso7d6076icwqda4w6a&st=0dpqj5da&dl=1',
        
        currentLikes: 15, 
        userLiked: false, 
        currentComments: []
    },
    { 
        id: 3, 
        // ✅ Pcloud လင့်ခ်အသစ်ကို 'url' မှာ ထည့်သွင်းလိုက်ပါပြီ
        url: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mp4?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&st=irvwtia2&dl=1',
        title: 'ထိုင်း‌ ကျောင်းသူလေး', 
        
        // ✅ Pcloud လင့်ခ်အသစ်ကို 'download' မှာ ထည့်သွင်းလိုက်ပါပြီ
        download: 'https://www.dropbox.com/scl/fi/zglupxm7oaa1xzfzlf427/VID_20251108_164004_870.mp4?rlkey=pe5pxns9stqmzz2hg2lxpjxnu&st=irvwtia2&dl=1', 
        
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
    
    sidebar.innerHTML = '<h4>နောက်ထပ်videoများ</h4>';
    videos.forEach((video, index) => {
        const item = document.createElement('div');
        // 💡 sidebar-item အစား marq-item ကိုပါ ထည့်လိုက်သည်
        item.className = `sidebar-item marq-item`; 
        
        // 💡 Text ကို <marquee> သို့မဟုတ် CSS animation အတွက် <span> ထဲ ထည့်သည်
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

// ⚠️ Admin Email ကို သတ်မှတ်ခြင်း (သင့်ရဲ့ Admin Username ကို @dummy.com ထည့်ပြီး ဖြည့်ပါ)
const ADMIN_EMAIL = 'soeer71@dummy.com'; 

// 💡 Helper Function: User Data ကို Firestore ထဲသိမ်းဆည်းရန်
async function saveUserDataToFirestore(user) {
    // Auth Data ကနေ Time များကို ရယူပြီး သိမ်းဆည်းရန်
    const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
    const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Date.now();

    const userRef = window.db.collection('users').doc(user.uid);
    try {
        await userRef.set({
            email: user.email,
            displayName: user.displayName || user.email.replace('@dummy.com', ''),
            creationTime: creationTime,
            lastSignInTime: lastSignInTime,
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
    }
}
window.saveUserDataToFirestore = saveUserDataToFirestore;


function checkAdminStatus() {
    const user = window.auth.currentUser;
    const adminStatusDiv = document.getElementById('admin-status');
    const userListContainer = document.getElementById('user-list-container');
    
    if (!user) {
        adminStatusDiv.textContent = 'Admin ဝင်ရောက်ထားခြင်း မရှိပါ။';
        userListContainer.style.display = 'none';
        return false;
    }

    // Email ကို @dummy.com ဖြုတ်ပြီး စစ်ဆေးသည်
    const currentUsername = user.email.includes('@dummy.com') ? user.email.replace('@dummy.com', '') : user.email.split('@')[0];
    const adminUsername = ADMIN_EMAIL.replace('@dummy.com', '').split('@')[0];

    if (currentUsername === adminUsername) {
        adminStatusDiv.textContent = '✅ Admin အဖြစ် ဝင်ရောက်ထားပါသည်။';
        userListContainer.style.display = 'block';
        loadUserList(); // Admin ဖြစ်မှ User List ကို Load လုပ်ပါ
        return true;
    } else {
        adminStatusDiv.textContent = `❌ သင့်မှာ Admin ခွင့်ပြုချက် မရှိပါ။ (Login: ${currentUsername})`;
        userListContainer.style.display = 'none';
        return false;
    }
}
window.checkAdminStatus = checkAdminStatus;


window.loadUserList = async () => {
    // ⚠️ Note: checkAdminStatus() သည် Part 7 တွင် ရှိပြီးသားဖြစ်ရပါမည်။
    if (!checkAdminStatus()) return; 

    const userList = document.getElementById('user-list');
    userList.innerHTML = '<li>User Data များကို ခေါ်ယူနေပါသည်။...</li>';

    try {
        const snapshot = await window.db.collection('users').get(); 
        
        if (snapshot.empty) {
            userList.innerHTML = '<li>မှတ်ပုံတင်ထားသော User မရှိပါ။</li>';
            return;
        }

        userList.innerHTML = '';
        snapshot.forEach(doc => {
            const userData = doc.data();
            const li = document.createElement('li');
            li.style.cssText = 'border-bottom: 1px solid #ccc; padding: 5px 0; margin-bottom: 5px;';
            li.innerHTML = `
                <strong>User ID:</strong> ${doc.id}<br>
                <strong>Phone/Display Name:</strong> ${userData.displayName || 'N/A'}<br>
                <strong>Email:</strong> ${userData.email || 'N/A'}<br>
                <strong>Registered:</strong> ${new Date(userData.creationTime).toLocaleString()}<br>
                
                <strong>Last Sign In:</strong> ${new Date(userData.lastSignInTime).toLocaleString()}<br> 
            `;
            userList.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading user list:", error);
        userList.innerHTML = `<li>Data ခေါ်ယူရာတွင် အမှားဖြစ်ပွားပါသည်။: ${error.message}</li>`;
    }
};
// window.loadUserList ကို အစားထိုးပါ

// -----------------------------------------------------------------------
// ⚠️ ဤ Functions များကို Part 3 တွင် ရှိသင့်သော်လည်း ရှင်းလင်းရန် ဤနေရာတွင် ထားပါသည်
// -----------------------------------------------------------------------

// ✅ Login Function (email variable ထပ်တိုးပြီး)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    // ❌ ပျောက်နေသော email variable ကို ဒီမှာ ပြန်ထည့်ပေးလိုက်သည်
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); 
        
        // Firestore ထဲကို User Data သိမ်းဆည်းရန်
        await saveUserDataToFirestore(result.user); 

        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
        showPage('home-page'); 

    } catch (error) {
        messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    }
};

// ✅ Register Function (email variable ထပ်တိုးပြီး)
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    // ❌ ပျောက်နေသော email variable ကို ဒီမှာ ပြန်ထည့်ပေးလိုက်သည်
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        const result = await window.auth.createUserWithEmailAndPassword(email, password); 
        await window.auth.signInWithEmailAndPassword(email, password); 
        
        await window.auth.currentUser.updateProfile({
            displayName: emailInput 
        });

        // Firestore ထဲကို User Data သိမ်းဆည်းရန်
        await saveUserDataToFirestore(result.user); 

        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};
      
