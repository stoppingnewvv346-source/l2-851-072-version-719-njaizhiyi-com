(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-mobile-toggle]');
  var panel = qs('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  qsa('[data-hero]').forEach(function(hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach(function(panelNode) {
    var queryInput = qs('[data-filter-query]', panelNode);
    var regionSelect = qs('[data-filter-region]', panelNode);
    var yearSelect = qs('[data-filter-year]', panelNode);
    var grid = qs('[data-filter-grid]') || panelNode.nextElementSibling;
    var status = qs('[data-filter-status]', panelNode);
    var cards = qsa('[data-filter-card]', grid || document);

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        card.classList.toggle('is-hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '当前显示 ' + visible + ' 部内容' : '没有匹配的内容';
      }
    }

    [queryInput, regionSelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  function createSearchCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="movie-cover" href="./' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
      '<span class="cover-shade"></span>',
      '<span class="play-badge">▶</span>',
      '<span class="card-badge">' + escapeHtml(item.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.desc) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>★ ' + escapeHtml(item.rating) + '</span></div>',
      '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var searchResults = qs('[data-search-results]');
  var searchSummary = qs('[data-search-summary]');
  var searchInput = qs('[data-search-input]');
  if (searchResults && window.MovieCatalog) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }
    if (query) {
      var words = query.toLowerCase().split(/\s+/).filter(Boolean);
      var results = window.MovieCatalog.filter(function(item) {
        var text = [item.title, item.region, item.year, item.type, item.genre, item.tags, item.category].join(' ').toLowerCase();
        return words.every(function(word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      searchResults.innerHTML = results.map(createSearchCard).join('');
      if (searchSummary) {
        searchSummary.textContent = results.length ? '为你找到 ' + results.length + ' 部相关内容。' : '没有找到匹配内容，可尝试更换关键词。';
      }
    }
  }
})();

function initMoviePlayer(url) {
  var frame = document.querySelector('[data-player-frame]');
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  if (!frame || !video || !overlay || !url) {
    return;
  }

  var ready = false;
  var hlsInstance = null;

  function showError() {
    overlay.classList.remove('is-hidden');
    overlay.innerHTML = '<span class="player-icon">↻</span><span class="player-title">播放暂时不可用，请稍后重试</span>';
  }

  function startPlayback() {
    overlay.classList.add('is-hidden');

    if (ready) {
      video.play().catch(function() {});
      return;
    }

    ready = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {});
      });
      hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          showError();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', function() {
        video.play().catch(function() {});
      }, { once: true });
    } else {
      showError();
    }
  }

  overlay.addEventListener('click', startPlayback);
  frame.addEventListener('click', function(event) {
    if (event.target === overlay || overlay.contains(event.target)) {
      return;
    }
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
