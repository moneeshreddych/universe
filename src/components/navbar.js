import { CSS_CLASSES } from '../utils/constants.js';

export function createNavbar({
  menuButton,
  closeButton,
  drawer,
  backdrop,
  tabs,
  externalLinks,
  audio,
  logger,
  onViewChange
}) {
  function openDrawer() {
    audio?.playSweep();
    drawer?.classList.add(CSS_CLASSES.open);
    backdrop?.classList.add(CSS_CLASSES.show);
    logger?.('Handshake established with Drawer Menu Deck.', 'action');
  }

  function closeDrawer() {
    audio?.playBeep(800, 0.06);
    drawer?.classList.remove(CSS_CLASSES.open);
    backdrop?.classList.remove(CSS_CLASSES.show);
    logger?.('Handshake terminated with Drawer Menu Deck.', 'info');
  }

  function setActiveTab(viewName) {
    tabs.forEach((tab) => {
      tab.classList.toggle(CSS_CLASSES.active, tab.dataset.view === viewName);
    });
  }

  function init() {
    menuButton?.addEventListener('click', openDrawer);
    closeButton?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    tabs.forEach((tab) => {
      tab.addEventListener('click', async (event) => {
        event.preventDefault();
        audio?.playBeep(1000, 0.06);
        await onViewChange(tab.dataset.view);
        setTimeout(closeDrawer, 300);
      });
    });

    externalLinks.forEach((link) => {
      link.addEventListener('click', () => {
        audio?.playBeep(1000, 0.06);
      });
    });
  }

  return { init, closeDrawer, openDrawer, setActiveTab };
}
