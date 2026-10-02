// ---------------------------------------------------------------
// Theme toggle (persists choice; falls back to system preference)
// ---------------------------------------------------------------
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme) document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme");
  themeToggle.textContent = (theme === "dark" || (!theme && matchMedia("(prefers-color-scheme: dark)").matches)) ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
}

(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved);
})();

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark"
    || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------
const toastStack = document.getElementById("toastStack");

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  toastStack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2200);
}

// ---------------------------------------------------------------
// 30-day calendar data: [фаза, вариант1, вариант2, фраза дня]
// ---------------------------------------------------------------
const data = [
["Просто начать","7 000 шагов","5 минут зарядки","Пять минут - это не мало. Это пять минут, которые я уже выбрала для себя."],
["Просто начать","Подняться по лестнице вместо лифта","5 минут растяжки","Мне не нужно сначала раскачаться. Иногда движение и есть моя раскачка."],
["Просто начать","10 минут прогулки","Любимый танец дома","Если можно двигаться и улыбаться одновременно - я выбираю этот вариант."],
["Просто начать","5 минут зарядки","7 000 шагов","Не надо делать идеально. Надо просто начать."],
["Просто начать","Потанцевать 1 песню","5 минут растяжки","Одна песня тоже может быть тренировкой. Проверено мной."],
["Просто начать","Прогулка 15 минут","5 минут упражнений на всё тело","Сегодня выбираем не подвиг, а движение."],
["Просто начать","7 000 шагов","Зарядка 5-10 минут","Первая неделя позади. Уже не «надо», а «я могу»."],
["Поймать ритм","10 минут прогулки","5 минут зарядки","Когда маленькая привычка становится своей, её уже не хочется бросать."],
["Поймать ритм","Растяжка 10 минут","7 000 шагов","Мне нравится ощущение: я сделала что-то хорошее для себя."],
["Поймать ритм","Танцы 2 песни","5 минут зарядки","Спорт может быть весёлым. И это одна из моих любимых находок."],
["Поймать ритм","Подъём по лестнице","10 минут прогулки","Не ищем идеальное время. Используем то, которое есть."],
["Поймать ритм","5 минут зарядки","Растяжка 10 минут","Пять минут - всё ещё пять минут. И они всё ещё работают."],
["Поймать ритм","7 000 шагов","Танцы дома","Сегодня можно выбрать то, от чего хочется двигаться."],
["Поймать ритм","Прогулка 20 минут","5 минут упражнений","Две недели. Кажется, я уже втягиваюсь."],
["Мне уже нравится","Зарядка 10 минут","7 000 шагов","Вот здесь начинается самое интересное: движение уже не кажется наказанием."],
["Мне уже нравится","Растяжка 15 минут","Танцы 3 песни","Можно не заставлять себя. Можно заинтересовать себя."],
["Мне уже нравится","5 минут зарядки","Прогулка 20 минут","Иногда настроение появляется не до движения, а после."],
["Мне уже нравится","7 000 шагов","Любимый танец + растяжка","Сегодня я выбираю вариант, который хочется сделать прямо сейчас."],
["Мне уже нравится","10 минут упражнений","15 минут прогулки","Я не обязана быть спортивной. Я просто человек, который двигается."],
["Мне уже нравится","Танцы 3 песни","Растяжка 10 минут","Если после движения хочется улыбаться - это уже хороший результат."],
["Мне уже нравится","7 000 шагов","Зарядка 10 минут","Три недели. Уже не эксперимент. Уже мой ритм."],
["Я продолжаю","Прогулка 20 минут","5 минут зарядки","Не начинаю сначала. Продолжаю с того места, где нахожусь."],
["Я продолжаю","Танцы 3 песни","7 000 шагов","Сегодня не соревнуемся. Сегодня живём."],
["Я продолжаю","Растяжка 15 минут","10 минут упражнений","Тело любит внимание. Даже если это всего несколько минут."],
["Я продолжаю","5 минут зарядки","Прогулка 20 минут","Самая сложная часть иногда - встать с дивана. Дальше проще."],
["Я продолжаю","7 000 шагов","Танцы дома","Движение - это не отдельная жизнь. Оно может быть частью обычной."],
["Я продолжаю","10 минут упражнений","Растяжка 15 минут","Мне больше не хочется ждать идеального понедельника."],
["Я продолжаю","Танцы 3 песни","7 000 шагов","Я выбираю движение не потому, что должна. А потому, что мне нравится, как я себя чувствую."],
["Я продолжаю","Любой вариант из прошлых дней","Любимая активность сегодня","Можно выбрать то, что понравилось больше всего. Это уже твоя привычка."],
["Я продолжаю","7 000 шагов","5-10 минут зарядки","30 дней. И главный результат - я снова доказала себе, что могу начать и продолжить."]
];

