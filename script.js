// ---------- config ----------
const pets = {
  forest: {
    id: "forest",
    name: "Forest Guardian",
    egg: "Forest Egg",
    base: 1000000,
    img: "png/forest.png",
    evo: "Normal"
  },
  deck: {
    id: "deck",
    name: "Deck Master",
    egg: "Magic Egg",
    base: 1333333,
    img: "png/deck.png",
    evo: "Normal"
  }
};

// ---------- elements ----------
const petSelect = document.getElementById("petSelect");
const luckSlider = document.getElementById("luckSlider");
const luckInput = document.getElementById("luckInput");
const totalHatchesEl = document.getElementById("totalHatches");

const petImg = document.getElementById("petImg");
const petName = document.getElementById("petName");
const petBaseSmall = document.getElementById("petBaseSmall");

const playersOdds = document.getElementById("playersOdds");
const percentText = document.getElementById("percentText");
const baseText = document.getElementById("baseText");
const luckText = document.getElementById("luckText");

const notif = document.getElementById("notif");
const notifEgg = document.getElementById("notifEgg");
const notifPlayer = document.getElementById("notifPlayer");
const notifEggName = document.getElementById("notifEggName");
const notifPetName = document.getElementById("notifPetName");
const notifEvo = document.getElementById("notifEvo");
const notifTotal = document.getElementById("notifTotal");
const notifChance = document.getElementById("notifChance");
const notifBase = document.getElementById("notifBase");

// ---------- chart ----------
let chart = null;

// ---------- helpers ----------
function getCurrentPet() {
  return pets[petSelect.value];
}

function formatOdds(num) {
  if (!isFinite(num) || num <= 0) return "—";
  // round to nearest integer
  return Math.round(num).toLocaleString();
}

function toPercent(prob) {
  return (prob * 100).toFixed(6) + "%";
}

// ---------- math ----------
function computeOdds(base, luck) {
  const baseProb = 1 / base;           // decimal prob per hatch
  const finalProb = baseProb * luck;   // adjusted
  const oddsInverse = 1 / finalProb;   // 1 in X
  return { baseProb, finalProb, oddsInverse };
}

// ---------- UI updates ----------
function updateAll() {
  const pet = getCurrentPet();
  const luck = parseFloat(luckInput.value) || parseFloat(luckSlider.value) || 1;
  const total = parseInt(totalHatchesEl.value) || 0;

  // update small UI
  petImg.src = pet.img;
  petName.textContent = pet.name;
  petBaseSmall.textContent = `Base 1 / ${pet.base.toLocaleString()}`;

  // compute
  const { baseProb, finalProb, oddsInverse } = computeOdds(pet.base, luck);

  playersOdds.textContent = `1 / ${formatOdds(oddsInverse)}`;
  percentText.textContent = toPercent(finalProb);
  baseText.textContent = `1 / ${pet.base.toLocaleString()}`;
  luckText.textContent = `x${Number(luck).toFixed(2)}`;

  // update notif (emulate Discord style)
  notifEgg.src = pet.img;
  notifPlayer.textContent = "Player";
  notifEggName.textContent = pet.egg;
  notifPetName.textContent = pet.name;
  notifEvo.textContent = pet.evo;

  notifTotal.textContent = total.toLocaleString();
  notifChance.textContent = `1 / ${formatOdds(oddsInverse)}`;
  notifBase.textContent = `1 / ${pet.base.toLocaleString()}`;

  // animate notif so it looks fresh
  notif.classList.remove("hide");
  void notif.offsetWidth; // force reflow
  notif.classList.add("fade");

  // update chart
  renderChart(pet, luck);
}

// ---------- events ----------
function onPetChange(){
  // sync visuals & calc
  updateAll();
}

function onSliderInput(val){
  luckInput.value = Number(val).toFixed(2);
  updateAll();
}

function onNumberInput(val){
  const v = Number(val);
  if (!isFinite(v) || v <= 0) return;
  // clamp slider range
  const clamped = Math.max(1, Math.min(500, v));
  luckSlider.value = clamped;
  luckInput.value = Number(clamped).toFixed(2);
  updateAll();
}

// ---------- chart rendering with highlight + pulse ----------
function renderChart(pet, currentLuck) {
  const maxX = 100; // show 1..100 on chart for clarity
  const labels = [];
  const data = [];
  for (let x = 1; x <= maxX; x++){
    labels.push("x" + x);
    data.push((1 / pet.base) * x * 100);
  }

  // highlight point index (nearest integer, clamped)
  const idx = Math.max(1, Math.min(maxX, Math.round(currentLuck)));

  const highlightData = Array(maxX).fill(null);
  highlightData[idx - 1] = data[idx - 1];

  if (chart) chart.destroy();

  const ctx = document.getElementById("oddsChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Hatch Chance % - ${pet.name}`,
          data,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56,189,248,0.12)",
          fill: true,
          tension: 0.25,
          pointRadius: 0
        },
        {
          label: "Your Luck",
          data: highlightData,
          showLine: false,
          pointBackgroundColor: "#22c55e",
          pointRadius: 8,
          pointHoverRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins:{
        legend:{display:false},
        tooltip:{
          callbacks:{
            label(ctx){
              if (ctx.raw === null) return null;
              return ` ${ctx.dataset.label || ''}: ${ctx.raw.toFixed(6)}%`;
            }
          }
        }
      },
      scales:{
        x:{ display:true, title:{display:true,text:"Luck Multiplier"} },
        y:{
          display:true,
          title:{display:true,text:"Chance per hatch (%)"},
          ticks:{
            callback: function(value){ return value.toFixed(6) + "%"; }
          }
        }
      }
    },
    plugins: [{
      id: "pulse-plugin",
      afterDatasetsDraw(chartInst){ // draw pulsing halo for highlight
        const datasetIndex = 1;
        const meta = chartInst.getDatasetMeta(datasetIndex);
        const points = meta.data;
        if (!points || !points.length) return;
        const point = points.find(p => p && !isNaN(p.x));
        if (!point) return;

        const ctx2 = chartInst.ctx;
        const x = point.x;
        const y = point.y;
        // pulsing radius based on time
        const t = Date.now() / 500;
        const r = 10 + (Math.sin(t) + 1.0) * 6;

        ctx2.save();
        ctx2.beginPath();
        ctx2.fillStyle = "rgba(34,197,94,0.18)";
        ctx2.arc(x, y, r, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
    }]
  });

  // ensure canvas height is friendly
  document.getElementById("oddsChart").style.height = "260px";
}

// ---------- init ----------
(function init(){
  // default values already in HTML
  // wire events
  petSelect.addEventListener("change", onPetChange);
  luckSlider.addEventListener("input", (e)=> onSliderInput(e.target.value));
  luckInput.addEventListener("input", (e)=> onNumberInput(e.target.value));
  totalHatchesEl.addEventListener("input", updateAll);

  updateAll();
})();
