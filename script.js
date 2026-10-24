/* ============================================================
   JavaScript Music Player
   Features: play/pause, next/previous, progress + seeking,
   volume + mute, shuffle, repeat (off / all / one), search,
   persistent favorites, keyboard shortcuts, accessibility.
   ============================================================ */

/* ---------- DOM references ---------- */
const playerEl = document.querySelector(".player");
const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");
const repeatButton = document.getElementById("repeat");
const muteButton = document.getElementById("mute");
const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const seekSlider = document.getElementById("seek");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const playingSong = document.getElementById("player-song-title");
const songArtist = document.getElementById("player-song-artist");
const favoriteCurrentButton = document.getElementById("favorite-current");
const searchInput = document.getElementById("search");
const favoritesFilterButton = document.getElementById("favorites-filter");
const resultsCount = document.getElementById("results-count");
const statusEl = document.getElementById("status");

/* ---------- Data ---------- */
const allSongs = [
  {
    id: 0,
    title: "Hello World",
    artist: "Rafael",
    duration: "0:23",
    src: "https://cdn.freecodecamp.org/curriculum/js-music-player/hello-world.mp3",
  },
  {
    id: 1,
    title: "In the Zone",
    artist: "Rafael",
    duration: "0:11",
    src: "https://cdn.freecodecamp.org/curriculum/js-music-player/in-the-zone.mp3",
  },
  {
    id: 2,
    title: "Camper Cat",
    artist: "Rafael",
    duration: "0:21",
    src: "https://cdn.freecodecamp.org/curriculum/js-music-player/camper-cat.mp3",
  },
  {
    id: 3,
    title: "Electronic",
    artist: "Rafael",
    duration: "0:15",
    src: "https://cdn.freecodecamp.org/curriculum/js-music-player/electronic.mp3",
  },
  {
    id: 4,
    title: "Sailing Away",
    artist: "Rafael",
    duration: "0:22",
    src: "https://cdn.freecodecamp.org/curriculum/js-music-player/sailing-away.mp3",
  },
];

/* ---------- Persistence (localStorage, safely wrapped) ---------- */
const STORAGE_KEYS = {
  favorites: "musicPlayer:favorites",
  prefs: "musicPlayer:prefs",
};

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) – the player still works */
  }
};

const savedPrefs = readStorage(STORAGE_KEYS.prefs, {});
const REPEAT_MODES = ["off", "all", "one"];

/* ---------- State ---------- */
const audio = new Audio();
audio.preload = "metadata";

const userData = {
  songs: allSongs,
  currentSong: null,
  songCurrentTime: 0,
  isPlaying: false,
  shuffle: Boolean(savedPrefs.shuffle),
  repeat: REPEAT_MODES.includes(savedPrefs.repeat) ? savedPrefs.repeat : "off",
  volume: Number.isFinite(savedPrefs.volume) ? savedPrefs.volume : 80,
  muted: Boolean(savedPrefs.muted),
  favorites: new Set(readStorage(STORAGE_KEYS.favorites, [])),
  query: "",
  favoritesOnly: false,
  history: [], // songs played in shuffle mode, for "previous"
};

const savePrefs = () =>
  writeStorage(STORAGE_KEYS.prefs, {
    shuffle: userData.shuffle,
    repeat: userData.repeat,
    volume: userData.volume,
    muted: userData.muted,
  });

const saveFavorites = () =>
  writeStorage(STORAGE_KEYS.favorites, [...userData.favorites]);

