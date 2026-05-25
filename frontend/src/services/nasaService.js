import { APP_CONFIG } from '../config/appConfig.js';

export function getNasaEyesEmbedUrl() {
  return APP_CONFIG.nasaEyesUrl;
}

export function reloadNasaIframe(iframe) {
  if (!iframe) return;
  iframe.src = iframe.src || getNasaEyesEmbedUrl();
}

export function ensureNasaIframeSource(iframe) {
  if (!iframe) return;
  if (iframe.src !== getNasaEyesEmbedUrl()) {
    iframe.src = getNasaEyesEmbedUrl();
  }
}
