document.addEventListener("DOMContentLoaded", () => {
  const savedFormations = document.querySelector("#savedFormations");
  const clearFormationsButton = document.querySelector("#clearFormationsButton");
  const supabaseClient = getSupabaseClient();

  function formatDate(value) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getTeamCount(formation, team) {
    return Object.values(formation.state || {}).filter((player) => player.team === team).length;
  }

  function showEmpty(text) {
    savedFormations.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = text;
    savedFormations.append(empty);
  }

  async function loadFormations() {
    if (!supabaseClient) {
      clearFormationsButton.classList.add("hidden");
      showEmpty("Falta configurar Supabase en supabase-config.js.");
      return;
    }

    const { data, error } = await supabaseClient
      .from("formations")
      .select("id,name,state,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      clearFormationsButton.classList.add("hidden");
      showEmpty("No se pudieron cargar las formaciones desde Supabase.");
      return;
    }

    render(data || []);
  }

  function render(formations) {
    savedFormations.innerHTML = "";
    clearFormationsButton.classList.toggle("hidden", formations.length === 0);

    if (!formations.length) {
      showEmpty("Todavia no hay formaciones guardadas.");
      return;
    }

    formations.forEach((formation) => {
      const item = document.createElement("article");
      item.className = "saved-card";

      const content = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = formation.name || "Formacion guardada";

      const meta = document.createElement("p");
      meta.textContent = `${formatDate(formation.created_at)} · Equipo A: ${getTeamCount(formation, "A")} · Equipo B: ${getTeamCount(formation, "B")}`;

      const open = document.createElement("a");
      open.className = "ghost-link";
      open.href = `combos.html?formation=${encodeURIComponent(formation.id)}`;
      open.textContent = "Ver";

      content.append(title, meta);
      item.append(content, open);
      savedFormations.append(item);
    });
  }

  clearFormationsButton.addEventListener("click", async () => {
    if (!supabaseClient) return;
    if (!confirm("¿Quieres borrar todas las formaciones guardadas?")) return;

    const { error } = await supabaseClient.from("formations").delete().not("id", "is", null);
    if (error) {
      showEmpty("No se pudieron borrar las formaciones.");
      return;
    }

    loadFormations();
  });

  loadFormations();
});
