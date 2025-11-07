// =================================================
// 🚨 Part 1: Video Data and Persistence Setup
// =================================================

// Card မလိုသော Public Demo Video Links များ
let videos = [
    { 
        id: 1, 
        url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        title: 'ဗီဒီယို ၁ - Plyr Demo Video (720p)', 
        download: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: [
            { user: 'DemoUser', text: 'ကောင်းလိုက်တာဗျာ။', timestamp: '2025-11-07 12:00', id: Date.now() + 1 } 
        ]
    },
    { 
        id: 2,
        url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        title: 'ဗီဒီယို ၂ - Big Buck Bunny (Archive.org)', 
        download: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4', 
        currentLikes: 15, 
        userLiked: false, 
        currentComments: [
            { user: 'Admin', text: 'ဒါကတော့ ပညာရေးရည်ရွယ်ချက်နဲ့တင်ထားတဲ့ ဗီဒီယိုပါ။', timestamp: '2025-11-07 12:05', id: Date.now() + 2 }
        ]
    }
];

let currentVideoIndex = 0; 
let player; 

// Local Storage မှ ဒေတာများကို Load လုပ်ခြင်း
function loadVideoData() {
    const savedVideos = localStorage.getItem('socialVideoData');
    if (savedVideos) {
        videos = JSON.parse(savedVideos);
    }
}

// Local Storage သို့ ဒေတာများကို Save လုပ်ခြင်း
function saveVideoData() {
    localStorage.setItem('socialVideoData', JSON.stringify(videos));
}

// =================================================
// 🚨 Part 2: Video Player / UI Logic
// =================================================

function loadVideo(index) {
    // Index အမှန်ကို စစ်ဆေးခြင်း
    if (index < 0 || index >= videos.length) {
        return;
    }
    currentVideoIndex = index;
    const video = videos[currentVideoIndex];

    // Player အသစ်ကို ဖွင့်ခြင်း
    const videoElement = document.getElementById('videoPlayer');
    if (player) {
        player.destroy(); // Player အဟောင်းကို ဖျက်ခြင်း
    }

    // Video Source အသစ် ထည့်သွင်းခြင်း
    videoElement.src = video.url;

    // Plyr Player ကို စတင်ခြင်း
    player = new Plyr(videoElement);

    // UI များကို Update လုပ်ခြင်း
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('likeCount').textContent = video.currentLikes;
    document.getElementById('downloadLink').href = video.download;
    
    updateLikeButton(video.userLiked);
    renderComments();
}

function updateLikeButton(isLiked) {
    const likeButton = document.getElementById('likeButton');
    likeButton.classList.toggle('text-red-500', isLiked);
    likeButton.classList.toggle('text-gray-500', !isLiked);
}

// Like/Unlike လုပ်ခြင်း
window.toggleLike = function() {
    const video = videos[currentVideoIndex];
    video.userLiked = !video.userLiked;

    if (video.userLiked) {
        video.currentLikes++;
    } else {
        video.currentLikes--;
    }

    updateLikeButton(video.userLiked);
    document.getElementById('likeCount').textContent = video.currentLikes;
    saveVideoData();
}

// =================================================
// 🚨 Part 3: Comment Logic
// =================================================

function renderComments() {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = '';
    const video = videos[currentVideoIndex];

    // Comment တစ်ခုချင်းစီကို HTML အဖြစ်ပြောင်းခြင်း
    video.currentComments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'flex space-x-3 mb-3 p-2 bg-gray-100 rounded-lg';
        
        // 🚨 Comment Profile Photo ကို loadProfilePhoto() မှ သတ်မှတ်ပေးသည်
        const profileImgSrc = localStorage.getItem('userProfilePhoto') || 'default-profile.png';
        
        commentDiv.innerHTML = `
            <img class="comment-profile-photo w-8 h-8 rounded-full" src="${profileImgSrc}" alt="Profile">
            <div class="flex-1">
                <p class="text-sm font-semibold">${comment.user} <span class="text-xs text-gray-500 ml-2">${new Date(comment.timestamp).toLocaleTimeString()}</span></p>
                <p class="text-gray-700">${comment.text}</p>
            </div>
        `;
        commentList.appendChild(commentDiv);
    });
}

window.addComment = function() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    // 💡 Firebase Auth မှ User Name ကို ယူရန် လိုအပ် (ဥပမာ)
    const currentUsername = localStorage.getItem('loggedInUsername') || 'Kyaw71'; 

    if (commentText) {
        const video = videos[currentVideoIndex];
        const newComment = {
            user: currentUsername,
            text: commentText,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        video.currentComments.push(newComment);
        saveVideoData();
        renderComments(); // List ကို Refresh လုပ်ခြင်း
        commentInput.value = ''; // Input ကို ရှင်းလင်းခြင်း
    }
}

// =================================================
// 🚨 Part 4: Navigation Logic
// =================================================

window.nextVideo = function() {
    loadVideo(currentVideoIndex + 1);
}

window.prevVideo = function() {
    if (currentVideoIndex > 0) {
        loadVideo(currentVideoIndex - 1);
    }
}

// =================================================
// 🚨 Part 5: Profile Photo Upload Logic (Local Storage ဖြင့် Card မလိုဘဲ သိမ်းခြင်း)
// =================================================

const profilePhotoInput = document.getElementById('profilePhotoInput');
const profilePhoto = document.getElementById('profilePhoto'); // HTML ထဲက img tag (main player အနီး)
// Comment အတွင်းက Profile Photo များအတွက် DOM ကို Load ချိန်တွင် ရယူမည်

// Local Storage မှ ပုံကို Load လုပ်ပြီး နေရာအားလုံးတွင် ပြသခြင်း
function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    const defaultSrc = 'default-profile.png';
    
    if (profilePhoto) {
        profilePhoto.src = savedPhoto || defaultSrc;
    }

    // Comment နေရာများက ဓာတ်ပုံများအတွက် Update
    const commentProfilePhotos = document.querySelectorAll('.comment-profile-photo');
    commentProfilePhotos.forEach(img => {
        img.src = savedPhoto || defaultSrc;
    });
}

// Photo Upload Logic
if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
    
            reader.onloadend = () => {
                const base64Image = reader.result;
                localStorage.setItem('userProfilePhoto', base64Image);
                loadProfilePhoto(); // ချက်ချင်း ပြသသည်။
                alert('Profile Photo အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
            };
    
            reader.readAsDataURL(file);
        } else {
            alert('ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင်ကိုသာ ရွေးချယ်ပါ။');
        }
    });
}


// =================================================
// 🚨 Part 6: Initialization
// =================================================

document.addEventListener('DOMContentLoaded', () => {
    loadVideoData(); // Video Data များကို Load ခြင်း
    loadProfilePhoto(); // Profile Photo ကို Load ခြင်း
    loadVideo(currentVideoIndex); // ပထမဆုံး Video ကို ဖွင့်ခြင်း

    // Next/Prev Buttons များအတွက် Event Listener (ဥပမာ)
    // 💡 သင့်ရဲ့ HTML ထဲက id များနှင့် တိုက်ဆိုင်စစ်ဆေးပါ။
    const nextBtn = document.getElementById('nextVideoBtn');
    const prevBtn = document.getElementById('prevVideoBtn');

    if(nextBtn) nextBtn.addEventListener('click', window.nextVideo);
    if(prevBtn) prevBtn.addEventListener('click', window.prevVideo);
});

          
