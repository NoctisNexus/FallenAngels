// =========================================================
// WINDOWS IN BLACK – PLAYER + LIKES
// =========================================================

const SUPABASE_URL =
    "https://jouzmuomffqtgeyggkv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d-UCXEnc0uTD4qz49hPjzg_ij6XWFyA";



const windowsSongs = [
    {
        title: "Remember",
        file: "musik/Remember.mp3"
    },
    {
        title: "Behind the Mask",
        file: "musik/Behind the Mask.mp3"
    },
    {
        title: "In to the Grey",
        file: "musik/in-to-the-grey.mp3"
    },
    {
        title: "Dunkle Seelen von DarkAngel und Windows in black",
        file: "musik/dunkle-seelen-darkangel-windows-in-black.mp3"
    },
    {
        title: "The night May never end DarkAngel vs Windows in Black",
        file: "musik/The night May never end DarkAngel vs Windows in Black.mp3"
    }
];
const audio =
    document.getElementById("windows-audio");

const playButton =
    document.getElementById("windows-play");

const previousButton =
    document.getElementById("windows-previous");

const nextButton =
    document.getElementById("windows-next");

const progress =
    document.getElementById("windows-progress");

const currentTime =
    document.getElementById("windows-current-time");

const duration =
    document.getElementById("windows-duration");

const volume =
    document.getElementById("windows-volume");

const title =
    document.getElementById("windows-song-title");

const status =
    document.getElementById("windows-song-status");

const playlist =
    document.getElementById("windows-playlist");


let currentSong = 0;


// =========================================================
// ZEIT
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
// SONG-ID FÜR SUPABASE
// =========================================================

function songId(song) {

    return `windows-in-black:${song.title}`;
}


// =========================================================
// LIKES LADEN
// =========================================================

async function getLikes(id) {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/song_likes?select=likes&song_id=eq.${encodeURIComponent(id)}`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Likes konnten nicht geladen werden.");
        }

        const data = await response.json();

        if (!data.length) {
            return 0;
        }

        return Number(data[0].likes) || 0;

    } catch (error) {

        console.error(error);

        return 0;
    }
}


// =========================================================
// LIKE SPEICHERN
// =========================================================

async function addLike(id) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/increment_song_like`,
        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                p_song_id: id
            })
        }
    );

    const text = await response.text();

    if (!response.ok) {
        throw new Error(
            `Like fehlgeschlagen: ${response.status} ${text}`
        );
    }

    return Number(text);
}


// =========================================================
// PLAYLIST
// =========================================================

async function createPlaylist() {

    playlist.innerHTML = "";

    windowsSongs.forEach((song, index) => {

        const item = document.createElement("div");
        item.className = "playlist-song";


        const songName = document.createElement("span");
        songName.textContent = song.title;


        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.className = "like-button";
        likeButton.textContent = "♡";


        const likeCount = document.createElement("span");
        likeCount.className = "like-count";
        likeCount.textContent = "0";


        // Titel + Herz + Like-Zahl SOFORT anzeigen
        item.appendChild(songName);
        item.appendChild(likeButton);
        item.appendChild(likeCount);

        playlist.appendChild(item);


        // Song auswählen
        item.addEventListener("click", () => {

            loadSong(index);
            playSong();

        });


        // Likes danach im Hintergrund laden
        const id = songId(song);

        getLikes(id)
            .then(likes => {

                likeCount.textContent = likes;

            })
            .catch(error => {

                console.error(
                    "Likes konnten nicht geladen werden:",
                    error
                );

            });


        // Like anklicken
        likeButton.addEventListener(
            "click",
            async (event) => {

                event.stopPropagation();

                likeButton.disabled = true;

                try {

                    const newLikes =
                        await addLike(id);

                    likeCount.textContent =
                        newLikes;

                    likeButton.textContent =
                        "♥";

                    likeButton.classList.add(
                        "liked"
                    );

                } catch (error) {

                    console.error(
                        "Like konnte nicht gespeichert werden:",
                        error
                    );

                } finally {

                    likeButton.disabled = false;

                }

            }
        );

    });

}

// =========================================================
// SONG LADEN
// =========================================================

function loadSong(index) {

    currentSong = index;

    const song =
        windowsSongs[currentSong];


    title.textContent =
        song.title;


    audio.pause();

    audio.src =
        song.file;

    audio.load();


    progress.value =
        0;

    currentTime.textContent =
        "0:00";

    duration.textContent =
        "0:00";

    status.textContent =
        "Bereit";
}


// =========================================================
// PLAY
// =========================================================

function playSong() {

    audio.play()
        .then(() => {

            playButton.textContent =
                "⏸";

            status.textContent =
                "Wiedergabe";

        })
        .catch(() => {

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

        currentSong--;

        if (currentSong < 0) {
            currentSong =
                windowsSongs.length - 1;
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

        currentSong++;

        if (
            currentSong >=
            windowsSongs.length
        ) {

            currentSong = 0;
        }

        loadSong(currentSong);

        playSong();

    }
);


// =========================================================
// AUTOMATISCH WEITER
// =========================================================

audio.addEventListener(
    "ended",
    () => {

        currentSong++;

        if (
            currentSong >=
            windowsSongs.length
        ) {

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
            formatTime(
                audio.currentTime
            );

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
// START
// =========================================================

audio.volume =
    0.8;

createPlaylist();

loadSong(0);
