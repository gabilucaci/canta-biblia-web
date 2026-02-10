
console.log("Hello at least something is working");

let songs = [];
let currentIndex = -1;

// constants for the now playing (mobile view when tapping on the song)

const npTitle = document.querySelectorAll(".np-title");
const npTrack = document.querySelector(".np-track");
const npTitleWrapper = document.querySelector(".np-title-wrap");

const npReference = document.getElementById("np-reference");

// this is the time displayed unde the progress bar
const npCurrentTime = document.getElementById("np-current-time");
const npTotalTime = document.getElementById("np-total-time");




function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}




const audioplay = document.getElementById("audioID");
let hscrollIn = document.querySelector('#hscroll');



async function loadSongs() {
  const response = await fetch("data/versete.json");
  console.log("Response status:", response.status);

  const data = await response.json();
  console.log("Songs:", data)

  const list = document.getElementById("song-list");

  songs = data.map((song, index) => {
    const row = document.createElement("div");
    row.className = "song-row";

    row.innerHTML =`
      <p class="song-title">${song.title}</p> 
      <p class="song-meta">${song.referinta}</p> `;


    list.appendChild(row);
    row.onclick = () => openSong(index);  

    return {
      ...song, 
      element: row,
      searchText: normalize(`${song.title} ${song.referinta || ""}`)
    };


  });


};

document.addEventListener("DOMContentLoaded", loadSongs);

// openSong function 

function openSong(index) {
  if (index >= songs.length) index = 0;
  if (index < 0) index = songs.length-1;

  const song = songs[index];

  document.querySelectorAll(".song-row").forEach(r => r.classList.remove("nowPlaying"));

  song.element.classList.add("nowPlaying");
  song.element.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });

  hscrollIn.textContent = `${song.title} – ${song.referinta}`;

  hscrollIn.classList.add("h-scroll-inner");

  hscrollIn.style.animation = 'none';
  hscrollIn.offsetHeight;
  hscrollIn.style.animation = '';

  npTitle.forEach(titleEl => { 
    titleEl.textContent = `${song.title}`;
  });

  audioplay.addEventListener("loadedmetadata", () => {
    npTotalTime.textContent = formatTime(audioplay.duration);
  });


  requestAnimationFrame(() => {
    const textW = npTitle[0].scrollWidth;
    const wrapW = npTitleWrapper.clientWidth;

    const npSpeed = 80;
    const npDistance = textW + wrapW;

    npTrack.style.setProperty("--np-duration", `${npDistance / npSpeed}s`);



  });

  npReference.textContent = `${song.referinta}`;





  if (vocalBtn.classList.contains("selected-variant")) {
    audioplay.src = song.vocals;
    audioplay.load();
    audioplay.play();

  } else if (instrumentalBtn.classList.contains("selected-variant")){
    audioplay.src = song.instrumentals;
    audioplay.load();
    audioplay.play();

  }

  currentIndex = index;



}

// Getting the selected variant as being either vocal or instrumental

const vocalBtn = document.getElementById("vocalBtn");
const instrumentalBtn = document.getElementById("instrumentalBtn");

vocalBtn.addEventListener("click", () => {

  instrumentalBtn.classList.remove("selected-variant");
  vocalBtn.classList.add("selected-variant");
});

instrumentalBtn.addEventListener("click", () => {
  vocalBtn.classList.remove("selected-variant");
  instrumentalBtn.classList.add("selected-variant");
});


// when songs stop playing, play next song

audioplay.addEventListener("ended", () => {

  if (repeating) {
    openSong(currentIndex);

  } else if (shuffling) {
    openSong(Math.floor(Math.random() * songs.length));

  } else {

    openSong(currentIndex + 1);
  }

});



// buttons logic

// Here is the play / pause button logic

const npPlayBtn = document.getElementById("np-playBtn");
const playbtn = document.getElementById("playbtn");