const STORAGE_KEY = "ulyana30finalv2";
const MOODS = ["Бодро", "Хорошо", "Спокойно", "Устала, но довольна"];

let state = {};
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) {}

const daysEl = document.getElementById("days");
const finalEl = document.getElementById("final");
let wasComplete = false;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  renderProgress();
}

function completedCount() {
  return Object.keys(state).filter(k => k.startsWith("d") && state[k].option).length;
}

function renderProgress() {
  const done = completedCount();
  document.getElementById("progressText").textContent = `${done} из 30 дней`;
  document.getElementById("percent").textContent = Math.round(done / 30 * 100) + "%";
  document.getElementById("fill").style.width = (done / 30 * 100) + "%";

  const complete = done === 30;
  finalEl.classList.toggle("show", complete);
  if (complete && !wasComplete) {
    showToast("Поздравляю! Ты прошла все 30 дней 🎉");
    finalEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  wasComplete = complete;
}

function render() {
  daysEl.innerHTML = "";
  data.forEach((x, i) => {
    const n = i + 1;
    const s = state["d" + n] || {};
    const el = document.createElement("article");
    el.className = "day" + (s.option ? " done" : "") + " reveal";

    el.innerHTML = `
      <div class="day-top">
        <div class="day-num">День ${n}</div>
        <div class="check${s.option ? " show" : ""}">✓ сделано</div>
      </div>
      <div class="phase">${x[0]}</div>
      <p class="phrase">${x[3]}</p>
      <div class="options" role="group" aria-label="Выбор активности на день ${n}">
        <button type="button" class="opt${s.option === 1 ? " selected" : ""}" data-o="1" aria-pressed="${s.option === 1}">
          <strong>Вариант 1</strong><span>${x[1]}</span>
        </button>
        <button type="button" class="opt${s.option === 2 ? " selected" : ""}" data-o="2" aria-pressed="${s.option === 2}">
          <strong>Вариант 2</strong><span>${x[2]}</span>
        </button>
      </div>
      <div class="mood">
        <div class="mood-title">Как ты себя чувствуешь?</div>
        <div class="moods" role="group" aria-label="Настроение в день ${n}">
          ${MOODS.map((m, j) => `<button type="button" data-m="${j + 1}" class="${s.mood === j + 1 ? "selected" : ""}" aria-pressed="${s.mood === j + 1}">${m}</button>`).join("")}
        </div>
      </div>`;

    el.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
      const already = s.option === +b.dataset.o;
      state["d" + n] = { ...(state["d" + n] || {}), option: +b.dataset.o };
      save();
      render();
      if (!already) showToast(`День ${n} отмечен ✓`);
      observeReveal();
    }));

    el.querySelectorAll(".mood button").forEach(b => b.addEventListener("click", () => {
      state["d" + n] = { ...(state["d" + n] || {}), mood: +b.dataset.m };
      save();
      render();
      observeReveal();
    }));

    daysEl.appendChild(el);
  });
  renderProgress();
}

// ---------------------------------------------------------------
// Fade-in on scroll for cards/sections
// ---------------------------------------------------------------
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

function observeReveal() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach(el => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add("is-visible");
  });
}

document.querySelectorAll("section").forEach(el => el.classList.add("reveal"));

render();
observeReveal();
