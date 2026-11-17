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

/* ---------- Google Analytics (through Google Tag Manager), only after the visitor accepts cookies ----------
   GA_ID can be a Tag Manager container ID (GTM-...) or a Google Analytics
   Measurement ID (G-...). While it says XXXX, no banner shows and nothing is tracked. */
const GA_ID = "GTM-M4QTMZQV";
const CONSENT_KEY = "ak-analytics-consent";
const usesGTM = GA_ID.startsWith("GTM-");

const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };
const saveConsent = (value) => { try { localStorage.setItem(CONSENT_KEY, value); } catch {} };

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

let gaLoaded = false;
const loadAnalytics = () => {
  if (gaLoaded) return;
  gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  if (usesGTM) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GA_ID}`;
  } else {
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
  document.head.appendChild(s);
};

// Record an interaction, but only if the visitor has said yes.
// With Tag Manager these arrive as custom events named below (book_talk_click etc.)
const track = (name, params = {}) => {
  if (!gaLoaded) return;
  if (usesGTM) window.dataLayer.push({ event: name, ...params });
  else gtag("event", name, params);
};

const showBanner = () => {
  if (document.querySelector(".cookie-banner")) return;
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie preferences");
  banner.innerHTML = `
    <p>Can I use analytics cookies to see how people use this site? They help me improve it.
    <a href="privacy.html#cookies">Privacy policy</a></p>
    <div class="cookie-actions">
      <button type="button" class="btn btn-sm cookie-reject">Reject</button>
      <button type="button" class="btn btn-sm cookie-accept">Accept</button>
    </div>`;
  document.body.appendChild(banner);
  const close = (value) => {
    saveConsent(value);
    banner.remove();
    if (value === "granted") loadAnalytics();
    else if (gaLoaded) location.reload(); // stop tracking straight away if they change their mind
  };
  banner.querySelector(".cookie-accept").addEventListener("click", () => close("granted"));
  banner.querySelector(".cookie-reject").addEventListener("click", () => close("denied"));
};

if (!GA_ID.includes("XXXX")) {
  const consent = readConsent();
  if (consent === "granted") loadAnalytics();
  else if (consent === null) showBanner();

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
