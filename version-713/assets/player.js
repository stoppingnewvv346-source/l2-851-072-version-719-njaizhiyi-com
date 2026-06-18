(function () {
  function mount(id, source) {
    var box = document.getElementById(id);

    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var layer = box.querySelector(".play-layer");
    var loaded = false;
    var hlsInstance = null;

    function applySource() {
      if (loaded || !video) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      applySource();

      if (layer) {
        layer.classList.add("is-hidden");
      }

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && layer) {
          layer.classList.remove("is-hidden");
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        loaded = false;
      });
    }
  }

  window.MoviePlayer = {
    mount: mount
  };
})();
