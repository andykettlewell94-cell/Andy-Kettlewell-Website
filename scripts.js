const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");

/* ---------- Header: solid background once you scroll ---------- */
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  document.body.style.overflow = open ? "hidden" : "";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

menuButton.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Contact form ----------
   No server yet, so this opens the visitor's email app with the
   message filled in. Swap for Formspree / Netlify Forms later. */
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
const TO = "andy.kettlewell94@gmail.com";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const valid = input.value.trim() !== "" && input.checkValidity();
    input.closest(".field").classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    note.textContent = "Add your name, a valid email address and a message, then try again.";
    return;
  }

  const data = new FormData(form);
  const subject = `${data.get("topic")} enquiry from ${data.get("name")}`;
  const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`;
  window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = "Your email app should now be open with the message ready. Press send there to finish.";
});

document.getElementById("year").textContent = new Date().getFullYear();
