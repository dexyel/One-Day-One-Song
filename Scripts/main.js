const songCover = document.getElementById('song-cover');
const songVideo = document.getElementById('song-video');
const playButton = document.getElementById('play-button');
const iframe = document.getElementById("embed-video");
const artistName = document.getElementById('artist-name');
const songTitle = document.getElementById('song-title');
const lyricsDiv = document.getElementById('lyrics');
const body = document.querySelector('body');

let autoStart = false;
let isPlaying = false;
let player;
let interval;
let cookies = document.cookie.split(';');

for (var i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    let cookieName = cookie.split('=')[0];
    let cookieValue = cookie.split('=')[1];

    document.cookie = cookieName + '=' + cookieValue + '; SameSite=None; Secure';
}

playButton.addEventListener('click', handlePlayPause);

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
        playerVars: {
            autoplay: 0,
            allowfullscreen: 0,
            controls: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    iframe.setAttribute('origin', 'https://www.youtube.com/');

    let img = document.createElement('img');
    img.src = url;
    songCover.appendChild(img);

    artistName.textContent = artist;
    songTitle.textContent = title;
    
    let background = document.createElement('img');
    background.classList.add('background');
    background.src = bg;
    body.insertBefore(background, document.querySelector('#main-container'));

    let p = document.createElement('p');
    lyricsDiv.appendChild(p);

    lyrics.lines.forEach(line => {
        let span = document.createElement('span');
        span.innerHTML = line.words + '</br>';
        span.setAttribute('data-start-time', line.startTimeMs);
        span.classList.add('lyrics-line');
        p.appendChild(span);
    });    
}

function onPlayerReady(event) {
    if (autoStart) {
        event.target.playVideo();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;

        interval = setInterval(() => {
            syncLyrics();
        }, 500);        
    }
    else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    else {
        isPlaying = false;
        clearInterval(interval);
    }

    updateButton();
}

function syncLyrics() { 
    time = player.getCurrentTime();
    convertedTime = (time * 1000) + 50;

    let debug = document.createElement('p');
    debug.style.position = 'fixed';
    debug.style.fontSize = '200px';
    debug.style.color = 'white';
    debug.textContent = player.getDuration();

    let lyrics = document.getElementsByClassName('lyrics-line');

    for (var i = 0; i < lyrics.length; i++) {
        let startTime = parseInt(lyrics[i].getAttribute('data-start-time'));

        if (convertedTime >= startTime ) {
            lyrics[i].style.opacity = 1; 

            let nextIndex = i + 1;

            if (i >= 5) {
                let duration = player.getDuration(); // Durée en millisecondes du scroll
                let distance = lyricsDiv.scrollHeight - lyricsDiv.offsetHeight;
                let start = null;

                let step = (timestamp) => {
                    if (!start) start = timestamp;
                    let progress = (timestamp - start) / duration;
                    let scrollBy = progress * distance;
                    lyricsDiv.scrollBy({top: scrollBy, behavior: 'smooth'});
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                }
                window.requestAnimationFrame(step);
            }

            if (nextIndex < lyrics.length) {
                let nextTime = parseInt(lyrics[nextIndex].getAttribute('data-start-time'));

                if (convertedTime < nextTime) {
                    break;
                }
                else {
                    lyrics[i].style.opacity = 0.2;
                }
            }
        } 
        else {
            lyrics[i].style.opacity = 0.2;
        }
    }
}

function updateButton() {
    let i = playButton.querySelector('i');

    if (isPlaying) {
        i.classList.replace('fa-circle-play', 'fa-circle-pause');
    }
    else {
        i.classList.replace('fa-circle-pause', 'fa-circle-play');
    }
}

function handlePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    }
    else {
        player.playVideo();
    }
}