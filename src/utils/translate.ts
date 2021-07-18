import ownerWindow from './ownerWindow';

export function getTranslateValue(node: HTMLElement): number {
  if (!node) return 0;
  const containerWindow = ownerWindow(node);
  const computedStyle = containerWindow.getComputedStyle(node);
  const transform =
    computedStyle.getPropertyValue('-webkit-transform') ||
    computedStyle.getPropertyValue('transform');
  let offsetX = 0;
  if (transform && transform !== 'none' && typeof transform === 'string') {
    const transformValues = transform.split('(')[1].split(')')[0].split(',');
    offsetX = parseInt(transformValues[4], 10);
  }
  return offsetX;
}

export function setTranslateValue(node: HTMLElement, offset: number) {
  if (!node) return;
  const newTranslate = `translateX(${offset}px)`;
  node.style.webkitTransform = newTranslate;
  node.style.transform = newTranslate;
}
