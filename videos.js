// =================================================
// 🚨 Firebase Authentication Logic (Session & Profile Update)
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
    } else if (pageId === 'profile-page') {
        loadProfileData(); // 🚨 New: Profile ဖွင့်ရင် Data ယူမည်
    }
}
window.showPage = showPage;

// Auth State ကို စစ်ဆေးပြီး UI ကို Update လုပ်ရန်
function setupAuthListener() {
    if (window.onAuthStateChanged && window.auth) {
        window.onAuthStateChanged(window.auth, (user) => {
            if (user) {
                // User Login ဝင်ထားပါက (Reload လုပ်ရင် ဒီက စပါမယ်)
                const displayEmail = user.email || 'N/A';
                const displayUsername = user.displayName || (displayEmail.includes('@dummy.com') ? displayEmail.replace('@dummy.com', '') : displayEmail.split('@')[0]);

                document.getElementById('username-display').textContent = displayUsername; 
                document.getElementById('profile-username').textContent = displayUsername; 
                
                // Photo URL ပြခြင်း
                const photoURL = user.photoURL || "https://via.placeholder.com/100?text=Profile";
                document.getElementById('profile-photo-display').src = photoURL;
                
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

// 🚨 Profile Data များကို Load လုပ်ခြင်း
function loadProfileData() {
    const user = window.auth.currentUser;
    if (user) {
        // ဖုန်းနံပါတ်ကို displayName မှာ ထည့်သိမ်းထားသည် (ဖုန်းနံပါတ်အတွက် သီးခြား Field မရှိပါ)
        document.getElementById('profile-phone').value = user.displayName || ''; 
        
        // ဓါတ်ပုံ
        const photoURL = user.photoURL || "https://via.placeholder.com/100?text=Profile";
        document.getElementById('profile-photo-display').src = photoURL;
        
        document.getElementById('profile-message').textContent = '';
    }
}

// 🚨 Profile အချက်အလက်များ (ဖုန်းနံပါတ်) ကို Update လုပ်ခြင်း
window.updateProfileDetails = async () => {
    const user = window.auth.currentUser;
    const phone = document.getElementById('profile-phone').value.trim();
    const messageDiv = document.getElementById('profile-message');

    if (!user) { messageDiv.textContent = 'User not logged in.'; return; }
    
    // ဖုန်းနံပါတ်ကို displayName မှာ သိမ်းဆည်းခြင်း
    try {
        await window.updateProfile(user, {
            displayName: phone 
        });
        messageDiv.textContent = 'ဖုန်းနံပါတ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။';
        loadProfileData(); // UI ကို ပြန် Update လုပ်သည်
    } catch (error) {
        messageDiv.textContent = `Update Failed: ${error.message}`;
    }
}

// 🚨 Profile Photo Upload လုပ်ခြင်း
window.uploadProfilePhoto = async () => {
    const user = window.auth.currentUser;
    const fileInput = document.getElementById('profile-photo-input');
    const file = fileInput.files[0];
    const messageDiv = document.getElementById('profile-message');

    if (!user || !file) { messageDiv.textContent = 'ဓါတ်ပုံ မရွေးရသေးပါ။'; return; }

    messageDiv.textContent = 'ဓါတ်ပုံ တင်နေပါသည်။ စောင့်ဆိုင်းပါ။';

    try {
        // Storage ထဲမှာ သိမ်းရန် Path
        const storageRef = window.getStorageRef(window.storage, `profile_photos/${user.uid}/${file.name}`);
        
        // ဓါတ်ပုံကို Upload လုပ်ခြင်း
        await window.uploadBytes(storageRef, file);

        // Download URL ကို ရယူခြင်း
        const photoURL = await window.getDownloadURL(storageRef);

        // User ရဲ့ Profile ကို Update လုပ်ခြင်း
        await window.updateProfile(user, {
            photoURL: photoURL
        });

        messageDiv.textContent = 'ဓါတ်ပုံ တင်ခြင်း အောင်မြင်ပါသည်။';
        loadProfileData(); // UI ကို ပြန် Update လုပ်သည်
    } catch (error) {
        messageDiv.textContent = `Upload Failed: ${error.message}`;
        console.error("Photo Upload Error:", error);
    }
}


// Register & Login functions (ယခင်အတိုင်း)
window.handleRegister = async () => { /* ... code remains the same ... */ 
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

window.handleLogin = async () => { /* ... code remains the same ... */ 
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

window.handleLogout = async () => { /* ... code remains the same ... */ 
    try {
        await window.signOut(window.auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};


// =================================================
// videos.js ထဲက 🚨 Initial Video Data အပိုင်းကို အစားထိုးရန်

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
            { user: 'User99', text: 'အရည်အသွေး ကောင်းတယ်', timestamp: '2025-11-06 12:30', id: Date.now() + 1 } 
        ]
    },
    { 
        id: 2,
        // 🚨 သုံးစွဲသူပေးထားသော Link ကို raw=1 ဖြင့် ပြန်လည်ပြင်ဆင်ထားသည်။
        url: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&raw=1', 
        title: 'ထိုင်း‌ ကျောင်းသူမလေး လီးတုနဲ့လိုးပြနေသည် (Dropbox Fix)', 
        download: 'https://www.dropbox.com/scl/fi/bfhlnun9lvqlgjuayiq56/5_6208271644641729117.mp4?rlkey=q721b4h9v5abvjme2cdc1h6u1&raw=1', 
        currentLikes: 15, 
        userLiked: false, 
        currentComments: [
            { user: 'Admin', text: 'ကောင်းလိုက်တာ!', timestamp: '2025-11-06 10:00', id: Date.now() + 2 }
        ]
    },
];

let currentVideoIndex = 0; 
let player;

// =================================================
// 👤 Profile Photo Upload & Persistence (Card မလိုသော Local Storage)
// =================================================

const profilePhotoInput = document.getElementById('profilePhotoInput');
const profilePhoto = document.getElementById('profilePhoto'); // HTML ထဲက img tag
const commentProfilePhotos = document.querySelectorAll('.comment-profile-photo');

// 1. Local Storage မှ ပုံကို Load လုပ်ခြင်း
function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    if (savedPhoto) {
        // Player နေရာက Profile Photo
        profilePhoto.src = savedPhoto;
        
        // Comment များက Profile Photo အားလုံး
        commentProfilePhotos.forEach(img => {
            img.src = savedPhoto;
        });
    }
}

// 2. Photo Upload လုပ်ပြီး Base64 အဖြစ်သိမ်းခြင်း
profilePhotoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onloadend = () => {
            // Base64 String ကို Local Storage တွင်သိမ်းဆည်းသည်။
            const base64Image = reader.result;
            localStorage.setItem('userProfilePhoto', base64Image);

            // ချက်ချင်း ပြသသည်။
            profilePhoto.src = base64Image;
            commentProfilePhotos.forEach(img => {
                img.src = base64Image;
            });

            alert('Profile Photo အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
        };

        // File ကို Base64 String အဖြစ် ဖတ်သည်။
        reader.readAsDataURL(file);
    } else {
        alert('ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင်ကိုသာ ရွေးချယ်ပါ။');
    }
});

// 3. Page စတင်တက်လာချိန်တွင် Load လုပ်ရန်
document.addEventListener('DOMContentLoaded', loadProfilePhoto);

// =================================================
// 💡 အရေးကြီး: HTML (index.html) ပြင်ရန် 
// =================================================
// 🚨 Comment နေရာများတွင် Profile Photo ကို ပြသရန်၊ comment data တွင် ပါသော 
// 🚨 'default-profile.png' ကို သင့်ရဲ့ Profile Photo (id='profilePhoto') နဲ့ တူအောင် 
// 🚨 သေချာချိတ်ဆက်ထားပါ။ (CSS ဖြင့် နေရာချထားခြင်းကို စစ်ဆေးပါ)


// ... (ကျန်တဲ့ videos.js Code များ အကုန်လုံး အတူတူပါပဲ)

// Local Storage မှ Data များကို Load လုပ်ခြင်း
function loadDataFromStorage() {
    const storedData = localStorage.getItem('videoData');
    if (storedData) {
        videos = JSON.parse(storedData); 
    } else {
        videos.forEach((v, i) => v.id = i + 1);
    }
}

// Local Storage တွင် Data များကို Save လုပ်ခြင်း
function saveDataToStorage() {
    localStorage.setItem('videoData', JSON.stringify(videos));
}

function initializeVideoPlayer() {
    // 🚨 Data ကို ဦးစွာ Load လုပ်ပြီးမှ player ကို Initialize လုပ်သည်
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
    player.src({ src: video.url, type: 'video/mp4' });
    player.load();
    
    document.getElementById('current-video-title-text').textContent = video.title;
    document.getElementById('download-link').href = video.download;
    updateLikeStatus(video);
    renderComments(video); // 🚨 Comment များကို Load လုပ်ပြီးချက်ချင်းပြသည်
    updateSidebarHighlight();
}

// Like Functions (Fix: Logic မှန်ကန်ကြောင်း အတည်ပြုပြီး Data Save ပါ ထည့်ထားသည်)
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
    
    saveDataToStorage();

    updateLikeStatus(video);
}

// 🚨 Comment Delete Function
window.deleteComment = (videoId, commentId) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
        // Comment ကို Filter လုပ်ပြီး ဖျက်သည်
        video.currentComments = video.currentComments.filter(c => c.id !== commentId);
        
        saveDataToStorage();
        renderComments(video); // Comment list ကို ပြန်ဆွဲသည်
    }
}

