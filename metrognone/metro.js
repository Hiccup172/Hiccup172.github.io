// main.js

// Global Audio & Scheduling Variables
let audioContext;
let isPlaying = false;
let timerID;
const scheduleAheadTime = 0.1; // seconds
const lookahead = 25; // ms

let nextPrimaryTickTime = 0;
let primaryTickCount = 0;
let measureStartTime = 0;
let nextPolyTickTime = 0;
let polyTickCount = 0;

// Basic Settings
let currentBPM = 120;
let timeSignature = 4;            // Primary beats per measure
let primarySubdivision = 1;       // Subdivisions per primary beat
let primaryAccents = [];

// Polyrhythm Settings
let enablePolyrhythm = false;
let polyBeats = 3;                // Polyrhythm beats per measure
let polySubdivision = 1;          // Subdivisions per poly beat
let polyAccents = [];

// Additional Feature Variables
let swingEnabled = false;
let swingIntensity = 50;          // 0–100 (only applies when primarySubdivision === 2)

let dynamicTempoEnabled = false;
let targetBPM = 120;
let tempoDuration = 30;           // seconds over which BPM changes
let dynamicTempoStartBPM = 120;
let dynamicTempoStartTime = 0;

let soundOption = "default";      // "default", "woodblock", "beep", "drum"
let ledFlashEnabled = false;

let themeColor = "#007BFF";
let accentColor = "#FFA500";
let darkModeEnabled = false;

let trainerModeEnabled = false;
let trainerProbability = 20;      // Percentage chance to mute beat in Trainer Mode

// ----------------- UTILITY FUNCTIONS -----------------

// Returns the interval for the current primary tick.
// If swing is enabled and exactly 2 subdivisions are used, then adjust the two subdivisions.
function getPrimaryInterval(localTick) {
  let beatInterval = 60 / currentBPM;
  if (swingEnabled && primarySubdivision === 2) {
    let swingFactor = swingIntensity / 100;
    return (localTick === 0) ? beatInterval * (0.5 + swingFactor / 2) : beatInterval * (0.5 - swingFactor / 2);
  }
  return beatInterval / primarySubdivision;
}

// ----------------- SCHEDULER -----------------

function scheduler() {
  // Dynamic Tempo Update (if enabled)
  if (dynamicTempoEnabled) {
    let elapsed = audioContext.currentTime - dynamicTempoStartTime;
    if (elapsed < tempoDuration) {
      currentBPM = dynamicTempoStartBPM + (targetBPM - dynamicTempoStartBPM) * (elapsed / tempoDuration);
    } else {
      currentBPM = targetBPM;
    }
  }
  
  // Recalculate measure duration and poly tick interval
  let beatInterval = 60 / currentBPM;
  let measureDuration = beatInterval * timeSignature;
  let currentPrimaryInterval = getPrimaryInterval(primaryTickCount % primarySubdivision);
  // Schedule primary ticks ahead of time
  while (nextPrimaryTickTime < audioContext.currentTime + scheduleAheadTime) {
    schedulePrimaryEvent(nextPrimaryTickTime, primaryTickCount);
    let localTick = primaryTickCount % primarySubdivision;
    nextPrimaryTickTime += getPrimaryInterval(localTick);
    primaryTickCount++;
    // Reset at end of measure
    if (primaryTickCount % (timeSignature * primarySubdivision) === 0) {
      measureStartTime = nextPrimaryTickTime;
      nextPolyTickTime = measureStartTime;
      polyTickCount = 0;
    }
  }
  
  // Schedule polyrhythm ticks if enabled
  if (enablePolyrhythm) {
    let polyTickInterval = measureDuration / (polyBeats * polySubdivision);
    while (nextPolyTickTime < audioContext.currentTime + scheduleAheadTime) {
      schedulePolyEvent(nextPolyTickTime, polyTickCount);
      nextPolyTickTime += polyTickInterval;
      polyTickCount++;
    }
  }
  
  timerID = setTimeout(scheduler, lookahead);
}

// ----------------- SCHEDULING EVENTS -----------------

