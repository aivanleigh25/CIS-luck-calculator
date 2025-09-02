const pets = {
  forest: {
    name: "Forest Guardian",
    base: 1000000,
    img: "png/forest.png"
  },
  deck: {
    name: "Deck Master",
    base: 1333333,
    img: "png/deck.png"
  }
};

let chart;
let currentLuck = 1;

function updatePet() {
  const petKey = document.getElementById("petSelect").value;
  const pet = pets[petKey];
  document.getElementById("petImg").src = pet.img;

  // reset fade-in animation
  const img = document.getElementById("petImg");
  img.classList.remove("fade-in");
  void img.offsetWidth;
  img.classList.add("fade-in");

  calculateOdds();
}

function updateLuck(value) {
  currentLuck = parseFloat(value);
  document.getElementById("luckValue").innerText = "x" + currentLuck.toFixed(2);
  calculateOdds();
}

function calculateOdds() {
  const petKey = document.getElementById("petSelect").value;
  const pet = pets[petKey];

  const baseChance = 1 / pet.base;
  const finalChance = baseChance * currentLuck;
  const odds = 1 / finalChance;
  const percent = (finalChance * 100).toFixed(6);

  document.getElementById("oddsText").innerText =
    `🎲 With x${currentLuck.toFixed(2)} luck, odds for ${pet.name} ≈ 1 / ${Math.round(odds).toLocaleString()}`;
  document.getElementById("percentText").innerText =
    `📊 About ${percent}% per hatch`;

  updateChart(pet);
}

function updateChart(pet) {
  const labels = [];
  const data = [];

  for (let x = 1; x <= 100; x++) {
    const chance = (1 / pet.base) * x * 100;
    labels.push("x" + x);
    data.push(chance);
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById("oddsChart").getContext("2d");

  const lineDataset = {
    label: `Hatch Chance % for ${pet.name}`,
    data: data,
    borderColor: "#38bdf8",
    backgroundColor: "rgba(56,189,248,0.2)",
    tension: 0.3,
    pointRadius: 0
  };

  const highlightData = Array(100).fill(null);
  highlightData[Math.round(currentLuck) - 1] =
    (1 / pet.base) * Math.round(currentLuck) * 100;

  const highlightDataset = {
    label: "Your Luck",
    data: highlightData,
    borderColor: "transparent",
    backgroundColor: "#22c55e",
    pointRadius: 10,
    pointHoverRadius: 14,
    pointStyle: "circle"
  };

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [lineDataset, highlightDataset]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          title: { display: true, text: "Chance per hatch (%)" },
          beginAtZero: true
        },
        x: {
          title: { display: true, text: "Luck Multiplier" }
        }
      }
    },
    plugins: [{
      id: "pulseEffect",
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(1);
        const point = meta.data.find(d => d && !isNaN(d.x));
        if (point) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(point.x, point.y, 15 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34,197,94,0.3)";
          ctx.fill();
          ctx.restore();
        }
      }
    }]
  });
}

// init
updatePet();
