// =================================================
// ✅ Part 1: Firebase Configuration & Setup (FINAL)
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
let unsubscribeUsers; // User list listener ကို သိမ်းရန် (Part 7 တွင် လိုအပ်သည်)

// 💡 Helper: Firestore တွင် User Data သိမ်းခြင်း (Register/Login တွင် လိုအပ်ပါက)
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

window.handleGoHome = () => {
    showPage('home-page');
};

// =================================================
// ✅ Part 3: Authentication (Login/Register/Logout/State Check) (FINAL FIX)
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
        await window.auth.currentUser.updateProfile({ displayName: emailInput });
        
        await saveUserDataToFirestore(result.user); 
        
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
        // Delay ကို 300ms ထားပြီး Login Redirect ပြဿနာကို ဖြေရှင်းသည်
        setTimeout(() => { showPage('home-page'); }, 300); 

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// 2. Login Function
window.handleLogin = async () => {
    // 🚨 FIX: Login input များကို ဤနေရာတွင် စနစ်တကျ ဖတ်ရပါမည်
    const emailInput = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = emailInput.includes('@') ? emailInput : `${emailInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); 
        
        await saveUserDataToFirestore(result.user); 
        
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
        // Delay ကို 300ms ထားပြီး Login Redirect ပြဿနာကို ဖြေရှင်းသည်
        setTimeout(() => { showPage('home-page'); }, 300); 

    } catch (error) {
        messageDiv.textContent = 'အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    }
};

// 3. Logout Function
window.handleLogout = async () => {
    try {
        await window.auth.signOut();
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeChat) unsubscribeChat();
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 4. Auth State Check Logic (Final Fix for Persistence and Login Redirect)
window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    const adminButton = document.getElementById('admin-nav-button');
    
    if (navBar) { navBar.style.display = user ? 'flex' : 'none'; }
    if (adminButton) { 
        adminButton.style.display = (user && user.email === ADMIN_EMAIL) ? 'block' : 'none';
    }

    if (user) {
        // Login ဝင်ထားသော User များအတွက်
        const hash = window.location.hash.substring(1); 
        
        // FIX: Login ဝင်ပြီးပါက hash မရှိလျှင် သို့မဟုတ် login/register page တွင် ရှိနေလျှင် home ကို ပို့ပါ
        if (hash === 'login-page' || hash === 'register-page' || !hash) {
            showPage('home-page'); 
        } else {
            showPage(hash);
        }
        
        // 💡 Home Page တွင် Username အပြည့်အစုံ ပြရန်
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.displayName || user.email.split('@')[0];
        }

    } else {
        // Login မဝင်ထားသူများအတွက်
        const hash = window.location.hash.substring(1); 
        if (hash !== 'register-page') {
            showPage('login-page');
        }
        if (unsubscribeChat) unsubscribeChat(); 
        if (unsubscribeUsers) unsubscribeUsers(); 
    }
});


// =================================================
// ✅ Part 4: Profile Page Logic & All User Update Functions (FINAL FIX)
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
        adminButton.style.display = (user.email === ADMIN_EMAIL) ? 'block' : 'none';
    }
};

// 2. 🚨 ADD: Username ပြောင်းရန် Function (HTML မှ ခေါ်ထားသဖြင့် ထည့်ရပါမည်)
window.changeUsername = async () => {
    const user = window.auth.currentUser;
    const newUsernameInput = document.getElementById('new-username-input');
    const newUsername = newUsernameInput.value.trim();
    const messageDiv = document.getElementById('username-message');

    if (!user) { messageDiv.textContent = 'Login ဝင်ထားသော User မဟုတ်ပါ။'; messageDiv.style.color = 'red'; return; }
    if (!newUsername) { messageDiv.textContent = 'Username အသစ် ထည့်ပေးပါ။'; messageDiv.style.color = 'orange'; return; }

    try {
        await user.updateProfile({ displayName: newUsername });
        // Firestore တွင်ပါ displayName ကို update လုပ်သည်
        await window.db.collection('users').doc(user.uid).update({ displayName: newUsername }); 

        messageDiv.textContent = `✅ Username ကို ${newUsername} သို့ ပြောင်းလဲပြီးပါပြီ။`;
        messageDiv.style.color = 'green';
        loadProfileData(); // Profile Data ကို ပြန် Load လုပ်သည်
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }
};

// 3. Profile Photo Upload လုပ်ခြင်း (ယာယီ Disable လုပ်ထားပါသည်)
window.uploadProfilePhoto = async () => {
    const messageDiv = document.getElementById('photo-upload-message');
    messageDiv.textContent = '❌ Photo Upload ဝန်ဆောင်မှု ယာယီ ပိတ်ထားပါသည်။ (Firebase Storage အတွက် Billing လိုအပ်ပါသည်)';
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
// ✅ Part 5: Global Chatbox Functionality (FINAL)
// =================================================
// (Code အဟောင်းသည် မှန်ကန်နေပြီဖြစ်သောကြောင့် ပြောင်းလဲခြင်း မရှိပါ)
// ... (Your Part 5 Chat functions remain here) ...
window.toggleChatBox = () => { /* ... */ };
window.sendMessage = async () => { /* ... */ };
window.deleteMessage = async (messageId) => { /* ... */ };
function loadChatMessages() { /* ... */ }


// =================================================
// ✅ Part 6: Video Player & Data Persistence Logic (FINAL)
// =================================================
// (Code အဟောင်းသည် မှန်ကန်နေပြီဖြစ်သောကြောင့် ပြောင်းလဲခြင်း မရှိပါ)
// ... (Your Part 6 Video Player functions remain here) ...
let videos = [ /* ... */ ];
function initializeVideoPlayer() { /* ... */ };
function loadVideo(video, index) { /* ... */ };
window.toggleLike = () => { /* ... */ };
window.addComment = () => { /* ... */ };
function updateSidebarHighlight() { /* ... */ }
function renderSidebar() { /* ... */ }


// =================================================
// ✅ Part 7: Admin Panel Logic (User List Fetching) (FINAL)
// =================================================
// (Code အဟောင်းသည် မှန်ကန်နေပြီဖြစ်သောကြောင့် ပြောင်းလဲခြင်း မရှိပါ)
// ... (Your Part 7 Admin functions remain here) ...
window.checkAdminStatus = async () => { /* ... */ };
window.fetchUserList = () => { /* ... */ };

// =================================================
// ✅ Part 8: Initial Page Load on Startup
// =================================================
// (This is handled by onAuthStateChanged)
