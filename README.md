# {{MARKETPLACE_NAME}} — Marketplace

A premium, zero-install marketplace web app. Runs entirely in the browser — no Node.js,
no build step, no external services. Catalog, cart, guest crypto checkout, and a seller
dashboard, with all data stored locally in the browser (IndexedDB + localStorage).

## Run it

**Easiest:** double-click **`start.bat`** — it launches a local server and opens the site.

**Or manually** (Python is already installed on this machine):

```bash
cd marketplace
py -m http.server 5173
```

Then open **http://localhost:5173/index.html**

> ⚠️ Open it via `http://localhost`, not by double-clicking the HTML file — browsers block
> ES-modules and IndexedDB on the `file://` protocol.

## User journey

1. **Catalog** (`index.html`) — search, filter by category, sort, add to cart.
2. **Product** (`product.html?id=…`) — photo gallery, quantity, add to cart.
3. **Cart** (`cart.html`) — change quantities, remove, see the total (persists between sessions).
4. **Checkout** (`checkout.html`) — guest form: address, US state, Facebook, phone;
   pick BTC / ETH / USDT → wallet address + QR code appears; paste the transaction hash; validate & place order.
5. **Confirmation** (`order.html?id=…`) — order summary and status.
6. **Admin** (`admin.html`) — password gate, product CRUD with multi-image upload
   (preview, delete, drag-to-reorder), and an orders table with all buyer data + status control.

## Change these in ONE place — `assets/js/config.js`

| What | Where |
|------|-------|
| **Marketplace name** (`{{MARKETPLACE_NAME}}`) | `SITE.name` — injected into header, footer, `<title>`, meta everywhere |
| **Crypto wallet addresses** (currently placeholders) | `SITE.wallets[].address` |
| **Admin password** (default `admin123`) | `SITE.adminPassword` |
| **Categories** | `SITE.categories` |

The wallet addresses shipped here are **obvious placeholders** — replace them with your real
addresses before going live.

## Tech

- Vanilla ES modules (no framework, no build) · CSS design system with dark/light themes
- IndexedDB for products & orders · localStorage for cart & theme
- `qrcode-generator` (MIT, vendored in `assets/js/vendor/`) for payment QR codes
- Design system "Editorial Atelier": light-first + true dark theme, Playfair Display + Inter + JetBrains Mono (system fallbacks if offline), restrained bronze accent, skeleton/empty/error states, stagger reveal, `prefers-reduced-motion` honored

## Notes / limits

- The admin password is a lightweight client-side gate for a local/dev tool — **not real security**.
- Data lives in **this browser only**. Different browser or cleared site data = fresh start.
- Payment verification is manual: orders start as **“Pending payment”**; confirm the transaction
  hash yourself and update the status in the dashboard.
