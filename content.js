const STYLE_ID = "yet-another-dark-mode-style";

function getDarkCSS(invertVal) {
  return `
    html {
      filter: invert(${invertVal}) hue-rotate(180deg) !important;
      background-color: #111111 !important;
    }

    /* Re-invert media so photos, videos, and icons keep normal colors */
    img, video, picture, canvas, iframe, [style*="background-image"] {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* Fix Google Docs & Sheets canvas rendering so pages don't double-invert */
    .kix-canvas-tile-content,
    .waffle-grid-container canvas {
      filter: none !important;
    }
  `;
}

function isExcluded(excludedList = []) {
  let currentHost = window.location.hostname.toLowerCase();
  currentHost = currentHost.replace(/^www\./, "");

  return excludedList.some((domain) => {
    let cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "");
    return currentHost === cleanDomain || currentHost.endsWith("." + cleanDomain);
  });
}

function isNativeDarkMode() {
  const docEl = document.documentElement;
  const body = document.body;

  if (!docEl) return false;

  const computedHtml = window.getComputedStyle(docEl);
  const computedBody = body ? window.getComputedStyle(body) : null;

  if (computedHtml.colorScheme === "dark" || (computedBody && computedBody.colorScheme === "dark")) {
    return true;
  }

  const hasDarkAttribute =
    docEl.getAttribute("data-theme") === "dark" ||
    docEl.getAttribute("data-color-mode") === "dark" ||
    (body && body.getAttribute("data-theme") === "dark") ||
    docEl.classList.contains("dark") ||
    (body && body.classList.contains("dark"));

  if (hasDarkAttribute) return true;

  const bgColor = (computedBody && computedBody.backgroundColor) || computedHtml.backgroundColor;
  if (bgColor && bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 45) {
        return true;
      }
    }
  }

  return false;
}

function applyTheme(settings) {
  const existingStyle = document.getElementById(STYLE_ID);
  const isGlobalOn = Boolean(settings.darkMode);
  const excludedList = settings.excludedSites || [];
  const invertVal = settings.invertVal ?? 0.92;

  const shouldApply = isGlobalOn && !isNativeDarkMode() && !isExcluded(excludedList);

  if (shouldApply) {
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = getDarkCSS(invertVal);
      const target = document.head || document.documentElement;
      if (target) target.appendChild(style);
    } else {
      existingStyle.textContent = getDarkCSS(invertVal);
    }
  } else if (!shouldApply && existingStyle) {
    existingStyle.remove();
  }
}

// Initialize on load
chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (result) => {
  applyTheme(result);

  if (result.darkMode) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => applyTheme(result));
    }
    setTimeout(() => applyTheme(result), 300);
  }
});

// Listen for storage changes in real-time across all open tabs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (result) => {
      applyTheme(result);
    });
  }
});
