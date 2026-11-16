const STYLE_ID = "yet-another-dark-mode-style";

function getDarkCSS(invertVal) {
  return `
    html {
      filter: invert(${invertVal}) hue-rotate(180deg) !important;
      background-color: #111111 !important;
    }

    /* Protect real images / media */
    img, video, picture, iframe,
    [style*="background-image"],
    svg image {
      filter: invert(1) hue-rotate(180deg) !important;
    }
  `;
}

function isExcluded(excludedList = []) {
  let currentHost = window.location.hostname.toLowerCase().replace(/^www\./, "");

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
    docEl.hasAttribute("dark") ||
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
      if (brightness < 45) return true;
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
  const wasApplied = document.documentElement.hasAttribute("data-yadm-active");

  if (shouldApply) {
    document.documentElement.setAttribute("data-yadm-active", "");
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = getDarkCSS(invertVal);
      (document.head || document.documentElement).appendChild(style);
    } else {
      existingStyle.textContent = getDarkCSS(invertVal);
    }
  } else {
    document.documentElement.removeAttribute("data-yadm-active");
    if (existingStyle) existingStyle.remove();
  }

  // Docs canvas keeps old pixels, so reload when the state flips on a live page
  if (location.hostname === "docs.google.com" && wasApplied !== shouldApply && document.readyState === "complete") {
    location.reload();
  }
}

let currentSettings = {};

function refresh() {
  applyTheme(currentSettings);
}

// Initialize
chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (result) => {
  currentSettings = result;
  applyTheme(result);

  if (result.darkMode) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", refresh);
    }
    window.addEventListener("load", refresh);
    setTimeout(refresh, 400);
  }
});

// Live updates
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (result) => {
      currentSettings = result;
      applyTheme(result);
    });
  }
});

// Re-check when the site changes its own theme attributes (YouTube, GitHub, etc.)
new MutationObserver(() => {
  if (currentSettings.darkMode) refresh();
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["dark", "data-theme", "data-color-mode", "class"],
});
