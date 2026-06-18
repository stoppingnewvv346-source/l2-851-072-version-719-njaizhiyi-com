(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));

  filterBlocks.forEach(function (block) {
    var searchInput = block.querySelector('[data-search-input]');
    var regionSelect = block.querySelector('[data-filter-region]');
    var typeSelect = block.querySelector('[data-filter-type]');
    var yearSelect = block.querySelector('[data-filter-year]');
    var resetButton = block.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(block.querySelectorAll('[data-search-card]'));
    var empty = block.querySelector('[data-empty-state]');

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var term = normalized(searchInput ? searchInput.value : '');
      var region = normalized(regionSelect ? regionSelect.value : '');
      var type = normalized(typeSelect ? typeSelect.value : '');
      var year = normalized(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesRegion = !region || normalized(card.getAttribute('data-region')) === region;
        var matchesType = !type || normalized(card.getAttribute('data-type')) === type;
        var matchesYear = !year || normalized(card.getAttribute('data-year')) === year;
        var matched = matchesTerm && matchesRegion && matchesType && matchesYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        apply();
      });
    }

    apply();
  });
})();