/* ---------- Helpers ---------- */
const announce = (message) => {
  // Clear first so repeating the same message is still announced.
  statusEl.textContent = "";
  setTimeout(() => (statusEl.textContent = message), 50);
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const parseDuration = (text) => {
  const [m, s] = text.split(":").map(Number);
  return m * 60 + s;
};

const escapeHTML = (text) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const setRangeFill = (input, percent) => input.style.setProperty("--progress", `${percent}%`);

const heartSVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

/* ---------- Playlist rendering + search ---------- */
const getVisibleSongs = () => {
  const query = userData.query.trim().toLowerCase();
  return userData.songs.filter((song) => {
    if (userData.favoritesOnly && !userData.favorites.has(song.id)) return false;
    if (!query) return true;
    return `${song.title} ${song.artist}`.toLowerCase().includes(query);
  });
};

const renderPlaylist = () => {
  const visible = getVisibleSongs();

  if (visible.length === 0) {
    playlistSongs.innerHTML = `<li class="empty-state">${
      userData.favoritesOnly && !userData.query
        ? "No favorites yet. Tap the heart on a song to add one."
        : "No songs match your search."
    }</li>`;
  } else {
    playlistSongs.innerHTML = visible
      .map((song) => {
        const isFav = userData.favorites.has(song.id);
        const title = escapeHTML(song.title);
        const artist = escapeHTML(song.artist);
        return `
        <li id="song-${song.id}" class="playlist-song">
          <button class="playlist-song-info" data-id="${song.id}" aria-label="Play ${title} by ${artist}">
            <span class="playlist-song-title">${title}</span>
            <span class="playlist-song-artist">${artist}</span>
            <span class="playlist-song-duration">${song.duration}</span>
          </button>
          <button class="icon-btn favorite-btn" data-fav="${song.id}" aria-pressed="${isFav}"
            aria-label="${isFav ? "Remove" : "Add"} ${title} ${isFav ? "from" : "to"} favorites">
            ${heartSVG}
          </button>
        </li>`;
      })
      .join("");
  }

  const total = userData.songs.length;
  resultsCount.textContent =
    userData.query || userData.favoritesOnly
      ? `${visible.length} of ${total} songs shown`
      : `${total} songs`;

  highlightCurrentSong();
};

const highlightCurrentSong = () => {
  const previousCurrentSong = document.querySelector('.playlist-song[aria-current="true"]');
  previousCurrentSong?.removeAttribute("aria-current");
  const songToHighlight = document.getElementById(`song-${userData.currentSong?.id}`);
  songToHighlight?.setAttribute("aria-current", "true");
};

/* ---------- Display ---------- */
const setPlayerDisplay = () => {
  const song = userData.currentSong;
  playingSong.textContent = song ? song.title : "Select a song";
  songArtist.textContent = song ? song.artist : "";
  totalTimeEl.textContent = song ? song.duration : "0:00";
  favoriteCurrentButton.disabled = !song;
  document.title = song ? `${song.title} · Music Player` : "Music Player";
  updateFavoriteCurrentButton();
};

const setPlayButtonAccessibleText = () => {
  const song = userData.currentSong;
  playButton.setAttribute("aria-label", song ? `Play ${song.title}` : "Play");
  pauseButton.setAttribute("aria-label", song ? `Pause ${song.title}` : "Pause");
};

const setPlayingState = (isPlaying) => {
  userData.isPlaying = isPlaying;
  playerEl.classList.toggle("is-playing", isPlaying);
  playButton.classList.toggle("playing", isPlaying);

  // Swap the visible button, keeping keyboard focus on whichever is shown.
  const focusWasOnControl =
    document.activeElement === playButton || document.activeElement === pauseButton;
  playButton.hidden = isPlaying;
  pauseButton.hidden = !isPlaying;
  if (focusWasOnControl) (isPlaying ? pauseButton : playButton).focus();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }
};

/* ---------- Core playback ---------- */
const startPlayback = () => {
  const attempt = audio.play();
  if (attempt && typeof attempt.catch === "function") {
    attempt.catch((error) => {
      if (error.name === "AbortError") return; // interrupted by another load
      setPlayingState(false);
      announce("Could not play this song.");
    });
  }
};

const playSong = (id, start = true) => {
  const song = userData.songs.find((s) => s.id === id);
  if (!song) return;

  const isNewSong = userData.currentSong?.id !== song.id;

  if (isNewSong) {
    audio.src = song.src;
    audio.currentTime = 0;
    resetProgress();
  } else if (start) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = userData.songCurrentTime;
  }

  userData.currentSong = song;
  setPlayingState(true);
  setPlayerDisplay();
  highlightCurrentSong();
  setPlayButtonAccessibleText();
  updateMediaSession();
  startPlayback();

  if (isNewSong) announce(`Playing ${song.title} by ${song.artist}`);
};

