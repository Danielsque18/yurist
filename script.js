document.documentElement.classList.add('js');
var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
var PHONE = '79139706240';

// заголовки проявляются по словам
document.querySelectorAll('[data-split]').forEach(function (h) {
  var i = 0;
  (function walk(node) {
    [].slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
          w.appendChild(s); frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  })(h);
});

// появление при прокрутке (без обработчика scroll)
(function () {
  var els = document.querySelectorAll('[data-split], .rv');
  document.querySelectorAll('.rv').forEach(function (e) { e.style.setProperty('--d', [].indexOf.call(e.parentNode.children, e) % 6); });
  if (!('IntersectionObserver' in window) || calm) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach(function (e) { io.observe(e); });
  // первый экран — сразу
  document.querySelectorAll('.hero [data-split]').forEach(function (e) { setTimeout(function () { e.classList.add('in'); }, 250); });
})();

// цифры отсчитываются
(function () {
  var nums = document.querySelectorAll('[data-count]'); if (!nums.length || calm) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      var el = e.target, to = +el.dataset.count, t0 = performance.now();
      (function step(t) { var p = Math.min(1, (t - t0) / 1600); p = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * p); if (p < 1) requestAnimationFrame(step); })(t0);
    });
  }, { threshold: .6 });
  nums.forEach(function (n) { n.textContent = '0'; io.observe(n); });
})();

// прокрутка: фото на первом экране, «20» на фоне, горизонтальная лента направлений, фото «Обо мне»
(function () {
  var heroImg = document.querySelector('.hero-photo img'), num = document.querySelector('.hero-num');
  var pr = document.getElementById('practice'), sticky = pr.querySelector('.pr-sticky'), track = pr.querySelector('.pr-track'), bar = pr.querySelector('.pr-progress i');
  var aboutImg = document.querySelector('.about-pic img'), top = document.getElementById('top');
  var desk = matchMedia('(min-width: 701px)'), raf = 0, extra = 0;
  function size() {
    if (!desk.matches) { pr.style.height = ''; return; }
    var pad = parseFloat(getComputedStyle(track).paddingLeft) || 20;   // отступ справа = отступу слева
    extra = Math.max(0, track.scrollWidth + pad - innerWidth);
    pr.style.height = (innerHeight + extra) + 'px';
  }
  function paint() {
    raf = 0; var y = scrollY, h = innerHeight;
    top.classList.toggle('slim', y > 40);
    if (calm) return;
    if (y < h * 1.2) {
      heroImg.style.transform = 'translate3d(0,' + (y * .18) + 'px,0) scale(' + (1.12 - Math.min(y / h, 1) * .08) + ')';
      if (num) num.style.transform = 'translate3d(0,' + (y * -.25) + 'px,0)';
    }
    if (desk.matches && extra) {
      var r = pr.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (r.height - h)));
      track.style.transform = 'translate3d(' + (-extra * p) + 'px,0,0)';
      bar.style.transform = 'scaleX(' + p + ')';
    }
    if (aboutImg) {
      var a = aboutImg.parentNode.getBoundingClientRect();
      if (a.bottom > 0 && a.top < h) aboutImg.style.transform = 'translate3d(0,' + ((a.top + a.height / 2 - h / 2) * -.06) + 'px,0) scale(1.08)';
    }
  }
  function ask() { if (!raf) raf = requestAnimationFrame(paint); }
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', function () { size(); ask(); });
  addEventListener('load', function () { size(); ask(); });
  heroImg.addEventListener('animationend', function () { heroImg.style.animation = 'none'; ask(); });
  size(); paint();
})();

// меню: подсветка раздела, бургер
(function () {
  var top = document.getElementById('top'), b = top.querySelector('.burger'), links = {};
  b.addEventListener('click', function () { var o = top.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  top.querySelectorAll('.nav a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
    a.addEventListener('click', function () { top.classList.remove('open'); b.setAttribute('aria-expanded', false); });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === e.target.id); }); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(links).forEach(function (k) { var el = document.getElementById(k); if (el) io.observe(el); });
})();

// «С чем вы пришли?» — готовое сообщение Елене (ничего не сохраняется)
(function () {
  var letter = document.getElementById('letter'), toast = document.getElementById('toast');
  var topics = document.querySelectorAll('.topic'), text = '';
  function build(topic) {
    text = 'Здравствуйте, Елена! Пишу с сайта. ' + (topic && topic !== 'Другой вопрос' ? 'Тема: ' + topic + '. ' : '') + 'Хочу получить оценку моей ситуации. Коротко: …';
    letter.style.opacity = 0;
    setTimeout(function () { letter.textContent = text; letter.style.opacity = 1; }, 180);
    topics.forEach(function (t) { var on = t.dataset.topic === topic; t.classList.toggle('on', on); t.setAttribute('aria-checked', on); });
  }
  topics.forEach(function (t) { t.addEventListener('click', function () { build(t.dataset.topic); }); });
  // «Описать ситуацию» в карточках направлений — сразу выбирает тему
  document.querySelectorAll('.plink[data-topic]').forEach(function (a) { a.addEventListener('click', function () { build(a.dataset.topic); }); });
  function say(t) { toast.textContent = t; toast.hidden = false; clearTimeout(say.t); say.t = setTimeout(function () { toast.hidden = true; }, 2600); }
  // копируем сразу, в момент нажатия (Safari не даёт копировать после открытия новой вкладки)
  function copy(done) {
    var a = document.createElement('textarea'), ok = false;
    a.value = text; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = 0; document.body.appendChild(a); a.select();
    try { ok = document.execCommand('copy'); } catch (e) {}
    a.remove();
    if (!ok && navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    done && done();
  }
  document.getElementById('copyTg').addEventListener('click', function () {
    copy(function () { say('Текст скопирован — вставьте его в чат'); });
    window.open('https://t.me/+' + PHONE, '_blank', 'noopener');
  });
  document.getElementById('copyOnly').addEventListener('click', function () { copy(function () { say('Текст скопирован — напишите в MAX на номер 8-913-970-62-40'); }); });
  build('');
})();

// нижняя кнопка на телефоне прячется на первом экране и у блока «Написать»
(function () {
  var fab = document.querySelector('.fab'), vis = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; });
    fab.classList.toggle('off', !!(vis.hero || vis.write || vis.contacts));
  }, { threshold: .05 });
  ['hero', 'write', 'contacts'].forEach(function (id) { io.observe(document.getElementById(id)); });
})();
