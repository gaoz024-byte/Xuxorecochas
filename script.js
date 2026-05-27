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
    { id: "xuxo", name: "Xuxo", attributes: { ataque: 2, defensa: 4, velocidad: 5, fisico: 8, dominio: 2, pase: 2, disparo: 1 } },
    { id: "jaime", name: 'Jaime "el corrector" Gutierrez', attributes: { ataque: 6, defensa: 4, velocidad: 4, fisico: 2, dominio: 4, pase: 6, disparo: 6 } },
    { id: "rafa-el", name: "Rafa \u00e9l", attributes: { ataque: 7, defensa: 7, velocidad: 4, fisico: 5, dominio: 6, pase: 6, disparo: 8 } },
    { id: "pastu", name: "Pastu", attributes: { ataque: 7, defensa: 3, velocidad: 5, fisico: 7, dominio: 4, pase: 6, disparo: 7 } },
    { id: "pastu-jr", name: "Pastu Jr", attributes: { ataque: 6, defensa: 2, velocidad: 4, fisico: 6, dominio: 4, pase: 3, disparo: 5 } },
    { id: "roberto", name: "Roberto", attributes: { arquero: 10 }, goalkeeper: true },
    { id: "xinxe", name: "Xinxe", attributes: { arquero: 10 }, goalkeeper: true },
    { id: "xtilla", name: "Xtilla", attributes: { ataque: 2, defensa: 7, velocidad: 2, fisico: 3, dominio: 3, pase: 6, disparo: 2 } },
    { id: "tropicono", name: "Tropico\u00f1o", attributes: { ataque: 8, defensa: 3, velocidad: 8, fisico: 6, dominio: 7, pase: 5, disparo: 7 } },
    { id: "nel-son", name: "Nel Son", attributes: { ataque: 5, defensa: 4, velocidad: 3, fisico: 4, dominio: 5, pase: 4, disparo: 5 } },
    { id: "loberto", name: "Loberto", attributes: { ataque: 4, defensa: 4, velocidad: 4, fisico: 2, dominio: 2, pase: 3, disparo: 5 } },
  ];

  const stateKey = "football-simulator-field-state-v1";
  const cardTemplate = document.querySelector("#playerCardTemplate");
  const benchPlayers = document.querySelector("#benchPlayers");
  const fieldPlayers = document.querySelector("#fieldPlayers");
  const pitch = document.querySelector("#pitch");
  const resetTeamsButton = document.querySelector("#resetTeamsButton");

  let state = loadState();
  let activeToken = null;

  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  function makeInitialState() {
    return roster.reduce((result, player) => {
      result[player.id] = { team: "bench", x: 50, y: 50 };
      return result;
    }, {});
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(stateKey)) || {};
      return roster.reduce((result, player) => {
        const saved = stored[player.id] || {};
        result[player.id] = {
          team: ["A", "B", "bench"].includes(saved.team) ? saved.team : "bench",
          x: clamp(saved.x ?? 50, 6, 94),
          y: clamp(saved.y ?? 50, 10, 92),
        };
        return result;
      }, {});
    } catch {
      return makeInitialState();
    }
  }

  function saveState() {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || min));
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
    return roster.filter((player) => state[player.id].team === team);
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

  function getDefaultPosition(team) {
    const count = getTeamPlayers(team).length;
    return {
      x: team === "A" ? 20 + (count % 3) * 10 : 70 + (count % 3) * 10,
      y: 20 + (count % 5) * 14,
    };
  }

  function movePlayer(playerId, team, position) {
    if (!state[playerId]) return;

    if (team === "bench") {
      state[playerId] = { team: "bench", x: 50, y: 50 };
    } else {
      const nextPosition = position || getDefaultPosition(team);
      state[playerId] = {
        team,
        x: clamp(nextPosition.x, 6, 94),
        y: clamp(nextPosition.y, 10, 92),
      };
    }

    saveState();
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
    return button;
  }

  function renderBenchCard(player) {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
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

      const number = document.createElement("dd");
      number.className = "number";
      number.textContent = value;

      row.append(term, stars, number);
      list.append(row);
    });

    const actions = document.createElement("div");
    actions.className = "move-actions";
    actions.append(makeMoveButton(player.id, "A", "A"), makeMoveButton(player.id, "B", "B"));
    card.append(actions);

    return card;
  }

  function renderFieldToken(player) {
    const playerState = state[player.id];
    const token = document.createElement("button");
    token.className = `field-token team-${playerState.team.toLowerCase()}`;
    token.type = "button";
    token.dataset.playerId = player.id;
    token.style.left = `${playerState.x}%`;
    token.style.top = `${playerState.y}%`;

    const name = document.createElement("span");
    name.className = "token-name";
    name.textContent = player.name;

    const photo = document.createElement("span");
    photo.className = "token-photo";
    photo.textContent = "Foto";

    const remove = document.createElement("span");
    remove.className = "token-remove";
    remove.textContent = "Banca";

    token.append(name, photo, remove);
    token.addEventListener("pointerdown", startTokenDrag);
    return token;
  }

  function startTokenDrag(event) {
    const token = event.currentTarget;
    activeToken = {
      playerId: token.dataset.playerId,
      moved: false,
    };
    token.setPointerCapture(event.pointerId);
    token.classList.add("moving");
    event.preventDefault();
  }

  function updateTokenPosition(event) {
    if (!activeToken) return;

    const rect = pitch.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 6, 94);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 10, 92);
    const team = x < 50 ? "A" : "B";
    activeToken.moved = true;
    state[activeToken.playerId] = { team, x, y };
    renderScoresAndCounts();

    const token = fieldPlayers.querySelector(`[data-player-id="${activeToken.playerId}"]`);
    if (token) {
      token.style.left = `${x}%`;
      token.style.top = `${y}%`;
      token.classList.toggle("team-a", team === "A");
      token.classList.toggle("team-b", team === "B");
    }
  }

  function endTokenDrag(event) {
    if (!activeToken) return;

    const token = fieldPlayers.querySelector(`[data-player-id="${activeToken.playerId}"]`);
    if (token) {
      token.classList.remove("moving");
      token.releasePointerCapture?.(event.pointerId);
    }

    if (!activeToken.moved) {
      movePlayer(activeToken.playerId, "bench");
    } else {
      saveState();
      render();
    }

    activeToken = null;
  }

  function getDropPosition(event) {
    const rect = pitch.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 6, 94);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 10, 92);
    return { x, y };
  }

  function renderBench() {
    benchPlayers.innerHTML = "";
    const available = roster.filter((player) => state[player.id].team === "bench");
    available.forEach((player) => benchPlayers.append(renderBenchCard(player)));

    if (!available.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Todos los jugadores ya estan en el campo.";
      benchPlayers.append(empty);
    }
  }

  function renderField() {
    fieldPlayers.innerHTML = "";
    roster
      .filter((player) => state[player.id].team !== "bench")
      .forEach((player) => fieldPlayers.append(renderFieldToken(player)));
  }

  function renderScoresAndCounts() {
    const teamATotal = getTeamTotal("A");
    const teamBTotal = getTeamTotal("B");
    const difference = Math.abs(teamATotal - teamBTotal);
    const differenceElement = document.querySelector("#differenceScore");
    const teamACount = getTeamPlayers("A").length;
    const teamBCount = getTeamPlayers("B").length;

    document.querySelector("#teamATotal").textContent = teamATotal;
    document.querySelector("#teamBTotal").textContent = teamBTotal;
    document.querySelector("#teamACount").textContent = `${teamACount} ${teamACount === 1 ? "jugador" : "jugadores"}`;
    document.querySelector("#teamBCount").textContent = `${teamBCount} ${teamBCount === 1 ? "jugador" : "jugadores"}`;
    differenceElement.textContent = difference;
    differenceElement.className = `diff ${getDifferenceClass(difference)}`;
  }

  function render() {
    renderBench();
    renderField();
    renderScoresAndCounts();
  }

  document.addEventListener("pointermove", updateTokenPosition);
  document.addEventListener("pointerup", endTokenDrag);

  pitch.addEventListener("dragover", (event) => {
    event.preventDefault();
    pitch.classList.add("drag-over");
  });

  pitch.addEventListener("dragleave", () => pitch.classList.remove("drag-over"));

  pitch.addEventListener("drop", (event) => {
    event.preventDefault();
    pitch.classList.remove("drag-over");
    const playerId = event.dataTransfer.getData("text/plain");
    const position = getDropPosition(event);
    movePlayer(playerId, position.x < 50 ? "A" : "B", position);
  });

  benchPlayers.addEventListener("dragover", (event) => event.preventDefault());
  benchPlayers.addEventListener("drop", (event) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData("text/plain");
    movePlayer(playerId, "bench");
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".move-button");
    if (!button) return;

    event.preventDefault();
    movePlayer(button.dataset.playerId, button.dataset.team);
  });

  resetTeamsButton.addEventListener("click", () => {
    state = makeInitialState();
    saveState();
    render();
  });

  render();
});
