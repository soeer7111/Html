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
        // ✅ Profile Page ကို ဝင်တာနဲ့ Data Load ဖို့ ခေါ်ပါတယ်
        loadProfileData(); 
    }
}
window.showPage = showPage;

// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout)
// =================================================

// 1. Register Function (Part 7 တွင် saveUserDataToFirestore ပါဝင်ပြီးသား)
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        const result = await window.auth.createUserWithEmailAndPassword(email, password); 
        await window.auth.signInWithEmailAndPassword(email, password); 
        
        await window.auth.currentUser.updateProfile({
            displayName: emailInput 
        });

        // Firestore ထဲကို User Data သိမ်းဆည်းရန် (Part 7 မှ Function ကို ခေါ်သည်)
        await saveUserDataToFirestore(result.user); 

        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// 2. Login Function (Part 7 တွင် saveUserDataToFirestore ပါဝင်ပြီးသား)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
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

// 3. Logout Function
window.handleLogout = async () => {
    try {
        await window.auth.signOut();
    } catch (error) {
        console.error("Logout Error:", error);
    }
};


// 4. ✅ Auth State Check Logic (Login Page ပြန်မရောက်စေရန်နှင့် Page Navigation အတွက်)
window.auth.onAuthStateChanged((user) => {
    // Loading Screen ကို ဖျောက်ပါ
    const loadingPage = document.getElementById('loading-page');
    if (loadingPage) loadingPage.style.display = 'none';

    const navBar = document.getElementById('nav-bar');
    
    if (user) {
        // Login ဝင်ထားရင်
        if (navBar) navBar.style.display = 'flex'; 
        showPage('home-page'); 

    } else {
        // Login မဝင်ထားရင်
        if (navBar) navBar.style.display = 'none';
        showPage('login-page');
    }
});

// =================================================
// 🚨 Part 4: Profile Page Logic (Display & Admin Button)
// =================================================
window.loadProfileData = () => {
    const user = window.auth.currentUser;
    if (!user) {
        // Login မဝင်ထားရင် ဘာမှ မလုပ်ပါ
        return; 
    }
    
    // ⚠️ Part 7 မှ Admin Email ကို ဒီမှာ ပြန်သတ်မှတ်ပါ
    const ADMIN_EMAIL = 'soeer71@dummy.com'; 
    
    // 1. User Info များကို ပြသခြင်း
    document.getElementById('display-username').textContent = user.displayName || user.email.replace('@dummy.com', '');
    document.getElementById('display-email').textContent = user.email;
    document.getElementById('creation-date').textContent = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';
    // ဓာတ်ပုံ မရှိရင် default_user.png ပြသပါ
    document.getElementById('profile-photo').src = user.photoURL || 'default_user.png'; 

    // 2. Admin Button ကို စစ်ဆေးပြီး ပြသခြင်း
    const adminButton = document.getElementById('admin-nav-button');
    if (adminButton) {
        if (user.email === ADMIN_EMAIL) {
            adminButton.style.display = 'block';
        } else {
            adminButton.style.display = 'none';
        }
    }
};
// ⚠️ သင့်ရဲ့ app.js မှာ loadProfileData() အဟောင်းကို ဤအသစ်ဖြင့် အစားထိုးပါ
// =================================================
// 🚨 Part 5: User Profile Update Functions (Username, Photo, Password Reset)
//    (Video Player Logic အပြီးတွင် ထပ်ထည့်ပါ)
// =================================================

// 1. Username ပြောင်းလဲခြင်း
window.changeUsername = async () => {
    const user = window.auth.currentUser;
    const newUsernameInput = document.getElementById('new-username-input').value.trim();
    const messageDiv = document.getElementById('username-message');

    if (!user || !newUsernameInput) {
        messageDiv.textContent = 'Username အသစ် ထည့်သွင်းပါ။';
        return;
    }
    
    try {
        await user.updateProfile({
            displayName: newUsernameInput
        });
        
        // Firestore ထဲက Data ကိုပါ ပြင်ဆင်ခြင်း
        await window.db.collection('users').doc(user.uid).set({
            displayName: newUsernameInput
        }, { merge: true });

        messageDiv.textContent = 'Username ပြောင်းလဲ အောင်မြင်ပါသည်။';
        document.getElementById('display-username').textContent = newUsernameInput; 
        document.getElementById('new-username-input').value = ''; 

    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
    }
};

// 2. Profile Photo Upload လုပ်ခြင်း
window.uploadProfilePhoto = async () => {
    const user = window.auth.currentUser;
    const fileInput = document.getElementById('photo-upload-input');
    const messageDiv = document.getElementById('photo-upload-message');
    const file = fileInput.files[0];

    if (!user || !file) {
        messageDiv.textContent = 'ဓာတ်ပုံဖိုင် ရွေးချယ်ပါ။';
        return;
    }

    messageDiv.textContent = 'Uploading...';
    // ⚠️ window.storage ကို Part 1 မှာ initialize လုပ်ထားရပါမည်
    try {
        const storageRef = window.storage.ref(`profile_photos/${user.uid}/${file.name}`);
        const uploadTask = storageRef.put(file);

        await uploadTask;
        const photoURL = await storageRef.getDownloadURL();

        await user.updateProfile({
            photoURL: photoURL
        });

        document.getElementById('profile-photo').src = photoURL;
        messageDiv.textContent = 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ။';

    } catch (error) {
        messageDiv.textContent = `Upload Error: ${error.message}`;
    }
};

// 3. Password Reset Email ပို့ခြင်း
window.sendPasswordResetEmail = async () => {
    const user = window.auth.currentUser;
    const messageDiv = document.getElementById('password-reset-message');

    if (!user || !user.email) {
        messageDiv.textContent = 'Login ဝင်ထားသော User ကို မတွေ့ပါ။';
        return;
    }

    try {
        await window.auth.sendPasswordResetEmail(user.email);
        messageDiv.textContent = `✅ Password Reset Link ကို ${user.email} သို့ ပို့လိုက်ပါပြီ။`;
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
    }
};



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
                
                <strong>Last Sign In:</strong> ${new Date(userData.lastSignInTime).toLocal
