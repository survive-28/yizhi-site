/* YIZHI site interactions: nav, i18n, countdown, reveal, calendar */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (new URLSearchParams(window.location.search).has('static')) root.classList.add('no-anim');

  /* ---------- header state ---------- */
  var header = $('#siteHeader');
  var toTop = $('#toTop');
  var logoColor = $('[data-logo="color"]');
  var logoReverse = $('[data-logo="reverse"]');
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (toTop) toTop.classList.toggle('on', y > 700);
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

  /* ---------- language ---------- */
  var langToggle = $('#langToggle');
  var langLabel = $('[data-lang-label]');
  var stored = null;
  try { stored = window.localStorage.getItem('yizhi-lang'); } catch (e) {}
  var query = new URLSearchParams(window.location.search).get('lang');
  var lang = query === 'zh' || query === 'en' ? query : (stored === 'zh' || stored === 'en' ? stored : 'en');

  function capture() {
    $$('[data-zh]').forEach(function (el) {
      if (el.getAttribute('data-en-html') === null) el.setAttribute('data-en-html', el.innerHTML);
    });
    $$('[data-zh-aria-label]').forEach(function (el) {
      if (el.getAttribute('data-en-aria') === null) el.setAttribute('data-en-aria', el.getAttribute('aria-label') || '');
    });
    $$('[data-zh-placeholder]').forEach(function (el) {
      if (el.getAttribute('data-en-placeholder') === null) el.setAttribute('data-en-placeholder', el.getAttribute('placeholder') || '');
    });
    $$('[data-zh-alt]').forEach(function (el) {
      if (el.getAttribute('data-en-alt') === null) el.setAttribute('data-en-alt', el.getAttribute('alt') || '');
    });
  }

  function applyLang(next) {
    lang = next;
    var zh = next === 'zh';
    root.setAttribute('lang', zh ? 'zh-CN' : 'en');
    $$('[data-zh]').forEach(function (el) {
      el.innerHTML = zh ? el.getAttribute('data-zh') : el.getAttribute('data-en-html');
    });
    $$('[data-zh-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', zh ? el.getAttribute('data-zh-aria-label') : el.getAttribute('data-en-aria'));
    });
    $$('[data-zh-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', zh ? el.getAttribute('data-zh-placeholder') : el.getAttribute('data-en-placeholder'));
    });
    $$('[data-zh-alt]').forEach(function (el) {
      el.setAttribute('alt', zh ? el.getAttribute('data-zh-alt') : el.getAttribute('data-en-alt'));
    });
    if (langLabel) langLabel.textContent = zh ? 'EN' : '中文';
    if (langToggle) langToggle.setAttribute('aria-label', zh ? 'Switch to English' : '切换到中文');
    try { window.localStorage.setItem('yizhi-lang', next); } catch (e) {}
    doc.dispatchEvent(new CustomEvent('yizhi:lang', { detail: next }));
  }

  capture();
  applyLang(lang);
  if (langToggle) {
    langToggle.addEventListener('click', function () { applyLang(lang === 'zh' ? 'en' : 'zh'); });
  }

  /* ---------- countdown ---------- */
  var countdowns = $$('.countdown[data-launch]');
  if (countdowns.length) {
    var target = new Date(countdowns[0].getAttribute('data-launch')).getTime();
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var tick = function () {
      var diff = target - Date.now();
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
        'UID:w100-launch-20261212@yizhi-care.com',
        'DTSTAMP:20261101T000000Z',
        'DTSTART:20261124T070000Z',
        'DTEND:20261124T090000Z',
        'SUMMARY:Healthcare Nurse W100 - Global Launch',
        'LOCATION:Room SA308, Xuesi Building, SUIBE, Songjiang, Shanghai, China',
        'DESCRIPTION:Live demonstration and channel programme. Exhibition booth in Room SA407, same building, same day.',
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

  /* ---------- reveal ---------- */
  var items = $$('.reveal');
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
          else if (a.getAttribute('aria-current') === 'page' && href.indexOf('launch') === -1) a.removeAttribute('aria-current');
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
        if (label) label.textContent = lang === 'zh' ? '提交中……' : 'Sending…';
      }
    });
  });
})();
