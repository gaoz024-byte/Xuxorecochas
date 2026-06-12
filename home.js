document.addEventListener("DOMContentLoaded", () => {
  const formationsKey = "football-simulator-saved-formations-v1";
  const savedFormations = document.querySelector("#savedFormations");
  const clearFormationsButton = document.querySelector("#clearFormationsButton");

  function loadFormations() {
    try {
      const formations = JSON.parse(localStorage.getItem(formationsKey)) || [];
      return Array.isArray(formations) ? formations : [];
    } catch {
      return [];
    }
  }

  function saveFormations(formations) {
    localStorage.setItem(formationsKey, JSON.stringify(formations));
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getTeamCount(formation, team) {
    return Object.values(formation.state || {}).filter((player) => player.team === team).length;
  }

  function render() {
    const formations = loadFormations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    savedFormations.innerHTML = "";
    clearFormationsButton.classList.toggle("hidden", formations.length === 0);

    if (!formations.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Todavia no hay formaciones guardadas.";
      savedFormations.append(empty);
      return;
    }

    formations.forEach((formation) => {
      const item = document.createElement("article");
      item.className = "saved-card";

      const content = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = formation.name || "Formacion guardada";

      const meta = document.createElement("p");
      meta.textContent = `${formatDate(formation.createdAt)} · Equipo A: ${getTeamCount(formation, "A")} · Equipo B: ${getTeamCount(formation, "B")}`;

      const open = document.createElement("a");
      open.className = "ghost-link";
      open.href = `combos.html?formation=${encodeURIComponent(formation.id)}`;
      open.textContent = "Ver";

      content.append(title, meta);
      item.append(content, open);
      savedFormations.append(item);
    });
  }

  clearFormationsButton.addEventListener("click", () => {
    if (!confirm("¿Quieres borrar todas las formaciones guardadas?")) return;
    saveFormations([]);
    render();
  });

  render();
});
