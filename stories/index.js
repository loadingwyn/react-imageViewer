import React from 'react';

import { storiesOf } from '@storybook/react';
import ImageViewer from '../src/ImageViewer';
import Carousel from '../src/Carousel';

const images = ['http://img.zcool.cn/community/0101f856cfff206ac7252ce6214470.jpg',
  'https://s-media-cache-ak0.pinimg.com/originals/f6/92/3d/f6923d7df3af60cbca63d2e6bdded08f.jpg',
  'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1503235534249&di=4c198d5a305627d12e5dae4c581c9e57&imgtype=0&src=http%3A%2F%2Fimg2.niutuku.com%2Fdesk%2Fanime%2F0529%2F0529-17277.jpg',
  'http://niutuku.com/tools/bizhi_down.php?id=635332&n=0&time=1503224132&sign=89cb03b0d536e443ecdd7d8847a8b6c8',
];
storiesOf('ImageViewer', module)
  .add('on PC', () => <ImageViewer images={images} index={0} />)
  .add('on mobile device', () => <ImageViewer images={images} index={0} isMobile />)
  .add('Carousel', () => <Carousel width="1000px" height="750px" images={images} />);
