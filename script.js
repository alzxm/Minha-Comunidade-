
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  if (pageId === "solicitacoes") {
    renderReports();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    showPage(button.dataset.page);
  });
});

const form = document.getElementById("report-form");
const photoInput = document.getElementById("photo");

let selectedPhoto = "";

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    selectedPhoto = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    selectedPhoto = event.target.result;
  };

  reader.onerror = () => {
    alert("Não foi possível carregar essa imagem.");
  };

  reader.readAsDataURL(file);
});

function getReports() {
  return JSON.parse(
    localStorage.getItem("minhaComunidadeReports") || "[]"
  );
}

function saveReports(reports) {
  localStorage.setItem(
    "minhaComunidadeReports",
    JSON.stringify(reports)
  );
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const report = {
    id: Date.now(),
    category: document.getElementById("category").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
    photo: selectedPhoto,
    date: new Date().toLocaleDateString("pt-BR"),
    status: "Recebida"
  };

  const reports = getReports();

  reports.unshift(report);

  try {
    saveReports(reports);

    document.getElementById("form-message").textContent =
      "Solicitação cadastrada com sucesso!";

    form.reset();
    selectedPhoto = "";

    renderReports();

  } catch (error) {
    document.getElementById("form-message").textContent =
      "Não foi possível salvar. Tente uma imagem menor.";

    return;
  }
});

// EXCLUIR SOLICITAÇÃO
function deleteReport(id) {
  const confirmDelete = confirm(
    "Deseja realmente excluir esta solicitação?"
  );

  if (!confirmDelete) return;

  const reports = getReports().filter(
    report => report.id !== id
  );

  saveReports(reports);
  renderReports();
}

// MOSTRAR SOLICITAÇÕES
function renderReports() {
  const list = document.getElementById("report-list");
  const reports = getReports();

  list.innerHTML = "";

  if (reports.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <h3>Nenhuma solicitação cadastrada</h3>
        <p>As ocorrências registradas aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  reports.forEach(report => {
    const card = document.createElement("article");
    card.className = "report-card";

    const title = document.createElement("h3");
    title.textContent = report.category;

    const status = document.createElement("span");
    status.className = "status";
    status.textContent = report.status;

    const date = document.createElement("p");
    date.textContent = "Data: " + report.date;

    const location = document.createElement("p");
    location.textContent = "Local: " + report.location;

    const description = document.createElement("p");
    description.textContent = report.description;

    card.append(title, status, date, location, description);

    if (report.photo) {
      const image = document.createElement("img");
      image.src = report.photo;
      image.alt = "Foto da ocorrência";
      image.style.maxWidth = "220px";
      image.style.display = "block";
      image.style.marginTop = "12px";
      card.appendChild(image);
    }

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir solicitação";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", () => {
      deleteReport(report.id);
    });

    card.appendChild(deleteButton);
    list.appendChild(card);
  });
}

renderReports();
