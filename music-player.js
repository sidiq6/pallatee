(() => {
  'use strict';

  const toggle = document.getElementById('music-toggle');
  const panel = document.getElementById('music-panel');
  const close = document.getElementById('music-close');
  const audio = document.getElementById('class-audio');
  const play = document.getElementById('music-play');
  const progress = document.getElementById('music-progress');
  const current = document.getElementById('music-current');
  const duration = document.getElementById('music-duration');
  const volume = document.getElementById('music-volume');
  const volumeValue = document.getElementById('music-volume-value');
  const mute = document.getElementById('music-mute');
  const status = document.getElementById('music-status');

  // Do not interrupt the rest of the website if the music widget is absent.
  if (!toggle || !panel || !audio || !play || !progress || !current ||
      !duration || !volume || !volumeValue || !mute || !status) return;

  const setStatus = (message) => {
    status.textContent = message;
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    const plus = toggle.querySelector('.music-plus');
    if (plus) plus.textContent = open ? '−' : '+';
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const updatePlayState = () => {
    const isPlaying = !audio.paused && !audio.ended;
    play.textContent = isPlaying ? '❚❚' : '▶';
    play.setAttribute('aria-label', isPlaying ? 'Jeda audio' : 'Putar audio');
    toggle.classList.toggle('is-playing', isPlaying);
  };

  const updateProgress = () => {
    const total = audio.duration;
    if (Number.isFinite(total) && total > 0) {
      progress.value = String((audio.currentTime / total) * 100);
      duration.textContent = formatTime(total);
    }
    current.textContent = formatTime(audio.currentTime);
  };

  // Called directly inside a click handler so the browser recognizes
  // the visitor's tap as permission to start audio playback.
  const startPlayback = () => {
    if (audio.error) {
      audio.load();
    }

    setStatus('Memuat lagu...');
    updatePlayState();

    let playRequest;
    try {
      playRequest = audio.play();
    } catch (error) {
      handlePlayError(error);
      return;
    }

    if (playRequest && typeof playRequest.then === 'function') {
      playRequest.then(() => {
        setStatus('Lagu sedang diputar.');
        updatePlayState();
      }).catch(handlePlayError);
    }
  };

  const handlePlayError = (error) => {
    console.error('CLASSVERSE audio playback failed:', error);
    if (error && error.name === 'NotAllowedError') {
      setStatus('Browser memblokir pemutaran. Tekan tombol Putar sekali lagi.');
    } else if (error && error.name === 'NotSupportedError') {
      setStatus('Format audio tidak didukung. Periksa file MP3 di assets/audio/.');
    } else {
      setStatus('Lagu gagal dimuat. Pastikan assets/audio/class-track.mp3 ikut diunggah.');
    }
    updatePlayState();
  };

  // First tap on MUSIC opens the player and starts the song.
  // Closing the panel does not stop the song.
  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    setOpen(opening);
    if (opening && audio.paused) startPlayback();
  });

  close.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  play.addEventListener('click', () => {
    if (audio.paused || audio.ended) {
      startPlayback();
    } else {
      audio.pause();
      setStatus('Musik dijeda.');
    }
    updatePlayState();
  });

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
    updateProgress();
    setStatus('Lagu siap diputar.');
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('play', updatePlayState);
  audio.addEventListener('pause', updatePlayState);
  audio.addEventListener('playing', () => {
    setStatus('Lagu sedang diputar.');
    updatePlayState();
  });
  audio.addEventListener('waiting', () => setStatus('Buffering lagu...'));
  audio.addEventListener('ended', () => {
    updatePlayState();
    setStatus('Lagu selesai diputar. Tekan Putar untuk mengulang.');
  });
  audio.addEventListener('error', () => {
    const code = audio.error ? audio.error.code : 0;
    console.error('CLASSVERSE audio element error. MediaError code:', code);
    setStatus('File MP3 tidak dapat dibaca. Pastikan file class-track.mp3 ada di folder assets/audio/.');
    updatePlayState();
  });

  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
      updateProgress();
    }
  });

  const updateVolume = () => {
    audio.volume = Number(volume.value);
    audio.muted = false;
    volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
    mute.textContent = audio.volume === 0 ? 'MUTE' : 'VOL';
    mute.setAttribute('aria-label', audio.volume === 0 ? 'Aktifkan suara' : 'Matikan suara');
  };

  volume.addEventListener('input', updateVolume);

  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    mute.textContent = audio.muted ? 'MUTE' : 'VOL';
    mute.setAttribute('aria-label', audio.muted ? 'Aktifkan suara' : 'Matikan suara');
    setStatus(audio.muted ? 'Suara dimatikan.' : 'Suara diaktifkan.');
  });

  audio.volume = Number(volume.value);
  updateVolume();
  updatePlayState();
})();
