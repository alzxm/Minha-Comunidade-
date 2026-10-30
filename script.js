
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-page]");

function showPage(pageId) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

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

// Reduz o tamanho da imagem antes de salvar
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 900;

        let width = image.width;
        let height = image.height;

        if (width > height && width > maxSize) {
          height = height * maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = width * maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };

      image.onerror = reject;
      image.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];

  selectedPhoto = "";

  if (!file) return;

  try {
    selectedPhoto = await compressImage(file);
  } catch {
    alert("Não foi possível carregar a imagem. Tente outra foto.");
    photoInput.value = "";
  }
});

function getReports() {
  try {
    return JSON.parse(
      localStorage.getItem("minhaComunidadeReports") || "[]"
    );
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(
    "minhaComunidadeReports",
    JSON.stringify(reports)
  );
}

// Cadastrar ocorrência
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

    document.getElementById("form-message").textContent =
      "Solicitação cadastrada com sucesso!";

    form.reset();
    selectedPhoto = "";

    renderReports();
  } catch (error) {
    document.getElementById("form-message").textContent =
      "Não foi possível salvar. Exclua uma ocorrência antiga e tente novamente.";
  }
});

// Excluir uma ocorrência
function deleteReport(id) {
  if (!confirm("Deseja realmente excluir esta solicitação?")) {
    return;
  }

  const reports = getReports().filter(
    report => String(report.id) !== String(id)
  );

  try {
    saveReports(reports);
    renderReports();
  } catch {
    alert("Não foi possível excluir a solicitação.");
  }
}

// Mostrar as ocorrências cadastradas
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
      image.style.borderRadius = "8px";
      card.appendChild(image);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Excluir solicitação";

    deleteButton.addEventListener("click", () => {
      deleteReport(report.id);
    });

    card.appendChild(deleteButton);
    list.appendChild(card);
  });
}

renderReports();
