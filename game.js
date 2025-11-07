// Kingdoms Offline - robust version

// Wrap everything so we bind after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements helper
  const $ = id => document.getElementById(id);

  // Load/fix or create
  let player = fixSave(loadGame()) || createNewKingdom();
  updateUI();
  log(`Welcome, ${player.name}! Your kingdom stands ready.`);

  // Safe element binder
  function bind(id, fn) {
    const el = $(id);
    if (!el) {
      console.warn(`Missing element #${id} — check index.html`);
      return;
    }
    el.addEventListener('click', fn);
  }

  // Bind buttons
  bind('nextDay', nextDay);
  bind('buyFarm', () => buyBuilding('farm'));
  bind('sellFarm', () => sellBuilding('farm'));
  bind('buyFishingPost', () => buyBuilding('fishingPost'));
  bind('sellFishingPost', () => sellBuilding('fishingPost'));
  bind('buyBarracks', () => buyBuilding('barracks'));
  bind('buyShipyard', () => buyBuilding('shipyard'));

  bind('trainInfantry', () => trainUnit('infantry', 1));
  bind('trainInfantry10', () => trainUnit('infantry', 10));
  bind('trainInfantry100', () => trainUnit('infantry', 100));
  bind('trainNavy', () => trainUnit('navy', 1));
  bind('trainNavy10', () => trainUnit('navy', 10));
  bind('trainNavy100', () => trainUnit('navy', 100));

  bind('attack', () => log('⚠️ ERROR: Online features unavailable (Firebase not connected)'));

  // Reset handler: confirm -> remove localStorage -> create new kingdom -> notify user
  bind('resetKingdom', () => {
    if (!confirm('Are you SURE you want to reset your kingdom? This will delete your local save.')) return;
    try {
      localStorage.removeItem('kingdomSave');
      player = createNewKingdom();
      saveGame();
      updateUI();
      // visible confirmation so you know it ran
      alert('Kingdom has been reset and a brand new kingdom was created.');
      log('Kingdom reset and new kingdom created.');
    } catch (err) {
      console.error('Reset failed', err);
      alert('Reset failed — check console for details.');
    }
  });

  // ----- Game logic below -----

  function createNewKingdom() {
    const name = prompt('Name your kingdom:') || 'Unnamed Kingdom';
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
    if (player.gold < costs[type]) return log('Not enough gold!');
    player.gold -= costs[type];
    player[type] = (player[type] || 0) + 1;
    log(`Built 1 ${type}.`);
    saveGame();
    updateUI();
  }

  function sellBuilding(type) {
    if (!player[type] || player[type] <= 0) return log(`You have no ${type}s to sell.`);
    const sellValue = { farm: 50, fishingPost: 50, barracks: 50, shipyard: 75 };
    player.gold += sellValue[type];
    player[type]--;
    log(`Sold 1 ${type} for ${sellValue[type]} gold.`);
    saveGame();
    updateUI();
  }

  function trainUnit(type, count) {
    const requires = { infantry: 'barracks', navy: 'shipyard' };
    if ((player[requires[type]] || 0) <= 0) return log(`You need a ${requires[type]} first!`);

    const cost = 2 * count;
    if (player.gold < cost) return log('Not enough gold!');
    if (player.population < count) return log('Not enough population!');

    player.gold -= cost;
    player.population -= count;
    player[type] = (player[type] || 0) + count;
    log(`Trained ${count} ${type} unit(s).`);
    saveGame();
    updateUI();
  }

  function nextDay() {
    player.day = (player.day || 1) + 1;

    // population gain from farms & fishing posts
    const popGain = 25 * ((player.farm || 0) + (player.fishingPost || 0));
    player.population = (player.population || 0) + popGain;

    // gold income & upkeep
    let income = player.population || 0;
    const upkeep = 10 * (((player.farm || 0) + (player.fishingPost || 0) + (player.barracks || 0) + (player.shipyard || 0)));
    income -= upkeep;
    player.gold = (player.gold || 0) + Math.max(income, 0);

    log(`Day ${player.day} summary:\n+${popGain} population\n+${income > 0 ? income : 0} gold income\n-${upkeep} upkeep`);
    saveGame();
    updateUI();
  }

  function updateUI() {
    const s = `
${player.name}
Day: ${player.day || 1}
Gold: ${player.gold || 0}
Population: ${player.population || 0}
Farms: ${player.farm || 0}
Fishing Posts: ${player.fishingPost || 0}
Barracks: ${player.barracks || 0}
Shipyards: ${player.shipyard || 0}
Infantry: ${player.infantry || 0}
Navy: ${player.navy || 0}
Code: ${player.code || '—'}
`;
    const statusEl = $('status');
    if (statusEl) statusEl.innerText = s;
  }

  function saveGame(data = player) {
    try {
      localStorage.setItem('kingdomSave', JSON.stringify(data));
    } catch (err) {
      console.error('Save failed', err);
      alert('Save failed — localStorage may be full or disabled.');
    }
  }

  function loadGame() {
    try {
      const data = localStorage.getItem('kingdomSave');
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Load failed', err);
      return null;
    }
  }

  // fix missing keys from older saves
  function fixSave(data) {
    if (!data) return null;
    const defaults = {
      name: 'Unnamed Kingdom',
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
    return Object.assign({}, defaults, data);
  }

  function log(msg) {
    const logDiv = $('log');
    if (!logDiv) return console.log(msg);
    logDiv.innerText = `${new Date().toLocaleTimeString()} — ${msg}\n\n` + logDiv.innerText;
  }

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});
