(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs("[data-menu-toggle]");
  var panel = qs("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  var slides = qsa("[data-hero-slide]");
  var dots = qsa("[data-hero-dot]");
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function resultCard(item) {
    return [
      '<a class="search-result" href="' + item.href + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
      '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.meta) + '</small></span>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindSearch(input) {
    var container = input.closest(".site-search") || input.closest(".hero-search-card") || document;
    var result = qs("[data-search-panel]", container);
    if (!result) {
      return;
    }

    input.addEventListener("input", function() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        result.classList.remove("is-open");
        result.innerHTML = "";
        return;
      }
      var list = (window.siteMovies || []).filter(function(item) {
        return item.text.toLowerCase().indexOf(query) > -1;
      }).slice(0, 12);
      result.innerHTML = list.length ? list.map(resultCard).join("") : '<div class="search-empty">暂无匹配内容</div>';
      result.classList.add("is-open");
    });
  }

  qsa("[data-site-search]").forEach(bindSearch);

  document.addEventListener("click", function(event) {
    qsa("[data-search-panel]").forEach(function(result) {
      if (!result.contains(event.target)) {
        var input = result.parentElement ? qs("[data-site-search]", result.parentElement) : null;
        if (input !== event.target) {
          result.classList.remove("is-open");
        }
      }
    });
  });

  var pageFilter = qs("[data-page-filter]");
  var scope = qs("[data-filter-scope]");
  var empty = qs("[data-empty-state]");
  if (pageFilter && scope) {
    var cards = qsa(".movie-card", scope);
    pageFilter.addEventListener("input", function() {
      var query = pageFilter.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var match = !query || text.indexOf(query) > -1;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }
})();
