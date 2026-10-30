const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");

function showPage(pageId) {
  pages.forEach(page => page.classList.toggle("active", page.id === pageId));
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });
  if (pageId === "solicitacoes") renderReports();
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
  reader.onload = event => { selectedPhoto = event.target.result; };
  reader.readAsDataURL(file);
});

function getReports() {
  try {
    return JSON.parse(localStorage.getItem("minhaComunidadeReports")) || [];
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem("minhaComunidadeReports", JSON.stringify(reports));
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const report = {
    id: Date.now(),
    category: document.getElementById("category").value,
    location: document.getElementById("location").value.trim(),
    description: document.getElementById("description").value.trim(),
    photo: selectedPhoto,
    date: new Date().toLocaleDateString("pt-BR"),
    status: "Recebida"
  };

  const reports = getReports();
  reports.unshift(report);
  try {
    saveReports(reports);
    document.getElementById("form-message").textContent = "Solicitação registrada neste navegador!";
    form.reset();
    selectedPhoto = "";
  } catch {
    document.getElementById("form-message").textContent = "Não foi possível salvar. Tente remover a foto e enviar novamente.";
  }
});

function renderReports() {
  const list = document.getElementById("report-list");
  const reports = getReports();
  list.innerHTML = "";

  if (reports.length === 0) {
    list.innerHTML = '<div class="empty"><h3>Nenhuma solicitação por enquanto</h3><p>Quando um problema for registrado, ele aparecerá aqui.</p></div>';
    return;
  }

  reports.forEach(report => {
    const card = document.createElement("article");
    card.className = "report-card";

    const title = document.createElement("h3");
    title.textContent = report.category;
    const meta = document.createElement("div");
    meta.className = "report-meta";
    meta.innerHTML = `<span class="status">${escapeText(report.status)}</span><span>${escapeText(report.date)}</span>`;
    const location = document.createElement("p");
    location.textContent = "Local: " + report.location;
    const description = document.createElement("p");
    description.textContent = report.description;

    card.append(title, meta, location, description);
    if (report.photo) {
      const img = document.createElement("img");
      img.src = report.photo;
      img.alt = "Foto anexada à solicitação";
      card.appendChild(img);
    }
    list.appendChild(card);
  });
}

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

renderReports();
