const albums = [
  {
    id: "elements-part-1",
    eyebrow: "Rock / Punk / Ska / Blues / Progressive",
    title: "Elements",
    subtitle: "Part 1",
    artist: "GMA13",
    note: "Девять элементов. Девять историй.<br />Один альбом.",
    heading: "Часть первая",
    cover: "assets/elements-part-1/cover.png",
    preview: "assets/elements-part-1/previews/cover.webp",
    tracks: [
      { title: "Ba", element: "Barium", src: "assets/elements-part-1/track-01.mp3", thumb: "assets/elements-part-1/thumbs/track-01.webp", cover: "assets/elements-part-1/track-01.png", duration: 249 },
      { title: "K", element: "Potassium", src: "assets/elements-part-1/track-02.mp3", thumb: "assets/elements-part-1/thumbs/track-02.webp", cover: "assets/elements-part-1/track-02.png", duration: 254 },
      { title: "No", element: "Nobelium", src: "assets/elements-part-1/track-03.mp3", thumb: "assets/elements-part-1/thumbs/track-03.webp", cover: "assets/elements-part-1/track-03.png", duration: 208 },
      { title: "He", element: "Helium", src: "assets/elements-part-1/track-04.mp3", thumb: "assets/elements-part-1/thumbs/track-04.webp", cover: "assets/elements-part-1/track-04.png", duration: 213 },
      { title: "Pb", element: "Lead", src: "assets/elements-part-1/track-05.mp3", thumb: "assets/elements-part-1/thumbs/track-05.webp", cover: "assets/elements-part-1/track-05.png", duration: 229 },
      { title: "Li", element: "Lithium", src: "assets/elements-part-1/track-06.mp3", thumb: "assets/elements-part-1/thumbs/track-06.webp", cover: "assets/elements-part-1/track-06.png", duration: 224 },
      { title: "Os", element: "Osmium", src: "assets/elements-part-1/track-07.mp3", thumb: "assets/elements-part-1/thumbs/track-07.webp", cover: "assets/elements-part-1/track-07.png", duration: 243 },
      { title: "Ni", element: "Nickel", src: "assets/elements-part-1/track-08.mp3", thumb: "assets/elements-part-1/thumbs/track-08.webp", cover: "assets/elements-part-1/track-08.png", duration: 241 },
      { title: "Pu", element: "Plutonium", src: "assets/elements-part-1/track-09.mp3", thumb: "assets/elements-part-1/thumbs/track-09.webp", cover: "assets/elements-part-1/track-09.png", duration: 219 },
    ],
  },
  {
    id: "osmyslennoe-i-glubokoe",
    eyebrow: "Авторская инструментальная музыка",
    title: "Осмысленное\nи глубокое",
    subtitle: "",
    artist: "GMA13",
    note: "Одна композиция.<br />Отдельная история.",
    heading: "Осмысленное и глубокое",
    cover: "assets/osmyslennoe-i-glubokoe/cover.png",
    preview: "assets/osmyslennoe-i-glubokoe/previews/cover.webp",
    tracks: [
      { title: "Осмысленное и глубокое", element: "Single", src: "assets/osmyslennoe-i-glubokoe/track-01.mp3", thumb: "assets/osmyslennoe-i-glubokoe/thumbs/track-01.webp", cover: "assets/osmyslennoe-i-glubokoe/track-01.png", duration: 390 },
    ],
  },
];

let currentAlbumIndex = 0;
let tracks = albums[currentAlbumIndex].tracks;

const audio = document.querySelector("#audio");
const trackList = document.querySelector("#trackList");
const albumSwitcher = document.querySelector("#albumSwitcher");
const albumCover = document.querySelector("#albumCover");
const coverIndex = document.querySelector("#coverIndex");
const albumEyebrow = document.querySelector("#albumEyebrow");
const albumTitleMain = document.querySelector("#albumTitleMain");
const albumTitleSub = document.querySelector("#albumTitleSub");
const artistName = document.querySelector("#artistName");
const albumNote = document.querySelector("#albumNote");
const trackHeading = document.querySelector("#track-heading");
const footerAlbum = document.querySelector("#footerAlbum");
const playPause = document.querySelector("#playPause");
const playAlbum = document.querySelector("#playAlbum");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const previousAlbum = document.querySelector("#previousAlbum");
const nextAlbum = document.querySelector("#nextAlbum");
const progress = document.querySelector("#progress");
const volume = document.querySelector("#volume");
const mute = document.querySelector("#mute");
const shuffleTrack = document.querySelector("#shuffleTrack");
const shuffleAlbum = document.querySelector("#shuffleAlbum");
const repeatOne = document.querySelector("#repeatOne");
const playerLike = document.querySelector("#playerLike");
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
const trackCount = document.querySelector("#trackCount");
const trackCountLabel = document.querySelector("#trackCountLabel");

