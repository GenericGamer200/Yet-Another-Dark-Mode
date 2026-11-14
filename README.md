# Yet Another Dark Mode

A lightweight, Manifest V3 Chrome extension that automatically detects native dark mode on websites and applies a customizable dark theme to light pages, including Google Drive, Google Docs, and Google Sheets.

## Features

- **Automatic Native Detection:** Scans page styles, color schemes, and background luminance so sites that already support dark mode (such as GitHub or YouTube) are left untouched.
- **Universal Compatibility:** Applies across all standard tabs and complex web applications like Google Docs and Sheets without inverting images, videos, or document canvases.
- **Real-Time Contrast Adjustment:** Includes a live slider (`0.80` to `0.99`) to fine-tune inversion intensity across all open tabs immediately without refreshing.
- **Domain Exclusion List:** Allows users to specify domains that should always remain in their original theme.
- **One-Click Contrast Reset:** Restores the default contrast setting (`0.92`) without disabling dark mode or clearing saved domain exclusions.
- **Local Privacy:** All preferences and excluded domains are stored locally via `chrome.storage.local` with zero external data collection.

## Installation (Developer Mode)

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** in the top-left corner and select the folder containing the extension files.
5. Pin **Yet Another Dark Mode** to your Chrome toolbar for quick access.

## Usage

- **Toggle Dark Mode:** Click the extension icon in the toolbar and press **Enable Dark Mode** to activate the filter across all non-dark tabs.
- **Adjust Contrast:** Move the **Contrast Intensity** slider to customize darkness levels in real time. Click **Reset** to return the slider to its default value (`0.92`).
- **Exclude Websites:** Enter domain names (one per line, e.g., `example.com`) into the **Excluded Domains** box and click **Save Exclusions**.

## File Structure

- `manifest.json` — Extension configuration and permissions (`Manifest V3`).
- `content.js` — Native dark mode detection and dynamic CSS injection logic.
- `popup.html` — Extension popup interface.
- `popup.js` — State management, live preview handlers, and storage synchronization.

## FAQ

Q: why not upload it to chrome store?
A: chrome store account need you to pay 5 bucks just for making dev account
