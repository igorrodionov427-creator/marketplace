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

## Hosting on GitHub Pages (full functionality on a static host)

GitHub Pages is static — it can't run a server or store data centrally. Two pieces make
the store work for real anyway:

**1. Shared catalog — `data/products.json`**
Every visitor's catalog is read from `data/products.json` in the repo, so everyone sees the
same products. To change the catalog: open **Admin → Products**, edit, click **Export
products.json**, replace `data/products.json` in the repo, then commit & push. (The admin's
own view is a local workspace; only the committed JSON is public.)

**2. Orders & support reach you — Telegram**
Because a static site can't store incoming orders, each order and support message is sent to
you on Telegram. Configure it in `assets/js/config.js` → `SITE.telegram`:
1. Telegram → **@BotFather** → `/newbot` → copy the **bot token**.
2. Telegram → **@userinfobot** → copy your numeric **Id** (chatId).
3. Send your new bot any message once (so it may write to you).
4. Set `enabled: true` and paste `botToken` + `chatId`.
Orders and support messages then arrive in your Telegram. (Orders are still saved to the
buyer's browser too, but Telegram is how they reach you across devices.)

> The bot token is visible in the page source — use a dedicated bot and rotate it in
> @BotFather if it leaks.

**Enable Pages:** repo **Settings → Pages → Deploy from a branch → `main` / root**. The custom
`404.html` is served automatically for unknown paths.

## Notes / limits

- The admin password is a lightweight client-side gate — **not real security** (it's visible in
  the source of a public site). Use a throwaway value.
- The buyer's cart and any admin-only edits live in **that browser**. The shared catalog is the
  committed `data/products.json`; orders/support reach you via Telegram.
- Payment verification is manual: orders start as **“Pending payment”**; confirm the transaction
  hash yourself and update the status in the dashboard.
