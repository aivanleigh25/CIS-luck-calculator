document.getElementById("calcForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const baseOdds = parseFloat(document.getElementById("petSelect").value);
  const luck = parseFloat(document.getElementById("luckInput").value);

  if (!luck || luck <= 0) {
    alert("Please enter a valid luck multiplier.");
    return;
  }

  const newOdds = baseOdds / luck;
  const percentChance = (1 / newOdds) * 100;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <p><strong>Your Luck:</strong> x${luck.toFixed(2)}</p>
    <p><strong>Base Odds:</strong> 1 / ${baseOdds.toLocaleString()}</p>
    <p><strong>Your Odds:</strong> 1 / ${Math.round(newOdds).toLocaleString()}</p>
    <p style="color:#00ffc6; text-shadow:0 0 8px #00ffc6;">
      ≈ ${percentChance.toExponential(2)}%
    </p>
  `;
  resultDiv.classList.remove("hidden");
});
