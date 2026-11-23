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
    track("generate_lead", { form: "contact" });
    success.focus();
  } catch (err) {
    errorBox.textContent = "Your message wasn't sent. Check your connection and try again, or email andy.kettlewell94@gmail.com.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send message";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Analytics consent ----------
   Google Tag Manager (GTM-M4QTMZQV) loads from the <head> of every page with
   analytics cookies switched off (Consent Mode). They only switch on when the
   visitor clicks Accept, and switch off again if they later click Reject. */
const CONSENT_KEY = "ak-analytics-consent";
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const saveConsent = (value) => { try { localStorage.setItem(CONSENT_KEY, value); } catch {} };

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

const setConsent = (value) => {
  gtag("consent", "update", { analytics_storage: value });
  window.dataLayer.push({ event: value === "granted" ? "analytics_consent_granted" : "analytics_consent_denied" });
};

// Record an interaction as a Tag Manager custom event, only once the visitor has said yes
const track = (name, params = {}) => {
  if (readConsent() === "granted") window.dataLayer.push({ event: name, ...params });
};

const showBanner = () => {
  if (document.querySelector(".cookie-banner")) return;
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie preferences");
  banner.innerHTML = `
    <p>Can this site use analytics cookies to see how people use it? They help Andy improve it.
    <a href="privacy.html#cookies">Privacy policy</a></p>
    <div class="cookie-actions">
      <button type="button" class="btn btn-sm cookie-reject">Reject</button>
      <button type="button" class="btn btn-sm cookie-accept">Accept</button>
    </div>`;
  document.body.appendChild(banner);
  const close = (value) => {
    saveConsent(value);
    banner.remove();
    setConsent(value);
  };
  banner.querySelector(".cookie-accept").addEventListener("click", () => close("granted"));
  banner.querySelector(".cookie-reject").addEventListener("click", () => close("denied"));
};

{
  if (readConsent() === null) showBanner();

  // "Cookie settings" link in the footer reopens the choice
  document.querySelectorAll(".cookie-settings").forEach((link) => {
    link.hidden = false;
    link.addEventListener("click", (e) => { e.preventDefault(); showBanner(); });
  });

  // Interactions worth knowing about
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (link.textContent.trim() === "Book a talk") track("book_talk_click", { location: link.className.includes("header") ? "header" : "page" });
    else if (href.startsWith("mailto:")) track("email_click");
    else if (href.startsWith("tel:")) track("phone_click");
    else if (link.closest(".socials")) track("social_click", { network: link.getAttribute("aria-label") });
    else if (link.closest(".partner-row")) track("partner_click", { partner: link.querySelector("img")?.alt });
  });
}

/* ---------- About page: the journey ----------
   As you scroll, the orange river fills and each chapter's dot lights up. */
const journey = document.querySelector(".journey");
if (journey) {
  const chapters = [...journey.querySelectorAll(".chapter")];
  const river = journey.querySelector(".journey-river");
  const fill = journey.querySelector(".river-fill");

  let ticking = false;
  const update = () => {
    ticking = false;
    const mid = window.innerHeight * 0.55;
    const r = river.getBoundingClientRect();
    // fills down to the bottom of the last chapter as you scroll
    const progress = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    fill.style.setProperty("--progress", progress.toFixed(4));
    chapters.forEach((c) => c.classList.toggle("reached", c.getBoundingClientRect().top < mid));
  };
  const onScrollJourney = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScrollJourney, { passive: true });
  window.addEventListener("resize", onScrollJourney);
  update();
}

/* ---------- Talk slider (about page) ---------- */
document.querySelectorAll(".talk-slider").forEach((slider) => {
  const track = slider.querySelector(".talk-cards");
  const [prev, next] = slider.querySelectorAll(".slider-btn");
  const step = () => {
    const card = track.querySelector(".talk-card");
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
  };
  const updateButtons = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };
  slider.querySelectorAll(".slider-btn").forEach((btn) =>
    btn.addEventListener("click", () => track.scrollBy({ left: step() * Number(btn.dataset.dir) })));
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
});