function schedulePrimaryEvent(time, count) {
  let beatIndex = Math.floor(count / primarySubdivision) % timeSignature;
  // Trainer Mode: randomly mute beats
  let playSoundFlag = true;
  if (trainerModeEnabled && Math.random() < trainerProbability / 100) {
    playSoundFlag = false;
  }
  if (playSoundFlag) {
    let freq = primaryAccents[beatIndex] ? 1000 : 800;
    playSoundAtTime(freq, time, soundOption);
  }
  scheduleVisualUpdate('primary', beatIndex, time);
  if (ledFlashEnabled) {
    triggerFlash(time);
  }
}

function schedulePolyEvent(time, count) {
  let beatIndex = Math.floor(count / polySubdivision) % polyBeats;
  let playSoundFlag = true;
  if (trainerModeEnabled && Math.random() < trainerProbability / 100) {
    playSoundFlag = false;
  }
  if (playSoundFlag) {
    let freq = polyAccents[beatIndex] ? 1200 : 900;
    playSoundAtTime(freq, time, soundOption);
  }
  scheduleVisualUpdate('poly', beatIndex, time);
  if (ledFlashEnabled) {
    triggerFlash(time);
  }
}

// ----------------- AUDIO FUNCTIONS -----------------

function playSoundAtTime(freq, time, option) {
  if (option === "default") {
    let osc = audioContext.createOscillator();
    let gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 1;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  } else if (option === "woodblock") {
    let osc = audioContext.createOscillator();
    let gain = audioContext.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  } else if (option === "beep") {
    let osc = audioContext.createOscillator();
    let gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.7;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  } else if (option === "drum") {
    playDrumSoundAtTime(time);
  }
}

function playDrumSoundAtTime(time) {
  let bufferSize = audioContext.sampleRate * 0.2; // 200ms
  let noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  let output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  let noise = audioContext.createBufferSource();
  noise.buffer = noiseBuffer;
  let gain = audioContext.createGain();
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  noise.connect(gain);
  gain.connect(audioContext.destination);
  noise.start(time);
  noise.stop(time + 0.2);
}

// ----------------- VISUAL FUNCTIONS -----------------

function scheduleVisualUpdate(rhythmType, beatIndex, scheduledTime) {
  let delay = Math.max(scheduledTime - audioContext.currentTime, 0) * 1000;
  setTimeout(() => {
    if (rhythmType === 'primary') {
      updatePrimaryVisual(beatIndex);
    } else {
      updatePolyVisual(beatIndex);
    }
  }, delay);
}

function updatePrimaryVisual(activeIndex) {
  const container = document.getElementById('primaryVisual');
  const beats = container.querySelectorAll('.beat');
  beats.forEach((beat, index) => {
    beat.classList.toggle('active', index === activeIndex);
  });
}

function updatePolyVisual(activeIndex) {
  const container = document.getElementById('polyVisual');
  const beats = container.querySelectorAll('.beat');
  beats.forEach((beat, index) => {
    beat.classList.toggle('active', index === activeIndex);
  });
}

function triggerFlash(scheduledTime) {
  let delay = Math.max(scheduledTime - audioContext.currentTime, 0) * 1000;
  setTimeout(() => {
    let flash = document.getElementById('flashOverlay');
    flash.style.opacity = 0.5;
    setTimeout(() => {
      flash.style.opacity = 0;
    }, 100);
  }, delay);
}

// ----------------- UI ACCENT BUTTONS & VISUAL SETUP -----------------

function updatePrimaryAccentsUI() {
  const container = document.getElementById('primaryAccents');
  container.innerHTML = '';
  for (let i = 0; i < timeSignature; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.classList.toggle('accented', primaryAccents[i]);
    btn.addEventListener('click', function () {
      primaryAccents[i] = !primaryAccents[i];
      btn.classList.toggle('accented', primaryAccents[i]);
    });
    container.appendChild(btn);
  }
}

