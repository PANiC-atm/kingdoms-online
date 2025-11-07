// --- Kingdoms Offline Game Logic ---

let player = loadGame() || createNewKingdom();
updateUI();
log(`Welcome, ${player.name}! Your kingdom stands ready.`);

// --- BUTTON EVENTS ---

document.getElementById("nextDay").onclick = nextDay;

document.getElementById("buyFarm").onclick = () => buyBuilding("farm");
document.getElementById("sellFarm").onclick = () => sellBuilding("farm");

document.getElementById("buyFishingPost").onclick = () => buyBuilding("fishingPost");
document.getElementById("sellFishingPost").onclick = () => sellBuilding("fishingPost");

document.getElementById("buyBarracks").onclick = () => buyBuilding("barracks");
document.getElementById("buyShipyard").onclick = () => buyBuilding("shipyard");

document.getElementById("trainInfantry").onclick = () => trainUnit("infantry", 1);
document.getElementById("trainInfantry10").onclick = () => trainUnit("infantry", 10);
document.getElementById("trainInfantry100").onclick = () => trainUnit("infantry", 100);

document.getElementById("trainNavy").onclick = () => trainUnit("navy", 1);
document.getElementById("trainNavy10").onclick = () => trainUnit("navy", 10);
document.getElementById("trainNavy100").onclick = () => trainUnit("navy", 100);

document.getElementById("attack").onclick = () =>
  log("⚠️ ERROR: Online features unavailable (Firebase not connected)");

// --- FUNCTIONS ---

function createNewKingdom() {
  const name = prompt("Name your kingdom:") || "Unnamed Kingdom";
  const newPlayer = {
    name,
    gold: 250,
    population: 200,
    farm: 0,
    fishingPost: 0,
    barracks: 0,
    shipyard: 0,
    infantry: 0,
    navy: 0,
    code: generateCode(),
    day: 1,
  };
  saveGame(newPlayer);
  return newPlayer;
}

function buyBuilding(type) {
  const costs = { farm: 100, fishingPost: 100, barracks: 100, shipyard: 150 };
  if (player.gold < costs[type]) return log("Not enough gold!");

  player.gold -= costs[type];
  player[type]++;
  log(`Built 1 ${type}.`);
  saveGame();
  updateUI();
}

function sellBuilding(type) {
  if (player[type] <= 0) return log(`You have no ${type}s to sell.`);
  const sellValue = { farm: 50, fishingPost: 50, barracks: 50, shipyard: 75 };
  player.gold += sellValue[type];
  player[type]--;
  log(`Sold 1 ${type} for ${sellValue[type]} gold.`);
  saveGame();
  updateUI();
}

function trainUnit(type, count) {
  const requires = { infantry: "barracks", navy: "shipyard" };
  if (player[requires[type]] <= 0)
    return log(`You need a ${requires[type]} first!`);

  const cost = 2 * count;
  if (player.gold < cost) return log("Not enough gold!");
  if (player.population < count) return log("Not enough population!");

  player.gold -= cost;
  player.population -= count;
  player[type] += count;
  log(`Trained ${count} ${type} unit(s).`);
  saveGame();
  updateUI();
}

function nextDay() {
  player.day++;

  // population gain from farms & fishing posts
  const popGain = 25 * (player.farm + player.fishingPost);
  player.population += popGain;

  // gold income & upkeep
  let income = player.population;
  const upkeep =
    10 *
    (player.farm +
      player.fishingPost +
      player.barracks +
      player.shipyard);
  income -= upkeep;
  player.gold += Math.max(income, 0);

  log(`Day ${player.day} summary:
+${popGain} population
+${income > 0 ? income : 0} gold income
-${upkeep} upkeep`);

  saveGame();
  updateUI();
}

function updateUI() {
  document.getElementById("status").innerText = `
${player.name}
Day: ${player.day}
Gold: ${player.gold}
Population: ${player.population}
Farms: ${player.farm}
Fishing Posts: ${player.fishingPost}
Barracks: ${player.barracks}
Shipyards: ${player.shipyard}
Infantry: ${player.infantry}
Navy: ${player.navy}
Code: ${player.code}
`;
}

function saveGame(data = player) {
  localStorage.setItem("kingdomSave", JSON.stringify(data));
}

function loadGame() {
  const data = localStorage.getItem("kingdomSave");
  return data ? JSON.parse(data) : null;
}

function log(msg) {
  const logDiv = document.getElementById("log");
  logDiv.innerText = msg + "\n\n" + logDiv.innerText;
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
