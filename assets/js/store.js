// =============================================================================
//  store.js — cart persistence (localStorage) + pub/sub
// =============================================================================
const KEY = "mkt_cart_v1";
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  listeners.forEach((fn) => fn(items));
}

export const Cart = {
  items: read,

  count() {
    return read().reduce((n, i) => n + i.qty, 0);
  },

  subtotal() {
    return read().reduce((s, i) => s + i.price * i.qty, 0);
  },

  // item: { id, name, price, image, stock }
  add(item, qty = 1) {
    const items = read();
    const found = items.find((i) => i.id === item.id);
    const max = Number.isFinite(item.stock) ? item.stock : Infinity;
    if (found) {
      found.qty = Math.min(found.qty + qty, max);
    } else {
      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || "",
        stock: item.stock,
        qty: Math.min(qty, max),
      });
    }
    write(items);
  },

  setQty(id, qty) {
    let items = read();
    const it = items.find((i) => i.id === id);
    if (!it) return;
    const max = Number.isFinite(it.stock) ? it.stock : Infinity;
    it.qty = Math.max(1, Math.min(qty, max));
    write(items);
  },

  remove(id) {
    write(read().filter((i) => i.id !== id));
  },

  clear() {
    write([]);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// keep tabs/windows in sync
window.addEventListener("storage", (e) => {
  if (e.key === KEY) listeners.forEach((fn) => fn(read()));
});
