import { SITE, ORDER_STATUSES } from "../config.js?v=2";
import { getProducts, saveProduct, deleteProduct, getOrders, updateOrderStatus, deleteOrder, getTickets, deleteTicket, ensureAdminSeed, exportProductsJSON, importProductsFromJSON } from "../db.js?v=2";
import { icon, money, esc, placeholder, initTheme, mountChrome, toast } from "../ui.js";

initTheme();

const SESSION_KEY = "mkt_admin_ok";
let tab = "products";
let editingImages = []; // data URLs for the product form

// ---- image downscale to keep IndexedDB light -------------------------------
function fileToResizedDataURL(file, max = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > max || h > max) {
          const r = Math.min(max / w, max / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const type = file.type === "image/png" && /alpha/.test("") ? "image/png" : "image/jpeg";
        resolve(c.toDataURL(type, quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
//  LOGIN GATE
// ---------------------------------------------------------------------------
function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="max-width:400px;margin:8vh auto 0" class="reveal">
      <div class="panel">
        <div style="text-align:center;margin-bottom:var(--space-5)">
          <div class="confirm-check" style="margin-bottom:12px">${icon("lock", 30)}</div>
          <h1 style="font-size:1.8rem">Seller dashboard</h1>
          <p class="muted" style="font-size:.9rem">Enter the admin password to manage products and orders.</p>
        </div>
        <form id="loginForm" class="form-grid">
          <div class="field" data-field="pw">
            <label class="label" for="pw">Password</label>
            <input class="input" id="pw" type="password" placeholder="••••••••" autofocus>
            <div class="error-text"></div>
          </div>
          <button class="btn btn--primary btn--block btn--lg" type="submit">${icon("shield", 18)} Enter dashboard</button>
          <p class="hint" style="text-align:center">Dev tool — default password is set in <code>assets/js/config.js</code>.</p>
        </form>
      </div>
    </div>`;
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = document.getElementById("pw").value;
    if (pw === SITE.adminPassword) {
      sessionStorage.setItem(SESSION_KEY, "1");
      renderDashboard();
    } else {
      document.querySelector('[data-field="pw"]').classList.add("field--invalid");
      document.querySelector('[data-field="pw"] .error-text').textContent = "Incorrect password.";
      toast("Incorrect password", "err");
    }
  });
}

// ---------------------------------------------------------------------------
//  DASHBOARD SHELL
// ---------------------------------------------------------------------------
function renderDashboard() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:var(--space-5)">
      <div>
        <span class="eyebrow">${esc(SITE.name)}</span>
        <h1 style="font-size:2.2rem">Seller dashboard</h1>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="tabs" id="tabs">
          <button class="tab is-active" data-tab="products">Products</button>
          <button class="tab" data-tab="orders">Orders</button>
          <button class="tab" data-tab="support">Support</button>
        </div>
        <button class="btn btn--ghost btn--sm" id="logout">Log out</button>
      </div>
    </div>
    <div id="panel"></div>`;

  document.getElementById("tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    tab = b.dataset.tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t === b));
    if (tab === "products") renderProducts();
    else if (tab === "orders") renderOrders();
    else renderTickets();
  });
  document.getElementById("logout").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    renderLogin();
  });

  renderProducts();
}

// ---------------------------------------------------------------------------
//  PRODUCTS TAB
// ---------------------------------------------------------------------------
function dbErrorHTML(err) {
  return `<div class="empty">${icon("box", 44)}<h3>Couldn’t load data</h3><p style="max-width:40ch;margin-inline:auto">${esc(err.message || String(err))}</p><button class="btn btn--primary" style="margin-top:16px" onclick="location.reload()">Reload</button></div>`;
}

