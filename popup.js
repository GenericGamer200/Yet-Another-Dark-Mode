const btn = document.getElementById("toggle-btn");
const statusText = document.getElementById("status");
const excludedInput = document.getElementById("excluded-input");
const saveBtn = document.getElementById("save-btn");
const resetBtn = document.getElementById("reset-btn");
const contrastSlider = document.getElementById("contrast-slider");
const contrastValLabel = document.getElementById("contrast-val");

const DEFAULT_INVERT = 0.92;

function updateUI(state) {
  btn.textContent = state.darkMode ? "Disable Dark Mode" : "Enable Dark Mode";
  btn.classList.toggle("active", state.darkMode);
  statusText.textContent = `Status: ${state.darkMode ? "ON (All Tabs)" : "OFF"}`;

  contrastSlider.value = state.invertVal ?? DEFAULT_INVERT;
  contrastValLabel.textContent = contrastSlider.value;
  excludedInput.value = (state.excludedSites || []).join("\n");
}

// Load initial state
chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (result) => {
  updateUI({
    darkMode: Boolean(result.darkMode),
    invertVal: result.invertVal ?? DEFAULT_INVERT,
    excludedSites: result.excludedSites || [],
  });
});

// Toggle main dark mode state
btn.addEventListener("click", () => {
  chrome.storage.local.get(["darkMode"], (result) => {
    const nextState = !result.darkMode;
    chrome.storage.local.set({ darkMode: nextState }, () => {
      chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (res) => updateUI(res));
    });
  });
});

// Live update contrast label as slider moves
contrastSlider.addEventListener("input", () => {
  contrastValLabel.textContent = contrastSlider.value;
  saveSettings(); // Real-time preview across tabs
});

// Save settings automatically on change
function saveSettings(callback) {
  const lines = excludedInput.value
    .split("\n")
    .map((l) => {
      let clean = l.trim().toLowerCase();
      clean = clean.replace(/^https?:\/\//, "");
      clean = clean.split("/")[0];
      clean = clean.replace(/^www\./, "");
      return clean;
    })
    .filter((l) => l.length > 0);

  const newSettings = {
    invertVal: parseFloat(contrastSlider.value),
    excludedSites: lines,
  };

  chrome.storage.local.set(newSettings, () => {
    if (callback) callback();
  });
}

saveBtn.addEventListener("click", () => {
  saveSettings(() => {
    saveBtn.textContent = "Saved!";
    setTimeout(() => {
      saveBtn.textContent = "Save Exclusions";
    }, 1500);
  });
});

// Reset ONLY the contrast value, keeping exclusions and dark mode state intact
resetBtn.addEventListener("click", () => {
  chrome.storage.local.set({ invertVal: DEFAULT_INVERT }, () => {
    chrome.storage.local.get(["darkMode", "invertVal", "excludedSites"], (res) => {
      updateUI(res);
    });
    resetBtn.textContent = "Reset!";
    setTimeout(() => {
      resetBtn.textContent = "Reset";
    }, 1500);
  });
});
