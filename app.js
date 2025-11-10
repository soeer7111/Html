// ... (Part 1 and Part 2 logic are the same as FIX 8) ...

// =================================================
// ✅ Part 3: Authentication (Login/Register/Logout/State Check) (FINAL FIX 9 - Stable Login/Register Redirect)
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
        
        // 🚨 FIX 9: Register အောင်မြင်ရင် Home Page ကို တွန်းပို့ပါ။
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
        
        // 🚨 FIX 9: Login အောင်မြင်ရင် Home Page ကို တွန်းပို့ပါ။
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

window.auth.onAuthStateChanged((user) => {
    const navBar = document.getElementById('nav-bar');
    const adminButton = document.getElementById('admin-nav-button');

    if (navBar) { navBar.style.display = user ? 'flex' : 'none'; }
    if (adminButton) { 
        adminButton.style.display = (user && user.email === ADMIN_EMAIL) ? 'block' : 'none';
    }

    if (user) {
        // 🔑 Login ဝင်ထားပါက
        const hash = window.location.hash.substring(1); 
        
        // 💡 Login ဝင်ထားပြီး Login/Register Page မှာ ရှိနေရင် Home ကို Redirect လုပ်ပါ
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

// ... (Part 4, 5, 6, 7 logic are the same as FIX 8) ...
  
