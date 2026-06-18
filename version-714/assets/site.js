(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === heroIndex);
        });
        Array.prototype.slice.call(document.querySelectorAll(".hero-text-copy")).forEach(function (copy, current) {
            copy.classList.toggle("hidden-copy", current !== heroIndex);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showHero(index);
            startHero();
        });
    });

    if (previous) {
        previous.addEventListener("click", function () {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    showHero(0);
    startHero();

    var quickSearchForm = document.querySelector(".quick-search");
    if (quickSearchForm) {
        quickSearchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = quickSearchForm.querySelector("input");
            var value = input ? input.value.trim() : "";
            var target = "./search.html";
            if (value) {
                target += "?q=" + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    }

    var filterInput = document.querySelector(".movie-filter-input");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year], [data-filter-type], [data-filter-region]"));
    var clearButton = document.querySelector(".clear-filter");
    var filterItems = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row, .compact-card"));
    var emptyState = document.querySelector(".empty-state");
    var activeFilters = {
        year: "",
        type: "",
        region: ""
    };

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(filterInput ? filterInput.value : "");
        var visibleCount = 0;

        filterItems.forEach(function (item) {
            var title = normalize(item.getAttribute("data-title"));
            var genre = normalize(item.getAttribute("data-genre"));
            var region = normalize(item.getAttribute("data-region"));
            var year = normalize(item.getAttribute("data-year"));
            var type = normalize(item.getAttribute("data-type"));
            var haystack = [title, genre, region, year, type].join(" ");
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var yearMatch = !activeFilters.year || year === activeFilters.year;
            var typeMatch = !activeFilters.type || type.indexOf(activeFilters.type) !== -1;
            var regionMatch = !activeFilters.region || region.indexOf(activeFilters.region) !== -1;
            var matched = queryMatch && yearMatch && typeMatch && regionMatch;

            item.style.display = matched ? "" : "none";
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener("input", applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var filterType = button.hasAttribute("data-filter-year") ? "year" : button.hasAttribute("data-filter-type") ? "type" : "region";
            var value = normalize(button.getAttribute("data-filter-" + filterType));
            activeFilters[filterType] = value;

            filterButtons.forEach(function (candidate) {
                if (candidate.hasAttribute("data-filter-" + filterType)) {
                    candidate.classList.toggle("is-selected", candidate === button);
                }
            });

            applyFilters();
        });
    });

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (filterInput) {
                filterInput.value = "";
            }
            activeFilters = {
                year: "",
                type: "",
                region: ""
            };
            filterButtons.forEach(function (button) {
                var value = button.getAttribute("data-filter-year") || button.getAttribute("data-filter-type") || button.getAttribute("data-filter-region") || "";
                button.classList.toggle("is-selected", value === "");
            });
            applyFilters();
        });
    }

    applyFilters();
})();

function setupMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector(".player-overlay");
    var shell = document.querySelector(".player-shell");
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }
        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                maxBufferLength: 45,
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else {
            video.src = streamUrl;
        }
    }

    function startVideo() {
        loadVideo();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startVideo);
    }

    if (shell) {
        shell.addEventListener("click", function (event) {
            if (!loaded && event.target === shell) {
                startVideo();
            }
        });
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
