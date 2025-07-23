function scrollToCreate() {
  document.getElementById("create").scrollIntoView({ behavior: "smooth" });
}

function saveMemory() {
  const emotion = document.querySelector(".emotion-btn.selected")?.dataset.emotion || "undefined";
  const loops = Array.from(document.querySelectorAll("input[name='loops']:checked")).map(l => l.value);
  const note = document.getElementById("note").value;
  const journeyName = prompt("Name this journey?") || "Untitled";
  const timestamp = new Date().toISOString();
  const lat = selectedLatLng?.lat || 0;
  const lng = selectedLatLng?.lng || 0;

  const memory = {
    emotion,
    loops,
    note,
    journeyName,
    timestamp,
    lat,
    lng
  };

  const existing = JSON.parse(localStorage.getItem("soundmap") || "[]");
  existing.push(memory);
  localStorage.setItem("soundmap", JSON.stringify(existing));
  alert("Memory saved 🎵");
  clearForm();
  renderMapView();
  addMapMarkers();
}

function clearForm() {
  document.getElementById("note").value = "";
  document.querySelectorAll("input[name='loops']").forEach(input => (input.checked = false));
  document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("selected"));
  if (marker) map.removeLayer(marker);
  selectedLatLng = null;
}

function renderMapView() {
  const container = document.getElementById("soundmap-view");
  const memories = JSON.parse(localStorage.getItem("soundmap") || "[]");
  container.innerHTML = "";
  memories.forEach(mem => {
    const div = document.createElement("div");
    div.className = "memory-card";
    div.innerHTML = `
      <strong>${mem.emotion}</strong> — <em>${mem.journeyName}</em><br>
      Loops: ${mem.loops.join(", ")}<br>
      <em>${new Date(mem.timestamp).toLocaleString()}</em><br>
      <p>${mem.note}</p>
      <button onclick='playLoops(${JSON.stringify(mem.loops)})'>Play</button>
      <button onclick='pauseAllLoops()'>Pause</button>
    `;
    div.style.opacity = 0;
    container.appendChild(div);
    setTimeout(() => (div.style.opacity = 1), 100);
  });
}

function addMapMarkers() {
  const memories = JSON.parse(localStorage.getItem("soundmap") || "[]");
  memories.forEach(mem => {
    const marker = L.marker([mem.lat, mem.lng]).addTo(map);
    marker.bindPopup(`<strong>${mem.emotion}</strong><br>${mem.journeyName}<br>${new Date(mem.timestamp).toLocaleDateString()}`);
  });
}

let soundLibrary = {};
let soundList = [];
const emotionMap = {
  calm: ["lofi", "wind"],
  anxious: ["waves", "wind"],
  joy: ["birds", "steps"],
  peaceful: ["lofi", "waves"],
  lonely: ["wind"],
  explore: ["steps"]
};

async function loadSounds() {
  const response = await fetch("./sounds.json");
  const data = await response.json();
  soundLibrary = {};
  soundList = data;
  const loopContainer = document.querySelector(".loop-selector");
  loopContainer.innerHTML = "";
  const tagSet = new Set();

  data.forEach(sound => {
    const audio = new Audio(sound.url);
    soundLibrary[sound.id] = audio;
    const label = document.createElement("label");
    label.innerHTML = `
      <input type='checkbox' name='loops' value='${sound.id}'> 🎧 ${sound.name} 
      <input type='range' min='0' max='1' step='0.01' value='1' onchange='adjustVolume("${sound.id}", this.value)' />
      <span class='tags'>(${sound.tags.join(", ")})</span>`;
    label.classList.add("sound-label");
    label.dataset.tags = sound.tags.join(",");
    loopContainer.appendChild(label);
    sound.tags.forEach(tag => tagSet.add(tag));
  });

  const tagContainer = document.getElementById("tag-filters");
  tagContainer.innerHTML = "<strong>Filter by tag:</strong> ";
  tagSet.forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "tag-btn";
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sound-label").forEach(label => {
        const tags = label.dataset.tags;
        label.style.display = tags.includes(tag) ? "block" : "none";
      });
    });
    tagContainer.appendChild(btn);
  });

  const showAllBtn = document.createElement("button");
  showAllBtn.textContent = "Show All";
  showAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".sound-label").forEach(label => {
      label.style.display = "block";
    });
  });
  tagContainer.appendChild(showAllBtn);
}

function playLoops(loops) {
  Object.values(soundLibrary).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  loops.forEach(name => {
    const audio = soundLibrary[name];
    if (audio) {
      audio.loop = true;
      audio.play();
    }
  });
}

function pauseAllLoops() {
  Object.values(soundLibrary).forEach(audio => {
    audio.pause();
  });
}

function adjustVolume(id, volume) {
  const audio = soundLibrary[id];
  if (audio) {
    audio.volume = volume;
  }
}

let map, marker, selectedLatLng;
function initMap() {
  map = L.map('map').setView([40.7128, -74.0060], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  map.on('click', function(e) {
    if (marker) map.removeLayer(marker);
    selectedLatLng = e.latlng;
    marker = L.marker(e.latlng).addTo(map);
  });
  addMapMarkers();
}

document.querySelectorAll(".emotion-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    const emotion = btn.dataset.emotion;
    const suggested = emotionMap[emotion] || [];
    document.querySelectorAll("input[name='loops']").forEach(input => {
      input.checked = suggested.includes(input.value);
    });
  });
});

window.onload = function() {
  renderMapView();
  initMap();
  loadSounds();
};