let currentIndex = 0;
let loadedIndex = -1;
let previousVolume = 0.8;
let shuffleTrackEnabled = false;
let shuffleAlbumEnabled = false;
let repeatOneEnabled = false;
let shuffleOrder = [];
let shufflePosition = 0;
let albumShuffleOrder = [];
let albumShufflePosition = 0;
let artworkPreviousFocus = null;
let likedTracks = {};

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

function restoreLikes() {
  try {
    likedTracks = JSON.parse(localStorage.getItem("gma13-track-likes") || "{}");
  } catch {
    likedTracks = {};
    localStorage.removeItem("gma13-track-likes");
  }
}

function persistLikes() {
  try {
    localStorage.setItem("gma13-track-likes", JSON.stringify(likedTracks));
  } catch {
    // Likes are stored locally in the listener browser.
  }
}

function isLiked(index) {
  return Boolean(likedTracks[tracks[index].src]);
}

function updateLikeButton(button, index) {
  if (!button) return;
  const liked = isLiked(index);
  button.classList.toggle("is-liked", liked);
  button.setAttribute("aria-pressed", String(liked));
  button.setAttribute("aria-label", `${liked ? "Снять лайк с" : "Поставить лайк"} ${tracks[index].title}`);
  button.title = liked ? "Снять лайк" : "Лайк";
  const count = button.querySelector(".like-count");
  if (count) count.textContent = liked ? "1" : "0";
}

function updateLikes() {
  document.querySelectorAll("[data-like-index]").forEach((button) => {
    updateLikeButton(button, Number(button.dataset.likeIndex));
  });
  updateLikeButton(playerLike, currentIndex);
}

