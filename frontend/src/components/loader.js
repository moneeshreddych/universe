import { CSS_CLASSES } from '../utils/constants.js';

export function createLoader(loaderElement, targetElement) {
  function show() {
    loaderElement?.classList.remove(CSS_CLASSES.hidden);
    targetElement?.classList.remove(CSS_CLASSES.loaded);
  }

  function hide() {
    loaderElement?.classList.add(CSS_CLASSES.hidden);
    targetElement?.classList.add(CSS_CLASSES.loaded);
  }

  return { show, hide };
}
