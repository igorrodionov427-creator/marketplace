import { SITE } from "../config.js?v=2";
import { getPublishedProducts } from "../db.js?v=2";
import { Cart } from "../store.js";
import { icon, money, esc, placeholder, initTheme, mountChrome, revealOnScroll, toast, skeletonCards } from "../ui.js";
import { t, getLang } from "../i18n.js";

initTheme();

let ALL = [];
const state = { q: "", cat: "all", sort: "new" };

// Landing sections copy (EN/RU; other languages fall back to EN)
const COPY = {
  en: {
    proofLabel: "Reviews worldwide", more: "More",
    benTitle: "Why PEAKR",
    ben: [
      ["shield", "Lab-tested", "Only genuine brands, verified by third-party labs."],
      ["truck", "Fast shipping", "Discreet worldwide delivery with tracking."],
      ["check", "Crypto checkout", "Pay in BTC, ETH or USDT — private, no account."],
      ["headset", "Real support", "Questions? We reply within hours."],
    ],
    revTitle: "What athletes say",
    rev: [
      ["The pre-workout is insane, energy for the whole session. Shipping was quick too.", "Max K. · powerlifter"],
      ["Legit gear, honest doses. My go-to for whey and creatine now.", "Elena R. · CrossFit"],
      ["Paid in USDT, order tracked, arrived sealed. Ordering again.", "Dmitri V. · bodybuilder"],
    ],
  },
  ru: {
    proofLabel: "Отзывов по всему миру", more: "Ещё",
    benTitle: "Почему PEAKR",
    ben: [
      ["shield", "Проверено", "Только оригинал, проверенный сторонними лабораториями."],
      ["truck", "Быстрая доставка", "Аккуратная доставка по миру с трек-номером."],
      ["check", "Оплата криптой", "BTC, ETH или USDT — приватно, без аккаунта."],
      ["headset", "Поддержка", "Есть вопрос? Отвечаем в течение часов."],
    ],
    revTitle: "Отзывы атлетов",
    rev: [
      ["Предтрен — огонь, энергии на всю тренировку. Доставили быстро.", "Максим К. · пауэрлифтинг"],
      ["Оригинал, честные дозировки. Беру протеин и креатин только тут.", "Елена Р. · кроссфит"],
      ["Оплатил в USDT, заказ отслеживался, пришёл запечатанным. Беру ещё.", "Дмитрий В. · бодибилдинг"],
    ],
  },
};
const L = () => COPY[getLang()] || COPY.en;

function stockBadge(p) {
  if (p.stock <= 0) return `<span class="badge badge--out">${t("sold_out")}</span>`;
  if (p.stock <= 5) return `<span class="badge badge--low">${t("only_left", { n: p.stock })}</span>`;
  return "";
}

function card(p) {
  const img = p.images?.[0]
    ? `<img src="${p.images[0]}" alt="${esc(p.name)}" loading="lazy">`
    : placeholder();
  const out = p.stock <= 0;
  return `
  <article class="card reveal" data-id="${p.id}">
    <a class="card__media" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">
      ${img}
      ${stockBadge(p) ? `<span style="position:absolute;top:12px;left:12px">${stockBadge(p)}</span>` : ""}
      <div class="card__quick">
        <button class="btn btn--primary btn--block btn--sm add-btn" data-id="${p.id}" ${out ? "disabled" : ""}>
          ${icon("cart", 16)} ${out ? t("sold_out") : t("add_to_cart")}
        </button>
      </div>
    </a>
    <div class="card__body">
      <span class="card__cat">${esc(p.category)}</span>
      <a class="card__title" href="product.html?id=${p.id}">${esc(p.name)}</a>
      <div class="card__foot">
        <span class="price price--sm">${money(p.price)}</span>
        <a class="navlink" href="product.html?id=${p.id}" aria-label="${t("add_to_cart")}">${icon("arrowRight", 18)}</a>
      </div>
    </div>
  </article>`;
}

function apply() {
  let list = ALL.slice();
  if (state.cat !== "all") list = list.filter((p) => p.category === state.cat);
  if (state.q.trim()) {
    const q = state.q.toLowerCase();
    list = list.filter((p) => (p.name + " " + p.description + " " + p.category).toLowerCase().includes(q));
  }
  if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  count.textContent = t("items_label", { n: list.length });
  if (!list.length) {
    grid.className = "";
    grid.innerHTML = `<div class="empty">${icon("search", 44)}<h3>${t("nothing_found")}</h3><p>${t("nothing_found_desc")}</p></div>`;
    return;
  }
  grid.className = "grid-products";
  grid.innerHTML = list.map(card).join("");
  revealOnScroll();
}

