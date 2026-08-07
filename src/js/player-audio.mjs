export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function playerState({ paused, ended, error }) {
  if (error) return "error";
  if (ended) return "ended";
  return paused ? "paused" : "playing";
}

export function initAudioPlayer({ document }) {
  const root = document.querySelector("[data-player]");
  if (!root) return () => {};

  const audio = root.querySelector("[data-player-audio]");
  const toggle = root.querySelector("[data-player-toggle]");
  const toggleIcon = root.querySelector("[data-player-toggle-icon]");
  const previous = root.querySelector("[data-player-previous]");
  const next = root.querySelector("[data-player-next]");
  const progress = root.querySelector("[data-player-progress]");
  const elapsed = root.querySelector("[data-player-elapsed]");
  const duration = root.querySelector("[data-player-duration]");
  const status = root.querySelector("[data-player-status]");
  if (!audio || !toggle || !progress) return () => {};

  const listeners = [];
  let playbackError = false;

  const listen = (element, eventName, handler) => {
    element?.addEventListener(eventName, handler);
    listeners.push(() => element?.removeEventListener(eventName, handler));
  };

  const sync = () => {
    const state = playerState({ paused: audio.paused, ended: audio.ended, error: playbackError || Boolean(audio.error) });
    root.dataset.state = state;
    const playing = state === "playing";
    toggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} Release Confidence`);
    if (toggleIcon) toggleIcon.textContent = playing ? "Ⅱ" : "▶";

    const finiteDuration = Number.isFinite(audio.duration) && audio.duration > 0;
    const percent = finiteDuration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = String(Math.min(100, Math.max(0, percent)));
    if (elapsed) elapsed.textContent = formatTime(audio.currentTime);
    if (duration) duration.textContent = formatTime(audio.duration);
    if (status) {
      status.textContent = state === "error" ? "Audio playback is unavailable in this browser." : "";
    }
  };

  const onToggle = async () => {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    playbackError = false;
    try {
      await audio.play();
    } catch {
      playbackError = true;
      sync();
    }
  };

  const resetTrack = () => {
    audio.currentTime = 0;
    sync();
  };

  const seek = () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    sync();
  };

  const onError = () => {
    playbackError = true;
    sync();
  };

  listen(toggle, "click", onToggle);
  listen(previous, "click", resetTrack);
  listen(next, "click", resetTrack);
  listen(progress, "input", seek);
  for (const eventName of ["loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended"]) {
    listen(audio, eventName, sync);
  }
  listen(audio, "error", onError);
  sync();

  return () => {
    audio.pause();
    listeners.splice(0).forEach((cleanup) => cleanup());
  };
}
