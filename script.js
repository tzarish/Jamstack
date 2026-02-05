if (document.readyState === 'loading') {
    let subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = "Loading...";
    document.addEventListener('DOMContentLoaded', onDomReady);
} else {
    onDomReady();
}

function onDomReady() {
    let subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = "Signature Lyrics:";

    function startSubtitleTyping() {
        const typingText = document.getElementById('typing-text');

        const textArray = [
            "I can't sleep until I feel your touch",
            "I would gladly break my heart for you",
            "Each time you have a dream, you'll never know what it means",
            "Don't play with her, don't be dishonest",
            "I raise my flags, dye my clothes, It's a revolution I suppose",
            "Why'd you come? You knew you should have stayed",
            "Wish we could turn back time to the good old days",
            "I think of two young lovers running wild and free",
            "Bless your heart, make you part of my life forever",
            "So come on, come on, dark star, been loving you and I can't get enough",
            "Don't love someone else, I want you all to myself",
            "When I said that I love you, I meant that I love you forever"
        ];

        let loopNum = (Math.random() * textArray.length) | 0;
        let isDeleting = false;
        let text = "";

        function type() {
            const current = loopNum % textArray.length;
            const fullText = textArray[current];

            if (!isDeleting) {
                text = fullText.substring(0, text.length + 1);
                typingText.textContent = text;

                if (text === fullText) {
                    setTimeout(() => {
                        isDeleting = true;
                        type();
                    }, 2000);
                    return;
                }
            } else {
                text = fullText.substring(0, text.length - 1);
                typingText.textContent = text;

                if (text === "") {
                    isDeleting = false;
                    loopNum++;
                }
            }
            setTimeout(type, isDeleting ? 20 : 30);
        }

        type();
    }
    startSubtitleTyping();

    let songData = [];
    let playlist = [];
    let songMetadata = {};
    const STORAGE_KEY = 'jamstack_user_playlist';
    const METADATA_KEY = 'jamstack_song_metadata';
    const CUSTOM_SONGS_KEY = 'jamstack_custom_songs';

    const libraryContainer = document.getElementById('library-container');
    const toggleLibraryBtn = document.getElementById('toggle-library-button');
    const songCountEl = document.getElementById('song-count');
    const totalDurationEl = document.getElementById('total-duration');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    const searchInput = document.getElementById('song-input');
    const clearBtn = document.getElementById('clear-playlist-button');
    const saveBtn = document.getElementById('save-playlist-button');

    const searchToggle = document.getElementById('search-toggle');
    const searchStatus = document.getElementById('search-status');
    const searchSection = document.getElementById('search-section');

    const bpmToggle = document.getElementById('bpm-toggle');
    const bpmStatus = document.getElementById('bpm-status');
    const bpmSection = document.getElementById('bpm-section');
    const filterLabel = document.getElementById('filter-label');

    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const addSongForm = document.getElementById('add-song-form');

    loadMetadataFromStorage();
    loadPlaylistFromStorage();
    updatePlaylistUI();
    loadSongsXHR();

    searchToggle.addEventListener('change', function () {
        if (this.checked) {
            searchStatus.textContent = 'ON';
            searchStatus.style.color = '#00881b';
            searchSection.style.display = 'block';
        } else {
            searchStatus.textContent = 'OFF';
            searchStatus.style.color = '#ff6f61';
            searchSection.style.display = 'none';
            searchInput.value = '';
        }
        filterSongs();
    });

    bpmToggle.addEventListener('change', function () {
        if (this.checked) {
            bpmStatus.textContent = 'ON';
            bpmStatus.style.color = '#00881b';
            bpmSection.style.display = 'block';
            filterLabel.style.display = 'block';
        } else {
            bpmStatus.textContent = 'OFF';
            bpmStatus.style.color = '#ff6f61';
            bpmSection.style.display = 'none';
            filterLabel.style.display = 'none';
        }
        filterSongs();
    });

    bpmSlider.oninput = function () {
        bpmDisplay.innerHTML = this.value;
        filterSongs();
    };

    searchInput.addEventListener('input', filterSongs);

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
        localStorage.setItem(METADATA_KEY, JSON.stringify(songMetadata));
        alert('Playlist saved to your browser!');
    });

    function loadPlaylistFromStorage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                playlist = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved playlist", e);
            }
        }
    }

    function loadMetadataFromStorage() {
        const saved = localStorage.getItem(METADATA_KEY);
        if (saved) {
            try {
                songMetadata = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load metadata", e);
            }
        }
    }

    function saveCustomSongs() {
        const customSongs = songData.filter(song => song.id > 200);
        localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(customSongs));
    }

    function loadCustomSongs() {
        const saved = localStorage.getItem(CUSTOM_SONGS_KEY);
        if (saved) {
            try {
                const customSongs = JSON.parse(saved);
                songData = songData.concat(customSongs);
            } catch (e) {
                console.error("Failed to load custom songs", e);
            }
        }
    }

    function loadSongsXHR() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                try {
                    songData = JSON.parse(this.responseText);
                    loadCustomSongs();
                    renderLibrary(songData);
                    libraryContainer.style.display = 'none';
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                }
            } else {
                console.error("Error loading file. Status:", this.status);
            }
        };
        xhttp.open("GET", "song-data.json", true);
        xhttp.send();
    };

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

    toggleLibraryBtn.addEventListener('click', function () {
        if (libraryContainer.style.display === 'none') {
            libraryContainer.style.display = 'grid';
            toggleLibraryBtn.textContent = 'Hide Library';
        } else {
            libraryContainer.style.display = 'none';
            toggleLibraryBtn.textContent = 'Show Library';
        }
    });

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
        const isSearchOn = searchToggle.checked;
        const isBpmOn = bpmToggle.checked;

        const filteredPlaylist = playlist.filter(song => {
            let matches = true;

            if (isBpmOn) {
                const bpmMatch = (song.bpm >= sliderVal - bpmRange) && (song.bpm <= sliderVal + bpmRange);
                matches = matches && bpmMatch;
            }

            if (isSearchOn && searchTerm) {
                const searchMatch = song.title.toLowerCase().includes(searchTerm) ||
                    song.artist.toLowerCase().includes(searchTerm);
                matches = matches && searchMatch;
            }

            return matches;
        });

        filteredPlaylist.forEach((song, displayIndex) => {
            const actualIndex = playlist.indexOf(song);
            const card = document.createElement('div');
            card.className = 'playlist-card song-card';
            const explicitBadge = song.explicit ? '<span style="color:#ff6f61; border:1px solid #ff6f61; padding:0 4px; font-size:0.7rem; border-radius:2px; margin-left:5px;">E</span>' : '';
            const moodHtml = song.mood ? song.mood.map(m => `<span class="mood-badge">${m}</span>`).join('') : '';

            const metadata = songMetadata[song.id] || { status: 'planning', rating: 0 };

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1em;">
                    <div style="display: flex; gap: 0.5em;">
                        <button class="move-btn" onclick="window.moveUp(${actualIndex})" ${actualIndex === 0 ? 'disabled' : ''} style="background: #740a00; color: white; border: none; padding: 0.3em 0.6em; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">▲</button>
                        <button class="move-btn" onclick="window.moveDown(${actualIndex})" ${actualIndex === playlist.length - 1 ? 'disabled' : ''} style="background: #740a00; color: white; border: none; padding: 0.3em 0.6em; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">▼</button>
                    </div>
                    <button class="remove-btn" onclick="window.removeFromPlaylist(${actualIndex})">✕</button>
                </div>
                
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
                
                <div style="margin-top: 1em; padding-top: 1em; border-top: 1px solid #444;">
                    <label style="display: block; margin-bottom: 0.5em; color: #ff6f61; font-size: 0.9rem;">Status:</label>
                    <select onchange="window.updateStatus(${song.id}, this.value)" style="width: 100%; padding: 0.5em; background: #1d1e22; color: white; border: 1px solid #740a00; border-radius: 4px; margin-bottom: 0.5em; font-family: inherit;">
                        <option value="planning" ${metadata.status === 'planning' ? 'selected' : ''}>Planning to Listen</option>
                        <option value="listened" ${metadata.status === 'listened' ? 'selected' : ''}>Listened</option>
                    </select>
                    
                    <label style="display: block; margin-bottom: 0.5em; color: #ff6f61; font-size: 0.9rem;">Rating: ${metadata.rating}/5</label>
                    <div style="display: flex; gap: 0.3em;">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <button onclick="window.updateRating(${song.id}, ${star})" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: ${star <= metadata.rating ? '#ffd700' : '#666'};">★</button>
                        `).join('')}
                    </div>
                </div>
            `;
            playlistGrid.appendChild(card);

            const parts = song.duration.split(':');
            totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });

        songCountEl.innerText = `Total Songs: ${playlist.length}`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        totalDurationEl.innerText = `Total Duration: ${mins}m ${secs}s`;

        if ((isSearchOn || isBpmOn) && filteredPlaylist.length < playlist.length) {
            const filterNote = document.createElement('div');
            filterNote.className = 'empty-playlist';
            filterNote.style.border = '2px solid #ff6f61';
            filterNote.innerHTML = `Showing ${filteredPlaylist.length} of ${playlist.length} songs (filters active)`;
            playlistGrid.appendChild(filterNote);
        }
    }

    function filterSongs() {
        const sliderVal = parseInt(bpmSlider.value);
        const searchTerm = searchInput.value.toLowerCase();
        const bpmRange = 20;
        const isSearchOn = searchToggle.checked;
        const isBpmOn = bpmToggle.checked;

        if (!isSearchOn && !isBpmOn) {
            renderLibrary(songData);
            updatePlaylistUI();
            return;
        }

        const filtered = songData.filter(song => {
            let matches = true;

            if (isBpmOn) {
                const bpmMatch = (song.bpm >= sliderVal - bpmRange) && (song.bpm <= sliderVal + bpmRange);
                matches = matches && bpmMatch;
            }

            if (isSearchOn && searchTerm) {
                const searchMatch = song.title.toLowerCase().includes(searchTerm) ||
                    song.artist.toLowerCase().includes(searchTerm);
                matches = matches && searchMatch;
            }

            return matches;
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

            if (!songMetadata[id]) {
                songMetadata[id] = { status: 'planning', rating: 0 };
            }

            updatePlaylistUI();
        }
    };

    window.removeFromPlaylist = function (index) {
        playlist.splice(index, 1);
        updatePlaylistUI();
    };

    window.updateStatus = function (songId, status) {
        if (!songMetadata[songId]) {
            songMetadata[songId] = { status: 'planning', rating: 0 };
        }
        songMetadata[songId].status = status;
        localStorage.setItem(METADATA_KEY, JSON.stringify(songMetadata));
    };

    window.updateRating = function (songId, rating) {
        if (!songMetadata[songId]) {
            songMetadata[songId] = { status: 'planning', rating: 0 };
        }
        songMetadata[songId].rating = rating;
        localStorage.setItem(METADATA_KEY, JSON.stringify(songMetadata));
        updatePlaylistUI();
    };

    window.moveUp = function (index) {
        if (index > 0) {
            [playlist[index], playlist[index - 1]] = [playlist[index - 1], playlist[index]];
            updatePlaylistUI();
        }
    };

    window.moveDown = function (index) {
        if (index < playlist.length - 1) {
            [playlist[index], playlist[index + 1]] = [playlist[index + 1], playlist[index]];
            updatePlaylistUI();
        }
    };

    toggleFormBtn.addEventListener('click', function () {
        if (addSongForm.style.display === 'none') {
            addSongForm.style.display = 'block';
            toggleFormBtn.textContent = 'Hide Form';
        } else {
            addSongForm.style.display = 'none';
            toggleFormBtn.textContent = 'Show Form';
        }
    });

    addSongForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newSong = {
            id: Date.now(),
            title: document.getElementById('form-title').value,
            artist: document.getElementById('form-artist').value,
            album: document.getElementById('form-album').value,
            releaseDate: document.getElementById('form-date').value,
            genre: document.getElementById('form-genre').value,
            bpm: parseInt(document.getElementById('form-bpm').value),
            duration: document.getElementById('form-duration').value,
            mood: document.getElementById('form-mood').value.split(',').map(m => m.trim()),
            energyLevel: parseInt(document.getElementById('form-energy').value),
            explicit: document.getElementById('form-explicit').checked
        };

        songData.push(newSong);
        saveCustomSongs();
        renderLibrary(songData);
        addSongForm.reset();
        addSongForm.style.display = 'none';
        toggleFormBtn.textContent = 'Show Form';
        alert('Song added successfully!');
    });

    let flickerText = document.querySelector('.flicker-text');
    if (flickerText) {
        flickerText.addEventListener('mouseover', function () {
            flickerText.style.animationPlayState = 'paused';
        });
        flickerText.addEventListener('mouseout', function () {
            flickerText.style.animationPlayState = 'running';
        });

        flickerText.addEventListener('click', function () {
            alert('You found the secret flicker text! 🎉');
        });
    }
}