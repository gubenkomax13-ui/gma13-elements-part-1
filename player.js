const tracks = [
  { title: "Ba", element: "Barium", src: "assets/track-01.mp3", cover: "assets/track-01.png" },
  { title: "K", element: "Potassium", src: "assets/track-02.mp3", cover: "assets/track-02.png" },
  { title: "No", element: "Nobelium", src: "assets/track-03.mp3", cover: "assets/track-03.png" },
  { title: "He", element: "Helium", src: "assets/track-04.mp3", cover: "assets/track-04.png" },
  { title: "Pb", element: "Lead", src: "assets/track-05.mp3", cover: "assets/track-05.png" },
  { title: "Li", element: "Lithium", src: "assets/track-06.mp3", cover: "assets/track-06.png" },
  { title: "Os", element: "Osmium", src: "assets/track-07.mp3", cover: "assets/track-07.png" },
  { title: "Ni", element: "Nickel", src: "assets/track-08.mp3", cover: "assets/track-08.png" },
  { title: "Pu", element: "Plutonium", src: "assets/track-09.mp3", cover: "assets/track-09.png" },
];

const audio = document.querySelector("#audio");
const trackList = document.querySelector("#trackList");
const playPause = document.querySelector("#playPause");
const playAlbum = document.querySelector("#playAlbum");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const progress = document.querySelector("#progress");
const volume = document.querySelector("#volume");
const mute = document.querySelector("#mute");
const shuffle = document.querySelector("#shuffle");
const repeatOne = document.querySelector("#repeatOne");
const loopAlbum = document.querySelector("#loopAlbum");
const playerCover = document.querySelector("#playerCover");
const playerTitle = document.querySelector("#playerTitle");
const playerSubtitle = document.querySelector("#playerSubtitle");
const openArtworkButton = document.querySelector("#openArtwork");
const artworkModal = document.querySelector("#artworkModal");
const closeArtworkButton = document.querySelector("#closeArtwork");
const artworkImage = document.querySelector("#artworkImage");
const artworkTitle = document.querySelector("#artworkTitle");
const artworkSubtitle = document.querySelector("#artworkSubtitle");
const currentTime = document.querySelector("#currentTime");
const duration = document.querySelector("#duration");
const totalDuration = document.querySelector("#totalDuration");

let currentIndex = 0;
let loadedIndex = -1;
let previousVolume = 0.8;
let shuffleEnabled = false;
let repeatOneEnabled = false;
let loopAlbumEnabled = false;
let shuffleOrder = [];
let shufflePosition = 0;
let artworkDismissedIndex = -1;
let artworkPreviousFocus = null;

audio.volume = Number(volume.value);

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function icon(isPlaying) {
  return isPlaying ? "Ⅱ" : "▶";
}

function shuffledIndexes(excludeIndex) {
  const indexes = tracks.map((_, index) => index).filter((index) => index !== excludeIndex);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return [excludeIndex, ...indexes];
}

function resetShuffle(startIndex = currentIndex) {
  shuffleOrder = shuffledIndexes(startIndex);
  shufflePosition = 0;
}

function persistModes() {
  try {
    localStorage.setItem("gma13-player-modes", JSON.stringify({
      shuffle: shuffleEnabled,
      repeatOne: repeatOneEnabled,
      loopAlbum: loopAlbumEnabled,
    }));
  } catch {
    // Настройки сохраняются только когда браузер разрешает локальное хранилище.
  }
}

function updateModeButton(button, enabled, label) {
  button.classList.toggle("active", enabled);
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute("aria-label", `${label} ${enabled ? "включён" : "выключен"}`);
}

function updateModes() {
  updateModeButton(shuffle, shuffleEnabled, "Случайный порядок");
  updateModeButton(repeatOne, repeatOneEnabled, "Повтор трека");
  updateModeButton(loopAlbum, loopAlbumEnabled, "Повтор альбома");
  persistModes();
}

function restoreModes() {
  try {
    const saved = JSON.parse(localStorage.getItem("gma13-player-modes") || "{}");
    shuffleEnabled = Boolean(saved.shuffle);
    repeatOneEnabled = Boolean(saved.repeatOne);
    loopAlbumEnabled = Boolean(saved.loopAlbum);
  } catch {
    localStorage.removeItem("gma13-player-modes");
  }
  if (shuffleEnabled) resetShuffle(currentIndex);
  updateModes();
}

