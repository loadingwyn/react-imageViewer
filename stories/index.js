import React from 'react';

import { storiesOf } from '@storybook/react';
import ImageViewer from '../src/ImageViewer';
import Carousel from '../src/Carousel';

const images = ['http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://s-media-cache-ak0.pinimg.com/originals/f6/92/3d/f6923d7df3af60cbca63d2e6bdded08f.jpg',
  'https://images.pexels.com/photos/50594/sea-bay-waterfront-beach-50594.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
  'http://www.bing.com/az/hprichbg/rb/SoundSuits_ZH-CN11561095548_1920x1080.jpg',
];
storiesOf('ImageViewer', module)
  .add('on PC', () => <ImageViewer images={images} index={0} />)
  .add('on mobile device', () => <ImageViewer images={images} index={0} isMobile />)
  .add('Carousel', () => <Carousel width="1000px" height="750px" images={images} />);