const pauseSong = () => {
  userData.songCurrentTime = audio.currentTime;
  setPlayingState(false);
  audio.pause();
};

const togglePlayback = () => {
  if (userData.isPlaying) {
    pauseSong();
  } else if (userData.currentSong === null) {
    const visible = getVisibleSongs();
    const first = visible[0] ?? userData.songs[0];
    playSong(first.id);
  } else {
    playSong(userData.currentSong.id, false);
  }
};

const stopAtEnd = () => {
  audio.pause();
  audio.currentTime = 0;
  userData.songCurrentTime = 0;
  setPlayingState(false);
  resetProgress();
  announce("Reached the end of the playlist.");
};

/* ---------- Navigation: next / previous / shuffle / repeat ---------- */
const getCurrentSongIndex = () => userData.songs.indexOf(userData.currentSong);

const getNextSong = () => userData.songs[getCurrentSongIndex() + 1];

const getPreviousSong = () => userData.songs[getCurrentSongIndex() - 1];

const getRandomSong = () => {
  const others = userData.songs.filter((s) => s.id !== userData.currentSong?.id);
  if (others.length === 0) return userData.currentSong;
  return others[Math.floor(Math.random() * others.length)];
};

const playNextSong = ({ fromEnded = false } = {}) => {
  if (userData.currentSong === null) {
    playSong(userData.songs[0].id);
    return;
  }

  // Repeat-one only applies when a song ends on its own.
  if (fromEnded && userData.repeat === "one") {
    playSong(userData.currentSong.id);
    return;
  }

  if (userData.shuffle) {
    userData.history.push(userData.currentSong.id);
    if (userData.history.length > 50) userData.history.shift();
    playSong(getRandomSong().id);
    return;
  }

  const nextSong = getNextSong();
  if (nextSong) {
    playSong(nextSong.id);
  } else if (userData.repeat === "all") {
    playSong(userData.songs[0].id);
  } else if (fromEnded) {
    stopAtEnd();
  } else {
    // Manual "next" on the last song without repeat: stay put.
    announce("This is the last song.");
  }
};

const playPreviousSong = () => {
  if (userData.currentSong === null) return;

  // Standard player behavior: restart if we're already a few seconds in.
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  if (userData.shuffle && userData.history.length > 0) {
    playSong(userData.history.pop());
    return;
  }

  const previousSong = getPreviousSong();
  if (previousSong) {
    playSong(previousSong.id);
  } else if (userData.repeat === "all") {
    playSong(userData.songs[userData.songs.length - 1].id);
  } else {
    playSong(userData.songs[0].id);
  }
};

const updateShuffleButton = () => {
  shuffleButton.setAttribute("aria-pressed", String(userData.shuffle));
  shuffleButton.setAttribute("aria-label", userData.shuffle ? "Shuffle on" : "Shuffle off");
};

const toggleShuffle = () => {
  userData.shuffle = !userData.shuffle;
  userData.history = [];
  updateShuffleButton();
  savePrefs();
  announce(userData.shuffle ? "Shuffle on" : "Shuffle off");
};

const updateRepeatButton = () => {
  const mode = userData.repeat;
  repeatButton.dataset.mode = mode;
  repeatButton.setAttribute("aria-pressed", String(mode !== "off"));
  repeatButton.setAttribute(
    "aria-label",
    mode === "off" ? "Repeat off" : mode === "all" ? "Repeat all" : "Repeat one"
  );
};

const cycleRepeat = () => {
  const next = REPEAT_MODES[(REPEAT_MODES.indexOf(userData.repeat) + 1) % REPEAT_MODES.length];
  userData.repeat = next;
  updateRepeatButton();
  savePrefs();
  announce(next === "off" ? "Repeat off" : next === "all" ? "Repeat all" : "Repeat one");
};

