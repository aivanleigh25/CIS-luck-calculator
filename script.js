// Just shorten ts cuz it pmo
const bubblesContainer = document.querySelector('.bubbles');
for (let i = 0; i < 20; i++) {
  const bubble = document.createElement('span');
  bubble.style.width = bubble.style.height = `${Math.random() * 60 + 20}px`;
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.animationDuration = `${10 + Math.random() * 10}s`;
  bubblesContainer.appendChild(bubble);
}

// Pet images
const petImages = {
  forest: "png/forest.png",
  deck: "png/deck.png"
};

// Luck calculation
document.getElementById("luckForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const pet = document.getElementById("pet").value;
  const luck = parseFloat(document.getElementById("luck").value);

  let baseOdds = pet === "forest" ? 1000000 : 1333333;
  let newOdds = baseOdds / luck;

  const cleanOdds = Math.round(newOdds).toLocaleString();

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    1 / ${cleanOdds}<br>
    <img src="${petImages[pet]}" alt="${pet}" class="pet-img">
  `;
});
