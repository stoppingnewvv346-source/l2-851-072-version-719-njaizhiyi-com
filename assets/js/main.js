(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function openSearch(query) {
    var target = './movies.html';
    if (query) {
      target += '?q=' + encodeURIComponent(query);
    }
    window.location.href = target;
  }

  function initGlobalSearch() {
    document.querySelectorAll('.js-site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        openSearch(input ? input.value.trim() : '');
      });
    });
  }

  function initMobileNav() {
    var button = document.querySelector('.js-mobile-menu');
    var nav = document.querySelector('.js-mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('.js-hero-carousel');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLocalFilter() {
    var form = document.querySelector('.js-local-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    if (!form || !cards.length) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var empty = document.querySelector('.js-filter-empty');
    var params = new URLSearchParams(window.location.search);

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.dataset.search || '';
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    applyFilter();
  }

  function playVideo(video, frame, overlay, status) {
    if (status) {
      status.textContent = '';
      status.classList.remove('is-visible');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (status) {
          status.textContent = '点击视频区域继续播放';
          status.classList.add('is-visible');
        }
      });
    }
    frame.classList.add('is-playing');
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  function initPlayer(frame) {
    var source = frame.dataset.source;
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    var status = frame.querySelector('.player-status');

    if (!source || !video) {
      return;
    }

    function setStatus(message) {
      if (!status) {
        return;
      }
      status.textContent = message;
      status.classList.toggle('is-visible', Boolean(message));
    }

    function start() {
      if (frame.dataset.ready === '1') {
        playVideo(video, frame, overlay, status);
        return;
      }

      frame.dataset.ready = '1';

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        frame._hls = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video, frame, overlay, status);
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败，请稍后重试');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          playVideo(video, frame, overlay, status);
        }, { once: true });
        video.load();
        return;
      }

      setStatus('当前浏览器不支持在线播放');
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    frame.addEventListener('click', function (event) {
      if (event.target === frame) {
        start();
      }
    });

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        frame.classList.remove('is-playing');
        if (overlay) {
          overlay.removeAttribute('aria-hidden');
        }
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll('.js-player').forEach(initPlayer);
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  ready(function () {
    initGlobalSearch();
    initMobileNav();
    initHeroCarousel();
    initLocalFilter();
    initPlayers();
    initImages();
  });
})();