// Comment Functions (Delete Button ပါ ထည့်ထားသည်)
function renderComments(video) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    document.getElementById('comment-count').textContent = video.currentComments.length;
    
    // User name ကိုရယူပါ (Comment Delete ခွင့်ပြုဖို့)
    const currentUser = window.auth.currentUser;
    const currentUsername = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Guest';

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        let deleteButton = '';
        // 🚨 Comment ရေးသူ သို့မဟုတ် Admin သာ ဖျက်ခွင့်ရရန်
        if (comment.user === currentUsername || currentUsername === 'Admin') { 
             deleteButton = `<button style="float:right; background:red; padding:2px 5px; margin-left:10px; width:auto;" onclick="deleteComment(${video.id}, ${comment.id})">❌</button>`;
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

window.addComment = () => {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value.trim();
    const user = window.auth && window.auth.currentUser ? document.getElementById('username-display').textContent : 'Guest'; 
    
    if (commentText) {
        const video = videos[currentVideoIndex];
        const newComment = {
            user: user,
            text: commentText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            id: Date.now() // 🚨 Comment ID ကို ထည့်သည်
        };
        video.currentComments.push(newComment);
        
        saveDataToStorage();

        commentInput.value = '';
        renderComments(video);
    }
}

// Sidebar Functions (အတည်တကျ)
// ... (updateSidebarHighlight, renderSidebar functions remain the same) ...
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


// App စတင် run ရန်အတွက်
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
});
