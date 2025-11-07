// --- Kingdom Game (Offline) ---

let player = loadGame() || createNewKingdom();
updateUI();
log(`Welcome back, ${player.name}!`);

document.getElementById("buyFishingPost").onclick = () => {
  if (player.gold >= 20) {
    player.gold -= 20;
    player.fishingPosts++;
    log(`You bought a Fishing Post!`);
    saveGame();
  } else {
    log("Not enough gold!");
  }
  updateUI();
};

document.getElementById("attack").onclick = () => {
  log("⚠️ ERROR: Online features unavailable (Firebase not connected)");
};

// --- Utility functions ---

function createNewKingdom() {
  const name = prompt("Name your kingdom:") || "Unnamed Kingdom";
  const newPlayer = {
    name,
    gold: 100,
    fishingPosts: 0,
    code: generateCode(),
  };
  saveGame(newPlayer);
  return newPlayer;
}

function updateUI() {
  document.getElementById("status").innerText =
    `${player.name}\nGold: ${player.gold}\nFishing Posts: ${player.fishingPosts}`;
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
  logDiv.innerText = msg + "\n" + logDiv.innerText;
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
