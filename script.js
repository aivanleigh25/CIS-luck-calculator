/*****************************************
  Mythic Odds — Main script
  - robust validation
  - percent + 1-in-X formatting
  - Chart.js graph (Odds % vs Luck)
  - pulsing highlight on current luck
  - simulate N hatches (single-run or many)
******************************************/

// ------------ config ------------
const pets = {
  forest: { id: "forest", name: "Forest Guardian", egg: "Forest Egg", base: 1000000, img: "png/forest.png" },
  deck:   { id: "deck",   name: "Deck Master",    egg: "Magic Egg",  base: 1333333, img: "png/deck.png" }
};

const MAX_PLOT = 200; // default plotting range (1..MAX_PLOT), safe perf

// ------------ elements ------------
const petSelect = document.getElementById("petSelect");
const luckInput = document.getElementById("luckInput");
const luckSlider = document.getElementById("luckSlider");
const totalHatchesEl = document.getElementById("totalHatches");
const simBtn = document.getElementById("simBtn");
const simManyBtn = document.getElementById("simManyBtn");
const simCountEl = document.getElementById("simCount");

const playersOddsEl = document.getElementById("playersOdds");
const percentTextEl = document.getElementById("percentText");
const baseTextEl = document.getElementById("baseText");
const luckTextEl = document.getElementById("luckText");

const notifCard = document.getElementById("notifCard");
const notifImg = document.getElementById("notifImg");
const notifPetEl = document.getElementById("notifPet");
const notifTotalEl = document.getElementById("notifTotal");
const notifOddsEl = document.getElementById("notifOdds");
const notifBaseEl = document.getElementById("notifBase");

const petPreviewImg = document.getElementById("petPreviewImg");
const petNameEl = document.getElementById("petName");
const petBaseSmallEl = document.getElementById("petBaseSmall");

const simResultEl = document.getElementById("simResult");

const ctx = document.getElementById("oddsChart").getContext("2d");
let chart = null;

// ------------ helpers ------------
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function fmtOdds(val){
  if (!isFinite(val) || val <= 0) return "—";
  // if val < 1 show "guaranteed"
  if (val < 1) return "1 / 1 (guaranteed)";
  return `1 / ${Math.round(val).toLocaleString()}`;
}
function fmtPercent(prob){
  if (!isFinite(prob) || prob <= 0) return "0.000000%";
  const p = Math.min(1, prob) * 100;
  return `${p.toFixed(6)}%`;
}
function safeNumber(v, fallback=1){
  const n = Number(v);
  return (isFinite(n) && n > 0) ? n : fallback;
}

/** compute final probabilities/odds
 *  base: integer (1,000,000 etc)
 *  luck: decimal multiplier (like 3.42)
 *  returns { baseProb, finalProb, oddsInverse }
 */
function computeOdds(base, luck){
  const baseProb = 1 / base;
  const finalProb = baseProb * luck; // can be >1 for huge luck
  const oddsInverse = finalProb > 0 ? (1 / finalProb) : Infinity;
  return { baseProb, finalProb, oddsInverse };
}

// ------------ UI update ------------
function updateAll(){
  const petKey = petSelect.value;
  const pet = pets[petKey];

  // read luck from numeric input (preferred). validate
  let luckVal = parseFloat(luckInput.value);
  if (!isFinite(luckVal) || luckVal <= 0) luckVal = parseFloat(luckSlider.value) || 1;

  // clamp slider range in case
  luckVal = clamp(luckVal, 0.01, 500);

  // sync slider and input (keep both in sync)
  luckInput.value = Number(luckVal).toFixed(2);
  luckSlider.value = luckVal;

  // total hatches
  const total = Math.max(0, parseInt(totalHatchesEl.value) || 0);

  // compute odds
  const { baseProb, finalProb, oddsInverse } = computeOdds(pet.base, luckVal);

  // update left results
  playersOddsEl.textContent = fmtOdds(oddsInverse);
  percentTextEl.textContent = fmtPercent(finalProb);
  baseTextEl.textContent = `1 / ${pet.base.toLocaleString()}`;
  luckTextEl.textContent = `x${Number(luckVal).toFixed(2)}`;

  // update preview & notif
  petPreviewImg.src = pet.img;
  petNameEl.textContent = pet.name;
  petBaseSmallEl.textContent = `Base 1 / ${pet.base.toLocaleString()}`;

  // notification card (minimal)
  notifImg.src = pet.img;
  notifPetEl.textContent = pet.name;
  notifTotalEl.textContent = `Total Hatched: ${total.toLocaleString()}`;
  notifOddsEl.textContent = fmtOdds(oddsInverse);
  notifBaseEl.textContent = `Base 1 / ${pet.base.toLocaleString()}`;

  // show notif card (fade)
  notifCard.classList.remove("hidden");
  notifCard.classList.remove("fade");
  void notifCard.offsetWidth;
  notifCard.classList.add("fade");

  // update chart
  renderChart(pet, luckVal);
}

