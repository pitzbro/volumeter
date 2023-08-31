// audio analizing init
let audioContext = null;
let sourceNode = null;
let analyserNode = null;
let amplitudeArray = null;
let javascriptNode = null;
let gainNode = null;

let connected = false;

console.log('dbArray', dbArray)

// Useful UI elements
// const article = document.querySelector('#main-article');

const btn = document.querySelector('#sound-btn');
const btnOff = document.querySelector('#sound-btn-off');
const video = document.querySelector('video');

btn.onclick = () => {
    console.log('on');
    video.muted = false;
    startAnalyze('./test.mp4');
}

btnOff.onclick = () => {
    console.log('off');
    video.muted = true;
    initializeAudioAnalyze()
}

startAnalyze('./test.mp4');


function startAnalyze(preview) {
    // A user interaction happened we can create the audioContext
    
    console.log('starting')
  if (!audioContext) audioContext = new AudioContext();
  if (!gainNode) gainNode = audioContext.createGain();

  fetch(preview)
    .then(response => response.arrayBuffer())
    .then(downloadedBuffer => audioContext.decodeAudioData(downloadedBuffer))
    .then(decodedBuffer => {
      // Set up the AudioBufferSourceNode
      if (sourceNode) initializeAudioAnalyze();
      sourceNode = new AudioBufferSourceNode(audioContext, {
        buffer: decodedBuffer,
        loop: true,
      });

      // Set up the audio analyser and the javascript node
      if (!analyserNode) analyserNode = new AnalyserNode(audioContext);
      analyserNode.fftSize = 32;
      if (!javascriptNode) javascriptNode = audioContext.createScriptProcessor(1024, 1, 1);

      connected = true;
      // Connect the nodes togetherUint8Array
      sourceNode.connect(analyserNode);
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      analyserNode.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      // ADD FADE IN EFFECT
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 2);

      // Play the audio
    //   sourceNode.start(0); // Play the sound now

      // Set up the event handler that is triggered every time enough samples have been collected
      // then trigger the audio analysis and draw the results
      javascriptNode.onaudioprocess = () => {
        // Read the frequency values
        if (!amplitudeArray) {
          amplitudeArray = new Uint8Array(
            analyserNode.frequencyBinCount
          );
        }

        // Get the time domain data for this sample
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // Draw the display when the audio is playing
        if (audioContext.state === 'running') {
          // Draw the time domain in the canvas
          requestAnimationFrame(() => {
            // Get the canvas 2d context

            const avg = amplitudeArray.reduce((x, y) => x + y) / amplitudeArray.length;
            const max = Math.max(...amplitudeArray);

            console.log('max', max)

            // article.style.setProperty('--bg', `hsl(${-(avg + 100) * 1.6}deg,100%,54%)`);
            // article.style.setProperty('--scalePath', avg / 106);
            // article.style.setProperty('--rotatePath', `${avg - 128}deg`);
          });
        }
      };
    })
    .catch(e => {
      console.error(`Error: ${e}`);
    });
}

function initializeAudioAnalyze() {
  if (connected) {
    connected = false;
    sourceNode.stop();
    gainNode.disconnect(audioContext.destination);
    sourceNode.disconnect(analyserNode);
    analyserNode.disconnect(javascriptNode);
    javascriptNode.disconnect(audioContext.destination);
    setTimeout(() => {
    //   article.style.setProperty('--bg', 'green');
    //   article.style.setProperty('--scalePath', '1');
    //   article.style.setProperty('--rotatePath', '0deg');
    }, 10);
  }
}


