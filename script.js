const attributes = [
  "Ataque",
  "Defensa",
  "Velocidad",
  "Físico",
  "Dominio",
  "Pase",
  "Disparo al arco",
];

const roster = [
  {
    id: "xuxo",
    name: "Xuxo",
    attributes: {
      Ataque: 2,
      Defensa: 4,
      Velocidad: 5,
      Físico: 8,
      Dominio: 2,
      Pase: 2,
      "Disparo al arco": 1,
    },
  },
  {
    id: "jaime",
    name: 'Jaime "el corrector" Gutierrez',
    attributes: {
      Ataque: 6,
      Defensa: 4,
      Velocidad: 4,
      Físico: 2,
      Dominio: 4,
      Pase: 6,
      "Disparo al arco": 6,
    },
  },
  {
    id: "rafa-el",
    name: "Rafa él",
    attributes: {
      Ataque: 7,
      Defensa: 7,
      Velocidad: 4,
      Físico: 5,
      Dominio: 6,
      Pase: 6,
      "Disparo al arco": 8,
    },
  },
  {
    id: "pastu",
    name: "Pastu",
    attributes: {
      Ataque: 7,
      Defensa: 3,
      Velocidad: 5,
      Físico: 7,
      Dominio: 4,
      Pase: 6,
      "Disparo al arco": 7,
    },
  },
  {
    id: "pastu-jr",
    name: "Pastu Jr",
    attributes: {
      Ataque: 6,
      Defensa: 2,
      Velocidad: 4,
      Físico: 6,
      Dominio: 4,
      Pase: 3,
      "Disparo al arco": 5,
    },
  },
  {
    id: "roberto",
    name: "Roberto",
    attributes: {
      "Arquero God": 10,
    },
  },
  {
    id: "xinxe",
    name: "Xinxe",
    attributes: {
      "Arquero God": 10,
    },
  },
  {
    id: "xtilla",
    name: "Xtilla",
    attributes: {
      Ataque: 2,
      Defensa: 7,
      Velocidad: 2,
      Físico: 3,
      Dominio: 3,
      Pase: 6,
      "Disparo al arco": 2,
    },
  },
  {
    id: "tropicono",
    name: "Tropicoño",
    attributes: {
      Ataque: 8,
      Defensa: 3,
      Velocidad: 8,
      Físico: 6,
      Dominio: 7,
      Pase: 5,
      "Disparo al arco": 7,
    },
  },
  {
    id: "nel-son",
    name: "Nel Son",
    attributes: {
      Ataque: 5,
      Defensa: 4,
      Velocidad: 3,
      Físico: 4,
      Dominio: 5,
      Pase: 4,
      "Disparo al arco": 5,
    },
  },
  {
    id: "loberto",
    name: "Loberto",
    attributes: {
      Ataque: 4,
      Defensa: 4,
      Velocidad: 4,
      Físico: 2,
      Dominio: 2,
      Pase: 3,
      "Disparo al arco": 5,
    },
  },
];

const assignmentsKey = "football-simulator-assignments";
const template = document.querySelector("#playerCardTemplate");
const resetTeamsButton = document.querySelector("#resetTeamsButton");

let assignments = loadAssignments();

if (window.location.search) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function loadAssignments() {
  try {
    const stored = JSON.parse(localStorage.getItem(assignmentsKey)) ?? {};
    return roster.reduce((result, player) => {
      result[player.id] = ["A", "B", "bench"].includes(stored[player.id]) ? stored[player.id] : "bench";
      return result;
    }, {});
  } catch {
    return roster.reduce((result, player) => {
      result[player.id] = "bench";
      return result;
    }, {});
  }
}

function saveAssignments() {
  localStorage.setItem(assignmentsKey, JSON.stringify(assignments));
}

function getAttributeNames(player) {
  if (player.attributes["Arquero God"]) {
    return ["Arquero God"];
  }

  return attributes;
}

function getPlayerTotal(player) {
  return getAttributeNames(player).reduce((sum, attribute) => sum + player.attributes[attribute], 0);
}

function getTeamPlayers(team) {
  return roster.filter((player) => assignments[player.id] === team);
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
  return "\u2605".repeat(value) + "\u2606".repeat(10 - value);
}

function movePlayer(playerId, team) {
  assignments[playerId] = team;
  saveAssignments();
  render();
}

function renderPlayer(player) {
  const card = template.content.firstElementChild.cloneNode(true);
  const total = getPlayerTotal(player);

  card.dataset.playerId = player.id;
  card.querySelector("h3").textContent = player.name;
  card.querySelector("p").textContent = `${total} puntos`;
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", player.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  const list = card.querySelector(".attribute-list");
  getAttributeNames(player).forEach((attribute) => {
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

function renderPlayers(team, containerId, countId) {
  const container = document.querySelector(containerId);
  const teamPlayers = getTeamPlayers(team);

  container.innerHTML = "";
  teamPlayers.forEach((player) => container.append(renderPlayer(player)));

  if (countId) {
    const count = document.querySelector(countId);
    count.textContent = `${teamPlayers.length} ${teamPlayers.length === 1 ? "jugador" : "jugadores"}`;
  }
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
  renderPlayers("bench", "#benchPlayers");
  renderPlayers("A", "#teamAPlayers", "#teamACount");
  renderPlayers("B", "#teamBPlayers", "#teamBCount");
  renderScores();
}

document.querySelectorAll(".drop-zone").forEach((zone) => {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");

    const playerId = event.dataTransfer.getData("text/plain");
    const team = zone.dataset.team;
    if (!playerId || !team) return;

    movePlayer(playerId, team);
  });
});

resetTeamsButton.addEventListener("click", () => {
  assignments = roster.reduce((result, player) => {
    result[player.id] = "bench";
    return result;
  }, {});
  saveAssignments();
  render();
});

render();
