document.addEventListener("DOMContentLoaded", () => {
  const memoryList = document.getElementById("memory-list");
  const records = JSON.parse(localStorage.getItem("soundMemories") || "[]");

  records.forEach(mem => {
    const card = document.createElement("div");
    card.classList.add("record-card");

    card.innerHTML = `
      <h3>${mem.emotion}</h3>
      <p><strong>Loops:</strong> ${mem.sounds.join(", ")}</p>
      <p><strong>Note:</strong> ${mem.note}</p>
      <p><em>${new Date(mem.id).toLocaleString()}</em></p>
    `;

    memoryList.appendChild(card);
  });

  const map = L.map("record-map").setView([37.7749, -122.4194], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  records.forEach(mem => {
    if (mem.coords) {
      const marker = L.marker([mem.coords.lat, mem.coords.lng]).addTo(map);
      marker.bindPopup(`
        <strong>${mem.emotion}</strong><br>
        ${mem.note}<br>
        ${new Date(mem.id).toLocaleDateString()}
      `);
    }
  });
});
