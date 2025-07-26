let customEmotions = new Set();

function renderEmotionChart() {
  const memories = JSON.parse(localStorage.getItem("soundmap") || "[]");
  const ctx = document.getElementById("emotionChart").getContext("2d");
  const grouped = {};
  memories.forEach(m => {
    const day = new Date(m.timestamp).toLocaleDateString();
    grouped[day] = grouped[day] || {};
    grouped[day][m.emotion] = (grouped[day][m.emotion] || 0) + 1;
  });
  const labels = Object.keys(grouped);
  const emotions = [...new Set(memories.map(m => m.emotion))];
  const datasets = emotions.map(emotion => ({
    label: emotion,
    data: labels.map(date => grouped[date][emotion] || 0),
    fill: false,
    borderColor: getRandomColor(),
    tension: 0.1
  }));
  new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: { responsive: true }
  });
}

function addCustomEmotion(emotion) {
  if (!emotion || customEmotions.has(emotion)) return;
  customEmotions.add(emotion);
  const container = document.getElementById("custom-emotions");
  const btn = document.createElement("button");
  btn.textContent = emotion;
  btn.className = "emotion-btn";
  btn.dataset.emotion = emotion;
  btn.addEventListener("click", () => {
    document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
  container.appendChild(btn);
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderMapView === "function") renderMapView();
  if (typeof initMap === "function") initMap();
  if (typeof loadSounds === "function") loadSounds();
  renderEmotionChart();

  document.getElementById("add-emotion-btn").addEventListener("click", () => {
    const input = document.getElementById("custom-emotion-input");
    addCustomEmotion(input.value.trim());
    input.value = "";
  });
});