const playIcon = playbtn.querySelector("img");
const npPlayIcon = npPlayBtn.querySelector("img");


const PLAY_ICON = "/assets/icons/circle-play-solid-full.svg";
const PAUSE_ICON = "/assets/icons/circle-pause-solid-full.svg";

playbtn.addEventListener("click", () => {

  if (audioplay.paused) {
    hscrollIn.classList.add('h-scroll-inner');
    audioplay.play();
  } else {
    hscrollIn.classList.remove('h-scroll-inner');
    audioplay.pause();
  }

});

npPlayBtn.addEventListener("click", () => {

  npPlayBtn.classList.add("npPlayPress");
  setTimeout(() => {
    npPlayBtn.classList.remove("npPlayPress");
  }, 150);

  if (audioplay.paused) {
    hscrollIn.classList.add('h-scroll-inner');
    audioplay.play();
  } else {
    hscrollIn.classList.remove('h-scroll-inner');
    audioplay.pause();
  }
})

audioplay.addEventListener("play", () => {
  playIcon.src = PAUSE_ICON;
  npPlayIcon.src = PAUSE_ICON;
})

audioplay.addEventListener("pause", () => {
  playIcon.src = PLAY_ICON;
  npPlayIcon.src = PLAY_ICON;
})

// Previous song logic 

const npBackBtn = document.getElementById("np-previous");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  openSong(currentIndex - 1);
});

npBackBtn.addEventListener("click", () => {
  openSong(currentIndex - 1);
});

// next song logic

const npForwardBtn = document.getElementById("np-next")
const forwardBtn = document.getElementById("forwardBtn");

forwardBtn.addEventListener("click", () => {
  if (shuffling) {
    openSong(Math.floor(Math.random() * songs.length));

  } else {
    openSong(currentIndex + 1);

  }
});

npForwardBtn.addEventListener("click", () => {
  openSong(currentIndex + 1);
});


// repeat button logic 

const repeatBtn = document.getElementById("repeatBtn");
const npRepeatBtn = document.getElementById("np-repeat");

let repeating = false;

function setRepeatUI() {
  repeatBtn.classList.toggle("active-repeat", repeating);
  npRepeatBtn.classList.toggle("np-repeat-active", repeating);

  shuffleBtn.classList.remove("active-shuffle");
  npShuffleBtn.classList.remove("np-active-shuffle");
}

function toggleRepeat() {
  repeating = !repeating;
  shuffling = false;
  setRepeatUI();
}

repeatBtn.addEventListener("click", toggleRepeat); 

npRepeatBtn.addEventListener("click", toggleRepeat);

// shuffle button 

const npShuffleBtn = document.getElementById("np-shuffle");
const shuffleBtn = document.getElementById("shuffleBtn");

let shuffling = false;

function setShuffleUI() {
  shuffleBtn.classList.toggle("active-shuffle");
  npShuffleBtn.classList.toggle("np-active-shuffle");

  repeatBtn.classList.remove("active-repeat");
  npRepeatBtn.classList.remove("np-repeat-active");
}

function toggleShuffle() {
  shuffling = !shuffling;
  repeating = false;
  setShuffleUI();
}


shuffleBtn.addEventListener("click", toggleShuffle);
npShuffleBtn.addEventListener("click", toggleShuffle);

// here is the progress bars (because one is for desktop, one for mobile)

// getting the body of both players 


function attachSeek(barElement) {
  barElement.addEventListener("click", (e) => {

    const X = e.clientX;
    const rect = barElement.getBoundingClientRect();
    const L = rect.left;
    const W = rect.width;


    let ratio = (X - L) / W;

    ratio = Math.min(Math.max(ratio, 0), 1);

    if (!isNaN(audioplay.duration)) {

      audioplay.currentTime = ratio * audioplay.duration;
    }

  });

}

attachSeek(document.getElementById("play-line"));
attachSeek(document.getElementById("np-play-line"));


