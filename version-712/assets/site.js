(function () {
  function closest(root, selector) {
    return root ? root.closest(selector) : null;
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));

    areas.forEach(function (area) {
      var searchInput = area.querySelector("[data-search-input]");
      var categorySelect = area.querySelector("[data-filter-select]");
      var yearSelect = area.querySelector("[data-year-select]");
      var typeSelect = area.querySelector("[data-type-select]");
      var section = closest(area, "main") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));

      function apply() {
        var query = normalize(searchInput && searchInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" "));

          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }

          if (category && normalize(card.getAttribute("data-category")) !== category) {
            ok = false;
          }

          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }

          if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
            ok = false;
          }

          card.classList.toggle("hidden-card", !ok);
        });
      }

      [searchInput, categorySelect, yearSelect, typeSelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && searchInput) {
        searchInput.value = q;
      }

      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");

    if (!video) {
      return;
    }

    var shell = closest(video, ".player-shell");
    var playButton = document.querySelector("[data-play-button]");
    var stream = video.getAttribute("data-stream");

    if (stream) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        if (window.Hls.Events && window.Hls.ErrorTypes) {
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        }

        window.addEventListener("beforeunload", function () {
          hls.destroy();
        });
      } else {
        video.src = stream;
      }
    }

    function updateState() {
      if (shell) {
        shell.classList.toggle("is-playing", !video.paused);
      }
    }

    function togglePlay(event) {
      if (event) {
        event.preventDefault();
      }

      if (video.paused) {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }

      updateState();
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    video.addEventListener("click", function (event) {
      if (event.target === video) {
        togglePlay(event);
      }
    });

    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);
    video.addEventListener("ended", updateState);
    updateState();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
