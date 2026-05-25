export function createAudioController({ logger } = {}) {
  let audioContext = null;
  let ambientOscillator = null;
  let ambientGain = null;
  let isAmbientOn = false;
  let isSfxOn = true;

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playBeep(freq = 1200, duration = 0.08, type = 'sine') {
    if (!isSfxOn) return;

    try {
      initAudio();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, audioContext.currentTime + duration);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error('Audio beep failed', error);
    }
  }

  function playSweep() {
    if (!isSfxOn) return;

    try {
      initAudio();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Audio sweep failed', error);
    }
  }

  function playErrorBeep() {
    playBeep(450, 0.15, 'sawtooth');
    setTimeout(() => playBeep(350, 0.15, 'sawtooth'), 80);
  }

  function bindAmbientButton(button) {
    button?.addEventListener('click', () => {
      playBeep(800, 0.05);
      toggleAmbientHum(button);
    });
  }

  function bindSfxButton(button) {
    button?.addEventListener('click', () => {
      isSfxOn = !isSfxOn;
      if (isSfxOn) {
        button.innerHTML = '<i class="fa-solid fa-volume-high"></i> SFX: ON';
        button.classList.add('active');
        playBeep(800, 0.05);
      } else {
        button.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> SFX: OFF';
        button.classList.remove('active');
      }
    });
  }

  function toggleAmbientHum(button) {
    initAudio();

    if (isAmbientOn) {
      if (ambientGain) {
        ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
        setTimeout(() => {
          ambientOscillator?.stop();
          ambientOscillator?.disconnect();
          ambientOscillator = null;
        }, 600);
      }
      isAmbientOn = false;
      button?.classList.remove('active');
      if (button) button.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> AMBIENT HUM';
      logger?.('Ambient telemetry hum disabled.', 'info');
      return;
    }

    try {
      const filter = audioContext.createBiquadFilter();
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();

      ambientOscillator = audioContext.createOscillator();
      ambientGain = audioContext.createGain();
      ambientOscillator.type = 'sawtooth';
      ambientOscillator.frequency.setValueAtTime(55, audioContext.currentTime);
      lfo.frequency.value = 0.25;
      lfoGain.gain.value = 0.8;
      lfo.connect(lfoGain);
      lfoGain.connect(ambientOscillator.frequency);
      lfo.start();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, audioContext.currentTime);
      ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      ambientGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1.0);
      ambientOscillator.connect(filter);
      filter.connect(ambientGain);
      ambientGain.connect(audioContext.destination);
      ambientOscillator.start();
      isAmbientOn = true;
      button?.classList.add('active');
      if (button) button.innerHTML = '<i class="fa-solid fa-volume-high"></i> AMBIENT HUM';
      logger?.('Ambient space telemetry feed online (Low Freq).', 'info');
    } catch (error) {
      console.error('Ambient audio setup failed', error);
    }
  }

  return {
    bindAmbientButton,
    bindSfxButton,
    playBeep,
    playSweep,
    playErrorBeep
  };
}
