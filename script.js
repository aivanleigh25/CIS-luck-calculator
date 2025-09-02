// Generate bubbles
const bubblesContainer = document.querySelector('.bubbles');
for (let i = 0; i < 20; i++) {
  const bubble = document.createElement('span');
  bubble.style.width = bubble.style.height = `${Math.random() * 60 + 20}px`;
  bubble.style.left = `${Math.random() * 100}%`;
  bubble.style.animationDuration = `${10 + Math.random() * 10}s`;
  bubble.style.background = `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 255, 0.25)`;
  bubblesContainer.appendChild(bubble);
}

// Luck calculation
document.getElementById("luckForm").addEventListener("submit", function (e) {
  e.preventDefault(); // stop refresh

  const pet = document.getElementById("pet").value;
  const luck = parseFloat(document.getElementById("luck").value);

  let baseOdds = pet === "forest" ? 1000000 : 1333333;
  let newOdds = baseOdds / luck;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `🎲 Your odds: 1 / ${Math.round(newOdds).toLocaleString()}<br>
                         (Base: 1 / ${baseOdds.toLocaleString()}, Luck x${luck})`;
});