function toggleLike(index) {
  const key = tracks[index].src;
  if (likedTracks[key]) delete likedTracks[key];
  else likedTracks[key] = true;
  persistLikes();
  updateLikes();
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

function shuffledAlbumIndexes(excludeIndex) {
  const indexes = albums.map((_, index) => index).filter((index) => index !== excludeIndex);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return [excludeIndex, ...indexes];
}

function resetAlbumShuffle(startIndex = currentAlbumIndex) {
  albumShuffleOrder = shuffledAlbumIndexes(startIndex);
  albumShufflePosition = 0;
}

function persistModes() {
  try {
    localStorage.setItem("gma13-player-modes", JSON.stringify({
      shuffleTrack: shuffleTrackEnabled,
      shuffleAlbum: shuffleAlbumEnabled,
      repeatOne: repeatOneEnabled,
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
  updateModeButton(shuffleTrack, shuffleTrackEnabled, "Рандом треков");
  updateModeButton(shuffleAlbum, shuffleAlbumEnabled, "Рандом альбомов");
  updateModeButton(repeatOne, repeatOneEnabled, "Повтор трека");
  persistModes();
}

function restoreModes() {
  try {
    const saved = JSON.parse(localStorage.getItem("gma13-player-modes") || "{}");
    shuffleTrackEnabled = Boolean(saved.shuffleTrack ?? saved.shuffle);
    shuffleAlbumEnabled = Boolean(saved.shuffleAlbum);
    repeatOneEnabled = Boolean(saved.repeatOne);
  } catch {
    localStorage.removeItem("gma13-player-modes");
  }
  if (shuffleTrackEnabled) resetShuffle(currentIndex);
  if (shuffleAlbumEnabled) resetAlbumShuffle(currentAlbumIndex);
  updateModes();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function albumFullTitle(album) {
  const title = album.title.replace(/\s*\n\s*/g, " ");
  return album.subtitle ? `${title} · ${album.subtitle}` : title;
}

function trackWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "композиция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "композиции";
  return "композиций";
}

function renderAlbumSwitcher() {
  albumSwitcher.innerHTML = albums.map((album, index) => `
    <button class="album-tab" type="button" data-album-index="${index}" aria-pressed="${index === currentAlbumIndex}">
      <img src="${album.preview}" alt="" loading="lazy" />
      <span>${albumFullTitle(album)}</span>
    </button>
  `).join("");

  albumSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-album-index]");
    if (!button) return;
    setAlbum(Number(button.dataset.albumIndex));
  });
}

function updateAlbumView() {
  const album = albums[currentAlbumIndex];
  albumCover.src = album.preview;
  albumCover.alt = `Обложка альбома ${albumFullTitle(album)}`;
  coverIndex.textContent = `${String(currentAlbumIndex + 1).padStart(2, "0")} / ${String(albums.length).padStart(2, "0")}`;
  albumEyebrow.textContent = album.eyebrow;
  albumTitleMain.innerHTML = escapeHtml(album.title).replace(/\n/g, "<br />");
  albumTitleSub.textContent = album.subtitle;
  albumTitleSub.hidden = !album.subtitle;
  document.body.classList.toggle("long-album-title", albumFullTitle(album).length > 18);
  artistName.textContent = album.artist;
  albumNote.innerHTML = album.note;
  trackHeading.textContent = album.heading;
  footerAlbum.textContent = albumFullTitle(album);
  trackCount.textContent = String(tracks.length);
  trackCountLabel.textContent = trackWord(tracks.length);
  document.title = `${albumFullTitle(album)} · ${album.artist}`;
  document.querySelector('meta[name="description"]').content = `${albumFullTitle(album)}, альбом ${album.artist}. Слушайте онлайн.`;
  document.querySelector('meta[property="og:title"]').content = `${albumFullTitle(album)} · ${album.artist}`;
  document.querySelector('meta[property="og:description"]').content = album.note.replace(/<br\s*\/?>/g, " ");
  document.querySelector('meta[property="og:image"]').content = album.cover;
  document.querySelector('link[rel="icon"]').href = album.cover;
  albumSwitcher.querySelectorAll("[data-album-index]").forEach((button, index) => {
    const active = index === currentAlbumIndex;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setAlbum(index, autoplay = false, trackIndex = 0) {
  if (index === currentAlbumIndex || !albums[index]) return;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  currentAlbumIndex = index;
  tracks = albums[currentAlbumIndex].tracks;
  currentIndex = Math.max(0, Math.min(trackIndex, tracks.length - 1));
  loadedIndex = -1;
  shuffleOrder = [];
  shufflePosition = 0;
  if (shuffleTrackEnabled) resetShuffle(currentIndex);
  if (shuffleAlbumEnabled) resetAlbumShuffle(currentAlbumIndex);
  progress.value = 0;
  setRangeFill(progress, 0);
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";
  updateAlbumView();
  renderTracks();
  loadTrack(currentIndex, autoplay);
  discoverDurations();
  updateState();
}

function renderTracks() {
  trackList.innerHTML = tracks.map((track, index) => `
    <div class="track-row" role="button" tabindex="0" data-index="${index}" aria-label="Play ${track.title}">
      <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
      <img class="track-art" src="${track.thumb}" alt="" loading="lazy" />
      <span class="track-name">${track.title}</span>
      <span class="track-element">${track.element}</span>
      <span class="track-duration" data-duration>--</span>
      <span class="row-play" aria-hidden="true">▶</span>
      <button class="control-button like-button track-like" type="button" data-like-index="${index}" aria-label="Like ${track.title}" aria-pressed="false" title="Like">
        <span class="control-glyph glyph-heart" aria-hidden="true"></span>
        <span class="like-count">0</span>
      </button>
    </div>
  `).join("");

  if (!trackList.dataset.bound) {
    trackList.dataset.bound = "true";
    trackList.addEventListener("click", (event) => {
      const likeButton = event.target.closest("[data-like-index]");
      if (likeButton) {
        toggleLike(Number(likeButton.dataset.likeIndex));
        return;
      }

      const row = event.target.closest(".track-row");
      if (!row) return;
      const index = Number(row.dataset.index);
      if (index === currentIndex && loadedIndex === index && !audio.paused) {
        audio.pause();
      } else {
        if (shuffleTrackEnabled) resetShuffle(index);
        loadTrack(index, true);
      }
    });

    trackList.addEventListener("keydown", (event) => {
      const row = event.target.closest(".track-row");
      if (!row || event.target.closest("[data-like-index]")) return;
      if (event.code !== "Enter" && event.code !== "Space") return;
      event.preventDefault();
      event.stopPropagation();
      row.click();
    });
  }

  updateLikes();
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
  const album = albums[currentAlbumIndex];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: album.artist,
    album: albumFullTitle(album),
    artwork: [{ src: new URL(track.thumb, location.href).href, sizes: "320x320", type: "image/webp" }],
  });
}

function updateArtwork(track) {
  artworkImage.src = track.cover;
  artworkImage.alt = `Иллюстрация трека ${track.title}`;
  artworkTitle.textContent = track.title;
  artworkSubtitle.textContent = `${albums[currentAlbumIndex].artist} · ${track.element}`;
}

function showArtwork(force = false) {
  updateArtwork(tracks[currentIndex]);
  artworkPreviousFocus = document.activeElement;
  artworkModal.hidden = false;
  document.body.classList.add("artwork-open");
  closeArtworkButton.focus({ preventScroll: true });
}

function hideArtwork() {
  if (artworkModal.hidden) return;
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
    playerCover.src = track.thumb;
    playerTitle.textContent = track.title;
    playerSubtitle.textContent = `${albums[currentAlbumIndex].artist} · ${track.element}`;
    updateArtwork(track);
    progress.value = 0;
    progress.style.setProperty("--value", "0%");
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
    updateMediaSession(track);
  }

  updateRows();
  updateLikes();
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
  if (shuffleTrackEnabled) {
    const target = shufflePosition + direction;
    if (target >= 0 && target < shuffleOrder.length) {
      shufflePosition = target;
      return shuffleOrder[shufflePosition];
    }
    return null;
  }

  const target = currentIndex + direction;
  if (target >= 0 && target < tracks.length) return target;
  return null;
}

function adjacentAlbum(direction) {
  if (albums.length < 2) return currentAlbumIndex;

  if (shuffleAlbumEnabled) {
    const target = albumShufflePosition + direction;
    if (target >= 0 && target < albumShuffleOrder.length) {
      albumShufflePosition = target;
      return albumShuffleOrder[albumShufflePosition];
    }
    resetAlbumShuffle(currentAlbumIndex);
    albumShufflePosition = direction > 0
      ? Math.min(1, albumShuffleOrder.length - 1)
      : albumShuffleOrder.length - 1;
    return albumShuffleOrder[albumShufflePosition];
  }

  return (currentAlbumIndex + direction + albums.length) % albums.length;
}

function changeAlbum(direction, autoplay = true) {
  const albumIndex = adjacentAlbum(direction);
  const trackIndex = direction < 0 ? albums[albumIndex].tracks.length - 1 : 0;
  setAlbum(albumIndex, autoplay, trackIndex);
}

function changeTrack(direction) {
  const target = adjacentTrack(direction);
  if (target !== null) {
    loadTrack(target, true);
    return;
  }
  changeAlbum(direction, true);
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
    changeAlbum(1, true);
    return;
  }
  loadTrack(target, true);
}

function setRangeFill(input, value) {
  input.style.setProperty("--value", `${value}%`);
}

function discoverDurations() {
  const labels = document.querySelectorAll("[data-duration]");
  const total = tracks.reduce((sum, track, index) => {
    if (labels[index]) labels[index].textContent = formatTime(track.duration);
    return sum + track.duration;
  }, 0);
  totalDuration.textContent = `${Math.round(total / 60)} мин`;
}

playPause.addEventListener("click", togglePlayback);
playAlbum.addEventListener("click", () => loadedIndex < 0 ? loadTrack(0, true) : togglePlayback());
previous.addEventListener("click", playPrevious);
next.addEventListener("click", () => changeTrack(1));
previousAlbum.addEventListener("click", () => changeAlbum(-1, true));
nextAlbum.addEventListener("click", () => changeAlbum(1, true));
shuffleTrack.addEventListener("click", () => {
  shuffleTrackEnabled = !shuffleTrackEnabled;
  if (shuffleTrackEnabled) resetShuffle(currentIndex);
  updateModes();
});
shuffleAlbum.addEventListener("click", () => {
  shuffleAlbumEnabled = !shuffleAlbumEnabled;
  if (shuffleAlbumEnabled) resetAlbumShuffle(currentAlbumIndex);
  updateModes();
});
repeatOne.addEventListener("click", () => {
  repeatOneEnabled = !repeatOneEnabled;
  updateModes();
});
playerLike.addEventListener("click", () => toggleLike(currentIndex));

openArtworkButton.addEventListener("click", () => showArtwork(true));
closeArtworkButton.addEventListener("click", hideArtwork);
artworkModal.addEventListener("click", (event) => {
  if (event.target === artworkModal) hideArtwork();
});

audio.addEventListener("play", () => {
  updateState();
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
  if (event.code === "KeyS") shuffleTrack.click();
  if (event.code === "KeyA") shuffleAlbum.click();
  if (event.code === "KeyR") repeatOne.click();
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

restoreLikes();
renderAlbumSwitcher();
updateAlbumView();
renderTracks();
loadTrack(0, false);
restoreModes();
discoverDurations();
setRangeFill(volume, Number(volume.value) * 100);

