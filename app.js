// =================================================
// 🚨 Part 1: Firebase Configuration & Setup
// =================================================

// 💡 သင့်ရဲ့ ယခင် Firebase Config ID များကို ပြန်လည်အသုံးပြုထားသည်။
const firebaseConfig = {
        apiKey: "AIzaSyBHFEAoD5nMUg7azmeeAFdy4Btlff5qiXQ",
        authDomain: "my-webi-dc06d.firebaseapp.com",
        projectId: "my-webi-dc06d",
        storageBucket: "my-webi-dc06d.firebasestorage.app",
        messagingSenderId: "939042419939",
        appId: "1:939042419939:web:49e96f18117a68bb8b01d6",
        measurementId: "G-DJ9046C036"
};

// Compat SDK ကို အသုံးပြုပြီး initialize လုပ်သည်
window.app = firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.storage = firebase.storage(); // Storage ကို Global ထားသည်

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
        initializeVideoPlayer(); // Home Page ဖွင့်ရင် Player ကို စတင်
    } else if (pageId === 'profile-page') {
        loadProfileData(); // Profile Page ဖွင့်ရင် Data ယူမည်
    }
}
window.showPage = showPage;

function loadProfileData() {
    const user = window.auth.currentUser;
    if (user) {
        document.getElementById('profile-phone').value = user.displayName || ''; 
        
        // Profile Photo (Navbar and Profile Page)
        const photoURL = user.photoURL || "https://via.placeholder.com/100?text=Profile";
        document.getElementById('profile-photo-display').src = photoURL;
        document.getElementById('navbar-profile-photo').src = photoURL; // Navbar ပေါ်က ပုံ

        document.getElementById('profile-message').textContent = '';
    }
}


// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout)
// =================================================

// Register Function
window.handleRegister = async () => {
    const emailInput = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        await window.auth.createUserWithEmailAndPassword(email, password);
        await window.auth.signInWithEmailAndPassword(email, password);
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// Login Function (Home Page သို့ သွားမရသော Fix ပါဝင်သည်)
window.handleLogin = async () => {
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။'; 

    try {
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 

        // 🚨 Username Display အတွက် Setting
        const displayUsername = user.displayName || (user.email.includes('@dummy.com') ? user.email.replace('@dummy.com', '') : user.email.split('@')[0]);
        document.getElementById('username-display').textContent = displayUsername; 

        // 2 စက္ကန့် စောင့်ပြီး Home Page သို့ ပြောင်းရန်
        setTimeout(() => {
            showPage('home-page');
        }, 2000); 

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

// Auth State Check (Page စတက်ချိန်တွင် စစ်ဆေးရန်)
window.auth.onAuthStateChanged((user) => {
    if (user) {
        // Logged In ဝင်ထားရင် Home Page ကို ခေါ်ပေးရန်
        const displayEmail = user.email || 'N/A';
        const displayUsername = user.displayName || (displayEmail.includes('@dummy.com') ? displayEmail.replace('@dummy.com', '') : displayEmail.split('@')[0]);

        document.getElementById('username-display').textContent = displayUsername; 
        document.getElementById('profile-username').textContent = displayUsername; 
        
        // 🚨 Profile Data များကို UI ပေါ်တွင် ပြသခြင်း
        const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A';
        const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A';
        document.getElementById('profile-registered-date').textContent = creationDate;
        document.getElementById('profile-last-login').textContent = lastLogin;
        
        // Home Page ဖွင့်ပေး
        if (document.getElementById('home-page').style.display === 'none') {
            showPage('home-page'); 
        }
    } else {
        // Logged Out နေရင် Login Page ကို ခေါ်ပေးရန်
        showPage('login-page');
    }
});


// =================================================
// 🚨 Part 4: Profile Update & Photo Upload Logic (Fix)
// =================================================

// Profile Photo Upload လုပ်ခြင်း
window.uploadProfilePhoto = async () => {
    const user = window.auth.currentUser;
    const fileInput = document.getElementById('profile-photo-input');
    const file = fileInput.files[0];
    const messageDiv = document.getElementById('profile-message');

    if (!user) { messageDiv.textContent = 'User not logged in.'; return; }
    if (!file) { messageDiv.textContent = 'ဓါတ်ပုံ မရွေးရသေးပါ။'; return; }

    messageDiv.textContent = 'ဓါတ်ပုံ တင်နေပါသည်။ စောင့်ဆိုင်းပါ။';

    try {
        // Storage ထဲမှာ သိမ်းရန် Path
        const storageRef = window.storage.ref().child(`profile_photos/${user.uid}/${file.name}`);
        
        // ဓါတ်ပုံကို Upload လုပ်ခြင်း
        await storageRef.put(file);

        // Download URL ကို ရယူခြင်း
        const photoURL = await storageRef.getDownloadURL();

        // User ရဲ့ Profile ကို Update လုပ်ခြင်း
        await user.updateProfile({
            photoURL: photoURL
        });

        messageDiv.textContent = 'ဓါတ်ပုံ တင်ခြင်း အောင်မြင်ပါသည်။';
        loadProfileData(); // UI ကို ပြန် Update လုပ်သည် (Navbar အပါအဝင်)
    } catch (error) {
        messageDiv.textContent = `Upload Failed: ${error.message}`;
        console.error("Photo Upload Error:", error);
    }
}

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
// 🚨 Part 5: Video Player & Data Persistence Logic (Comment/Like Delete Fix)
// =================================================

// 🚨 Initial Video Data 
let videos = [
    { 
        id: 1, 
        url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        title: 'ဒုတိယမြောက် စမ်းသပ်ဗီဒီယို (Testing Stream)', 
        download: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: [
            { user: 'User99', text: 'အရည်အသွေး ကောင်းတယ်', timestamp: '12:30 PM', id: Date.now() + 1 } 
        ]
    },
    { 
        id: 2,
        url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        title: 'Big Buck Bunny (Sample Video)', 
        download: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        currentLikes: 15, 
        userLiked: false, 
        currentComments: [
            { user: 'Admin', text: 'ကောင်းလိုက်တာ!', timestamp: '10:00 AM', id: Date.now() + 2 }
        ]
    },
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

    // 🚨 videojs ကို DOM ရနိုင်မှ initialize လုပ်ရန်
    if (!player) {
        // Player ID: my-video
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
    renderComments(video); 
    updateSidebarHighlight();
}

// 🚨 Like Functions (Fix: innerHTML တွင် span tag ပါလာအောင် ပြင်ထားသည်)
function updateLikeStatus(video) {
    const likeButton = document.getElementById('like-button');
    if (!likeButton) return;

    document.getElementById('like-count').textContent = video.currentLikes;
    
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
    const username = user ? (user.displayName || user.email.split('@')[0]) : 'Guest'; 
    
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
    const currentUsername = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Guest';

    video.currentComments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        let deleteButton = '';
        if (comment.user === currentUsername) { 
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
    if (!sidebar) return;
    
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
  
