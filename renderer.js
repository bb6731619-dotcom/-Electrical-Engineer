// ==========================================
// DATABASE (SAFE WITH UPDATES)
// ==========================================

const defaultDB = {
  projects: [],
  software: [],
  notes: []
};

const db = {
  ...defaultDB,
  ...(JSON.parse(localStorage.getItem("db")) || {})
};

// ==========================================
// SAVE & LOAD
// ==========================================

function save() {
  localStorage.setItem("db", JSON.stringify(db));
  updateCounts();
}

// ==========================================
// NAVIGATION
// ==========================================

function show(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
  }
}

// ==========================================
// ADD ITEM
// ==========================================

function addItem(type) {
  const name = prompt("اكتب الاسم");
  if (!name || !name.trim()) return;

  db[type].push(name.trim());
  save();
  render(type);
}

// ==========================================
// RENDER LISTS
// ==========================================

function render(type) {
  const list = document.getElementById(type + "List");
  if (!list) return;

  list.innerHTML = "";

  db[type].forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;

    // زر حذف (اختياري – شكله بسيط)
    li.addEventListener("dblclick", () => {
      if (confirm("تحب تمسح العنصر ده؟")) {
        db[type].splice(index, 1);
        save();
        render(type);
      }
    });

    list.appendChild(li);
  });
}

// ==========================================
// COUNTERS
// ==========================================

function updateCounts() {
  const cProjects = document.getElementById("cProjects");
  const cSoftware = document.getElementById("cSoftware");
  const cNotes = document.getElementById("cNotes");

  if (cProjects) cProjects.textContent = db.projects.length;
  if (cSoftware) cSoftware.textContent = db.software.length;
  if (cNotes) cNotes.textContent = db.notes.length;
}

// ==========================================
// INIT
// ==========================================

["projects", "software", "notes"].forEach(type => {
  render(type);
});

updateCounts();

// افتح أول صفحة تلقائي
show("projects");
