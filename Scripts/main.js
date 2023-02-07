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
            'onStateChange': onPlayerStateChange,
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

        let timebar = document.getElementById('timebar');
        let timer = document.getElementById('timer');

        let duration = player.getDuration();
        let intervalTimer = setInterval(updateTimer, 1000);

        function updateTimer() {
            let currentTime = Math.round(player.getCurrentTime());
            let percentage = (currentTime / duration) * 100;

            timebar.style.width = `${percentage}%`;
            timer.innerHTML = `${convertCurrentTimeToString(currentTime)} / ${convertDurationToString(duration)}`;

            if (currentTime >= duration) {
                clearInterval(intervalTimer);
            }
        }
       
        interval = setInterval(() => {
            syncLyrics();
            // startTimebar();
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

function convertCurrentTimeToString(currentTime) {
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${minutes}:${seconds}`;
}

function convertDurationToString(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = Math.floor(duration % 60);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return `${minutes}:${seconds}`;
}


// function startTimebar() {
//     let timebar = document.getElementById('timebar');
//     let duration = player.getDuration();

//     timebar.style.animationDuration = `${duration}s`;
//     timebar.classList.add('playing');

//     if (player.getPlayerState() === 2) {
//         timebar.style.animationPlayState = "paused";
//     }
//     else if (player.getPlayerState() === 1) {
//         timebar.style.animationPlayState = "running";
//     }
// }

function syncLyrics() { 
    time = player.getCurrentTime();
    convertedTime = (time * 1000);

    let lyrics = document.getElementsByClassName('lyrics-line');
    let scroll = false;

    for (var i = 0; i < lyrics.length; i++) {
        let startTime = parseInt(lyrics[i].getAttribute('data-start-time'));

        if (convertedTime >= startTime ) {
            lyrics[i].style.opacity = 1; 

            let nextIndex = i + 1;
            let nextTime = parseInt(lyrics[nextIndex].getAttribute('data-start-time'));
            let p = document.querySelector('#lyrics p');

            if (i >= 15) {
                let speed = 1;

                let duration = player.getDuration() * speed;
                p.style.animationDuration = `${duration}s`;

                if (!scroll) {
                    p.classList.add('scroll');
                    scroll = true;
                }

                if (player.getPlayerState() === 2) {
                    p.style.animationPlayState = "paused";
                }
                else if (player.getPlayerState() === 1) {
                    p.style.animationPlayState = "running";
                }

                let line = lyrics[lyrics.length - 1];
                let rect = line.getBoundingClientRect();
                let bottom = (rect.bottom / lyricsDiv.offsetHeight) * 100;

                console.log(bottom)

                if (scroll && p.classList.contains('scroll') && bottom <= 150) {
                    p.style.animationPlayState = "paused";
                    scroll = false;
                }
            }

            if (nextIndex < lyrics.length) {
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
