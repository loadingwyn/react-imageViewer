import { storiesOf } from '@storybook/react';
import React from 'react';
import ImageSlides from '../src/ImageSlides';

const images = [
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'http://dingyue.nosdn.127.net/9sFTTWDQoHjxyIkU9wzm8CiDNVbq48Mwf2hyhgRghxA5O1527909480497compressflag.jpeg',
  'http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
];
storiesOf('ImageSlides', module)
  .add('ImageSlides', () => (
    <ImageSlides
      noTapClose
      images={images}
      useTouchEmulator
      isOpen
      onChange={index => console.log(index)}
      addon={(url, index) => (
        <div className="image-slides-index">
          {`${index + 1} / ${images.length}`}
        </div>
      )} />
  ));
