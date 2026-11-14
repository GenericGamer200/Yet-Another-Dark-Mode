(() => {
  if (window.__yadmCanvasPatched) return;
  window.__yadmCanvasPatched = true;

  const CORRECTION = "invert(1) hue-rotate(180deg)";
  const FLAG = "data-yadm-active";

  function isImageSource(src) {
    return (
      src instanceof HTMLImageElement ||
      src instanceof SVGImageElement ||
      src instanceof HTMLVideoElement ||
      (typeof ImageBitmap !== "undefined" && src instanceof ImageBitmap) ||
      (typeof VideoFrame !== "undefined" && src instanceof VideoFrame)
    );
  }

  function patch(proto) {
    if (!proto) return;
    const original = proto.drawImage;
    proto.drawImage = function (...args) {
      const active = document.documentElement?.hasAttribute(FLAG);
      if (!active || !isImageSource(args[0])) {
        return original.apply(this, args);
      }
      const prev = this.filter;
      try {
        this.filter = prev && prev !== "none" ? `${prev} ${CORRECTION}` : CORRECTION;
        return original.apply(this, args);
      } finally {
        this.filter = prev;
      }
    };
  }

  patch(CanvasRenderingContext2D.prototype);
  if (typeof OffscreenCanvasRenderingContext2D !== "undefined") {
    patch(OffscreenCanvasRenderingContext2D.prototype);
  }
})();
