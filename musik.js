const audio = document.getElementById("audio-player");
const title = document.getElementById("song-title");
const status = document.getElementById("song-status");

const playButton = document.getElementById("play");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");

const progress = document.getElementById("progress");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");
const playlistContainer = document.getElementById("playlist");

let songs = [];
let currentSong = 0;


// --------------------------------------------------
// ALLE MP3-DATEIEN AUS DEM GITHUB-MUSIKORDNER LADEN
// --------------------------------------------------

async function loadSongs() {
    try {
        status.textContent = "Lade Musik …";

        const response = await fetch(
            "https://api.github.com/repos/NoctisNexus/FallenAngels/contents/musik?ref=main"
        );

        if (!response.ok) {
            throw new Error("Musikordner konnte nicht geladen werden.");
        }

        const files = await response.json();

        songs = files
            .filter(file =>
                file.type === "file" &&
                file.name.toLowerCase().endsWith(".mp3")
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name, "de", {
                    numeric: true,
                    sensitivity: "base"
                })
            );

        if (songs.length === 0) {
            status.textContent = "Keine Musik gefunden.";
            return;
        }

        createPlaylist();
        loadSong(0);

        status.textContent = "Bereit";

    } catch (error) {
        console.error(error);
        status.textContent = "Musik konnte nicht geladen werden.";
    }
}


// --------------------------------------------------
// PLAYLIST ERSTELLEN
// --------------------------------------------------

function createPlaylist() {

    playlistContainer.innerHTML = "";

    songs.forEach((song, index) => {

        const item = document.createElement("div");

        item.className = "playlist-song";

        item.textContent = cleanTitle(song.name);

        item.addEventListener("click", () => {
            loadSong(index);
            playSong();
        });

        playlistContainer.appendChild(item);
    });
}


// --------------------------------------------------
// TITEL SCHÖN ANZEIGEN
// --------------------------------------------------

function cleanTitle(filename) {

    return filename
        .replace(/\.mp3$/i, "")
        .replace(/%20/g, " ")
        .replace(/%27/g, "'")
        .replace(/%22/g, '"')
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/_/g, " ")
        .trim();
}


// --------------------------------------------------
// SONG LADEN
// --------------------------------------------------

function loadSong(index) {

    if (!songs.length) return;

    currentSong = index;

    const song = songs[currentSong];

   audio.src = song.download_url;
audio.load();

    title.textContent = cleanTitle(song.name);

    progress.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    updatePlaylist();
}


// --------------------------------------------------
// PLAY
// --------------------------------------------------

function playSong() {

    audio.play()
        .then(() => {
            playButton.textContent = "⏸";
            status.textContent = "Wiedergabe";
        })
        .catch(error => {
            console.error("Wiedergabe fehlgeschlagen:", error);
            status.textContent = "Titel konnte nicht abgespielt werden.";
        });
}


// --------------------------------------------------
// PAUSE
// --------------------------------------------------

function pauseSong() {

    audio.pause();

    playButton.textContent = "▶";
    status.textContent = "Pausiert";
}


// --------------------------------------------------
// PLAY / PAUSE BUTTON
// --------------------------------------------------

playButton.addEventListener("click", () => {

    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }

});


// --------------------------------------------------
// VORHERIGER TITEL
// --------------------------------------------------

previousButton.addEventListener("click", () => {

    if (!songs.length) return;

    currentSong--;

    if (currentSong < 0) {
        currentSong = songs.length - 1;
    }

    loadSong(currentSong);
    playSong();

});


// --------------------------------------------------
// NÄCHSTER TITEL
// --------------------------------------------------

nextButton.addEventListener("click", () => {

    if (!songs.length) return;

    currentSong++;

    if (currentSong >= songs.length) {
        currentSong = 0;
    }

    loadSong(currentSong);
    playSong();

});


// --------------------------------------------------
// AUTOMATISCH NÄCHSTEN TITEL SPIELEN
// --------------------------------------------------

audio.addEventListener("ended", () => {

    currentSong++;

    if (currentSong >= songs.length) {
        currentSong = 0;
    }

    loadSong(currentSong);
    playSong();

});


// --------------------------------------------------
// LADEZEIT
// --------------------------------------------------

audio.addEventListener("loadedmetadata", () => {

    duration.textContent = formatTime(audio.duration);

    progress.max = audio.duration;

});


// --------------------------------------------------
// FORTSCHRITT
// --------------------------------------------------

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    progress.value = audio.currentTime;

    currentTime.textContent = formatTime(audio.currentTime);

});


// --------------------------------------------------
// ZEITLEISTE
// --------------------------------------------------

progress.addEventListener("input", () => {

    audio.currentTime = progress.value;

});


// --------------------------------------------------
// LAUTSTÄRKE
// --------------------------------------------------

volume.addEventListener("input", () => {

    audio.volume = volume.value;

});


// --------------------------------------------------
// ZEIT FORMATIEREN
// --------------------------------------------------

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secs}`;
}


// --------------------------------------------------
// AKTUELLEN TITEL IN PLAYLIST MARKIEREN
// --------------------------------------------------

function updatePlaylist() {

    const items =
        playlistContainer.querySelectorAll(".playlist-song");

    items.forEach((item, index) => {

        item.classList.toggle(
            "active",
            index === currentSong
        );

    });
}


// --------------------------------------------------
// START
// --------------------------------------------------

volume.value = 0.8;
audio.volume = 0.8;

loadSongs();
