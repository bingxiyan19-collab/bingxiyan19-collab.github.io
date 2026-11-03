/* 张琦瑞 · 作品集 —— 交互脚本 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* 1. 阻止内置锚点拦截逻辑干扰 mailto / tel 链接 */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^(mailto:|tel:)/i.test(href)) {
      e.stopPropagation();
    }
  }, true);

  /* 2. 顶栏吸顶状态 + 阅读进度 */
  var bar = doc.getElementById('progressBar');
  var topbar = doc.querySelector('.topbar');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || root.scrollTop;
    if (bar) {
      var h = doc.body.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    if (topbar) {
      topbar.classList.toggle('is-stuck', y > 8);
    }
    updateActiveNav();
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* 3. 入场动效 */
  var revealables = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 4. 导航高亮（按滚动位置计算，回到顶部时自动清空） */
  var navLinks = [].slice.call(doc.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (a) {
    return doc.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  function updateActiveNav() {
    if (!sections || !sections.length) return;
    var probe = (window.scrollY || root.scrollTop) + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) {
      if (s.offsetTop <= probe) current = s;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', !!current && a.getAttribute('href') === '#' + current.id);
    });
  }
  updateActiveNav();

  /* 5. 视频：点击封面播放 */
  [].slice.call(doc.querySelectorAll('.media')).forEach(function (media) {
    var video = media.querySelector('video');
    var trigger = media.querySelector('.play');
    if (!video) return;

    media.addEventListener('click', function (e) {
      if (media.classList.contains('is-playing')) return;
      e.preventDefault();
      media.classList.add('is-playing');
      video.currentTime = 0;
      var playing = video.play();
      if (playing && playing.catch) {
        playing.catch(function () { media.classList.remove('is-playing'); });
      }
    });

    if (trigger) {
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          media.click();
        }
      });
    }

    video.addEventListener('ended', function () {
      media.classList.remove('is-playing');
    });
  });

  /* 6. 复制微信号 */
  var toast = doc.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  doc.body.appendChild(toast);
  var toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2400);
  }

  function copyText(text) {
    return new Promise(function (resolve, reject) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(resolve).catch(reject);
        return;
      }
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      doc.body.appendChild(ta);
      ta.select();
      try {
        doc.execCommand('copy') ? resolve() : reject();
      } catch (err) {
        reject(err);
      }
      doc.body.removeChild(ta);
    });
  }

  [].slice.call(doc.querySelectorAll('[data-copy]')).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var value = btn.getAttribute('data-copy');
      var tip = btn.getAttribute('data-copy-tip') || ('已复制：' + value);
      copyText(value).then(function () {
        showToast(tip);
      }).catch(function () {
        showToast('复制失败，请手动复制：' + value);
      });
    });
  });

  /* 7. 同屏只展开一个复盘 */
  var cases = [].slice.call(doc.querySelectorAll('details.case'));
  cases.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      cases.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
