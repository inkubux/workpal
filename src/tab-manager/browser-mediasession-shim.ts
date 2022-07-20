window.addEventListener("DOMContentLoaded", () => {
  let last = navigator.mediaSession.playbackState;
  window.requestInterval(() => {
    const m = navigator.mediaSession.playbackState;
    if (m !== last) {
      last = m;
      console.log("YAYAYAYAYAYAA", navigator.mediaSession.playbackState);
    }
  }, 1000);

  window.addEventListener(
    "contextmenu",
    (e) => {
      console.log("HTML context menu", e);
    },
    false
  );
});
