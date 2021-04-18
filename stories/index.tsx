import { storiesOf } from '@storybook/react';
import React, { CSSProperties } from 'react';
import ImageSlides from '../src/ImageSlides';

const images = [
  'http://dingyue.nosdn.127.net/0UDLpU6BsCNm9v9OpT0Dhn=nHKJFC6SMByz8bMWxFM=1t1531988836046compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',

  'http://dingyue.nosdn.127.net/lXMRCRbP9PYbv2gMBmHGXRnjspn6pT1PM5DrIGcEZSUTu1531904526913compressflag.jpeg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
];

storiesOf('ImageSlides', module).add('ImageSlides', () => (
  <ImageSlides
    addon={(index, ops) => {
      {
        return (
          <button style={{ zIndex: 99999, position: 'absolute' }} onClick={ops.close}>
            close
          </button>
        );
      }
    }}
    tapClose={false}
    index={1}
    images={images}
    isOpen
    showPageButton
    onChange={(index: number) => console.log(index)}
  />
));
