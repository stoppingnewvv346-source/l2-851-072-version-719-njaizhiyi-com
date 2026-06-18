(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-movie-search]');
    var year = scope.querySelector('[data-year-filter]');
    var category = scope.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var q = normalize(search ? search.value : '');
      var y = normalize(year ? year.value : '');
      var c = normalize(category ? category.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var yearOk = !y || normalize(card.getAttribute('data-year')) === y;
        var categoryOk = !c || haystack.indexOf(c) !== -1;
        var queryOk = !q || haystack.indexOf(q) !== -1;
        card.classList.toggle('is-hidden', !(yearOk && categoryOk && queryOk));
      });
    }

    [search, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
