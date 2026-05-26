import { APP_CONFIG } from '../config/appConfig.js';

export function formatUtcTimestamp(date = new Date()) {
  return `${date.toISOString().replace('T', ' ').substring(0, 19)} UTC`;
}

export function formatIst(date) {
  return date.toLocaleString('en-IN', {
    timeZone: APP_CONFIG.defaultLocation?.timezone || 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function renderKeyValueCard(label, value, className = 'telugu-card') {
  return `
    <article class="${className}">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

export function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}
