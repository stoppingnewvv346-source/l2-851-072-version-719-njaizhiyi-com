(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var q = panel.querySelector("[data-filter-query]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var category = panel.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);

    if (q && params.get("q")) {
      q.value = params.get("q");
    }
    if (year && params.get("year")) {
      year.value = params.get("year");
    }
    if (type && params.get("type")) {
      type.value = params.get("type");
    }
    if (category && params.get("category")) {
      category.value = params.get("category");
    }

    function apply() {
      var needle = normalize(q ? q.value : "");
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var selectedCategory = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.textContent
        ].join(" "));
        var ok = true;
        if (needle && haystack.indexOf(needle) === -1) {
          ok = false;
        }
        if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
          ok = false;
        }
        if (selectedType && card.getAttribute("data-type") !== selectedType) {
          ok = false;
        }
        if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [q, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function bindPlayers() {
    document.querySelectorAll(".movie-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-cover");
      var src = player.getAttribute("data-src");
      var initialized = false;
      var hls = null;

      function initialize() {
        if (!video || !src || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        }
      }

      function play() {
        initialize();
        if (button) {
          button.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    bindPlayers();
  });
})();
