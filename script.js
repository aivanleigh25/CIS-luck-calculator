const pets = {
  forest: {
    name: "Forest Guardian",
    base: 1000000,
    img: "forest.png"
  },
  deck: {
    name: "Deck Master",
    base: 1333333,
    img: "deck.png"
  }
};

function calculateOdds() {
  const petKey = document.getElementById("petSelect").value;
  const luck = parseFloat(document.getElementById("luckInput").value);

  if (!luck || luck <= 0) {
    document.getElementById("oddsText").innerText = "⚠️ Enter a valid luck multiplier!";
    document.getElementById("percentText").innerText = "";
    return;
  }

  const pet = pets[petKey];
  const baseChance = 1 / pet.base;
  const finalChance = baseChance * luck;
  const odds = 1 / finalChance;
  const percent = (finalChance * 100).toFixed(6);

  // Update text
  document.getElementById("oddsText").innerText = 
    `🎲 With x${luck} luck, your odds for ${pet.name} are ~1 / ${Math.round(odds).toLocaleString()}`;
  document.getElementById("percentText").innerText = 
    `📊 That's about ${percent}% per hatch!`;

  // Update image
  document.getElementById("petImg").src = pet.img;
}
