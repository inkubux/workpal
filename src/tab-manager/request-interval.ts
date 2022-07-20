export const requestInterval = (callback: () => void, delay = 150) => {
  const dateNow = Date.now;
  let start = dateNow();
  let stop = false;

  const intervalFunc = () => {
    if (!(dateNow() - start < delay)) {
      start += delay;
      callback();
    }

    if (!stop) {
      window.requestAnimationFrame(intervalFunc);
    }
  };

  window.requestAnimationFrame(intervalFunc);

  return {
    clear() {
      stop = true;
    },
  };
};
