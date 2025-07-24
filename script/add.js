document.addEventListener("DOMContentLoaded", () => {
  const emotionButtons = document.querySelectorAll(".emotion-btn");
  const customInput = document.getElementById("custom-emotion-input");
  const addEmotionBtn = document.getElementById("add-emotion-btn");
  const customEmotionsDiv = document.getElementById("custom-emotions");
  const loopSelector = document.getElementById("loop-selector");
  const noteInput = document.getElementById("note");
  const saveBtn = document.getElementById("save-memory-btn");


  let selectedEmotion = "";
  let selectedSounds = [];
  let selectedCoords = null;

  // Load sound checkboxes from sound.js
  sounds.forEach(sound => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${sound.id}"> ${sound.name}`;
    loopSelector.appendChild(label);
  });
  

  // Emotion buttons
  emotionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedEmotion = btn.dataset.emotion;
      emotionButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Add custom emotion
  addEmotionBtn.addEventListener("click", () => {
    const val = customInput.value.trim();
    if (val) {
      const newBtn = document.createElement("button");
      newBtn.textContent = val;
      newBtn.classList.add("emotion-btn");
      newBtn.dataset.emotion = val;
      newBtn.addEventListener("click", () => {
        selectedEmotion = val;
        document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("selected"));
        newBtn.classList.add("selected");
      });
      customEmotionsDiv.appendChild(newBtn);
      customInput.value = "";
    }
  });

  // Init Leaflet map
  const map = L.map("map-create").setView([37.7749, -122.4194], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors"
  }).addTo(map);

  let marker = null;
  map.on("click", function (e) {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);
    selectedCoords = e.latlng;
  });

  // Save memory
  saveBtn.addEventListener("click", () => {
    selectedSounds = [...loopSelector.querySelectorAll("input:checked")].map(cb => cb.value);
    console.log("Saving memory and redirecting...");


    if (!selectedEmotion || !selectedCoords || selectedSounds.length === 0) {
      alert("Please complete all steps: emotion, sound, location.");
      return;
    }

    const memory = {
      id: Date.now(),
      emotion: selectedEmotion,
      sounds: selectedSounds,
      note: noteInput.value,
      coords: selectedCoords
    };

    const memories = JSON.parse(localStorage.getItem("soundMemories") || "[]");
    memories.push(memory);
    localStorage.setItem("soundMemories", JSON.stringify(memories));

    alert("Memory saved!");
    window.location.href = "./records.html";

  });
});
