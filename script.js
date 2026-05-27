const attributes = [
  "Ataque",
  "Defensa",
  "Velocidad",
  "Creatividad",
  "Dominio",
  "Pase",
  "Disparo al arco",
];

const storageKey = "football-simulator-players";
const form = document.querySelector("#playerForm");
const attributeControls = document.querySelector("#attributeControls");
const template = document.querySelector("#playerCardTemplate");
const clearAllButton = document.querySelector("#clearAllButton");

let players = loadPlayers();

function loadPlayers() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function savePlayers() {
  localStorage.setItem(storageKey, JSON.stringify(players));
}

function makeAttributeControls() {
  attributeControls.innerHTML = "";

  attributes.forEach((attribute) => {
    const label = document.createElement("label");
    label.textContent = attribute;

    const row = document.createElement("div");
    row.className = "range-row";

    const range = document.createElement("input");
    range.type = "range";
    range.name = attribute;
    range.min = "1";
    range.max = "10";
    range.value = "5";

    const value = document.createElement("span");
    value.className = "range-value";
    value.textContent = range.value;

    range.addEventListener("input", () => {
      value.textContent = range.value;
    });

    row.append(range, value);
    label.append(row);
    attributeControls.append(label);
  });
}

function getPlayerTotal(player) {
  return attributes.reduce((sum, attribute) => sum + player.attributes[attribute], 0);
}

function getTeamPlayers(team) {
  return players.filter((player) => player.team === team);
}

function getTeamTotal(team) {
  return getTeamPlayers(team).reduce((sum, player) => sum + getPlayerTotal(player), 0);
}

function getDifferenceClass(difference) {
  if (difference <= 5) return "good";
  if (difference <= 15) return "warning";
  return "danger";
}

function starString(value) {
  return "★".repeat(value) + "☆".repeat(10 - value);
}

function renderPlayer(player) {
  const card = template.content.firstElementChild.cloneNode(true);
  const total = getPlayerTotal(player);

  card.querySelector("h3").textContent = player.name;
  card.querySelector("p").textContent = `${total} puntos`;
  card.querySelector(".delete-player").addEventListener("click", () => {
    players = players.filter((item) => item.id !== player.id);
    savePlayers();
    render();
  });

  const list = card.querySelector(".attribute-list");
  attributes.forEach((attribute) => {
    const row = document.createElement("div");
    row.className = "attribute-row";

    const term = document.createElement("dt");
    term.textContent = attribute;

    const stars = document.createElement("dd");
    stars.className = "stars";
    stars.textContent = starString(player.attributes[attribute]);
    stars.setAttribute("aria-label", `${player.attributes[attribute]} de 10 estrellas`);

    const number = document.createElement("dd");
    number.className = "number";
    number.textContent = player.attributes[attribute];

    row.append(term, stars, number);
    list.append(row);
  });

  return card;
}

function renderTeam(team, containerId, countId) {
  const container = document.querySelector(containerId);
  const count = document.querySelector(countId);
  const teamPlayers = getTeamPlayers(team);

  container.innerHTML = "";
  teamPlayers.forEach((player) => container.append(renderPlayer(player)));
  count.textContent = `${teamPlayers.length} ${teamPlayers.length === 1 ? "jugador" : "jugadores"}`;
}

function renderScores() {
  const teamATotal = getTeamTotal("A");
  const teamBTotal = getTeamTotal("B");
  const difference = Math.abs(teamATotal - teamBTotal);
  const differenceElement = document.querySelector("#differenceScore");

  document.querySelector("#teamATotal").textContent = teamATotal;
  document.querySelector("#teamBTotal").textContent = teamBTotal;
  differenceElement.textContent = difference;
  differenceElement.className = `diff ${getDifferenceClass(difference)}`;
}

function render() {
  renderTeam("A", "#teamAPlayers", "#teamACount");
  renderTeam("B", "#teamBPlayers", "#teamBCount");
  renderScores();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("playerName").trim();
  const playerAttributes = {};

  if (!name) {
    document.querySelector("#playerName").focus();
    return;
  }

  attributes.forEach((attribute) => {
    playerAttributes[attribute] = Number(data.get(attribute));
  });

  players.push({
    id: crypto.randomUUID(),
    name,
    team: data.get("playerTeam"),
    attributes: playerAttributes,
  });

  savePlayers();
  form.reset();
  makeAttributeControls();
  document.querySelector("#playerName").focus();
  render();
});

clearAllButton.addEventListener("click", () => {
  const confirmed = confirm("¿Quieres borrar todos los jugadores cargados?");
  if (!confirmed) return;

  players = [];
  savePlayers();
  render();
});

makeAttributeControls();
render();
