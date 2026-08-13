// =========================================================
// FALLENANGELS – MUSIKPLAYER
// Liest automatisch alle MP3s aus dem GitHub-Ordner /musik/
// =========================================================

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

const SUPABASE_URL =
    "https://jouzmuomffqtgeyggkv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d-UCXEnc0uTD4qz49hPjzg_ij6XWFyA";
let songs = [];
let currentSong = 0;


// =========================================================
// DATEINAMEN -> SCHÖNER TITEL
// =========================================================

function cleanTitle(filename) {

    return filename
        .replace(/\.mp3$/i, "")
        .replace(/%20/g, " ")
        .replace(/%26/g, "&")
        .replace(/%27/g, "'")
        .replace(/%22/g, '"')
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/_/g, " ")
        .trim();
}


// =========================================================
// SPEZIALTITEL
// =========================================================

function getSongTitle(filename) {

    const normalized = filename.toLowerCase();

    if (
        normalized.includes("dunkle-seelen-darkangel-windows-in-black") ||
        normalized.includes("dunkle seelen von darkangel")
    ) {
        return "Dunkle Seelen von DarkAngel und Windows in black";
    }

    return cleanTitle(filename);
}


// =========================================================
// ALLE MP3S VON GITHUB LADEN
// =========================================================

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
                getSongTitle(a.name).localeCompare(
                    getSongTitle(b.name),
                    "de",
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
            );


        if (songs.length === 0) {

            status.textContent =
                "Keine Musik gefunden.";

            return;
        }


        createPlaylist();

        loadSong(0);

        status.textContent = "Bereit";


    } catch (error) {

        console.error(error);

        status.textContent =
            "Musik konnte nicht geladen werden.";
    }
}


// =========================================================
// PLAYLIST ERSTELLEN
// =========================================================

function createPlaylist() {

    playlistContainer.innerHTML = "";

    songs.forEach((song, index) => {

        const item = document.createElement("div");
        item.className = "playlist-song";

        const songName = document.createElement("span");
        songName.textContent = getSongTitle(song.name);

        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.className = "like-button";
        likeButton.textContent = "♡";

        const likeCount = document.createElement("span");
        likeCount.className = "like-count";
        likeCount.textContent = "0";

        likeButton.addEventListener("click", async (event) => {

            event.stopPropagation();

            const songId = song.name;

            try {

                const existingResponse = await fetch(
                    `${SUPABASE_URL}/rest/v1/song_likes?select=song_id,likes&song_id=eq.${encodeURIComponent(songId)}`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );

                const existing = await existingResponse.json();

                let likes = 0;

                if (existing.length === 0) {

                    await fetch(
                        `${SUPABASE_URL}/rest/v1/song_likes`,
                        {
                            method: "POST",
                            headers: {
                                apikey: SUPABASE_KEY,
                                Authorization: `Bearer ${SUPABASE_KEY}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                song_id: songId,
                                likes: 1
                            })
                        }
                    );

                    likes = 1;

                } else {

                    likes = Number(existing[0].likes) + 1;

                    await fetch(
                        `${SUPABASE_URL}/rest/v1/song_likes?song_id=eq.${encodeURIComponent(songId)}`,
                        {
                            method: "PATCH",
                            headers: {
                                apikey: SUPABASE_KEY,
                                Authorization: `Bearer ${SUPABASE_KEY}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                likes: likes
                            })
                        }
                    );
                }

                likeCount.textContent = likes;
                likeButton.textContent = "♥";

            } catch (error) {

                console.error("Like konnte nicht gespeichert werden:", error);

            }

        });

        item.appendChild(songName);
        item.appendChild(likeButton);
        item.appendChild(likeCount);

        item.addEventListener("click", () => {

            loadSong(index);
            playSong();

        });

        playlistContainer.appendChild(item);
    });

    updatePlaylist();
}


// =========================================================
// SONG LADEN
// =========================================================

function loadSong(index) {

    if (!songs.length) {
        return;
    }


    currentSong = index;

    const song = songs[currentSong];


    title.textContent =
        getSongTitle(song.name);

    progress.value = 0;

    currentTime.textContent =
        "0:00";

    duration.textContent =
        "0:00";


    audio.pause();

    audio.src =
        song.download_url;

    audio.load();


    updatePlaylist();

    status.textContent =
        "Bereit";
}


// =========================================================
// ABSPIELEN
// =========================================================

function playSong() {

    audio.play()
        .then(() => {

            playButton.textContent =
                "⏸";

            status.textContent =
                "Wiedergabe";

        })
        .catch(error => {

            console.error(
                "Wiedergabe fehlgeschlagen:",
                error
            );

            status.textContent =
                "Titel konnte nicht abgespielt werden.";
        });
}


// =========================================================
// PAUSE
// =========================================================

function pauseSong() {

    audio.pause();

    playButton.textContent =
        "▶";

    status.textContent =
        "Pausiert";
}


// =========================================================
// PLAY / PAUSE
// =========================================================

playButton.addEventListener(
    "click",
    () => {

        if (audio.paused) {
            playSong();
        } else {
            pauseSong();
        }

    }
);


// =========================================================
// VORHERIGER TITEL
// =========================================================

previousButton.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }


        currentSong--;

        if (currentSong < 0) {

            currentSong =
                songs.length - 1;
        }


        loadSong(currentSong);

        playSong();

    }
);


// =========================================================
// NÄCHSTER TITEL
// =========================================================

nextButton.addEventListener(
    "click",
    () => {

        if (!songs.length) {
            return;
        }


        currentSong++;

        if (currentSong >= songs.length) {

            currentSong = 0;
        }


        loadSong(currentSong);

        playSong();

    }
);


// =========================================================
// AUTOMATISCH NÄCHSTER TITEL
// =========================================================

audio.addEventListener(
    "ended",
    () => {

        currentSong++;

        if (currentSong >= songs.length) {
            currentSong = 0;
        }


        loadSong(currentSong);

        playSong();

    }
);


// =========================================================
// METADATEN
// =========================================================

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(audio.duration);

        progress.max =
            audio.duration;

    }
);


// =========================================================
// FORTSCHRITT
// =========================================================

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }


        progress.value =
            audio.currentTime;

        currentTime.textContent =
            formatTime(audio.currentTime);

    }
);


// =========================================================
// FORTSCHRITTSBALKEN
// =========================================================

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }


        audio.currentTime =
            progress.value;

    }
);


// =========================================================
// LAUTSTÄRKE
// =========================================================

volume.addEventListener(
    "input",
    () => {

        audio.volume =
            volume.value;

    }
);


// =========================================================
// ZEIT FORMATIEREN
// =========================================================

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }


    const minutes =
        Math.floor(seconds / 60);

    const secondsRest =
        Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");


    return `${minutes}:${secondsRest}`;
}


// =========================================================
// AKTIVEN TITEL MARKIEREN
// =========================================================

function updatePlaylist() {

    const items =
        playlistContainer.querySelectorAll(
            ".playlist-song"
        );


    items.forEach(
        (item, index) => {

            item.classList.toggle(
                "active",
                index === currentSong
            );

        }
    );
}


// =========================================================
// START
// =========================================================

volume.value = 0.8;
audio.volume = 0.8;

loadSongs();
