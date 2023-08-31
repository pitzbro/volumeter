const video = document.querySelector('video');
const btn = document.querySelector('#sound-btn');
const btnOff = document.querySelector('#sound-btn-off');
const decibelBar = document.querySelector('.decibel-bar');
const barLevel = document.querySelector('.bar-level');

const maxDb = 80;

function updateVolume(index) {

    const db = Math.round(dbArray[index]);
    const barHeight = (db / maxDb) * 100 + '%';

    const g = Math.min(Math.round((1 - (db / maxDb)) * 400), 255);
    const b = Math.round((1 - (db / maxDb)) * 255);

    const barColor = `rgb(255, ${g}, ${b})`;

    barLevel.innerText = db + 'db';
    decibelBar.style.setProperty('--bar-height', barHeight);
    decibelBar.style.setProperty('--bar-color', barColor);
}

video.addEventListener('play', () => {
    video._updateInterval = setInterval(() => {
        // do what you need
        updateVolume(Math.floor(video.currentTime / 0.2))
    }, 200);
}, true);

video.addEventListener('pause', () => clearInterval(video._updateInterval), true);


btn.onclick = () => {
    video.play();
    video.muted = false;
}

btnOff.onclick = () => {
    video.pause();
}