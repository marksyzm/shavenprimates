function replaceWith (el, removeSelector, videoSelector) {
  var removeItems = el.querySelectorAll(removeSelector);
  var video = el.querySelector(videoSelector);
  removeItems.forEach(function (item) {
      item.parentNode.removeChild(item);
  });
  if (video) {
      video.style.opacity = 1;
  }
  if (video && videoSelector === 'video') {
      if (video.paused) {
          video.play();
      } else {
          video.pause();
      }
  }
}