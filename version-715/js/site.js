(function() {
  const menuButton = document.querySelector(".js-menu-toggle");
  const mobileNav = document.querySelector(".js-mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  const searchForms = document.querySelectorAll(".js-search-form");
  searchForms.forEach(function(form) {
    form.addEventListener("submit", function(event) {
      const input = form.querySelector("input[type='search']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      if (!document.querySelector(".home-page")) {
        event.preventDefault();
        window.location.href = "./index.html?q=" + encodeURIComponent(input.value.trim());
      }
    });
  });

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener("click", function() {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  const catalog = document.querySelector(".js-catalog");
  const catalogInput = document.querySelector(".js-catalog-input");
  const catalogButton = document.querySelector(".js-catalog-button");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const emptyState = document.querySelector(".js-empty-state");
  let activeCategory = "all";

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!catalog || !cards.length) {
      return;
    }
    const term = normalize(catalogInput ? catalogInput.value : "");
    let visible = 0;
    cards.forEach(function(card) {
      const text = normalize(card.getAttribute("data-search"));
      const category = card.getAttribute("data-category") || "";
      const matchText = !term || text.indexOf(term) !== -1;
      const matchCategory = activeCategory === "all" || category === activeCategory;
      const shouldShow = matchText && matchCategory;
      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  function updateQueryFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && catalogInput) {
      catalogInput.value = q;
      applyFilters();
      const target = document.querySelector("#catalog");
      if (target) {
        setTimeout(function() {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }
  }

  if (catalogButton) {
    catalogButton.addEventListener("click", function(event) {
      event.preventDefault();
      applyFilters();
    });
  }

  if (catalogInput) {
    catalogInput.addEventListener("input", applyFilters);
  }

  chips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      chips.forEach(function(item) {
        item.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      activeCategory = chip.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });

  updateQueryFromLocation();

  const player = document.querySelector(".js-player");
  const playButton = document.querySelector(".player-start");
  const overlay = document.querySelector(".player-overlay");
  let playerReady = false;
  let hlsInstance = null;

  function prepareVideo() {
    if (!player || playerReady) {
      return;
    }
    const stream = player.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(player);
    } else {
      player.src = stream;
    }
    playerReady = true;
  }

  function startVideo() {
    prepareVideo();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (player) {
      const promise = player.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startVideo);
  }

  if (player) {
    player.addEventListener("click", function() {
      if (player.paused) {
        startVideo();
      }
    });
    player.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  window.addEventListener("pagehide", function() {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
})();
