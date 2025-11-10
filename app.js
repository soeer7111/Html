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
window.handleGoHome = () => { showPage('home-page'); };

// =================================================
// ✅ Part 3: Authentication (Login/Register/Logout/State Check) (FINAL FIX 6 - Reverting UI Hiding)
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
        messageDiv.textContent = 'မှတ်ပုံတင် အောင်မြင်ပါသည်။'; 
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
        messageDiv.textContent = 'Login အောင်မြင်ပါသည်။'; 
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

window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    const adminButton = document.getElementById('admin-nav-button');

    if (navBar) { navBar.style.display = user ? 'flex' : 'none'; }
    if (adminButton) { 
        adminButton.style.display = (user && user.email === ADMIN_EMAIL) ? 'block' : 'none';
    }

    if (user) {
        // 🔑 Login ဝင်ထားပါက: Home သို့မဟုတ် နောက်ဆုံးရှိခဲ့သော Page ကို ပြပါမည်။
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
    
    // ❌ NOTE: Blank screen ဖြစ်စေသော mainBody display logic ကို ဖယ်ရှားလိုက်ပါပြီ။
});


// =================================================
// ✅ Part 4, 5, 6, 7 Logic များ မပြောင်းလဲပါ
// ...
// (Part 4, 5, 6, 7 Code များကို ယခင်အတိုင်း ဆက်လက်ထည့်သွင်းပေးပါ)
// ...
// =================================================