function renderTracks() {
  trackList.innerHTML = tracks.map((track, index) => `
    <button class="track-row" type="button" data-index="${index}" aria-label="Воспроизвести ${track.title}">
      <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
      <img class="track-art" src="${track.cover}" alt="" loading="lazy" />
      <span class="track-name">${track.title}</span>
      <span class="track-element">${track.element}</span>
      <span class="track-duration" data-duration>—</span>
      <span class="row-play" aria-hidden="true">▶</span>
    </button>
  `).join("");

  trackList.addEventListener("click", (event) => {
    const row = event.target.closest(".track-row");
    if (!row) return;
    const index = Number(row.dataset.index);
    if (index === currentIndex && loadedIndex === index && !audio.paused) {
      audio.pause();
    } else {
      if (shuffleEnabled) resetShuffle(index);
      loadTrack(index, true);
    }
  });
}

function updateRows() {
  document.querySelectorAll(".track-row").forEach((row, index) => {
    const active = index === currentIndex;
    row.classList.toggle("active", active);
    row.querySelector(".row-play").textContent = active ? icon(!audio.paused) : "▶";
    row.setAttribute("aria-label", `${active && !audio.paused ? "Приостановить" : "Воспроизвести"} ${tracks[index].title}`);
  });
}

function updateMediaSession(track) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: "GMA13",
    album: "Elements — Part 1",
    artwork: [{ src: new URL(track.cover, location.href).href, sizes: "1200x1200", type: "image/png" }],
  });
}

function updateArtwork(track) {
  artworkImage.src = track.cover;
  artworkImage.alt = `Иллюстрация трека ${track.title}`;
  artworkTitle.textContent = track.title;
  artworkSubtitle.textContent = `GMA13 · ${track.element}`;
}

function showArtwork(force = false) {
  if (!force && artworkDismissedIndex === currentIndex) return;
  updateArtwork(tracks[currentIndex]);
  artworkPreviousFocus = document.activeElement;
  artworkModal.hidden = false;
  document.body.classList.add("artwork-open");
  closeArtworkButton.focus({ preventScroll: true });
}

function hideArtwork() {
  if (artworkModal.hidden) return;
  artworkDismissedIndex = currentIndex;
  artworkModal.hidden = true;
  document.body.classList.remove("artwork-open");
  if (artworkPreviousFocus instanceof HTMLElement) artworkPreviousFocus.focus({ preventScroll: true });
}

function loadTrack(index, autoplay = false) {
  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];

  if (loadedIndex !== currentIndex) {
    loadedIndex = currentIndex;
    audio.src = track.src;
    playerCover.src = track.cover;
    playerTitle.textContent = track.title;
    playerSubtitle.textContent = `GMA13 · ${track.element}`;
    updateArtwork(track);
    progress.value = 0;
    progress.style.setProperty("--value", "0%");
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    updateMediaSession(track);
  }

  updateRows();
  if (autoplay) audio.play().catch(() => updateState());
}

function updateState() {
  const playing = !audio.paused;
  playPause.classList.toggle("is-playing", playing);
  playPause.setAttribute("aria-label", playing ? "Пауза" : "Воспроизвести");
  playPause.title = playing ? "Пауза" : "Воспроизвести";
  playAlbum.querySelector(".button-icon").textContent = icon(playing);
  playAlbum.querySelector("span:last-child").textContent = playing ? "Пауза" : "Слушать альбом";
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  updateRows();
}

function togglePlayback() {
  if (loadedIndex < 0) loadTrack(currentIndex, true);
  else if (audio.paused) audio.play();
  else audio.pause();
}

function adjacentTrack(direction) {
  if (shuffleEnabled) {
    const target = shufflePosition + direction;
    if (target >= 0 && target < shuffleOrder.length) {
      shufflePosition = target;
      return shuffleOrder[shufflePosition];
    }
    if (direction > 0 && loopAlbumEnabled) {
      resetShuffle(currentIndex);
      shufflePosition = Math.min(1, shuffleOrder.length - 1);
      return shuffleOrder[shufflePosition];
    }
    if (direction < 0 && loopAlbumEnabled) {
      resetShuffle(currentIndex);
      shufflePosition = shuffleOrder.length - 1;
      return shuffleOrder[shufflePosition];
    }
    return null;
  }

  const target = currentIndex + direction;
  if (target >= 0 && target < tracks.length) return target;
  if (loopAlbumEnabled) return direction > 0 ? 0 : tracks.length - 1;
  return null;
}