/* ---------- Progress + seeking ---------- */
const SEEK_MAX = Number(seekSlider.max);

const resetProgress = () => {
  seekSlider.value = 0;
  setRangeFill(seekSlider, 0);
  currentTimeEl.textContent = "0:00";
  const song = userData.currentSong;
  totalTimeEl.textContent = song ? song.duration : "0:00";
  seekSlider.setAttribute("aria-valuetext", `0:00 of ${totalTimeEl.textContent}`);
  seekSlider.disabled = !song;
};

const getDuration = () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
  return userData.currentSong ? parseDuration(userData.currentSong.duration) : 0;
};

const updateProgress = () => {
  const duration = getDuration();
  const current = audio.currentTime || 0;
  const ratio = duration ? Math.min(current / duration, 1) : 0;

  seekSlider.value = Math.round(ratio * SEEK_MAX);
  setRangeFill(seekSlider, ratio * 100);
  currentTimeEl.textContent = formatTime(current);
  totalTimeEl.textContent = formatTime(duration);
  seekSlider.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(duration)}`);
};

const seekToRatio = (ratio) => {
  const duration = getDuration();
  if (!duration) return;
  audio.currentTime = Math.max(0, Math.min(ratio, 1)) * duration;
  userData.songCurrentTime = audio.currentTime;
  updateProgress();
};

const seekBy = (seconds) => {
  if (!userData.currentSong) return;
  const duration = getDuration();
  audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  userData.songCurrentTime = audio.currentTime;
  updateProgress();
};

/* ---------- Volume + mute ---------- */
const applyVolume = () => {
  audio.volume = userData.volume / 100;
  audio.muted = userData.muted;

  const shown = userData.muted ? 0 : userData.volume;
  volumeSlider.value = userData.volume;
  setRangeFill(volumeSlider, userData.volume);
  volumeValue.textContent = `${shown}%`;
  volumeSlider.setAttribute("aria-valuetext", userData.muted ? "muted" : `${userData.volume} percent`);

  muteButton.setAttribute("aria-pressed", String(userData.muted));
  muteButton.setAttribute("aria-label", userData.muted ? "Unmute" : "Mute");
};

const setVolume = (value) => {
  userData.volume = Math.max(0, Math.min(100, Math.round(value)));
  // Dragging the slider up un-mutes; dragging to 0 counts as muted.
  userData.muted = userData.volume === 0;
  applyVolume();
  savePrefs();
};

const toggleMute = () => {
  // If volume is 0, unmuting should restore an audible level.
  if (userData.muted && userData.volume === 0) userData.volume = 50;
  userData.muted = !userData.muted;
  applyVolume();
  savePrefs();
  announce(userData.muted ? "Muted" : "Unmuted");
};

/* ---------- Favorites ---------- */
const updateFavoriteCurrentButton = () => {
  const song = userData.currentSong;
  const isFav = song ? userData.favorites.has(song.id) : false;
  favoriteCurrentButton.setAttribute("aria-pressed", String(isFav));
  favoriteCurrentButton.setAttribute(
    "aria-label",
    isFav ? "Remove from favorites" : "Add to favorites"
  );
};

const toggleFavorite = (id) => {
  const song = userData.songs.find((s) => s.id === id);
  if (!song) return;

  const wasFavorite = userData.favorites.has(id);
  if (wasFavorite) userData.favorites.delete(id);
  else userData.favorites.add(id);
  saveFavorites();

  // Re-render, then put focus back on the same heart button.
  const hadFocusInList = playlistSongs.contains(document.activeElement);
  renderPlaylist();
  updateFavoriteCurrentButton();
  if (hadFocusInList) playlistSongs.querySelector(`[data-fav="${id}"]`)?.focus();

  announce(wasFavorite ? `Removed ${song.title} from favorites` : `Added ${song.title} to favorites`);
};

/* ---------- Media Session (lock-screen / headphone controls) ---------- */
const updateMediaSession = () => {
  if (!("mediaSession" in navigator) || !userData.currentSong) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: userData.currentSong.title,
    artist: userData.currentSong.artist,
  });
};

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", togglePlayback);
  navigator.mediaSession.setActionHandler("pause", pauseSong);
  navigator.mediaSession.setActionHandler("previoustrack", playPreviousSong);
  navigator.mediaSession.setActionHandler("nexttrack", () => playNextSong());
}

/* ---------- Event listeners ---------- */
playButton.addEventListener("click", togglePlayback);
pauseButton.addEventListener("click", pauseSong);
nextButton.addEventListener("click", () => playNextSong());
previousButton.addEventListener("click", playPreviousSong);
shuffleButton.addEventListener("click", toggleShuffle);
repeatButton.addEventListener("click", cycleRepeat);
muteButton.addEventListener("click", toggleMute);
favoriteCurrentButton.addEventListener("click", () => {
  if (userData.currentSong) toggleFavorite(userData.currentSong.id);
});

volumeSlider.addEventListener("input", () => setVolume(Number(volumeSlider.value)));
seekSlider.addEventListener("input", () => seekToRatio(Number(seekSlider.value) / SEEK_MAX));

// Event delegation: one listener handles every playlist button.
playlistSongs.addEventListener("click", (event) => {
  const favButton = event.target.closest("[data-fav]");
  if (favButton) {
    toggleFavorite(Number(favButton.dataset.fav));
    return;
  }
  const songButton = event.target.closest("[data-id]");
  if (songButton) playSong(Number(songButton.dataset.id));
});

searchInput.addEventListener("input", () => {
  userData.query = searchInput.value;
  renderPlaylist();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && searchInput.value) {
    searchInput.value = "";
    userData.query = "";
    renderPlaylist();
  }
});

favoritesFilterButton.addEventListener("click", () => {
  userData.favoritesOnly = !userData.favoritesOnly;
  favoritesFilterButton.setAttribute("aria-pressed", String(userData.favoritesOnly));
  renderPlaylist();
});

/* Audio events */
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("durationchange", updateProgress);
audio.addEventListener("ended", () => playNextSong({ fromEnded: true }));
audio.addEventListener("error", () => {
  setPlayingState(false);
  announce("Sorry, this song could not be loaded.");
});

/* Keyboard shortcuts (ignored while typing or using form controls) */
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const target = event.target;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return;
  if (tag === "INPUT" && target.type !== "range") return; // typing in search

  const onRange = tag === "INPUT" && target.type === "range";
  const onButton = tag === "BUTTON";

  switch (event.key) {
    case " ":
      if (onButton) return; // let Space activate the focused button
      event.preventDefault();
      togglePlayback();
      break;
    case "ArrowRight":
      if (onRange) return; // sliders handle their own arrows
      event.preventDefault();
      seekBy(5);
      break;
    case "ArrowLeft":
      if (onRange) return;
      event.preventDefault();
      seekBy(-5);
      break;
    case "ArrowUp":
      if (onRange) return;
      event.preventDefault();
      setVolume(userData.volume + 5);
      break;
    case "ArrowDown":
      if (onRange) return;
      event.preventDefault();
      setVolume(userData.volume - 5);
      break;
    case "n":
    case "N":
      playNextSong();
      break;
    case "p":
    case "P":
      playPreviousSong();
      break;
    case "s":
    case "S":
      toggleShuffle();
      break;
    case "r":
    case "R":
      cycleRepeat();
      break;
    case "m":
    case "M":
      toggleMute();
      break;
    case "f":
    case "F":
      if (userData.currentSong) toggleFavorite(userData.currentSong.id);
      break;
    case "/":
      event.preventDefault();
      searchInput.focus();
      break;
    default:
  }
});

/* ---------- Initialise ---------- */
updateShuffleButton();
updateRepeatButton();
applyVolume();
setPlayerDisplay();
setPlayButtonAccessibleText();
resetProgress();
renderPlaylist();