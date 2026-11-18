/**
 * YIZHI W100 Corporate Site <-> Keynote Slides Connector & API Bridge
 * Exposes window.YIZHI_SLIDES for connecting yizhi-w100.netlify.app to /slides/
 * Embargoed until 2026-11-24 14:40:00 CST (Beijing Time, UTC+8).
 */
(function () {
  "use strict";

  var UNLOCK_AT = "2026-11-24T14:40:00+08:00";
  var UNLOCK_EPOCH_MS = Date.parse(UNLOCK_AT);
  var STATUS_ENDPOINT = "/api/slides-status";
  var SLIDES_URL = "/slides/";
  var LOCKED_URL = "/slides-locked.html";

  var cachedStatus = {
    unlocked: Date.now() >= UNLOCK_EPOCH_MS,
    unlockAt: UNLOCK_AT,
    slidesUrl: null,
    lockedUrl: LOCKED_URL,
  };

  function getLang() {
    var l = (document.documentElement.lang || "").toLowerCase();
    if (l.indexOf("zh") === 0 || document.body.dataset.lang === "zh") return "zh";
    if (l.indexOf("de") === 0 || document.body.dataset.lang === "de") return "de";
    var active = document.querySelector(".lang-opt.is-active");
    return active ? active.getAttribute("data-set-lang") || "en" : "en";
  }

  function updateButtons(unlocked) {
    var links = document.querySelectorAll("[data-slides-link]");
    var lang = getLang();
    links.forEach(function (el) {
      el.setAttribute("href", unlocked ? SLIDES_URL : LOCKED_URL);
      el.setAttribute("data-slides-unlocked", unlocked ? "true" : "false");
      if (unlocked) {
        el.setAttribute("data-en-html", "Open Keynote Slides (Live) ↗");
        el.setAttribute("data-de", "Launch-Slides öffnen (Live) ↗");
        el.setAttribute("data-zh", "进入发布会 Slides（已开放）↗");
        el.textContent =
          lang === "zh"
            ? "进入发布会 Slides（已开放）↗"
            : lang === "de"
              ? "Launch-Slides öffnen (Live) ↗"
              : "Open Keynote Slides (Live) ↗";
      } else {
        el.setAttribute("data-en-html", "Keynote Slides (Opens 14:40 CST)");
        el.setAttribute("data-de", "Keynote-Slides (ab 24.11. 14:40 CST)");
        el.setAttribute("data-zh", "发布会 Slides（11.24 14:40 开放）");
        el.textContent =
          lang === "zh"
            ? "发布会 Slides（11.24 14:40 开放）"
            : lang === "de"
              ? "Keynote-Slides (ab 24.11. 14:40 CST)"
              : "Keynote Slides (Opens 14:40 CST)";
      }
    });
  }

  function checkStatus() {
    var isLocal =
      location.protocol === "file:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    if (isLocal) {
      cachedStatus.unlocked = Date.now() >= UNLOCK_EPOCH_MS;
      updateButtons(cachedStatus.unlocked);
      return Promise.resolve(cachedStatus);
    }

    return fetch(STATUS_ENDPOINT, { cache: "no-store" })
      .then(function (resp) { return resp.ok ? resp.json() : null; })
      .then(function (data) {
        if (data && typeof data.unlocked === "boolean") {
          cachedStatus = data;
        } else {
          cachedStatus.unlocked = Date.now() >= UNLOCK_EPOCH_MS;
        }
        updateButtons(cachedStatus.unlocked);
        return cachedStatus;
      })
      .catch(function () {
        cachedStatus.unlocked = Date.now() >= UNLOCK_EPOCH_MS;
        updateButtons(cachedStatus.unlocked);
        return cachedStatus;
      });
  }

  function openSlides() {
    return checkStatus().then(function (st) {
      window.location.href = st.unlocked ? SLIDES_URL : LOCKED_URL;
      return st;
    });
  }

  window.YIZHI_SLIDES = {
    endpoint: STATUS_ENDPOINT,
    slidesUrl: SLIDES_URL,
    lockedUrl: LOCKED_URL,
    unlockAt: UNLOCK_AT,
    checkStatus: checkStatus,
    open: openSlides,
  };

  document.addEventListener("DOMContentLoaded", function () {
    checkStatus();
    document.querySelectorAll(".lang-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(function () { updateButtons(cachedStatus.unlocked); }, 20);
      });
    });
  });
})();
