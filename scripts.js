const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");

/* ---------- Header: solid background once you scroll ---------- */
const onScroll = () => header.classList.toggle("scrolled", header.classList.contains("solid") || window.scrollY > 40);
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
   Sends straight to Andy's inbox through Formspree.
   The form ID lives in the form's action attribute in index.html. */
const form = document.getElementById("contact-form");
const errorBox = document.getElementById("form-error");
const submitBtn = document.getElementById("form-submit");
const success = document.getElementById("form-success");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const valid = input.value.trim() !== "" && input.checkValidity();
    input.closest(".field").classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  if (!ok) {
    errorBox.textContent = "Add your first name, last name, a valid email address and a message.";
    return;
  }

  if (form.action.includes("YOUR_FORM_ID")) {
    errorBox.textContent = "The contact form isn't connected yet. Email andy.kettlewell94@gmail.com instead.";
    return;
  }

  errorBox.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending message…";

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Formspree returned ${res.status}`);

    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch (err) {
    errorBox.textContent = "Your message wasn't sent. Check your connection and try again, or email andy.kettlewell94@gmail.com.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send message";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
