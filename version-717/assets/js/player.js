(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('[data-play-button]');
    var hls = null;
    var loaded = false;

    if (!video || !button) {
      return;
    }

    function playVideo() {
      var src = video.getAttribute('data-src');

      if (!src) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }

        loaded = true;
      }

      shell.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
