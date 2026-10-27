// Сайт собирается из data/content.json (его правит админка).
// В html лежит та же информация — запасной вариант для поисковиков и если скрипт не загрузился.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var ARROW = '<svg><use href="#i-arrow"/></svg>';

  // телефон → 79139706240
  function digits(p) {
    var d = String(p || '').replace(/\D/g, '');
    if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
    if (d.length === 10) d = '7' + d;
    return d;
  }
  // короткие предлоги не отрываются от следующего слова
  function nb(t) { return esc(t).replace(/(^|\s)(в|и|с|к|у|о|а|на|по|до|за|от|не|из|их|я)\s/gi, '$1$2&nbsp;').replace(/(\d)\s(?=[а-яё])/gi, '$1&nbsp;'); }
  function title(el, t, em) { if (el) el.innerHTML = nb(t) + (em ? ' <em>' + nb(em) + '</em>' : ''); }
  function over(el, t) { if (el && t) el.innerHTML = '<span class="line"></span>' + esc(t); }
  function img(el, src, pos) { if (el && src) { el.src = src; el.style.objectPosition = pos || ''; } }
  function list(el, items, fn) { if (el) el.innerHTML = (items || []).map(fn).join(''); }
  function has(v) { return v != null && String(v).trim() !== ''; }

  function render(c) {
    var h = c.hero, k = c.contacts, ph = digits(k.phone);
    window.EL_PHONE = ph; window.EL_PHONE_TXT = k.phone;

    // первый экран
    over($('.hero .over'), h.over);
    title($('.hero h1'), h.title, h.title_em);
    $('.hero .lead').textContent = h.lead;
    // «… — бесплатно»: часть после тире выделяется
    var fr = /^(.*—\s*)(.+)$/.exec(h.free || '');
    $('.hero .free span').innerHTML = fr ? esc(fr[1]) + '<b>' + esc(fr[2]) + '</b>' : esc(h.free);
    $('.hero .free').hidden = !has(h.free);
    img($('.hero-photo img'), h.photo, h.photo_pos);

    // цифры: «1000+» — число отсчитывается, остальное как есть
    list($('.facts'), c.facts, function (f) {
      var m = /^(\d+)(.*)$/.exec(String(f.b).trim());
      // длинное значение («12000+», «с 2004») пишем мельче, чтобы влезло в ячейку на телефоне
      var long = String(f.b).replace(/\s/g, '').length > 5 && !/\s/.test(String(f.b).trim());
      return '<div class="fact' + (long ? ' fact-long' : '') + ' rv"><b>' + (m ? '<span data-count="' + m[1] + '">' + m[1] + '</span>' + esc(m[2]) : esc(f.b)) + '</b><span>' + esc(f.s) + '</span></div>';
    });

    // бегущая строка (дважды — для бесконечной прокрутки)
    var mq = (c.practice.marquee || []).filter(has).map(function (s) { return '<span>' + esc(s) + '</span><i>✦</i>'; }).join('');
    if (mq) $('.mq-in').innerHTML = mq + mq;

    // направления
    var p = c.practice;
    title($('#practice h2'), p.title, p.title_em);
    var cards = p.items.map(function (it, i) {
      return '<article class="pcard' + (it.dark ? ' pcard-dark' : '') + ' rv"><span class="pnum">' + (ROMAN[i] || i + 1) + '</span><h3>' + nb(it.title) + '</h3><ul>' +
        (it.points || []).filter(has).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<a href="#write" data-topic="' + esc(it.topic || it.title) + '" class="plink">Описать ситуацию' + ARROW + '</a></article>';
    });
    if ((p.no_points || []).filter(has).length) cards.push('<article class="pcard pcard-no rv"><span class="pnum"><svg><use href="#i-x"/></svg></span><h3>' + nb(p.no_title) + '</h3><ul>' +
      p.no_points.filter(has).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + (has(p.no_note) ? '<p class="pno">' + esc(p.no_note) + '</p>' : '') + '</article>');
    $('.pr-track').innerHTML = cards.join('');

    // темы в «Написать» — из направлений
    $('.topics').innerHTML = p.items.map(function (it) {
      return '<button type="button" class="topic" data-topic="' + esc(it.topic || it.title) + '" role="radio" aria-checked="false">' + esc(it.btn || it.title) + '</button>';
    }).join('') + '<button type="button" class="topic" data-topic="Другой вопрос" role="radio" aria-checked="false">Другое</button>';

    // практика
    var cs = c.cases;
    title($('#cases h2'), cs.title, cs.title_em);
    list($('.case-list'), cs.items, function (x) {
      return '<article class="case rv">' + (has(x.tag) ? '<p class="case-tag">' + esc(x.tag) + '</p>' : '') + '<h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p>' +
        (has(x.result) ? '<p class="case-res"><span>Итог</span>' + esc(x.result) + '</p>' : '') + '</article>';
    });
    $('.case-note').textContent = cs.note || '';
    $('.case-note').hidden = !has(cs.note);
    $('#cases').hidden = !cs.items.length;

    // отзывы
    var rv = c.reviews;
    over($('#reviews .over'), rv.over);
    title($('#reviews h2'), rv.title, rv.title_em);
    $('.rev-link').hidden = !has(rv.link);
    if (has(rv.link)) $('.rev-link').href = rv.link;
    list($('.rev-track'), rv.items, function (r) {
      return '<article class="rev rv">' + (has(r.tag) ? '<p class="rev-tag">' + esc(r.tag) + '</p>' : '') + '<p class="rev-t">' + esc(r.text) + '</p><p class="rev-a"><b>' + esc(r.author) + '</b>' +
        (has(r.date) ? '<span>' + esc(r.date) + (/авито/i.test(rv.over + rv.link) ? ' · Авито' : '') + '</span>' : '') + '</p></article>';
    });
    $('#reviews').hidden = !rv.items.length;
    var navRev = $('.nav a[href="#reviews"]'); if (navRev) navRev.hidden = !rv.items.length;
    var navCases = $('.nav a[href="#cases"]'); if (navCases) navCases.hidden = !cs.items.length;

    // как работаю
    var hw = c.how;
    over($('#how .over'), hw.over);
    title($('#how h2'), hw.title, hw.title_em);
    $('#how .txt').textContent = hw.text;
    list($('.steps'), hw.steps, function (s) { return '<li class="rv"><b>' + esc(s.title) + '</b><p>' + esc(s.text) + '</p></li>'; });

    // оплата
    list($('.pay'), c.pay, function (x, i) {
      return '<div class="pay-card' + (i === c.pay.length - 1 ? ' pay-gold' : '') + ' rv"><span class="pay-i">' + ('0' + (i + 1)).slice(-2) + '</span><b>' + esc(x.title) + '</b><p>' + esc(x.text) + '</p></div>';
    });

    // обо мне
    var a = c.about;
    title($('#about h2'), a.title, a.title_em);
    $('#about .txt').textContent = a.text;
    $('#about .quote').innerHTML = nb(a.quote);
    $('#about .quote').hidden = !has(a.quote);
    $('#about .sign').textContent = a.sign || '';
    img($('.about-pic img'), a.photo, a.photo_pos);

    // контакты и ссылки на мессенджеры
    var tg = 'https://t.me/+' + ph, vk = 'https://vk.ru/' + String(k.vk || '').replace(/^.*vk\.(com|ru)\//, '').replace(/^\/+/, '');
    document.querySelectorAll('a[href^="https://t.me/"]').forEach(function (el) { el.href = tg; });
    document.querySelectorAll('a[href^="https://vk.me/"]').forEach(function (el) { el.href = vk.replace('vk.ru/', 'vk.me/'); });
    $('#contacts .txt').textContent = k.text || '';
    var cl = [['Telegram · MAX', k.phone, tg, k.note], ['ВКонтакте', vk.replace('https://', ''), vk], ['Город', k.city]];
    list($('.clist'), cl.filter(function (r) { return has(r[1]); }), function (r) {
      return '<li><span>' + r[0] + '</span>' + (r[2] ? '<a href="' + esc(r[2]) + '" target="_blank" rel="noopener">' + esc(r[1]) + '</a>' : '<b>' + esc(r[1]) + '</b>') + (r[3] ? '<small>' + esc(r[3]) + '</small>' : '') + '</li>';
    });
  }

  // откуда брать контент: черновик демо-админки (только на демо) → встроенная копия (data/content.js) → свежий content.json
  var demoHost = /github\.io$/.test(location.hostname) || location.protocol === 'file:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  function withDraft(c) {
    if (!demoHost) return c;
    try {
      var d = JSON.parse(localStorage.getItem('el_draft') || 'null');
      if (d && d.rev === c.rev && d.data) return d.data;   // черновик со старой версии сайта сбрасывается
      if (d) localStorage.removeItem('el_draft');
    } catch (e) {}
    return c;
  }
  var shown = null;
  function show(c) {
    try { render(c); shown = JSON.stringify(c); }
    catch (e) { console.error('Не удалось собрать сайт из данных', e); }
  }
  // сначала — сразу из встроенной копии, чтобы анимации запустились по готовому тексту
  if (window.EL_SEED) show(withDraft(window.EL_SEED));
  // браузер мог взять старую копию из кеша — сверяем со свежим файлом и, если Елена что-то поменяла, обновляем
  if (location.protocol !== 'file:') {
    fetch('data/content.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (c) {
      c = withDraft(c);
      if (JSON.stringify(c) === shown) return;
      show(c);
      // новые блоки появились уже после запуска анимаций — показываем их сразу
      document.querySelectorAll('.rv, [data-split]').forEach(function (el) { el.classList.add('in'); });
      dispatchEvent(new Event('resize'));
      document.dispatchEvent(new CustomEvent('content:changed'));
    }).catch(function () {});
  }
})();