// getting the actual animation when song is playing 

const progressBar = document.getElementById("progress-bar");
const npProgressBar = document.getElementById("np-progress-bar");

let progressRAF = null;

function updateProgress() {

  if (!audioplay.paused && !isNaN(audioplay.duration)) {

    const percent = (audioplay.currentTime / audioplay.duration) * 100 || 0;

    progressBar.style.width = percent + '%';
    npProgressBar.style.width = percent + '%';

    npCurrentTime.textContent = formatTime(audioplay.currentTime);

  }
  progressRAF = requestAnimationFrame(updateProgress);
}

audioplay.addEventListener("play", () => {
  if (!progressRAF) {
    progressRAF = requestAnimationFrame(updateProgress);
  }
});

function stopProgressRAF() {
  if (progressRAF) {
    cancelAnimationFrame(progressRAF);
    progressRAF = null;
  }
}

audioplay.addEventListener("pause", stopProgressRAF);
audioplay.addEventListener("ended", stopProgressRAF);

// getting the current time and total time unde the progress bar




// search functionality 

const InputSearching = document.querySelector("[data-input]");


InputSearching.addEventListener("input", e => {
  /* Get input, and trim it, normalize it, and store all of that in terms*/
  const value = normalize(e.target.value);

  const terms = value.split(" ").filter(Boolean);

  /* actually looking is the input matches the title or the reference and hiding the ones that dont*/

  songs.forEach(song => {

    const isVisible = terms.every(term => song.searchText.includes(term));

    song.element.classList.toggle("hide", !isVisible);
  });
});

InputSearching.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const visibleSongs = songs
  .map(s => s.element)
  .filter(el => el.offsetParent !== null);

  if (!visibleSongs.length) return;

  visibleSongs[0].click();

  InputSearching.value = "";
  InputSearching.dispatchEvent(new Event("input"));

})


// Here is the part to get different placeholder in the search bar 

const input = document.getElementById("SearchPlaceholder");
const MEDIAMATCH = window.matchMedia("(max-width: 1080px)"); 

function updatePlaceholder(e) {
  input.placeholder = e.matches
    ? "Căutare" : "Caută cuvinte cheie sau referința Biblică";
}

updatePlaceholder(MEDIAMATCH);

MEDIAMATCH.addEventListener("change", updatePlaceholder);


// getting the mobile player view
const hscrollOut = document.getElementById("h-scroll-outer");
const npSheet = document.getElementById("now-playing-sheet");

hscrollOut.addEventListener("click", () => {
  npSheet.classList.add("openSheet");

});




const closeSheetBtn = document.getElementById("close-sheetBtn");

closeSheetBtn.addEventListener("click", () => {
  npSheet.classList.remove("openSheet");
});


// getting the functionality that when the user swipes down on the mobile np view, he might get the panel down

let firstY = null;

npSheet.addEventListener("touchstart", e => {
  firstY = e.touches[0].clientY;
}, {passive: false});

console.log(firstY);

npSheet.addEventListener("touchmove", (e) => {
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - firstY;

  if (deltaY > 0) {
    console.log("preventing default")
    e.preventDefault();
 }
}, {passive: false});

npSheet.addEventListener("touchend", e => {
  const endY = e.changedTouches[0].clientY;
  const deltaY = endY - firstY;

  console.log(deltaY)

  if (deltaY > 50) {
    console.log("removing opensheet")
    npSheet.classList.remove("openSheet");
  }
});







// npSheet.addEventListener("pointerdown", (e) => {
//   console.log("down")
//   firstY = e.clientY;
//   console.log(firstY);
// })
//
// npSheet.addEventListener("pointerup", e => {
//   console.log("up")
//   let deltaY = e.clientY - firstY;
//   console.log(deltaY)
//
//   if (deltaY > 30) {
//     npSheet.classList.remove("openSheet");
//     console.log()
//   }
//
//   firstY = null;
// });
//
//






