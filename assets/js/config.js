// =============================================================================
//  SITE CONFIGURATION  —  EDIT EVERYTHING HERE, IN ONE PLACE
// =============================================================================
//
//  1. MARKETPLACE NAME
//     Change SITE.name below. It is injected automatically into the header,
//     footer, <title>, and <meta> tags on every page. The placeholder
//     "{{MARKETPLACE_NAME}}" is intentional — replace it with your brand.
//
//  2. CRYPTO WALLET ADDRESSES
//     Replace the placeholder addresses in SITE.wallets with your real ones.
//     These are shown to the buyer (with a QR code) at checkout.
//
//  3. ADMIN PASSWORD
//     Change SITE.adminPassword. NOTE: this is a lightweight, client-side gate
//     for a local/dev tool only — it is NOT real security.
//
// =============================================================================

export const SITE = {
  // ---- Branding -------------------------------------------------------------
  name: "PEAKR",
  tagline: "Curated goods. Private checkout. Crypto native.",
  metaDescription:
    "A premium marketplace with a curated catalog and fast, private crypto checkout.",

  // ---- Currency shown next to prices ---------------------------------------
  currency: { code: "USD", symbol: "$", locale: "en-US" },

  // ---- Crypto payment options ----------------------------------------------
  // `address` is displayed to the buyer and encoded into the QR code.
  // `uriScheme` builds a wallet-openable payment URI for the QR (optional).
  wallets: [
    {
      id: "BTC",
      name: "Bitcoin",
      symbol: "BTC",
      network: "Bitcoin (BTC)",
      address: "bc1qvw4l9vwlfef9jq67eqexgwvxqawzs52xhcpfu8",
      uriScheme: "bitcoin",
      accent: "#F7931A",
    },
    {
      id: "ETH",
      name: "Ethereum",
      symbol: "ETH",
      network: "Ethereum (ERC-20)",
      address: "0xf38f6A9057efb3D2be5eA956b597e6A7941E4DE9",
      uriScheme: "ethereum",
      accent: "#627EEA",
    },
    {
      id: "USDT",
      name: "Tether",
      symbol: "USDT",
      network: "TRC-20 · TRON",
      address: "TDSLPsDGvY5LTa2bUDeEBPGYbQA6p3Jfor",
      uriScheme: null, // plain-address QR
      accent: "#26A17B",
    },
    {
      id: "USDTSOL",
      name: "Tether",
      symbol: "USDT",
      network: "SPL · Solana",
      address: "AHjo5YaXJRsQavcND2N7CPyffimmdDVg64bMUGDHsAht",
      uriScheme: null, // plain-address QR
      accent: "#14F195",
      badge: "Low fee",
    },
    {
      id: "USDTBEP",
      name: "Tether",
      symbol: "USDT",
      network: "BEP20 · BNB Smart Chain",
      address: "0xf38f6A9057efb3D2be5eA956b597e6A7941E4DE9",
      uriScheme: null, // plain-address QR
      accent: "#F0B90B",
      // Note shown on the payment card. BEP20 fees are tiny but NOT zero — edit
      // this text freely (e.g. "No fee" / "Без комиссии") if you prefer.
      badge: "Low fee",
    },
  ],

  // ---- Admin ----------------------------------------------------------------
  adminPassword: "Igor281210@",

  // ---- Catalog categories (used by the admin product form + catalog filter) -
  categories: [
    "Protein",
    "Mass Gainers",
    "Pre-Workout",
    "Creatine",
    "Amino Acids",
    "Vitamins & Health",
    "Fat Burners",
    "Recovery",
    "Energy Bars",
    "Accessories",
    "Other",
  ],

  // ---- Optional contact methods shown at checkout (NOT required) ------------
  // Only the phone number is required; everything here is optional.
  // Names of apps are kept as-is; section titles/hints are translated.
  checkoutContacts: [
    { id: "email",     label: "Email",     type: "email", placeholder: "you@email.com",        icon: "mail" },
    { id: "whatsapp",  label: "WhatsApp",  type: "tel",   placeholder: "+1 555 000 0000",      icon: "phone" },
    { id: "telegram",  label: "Telegram",  type: "text",  placeholder: "@username",            icon: "send" },
    { id: "instagram", label: "Instagram", type: "text",  placeholder: "@handle",              icon: "camera" },
    { id: "facebook",  label: "Facebook",  type: "url",   placeholder: "facebook.com/you",     icon: "user" },
    { id: "signal",    label: "Signal",    type: "tel",   placeholder: "+1 555 000 0000",      icon: "shield" },
  ],

  // ---- Support page contact channels (edit these) --------------------------
  supportChannels: [
    { id: "email",    name: "Email",        value: "support@peakr.example", href: "mailto:support@peakr.example", icon: "mail" },
    { id: "telegram", name: "Telegram",     value: "@peakr_support",        href: "https://t.me/peakr_support",   icon: "send" },
    { id: "whatsapp", name: "WhatsApp",     value: "+1 (555) 010-2030",     href: "https://wa.me/15550102030",    icon: "phone" },
    { id: "phone",    name: "Phone (US/EU)", value: "+1 (555) 010-2030",    href: "tel:+15550102030",             icon: "phone" },
  ],

  // ---- Social media (edit links; shown in footer + on the Reviews page) ----
  socials: [
    { id: "instagram", name: "Instagram", href: "https://instagram.com/peakr", icon: "instagram" },
    { id: "telegram",  name: "Telegram",  href: "https://t.me/peakr",          icon: "send" },
    { id: "tiktok",    name: "TikTok",    href: "https://tiktok.com/@peakr",    icon: "tiktok" },
    { id: "youtube",   name: "YouTube",   href: "https://youtube.com/@peakr",   icon: "youtube" },
    { id: "x",         name: "X",         href: "https://x.com/peakr",          icon: "x" },
  ],

  // ---- Order & support delivery to the seller (works on static hosting) -----
  // On a static host the site can't store data server-side, so every order and
  // support message is sent to YOU on Telegram.
  //   1. In Telegram open @BotFather -> /newbot -> copy the bot token.
  //   2. Open @userinfobot -> copy your numeric "Id" (chatId).
  //   3. Send your bot any message once (so it can write to you).
  //   4. Paste both below and set enabled: true.
  // NOTE: the token is visible in the page source. Use a dedicated bot only for
  // this, and rotate it in @BotFather if it ever leaks.
  telegram: {
    enabled: true,
    botToken: "8691199293:AAGOC5xKEyU4PLM3EiJzeLvJAtnnxQVYyf8",
    chatId: "1376842675",
  },
};

// -----------------------------------------------------------------------------
//  US states — used by the checkout "State" dropdown.
// -----------------------------------------------------------------------------
export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

// -----------------------------------------------------------------------------
//  Delivery countries (edit freely). Russia is intentionally excluded.
//  If a country's code is "US", the checkout also shows the US state dropdown.
// -----------------------------------------------------------------------------
export const COUNTRIES = [
  ["US", "United States"],
  ["CA", "Canada"],
  ["GB", "United Kingdom"],
  ["IE", "Ireland"],
  ["DE", "Germany"],
  ["AT", "Austria"],
  ["CH", "Switzerland"],
  ["FR", "France"],
  ["BE", "Belgium"],
  ["NL", "Netherlands"],
  ["ES", "Spain"],
  ["PT", "Portugal"],
  ["IT", "Italy"],
  ["PL", "Poland"],
];

// -----------------------------------------------------------------------------
//  Order status vocabulary (used by admin + confirmation page).
// -----------------------------------------------------------------------------
export const ORDER_STATUSES = [
  "Pending payment",
  "Payment received",
  "Processing",
  "Shipped",
  "Completed",
  "Cancelled",
];
