import { createDateFromInput, toDatetimeLocalValue } from '../utils/date.js';
import { renderKeyValueCard } from '../utils/formatting.js';
import {
  calculateTeluguCalendar,
  loadTeluguCalendarData
} from '../services/teluguCalendarService.js';

export function createTeluguCalendar({
  panel,
  dateInput,
  todayButton,
  titleElement,
  subtitleElement,
  tithiElement,
  tithiEndElement,
  gridElement,
  audio,
  logger
}) {
  let selectedDate = new Date();
  let calendarData = null;

  async function init() {
    calendarData = await loadTeluguCalendarData();

    dateInput?.addEventListener('change', () => {
      render(createDateFromInput(dateInput.value));
      audio?.playBeep(950, 0.06);
    });

    todayButton?.addEventListener('click', () => {
      render(new Date());
      audio?.playBeep(950, 0.06);
    });
  }

  function render(date = selectedDate) {
    if (!calendarData) {
      throw new Error('Telugu calendar data has not loaded yet.');
    }

    selectedDate = new Date(date);
    if (dateInput) dateInput.value = toDatetimeLocalValue(selectedDate);
    const calendar = calculateTeluguCalendar(selectedDate, calendarData);

    titleElement.textContent = `${calendar.masam} - ${calendar.tithiBaseName}`;
    subtitleElement.textContent = `${calendar.samvatsaram} Samvatsaram / ${calendar.locationLabel}`;
    tithiElement.textContent = calendar.tithiDisplay;
    tithiEndElement.textContent = calendar.tithiEndDisplay;

    const cards = [
      ['Masam', calendar.masam],
      ['Paksham', calendar.paksha],
      ['Tithi Number', `${calendar.tithiNumber} / 30`],
      ['Nakshatram', calendar.nakshatram],
      ['Vaaram', calendar.vaaram],
      ['Samvatsaram', calendar.samvatsaram],
      ['Moon Longitude', calendar.moonLongitude],
      ['Sun Longitude', calendar.sunLongitude]
    ];

    gridElement.innerHTML = cards
      .map(([label, value]) => renderKeyValueCard(label, value))
      .join('');

    logger?.('Telugu panchangam calendar synchronized.', 'action');
  }

  function show() {
    panel?.classList.remove('hidden');
  }

  function hide() {
    panel?.classList.add('hidden');
  }

  return { init, render, show, hide };
}
