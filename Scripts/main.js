//#region VARIABLES
const leftDivs = document.querySelectorAll('#left-container div');
const songCover = document.getElementById('song-cover');
const songVideo = document.getElementById('song-video');
const playButton = document.getElementById('play-button');
const iframe = document.getElementById("embed-video");
const artistName = document.getElementById('artist-name');
const songTitle = document.getElementById('song-title');
const lyricsDiv = document.getElementById('lyrics');
const body = document.querySelector('body');

let isPlaying = false;
let player;
let interval;
//#endregion

//#region LISTENERS
playButton.addEventListener('click', handlePlayPause);

leftDivs.forEach((div) => {
    div.addEventListener('click', (e) => switchLeftView(e));
});
//#endregion

//#region FUNCTIONS
function onYouTubeIframeAPIReady() {
    let artist = localStorage.getItem('artist');
    let title = localStorage.getItem('title');
    let id = localStorage.getItem('id');
    let url = localStorage.getItem('url');
    let bg = localStorage.getItem('bg');
    let lyrics = JSON.parse(localStorage.getItem('lyrics'));

    player = new YT.Player(iframe, {
        height: '100%',
        width: '100%',
        videoId: id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    let img = document.createElement('img');
    img.src = url;
    songCover.appendChild(img);

    artistName.textContent = artist;
    songTitle.textContent = title;
    
    let background = document.createElement('img');
    background.classList.add('background');
    background.src = bg;
    body.insertBefore(background, document.querySelector('#main-container'));

    lyrics.lines.forEach(line => {
        let p = document.createElement('p');
        p.innerHTML = line.words;
        p.classList.add('lyrics-line');
        lyricsDiv.appendChild(p);
    });
}

function onPlayerReady(event) {
    event.target.playVideo();

    interval = setInterval(() => {
        if (isPlaying) {
            syncLyrics(event.target.getCurrentTime());
        } else {
            clearInterval(interval);
        }
    }, 100);
} 

function syncLyrics(time) {
    time *= 1000;

    for (var i = 0; i < lyrics.length; i++) {
        let startTime = lyrics[i].getAttribute("data-start-time");
        let nextTime = lyrics[i + 1].getAttribute("data-start-time");

        if (time >= startTime && time < nextTime) {
            lyrics[i].style.opacity = "1";
        } 
        else if (time < startTime) {
            lyrics[i].style.opacity = "0.2";
        } 
        else {
            lyrics[i].style.opacity = "0.2";
        }
    }
}

function onPlayerStateChange() {
    isPlaying = !isPlaying;

    updateButton();
}

function handlePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    }
    else {
        player.playVideo();
    }

    updateButton();
}

function updateButton() {
    const i = playButton.querySelector('i');

    if (isPlaying) {
        i.classList.replace('fa-circle-play', 'fa-circle-pause');
    }
    else {
        i.classList.replace('fa-circle-pause', 'fa-circle-play');
    }
}

function switchLeftView(e) {
    if (e.target === songCover && songCover.classList.contains('closed')) {
        songCover.classList.replace('closed', 'opened');
        songVideo.classList.replace('opened', 'closed');
    }
    else if (e.target === songVideo && songVideo.classList.contains('closed')) {
        songVideo.classList.replace('closed', 'opened');
        songCover.classList.replace('opened', 'closed');
    }
}
//#endregion