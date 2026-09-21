// =============================================================================
//  ui.js — shared chrome: header, footer, theme, toasts, icons, helpers
// =============================================================================
import { SITE } from "./config.js?v=2";
import { Cart } from "./store.js";
import { t, getLang, setLang, LANGUAGES } from "./i18n.js";

// ---- Icons (inline SVG, Lucide-style) --------------------------------------
export const icon = (name, size = 20) => {
  const p = {
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    box: '<path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    star: '<path d="M12 2l3 6.3 6.9 1-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-1z"/>',
    truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.1 9.91a16 16 0 0 0 6 6l1.74-1.74a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    headset: '<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2ZM3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2"/>',
    tiktok: '<path d="M9 12.5a3.5 3.5 0 1 0 3.5 3.5V4c.8 2 2.3 3.2 4.5 3.4"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
    x: '<path d="M4 3l7.2 9.3L4.4 21H7l5.2-6 4.6 6H21l-7.5-9.7L20 3h-2.6l-4.6 5.4L8.7 3z"/>',
  }[name] || "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
};

// ---- Formatting ------------------------------------------------------------
export const money = (n) =>
  new Intl.NumberFormat(SITE.currency.locale, {
    style: "currency",
    currency: SITE.currency.code,
  }).format(Number(n) || 0);

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const placeholder = () => `<div class="img-ph">${icon("box", 34)}</div>`;

// ---- Theme -----------------------------------------------------------------
const THEME_KEY = "mkt_theme";
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || "light"; // calm look — warm light by default
  document.documentElement.setAttribute("data-theme", theme);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  document.querySelectorAll("[data-theme-icon]").forEach((el) => {
    el.innerHTML = icon(next === "light" ? "moon" : "sun");
  });
}

// ---- Toasts ----------------------------------------------------------------
export function toast(msg, type = "ok") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast__dot"></span><span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

// ---- Header + Footer -------------------------------------------------------
function navItems(active) {
  const items = [
    ["index.html", t("nav_catalog")],
    ["reviews.html", t("nav_reviews")],
    ["certificates.html", t("nav_certs")],
    ["support.html", t("nav_support")],
    ["cart.html", t("nav_cart")],
    ["admin.html", t("nav_admin")],
  ];
  return items
    .map(
      ([href, label]) =>
        `<a class="navlink${active === href ? " is-active" : ""}" href="${href}">${label}</a>`
    )
    .join("");
}

function langSelect() {
  const cur = getLang();
  return `<div class="lang-picker" title="${t("lang_label")}">
    ${icon("globe", 16)}
    <select id="langSel" aria-label="${t("lang_label")}">
      ${LANGUAGES.map((l) => `<option value="${l.code}" ${l.code === cur ? "selected" : ""}>${l.short}</option>`).join("")}
    </select>
  </div>`;
}

// Bold colour-block page header — the home/product look, reused everywhere.
export function pageHero({ eyebrow = "", title = "", subtitle = "", color = "#94908c" } = {}) {
  return `
  <section class="page-hero" style="background:${color}">
    <div class="page-hero__grain"></div>
    <div class="page-hero__inner">
      ${eyebrow ? `<span class="page-hero__eyebrow">${eyebrow}</span>` : ""}
      <h1 class="page-hero__title">${title}</h1>
      ${subtitle ? `<p class="page-hero__sub">${subtitle}</p>` : ""}
    </div>
  </section>`;
}

