if (document.readyState === 'loading') {
    let subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = "Loading...";
    document.addEventListener('DOMContentLoaded', onDomReady);
} else {
    onDomReady();
}

function onDomReady() {
    let subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = "What's on your mind today?";

    let songData = [];
    let playlist = [];
    const STORAGE_KEY = 'jamstack_user_playlist';

    const libraryContainer = document.getElementById('library-container');
    const songCountEl = document.getElementById('song-count');
    const totalDurationEl = document.getElementById('total-duration');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const searchInput = document.getElementById('song-input');
    const clearBtn = document.getElementById('clear-playlist-button');
    const saveBtn = document.getElementById('save-playlist-button');
    const filterToggle = document.getElementById('filter-toggle');
    const filterStatus = document.getElementById('filter-status');
    
    let filterLabel = document.getElementById('filter-label');
    let sliderContainer = document.querySelector('.slider-container');
    let inputSection = document.querySelector('.input-section');

    loadPlaylistFromStorage();
    loadSongsXHR();

    bpmSlider.oninput = function () {
        const val = parseInt(this.value);
        bpmDisplay.innerHTML = val;
        filterSongs();
    };

    searchInput.addEventListener('input', filterSongs);

    filterToggle.addEventListener('change', function () {
        if (this.checked) {
            filterStatus.textContent = 'ON';
            filterStatus.style.color = '#00881b';
            if(sliderContainer) sliderContainer.style.display = 'block';
            if(filterLabel) filterLabel.style.display = 'block';
            if(inputSection) inputSection.style.display = 'block';
            filterSongs();
        } else {
            filterStatus.textContent = 'OFF';
            filterStatus.style.color = '#ff6f61';
            if(sliderContainer) sliderContainer.style.display = 'none';
            if(filterLabel) filterLabel.style.display = 'none';
            if(inputSection) inputSection.style.display = 'none';
            renderLibrary(songData);
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("Clear your entire playlist?")) {
            playlist = [];
            localStorage.removeItem(STORAGE_KEY);
            updatePlaylistUI();
        }
    });

    saveBtn.addEventListener('click', () => {
        if (playlist.length === 0) {
            alert('Your playlist is empty! Add some songs first.');
            return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
        alert('Playlist saved to your browser!');
    });

    function loadPlaylistFromStorage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                playlist = JSON.parse(saved);
                updatePlaylistUI();
            } catch (e) {
                console.error("Failed to load saved playlist", e);
            }
        }
    }

    function loadSongsXHR() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
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
                                    <p>Could not load song-data.json.</p>
                                    <p style="font-size:0.8rem; margin-top:10px;">Make sure you are running a Live Server.</p>
                                </div>
                            `;
                }
            }
        };
        xhttp.open("GET", "song-data.json", true);
        xhttp.send();
    }

    function renderLibrary(songs) {
        libraryContainer.innerHTML = "";
        if (!songs || songs.length === 0) {
            libraryContainer.innerHTML = `<p style="grid-column: 1/-1; font-family: sans-serif; font-size: 1.5rem;">No songs found matching your vibe.</p>`;
            return;
        }
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            const explicitBadge = song.explicit ? '<span style="color:#ff6f61; border:1px solid #ff6f61; padding:0 4px; font-size:0.7rem; border-radius:2px; margin-left:5px;">E</span>' : '';
            const moodHtml = song.mood ? song.mood.map(m => `<span class="mood-badge">${m}</span>`).join('') : '';
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${song.title} ${explicitBadge}</div>
                    <div class="card-artist">${song.artist}</div>
                </div>
                <div class="card-meta">
                    <div class="meta-tag">🎵 ${song.genre}</div>
                    <div class="meta-tag">⏱ ${song.duration}</div>
                    <div class="meta-tag">💓 ${song.bpm} BPM</div>
                    <div class="meta-tag">⚡ ${song.energyLevel}/10</div>
                    <div class="meta-tag" style="grid-column: span 2;">💿 ${song.album} (${song.releaseDate})</div>
                </div>
                <div class="mood-tags">${moodHtml}</div>
                <button class="add-to-playlist-btn" onclick="window.addToPlaylist(${song.id})">ADD TO PLAYLIST</button>
            `;
            libraryContainer.appendChild(card);
        });
    }

    function updatePlaylistUI() {
        const playlistGrid = document.getElementById('playlist-grid');
        playlistGrid.innerHTML = "";

        if (playlist.length === 0) {
            playlistGrid.innerHTML = `<div class="empty-playlist">Your playlist is empty. Start adding songs!</div>`;
            songCountEl.innerText = "Total Songs: 0";
            totalDurationEl.innerText = "Total Duration: 0 mins";
            return;
        }

        let totalSeconds = 0;
        const sliderVal = parseInt(bpmSlider.value);
        const searchTerm = searchInput.value.toLowerCase();
        const bpmRange = 20;
        const isFilterOn = filterToggle.checked;

        const filteredPlaylist = playlist.filter(song => {
            if (!isFilterOn) return true;
            const bpmMatch = (song.bpm >= sliderVal - bpmRange) && (song.bpm <= sliderVal + bpmRange);
            const searchMatch = song.title.toLowerCase().includes(searchTerm) ||
                song.artist.toLowerCase().includes(searchTerm);
            return bpmMatch && searchMatch;
        });

        filteredPlaylist.forEach((song) => {
            const card = document.createElement('div');
            card.className = 'playlist-card song-card';
            const explicitBadge = song.explicit ? '<span style="color:#ff6f61; border:1px solid #ff6f61; padding:0 4px; font-size:0.7rem; border-radius:2px; margin-left:5px;">E</span>' : '';
            const moodHtml = song.mood ? song.mood.map(m => `<span class="mood-badge">${m}</span>`).join('') : '';
            const actualIndex = playlist.indexOf(song);

            card.innerHTML = `
            <button class="remove-btn" onclick="window.removeFromPlaylist(${actualIndex})">✕</button>
            <div class="card-header">
                <div class="card-title">${song.title} ${explicitBadge}</div>
                <div class="card-artist">${song.artist}</div>
            </div>
            <div class="card-meta">
                <div class="meta-tag">🎵 ${song.genre}</div>
                <div class="meta-tag">⏱ ${song.duration}</div>
                <div class="meta-tag">💓 ${song.bpm} BPM</div>
                <div class="meta-tag">⚡ ${song.energyLevel}/10</div>
                <div class="meta-tag" style="grid-column: span 2;">💿 ${song.album} (${song.releaseDate})</div>
            </div>
            <div class="mood-tags">${moodHtml}</div>
        `;
            playlistGrid.appendChild(card);
            const parts = song.duration.split(':');
            totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });

        songCountEl.innerText = `Total Songs: ${playlist.length}`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        totalDurationEl.innerText = `Total Duration: ${mins}m ${secs}s`;

        if (isFilterOn && filteredPlaylist.length < playlist.length) {
            const filterNote = document.createElement('div');
            filterNote.className = 'empty-playlist';
            filterNote.style.border = '2px solid #ff6f61';
            filterNote.innerHTML = `Showing ${filteredPlaylist.length} of ${playlist.length} songs (filters active)`;
            playlistGrid.appendChild(filterNote);
        }
    }

    function filterSongs() {
        if (!filterToggle.checked) {
            renderLibrary(songData);
            updatePlaylistUI();
            return;
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
        updatePlaylistUI();
    }

    window.addToPlaylist = function (id) {
        const song = songData.find(s => s.id === id);
        if (song) {
            const exists = playlist.some(s => s.id === id);
            if (exists) {
                alert('This song is already in your playlist!');
                return;
            }
            playlist.push(song);
            updatePlaylistUI();
        }
    };

    window.removeFromPlaylist = function (index) {
        playlist.splice(index, 1);
        updatePlaylistUI();
    };
}