import { getPublishedProduct, getPublishedProducts } from "../db.js?v=2";
import { Cart } from "../store.js";
import { icon, money, esc, placeholder, initTheme, mountChrome, revealOnScroll, toast, qs } from "../ui.js";
import { t } from "../i18n.js";

initTheme();

function stockLine(p) {
  if (p.stock <= 0) return `<span class="badge badge--out">${icon("box", 14)} ${t("sold_out")}</span>`;
  if (p.stock <= 5) return `<span class="badge badge--low">${icon("box", 14)} ${t("only_left", { n: p.stock })}</span>`;
  return `<span class="badge badge--stock">${icon("check", 14)} ${t("in_stock")}</span>`;
}

async function relatedStrip(current) {
  const all = await getPublishedProducts();
  const rel = all.filter((p) => p.id !== current.id && p.category === current.category).slice(0, 4);
  const pool = rel.length ? rel : all.filter((p) => p.id !== current.id).slice(0, 4);
  if (!pool.length) return "";
  return `
    <section class="section reveal">
      <h2 style="font-size:1.8rem;margin-bottom:var(--space-5)">${t("you_may_like")}</h2>
      <div class="grid-products">
        ${pool.map((p) => `
          <a class="card" href="product.html?id=${p.id}">
            <div class="card__media">${p.images?.[0] ? `<img src="${p.images[0]}" alt="${esc(p.name)}" loading="lazy">` : placeholder()}</div>
            <div class="card__body">
              <span class="card__cat">${esc(p.category)}</span>
              <span class="card__title">${esc(p.name)}</span>
              <div class="card__foot"><span class="price price--sm">${money(p.price)}</span></div>
            </div>
          </a>`).join("")}
      </div>
    </section>`;
}

async function init() {
  mountChrome("index.html");
  const id = qs("id");
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="pdp" aria-busy="true">
      <div class="sk" style="aspect-ratio:1/1;border-radius:var(--r-card)"></div>
      <div>
        <div class="sk sk-line sh" style="margin:0 0 18px"></div>
        <div class="sk sk-line lg" style="height:34px;margin:0 0 18px;width:80%"></div>
        <div class="sk sk-line" style="margin:0 0 10px"></div>
        <div class="sk sk-line" style="margin:0 0 10px"></div>
        <div class="sk sk-line sh" style="margin:0 0 28px"></div>
        <div class="sk" style="height:48px;width:220px;border-radius:var(--r-pill)"></div>
      </div>
    </div>`;
  const p = id ? await getPublishedProduct(id) : null;

  if (!p) {
    app.innerHTML = `<div class="empty">${icon("box", 44)}<h3>${t("prod_not_found")}</h3><p>${t("prod_not_found_desc")}</p><a class="btn btn--primary" href="index.html" style="margin-top:16px">${icon("arrowLeft", 16)} ${t("back_to_catalog")}</a></div>`;
    return;
  }

  const imgs = p.images?.length ? p.images : [];
  const mainImg = imgs[0] ? `<img id="mainImg" src="${imgs[0]}" alt="${esc(p.name)}">` : placeholder();
  const out = p.stock <= 0;

  app.innerHTML = `
    <a class="navlink" href="index.html" style="display:inline-flex;gap:6px;align-items:center;margin-bottom:var(--space-4)">${icon("arrowLeft", 16)} ${t("back_to_catalog")}</a>
    <div class="pdp reveal">
      <div>
        <div class="gallery__main">${mainImg}</div>
        ${imgs.length > 1 ? `<div class="gallery__thumbs" id="thumbs">
          ${imgs.map((src, i) => `<button class="gallery__thumb${i === 0 ? " is-active" : ""}" data-src="${src}" data-i="${i}"><img src="${src}" alt="View ${i + 1}"></button>`).join("")}
        </div>` : ""}
      </div>
      <div class="stack">
        <span class="card__cat">${esc(p.category)}</span>
        <h1 class="pdp__title">${esc(p.name)}</h1>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <span class="price">${money(p.price)}</span>
          ${stockLine(p)}
        </div>
        <p class="muted" style="white-space:pre-line">${esc(p.description)}</p>
        <div class="hr" style="margin-block:var(--space-3)"></div>
        <div style="display:flex;gap:var(--space-4);align-items:center;flex-wrap:wrap">
          <div class="qty" ${out ? 'style="opacity:.5;pointer-events:none"' : ""}>
            <button id="minus" aria-label="Decrease">−</button>
            <input id="qty" type="number" value="1" min="1" max="${Math.max(1, p.stock)}" aria-label="Quantity">
            <button id="plus" aria-label="Increase">+</button>
          </div>
          <button class="btn btn--primary btn--lg" id="addBtn" ${out ? "disabled" : ""} style="flex:1;min-width:200px">
            ${icon("cart", 18)} ${out ? t("sold_out") : t("add_to_cart")}
          </button>
        </div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:8px" class="muted">
          <span style="display:inline-flex;gap:6px;align-items:center">${icon("truck", 16)} ${t("ships_worldwide")}</span>
          <span style="display:inline-flex;gap:6px;align-items:center">${icon("shield", 16)} ${t("crypto_secured")}</span>
        </div>
      </div>
    </div>
    <div id="related"></div>`;

  // gallery switching
  const thumbs = document.getElementById("thumbs");
  if (thumbs) {
    thumbs.addEventListener("click", (e) => {
      const b = e.target.closest(".gallery__thumb");
      if (!b) return;
      document.getElementById("mainImg").src = b.dataset.src;
      thumbs.querySelectorAll(".gallery__thumb").forEach((el) => el.classList.remove("is-active"));
      b.classList.add("is-active");
    });
  }

  // qty
  const qty = document.getElementById("qty");
  const clamp = () => {
    let v = parseInt(qty.value, 10);
    if (!Number.isFinite(v) || v < 1) v = 1;
    if (v > p.stock) v = p.stock;
    qty.value = v;
  };
  document.getElementById("minus")?.addEventListener("click", () => { qty.value = Math.max(1, (+qty.value || 1) - 1); });
  document.getElementById("plus")?.addEventListener("click", () => { qty.value = Math.min(p.stock, (+qty.value || 1) + 1); clamp(); });
  qty?.addEventListener("change", clamp);

  document.getElementById("addBtn")?.addEventListener("click", () => {
    if (out) return;
    clamp();
    Cart.add({ id: p.id, name: p.name, price: p.price, image: imgs[0] || "", stock: p.stock }, +qty.value || 1);
    toast(t("added_toast", { name: `${qty.value} × ${p.name}` }));
  });

  document.getElementById("related").innerHTML = await relatedStrip(p);
  revealOnScroll();
}

init();
