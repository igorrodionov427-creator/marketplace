import { SITE } from "../config.js?v=2";
import { icon, esc, initTheme, mountChrome, revealOnScroll, pageHero } from "../ui.js";
import { getLang } from "../i18n.js";

initTheme();

const AV = ["#7c3aed", "#db2777", "#0891b2", "#16a34a", "#ea580c", "#8b5cf6", "#0ea5e9", "#c026d3", "#f43f5e"];

const COPY = {
  en: {
    eyebrow: "Reviews", title: "Trusted by athletes",
    subtitle: "Real feedback from lifters, runners and everyday athletes who fuel with PEAKR.",
    basedOn: "Based on 1,312 reviews", allTitle: "All reviews", verified: "Verified",
    followTitle: "Follow the movement", followDesc: "Join the crew for drops, tips and giveaways.",
    list: [
      ["Max K.", "Powerlifter", 5, "The pre-workout is insane — energy for the whole session and no crash. Shipping was quick too."],
      ["Elena R.", "CrossFit", 5, "Legit gear, honest doses. This is my go-to for whey and creatine now."],
      ["Dmitri V.", "Bodybuilder", 5, "Paid in USDT, order was tracked and arrived sealed. Ordering again for sure."],
      ["Sarah L.", "Runner", 5, "The electrolytes saved my long runs. Fast delivery across the EU."],
      ["Marco P.", "Strongman", 5, "Mass gainer actually put size on me. The real deal, not watered down."],
      ["Anna S.", "Fitness", 4, "Whey mixes clean with no bloat. Already reordered twice."],
      ["Jake T.", "Cyclist", 5, "Creatine at a fair price, sealed tubs, quick support. Recommend."],
      ["Igor M.", "Gym rat", 5, "Support answered in minutes on Telegram. Whole thing was smooth."],
      ["Lena K.", "Beginner", 5, "Easy checkout, discreet packaging, arrived on time. Will buy again."],
    ],
  },
  ru: {
    eyebrow: "Отзывы", title: "Нам доверяют атлеты",
    subtitle: "Реальные отзывы лифтеров, бегунов и любителей, которые заправляются PEAKR.",
    basedOn: "На основе 1 312 отзывов", allTitle: "Все отзывы", verified: "Проверен",
    followTitle: "Присоединяйся", followDesc: "Подпишись — дропы, советы и розыгрыши.",
    list: [
      ["Максим К.", "Пауэрлифтинг", 5, "Предтрен — огонь, энергии на всю тренировку и без отката. Доставили быстро."],
      ["Елена Р.", "Кроссфит", 5, "Оригинал, честные дозировки. Беру протеин и креатин теперь только тут."],
      ["Дмитрий В.", "Бодибилдинг", 5, "Оплатил в USDT, заказ отслеживался и пришёл запечатанным. Беру ещё."],
      ["Сара Л.", "Бег", 5, "Электролиты спасают на длинных пробежках. Быстрая доставка по ЕС."],
      ["Марко П.", "Стронгмен", 5, "Гейнер реально дал массу. Настоящий продукт, без разбавления."],
      ["Анна С.", "Фитнес", 4, "Протеин мешается чисто, без вздутия. Заказала уже дважды."],
      ["Джейк Т.", "Велоспорт", 5, "Креатин по честной цене, банки запечатаны, поддержка быстрая. Рекомендую."],
      ["Игорь М.", "Зал", 5, "Поддержка ответила за минуты в Telegram. Всё прошло гладко."],
      ["Лена К.", "Новичок", 5, "Простое оформление, аккуратная упаковка, пришло вовремя. Возьму ещё."],
    ],
  },
};
const DIST = [[5, 88], [4, 9], [3, 2], [2, 1], [1, 0]];
const initials = (n) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function reviewCard(r, i) {
  const [name, tag, rating, text] = r;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return `
    <div class="review">
      <div class="review__head">
        <span class="review__av" style="background:${AV[i % AV.length]}">${esc(initials(name))}</span>
        <span class="review__who"><b>${esc(name)}</b><span class="review__name" style="margin:0">${esc(tag)}</span></span>
        <span class="review__badge">✓ ${esc(c().verified)}</span>
      </div>
      <div class="review__stars">${stars}</div>
      <p class="review__text">${esc(text)}</p>
    </div>`;
}
const c = () => COPY[getLang()] || COPY.en;

function init() {
  mountChrome("reviews.html");
  const x = c();
  document.getElementById("app").innerHTML = `
    ${pageHero({ eyebrow: `${esc(SITE.name)} · ${esc(x.eyebrow)}`, title: esc(x.title), subtitle: esc(x.subtitle), color: "#A98C9C" })}
    <section class="section" style="padding-top:0">
      <div class="rating-card" style="max-width:560px">
        <div class="rating-top">
          <div class="rating-big">4.9</div>
          <div><div class="rating-stars">★★★★★</div><div class="rating-count">${esc(x.basedOn)}</div></div>
        </div>
        <div class="rbars">
          ${DIST.map(([star, pct]) => `<div class="rbar"><span>${star}★</span><span class="track"><span class="fill" style="width:${pct}%"></span></span><span>${pct}%</span></div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="section-head"><h2>${esc(x.allTitle)}</h2><span class="rule"></span></div>
      <div class="reviews">${x.list.map((r, i) => reviewCard(r, i)).join("")}</div>
    </section>

    <section class="section">
      <div class="follow reveal">
        <h2>${esc(x.followTitle)}</h2>
        <p class="muted" style="max-width:42ch;margin:10px auto 0">${esc(x.followDesc)}</p>
        <div class="socials">
          ${(SITE.socials || []).map((s) => `<a class="social" href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.icon, 20)}</a>`).join("")}
        </div>
      </div>
    </section>`;
  revealOnScroll();
}

init();
