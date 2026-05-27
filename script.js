document.addEventListener("DOMContentLoaded", () => {
  const attributes = [
    { key: "ataque", label: "Ataque" },
    { key: "defensa", label: "Defensa" },
    { key: "velocidad", label: "Velocidad" },
    { key: "fisico", label: "F\u00edsico" },
    { key: "dominio", label: "Dominio" },
    { key: "pase", label: "Pase" },
    { key: "disparo", label: "Disparo al arco" },
  ];

  const roster = [
    {
      id: "xuxo",
      name: "Xuxo",
      attributes: { ataque: 2, defensa: 4, velocidad: 5, fisico: 8, dominio: 2, pase: 2, disparo: 1 },
    },
    {
      id: "jaime",
      name: 'Jaime "el corrector" Gutierrez',
      attributes: { ataque: 6, defensa: 4, velocidad: 4, fisico: 2, dominio: 4, pase: 6, disparo: 6 },
    },
    {
      id: "rafa-el",
      name: "Rafa \u00e9l",
      attributes: { ataque: 7, defensa: 7, velocidad: 4, fisico: 5, dominio: 6, pase: 6, disparo: 8 },
    },
    {
      id: "pastu",
      name: "Pastu",
      attributes: { ataque: 7, defensa: 3, velocidad: 5, fisico: 7, dominio: 4, pase: 6, disparo: 7 },
    },
    {
      id: "pastu-jr",
      name: "Pastu Jr",
      attributes: { ataque: 6, defensa: 2, velocidad: 4, fisico: 6, dominio: 4, pase: 3, disparo: 5 },
    },
    {
      id: "roberto",
      name: "Roberto",
      attributes: { arquero: 10 },
      goalkeeper: true,
    },
    {
      id: "xinxe",
      name: "Xinxe",
      attributes: { arquero: 10 },
      goalkeeper: true,
    },
    {
      id: "xtilla",
      name: "Xtilla",
      attributes: { ataque: 2, defensa: 7, velocidad: 2, fisico: 3, dominio: 3, pase: 6, disparo: 2 },
    },
    {
      id: "tropicono",
      name: "Tropico\u00f1o",
      attributes: { ataque: 8, defensa: 3, velocidad: 8, fisico: 6, dominio: 7, pase: 5, disparo: 7 },
    },
    {
      id: "nel-son",
      name: "Nel Son",
      attributes: { ataque: 5, defensa: 4, velocidad: 3, fisico: 4, dominio: 5, pase: 4, disparo: 5 },
    },
    {
      id: "loberto",
      name: "Loberto",
      attributes: { ataque: 4, defensa: 4, velocidad: 4, fisico: 2, dominio: 2, pase: 3, disparo: 5 },
    },
  ];

  const assignmentsKey = "football-simulator-assignments-v2";
  const template = document.querySelector("#playerCardTemplate");
  const resetTeamsButton = document.querySelector("#resetTeamsButton");

  let assignments = loadAssignments();

  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  function loadAssignments() {
    try {
      const stored = JSON.parse(localStorage.getItem(assignmentsKey)) || {};
      return roster.reduce((result, player) => {
        result[player.id] = ["A", "B", "bench"].includes(stored[player.id]) ? stored[player.id] : "bench";
        return result;
      }, {});
    } catch {
      return makeBenchAssignments();
    }
  }

  function makeBenchAssignments() {
    return roster.reduce((result, player) => {
      result[player.id] = "bench";
      return result;
    }, {});
  }

  function saveAssignments() {
    localStorage.setItem(assignmentsKey, JSON.stringify(assignments));
  }

  function getPlayerAttributes(player) {
    if (player.goalkeeper) {
      return [{ key: "arquero", label: "Arquero God" }];
    }

    return attributes;
  }

  function getPlayerTotal(player) {
    return getPlayerAttributes(player).reduce((sum, attribute) => sum + player.attributes[attribute.key], 0);
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
    if (!assignments[playerId]) return;

    assignments[playerId] = team;
    saveAssignments();
    render();
  }

  function makeMoveButton(playerId, team, text) {
    const button = document.createElement("button");
    button.className = "move-button";
    button.type = "button";
    button.textContent = text;
    button.dataset.playerId = playerId;
    button.dataset.team = team;
    button.draggable = false;
    button.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    button.addEventListener("dragstart", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    return button;
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
    card.addEventListener("dragend", () => card.classList.remove("dragging"));

    const list = card.querySelector(".attribute-list");
    getPlayerAttributes(player).forEach((attribute) => {
      const value = player.attributes[attribute.key];
      const row = document.createElement("div");
      row.className = "attribute-row";

      const term = document.createElement("dt");
      term.textContent = attribute.label;

      const stars = document.createElement("dd");
      stars.className = "stars";
      stars.textContent = starString(value);
      stars.setAttribute("aria-label", `${value} de 10 estrellas`);

      const number = document.createElement("dd");
      number.className = "number";
      number.textContent = value;

      row.append(term, stars, number);
      list.append(row);
    });

    const actions = document.createElement("div");
    actions.className = "move-actions";
    actions.append(
      makeMoveButton(player.id, "A", "A"),
      makeMoveButton(player.id, "B", "B"),
      makeMoveButton(player.id, "bench", "Banca"),
    );
    card.append(actions);

    return card;
  }

  function renderPlayers(team, containerId, countId) {
    const container = document.querySelector(containerId);
    const teamPlayers = getTeamPlayers(team);

    container.innerHTML = "";
    teamPlayers.forEach((player) => container.append(renderPlayer(player)));

    if (!teamPlayers.length && team === "bench") {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Todos los jugadores ya estan en equipos.";
      container.append(empty);
    }

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

    zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));

    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("drag-over");

      const playerId = event.dataTransfer.getData("text/plain");
      const team = zone.dataset.team;
      if (!playerId || !team) return;

      movePlayer(playerId, team);
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".move-button");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    movePlayer(button.dataset.playerId, button.dataset.team);
  });

  resetTeamsButton.addEventListener("click", () => {
    assignments = makeBenchAssignments();
    saveAssignments();
    render();
  });

  render();
});
