function scrollToCreate() {
  document.getElementById("create").scrollIntoView({ behavior: "smooth" });
}

function saveMemory() {
  const emotion = document.querySelector(".emotion-btn.selected")?.dataset.emotion || "undefined";
  const loops = Array.from(document.querySelectorAll("input[name='loops']:checked")).map(l => l.value);
  const note = document.getElementById("note").value;
  const timestamp = new Date().toISOString();
  const lat = selectedLatLng?.lat || 0;
  const lng = selectedLatLng?.lng || 0;

  const memory = {
    emotion,
    loops,
    note,
    timestamp,
    lat,
    lng
  };

  const existing = JSON.parse(localStorage.getItem("soundmap") || "[]");
  existing.push(memory);
  localStorage.setItem("soundmap", JSON.stringify(existing));
  alert("Memory saved 🎵");
  renderMapView();
  addMapMarkers();
}

function renderMapView() {
  const container = document.getElementById("soundmap-view");
  const memories = JSON.parse(localStorage.getItem("soundmap") || "[]");
  container.innerHTML = "";
  memories.forEach(mem => {
    const div = document.createElement("div");
    div.className = "memory-card";
    div.innerHTML = `
      <strong>${mem.emotion}</strong><br>
      Loops: ${mem.loops.join(", ")}<br>
      <em>${new Date(mem.timestamp).toLocaleString()}</em><br>
      <p>${mem.note}</p>
      <button onclick='playLoops(${JSON.stringify(mem.loops)})'>Play</button>
    `;
    container.appendChild(div);
  });
}

function addMapMarkers() {
  const memories = JSON.parse(localStorage.getItem("soundmap") || "[]");
  memories.forEach(mem => {
    const marker = L.marker([mem.lat, mem.lng]).addTo(map);
    marker.bindPopup(`<strong>${mem.emotion}</strong><br>${new Date(mem.timestamp).toLocaleDateString()}`);
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
  data.forEach(sound => {
    const audio = new Audio(sound.url);
    soundLibrary[sound.id] = audio;
    const label = document.createElement("label");
    label.innerHTML = `<input type='checkbox' name='loops' value='${sound.id}'> 🎧 ${sound.name} <span class='tags'>(${sound.tags.join(", ")})</span>`;
    label.classList.add("sound-label");
    loopContainer.appendChild(label);
  });
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
