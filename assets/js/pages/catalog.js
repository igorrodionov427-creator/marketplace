import { SITE } from "../config.js?v=2";
import { getPublishedProducts } from "../db.js?v=2";
import { Cart } from "../store.js";
import { icon, money, esc, placeholder, initTheme, mountChrome, revealOnScroll, toast, skeletonCards, flyToCart } from "../ui.js";
import { t, getLang } from "../i18n.js";

initTheme();

let ALL = [];
const state = { q: "", cat: "all", sort: "new" };

// Landing sections copy (EN/RU; other languages fall back to EN)
const COPY = {
  en: {
    proofLabel: "Reviews worldwide", more: "More",
    toonKicker: "PEAKR SUPPLEMENTS",
    toonDesc: "Lab-tested fuel for lifters, runners and everyday athletes. Genuine brands, honest doses, crypto checkout. Order now and hit your peak.",
    discover: "DISCOVER IT",
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
    toonKicker: "PEAKR СПОРТПИТ",
    toonDesc: "Проверенное топливо для лифтеров, бегунов и любителей. Только оригинал, честные дозировки, оплата криптой. Закажи сейчас и выйди на пик.",
    discover: "СМОТРЕТЬ",
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

/* ---------- TOONHUB-style hero carousel ---------------------------------- */
// Featured rotation — each slot maps to a real product + its signature colours.
const FEATURED = [
  { id: "s1",  name: "Whey Protein Isolate", cat: "Protein",      img: "assets/img/products/whey-gold.png",   bg: "#B98B79", panel: "#F79B7F" },
  { id: "s2",  name: "Mass Gainer 5000",     cat: "Mass Gainers", img: "assets/img/products/muscle-grow.png", bg: "#7E9B88", panel: "#85CC92" },
  { id: "s3",  name: "Pre-Workout Blackout", cat: "Pre-Workout",  img: "assets/img/products/pump-serum.png",  bg: "#A98C9C", panel: "#ED9DC4" },
  { id: "s11", name: "PEAKR Whey 450g",      cat: "Protein",      img: "assets/img/products/peakr-whey.png",  bg: "#8496B0", panel: "#8DC4FF" },
];

function toonHeroHTML(l) {
  const items = FEATURED.map((f, i) => `
    <div class="toon__item" data-i="${i}">
      <img src="${f.img}" alt="${esc(f.name)}" draggable="false">
    </div>`).join("");
  return `
  <section class="toon" id="toon" style="background-color:${FEATURED[0].bg}">
    <div class="toon__stage">
      <div class="toon__grain"></div>
      <div class="toon__ghost" id="toonGhost">${esc(FEATURED[0].cat.toUpperCase())}</div>
      <div class="toon__carousel" id="toonCar">${items}</div>

      <div class="toon__info">
        <p class="toon__kicker" id="toonKicker">${esc(l.toonKicker)}</p>
        <p class="toon__name" id="toonName">${esc(FEATURED[0].name)}</p>
        <p class="toon__desc">${esc(l.toonDesc)}</p>
        <div class="toon__nav">
          <button class="toon__btn" id="toonPrev" aria-label="Previous">${icon("arrowLeft", 26)}</button>
          <button class="toon__btn" id="toonNext" aria-label="Next">${icon("arrowRight", 26)}</button>
        </div>
      </div>

      <a class="toon__discover" id="toonDiscover" href="product.html?id=${FEATURED[0].id}">
        <span>${esc(l.discover)}</span>${icon("arrowRight", 30)}
      </a>

      <div class="toon__dots" id="toonDots">
        ${FEATURED.map((_, i) => `<button class="toon__dot${i === 0 ? " on" : ""}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join("")}
      </div>
    </div>
  </section>`;
}

function initToon() {
  const section = document.getElementById("toon");
  const car = document.getElementById("toonCar");
  if (!section || !car) return;
  const ghost = document.getElementById("toonGhost");
  const nameEl = document.getElementById("toonName");
  const discover = document.getElementById("toonDiscover");
  const dots = [...document.querySelectorAll("#toonDots .toon__dot")];
  const items = [...car.querySelectorAll(".toon__item")];
  const N = items.length;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR = 820;

  let activeIndex = 0, isAnimating = false;
  let isMobile = window.innerWidth < 640;

  // preload
  FEATURED.forEach((f) => { const im = new Image(); im.src = f.img; });

  const Z = { center: 20, left: 10, right: 10, back: 5 };
  function styleFor(role) {
    if (role === "center") return {
      transform: `translateX(-50%) scale(${isMobile ? 1 : 1})`,
      filter: "none", opacity: "1", left: "50%",
      height: isMobile ? "44%" : "66%", bottom: isMobile ? "22%" : "4%",
    };
    if (role === "back") return {
      transform: "translateX(-50%) scale(1)", filter: "blur(4px)", opacity: "0.85", left: "50%",
      height: isMobile ? "13%" : "20%", bottom: isMobile ? "34%" : "16%",
    };
    // left / right
    const isLeft = role === "left";
    return {
      transform: "translateX(-50%) scale(1)", filter: "blur(2px)", opacity: "0.8",
      left: isMobile ? (isLeft ? "20%" : "80%") : (isLeft ? "26%" : "74%"),
      height: isMobile ? "16%" : "26%", bottom: isMobile ? "34%" : "16%",
    };
  }

  function roleOf(i) {
    if (i === activeIndex) return "center";
    if (i === (activeIndex + N - 1) % N) return "left";
    if (i === (activeIndex + 1) % N) return "right";
    return "back";
  }

  function render() {
    items.forEach((el, i) => {
      const role = roleOf(i);
      Object.assign(el.style, styleFor(role));
      el.style.zIndex = String(Z[role]);
    });
    const f = FEATURED[activeIndex];
    section.style.backgroundColor = f.bg;
    if (ghost) ghost.textContent = f.cat.toUpperCase();
    if (nameEl) nameEl.textContent = f.name;
    if (discover) discover.href = `product.html?id=${f.id}`;
    dots.forEach((d, i) => d.classList.toggle("on", i === activeIndex));
  }

  function goTo(i) {
    if (isAnimating || i === activeIndex) return;
    isAnimating = true;
    activeIndex = ((i % N) + N) % N;
    render();
    setTimeout(() => { isAnimating = false; }, reduce ? 0 : DUR);
  }
  function navigate(dir) {
    goTo(dir === "next" ? activeIndex + 1 : activeIndex - 1);
  }

  document.getElementById("toonPrev")?.addEventListener("click", () => navigate("prev"));
  document.getElementById("toonNext")?.addEventListener("click", () => navigate("next"));
  dots.forEach((d) => d.addEventListener("click", () => goTo(+d.dataset.i)));
  // click a side figurine to bring it forward
  items.forEach((el, i) => el.addEventListener("click", () => {
    const role = roleOf(i);
    if (role === "left") navigate("prev");
    else if (role === "right") navigate("next");
  }));

  // swipe the stage (touch + mouse) — TikTok-style direct manipulation
  let downX = null;
  const stage = section.querySelector(".toon__stage");
  stage.addEventListener("pointerdown", (e) => { downX = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (downX === null) return;
    const dx = e.clientX - downX; downX = null;
    if (Math.abs(dx) > 45) navigate(dx < 0 ? "next" : "prev");
  });
  stage.addEventListener("pointercancel", () => { downX = null; });

  window.addEventListener("resize", () => {
    const m = window.innerWidth < 640;
    if (m !== isMobile) { isMobile = m; render(); }
  });

  // autoplay — advances on its own, pauses on hover / touch / hidden tab
  const DELAY = 5000;
  let timer = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const play = () => { if (reduce) return; stop(); timer = setInterval(() => navigate("next"), DELAY); };
  section.addEventListener("pointerenter", stop);
  section.addEventListener("pointerleave", play);
  section.addEventListener("pointerdown", stop);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
  // manual controls reset the countdown
  ["toonPrev", "toonNext"].forEach((id) => document.getElementById(id)?.addEventListener("click", play));
  dots.forEach((d) => d.addEventListener("click", play));

  render();
  play();
}

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
  <article class="card" data-id="${p.id}">
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
  document.body.classList.add("home");

  const cats = ["all", ...SITE.categories];
  const l = L();
  document.getElementById("app").innerHTML = `
    ${toonHeroHTML(l)}

    <section id="catalog" class="section">
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

  initToon();

  // header turns solid once the coloured hero scrolls away
  const onScroll = () => document.body.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.72);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.getElementById("q").addEventListener("input", (e) => { state.q = e.target.value; apply(); });
  document.getElementById("cat").addEventListener("change", (e) => { state.cat = e.target.value; apply(); });
  document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; apply(); });

  document.getElementById("grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    e.preventDefault();
    const p = ALL.find((x) => x.id === btn.dataset.id);
    if (!p || p.stock <= 0) return;
    const src = btn.closest(".card")?.querySelector(".card__media img");
    if (src && p.images?.[0]) flyToCart(src, p.images[0]);
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