// ------------ chart rendering ------------
function renderChart(pet, currentLuck){
  // decide x range: show at least 1..100, but expand if user entered bigger luck (cap to 500)
  const maxX = Math.min(500, Math.max(100, Math.ceil(currentLuck * 1.5)));
  const labels = new Array(maxX).fill(0).map((_, i) => `x${i+1}`);
  const data = new Array(maxX).fill(0).map((_, i) => {
    const luck = i + 1;
    return (1 / pet.base) * luck * 100; // percent
  });

  // highlight point index
  const idx = clamp(Math.round(currentLuck), 1, maxX) - 1;
  const highlightData = new Array(maxX).fill(null);
  highlightData[idx] = data[idx];

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Chance % - ${pet.name}`,
          data,
          borderColor: "#58a6ff",
          backgroundColor: "rgba(88,166,255,0.12)",
          fill: true,
          tension: 0.25,
          pointRadius: 0
        },
        {
          label: "Your Luck",
          data: highlightData,
          showLine: false,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#22c55e",
          pointRadius: 8,
          pointHoverRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.raw === null) return null;
              return `${ctx.dataset.label || ""}: ${ctx.raw.toFixed(6)}%`;
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "Luck Multiplier" }, ticks: { color: "#9aa8b5" } },
        y: {
          title: { display: true, text: "Chance per hatch (%)" },
          ticks: {
            callback: function(v){ return Number(v).toFixed(6) + "%"; },
            color: "#9aa8b5"
          },
          beginAtZero: true
        }
      }
    },
    plugins: [{
      id: 'pulseHighlight',
      afterDatasetsDraw(chartInst) {
        try {
          const meta = chartInst.getDatasetMeta(1);
          const point = meta.data.find(d => d && !isNaN(d.x));
          if (!point) return;
          const ctx2 = chartInst.ctx;
          const x = point.x;
          const y = point.y;
          const t = Date.now() / 400;
          const r = 10 + (Math.sin(t) + 1) * 6;

          ctx2.save();
          ctx2.beginPath();
          ctx2.fillStyle = "rgba(34,197,94,0.18)";
          ctx2.arc(x, y, r, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.restore();
        } catch(e) { /* ignore */ }
      }
    }]
  });

  // keep canvas height friendly
  document.getElementById("oddsChart").style.height = "260px";
}

// ------------ simulate hatch(s) ------------
/** simulate N hatches and return number of successes */
function simulateHatches(probPerHatch, N){
  let successes = 0;
  for (let i=0;i<N;i++){
    if (Math.random() < probPerHatch) successes++;
  }
  return successes;
}

// simulate single (button) => runs one trial and shows result
function trySingle(){
  const pet = pets[petSelect.value];
  const luck = safeNumber(parseFloat(luckInput.value), 1);
  const { finalProb } = computeOdds(pet.base, luck);
  const success = Math.random() < finalProb;

  // increment total hatches by 1
  const t = Math.max(0, parseInt(totalHatchesEl.value) || 0) + 1;
  totalHatchesEl.value = t;
  updateAll();

  // show result message briefly
  simResultEl.classList.remove("hidden");
  simResultEl.innerHTML = success ? `<strong style="color:#22c55e">Success!</strong> You hatched <strong>${pet.name}</strong> 🎉` :
                                     `<strong style="color:#f87171">Nope</strong> — no hatch this time.`;
  // small timeout clear
  setTimeout(()=>{ simResultEl.classList.add("hidden"); }, 3500);
}

// simulate N hatches (bulk) => show successes and increment total
function tryMany(){
  const pet = pets[petSelect.value];
  const luck = safeNumber(parseFloat(luckInput.value), 1);
  const N = Math.max(1, parseInt(simCountEl.value) || 1);
  const { finalProb } = computeOdds(pet.base, luck);

  // do simulation
  const successes = simulateHatches(finalProb, N);
  // increment total hatches
  const prev = Math.max(0, parseInt(totalHatchesEl.value) || 0);
  totalHatchesEl.value = prev + N;

  updateAll();

  simResultEl.classList.remove("hidden");
  simResultEl.innerHTML = `Simulated ${N.toLocaleString()} hatches — <strong>${successes}</strong> success(es). (approx ${ (successes/N*100).toFixed(4) }%)`;
  setTimeout(()=>{ simResultEl.classList.add("hidden"); }, 5000);
}

// ------------ events wiring ------------
function wire(){
  // input sync
  petSelect.addEventListener("change", updateAll);

  luckInput.addEventListener("input", (e)=>{
    let v = Number(e.target.value);
    if (!isFinite(v) || v <= 0) return;
    v = clamp(v, 0.01, 500);
    luckSlider.value = v;
    updateAll();
  });

  luckSlider.addEventListener("input", (e)=>{
    const v = Number(e.target.value);
    luckInput.value = Number(v).toFixed(2);
    updateAll();
  });

  totalHatchesEl.addEventListener("input", updateAll);
  simBtn.addEventListener("click", trySingle);
  simManyBtn.addEventListener("click", tryMany);

  // init
  updateAll();
}

// start
wire();
