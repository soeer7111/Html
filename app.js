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
let unsubscribeChat; 
let unsubscribeUsers; 

// 🚨 FIX: Firestore တွင် User Data ကို မှန်ကန်စွာ သိမ်းဆည်းခြင်း
async function saveUserDataToFirestore(user, usernameInput) {
    const userRef = window.db.collection('users').doc(user.uid);
    // 💡 Auth မှ displayName ကို အသုံးပြု၊ မရှိပါက input မှ username ကို ဖြုတ်ယူ
    const displayName = user.displayName || usernameInput || user.email.split('@')[0];
    const isAdmin = user.email === ADMIN_EMAIL;
    
    // Firestore တွင် merge: true ဖြင့် သိမ်းခြင်း
    await userRef.set({ 
        uid: user.uid,
        email: user.email, 
        displayName: displayName,
        isAdmin: isAdmin, 
        lastLoginAt: window.firebase.firestore.FieldValue.serverTimestamp() // Login အချိန်ကို မှတ်သည်
    }, { merge: true });
}

// =================================================
// 🚨 Part 2: Page Navigation & UI Functions
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
        window.checkAdminStatus(); 
    }
}
window.showPage = showPage;

window.handleGoHome = () => {
    showPage('home-page');
};

// =================================================
// 🚨 Part 3: Authentication (Login/Register/Logout/State Check)
// =================================================

// 1. Register Function 
window.handleRegister = async () => {
    const usernameInput = document.getElementById('register-username').value.trim(); // Username Input
    const password = document.getElementById('register-password').value.trim();
    const messageDiv = document.getElementById('register-message');
    const email = usernameInput.includes('@') ? usernameInput : `${usernameInput}@dummy.com`; 

    if (password.length < 6) { messageDiv.textContent = 'လျှို့ဝှက်နံပါတ်သည် ၆ လုံးထက် မနည်းရပါ။'; return; }
    messageDiv.textContent = 'မှတ်ပုံတင်နေပါသည်။ ကျေးဇူးပြု၍ စောင့်ဆိုင်းပါ။';

    try {
        const result = await window.auth.createUserWithEmailAndPassword(email, password); 
        // 🚨 FIX: displayName ကို user input မှ ပေးပို့သည်
        await window.auth.currentUser.updateProfile({ displayName: usernameInput });
        // 🚨 FIX: Firestore တွင် သိမ်းရန် user input ကို ပေးပို့သည်
        await saveUserDataToFirestore(result.user, usernameInput); 
        
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။ ခဏစောင့်ပါ။'; 
        
        // Login ပြီးနောက် ချက်ချင်း Home ကို ပို့ပါ
        setTimeout(() => { showPage('home-page'); }, 100); 

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') { messageDiv.textContent = 'ဤအသုံးပြုသူအမည်ကို အသုံးပြုပြီးသား ဖြစ်ပါသည်။'; } 
        else { messageDiv.textContent = `Error: ${error.message}`; }
    }
};

// 2. Login Function
window.handleLogin = async () => {
    const usernameInput = document.getElementById('login-username').value.trim(); // Username Input
    const password = document.getElementById('login-password').value.trim();
    const messageDiv = document.getElementById('login-message');
    const email = usernameInput.includes('@') ? usernameInput : `${usernameInput}@dummy.com`; 

    messageDiv.textContent = 'ဝင်ရောက်နေပါသည်။'; 

    try {
        const result = await window.auth.signInWithEmailAndPassword(email, password); 
        // 🚨 FIX: Login အချိန်တွင် Firestore ကို update လုပ်သည်
        await saveUserDataToFirestore(result.user, usernameInput); 
        
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
        
        setTimeout(() => { showPage('home-page'); }, 100); 

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

// 4. Auth State Check Logic (Login ပြီးနောက် Redirect ကို စစ်ဆေးသော Logic)
window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    
    if (navBar) { navBar.style.display = user ? 'flex' : 'none'; }

    if (user) {
        // Login ဝင်ထားသော User များအတွက် (Persistence Logic)
        const hash = window.location.hash.substring(1); 
        
        if (hash && hash !== 'login-page' && hash !== 'register-page') {
            showPage(hash); 
        } else if (hash === 'login-page' || hash === 'register-page' || !hash) {
            showPage('home-page'); 
        }

        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.displayName || user.email.replace('@dummy.com', '');
        }
        
    } else {
        // Login မဝင်ထားသူများအတွက်
        showPage('login-page');
        if (unsubscribeChat) unsubscribeChat(); 
        if (unsubscribeUsers) unsubscribeUsers(); 
    }
});

// =================================================
// 🚨 Part 4: Profile Page Logic & All User Update Functions
// =================================================
// ... (ဤအပိုင်းသည် ပြဿနာ မရှိပါ) ...

// =================================================
// 🚨 Part 5: Global Chatbox Functionality
// =================================================
// ... (ဤအပိုင်းသည် ပြဿနာ မရှိပါ) ...

// =================================================
// 🚨 Part 6: Video Player & Data Persistence Logic (Like/Comment/Sidebar)
// ... (ဤအပိုင်းသည် ပြဿနာ မရှိပါ) ...

// =================================================
// 🚨 Part 7: Admin Panel Logic (User List Fetching)
// ... (ဤအပိုင်းသည် ပြဿနာ မရှိပါ) ...

// =================================================
// 🚨 Part 8: Initial Page Load on Startup
// =================================================
// ... (ဤအပိုင်းသည် ပြဿနာ မရှိပါ) ...