async function renderProducts() {
  const panel = document.getElementById("panel");
  let products;
  try {
    await ensureAdminSeed();
    products = await getProducts();
  } catch (err) {
    panel.innerHTML = dbErrorHTML(err);
    return;
  }
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:var(--space-3)">
      <p class="muted">${products.length} product${products.length === 1 ? "" : "s"}</p>
      <div class="row-actions" style="flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" id="importBtn">${icon("upload", 15)} Import</button>
        <button class="btn btn--ghost btn--sm" id="exportBtn">${icon("box", 15)} Export products.json</button>
        <button class="btn btn--primary btn--sm" id="newBtn">${icon("plus", 16)} Add product</button>
        <input type="file" id="importFile" accept="application/json,.json" hidden>
      </div>
    </div>
    <div class="alert alert--info" style="margin-bottom:var(--space-4);font-size:.82rem">${icon("shield", 14)} <span>To publish to the live site: <b>Export products.json</b> → replace <code>data/products.json</code> in your repo → commit &amp; push.</span></div>
    ${products.length ? `
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td>${p.images?.[0] ? `<img class="thumb-xs" src="${p.images[0]}" alt="">` : `<div class="thumb-xs"></div>`}</td>
              <td style="font-weight:600">${esc(p.name)}</td>
              <td><span class="badge">${esc(p.category)}</span></td>
              <td>${money(p.price)}</td>
              <td>${p.stock <= 0 ? '<span class="badge badge--out">0</span>' : p.stock <= 5 ? `<span class="badge badge--low">${p.stock}</span>` : p.stock}</td>
              <td><div class="row-actions">
                <button class="icon-btn edit" data-id="${p.id}" style="width:34px;height:34px" aria-label="Edit">${icon("edit", 15)}</button>
                <button class="icon-btn del" data-id="${p.id}" style="width:34px;height:34px" aria-label="Delete">${icon("trash", 15)}</button>
              </div></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>` : `<div class="empty">${icon("box", 44)}<h3>No products yet</h3><p>Add your first product to get started.</p></div>`}`;

  document.getElementById("newBtn").addEventListener("click", () => openProductModal(null));
  document.getElementById("exportBtn").addEventListener("click", async () => {
    const list = await getProducts();
    const blob = new Blob([exportProductsJSON(list)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("products.json downloaded — commit it to publish");
  });
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { await importProductsFromJSON(await file.text()); toast("Products imported"); renderProducts(); }
    catch (err) { toast("Import failed: " + err.message, "err"); }
  });
  panel.querySelectorAll(".edit").forEach((b) => b.addEventListener("click", async () => {
    const p = products.find((x) => x.id === b.dataset.id);
    openProductModal(p);
  }));
  panel.querySelectorAll(".del").forEach((b) => b.addEventListener("click", async () => {
    const p = products.find((x) => x.id === b.dataset.id);
    if (confirm(`Delete “${p.name}”? This cannot be undone.`)) {
      await deleteProduct(b.dataset.id);
      toast("Product deleted");
      renderProducts();
    }
  }));
}

// ---- product modal (create / edit) -----------------------------------------
function openProductModal(product) {
  editingImages = product ? [...(product.images || [])] : [];
  const isEdit = !!product;

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__head">
        <h2 style="font-family:var(--font-body);font-size:1.2rem;font-weight:600">${isEdit ? "Edit product" : "Add product"}</h2>
        <button class="icon-btn" id="mClose" aria-label="Close">${icon("close", 18)}</button>
      </div>
      <div class="modal__body">
        <form id="prodForm" class="form-grid">
          <div class="field" data-field="name">
            <label class="label">Name <span class="req">*</span></label>
            <input class="input" name="name" value="${esc(product?.name || "")}" placeholder="Product name">
            <div class="error-text"></div>
          </div>
          <div class="field">
            <label class="label">Description</label>
            <textarea class="textarea" name="description" placeholder="Describe the product…">${esc(product?.description || "")}</textarea>
          </div>
          <div class="form-row">
            <div class="field" data-field="price">
              <label class="label">Price (${SITE.currency.code}) <span class="req">*</span></label>
              <input class="input" name="price" type="number" min="0" step="0.01" value="${product?.price ?? ""}" placeholder="0.00">
              <div class="error-text"></div>
            </div>
            <div class="field">
              <label class="label">Stock quantity</label>
              <input class="input" name="stock" type="number" min="0" step="1" value="${product?.stock ?? 0}">
            </div>
          </div>
          <div class="field">
            <label class="label">Category</label>
            <select class="select" name="category">
              ${SITE.categories.map((c) => `<option ${product?.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label class="label">Photos</label>
            <div class="uploader" id="uploader">
              ${icon("upload", 26)}
              <div style="margin-top:8px;font-weight:600">Click or drop images here</div>
              <div class="hint">JPG/PNG · first image is the cover · drag thumbnails to reorder</div>
              <input type="file" id="fileInput" accept="image/*" multiple hidden>
            </div>
            <div class="thumbs" id="thumbs"></div>
          </div>
        </form>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" id="mCancel">Cancel</button>
        <button class="btn btn--primary" id="mSave">${icon("check", 16)} ${isEdit ? "Save changes" : "Create product"}</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.getElementById("mClose").addEventListener("click", close);
  document.getElementById("mCancel").addEventListener("click", close);

  // ---- image handling ----
  const fileInput = document.getElementById("fileInput");
  const uploader = document.getElementById("uploader");
  uploader.addEventListener("click", () => fileInput.click());
  ["dragover", "dragenter"].forEach((ev) => uploader.addEventListener(ev, (e) => { e.preventDefault(); uploader.classList.add("is-drag"); }));
  ["dragleave", "drop"].forEach((ev) => uploader.addEventListener(ev, (e) => { e.preventDefault(); uploader.classList.remove("is-drag"); }));
  uploader.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

  async function handleFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    for (const f of files) {
      try { editingImages.push(await fileToResizedDataURL(f)); }
      catch { toast("Couldn’t read an image", "err"); }
    }
    renderThumbs();
  }

  function renderThumbs() {
    const wrap = document.getElementById("thumbs");
    wrap.innerHTML = editingImages.map((src, i) => `
      <div class="thumb" draggable="true" data-i="${i}">
        <img src="${src}" alt="">
        ${i === 0 ? `<span class="thumb__main">COVER</span>` : ""}
        <button type="button" class="thumb__del" data-i="${i}" aria-label="Remove">✕</button>
      </div>`).join("");

    wrap.querySelectorAll(".thumb__del").forEach((b) =>
      b.addEventListener("click", () => { editingImages.splice(+b.dataset.i, 1); renderThumbs(); }));

    // drag to reorder
    let dragI = null;
    wrap.querySelectorAll(".thumb").forEach((t) => {
      t.addEventListener("dragstart", () => { dragI = +t.dataset.i; t.classList.add("dragging"); });
      t.addEventListener("dragend", () => t.classList.remove("dragging"));
      t.addEventListener("dragover", (e) => e.preventDefault());
      t.addEventListener("drop", (e) => {
        e.preventDefault();
        const dropI = +t.dataset.i;
        if (dragI === null || dragI === dropI) return;
        const [moved] = editingImages.splice(dragI, 1);
        editingImages.splice(dropI, 0, moved);
        renderThumbs();
      });
    });
  }
  renderThumbs();

  // ---- save ----
  document.getElementById("mSave").addEventListener("click", async () => {
    const form = document.getElementById("prodForm");
    let ok = true;
    const nameField = form.querySelector('[data-field="name"]');
    const priceField = form.querySelector('[data-field="price"]');
    const setErr = (field, msg) => { field.classList.toggle("field--invalid", !!msg); field.querySelector(".error-text").textContent = msg; };

    if (!form.name.value.trim()) { setErr(nameField, "Name is required."); ok = false; } else setErr(nameField, "");
    if (form.price.value === "" || +form.price.value < 0) { setErr(priceField, "Enter a valid price."); ok = false; } else setErr(priceField, "");
    if (!ok) return;

    await saveProduct({
      id: product?.id,
      createdAt: product?.createdAt,
      name: form.name.value,
      description: form.description.value,
      price: +form.price.value,
      stock: +form.stock.value || 0,
      category: form.category.value,
      images: editingImages,
    });
    toast(isEdit ? "Product updated" : "Product created");
    close();
    renderProducts();
  });
}