function updatePolyAccentsUI() {
  const container = document.getElementById('polyAccents');
  container.innerHTML = '';
  for (let i = 0; i < polyBeats; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.classList.toggle('accented', polyAccents[i]);
    btn.addEventListener('click', function () {
      polyAccents[i] = !polyAccents[i];
      btn.classList.toggle('accented', polyAccents[i]);
    });
    container.appendChild(btn);
  }
}

function updatePrimaryVisuals() {
  const container = document.getElementById('primaryVisual');
  container.innerHTML = '';
  for (let i = 0; i < timeSignature; i++) {
    const div = document.createElement('div');
    div.classList.add('beat');
    container.appendChild(div);
  }
}

function updatePolyVisuals() {
  const container = document.getElementById('polyVisual');
  container.innerHTML = '';
  for (let i = 0; i < polyBeats; i++) {
    const div = document.createElement('div');
    div.classList.add('beat');
    container.appendChild(div);
  }
}

// ----------------- METRONOME CONTROL -----------------

function startMetronome() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  isPlaying = true;
  let currentTime = audioContext.currentTime;
  dynamicTempoStartTime = currentTime;
  dynamicTempoStartBPM = currentBPM;
  primaryTickCount = 0;
  measureStartTime = currentTime + 0.05;
  nextPrimaryTickTime = measureStartTime;
  polyTickCount = 0;
  nextPolyTickTime = measureStartTime;
  scheduler();
}

function stopMetronome() {
  isPlaying = false;
  clearTimeout(timerID);
}

// ----------------- EVENT LISTENERS & INITIAL SETUP -----------------

