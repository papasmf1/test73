const THEME_KEY = "preferred-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  const themeButton = document.getElementById("themeButton");
  if (themeButton) {
    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

function getSystemPreference() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = savedTheme || getSystemPreference();
  applyTheme(initialTheme);
}

function setupThemeToggle() {
  const button = document.getElementById("themeButton");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
          return;
        }
        applyTheme(event.matches ? "dark" : "light");
      });
  }
}

function setCurrentYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadInitialTheme();
  setupThemeToggle();
  setCurrentYear();
});

