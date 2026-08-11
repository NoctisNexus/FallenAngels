/* =========================================================
   FALLENANGELS
   MUSIKPLAYER
   ========================================================= */

const songs = [
 {
    title: "Ashes in My Heart",
    file: "musik/Ashes in My Heart (1).mp3"
},
    {
        title: "Raven Oath",
        file: "musik/raven-oath.mp3"
    },
    {
        title: "Runes of Blood",
        file: "musik/runes-of-blood.mp3"
    },
    {
        title: "Ashfall",
        file: "musik/ashfall.mp3"
    },
    {
        title: "Black Light",
        file: "musik/black-light.mp3"
    },
    {
        title: "Black Ravens",
        file: "musik/black-ravens.mp3"
    },
    {
        title: "Black Wings",
        file: "musik/black-wings.mp3"
    },
    {
        title: "Dunkle Seelen",
        file: "musik/dunkle-seelen.mp3"
    },
    {
        title: "Grey Days",
        file: "musik/grey-days.mp3"
    },
    {
        title: "Grey Echo",
        file: "musik/grey-echo.mp3"
    },
    {
        title: "In the Dark We Glow",
        file: "musik/in-the-dark-we-glow.mp3"
    },
    {
        title: "Kingdom",
        file: "musik/kingdom.mp3"
    },
    {
        title: "Kiss of Death",
        file: "musik/kiss-of-death.mp3"
    },
    {
        title: "Odin's Ravens Carry Me Away",
        file: "musik/odins-ravens-carry-me-away.mp3"
    },
    {
        title: "Phönix",
        file: "musik/phoenix.mp3"
    },
    {
        title: "Runes in My Skin",
        file: "musik/runes-in-my-skin.mp3"
    },
    {
        title: "Scars from the Night",
        file: "musik/scars-from-the-night.mp3"
    },
    {
        title: "Shadows Without a Name",
        file: "musik/shadows-without-a-name.mp3"
    },
    {
        title: "The Call of Valhalla",
        file: "musik/the-call-of-valhalla.mp3"
    },
    {
        title: "The Child That I Still Am",
        file: "musik/the-child-that-i-still-am.mp3"
    },
    {
        title: "The Night May Never End",
        file: "musik/the-night-may-never-end.mp3"
    },
    {
        title: "The Scars on My Soul",
        file: "musik/the-scars-on-my-soul.mp3"
    },
    {
        title: "To Ruin and Devastation",
        file: "musik/to-ruin-and-devastation.mp3"
    },
    {
        title: "Trust the Gods",
        file: "musik/trust-the-gods.mp3"
    }
];


/* =========================================================
   ELEMENTE
   ========================================================= */

const audio = document.getElementById("audio-player");
const playButton = document.getElementById("play");
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");

const songTitle = document.getElementById("song-title");
const songStatus = document.getElementById("song-status");

const playlistContainer = document.getElementById("playlist");


/* =========================================================
   AKTUELLER TITEL
   ========================================================= */

let currentSong = 0;


/* =========================================================
   ZEIT FORMATIEREN
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


/* =========================================================
   TITEL LADEN
   ========================================================= */

function loadSong(index) {

    currentSong = index;

    const song = songs[currentSong];

    audio.src = song.file;

    songTitle.textContent = song.title;

    songStatus.textContent = "Bereit";

    progress.value = 0;

    currentTime.textContent = "0:00";

    duration.textContent = "0:00";

    updatePlaylist();
}


/* =========================================================
   PLAYLIST ERSTELLEN
   ========================================================= */

function createPlaylist() {

    playlistContainer.innerHTML = "";

    songs.forEach((song, index) => {

        const item = document.createElement("div");

        item.className = "playlist-item";

        item.innerHTML = `
            <span class="playlist-number">
                ${(index + 1).toString().padStart(2, "0")}
            </span>

            <span>
                ${song.title}
            </span>
        `;

        item.addEventListener("click", () => {

            loadSong(index);

            audio.play();

        });

        playlistContainer.appendChild(item);

    });

    updatePlaylist();
}


/* =========================================================
   AKTIVEN TITEL MARKIEREN
   ========================================================= */

function updatePlaylist() {

    const items =
        playlistContainer.querySelectorAll(".playlist-item");

    items.forEach((item, index) => {

        item.classList.toggle(
            "active",
            index === currentSong
        );

    });
}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlay() {

    if (audio.paused) {

        audio.play();

    } else {

        audio.pause();

    }
}


/* =========================================================
   PLAY BUTTON AKTUALISIEREN
   ========================================================= */

function updatePlayButton() {

    if (audio.paused) {

        playButton.textContent = "▶";

        songStatus.textContent = "Bereit";

    } else {

        playButton.textContent = "Ⅱ";

        songStatus.textContent = "Wiedergabe";

    }

}


/* =========================================================
   VORHERIGER TITEL
   ========================================================= */

function previousSong() {

    currentSong--;

    if (currentSong < 0) {
        currentSong = songs.length - 1;
    }

    loadSong(currentSong);

    audio.play();
}


/* =========================================================
   NÄCHSTER TITEL
   ========================================================= */

function nextSong() {

    currentSong++;

    if (currentSong >= songs.length) {
        currentSong = 0;
    }

    loadSong(currentSong);

    audio.play();
}


/* =========================================================
   FORTSCHRITT
   ========================================================= */

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) {
        return;
    }

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    progress.value = percentage;

    currentTime.textContent =
        formatTime(audio.currentTime);

});


/* =========================================================
   DAUER
   ========================================================= */

audio.addEventListener("loadedmetadata", () => {

    duration.textContent =
        formatTime(audio.duration);

});


/* =========================================================
   FORTSCHRITTSBALKEN
   ========================================================= */

progress.addEventListener("input", () => {

    if (!audio.duration) {
        return;
    }

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});


/* =========================================================
   LAUTSTÄRKE
   ========================================================= */

volume.addEventListener("input", () => {

    audio.volume = volume.value;

});


/* =========================================================
   PLAY / PAUSE EVENTS
   ========================================================= */

audio.addEventListener("play", () => {

    updatePlayButton();

});


audio.addEventListener("pause", () => {

    updatePlayButton();

});


/* =========================================================
   SONG ENDE
   ========================================================= */

audio.addEventListener("ended", () => {

    nextSong();

});


/* =========================================================
   BUTTONS
   ========================================================= */

playButton.addEventListener(
    "click",
    togglePlay
);

previousButton.addEventListener(
    "click",
    previousSong
);

nextButton.addEventListener(
    "click",
    nextSong
);


/* =========================================================
   FEHLER
   ========================================================= */

audio.addEventListener("error", () => {

    songStatus.textContent =
        "Audiodatei nicht gefunden";

});


/* =========================================================
   START
   ========================================================= */

audio.volume = 0.8;

createPlaylist();

loadSong(0);
