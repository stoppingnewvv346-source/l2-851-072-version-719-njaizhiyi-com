(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
      menuButton.addEventListener("click", function () {
        mainNav.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-backtop]");

    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;

      function showSlide(index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide((current + 1) % slides.length);
        }, 5000);
      }
    }

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
      var input = filterRoot.querySelector("[data-filter-input]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var type = filterRoot.querySelector("[data-filter-type]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".filter-card"));
      var empty = filterRoot.querySelector("[data-empty]");

      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function filterCards() {
        var q = valueOf(input);
        var r = valueOf(region);
        var t = valueOf(type);
        var y = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.keywords
          ].join(" ").toLowerCase();
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && String(card.dataset.region || "").toLowerCase() !== r) {
            ok = false;
          }
          if (t && String(card.dataset.type || "").toLowerCase() !== t) {
            ok = false;
          }
          if (y && String(card.dataset.year || "").toLowerCase() !== y) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [input, region, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener("input", filterCards);
          node.addEventListener("change", filterCards);
        }
      });
    }
  });
})();
