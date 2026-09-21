import { Cart } from "../store.js";
import { SITE } from "../config.js?v=2";
import { icon, money, esc, placeholder, initTheme, mountChrome, toast, pageHero } from "../ui.js";
import { t } from "../i18n.js";

initTheme();

function line(i) {
  const img = i.image ? `<img src="${i.image}" alt="${esc(i.name)}">` : placeholder();
  return `
  <div class="cart-item" data-id="${i.id}">
    <a class="cart-item__img" href="product.html?id=${i.id}">${img}</a>
    <div>
      <a class="card__title" href="product.html?id=${i.id}">${esc(i.name)}</a>
      <div class="muted" style="font-size:.9rem">${money(i.price)} ${t("each")}</div>
      <button class="btn btn--danger btn--sm remove" data-id="${i.id}" style="margin-top:8px">${icon("trash", 14)} ${t("remove")}</button>
    </div>
    <div class="cart-item__ctrl" style="text-align:right;display:flex;flex-direction:column;gap:10px;align-items:flex-end">
      <div class="qty">
        <button class="dec" data-id="${i.id}" aria-label="Decrease">−</button>
        <input class="qty-in" data-id="${i.id}" type="number" value="${i.qty}" min="1" max="${i.stock ?? 99}" aria-label="Quantity">
        <button class="inc" data-id="${i.id}" aria-label="Increase">+</button>
      </div>
      <strong class="price--sm price">${money(i.price * i.qty)}</strong>
    </div>
  </div>`;
}

function render() {
  const app = document.getElementById("app");
  const items = Cart.items();

  if (!items.length) {
    app.innerHTML = `
      <div class="empty">${icon("cart", 46)}
        <h3>${t("cart_empty")}</h3>
        <p>${t("cart_empty_desc")}</p>
        <a class="btn btn--primary" href="index.html" style="margin-top:18px">${icon("bag", 16)} ${t("start_shopping")}</a>
      </div>`;
    return;
  }

  app.innerHTML = `
    ${pageHero({ eyebrow: `${SITE.name} · ${t("nav_cart")}`, title: t("your_cart"), color: "#B98B79" })}
    <div class="cart-layout">
      <div class="stack" id="lines">${items.map(line).join("")}</div>
      <aside class="summary">
        <h2 class="panel__title" style="font-size:1.1rem">${t("order_summary")}</h2>
        <div class="summary__row"><span>${t("items_word")} (${Cart.count()})</span><span>${money(Cart.subtotal())}</span></div>
        <div class="summary__row"><span>${t("shipping")}</span><span>${t("calc_checkout")}</span></div>
        <div class="summary__total"><span>${t("total")}</span><b>${money(Cart.subtotal())}</b></div>
        <a class="btn btn--primary btn--block btn--lg" href="checkout.html" style="margin-top:var(--space-4)">${icon("lock", 18)} ${t("secure_checkout")}</a>
        <a class="btn btn--ghost btn--block" href="index.html" style="margin-top:10px">${t("continue_shopping")}</a>
      </aside>
    </div>`;

  const lines = document.getElementById("lines");
  lines.addEventListener("click", (e) => {
    const rm = e.target.closest(".remove");
    const dec = e.target.closest(".dec");
    const inc = e.target.closest(".inc");
    if (rm) { Cart.remove(rm.dataset.id); toast(t("item_removed")); render(); }
    else if (dec) { const it = Cart.items().find((x) => x.id === dec.dataset.id); Cart.setQty(dec.dataset.id, it.qty - 1); render(); }
    else if (inc) { const it = Cart.items().find((x) => x.id === inc.dataset.id); Cart.setQty(inc.dataset.id, it.qty + 1); render(); }
  });
  lines.addEventListener("change", (e) => {
    const inp = e.target.closest(".qty-in");
    if (!inp) return;
    Cart.setQty(inp.dataset.id, parseInt(inp.value, 10) || 1);
    render();
  });
}

mountChrome("cart.html");
render();
