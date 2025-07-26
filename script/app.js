let selectedLatLng = null;

function scrollToCreate() {
  document.getElementById("create").scrollIntoView({ behavior: "smooth" });
}

function saveMemory() {
  const emotion = document.querySelector(".emotion-btn.selected")?.dataset.emotion;
  const note = document.getElementById("note").value;
  const loops = Array.from(document.querySelectorAll(".loop-selector input:checked")).map(i => i.value);

  if (!emotion || !selectedLatLng || loops.length === 0) {
    alert("Please select emotion, sound, and location.");
    return;
  }

  const memory = {
    id: Date.now(),
    emotion,
    loops,
    note,
    timestamp: new Date().toISOString(),
    lat: selectedLatLng.lat,
    lng: selectedLatLng.lng
  };

  const stored = JSON.parse(localStorage.getItem("soundmap") || "[]");
  stored.push(memory);
  localStorage.setItem("soundmap", JSON.stringify(stored));
  alert("Saved!");
}

window.onload = function () {
  loadSounds();

  const map = L.map("map").setView([40.7128, -74.0060], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on("click", function (e) {
    if (window.mapMarker) map.removeLayer(window.mapMarker);
    window.mapMarker = L.marker(e.latlng).addTo(map);
    selectedLatLng = e.latlng;
  });

  // Emotion button selection
  document.querySelectorAll(".emotion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
};
