/* eslint-disable no-param-reassign */

import ownerDocument from './ownerDocument';
import ownerWindow from './ownerWindow';

export function getScrollbarSize(doc: Document): number {
  const scrollDiv = doc.createElement('div');
  scrollDiv.style.width = '99px';
  scrollDiv.style.height = '99px';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.overflow = 'scroll';

  doc.body.appendChild(scrollDiv);
  const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  doc.body.removeChild(scrollDiv);

  return scrollbarSize;
}

export function isOverflowing(container: Element): boolean {
  const doc = ownerDocument(container);

  if (doc.body === container) {
    return ownerWindow(container).innerWidth > doc.documentElement.clientWidth;
  }

  return container.scrollHeight > container.clientHeight;
}

export function getPaddingRight(element: Element): number {
  return parseInt(ownerWindow(element).getComputedStyle(element).paddingRight, 10) || 0;
}
