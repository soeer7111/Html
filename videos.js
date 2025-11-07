// =================================================
// 🚨 Part 1: Video Data and Persistence Setup
// =================================================

// Card မလိုသော Public Demo Video Links များ (တစ်သက်လုံး Free နီးပါး)
let videos = [
    { 
        id: 1, 
        url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        title: 'ဗီဒီယို ၁ - Plyr Demo Video (720p)', 
        download: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4', 
        currentLikes: 8, 
        userLiked: false, 
        currentComments: [
            { user: 'DemoUser', text: 'ကောင်းလိုက်တာဗျာ။', timestamp: '2025-11-07 12:00', id: 1 } 
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
            { user: 'Admin', text: 'ဒါကတော့ ပညာရေးရည်ရွယ်ချက်နဲ့တင်ထားတဲ့ ဗီဒီယိုပါ။', timestamp: '2025-11-07 12:05', id: 2 }
        ]
    }
];

let currentVideoIndex = 0; 
let player; 

function loadVideoData() {
    const savedVideos = localStorage.getItem('socialVideoData');
    if (savedVideos) {
        videos = JSON.parse(savedVideos);
    }
}

function saveVideoData() {
    localStorage.setItem('socialVideoData', JSON.stringify(videos));
}

// =================================================
// 🚨 Part 2: Video Player / UI Logic
// =================================================

function loadVideo(index) {
    if (index < 0 || index >= videos.length) {
        // နောက်ဆုံး/ပထမဆုံး ဗီဒီယို ရောက်သွားရင် Index 0 သို့ ပြန်ပို့ခြင်း
        currentVideoIndex = 0; 
    } else {
        currentVideoIndex = index;
    }

    const video = videos[currentVideoIndex];
    const videoElement = document.getElementById('videoPlayer');
    
    if (!videoElement) return; // Player Element မရှိရင် ရပ်လိုက်ပါ။

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
    if(likeButton) {
        likeButton.classList.toggle('text-red-500', isLiked);
        likeButton.classList.toggle('text-gray-500', !isLiked);
    }
}

// Like/Unlike လုပ်ခြင်း (window ဖြင့် Global ခေါ်နိုင်အောင် လုပ်ထားသည်)
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
    if (!commentList) return;
    
    commentList.innerHTML = '';
    const video = videos[currentVideoIndex];

    const profileImgSrc = localStorage.getItem('userProfilePhoto') || 'default-profile.png';

    video.currentComments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'flex space-x-3 mb-3 p-2 bg-gray-100 rounded-lg';
        
        commentDiv.innerHTML = `
            <img class="comment-profile-photo w-8 h-8 rounded-full" src="${profileImgSrc}" alt="Profile">
            <div class="flex-1">
                <p class="text-sm font-semibold">${comment.user} <span class="text-xs text-gray-500 ml-2">${new Date(comment.timestamp).toLocaleTimeString()}</span></p>
                <p class="text-gray-700">${comment.text}</p>
            </div>
        `;
        commentList.appendChild(commentDiv);
    });
    // Comment တင်ပြီးရင် Profile Photo များကို Update လုပ်ခြင်း
    loadProfilePhoto();
}

window.addComment = function() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    // 💡 လောလောဆယ်အတွက် Default User Name ကို အသုံးပြုသည်
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
        renderComments(); 
        commentInput.value = ''; 
    }
}

// =================================================
// 🚨 Part 4: Navigation Logic
// =================================================

window.nextVideo = function() {
    loadVideo(currentVideoIndex + 1);
}

window.prevVideo = function() {
    loadVideo(currentVideoIndex - 1);
}

// =================================================
// 🚨 Part 5: Profile Photo Upload Logic
// =================================================

const profilePhotoInput = document.getElementById('profilePhotoInput');
const profilePhoto = document.getElementById('profilePhoto');

function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('userProfilePhoto');
    const defaultSrc = 'default-profile.png';
    
    // Player Page နှင့် Comment များက Profile Photo အားလုံး
    const allProfilePhotos = document.querySelectorAll('#profilePhoto, .comment-profile-photo');
    
    allProfilePhotos.forEach(img => {
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
    loadVideoData(); 
    loadProfilePhoto(); 
    
    // video-feed-page (Home Page) ရဲ့ ID ကို စစ်ဆေးပြီးမှ Video Load လုပ်ရန်
    const videoFeedPage = document.getElementById('video-feed-page');
    if (videoFeedPage) {
        loadVideo(currentVideoIndex); 
    }

    // Navigation Button Event Listeners
    const nextBtn = document.getElementById('nextVideoBtn');
    const prevBtn = document.getElementById('prevVideoBtn');

    if(nextBtn) nextBtn.addEventListener('click', window.nextVideo);
    if(prevBtn) prevBtn.addEventListener('click', window.prevVideo);
});
  