async function init() {
  mountChrome("index.html");

  const cats = ["all", ...SITE.categories];
  const l = L();
  document.getElementById("app").innerHTML = `
    <section class="hero">
      <div class="hero__bg">
        <img class="photo" src="assets/img/bg/gym-hero.jpg" alt="" aria-hidden="true" loading="eager">
        <div class="hero__scrim"></div>
        <span class="glow glow-1"></span><span class="glow glow-2"></span>
        <div class="grid"></div>
        <svg class="bolt" viewBox="0 0 220 640" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs><linearGradient id="blt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2,#d946ef)"/>
          </linearGradient></defs>
          <path d="M138 0 L70 250 L128 250 L48 640 L104 300 L52 300 Z" fill="url(#blt)" fill-opacity="0.18" stroke="url(#blt)" stroke-width="3"/>
        </svg>
      </div>
      <div class="hero__grid reveal in">
        <div class="hero__main">
          <span class="eyebrow">${esc(SITE.name)} · ${t("hero_eyebrow_suffix")}</span>
          <h1 style="margin-top:16px">${t("hero_title")}</h1>
          <p style="margin-top:18px">${t("hero_desc")}</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="#catalog">${icon("bag", 18)} ${t("hero_cta_shop")}</a>
            <a class="btn btn--ghost btn--lg" href="admin.html">${icon("shield", 18)} ${t("hero_cta_seller")}</a>
          </div>
          <div class="proof">
            <div class="proof__num">1.3<span>K</span></div>
            <div class="proof__meta">
              <div class="avatars">
                <span class="av" style="background:#7c3aed">MK</span>
                <span class="av" style="background:#db2777">ER</span>
                <span class="av" style="background:#0891b2">DV</span>
                <a class="more" href="reviews.html">+ ${l.more}</a>
              </div>
              <span class="proof__label">${l.proofLabel}</span>
            </div>
          </div>
        </div>
        <div class="hero__side">
          ${l.ben.map(([ic, ttl]) => `<div class="pill"><span class="pill__ic">${icon("check", 15)}</span> ${ttl}</div>`).join("")}
        </div>
      </div>
    </section>

    <section id="catalog" class="section" style="padding-top:0">
      <div class="toolbar">
        <div class="field search">${icon("search", 18)}<input class="input" id="q" type="search" placeholder="${t("search_ph")}" aria-label="${t("search_ph")}"></div>
        <select class="select" id="cat" aria-label="${t("cat_all")}">
          ${cats.map((c) => `<option value="${c}">${c === "all" ? t("cat_all") : esc(c)}</option>`).join("")}
        </select>
        <select class="select" id="sort" aria-label="${t("sort_new")}">
          <option value="new">${t("sort_new")}</option>
          <option value="price-asc">${t("sort_price_asc")}</option>
          <option value="price-desc">${t("sort_price_desc")}</option>
        </select>
        <span class="muted" id="count" style="margin-left:auto;font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.08em"></span>
      </div>
      <div id="grid" class="grid-products" aria-busy="true">${skeletonCards(8)}</div>
    </section>

    <section class="section reveal">
      <div class="section-head"><h2>${l.revTitle}</h2><span class="rule"></span></div>
      <div class="reviews">
        ${l.rev.map(([txt, name]) => `<div class="review"><div class="review__stars">★★★★★</div><p class="review__text">${txt}</p><div class="review__name">${name}</div></div>`).join("")}
      </div>
    </section>`;

  document.getElementById("q").addEventListener("input", (e) => { state.q = e.target.value; apply(); });
  document.getElementById("cat").addEventListener("change", (e) => { state.cat = e.target.value; apply(); });
  document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; apply(); });

  document.getElementById("grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    e.preventDefault();
    const p = ALL.find((x) => x.id === btn.dataset.id);
    if (!p || p.stock <= 0) return;
    Cart.add({ id: p.id, name: p.name, price: p.price, image: p.images?.[0] || "", stock: p.stock });
    toast(t("added_toast", { name: p.name }));
  });

  const grid = document.getElementById("grid");
  try {
    ALL = await getPublishedProducts();
  } catch (err) {
    grid.removeAttribute("aria-busy");
    grid.className = "";
    grid.innerHTML = `<div class="empty">${icon("box", 44)}<h3>${t("nothing_found")}</h3><p style="max-width:38ch;margin-inline:auto">${esc(err.message || String(err))}</p><button class="btn btn--primary" style="margin-top:16px" onclick="location.reload()">${icon("arrowRight", 16)} ${t("start_shopping")}</button></div>`;
    return;
  }
  grid.removeAttribute("aria-busy");
  const inStock = ALL.reduce((n, p) => n + (p.stock > 0 ? p.stock : 0), 0);
  const heroCount = document.getElementById("heroCount");
  if (heroCount) heroCount.textContent = inStock;
  apply();
  revealOnScroll();
}

init();