// ---------------------------------------------------------------------------
//  ORDERS TAB
// ---------------------------------------------------------------------------
function statusClass(s) {
  return {
    "Pending payment": "status--pending", "Payment received": "status--paid",
    Processing: "status--processing", Shipped: "status--shipped",
    Completed: "status--completed", Cancelled: "status--cancelled",
  }[s] || "status--pending";
}

function contactsCell(customer) {
  const list = customer.contacts && Object.keys(customer.contacts).length
    ? customer.contacts
    : (customer.facebook ? { facebook: customer.facebook } : {});
  const rows = SITE.checkoutContacts
    .filter((m) => list[m.id])
    .map((m) => `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span class="muted" style="font-size:.68rem">${esc(m.label)}:</span> ${esc(list[m.id])}</div>`);
  return rows.length ? rows.join("") : '<span class="muted">—</span>';
}

async function renderOrders() {
  const panel = document.getElementById("panel");
  let orders;
  try { orders = await getOrders(); } catch (err) { panel.innerHTML = dbErrorHTML(err); return; }
  panel.innerHTML = `
    <p class="muted" style="margin-bottom:var(--space-4)">${orders.length} order${orders.length === 1 ? "" : "s"}</p>
    ${orders.length ? `
    <div class="table-wrap">
      <table class="data">
        <thead><tr>
          <th>Order</th><th>Items</th><th>Total</th><th>Address</th><th>Country</th>
          <th>Phone</th><th>Contacts</th><th>Coin</th><th>TX hash</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          ${orders.map((o) => `
            <tr>
              <td><b>#${o.id.slice(0, 6).toUpperCase()}</b><br><small class="muted">${esc(new Date(o.createdAt).toLocaleDateString())}</small></td>
              <td style="max-width:200px">${o.items.map((i) => `${esc(i.name)} ×${i.qty}`).join("<br>")}</td>
              <td><b>${money(o.total)}</b></td>
              <td style="max-width:180px;white-space:pre-wrap">${esc([o.customer.address, o.customer.city, o.customer.zip].filter(Boolean).join(", "))}</td>
              <td>${esc(o.customer.countryName || o.customer.country || "")}${o.customer.state ? " / " + esc(o.customer.state) : ""}</td>
              <td>${esc(o.customer.phone)}</td>
              <td style="max-width:170px;font-size:.78rem">${contactsCell(o.customer)}</td>
              <td><span class="badge">${esc(o.payment.coin)}</span></td>
              <td style="max-width:140px;font-family:ui-monospace,monospace;font-size:.76rem;word-break:break-all">${esc(o.payment.txHash)}</td>
              <td>
                <span class="badge ${statusClass(o.status)}" style="margin-bottom:6px"><span class="status-dot"></span>${esc(o.status)}</span>
                <select class="select st-sel" data-id="${o.id}" style="padding:6px 26px 6px 10px;font-size:.8rem">
                  ${ORDER_STATUSES.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
                </select>
              </td>
              <td><button class="icon-btn del-order" data-id="${o.id}" style="width:34px;height:34px" aria-label="Delete">${icon("trash", 15)}</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>` : `<div class="empty">${icon("bag", 44)}<h3>No orders yet</h3><p>Orders placed at checkout will appear here.</p></div>`}`;

  panel.querySelectorAll(".st-sel").forEach((sel) =>
    sel.addEventListener("change", async () => {
      await updateOrderStatus(sel.dataset.id, sel.value);
      toast("Order status updated");
      renderOrders();
    }));
  panel.querySelectorAll(".del-order").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm("Delete this order?")) { await deleteOrder(b.dataset.id); toast("Order deleted"); renderOrders(); }
    }));
}

// ---------------------------------------------------------------------------
//  SUPPORT TAB (messages submitted from the Support page)
// ---------------------------------------------------------------------------
async function renderTickets() {
  const panel = document.getElementById("panel");
  let tickets;
  try { tickets = await getTickets(); } catch (err) { panel.innerHTML = dbErrorHTML(err); return; }
  panel.innerHTML = `
    <p class="muted" style="margin-bottom:var(--space-4)">${tickets.length} message${tickets.length === 1 ? "" : "s"}</p>
    ${tickets.length ? `
    <div class="stack">
      ${tickets.map((tk) => `
        <div class="panel" style="padding:var(--space-4)">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
            <div style="min-width:0">
              <div style="font-weight:600">${esc(tk.subject || "(no subject)")}</div>
              <div class="muted" style="font-size:.82rem">${esc(tk.name)} · <a href="mailto:${esc(tk.email)}" style="color:var(--accent-ink)">${esc(tk.email)}</a> · ${esc(new Date(tk.createdAt).toLocaleString())}${tk.lang ? ` · ${esc(String(tk.lang).toUpperCase())}` : ""}</div>
            </div>
            <button class="icon-btn del-ticket" data-id="${tk.id}" style="width:34px;height:34px" aria-label="Delete">${icon("trash", 15)}</button>
          </div>
          <p style="margin-top:10px;white-space:pre-wrap">${esc(tk.message)}</p>
        </div>`).join("")}
    </div>` : `<div class="empty">${icon("chat", 44)}<h3>No messages yet</h3><p>Messages from the Support page appear here.</p></div>`}`;

  panel.querySelectorAll(".del-ticket").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm("Delete this message?")) { await deleteTicket(b.dataset.id); toast("Message deleted"); renderTickets(); }
    }));
}

// ---------------------------------------------------------------------------
mountChrome("admin.html");
if (sessionStorage.getItem(SESSION_KEY)) renderDashboard();
else renderLogin();
