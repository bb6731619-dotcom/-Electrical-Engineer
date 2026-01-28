/* ===============================
   Smooth Scroll
================================ */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

/* ===============================
   Language Toggle
================================ */
let currentLanguage = "en";

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "ar" : "en";
  document.documentElement.lang = currentLanguage;
  document.body.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  updateTextLanguage();
}

function updateTextLanguage() {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent =
      currentLanguage === "en"
        ? el.getAttribute("data-en")
        : el.getAttribute("data-ar");
  });
}

/* ===============================
   Calculators
================================ */
function calculatePower() {
  const v = parseFloat(document.getElementById("voltage").value);
  const i = parseFloat(document.getElementById("current").value);

  if (!isNaN(v) && !isNaN(i)) {
    document.getElementById("powerResult").textContent = (v * i) + " W";
  } else {
    document.getElementById("powerResult").textContent = "--";
  }
}

function calculateOhm() {
  const v = parseFloat(document.getElementById("ohmVoltage").value);
  const i = parseFloat(document.getElementById("ohmCurrent").value);

  if (!isNaN(v) && !isNaN(i) && i !== 0) {
    document.getElementById("ohmResult").textContent = (v / i) + " Ω";
  } else {
    document.getElementById("ohmResult").textContent = "--";
  }
}

/* ===============================
   Intersection Animations
================================ */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".animate").forEach(el => observer.observe(el));

/* ===============================
   Safe Guards (No Errors)
================================ */
if (typeof render === "function") {
  ["projects", "software", "resources", "notes"].forEach(render);
}

if (typeof data !== "undefined" && typeof updateCounts === "function") {
  updateCounts();
}

/* ===============================
   Init
================================ */
document.addEventListener("DOMContentLoaded", () => {
  updateTextLanguage();
});
