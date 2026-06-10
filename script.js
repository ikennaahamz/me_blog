const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const sectionLinks = document.querySelectorAll("[data-section-link]");
const sections = [...sectionLinks]
  .map((link) => document.getElementById(link.dataset.sectionLink))
  .filter(Boolean);

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);

  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle?.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  if (themeToggleText) {
    themeToggleText.textContent = nextTheme === "dark" ? "Dark" : "Light";
  }
}

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav?.classList.toggle("is-open") || false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        sectionLinks.forEach((link) => {
          link.classList.toggle("is-active", link.dataset.sectionLink === entry.target.id);
        });
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

setTheme(root.dataset.theme || "light");
