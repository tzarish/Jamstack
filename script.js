let songData = [];
let playlist = [];

const libraryContainer = document.getElementById('library-container');
const playlistEl = document.getElementById('playlist');
const songCountEl = document.getElementById('song-count');
const totalDurationEl = document.getElementById('total-duration');
const bpmSlider = document.getElementById('bpm-slider');
const bpmDisplay = document.getElementById('bpm-display');
const searchInput = document.getElementById('song-input');
const clearBtn = document.getElementById('clear-playlist-button');

window.onload = () => {
    loadSongsXHR();
};

bpmSlider.oninput = function () {
    const val = parseInt(this.value);
    bpmDisplay.innerHTML = val;
    filterSongs();
}

searchInput.addEventListener('input', filterSongs);

clearBtn.addEventListener('click', () => {
    playlist = [];
    updatePlaylistUI();
});

const filterToggle = document.getElementById('filter-toggle');
const filterStatus = document.getElementById('filter-status');

filterToggle.addEventListener('change', function () {
    if (this.checked) {
        filterStatus.textContent = 'ON';
        filterStatus.style.color = '#00881b';
        filterSongs();
    } else {
        filterStatus.textContent = 'OFF';
        filterStatus.style.color = '#ff6f61';
        renderLibrary(songData);
    }
});

function loadSongsXHR() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            try {
                songData = JSON.parse(this.responseText);
                renderLibrary(songData);
            } catch (e) {
                console.error("Error parsing JSON:", e);
            }

        } else {
            console.error("Error loading file. Status:", this.status);
            libraryContainer.innerHTML = `
                            <div style="grid-column: 1/-1; text-align: center; padding: 2em; border: 1px solid #740a00;">
                                <h3 style="color: #ff6f61;">Error</h3>
                                <p>Could not load song-data.json using XHR.</p>
                            </div>
                        `;
        }
    };
    xhttp.open("GET", "song-data.json", true);
    xhttp.send();
}

function renderLibrary(songs) {
    libraryContainer.innerHTML = "";

    if (songs.length === 0) {
        libraryContainer.innerHTML = `<p style="grid-column: 1/-1; font-family: sans-serif; font-size: 1.5rem;">No songs found matching your vibe.</p>`;
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';

        const explicitBadge = song.explicit ? '<span style="color:#ff6f61; border:1px solid #ff6f61; padding:0 4px; font-size:0.7rem; border-radius:2px; margin-left:5px;">E</span>' : '';

        const moodHtml = song.mood.map(m => `<span class="mood-badge">${m}</span>`).join('');

        card.innerHTML = `
                    <div class="card-header">
                        <div class="card-title">${song.title} ${explicitBadge}</div>
                        <div class="card-artist">${song.artist}</div>
                    </div>
                    
                    <div class="card-meta">
                        <div class="meta-tag">${song.genre}</div>
                        <div class="meta-tag">${song.duration}</div>
                        <div class="meta-tag">${song.bpm} BPM</div>
                        <div class="meta-tag">Lvl ${song.energyLevel}</div>
                        <div class="meta-tag" style="grid-column: span 2;">${song.album} (${song.releaseDate})</div>
                    </div>
                    
                    <div class="mood-tags">
                        ${moodHtml}
                    </div>

                    <button class="add-to-playlist-btn" onclick="addToPlaylist(${song.id})">ADD TO PLAYLIST</button>
                `;

        libraryContainer.appendChild(card);
    });
}

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function () {
    output.innerHTML = this.value;
}

function filterSongs() {

    function filterSongs() {
        if (!filterToggle.checked) {
            return;
        }
    }

    const sliderVal = parseInt(bpmSlider.value);
    const searchTerm = searchInput.value.toLowerCase();
    const bpmRange = 20;

    const filtered = songData.filter(song => {
        const bpmMatch = (song.bpm >= sliderVal - bpmRange) && (song.bpm <= sliderVal + bpmRange);

        const searchMatch = song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm);

        return bpmMatch && searchMatch;
    });

    renderLibrary(filtered);
}