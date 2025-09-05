// Im tired of ts pls help 
// Bubble animation with varied timing
const bubblesContainer = document.querySelector('.bubbles');
for (let i = 0; i < 30; i++) { // Increased to 30 for more effect
  const bubble = document.createElement('span');
  bubble.style.width = bubble.style.height = `${Math.random() * 80 + 20}px`;
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.animationDuration = `${8 + Math.random() * 12}s`; // Varied duration
  bubble.style.animationDelay = `${Math.random() * 5}s`;
  bubblesContainer.appendChild(bubble);
}

// Pet images
const petImages = {
  forest: "png/forest.png",
  deck: "png/deck.png"
};

// Luck calculation with loading state
document.getElementById("luckForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const pet = document.getElementById("pet").value;
  const luck = parseFloat(document.getElementById("luck").value);
  const spinner = document.getElementById("spinner");
  const resultDiv = document.getElementById("result");

  if (isNaN(luck) || luck < 1) {
    resultDiv.innerHTML = "<span style='color: #ff6b6b'>Please enter a valid luck multiplier (≥ 1)</span>";
    return;
  }

  spinner.style.display = "inline-block";
  resultDiv.innerHTML = "";

  setTimeout(() => {
    let baseOdds = pet === "forest" ? 1000000 : 1333333;
    let newOdds = baseOdds / luck;

    const cleanOdds = Math.round(newOdds).toLocaleString();

    resultDiv.innerHTML = `
      1 / ${cleanOdds}<br>
      <img src="${petImages[pet]}" alt="${pet}" class="pet-img">
    `;
    spinner.style.display = "none";
  }, 500); // Simulate calculation delay for spinner effect
});