export function mountChrome(activePage = "index.html") {
  // language
  document.documentElement.lang = getLang();
  // document meta / title
  document.title = `${SITE.name} — ${document.body.dataset.pageTitle || t("tagline")}`;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = SITE.metaDescription;

  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  // header
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="container site-header__inner">
      <a class="brand" href="index.html">
        <span class="brand__mark">${esc(SITE.name.replace(/[^A-Za-zА-Яа-я0-9]/g, "").slice(0, 1) || "M")}</span>
        <span class="brand__name">${esc(SITE.name)}</span>
      </a>
      <nav class="site-nav" id="siteNav">${navItems(activePage)}<span class="nav-underline" id="navUnderline"></span></nav>
      <div class="header-tools" style="display:flex;gap:8px;align-items:center;margin-left:auto">
        ${langSelect()}
        <button class="icon-btn" id="themeBtn" aria-label="${t("lang_label")}"><span data-theme-icon>${icon(isLight ? "moon" : "sun")}</span></button>
        <a class="icon-btn" href="cart.html" id="cartLink" aria-label="${t("nav_cart")}">
          ${icon("cart")}
          <span class="cart-count" id="cartCount" hidden>0</span>
        </a>
        <button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">${icon("menu")}</button>
      </div>
    </div>`;
  document.body.prepend(header);

  // footer
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="container site-footer__inner">
      <div>
        <div class="brand" style="font-size:1.25rem"><span class="brand__mark" style="width:26px;height:26px;font-size:.8rem">${esc(SITE.name.slice(0, 1))}</span> ${esc(SITE.name)}</div>
        <small>${esc(t("tagline"))}</small>
      </div>
      <div style="display:flex;gap:18px;flex-wrap:wrap">
        <a class="navlink" href="index.html">${t("nav_catalog")}</a>
        <a class="navlink" href="reviews.html">${t("nav_reviews")}</a>
        <a class="navlink" href="certificates.html">${t("nav_certs")}</a>
        <a class="navlink" href="support.html">${t("nav_support")}</a>
        <a class="navlink" href="cart.html">${t("nav_cart")}</a>
        <a class="navlink" href="admin.html">${t("nav_admin")}</a>
      </div>
      <div class="socials">
        ${(SITE.socials || []).map((sc) => `<a class="social" href="${esc(sc.href)}" target="_blank" rel="noopener" aria-label="${esc(sc.name)}">${icon(sc.icon, 18)}</a>`).join("")}
      </div>
      <small>© ${year} ${esc(SITE.name)}.</small>
    </div>`;
  document.body.appendChild(footer);

  // wiring
  document.getElementById("themeBtn").addEventListener("click", toggleTheme);
  const langSel = document.getElementById("langSel");
  if (langSel) langSel.addEventListener("change", (e) => { setLang(e.target.value); location.reload(); });
  const nav = document.getElementById("siteNav");
  const navToggle = document.getElementById("navToggle");
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // sliding nav active indicator — one physical object that moves & springs
  const underline = document.getElementById("navUnderline");
  const activeLink = nav.querySelector(".navlink.is-active");
  const isHorizontal = () => window.matchMedia("(min-width: 721px)").matches;
  const moveUnderline = (target) => {
    if (!underline) return;
    if (!target || !isHorizontal()) { underline.style.opacity = "0"; return; }
    const nr = nav.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    underline.style.width = `${tr.width}px`;
    underline.style.transform = `translateX(${tr.left - nr.left}px)`;
    underline.style.opacity = "1";
  };
  const resetUnderline = () => moveUnderline(activeLink);
  nav.querySelectorAll(".navlink").forEach((a) => a.addEventListener("mouseenter", () => moveUnderline(a)));
  nav.addEventListener("mouseleave", resetUnderline);
  requestAnimationFrame(resetUnderline);
  setTimeout(resetUnderline, 300);
  window.addEventListener("load", resetUnderline);
  window.addEventListener("resize", resetUnderline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resetUnderline);

  // cart badge (live)
  const badge = document.getElementById("cartCount");
  const render = () => {
    const c = Cart.count();
    badge.textContent = c;
    badge.hidden = c === 0;
    if (c > 0) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
  };
  render();
  Cart.subscribe(render);
}

// ---- reveal-on-scroll ------------------------------------------------------
export function revealOnScroll() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  els.forEach((e) => io.observe(e));
}

// ---- skeleton loading placeholders (presentation only) ---------------------
export function skeletonCards(n = 8) {
  return Array.from({ length: n }).map(() => `
    <div class="sk-card">
      <div class="sk sk-media"></div>
      <div class="sk sk-line sh"></div>
      <div class="sk sk-line lg"></div>
      <div class="sk sk-line sh" style="margin-bottom:16px"></div>
    </div>`).join("");
}

// ---- misc helpers ----------------------------------------------------------
export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); } catch {}
  ta.remove();
  return Promise.resolve();
}

export const qs = (k) => new URLSearchParams(location.search).get(k);

// ---- fly-to-cart: physical feedback when adding a product ------------------
export function flyToCart(sourceEl, imgSrc) {
  const cart = document.getElementById("cartLink");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !cart || !sourceEl || !imgSrc) return; // counter still springs via cart subscribe

  const s = sourceEl.getBoundingClientRect();
  const c = cart.getBoundingClientRect();
  if (!s.width || !c.width) return;
  const size = Math.min(96, Math.max(52, s.width * 0.5));
  const clone = document.createElement("img");
  clone.src = imgSrc;
  clone.className = "fly-clone";
  clone.style.width = clone.style.height = `${size}px`;
  clone.style.left = `${s.left + s.width / 2 - size / 2}px`;
  clone.style.top = `${s.top + s.height / 2 - size / 2}px`;
  document.body.appendChild(clone);

  const dx = c.left + c.width / 2 - (s.left + s.width / 2);
  const dy = c.top + c.height / 2 - (s.top + s.height / 2);
  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 46}px) scale(.7)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(.16)`, opacity: 0.25 },
    ],
    { duration: 640, easing: "cubic-bezier(.5,.05,.85,.5)" }
  );
  anim.onfinish = () => clone.remove();
  anim.oncancel = () => clone.remove();
}
