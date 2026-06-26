import { HIGHLIGHT_CSS } from '../shared/constants';

let styleInjected = false;

export function ensureStyles(): void {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.id    = 'riq-styles';
  style.textContent = HIGHLIGHT_CSS;
  (document.head || document.documentElement).appendChild(style);
  styleInjected = true;
}

export function highlightElements(elements: Element[]): void {
  ensureStyles();
  clearHighlights();
  elements.forEach((el) => {
    el.classList.add('riq-highlight');
  });
}

export function markChanged(elements: Element[]): void {
  ensureStyles();
  elements.forEach((el) => {
    el.classList.add('riq-changed');
    setTimeout(() => el.classList.remove('riq-changed'), 4000);
  });
}

export function clearHighlights(): void {
  document.querySelectorAll('.riq-highlight').forEach((el) =>
    el.classList.remove('riq-highlight'),
  );
}

export function scrollToFirst(elements: Element[]): void {
  if (elements.length === 0) return;
  elements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}
