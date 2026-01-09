var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var response = JSON.parse(this.responseText);
        console.log(response);
    }
};
xhttp.open("GET", "song-data.json", true);
xhttp.send();

let songData = [];
let bpmFilter = document.getElementById("bpm-filter");
let songCount = document.getElementById("song-count");
let totalDuration = document.getElementById("total-duration");
let addSongButton = document.getElementById("add-song-button");
let removeSongButton = document.getElementById("remove-song-button");
let viewAllSongsButton = document.getElementById("view-all-songs");
let generatePlaylistButton = document.getElementById("generate-playlist-button");
let clearPlaylistButton = document.getElementById("clear-playlist-button");
let savePlaylistButton = document.getElementById("save-playlist-button");

bpmFilter.addEventListener("change", filterSongsByBPM);

function filterSongsByBPM() {
    let selectedBPM = bpmFilter.value;
    let filteredSongs = songData;

    if (selectedBPM !== "all") {
        filteredSongs = songData.filter(song => song.bpm === selectedBPM);
    }

    updatePlaylist(filteredSongs);
}

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}