document.addEventListener('DOMContentLoaded', function () {
  // Basic Controls
  const startStopButton = document.getElementById('startStopButton');
  const bpmInput = document.getElementById('bpm');
  const timeSignatureInput = document.getElementById('timeSignature');
  const primarySubdivisionInput = document.getElementById('primarySubdivision');
  const tapButton = document.getElementById('tapButton');
  const tapDisplay = document.getElementById('tapDisplay');

  // Polyrhythm Controls
  const enablePolyrhythmCheckbox = document.getElementById('enablePolyrhythm');
  const polyBeatsInput = document.getElementById('polyBeats');
  const polySubdivisionInput = document.getElementById('polySubdivision');

  // Additional Feature Controls
  const swingModeCheckbox = document.getElementById('swingMode');
  const swingIntensityInput = document.getElementById('swingIntensity');
  const dynamicTempoCheckbox = document.getElementById('dynamicTempo');
  const targetBPMInput = document.getElementById('targetBPM');
  const tempoDurationInput = document.getElementById('tempoDuration');
  const soundOptionsSelect = document.getElementById('soundOptions');
  const ledFlashCheckbox = document.getElementById('ledFlash');
  const themeColorInput = document.getElementById('themeColor');
  const accentColorInput = document.getElementById('accentColor');
  const darkModeCheckbox = document.getElementById('darkMode');
  const trainerModeCheckbox = document.getElementById('trainerMode');
  const trainerProbabilityInput = document.getElementById('trainerProbability');
  
  // Polyrhythm Visibility
  const polySettings = document.getElementById('polySettings');
  const polyVisualOuter = document.getElementById('polyVisualContainer');

  // Initialize settings from inputs
  currentBPM = parseInt(bpmInput.value);
  timeSignature = parseInt(timeSignatureInput.value);
  primarySubdivision = parseInt(primarySubdivisionInput.value);
  polyBeats = parseInt(polyBeatsInput.value);
  polySubdivision = parseInt(polySubdivisionInput.value);
  enablePolyrhythm = enablePolyrhythmCheckbox.checked;
  swingEnabled = swingModeCheckbox.checked;
  swingIntensity = parseInt(swingIntensityInput.value);
  dynamicTempoEnabled = dynamicTempoCheckbox.checked;
  targetBPM = parseInt(targetBPMInput.value);
  tempoDuration = parseInt(tempoDurationInput.value);
  soundOption = soundOptionsSelect.value;
  ledFlashEnabled = ledFlashCheckbox.checked;
  darkModeEnabled = darkModeCheckbox.checked;
  trainerModeEnabled = trainerModeCheckbox.checked;
  trainerProbability = parseInt(trainerProbabilityInput.value);

  // Initialize accent arrays (default: first beat accented)
  primaryAccents = new Array(timeSignature).fill(false);
  primaryAccents[0] = true;
  polyAccents = new Array(polyBeats).fill(false);
  polyAccents[0] = true;

  // Setup UI elements
  updatePrimaryAccentsUI();
  updatePrimaryVisuals();
  updatePolyAccentsUI();
  updatePolyVisuals();
  
  // Event Listeners for Basic Controls
  bpmInput.addEventListener('change', function () {
    currentBPM = parseInt(this.value);
  });
  timeSignatureInput.addEventListener('change', function () {
    timeSignature = parseInt(this.value);
    primaryAccents = new Array(timeSignature).fill(false);
    primaryAccents[0] = true;
    updatePrimaryAccentsUI();
    updatePrimaryVisuals();
  });
  primarySubdivisionInput.addEventListener('change', function () {
    primarySubdivision = parseInt(this.value);
  });
  
  // Event Listeners for Polyrhythm Controls
  enablePolyrhythmCheckbox.addEventListener('change', function () {
    enablePolyrhythm = this.checked;
    polySettings.style.display = enablePolyrhythm ? 'block' : 'none';
    polyVisualOuter.style.display = enablePolyrhythm ? 'block' : 'none';
  });
  polyBeatsInput.addEventListener('change', function () {
    polyBeats = parseInt(this.value);
    polyAccents = new Array(polyBeats).fill(false);
    polyAccents[0] = true;
    updatePolyAccentsUI();
    updatePolyVisuals();
  });
  polySubdivisionInput.addEventListener('change', function () {
    polySubdivision = parseInt(this.value);
  });
  
  // Event Listeners for Additional Features
  swingModeCheckbox.addEventListener('change', function () {
    swingEnabled = this.checked;
  });
  swingIntensityInput.addEventListener('input', function () {
    swingIntensity = parseInt(this.value);
  });
  dynamicTempoCheckbox.addEventListener('change', function () {
    dynamicTempoEnabled = this.checked;
  });
  targetBPMInput.addEventListener('change', function () {
    targetBPM = parseInt(this.value);
  });
  tempoDurationInput.addEventListener('change', function () {
    tempoDuration = parseInt(this.value);
  });
  soundOptionsSelect.addEventListener('change', function () {
    soundOption = this.value;
  });
  ledFlashCheckbox.addEventListener('change', function () {
    ledFlashEnabled = this.checked;
  });
  themeColorInput.addEventListener('change', function () {
    themeColor = this.value;
    document.documentElement.style.setProperty('--theme-color', themeColor);
  });
  accentColorInput.addEventListener('change', function () {
    accentColor = this.value;
    document.documentElement.style.setProperty('--accent-color', accentColor);
  });
  darkModeCheckbox.addEventListener('change', function () {
    darkModeEnabled = this.checked;
    document.body.classList.toggle("dark-mode", darkModeEnabled);
  });
  trainerModeCheckbox.addEventListener('change', function () {
    trainerModeEnabled = this.checked;
  });
  trainerProbabilityInput.addEventListener('input', function () {
    trainerProbability = parseInt(this.value);
  });
  
  // Tap Tempo Logic
  let tapTimes = [];
  tapButton.addEventListener('click', function () {
    const now = Date.now();
    tapTimes.push(now);
    tapTimes = tapTimes.filter(t => now - t < 2000);
    if (tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapBPM = Math.round(60000 / avgInterval);
      tapDisplay.textContent = tapBPM;
      bpmInput.value = tapBPM;
      currentBPM = tapBPM;
    }
  });
  
  // Start/Stop Button
  startStopButton.addEventListener('click', function () {
    if (!isPlaying) {
      startMetronome();
      startStopButton.textContent = 'Stop';
    } else {
      stopMetronome();
      startStopButton.textContent = 'Start';
    }
  });
});
