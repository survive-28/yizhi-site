/* YIZHI site interactions: nav, EN/DE/ZH i18n, kinetic dial, W100 simulator, gallery, countdown, tabs, routing */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (new URLSearchParams(window.location.search).has('static')) root.classList.add('no-anim');

  /* ---------- scroll progress & header state ---------- */
  var header = $('#siteHeader');
  var toTop = $('#toTop');
  var progress = $('#scrollProgress');
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (toTop) toTop.classList.toggle('on', y > 700);
    if (progress) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- mobile navigation ---------- */
  var navToggle = $('#navToggle');
  var mobileNav = $('#mobileNav');
  function setNav(open) {
    doc.body.classList.toggle('nav-open', open);
    if (navToggle) navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (mobileNav) mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(!doc.body.classList.contains('nav-open'));
    });
  }
  if (mobileNav) {
    $$('a', mobileNav).forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && doc.body.classList.contains('nav-open')) setNav(false);
  });

  /* ---------- trilingual i18n (EN / DE / ZH) ---------- */
  var stored = null;
  try { stored = window.localStorage.getItem('yizhi-lang'); } catch (e) {}
  var query = new URLSearchParams(window.location.search).get('lang');
  var validLang = function (v) { return v === 'en' || v === 'de' || v === 'zh'; };
  var lang = validLang(query) ? query : (validLang(stored) ? stored : 'en');

  function capture() {
    $$('[data-zh],[data-de]').forEach(function (el) {
      if (el.getAttribute('data-en-html') === null) el.setAttribute('data-en-html', el.innerHTML);
    });
    $$('[data-zh-aria-label],[data-de-aria-label]').forEach(function (el) {
      if (el.getAttribute('data-en-aria') === null) el.setAttribute('data-en-aria', el.getAttribute('aria-label') || '');
    });
    $$('[data-zh-placeholder],[data-de-placeholder]').forEach(function (el) {
      if (el.getAttribute('data-en-placeholder') === null) el.setAttribute('data-en-placeholder', el.getAttribute('placeholder') || '');
    });
    $$('[data-zh-alt],[data-de-alt]').forEach(function (el) {
      if (el.getAttribute('data-en-alt') === null) el.setAttribute('data-en-alt', el.getAttribute('alt') || '');
    });
  }

  function applyLang(next) {
    if (!validLang(next)) next = 'en';
    lang = next;
    var htmlLang = next === 'zh' ? 'zh-CN' : next;
    root.setAttribute('lang', htmlLang);

    $$('[data-zh],[data-de]').forEach(function (el) {
      var val = next === 'en' ? el.getAttribute('data-en-html') : el.getAttribute('data-' + next);
      if (val !== null) el.innerHTML = val;
      else if (el.getAttribute('data-en-html') !== null) el.innerHTML = el.getAttribute('data-en-html');
    });
    $$('[data-zh-aria-label],[data-de-aria-label]').forEach(function (el) {
      var val = next === 'en' ? el.getAttribute('data-en-aria') : el.getAttribute('data-' + next + '-aria-label');
      if (val !== null) el.setAttribute('aria-label', val);
    });
    $$('[data-zh-placeholder],[data-de-placeholder]').forEach(function (el) {
      var val = next === 'en' ? el.getAttribute('data-en-placeholder') : el.getAttribute('data-' + next + '-placeholder');
      if (val !== null) el.setAttribute('placeholder', val);
    });
    $$('[data-zh-alt],[data-de-alt]').forEach(function (el) {
      var val = next === 'en' ? el.getAttribute('data-en-alt') : el.getAttribute('data-' + next + '-alt');
      if (val !== null) el.setAttribute('alt', val);
    });

    $$('.lang-opt').forEach(function (btn) {
      var active = btn.getAttribute('data-set-lang') === next;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { window.localStorage.setItem('yizhi-lang', next); } catch (e) {}
    doc.dispatchEvent(new CustomEvent('yizhi:lang', { detail: next }));
  }

  capture();
  applyLang(lang);
  $$('.lang-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-set-lang'));
    });
  });

  /* ---------- toast helper ---------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          var msg = lang === 'zh' ? '已复制：' + text : (lang === 'de' ? 'Kopiert: ' + text : 'Copied: ' + text);
          showToast(msg);
        }).catch(function () {});
      }
    });
  });

  /* ---------- hero spotlight (smooth rAF lerp) ---------- */
  var spotlightHero = $('.hero, .launch-hero');
  if (spotlightHero && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var tx = 72, ty = 36, cx = 72, cy = 36, rafId = null;
    var step = function () {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      spotlightHero.style.setProperty('--mx', cx.toFixed(2) + '%');
      spotlightHero.style.setProperty('--my', cy.toFixed(2) + '%');
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) rafId = window.requestAnimationFrame(step);
      else rafId = null;
    };
    spotlightHero.addEventListener('pointermove', function (e) {
      var rect = spotlightHero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width) * 100;
      ty = ((e.clientY - rect.top) / rect.height) * 100;
      if (!rafId) rafId = window.requestAnimationFrame(step);
    });
  }

  /* ---------- interactive Six-Moment Ring dial ---------- */
  var dialRoot = $('#sixDial');
  if (dialRoot) {
    var moments = [
      {
        time: '07:00',
        en: { title: 'Slot 1 · Morning', desc: 'Blood pressure & daily care — LED + 10s voice cue', cue: 'Layer 1 · Compartment 1' },
        de: { title: 'Fach 1 · Morgen', desc: 'Blutdruck & Tagesstart — LED + 10-s-Sprachansage', cue: 'Ebene 1 · Fach 1' },
        zh: { title: '1 号仓 · 清晨', desc: '晨起常规用药 · 灯光 + 10 秒自定义亲人语音', cue: '上层 · 第 1 仓' }
      },
      {
        time: '09:00',
        en: { title: 'Slot 2 · Post-Meal', desc: 'Gentle 30s chime + vibration for after-breakfast dose', cue: 'Layer 1 · Compartment 2' },
        de: { title: 'Fach 2 · Nach dem Frühstück', desc: 'Sanfter 30-s-Signalton & Vibration nach dem Essen', cue: 'Ebene 1 · Fach 2' },
        zh: { title: '2 号仓 · 早餐后', desc: '30 秒轻柔响铃 + 震动，不漏不重更安心', cue: '上层 · 第 2 仓' }
      },
      {
        time: '12:00',
        en: { title: 'Slot 3 · Midday', desc: '6 lid sensors verify the right compartment opened', cue: 'Layer 1 · Compartment 3' },
        de: { title: 'Fach 3 · Mittag', desc: '6 Öffnungssensoren prüfen die korrekte Entnahme', cue: 'Ebene 1 · Fach 3' },
        zh: { title: '3 号仓 · 午间', desc: '6 枚传感器实时感知开仓，错仓即时提醒', cue: '上层 · 第 3 仓' }
      },
      {
        time: '15:00',
        en: { title: 'Slot 4 · Afternoon', desc: 'Unopened after 5 min? Auto-repeats & alerts family', cue: 'Layer 2 · Compartment 4' },
        de: { title: 'Fach 4 · Nachmittag', desc: 'Nach 5 Min. ungeöffnet? Wiederholung & App-Hinweis', cue: 'Ebene 2 · Fach 4' },
        zh: { title: '4 号仓 · 午后', desc: '超时 5 分钟未开仓自动重响，并同步家人手机', cue: '下层 · 第 4 仓' }
      },
      {
        time: '18:30',
        en: { title: 'Slot 5 · Evening', desc: 'Food-grade silicone seals out moisture & oxygen', cue: 'Layer 2 · Compartment 5' },
        de: { title: 'Fach 5 · Abend', desc: 'Lebensmittelechtes Silikon schützt vor Feuchtigkeit', cue: 'Ebene 2 · Fach 5' },
        zh: { title: '5 号仓 · 傍晚', desc: '食品级硅胶密封防潮阻氧化，断网可存 60 天', cue: '下层 · 第 5 仓' }
      },
      {
        time: '21:00',
        en: { title: 'Slot 6 · Bedtime', desc: 'Timeline synced via Wi-Fi · JSON / CSV export ready', cue: 'Layer 2 · Compartment 6' },
        de: { title: 'Fach 6 · Nachtruhe', desc: 'Tagesprotokoll per WLAN · JSON / CSV-Export bereit', cue: 'Ebene 2 · Fach 6' },
        zh: { title: '6 号仓 · 睡前', desc: '全天记录云端同步，支持 Data Act 日志导出', cue: '下层 · 第 6 仓' }
      }
    ];
    var activeIdx = 0;
    var segs = $$('.dial-seg', dialRoot);
    var pills = $$('.dial-pill', dialRoot);
    var dTime = $('.dial-time', dialRoot);
    var dTitle = $('.dial-title', dialRoot);
    var dDesc = $('.dial-desc', dialRoot);
    var dCue = $('.dial-cue', dialRoot);
    var dialPaused = false;

    function renderMoment(idx) {
      activeIdx = idx;
      var m = moments[idx];
      var copy = m[lang] || m.en;
      segs.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      pills.forEach(function (p, i) {
        p.classList.toggle('is-active', i === idx);
        p.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
      });
      if (dTime) dTime.textContent = m.time;
      if (dTitle) dTitle.textContent = copy.title;
      if (dDesc) dDesc.textContent = copy.desc;
      if (dCue) dCue.textContent = copy.cue;
    }

    segs.forEach(function (s, i) {
      s.addEventListener('click', function () { dialPaused = true; renderMoment(i); });
      s.addEventListener('mouseenter', function () { dialPaused = true; renderMoment(i); });
    });
    pills.forEach(function (p, i) {
      p.addEventListener('click', function () { dialPaused = true; renderMoment(i); });
    });
    dialRoot.addEventListener('mouseleave', function () { dialPaused = false; });

    renderMoment(0);
    doc.addEventListener('yizhi:lang', function () { renderMoment(activeIdx); });
    if (!reduce) {
      window.setInterval(function () {
        if (!dialPaused) renderMoment((activeIdx + 1) % moments.length);
      }, 3600);
    }
  }

  /* ---------- multi-angle product gallery + 3D tilt ---------- */
  var gallery = $('#productGallery');
  if (gallery) {
    var img = $('#galleryImg');
    var captionEl = $('#galleryCaption');
    var dimEl = $('#galleryDim');
    var tabs = $$('.gallery-tab', gallery);
    var currentView = 0;

    function selectView(idx) {
      currentView = idx;
      var tab = tabs[idx];
      if (!tab || !img) return;
      tabs.forEach(function (t, i) {
        t.classList.toggle('is-active', i === idx);
        t.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
      });
      var nextSrc = tab.getAttribute('data-src');
      var capText = tab.getAttribute('data-cap-' + lang) || tab.getAttribute('data-cap-en');
      var dimText = tab.getAttribute('data-dim') || '';
      if (dimEl) dimEl.textContent = dimText;
      if (captionEl && capText) captionEl.textContent = capText;

      if (img.getAttribute('src') !== nextSrc) {
        img.classList.add('is-switching');
        window.setTimeout(function () {
          img.setAttribute('src', nextSrc);
          img.classList.remove('is-switching');
        }, reduce ? 0 : 180);
      }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectView(i); });
    });
    doc.addEventListener('yizhi:lang', function () { selectView(currentView); });
    selectView(0);

    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      gallery.addEventListener('pointermove', function (e) {
        var r = gallery.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - 0.5) * 6;
        var dy = ((e.clientY - r.top) / r.height - 0.5) * -6;
        gallery.style.transform = 'perspective(950px) rotateX(' + dy.toFixed(2) + 'deg) rotateY(' + dx.toFixed(2) + 'deg)';
      });
      gallery.addEventListener('pointerleave', function () {
        gallery.style.transform = '';
      });
    }
  }

  /* ---------- interactive W100 closed-loop simulator ---------- */
  var sim = $('#w100Sim');
  if (sim) {
    var slotBtns = $$('.w100-slot', sim);
    var sensorLeds = $$('.w100-sensor-leds i', sim);
    var scenarioBtns = $$('.sim-scenario', sim);
    var triggerBtn = $('#simTrigger', sim);
    var resetBtn = $('#simReset', sim);
    var exportBtn = $('#simExport', sim);
    var statusBox = $('#simStatus', sim);
    var statusText = $('#simStatusText', sim);
    var wave = $('#simWave', sim);
    var feed = $('#simFeed', sim);

    var simText = {
      en: {
        idle: 'Standby · Click a compartment or trigger a schedule alert',
        ringing: function (slot, med) { return 'Active Alert (30s) · Slot ' + slot + ' (' + med + ') — Click Slot ' + slot + ' to open'; },
        wrongHint: function (slot) { return 'Wrong-Lid Mode · Try opening a NON-lit slot (target is Slot ' + slot + ')'; },
        repeatHint: function (slot) { return '5-Min Repeat Active · Unanswered dose escalated to Guardian App'; },
        openedOk: function (slot) { return 'Slot ' + slot + ' opened on schedule · Synced to family'; },
        wrongOpened: function (picked, target) { return 'Warning! Opened Slot ' + picked + ' instead of Slot ' + target; },
        logOk: function (slot, med) { return 'Slot ' + slot + ' (' + med + ') opened on plan'; },
        logOkTag: 'OPENED',
        logWrong: function (picked, target) { return 'Wrong lid: Slot ' + picked + ' opened (expected ' + target + ')'; },
        logWrongTag: 'WRONG LID',
        logRepeat: function (slot) { return 'Slot ' + slot + ' unopened (+5 min repeat & family push)'; },
        logRepeatTag: 'ALERT',
        logDefault1: '07:02 · Slot 1 (Morning) opened on plan',
        logDefault2: '12:00 · 60-day local flash & Wi-Fi online',
        exportMsg: 'EU Data Act JSON / CSV opening log preview ready (non-diagnostic record)'
      },
      de: {
        idle: 'Bereitschaft · Fach antippen oder Zeitplan-Erinnerung auslösen',
        ringing: function (slot, med) { return 'Aktiver Alarm (30 s) · Fach ' + slot + ' (' + med + ') — Fach ' + slot + ' öffnen'; },
        wrongHint: function (slot) { return 'Fehlentnahme-Test · Öffnen Sie ein unbeleuchtetes Fach (Ziel: Fach ' + slot + ')'; },
        repeatHint: function (slot) { return '5-Min.-Wiederholung · Hinweis an Angehörigen-App gesendet'; },
        openedOk: function (slot) { return 'Fach ' + slot + ' planmäßig geöffnet · Mit App synchronisiert'; },
        wrongOpened: function (picked, target) { return 'Warnung! Fach ' + picked + ' statt Fach ' + target + ' geöffnet'; },
        logOk: function (slot, med) { return 'Fach ' + slot + ' (' + med + ') planmäßig geöffnet'; },
        logOkTag: 'GEÖFFNET',
        logWrong: function (picked, target) { return 'Falsches Fach: Fach ' + picked + ' geöffnet (Soll: ' + target + ')'; },
        logWrongTag: 'FEHLFACH',
        logRepeat: function (slot) { return 'Fach ' + slot + ' ungeöffnet (+5 Min. Wiederholung & App-Push)'; },
        logRepeatTag: 'HINWEIS',
        logDefault1: '07:02 · Fach 1 (Morgen) planmäßig geöffnet',
        logDefault2: '12:00 · 60-Tage-Flash & WLAN aktiv',
        exportMsg: 'EU Data Act JSON-/CSV-Öffnungsprotokoll exportbereit (kein Einnahmenachweis)'
      },
      zh: {
        idle: '待机中 · 点击药仓或触发一次用药提醒体验闭环',
        ringing: function (slot, med) { return '三重提醒响铃中（30秒）· 请点击亮灯的 ' + slot + ' 号仓（' + med + '）'; },
        wrongHint: function (slot) { return '防错仓演练 · 请故意点击未亮灯的其他药仓（目标为 ' + slot + ' 号仓）'; },
        repeatHint: function (slot) { return '5 分钟重复提醒 · 未开仓已自动推送至家属手机'; },
        openedOk: function (slot) { return slot + ' 号仓已按时开仓 · 已同步至家人时间线'; },
        wrongOpened: function (picked, target) { return '错仓语音纠偏！您误开了 ' + picked + ' 号仓，请开 ' + target + ' 号仓'; },
        logOk: function (slot, med) { return slot + ' 号仓（' + med + '）已按计划开仓'; },
        logOkTag: '已按时开仓',
        logWrong: function (picked, target) { return '误开 ' + picked + ' 号仓（应开 ' + target + ' 号仓）已语音纠偏'; },
        logWrongTag: '错仓预警',
        logRepeat: function (slot) { return slot + ' 号仓超时未开（+5 分钟重复提醒并通知家属）'; },
        logRepeatTag: '超时通知',
        logDefault1: '07:02 · 1 号仓（晨起用药）已按计划开仓',
        logDefault2: '12:00 · 60 天本地缓存与 Wi-Fi 云同步在线',
        exportMsg: '已生成符合 EU Data Act 规范的 JSON / CSV 开仓日志（非吞服证明）'
      }
    };

    var stripClusters = $$('.w100-strip-cluster', sim);

    var meds = {
      en: { 1: 'Upper · Morning', 2: 'Upper · Post-Meal', 3: 'Upper · Midday', 4: 'Lower · Afternoon', 5: 'Lower · Evening', 6: 'Lower · Bedtime' },
      de: { 1: 'Oben · Morgen', 2: 'Oben · Nach Frühstück', 3: 'Oben · Mittag', 4: 'Unten · Nachmittag', 5: 'Unten · Abend', 6: 'Unten · Nachtruhe' },
      zh: { 1: '上层·晨起药', 2: '上层·餐后药', 3: '上层·午间药', 4: '下层·午后药', 5: '下层·晚间药', 6: '下层·睡前药' }
    };

    var currentScenario = 'normal';
    var targetSlot = 1;
    var ringing = false;

    function getTimeStr() {
      var now = new Date();
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      return hh + ':' + mm;
    }

    function setFeedDefault() {
      if (!feed) return;
      var t = simText[lang] || simText.en;
      feed.innerHTML =
        '<div class="app-event"><div><time>07:02</time><b>' + t.logDefault1.replace('07:02 · ', '') + '</b></div><span class="app-pill">' + t.logOkTag + '</span></div>' +
        '<div class="app-event"><div><time>12:00</time><b>' + t.logDefault2.replace('12:00 · ', '') + '</b></div><span class="app-pill">SYNC</span></div>';
    }

    function pushEvent(text, tag, cls) {
      if (!feed) return;
      var row = doc.createElement('div');
      row.className = 'app-event' + (cls ? ' ' + cls : '');
      row.innerHTML = '<div><time>' + getTimeStr() + '</time><b>' + text + '</b></div><span class="app-pill">' + tag + '</span>';
      feed.insertBefore(row, feed.firstChild);
      while (feed.children.length > 3) feed.removeChild(feed.lastChild);
    }

    function setVisualState(mode, msg) {
      if (statusBox) {
        statusBox.classList.remove('is-ringing', 'is-ok', 'is-warn');
        if (mode) statusBox.classList.add(mode);
      }
      if (statusText) statusText.textContent = msg;
      if (wave) wave.classList.toggle('is-active', mode === 'is-ringing');
    }

    function activateScenario(sc) {
      currentScenario = sc;
      ringing = true;
      scenarioBtns.forEach(function (b) {
        var on = b.getAttribute('data-scenario') === sc;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      slotBtns.forEach(function (b) { b.classList.remove('is-open', 'is-wrong', 'is-target'); });
      sensorLeds.forEach(function (l) { l.classList.remove('on', 'ok'); });
      stripClusters.forEach(function (c) { c.classList.remove('on', 'ok'); });

      var t = simText[lang] || simText.en;
      var m = meds[lang] || meds.en;

      if (sc === 'normal') targetSlot = 1;
      else if (sc === 'wrong') targetSlot = 4;
      else targetSlot = 2;

      var targetBtn = slotBtns[targetSlot - 1];
      if (targetBtn) targetBtn.classList.add('is-target');
      if (sensorLeds[targetSlot - 1]) sensorLeds[targetSlot - 1].classList.add('on');
      if (stripClusters[targetSlot - 1]) stripClusters[targetSlot - 1].classList.add('on');

      if (sc === 'normal') {
        setVisualState('is-ringing', t.ringing(targetSlot, m[targetSlot]));
      } else if (sc === 'wrong') {
        setVisualState('is-ringing', t.wrongHint(targetSlot));
      } else {
        setVisualState('is-warn', t.repeatHint(targetSlot));
        pushEvent(t.logRepeat(targetSlot), t.logRepeatTag, 'is-alert');
      }
    }

    slotBtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        var slot = idx + 1;
        var t = simText[lang] || simText.en;
        var m = meds[lang] || meds.en;
        var device = $('.w100-device', sim);

        if (!ringing) {
          btn.classList.toggle('is-open');
          if (stripClusters[idx]) stripClusters[idx].classList.toggle('ok', btn.classList.contains('is-open'));
          return;
        }

        if (slot === targetSlot) {
          btn.classList.remove('is-target', 'is-wrong');
          btn.classList.add('is-open');
          ringing = false;
          sensorLeds.forEach(function (l) { l.classList.remove('on'); });
          stripClusters.forEach(function (c) { c.classList.remove('on'); });
          if (sensorLeds[idx]) sensorLeds[idx].classList.add('ok');
          if (stripClusters[idx]) stripClusters[idx].classList.add('ok');
          setVisualState('is-ok', t.openedOk(slot));
          pushEvent(t.logOk(slot, m[slot]), t.logOkTag, '');
        } else {
          btn.classList.add('is-wrong');
          if (device && !reduce) {
            device.classList.remove('is-shake');
            void device.offsetWidth;
            device.classList.add('is-shake');
          }
          setVisualState('is-warn', t.wrongOpened(slot, targetSlot));
          pushEvent(t.logWrong(slot, targetSlot), t.logWrongTag, 'is-warn');
          window.setTimeout(function () { btn.classList.remove('is-wrong'); }, 900);
        }
      });
    });

    scenarioBtns.forEach(function (b) {
      b.addEventListener('click', function () { activateScenario(b.getAttribute('data-scenario')); });
    });
    if (triggerBtn) triggerBtn.addEventListener('click', function () { activateScenario(currentScenario); });
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        ringing = false;
        slotBtns.forEach(function (b) { b.classList.remove('is-open', 'is-wrong', 'is-target'); });
        sensorLeds.forEach(function (l) { l.classList.remove('on', 'ok'); });
        stripClusters.forEach(function (c) { c.classList.remove('on', 'ok'); });
        var t = simText[lang] || simText.en;
        setVisualState('', t.idle);
        setFeedDefault();
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var t = simText[lang] || simText.en;
        showToast(t.exportMsg);
      });
    }

    setFeedDefault();
    activateScenario('normal');
    doc.addEventListener('yizhi:lang', function () {
      setFeedDefault();
      activateScenario(currentScenario);
    });
  }

  /* ---------- animated stat counters ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var runCount = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var pad2 = el.hasAttribute('data-pad2');
      if (isNaN(target) || reduce) {
        el.textContent = pad2 && target < 10 ? '0' + target : String(target);
        return;
      }
      var dur = 950;
      var start = performance.now();
      var tickCount = function (now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = pad2 && val < 10 ? '0' + val : String(val);
        if (p < 1) window.requestAnimationFrame(tickCount);
      };
      window.requestAnimationFrame(tickCount);
    };

    if ('IntersectionObserver' in window && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- export & compliance tabs ---------- */
  var tabBar = $('#readinessTabs');
  if (tabBar) {
    var tabBtns = $$('.tab-btn', tabBar);
    var tabPanels = $$('.tab-panel');
    var setTab = function (id) {
      tabBtns.forEach(function (b) {
        var active = b.getAttribute('aria-controls') === id;
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      tabPanels.forEach(function (p) {
        p.classList.toggle('is-active', p.id === id);
      });
    };
    tabBtns.forEach(function (b, idx) {
      b.addEventListener('click', function () { setTab(b.getAttribute('aria-controls')); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabBtns.length : (idx - 1 + tabBtns.length) % tabBtns.length;
          tabBtns[nextIdx].focus();
          setTab(tabBtns[nextIdx].getAttribute('aria-controls'));
        }
      });
    });
  }

  /* ---------- dynamic @yizhi.com routing hint in contact form ---------- */
  var interestSelect = $('#c-interest');
  var routeEmailEl = $('#formRouteEmail');
  if (interestSelect && routeEmailEl) {
    var routeMap = {
      distribution: 'sales@yizhi.com',
      oem: 'sales@yizhi.com',
      launch: 'launch@yizhi.com',
      compliance: 'compliance@yizhi.com',
      rma: 'rma@yizhi.com'
    };
    var updateRoute = function () {
      var addr = routeMap[interestSelect.value] || 'sales@yizhi.com';
      routeEmailEl.textContent = addr;
      routeEmailEl.setAttribute('href', 'mailto:' + addr);
    };
    interestSelect.addEventListener('change', updateRoute);
    updateRoute();
  }

  /* ---------- countdown ---------- */
  var countdowns = $$('.countdown[data-launch]');
  if (countdowns.length) {
    var targetTime = new Date(countdowns[0].getAttribute('data-launch')).getTime();
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var tick = function () {
      var diff = targetTime - Date.now();
      var d = Math.max(0, Math.floor(diff / 86400000));
      var h = Math.max(0, Math.floor(diff / 3600000) % 24);
      var m = Math.max(0, Math.floor(diff / 60000) % 60);
      var s = Math.max(0, Math.floor(diff / 1000) % 60);
      countdowns.forEach(function (box) {
        var set = function (unit, val) {
          var el = box.querySelector('[data-unit="' + unit + '"]');
          if (el) el.textContent = val;
        };
        set('days', pad(d)); set('hours', pad(h)); set('minutes', pad(m)); set('seconds', pad(s));
      });
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- calendar file ---------- */
  var addCal = $('#addCal');
  if (addCal) {
    addCal.addEventListener('click', function () {
      var lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//YIZHI//W100 Launch//EN', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:w100-launch-20261124@yizhi.com',
        'DTSTAMP:20261118T000000Z',
        'DTSTART:20261124T070000Z',
        'DTEND:20261124T090000Z',
        'SUMMARY:Healthcare Nurse W100 - Global Launch (SA308) & Booth C9 (SA407)',
        'LOCATION:Room SA308 & Booth C9 (Room SA407), Xuesi Building, SUIBE, Songjiang, Shanghai, China',
        'DESCRIPTION:Live demonstration and channel programme. Contact: launch@yizhi.com / sales@yizhi.com',
        'END:VEVENT', 'END:VCALENDAR'
      ];
      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = doc.createElement('a');
      a.href = url; a.download = 'yizhi-w100-launch.ics';
      doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ---------- scroll reveal ---------- */
  var items = $$('.reveal');
  var revealPassed = function () {
    var vh = window.innerHeight || 900;
    items.forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top <= vh * 0.96) el.classList.add('is-in');
    });
  };
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });
    items.forEach(function (el) { io.observe(el); });
    window.addEventListener('scroll', revealPassed, { passive: true });
    revealPassed();
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- active section in nav ---------- */
  var sections = $$('main section[id]');
  var navLinks = $$('.nav a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (a) {
          var href = a.getAttribute('href') || '';
          var match = href.indexOf('#' + id) > -1;
          if (match) a.setAttribute('aria-current', 'page');
          else if (a.getAttribute('aria-current') === 'page' && href.indexOf('launch.html') === -1) a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- forms ---------- */
  $$('form[data-netlify]').forEach(function (form) {
    form.addEventListener('submit', function () {
      var btn = $('button[type="submit"]', form);
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '.7';
        var label = $('span', btn);
        if (label) {
          label.textContent = lang === 'zh' ? '提交中……' : (lang === 'de' ? 'Wird gesendet…' : 'Sending…');
        }
      }
    });
  });

  /* ---------- luminous hero particle constellation ---------- */
  var canvases = $$('.hero-canvas');
  if (canvases.length && !reduce) {
    canvases.forEach(function (cv) {
      var ctx = cv.getContext('2d');
      if (!ctx) return;
      var w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
      var mouse = { x: -9999, y: -9999 };
      var visible = true;
      var pts = [];
      var COUNT = 38;

      var resize = function () {
        var r = cv.parentElement.getBoundingClientRect();
        w = Math.max(300, r.width);
        h = Math.max(300, r.height);
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      for (var i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.34,
          vy: (Math.random() - 0.5) * 0.34,
          r: 1.2 + Math.random() * 1.9,
          gold: i % 3 === 0
        });
      }

      if (window.matchMedia('(pointer:fine)').matches) {
        cv.parentElement.addEventListener('pointermove', function (e) {
          var rect = cv.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        }, { passive: true });
        cv.parentElement.addEventListener('pointerleave', function () {
          mouse.x = -9999; mouse.y = -9999;
        });
      }

      if ('IntersectionObserver' in window) {
        var pio = new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
        }, { threshold: 0.02 });
        pio.observe(cv);
      }

      var frame = function () {
        if (visible) {
          ctx.clearRect(0, 0, w, h);
          for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            var dxm = p.x - mouse.x, dym = p.y - mouse.y;
            var dm2 = dxm * dxm + dym * dym;
            if (dm2 < 16000 && dm2 > 4) {
              var force = (1 - Math.sqrt(dm2) / 126) * 0.45;
              p.x += (dxm / Math.sqrt(dm2)) * force;
              p.y += (dym / Math.sqrt(dm2)) * force;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold ? 'rgba(229,188,91,0.55)' : 'rgba(134,210,175,0.34)';
            ctx.fill();

            for (var j = i + 1; j < pts.length; j++) {
              var q = pts[j];
              var dx = p.x - q.x, dy = p.y - q.y;
              var d2 = dx * dx + dy * dy;
              if (d2 < 13000) {
                var alpha = (1 - d2 / 13000) * (p.gold || q.gold ? 0.18 : 0.1);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = (p.gold || q.gold) ? 'rgba(229,188,91,' + alpha.toFixed(3) + ')' : 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
        window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    });
  }

  /* ---------- 3D tilt on Hero Six-Moment Dial ---------- */
  if (dialRoot && !reduce && window.matchMedia('(pointer:fine)').matches) {
    dialRoot.addEventListener('pointermove', function (e) {
      var r = dialRoot.getBoundingClientRect();
      var dx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      var dy = ((e.clientY - r.top) / r.height - 0.5) * -10;
      dialRoot.style.transform = 'perspective(900px) rotateX(' + dy.toFixed(2) + 'deg) rotateY(' + dx.toFixed(2) + 'deg)';
    });
    dialRoot.addEventListener('pointerleave', function () {
      dialRoot.style.transform = '';
    });
  }

  /* ---------- interactive 3D W100 hardware modeling & exploded view ---------- */
  var modelCard = $('#model3d');
  if (modelCard) {
    var vp = $('#stage3dViewport', modelCard);
    var btnExplode = $('#m3dExplode', modelCard);
    var btnDual = $('#m3dDual', modelCard);
    var btnFlip = $('#m3dFlip', modelCard);
    var btnAlert = $('#m3dAlert', modelCard);
    var btnReset = $('#m3dReset', modelCard);
    var m3dLids = $$('.m3d-lid', modelCard);

    var rx = 60, rz = -26, dragging = false, sx = 0, sy = 0, baseRx = 60, baseRz = -26, downLid = null;
    var autoOrbit = !reduce;

    var syncButtons = function () {
      var ex = modelCard.classList.contains('is-exploded');
      var du = modelCard.classList.contains('is-dual');
      var al = modelCard.classList.contains('is-alert');
      var fl = rx > 92;
      if (btnExplode) { btnExplode.classList.toggle('is-active', ex); btnExplode.setAttribute('aria-pressed', ex ? 'true' : 'false'); }
      if (btnDual) { btnDual.classList.toggle('is-active', du); btnDual.setAttribute('aria-pressed', du ? 'true' : 'false'); }
      if (btnFlip) { btnFlip.classList.toggle('is-active', fl); btnFlip.setAttribute('aria-pressed', fl ? 'true' : 'false'); }
      if (btnAlert) { btnAlert.classList.toggle('is-active', al); btnAlert.setAttribute('aria-pressed', al ? 'true' : 'false'); }
    };

    var applyRig = function () {
      if (!vp) return;
      vp.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      vp.style.setProperty('--rz', rz.toFixed(2) + 'deg');
      var fl = rx > 92;
      modelCard.classList.toggle('is-flipped', fl);
      if (btnFlip) {
        btnFlip.classList.toggle('is-active', fl);
        btnFlip.setAttribute('aria-pressed', fl ? 'true' : 'false');
      }
    };
    applyRig();

    if (vp) {
      vp.addEventListener('pointerdown', function (e) {
        dragging = true; autoOrbit = false;
        sx = e.clientX; sy = e.clientY;
        baseRx = rx; baseRz = rz;
        downLid = e.target && e.target.closest ? e.target.closest('.m3d-lid') : null;
        vp.classList.add('is-dragging');
        if (vp.setPointerCapture) vp.setPointerCapture(e.pointerId);
      });
      vp.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - sx;
        var dy = e.clientY - sy;
        rz = baseRz + dx * 0.45;
        rx = Math.max(15, Math.min(165, baseRx - dy * 0.45));
        applyRig();
      });
      var stopDrag = function (e) {
        if (!dragging) return;
        dragging = false;
        vp.classList.remove('is-dragging');
        if (e && downLid && Math.hypot(e.clientX - sx, e.clientY - sy) < 6) {
          var isOpen = downLid.classList.toggle('is-open');
          var lidNum = downLid.getAttribute('data-lid');
          if (lidNum) {
            var cluster = $('.m3d-led-cluster[data-slot="' + lidNum + '"]', modelCard);
            if (cluster) cluster.classList.toggle('is-lit', isOpen);
          }
        }
        downLid = null;
      };
      vp.addEventListener('pointerup', stopDrag);
      vp.addEventListener('pointercancel', function () { dragging = false; downLid = null; vp.classList.remove('is-dragging'); });
    }

    if (btnExplode) {
      btnExplode.addEventListener('click', function () {
        modelCard.classList.remove('is-dual');
        modelCard.classList.toggle('is-exploded');
        if (modelCard.classList.contains('is-exploded')) {
          rx = rx > 92 ? 124 : 54;
          rz = -34;
          autoOrbit = false;
          applyRig();
        }
        syncButtons();
      });
    }
    if (btnDual) {
      btnDual.addEventListener('click', function () {
        modelCard.classList.remove('is-exploded');
        modelCard.classList.toggle('is-dual');
        if (modelCard.classList.contains('is-dual')) {
          rx = 68; rz = -34; autoOrbit = false; applyRig();
        }
        syncButtons();
      });
    }
    if (btnFlip) {
      btnFlip.addEventListener('click', function () {
        autoOrbit = false;
        rx = rx > 92 ? 60 : 128;
        rz = -26;
        applyRig();
        syncButtons();
      });
    }
    if (btnAlert) {
      btnAlert.addEventListener('click', function () {
        modelCard.classList.toggle('is-alert');
        syncButtons();
      });
    }
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        modelCard.classList.remove('is-exploded', 'is-dual', 'is-alert');
        m3dLids.forEach(function (l) { l.classList.remove('is-open'); });
        $$('.m3d-led-cluster', modelCard).forEach(function (c) { c.classList.remove('is-lit'); });
        rx = 60; rz = -26; autoOrbit = !reduce;
        applyRig();
        syncButtons();
      });
    }

    // Default alert pulse on load so visitors immediately see the 3D LED & lid animation
    modelCard.classList.add('is-alert');
    syncButtons();

    if (!reduce) {
      var orbitVisible = true;
      if ('IntersectionObserver' in window) {
        var mio = new IntersectionObserver(function (entries) {
          orbitVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        mio.observe(modelCard);
      }
      var tickOrbit = function () {
        if (autoOrbit && orbitVisible && !dragging) {
          rz += 0.14;
          applyRig();
        }
        window.requestAnimationFrame(tickOrbit);
      };
      window.requestAnimationFrame(tickOrbit);
    }
  }
})();
