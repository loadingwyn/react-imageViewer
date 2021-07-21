import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import Gallery from '../src/Gallery';

let container = null;
const images = [
  'http://dingyue.nosdn.127.net/0UDLpU6BsCNm9v9OpT0Dhn=nHKJFC6SMByz8bMWxFM=1t1531988836046compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
  'http://dingyue.nosdn.127.net/lXMRCRbP9PYbv2gMBmHGXRnjspn6pT1PM5DrIGcEZSUTu1531904526913compressflag.jpeg',
];
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('renders with or without pictures', () => {
  act(() => {
    render(<Gallery isOpen images={images} index={0} />, container);
  });
  expect(document.body.querySelectorAll('.image-slides-blackboard').length).toBe(2);
});
