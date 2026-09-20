import { SITE } from "../config.js?v=2";
import { ensureSeed, getProducts, upgradeSeedImages } from "../db.js?v=2";
import { Cart } from "../store.js";
import { icon, money, esc, placeholder, initTheme, mountChrome, revealOnScroll, toast, skeletonCards } from "../ui.js";
import { t } from "../i18n.js";

initTheme();

let ALL = [];
const state = { q: "", cat: "all", sort: "new" };

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
  document.getElementById("app").innerHTML = `
    <section class="hero">
      <div class="hero__grid reveal in">
        <div>
          <span class="eyebrow">${esc(SITE.name)} · ${t("hero_eyebrow_suffix")}</span>
          <h1 style="margin-top:14px">${t("hero_title")}</h1>
          <p style="margin-top:16px">${t("hero_desc")}</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="#catalog">${icon("bag", 18)} ${t("hero_cta_shop")}</a>
            <a class="btn btn--ghost btn--lg" href="admin.html">${icon("shield", 18)} ${t("hero_cta_seller")}</a>
          </div>
        </div>
        <aside class="hero__aside">
          <div class="hero__stat"><b id="heroCount" style="font-feature-settings:'tnum'">—</b><span>${t("stat_pieces")}</span></div>
          <div class="hero__stat"><b>${SITE.categories.length}</b><span>${t("stat_categories")}</span></div>
          <div class="hero__stat"><b>BTC·ETH·USDT</b><span>${t("stat_settled")}</span></div>
        </aside>
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
    await ensureSeed();
    await upgradeSeedImages();
    ALL = await getProducts();
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