function changeTrack(direction) {
  const target = adjacentTrack(direction);
  if (target !== null) loadTrack(target, true);
}

function playPrevious() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  changeTrack(-1);
}

function handleTrackEnd() {
  if (repeatOneEnabled) {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  const target = adjacentTrack(1);
  if (target === null) {
    audio.pause();
    updateState();
    return;
  }
  loadTrack(target, true);
}

function setRangeFill(input, value) {
  input.style.setProperty("--value", `${value}%`);
}

function discoverDurations() {
  let total = 0;
  let ready = 0;
  tracks.forEach((track, index) => {
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = track.src;
    probe.addEventListener("loadedmetadata", () => {
      track.duration = probe.duration;
      const label = document.querySelectorAll("[data-duration]")[index];
      if (label) label.textContent = formatTime(probe.duration);
      total += probe.duration;
      ready += 1;
      if (ready === tracks.length) totalDuration.textContent = `${Math.round(total / 60)} мин`;
      probe.src = "";
    }, { once: true });
  });
}

playPause.addEventListener("click", togglePlayback);
playAlbum.addEventListener("click", () => loadedIndex < 0 ? loadTrack(0, true) : togglePlayback());
previous.addEventListener("click", playPrevious);
next.addEventListener("click", () => changeTrack(1));
shuffle.addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;
  if (shuffleEnabled) resetShuffle(currentIndex);
  updateModes();
});
repeatOne.addEventListener("click", () => {
  repeatOneEnabled = !repeatOneEnabled;
  updateModes();
});
loopAlbum.addEventListener("click", () => {
  loopAlbumEnabled = !loopAlbumEnabled;
  updateModes();
});

openArtworkButton.addEventListener("click", () => showArtwork(true));
closeArtworkButton.addEventListener("click", hideArtwork);
artworkModal.addEventListener("click", (event) => {
  if (event.target === artworkModal) hideArtwork();
});

audio.addEventListener("play", () => {
  updateState();
  showArtwork();
});
audio.addEventListener("pause", updateState);
audio.addEventListener("ended", handleTrackEnd);
audio.addEventListener("loadedmetadata", () => duration.textContent = formatTime(audio.duration));
audio.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(audio.currentTime);
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.value = percent;
  setRangeFill(progress, percent);
  if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession && Number.isFinite(audio.duration) && audio.duration > 0) {
    navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(audio.currentTime, audio.duration) });
  }
});

progress.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  setRangeFill(progress, Number(progress.value));
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
  audio.muted = false;
  previousVolume = audio.volume || previousVolume;
  setRangeFill(volume, audio.volume * 100);
  updateMuteState();
});

function updateMuteState() {
  const muted = audio.muted || audio.volume === 0;
  mute.classList.toggle("is-muted", muted);
  mute.setAttribute("aria-label", muted ? "Включить звук" : "Выключить звук");
  mute.title = muted ? "Включить звук" : "Выключить звук";
}

mute.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = previousVolume;
    volume.value = previousVolume;
  } else {
    previousVolume = audio.volume;
    audio.muted = true;
    volume.value = 0;
  }
  setRangeFill(volume, Number(volume.value) * 100);
  updateMuteState();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Escape" && !artworkModal.hidden) {
    event.preventDefault();
    hideArtwork();
    return;
  }
  if (event.target.matches("input, button")) return;
  if (event.code === "Space") { event.preventDefault(); togglePlayback(); }
  if (event.code === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  if (event.code === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
  if (event.code === "KeyS") shuffle.click();
  if (event.code === "KeyR") repeatOne.click();
  if (event.code === "KeyL") loopAlbum.click();
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => audio.play());
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
  navigator.mediaSession.setActionHandler("nexttrack", () => changeTrack(1));
  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (details.seekTime != null) audio.currentTime = details.seekTime;
  });
}

renderTracks();
loadTrack(0, false);
restoreModes();
discoverDurations();
setRangeFill(volume, Number(volume.value) * 100);
